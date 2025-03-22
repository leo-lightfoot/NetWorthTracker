/**
 * GoogleAuthButton Component
 * 
 * This component provides the UI and functionality for connecting to Google Drive.
 * It handles:
 * - Initiating the OAuth flow for Google Drive integration
 * - Validating environment variables for Google API credentials
 * - Displaying loading states and error messages
 * - Redirecting to Google's authorization page
 */
import React, { useState } from 'react';
import { Button } from './ui/button';
import { dataService } from '../utils/dataService';

/**
 * Button component that allows users to connect to Google Drive
 * Initiates the OAuth 2.0 authorization flow when clicked
 */
export const GoogleAuthButton: React.FC = () => {
  // State for managing loading state and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the Google authentication process
   * Validates credentials, initializes the data service, and redirects to Google's auth page
   */
  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate environment variables
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
      const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

      // Check for proper configuration
      if (!clientId || clientId === 'your_client_id_here') {
        throw new Error('Google Client ID is not configured. Please update your .env file.');
      }

      if (!clientSecret || clientSecret === 'your_client_secret_here') {
        throw new Error('Google Client Secret is not configured. Please update your .env file.');
      }

      // Initialize data service with Google Drive configuration
      await dataService.initialize({
        type: 'google-drive',
        credentials: {
          clientId,
          clientSecret,
          redirectUri: redirectUri || 'http://localhost:5173/auth/callback'
        }
      });

      // Get authorization URL and redirect the user
      const authUrl = await dataService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Connect to Google Drive button */}
      <Button
        onClick={handleGoogleAuth}
        disabled={isLoading}
        size="sm"
        className="h-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
      >
        {/* Google Logo */}
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018c0-3.878 3.132-7.018 7-7.018c1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062c-2.31 0-4.187 1.956-4.187 4.273c0 2.315 1.877 4.277 4.187 4.277c2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474c0 4.01-2.677 6.86-6.72 6.86z"
            fill="currentColor"
          />
        </svg>
        {/* Button text changes based on loading state */}
        {isLoading ? 'Connecting...' : 'Connect Drive'}
      </Button>
      
      {/* Error message display */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <p><strong>Error:</strong> {error}</p>
          <p className="mt-1">
            Make sure you've updated the .env file with your Google OAuth credentials.
          </p>
        </div>
      )}
    </div>
  );
}; 