import 'dotenv/config';
import { dataService } from './dataService';

async function testGoogleDriveIntegration() {
  try {
    // Initialize the data service with Google Drive configuration
    await dataService.initialize({
      type: 'google-drive',
      credentials: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback'
      }
    });

    // If authorization code is provided as command line argument
    const authCode = process.argv[2];
    if (authCode) {
      console.log('Handling authorization code...');
      await dataService.handleAuthCallback(authCode);
      console.log('Authorization successful!');
    }

    // Test data
    const testData = {
      transactions: [
        {
          id: '1',
          date: new Date().toISOString(),
          type: 'asset',
          category: 'Cash',
          description: 'Test Asset',
          amount: 1000,
          currency: 'EUR'
        }
      ]
    };

    console.log('Saving test data to Google Drive...');
    await dataService.saveData(testData);
    console.log('Data saved successfully!');

    console.log('Reading data from Google Drive...');
    const loadedData = await dataService.loadData();
    console.log('Loaded data:', loadedData);

  } catch (error) {
    console.error('Error during Google Drive test:', error);
  }
}

// Run the test
testGoogleDriveIntegration(); 