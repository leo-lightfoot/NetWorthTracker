/**
 * DataService - A utility class to handle data persistence for the Net Worth Tracker application
 * Supports two storage modes:
 * 1. Local Storage - For quick testing and working without authentication
 * 2. Google Drive - For cloud storage and synchronization across devices
 */
import { StorageConfig } from '../types';

/**
 * Interface defining the structure of stored application data
 */
interface StoredData {
  transactions: any[]; // Collection of user transactions
}

/**
 * Interface for Google OAuth credentials required for Drive integration
 */
interface GoogleAuthCredentials {
  clientId: string;     // OAuth client ID from Google Cloud Console
  clientSecret: string; // OAuth client secret from Google Cloud Console
  redirectUri: string;  // Redirect URI for OAuth callback
}

class DataService {
  private googleCredentials: GoogleAuthCredentials | null = null;
  private googleTokens: any = null;
  private config: StorageConfig | null = null;
  private readonly FILE_NAME = 'networth_data.json'; // Name of the file in Google Drive

  /**
   * Determines which storage type to use based on available credentials and configuration
   * @returns The current storage type ('local' or 'google-drive')
   */
  private getStorageType(): 'local' | 'google-drive' {
    return this.googleTokens && this.config?.type === 'google-drive' ? 'google-drive' : 'local';
  }

  /**
   * Initializes the DataService with the provided configuration
   * @param config Configuration object containing storage type and credentials
   */
  async initialize(config: StorageConfig) {
    this.config = config;
    
    if (config.type === 'google-drive' && config.credentials) {
      this.googleCredentials = {
        clientId: config.credentials.clientId,
        clientSecret: config.credentials.clientSecret,
        redirectUri: config.credentials.redirectUri
      };

      // Check if we have stored tokens
      const tokens = localStorage.getItem('google_drive_tokens');
      if (tokens) {
        this.googleTokens = JSON.parse(tokens);
      }
    }
  }

  /**
   * Generates the Google OAuth authorization URL
   * @returns Promise resolving to the authorization URL
   */
  async getAuthUrl(): Promise<string> {
    if (!this.googleCredentials) throw new Error('Google credentials not initialized');

    const { clientId, redirectUri } = this.googleCredentials;
    const scopes = ['https://www.googleapis.com/auth/drive.file'];
    const scopeString = encodeURIComponent(scopes.join(' '));
    
    console.log('Generating auth URL with:', { clientId, redirectUri });
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopeString}&access_type=offline&prompt=consent`;
  }

  /**
   * Handles the OAuth callback by exchanging authorization code for access tokens
   * @param code Authorization code received from Google OAuth
   */
  async handleAuthCallback(code: string) {
    if (!this.googleCredentials) throw new Error('Google credentials not initialized');

    const { clientId, clientSecret, redirectUri } = this.googleCredentials;
    
    console.log('Handling auth callback with code:', code.substring(0, 5) + '...');
    console.log('Using credentials:', { clientId: clientId.substring(0, 8) + '...', redirectUri });
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token response error:', errorData);
      throw new Error(`Failed to get tokens: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokens = await tokenResponse.json();
    console.log('Received tokens:', { 
      access_token: tokens.access_token ? tokens.access_token.substring(0, 10) + '...' : 'missing',
      refresh_token: tokens.refresh_token ? 'present' : 'missing',
      expires_in: tokens.expires_in
    });
    
