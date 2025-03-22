/**
 * GoogleAuthCallback Component
 * 
 * This component handles the OAuth callback from Google Drive.
 * It processes the authorization code, exchanges it for tokens,
 * and redirects the user back to the main application.
 * 
 * Key responsibilities:
 * - Extract authorization code from URL parameters
 * - Initialize the data service with credentials
 * - Exchange authorization code for access and refresh tokens
 * - Handle success and error states
 * - Redirect user after authentication
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../utils/dataService';

export const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the OAuth callback process on component mount
   * Extracts the code from URL, exchanges it for tokens, and navigates back to the app
   */
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract authorization code from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code found in URL');
        }

        // Initialize the data service with credentials from environment variables
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
        const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback';

        if (!clientId || !clientSecret) {
          throw new Error('Google credentials not initialized');
        }

        // Configure data service for Google Drive
        await dataService.initialize({
          type: 'google-drive',
          credentials: {
            clientId,
            clientSecret,
            redirectUri
          }
        });

        // Exchange authorization code for tokens
        await dataService.handleAuthCallback(code);
        
        // Redirect back to the application's main page
        navigate('/');
      } catch (err) {
        console.error('Error handling Google auth callback:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during authentication');
      }
    };

    handleCallback();
  }, [navigate]);

  // Error state - show error message and return home button
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded-lg">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state - show authenticating message
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded-lg">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
          <p className="mt-2 text-gray-600">Please wait while we complete the authentication process.</p>
        </div>
      </div>
    </div>
  );
}; 