    this.googleTokens = tokens;
    localStorage.setItem('google_drive_tokens', JSON.stringify(tokens));
  }

  /**
   * Helper method to make authenticated Google API requests
   * @param endpoint API endpoint path
   * @param options Request options including method, headers, and body
   * @returns Promise resolving to the API response
   */
  private async makeGoogleApiRequest(endpoint: string, options: RequestInit & { query?: Record<string, string> } = {}): Promise<any> {
    if (!this.googleTokens) throw new Error('Not authenticated with Google');
    
    // Check if token is expired and refresh if needed
    if (this.googleTokens.expiry_date && Date.now() > this.googleTokens.expiry_date) {
      await this.refreshTokens();
    }
    
    const headers = {
      'Authorization': `Bearer ${this.googleTokens.access_token}`,
      ...options.headers,
    };
    
    // Handle query parameters
    const queryParams = options.query ? new URLSearchParams(options.query).toString() : '';
    const url = queryParams ? `https://www.googleapis.com/drive/v3/${endpoint}?${queryParams}` : `https://www.googleapis.com/drive/v3/${endpoint}`;
    
    // Remove query from options to avoid passing it to fetch
    const { query, ...fetchOptions } = options;
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  }
  
  /**
   * Refreshes the Google access token using the refresh token
   */
  private async refreshTokens() {
    if (!this.googleCredentials || !this.googleTokens?.refresh_token) {
      throw new Error('Cannot refresh tokens: missing credentials or refresh token');
    }
    
    const { clientId, clientSecret } = this.googleCredentials;
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: this.googleTokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
    }
    
    const newTokens = await response.json();
    
    // Preserve the refresh token if the new tokens doesn't include one
    if (!newTokens.refresh_token && this.googleTokens.refresh_token) {
      newTokens.refresh_token = this.googleTokens.refresh_token;
    }
    
    this.googleTokens = newTokens;
    localStorage.setItem('google_drive_tokens', JSON.stringify(newTokens));
  }

  /**
   * Finds existing data file in Google Drive or creates a new one if not found
   * @returns Promise resolving to the file ID or null if operation failed
   */
  private async findOrCreateFile(): Promise<string | null> {
    try {
      // Search for existing file
      const response = await this.makeGoogleApiRequest('files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        query: {
          q: `name='${this.FILE_NAME}'`,
          spaces: 'drive',
          fields: 'files(id, name)',
        },
      });

      if (response.files && response.files.length > 0) {
        return response.files[0].id;
      }

      // Create new file if it doesn't exist
      const createResponse = await this.makeGoogleApiRequest('files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.FILE_NAME,
          mimeType: 'application/json',
        }),
      });

      return createResponse.id || null;
    } catch (error) {
      console.error('Error in findOrCreateFile:', error);
      return null;
    }
  }

  /**
   * Saves data to the configured storage (local or Google Drive)
   * @param data The data to save
   * @returns Promise that resolves when save operation completes
   */
  async saveData(data: StoredData): Promise<void> {
    const storageType = this.getStorageType();
    console.log('Saving data using storage type:', storageType);

    if (storageType === 'local') {
      localStorage.setItem('financial_data', JSON.stringify(data));
      return;
    }

    // Google Drive storage
    try {
      const fileId = await this.findOrCreateFile();
      if (!fileId) throw new Error('Could not find or create file');
      
      console.log('Found file ID for saving:', fileId);

      // This is the correct way to update file content in Google Drive
      // We need to use the upload endpoint with multipart upload
      const boundary = 'boundary' + Math.random().toString().slice(2);
      
      // Create multipart body with metadata and content
      const metadata = JSON.stringify({
        name: this.FILE_NAME,
        mimeType: 'application/json'
      });
      
      const content = JSON.stringify(data);
      
      const requestBody = 
        `--${boundary}\r\n` +
        'Content-Type: application/json\r\n\r\n' +
        metadata + '\r\n' +
        `--${boundary}\r\n` +
        'Content-Type: application/json\r\n\r\n' +
        content + '\r\n' +
        `--${boundary}--`;

      // Make direct fetch request without using our helper
      const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.googleTokens.access_token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: requestBody
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update file: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      console.log('Successfully saved data to Google Drive');
    } catch (error: any) {
      console.error('Error saving to Google Drive:', error);
      // Fallback to local storage
      localStorage.setItem('financial_data', JSON.stringify(data));
      throw new Error(`Failed to save to Google Drive: ${error.message}`);
    }
  }

  /**
   * Loads data from the configured storage (local or Google Drive)
   * @returns Promise resolving to the loaded data
   */
  async loadData(): Promise<StoredData> {
    const storageType = this.getStorageType();
    let data: StoredData = { transactions: [] };

    if (storageType === 'local') {
      const stored = localStorage.getItem('financial_data');
      if (stored) {
        data = JSON.parse(stored);
      }
      return data;
    }

    // Google Drive storage
    try {
      const fileId = await this.findOrCreateFile();
      if (!fileId) {
        return data;
      }

      const response = await this.makeGoogleApiRequest(`files/${fileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        query: {
          alt: 'media',
        },
      });

      if (response) {
        data = response as StoredData;
      }
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      // Try loading from local storage as fallback
      const stored = localStorage.getItem('financial_data');
      if (stored) {
        data = JSON.parse(stored);
      }
    }

    return data;
  }
}

// Export a singleton instance of the DataService
export const dataService = new DataService(); 