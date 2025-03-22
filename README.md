# Net Worth Tracker

A modern web application for tracking personal finances, net worth, income, and expenses. Built with React, TypeScript, and Tailwind CSS, with Google Drive integration for cloud storage.

![Net Worth Tracker Screenshot](./screenshot.png)

## Features

- **Financial Dashboard**: View your net worth, assets, liabilities, monthly income, and expenses at a glance
- **Transaction Management**: Add and delete financial transactions with customizable categories
- **Google Drive Integration**: Store your financial data securely in your Google Drive
- **Currency Support**: Switch between currencies (EUR and INR) with automatic conversion
- **Modern UI**: Clean, responsive design with intuitive navigation
- **Data Persistence**: Choose between local storage or Google Drive for data storage

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Google Drive Integration](#google-drive-integration)
- [Customization](#customization)
- [Development](#development)
- [License](#license)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/net-worth-tracker.git
   cd net-worth-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Google API credentials:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

## Setup

### Google Drive API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials (Web application type)
5. Add `http://localhost:5173/auth/callback` as an authorized redirect URI
6. Copy the Client ID and Client Secret to your `.env` file

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Connect to Google Drive by clicking the "Connect Drive" button

4. Add your financial transactions using the form in the "Add" tab

5. View and delete transactions in the "View" tab

6. Use the currency selector to switch between EUR and INR

7. Use the "Sync" button to force refresh data from Google Drive

## Architecture

The application is built with the following technologies:

- **React**: Frontend library for building user interfaces
- **TypeScript**: Static typing for JavaScript
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Google Drive API**: Cloud storage for financial data

## Project Structure

```
net-worth-tracker/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # UI components (buttons, tabs, etc.)
│   │   ├── GoogleAuthButton.tsx    # Google Drive auth button
│   │   ├── GoogleAuthCallback.tsx  # OAuth callback handler
│   │   └── TransactionForm.tsx     # Form for adding transactions
│   ├── utils/           # Utility functions
│   │   ├── dataService.ts    # Data persistence service
│   │   └── formatters.ts     # Currency and date formatters
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   ├── index.css        # Global styles
│   └── main.tsx         # Application entry point
├── .env                 # Environment variables
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Google Drive Integration

The application uses Google Drive for data storage:

1. **Authentication**: OAuth 2.0 flow to authorize the application
2. **Data Storage**: Creates a single JSON file (`networth_data.json`) in your Google Drive
3. **Data Sync**: Automatically loads and saves data to this file
4. **Offline Mode**: Falls back to local storage when offline or not connected

### Permissions

The application requests the following permissions:

- `https://www.googleapis.com/auth/drive.file`: Access to files created or opened by the app (limited scope)

## Customization

### Adding New Currencies

To add support for additional currencies:

1. Update the `Currency` type in `src/types/index.ts`
2. Add conversion rates in the `convertCurrency` function in `App.tsx`
3. Add the new currency option in the currency selector

### Changing Categories

Transaction categories are free-form text fields. Common examples include:

- **Assets**: Cash, Investments, Real Estate, Vehicles
- **Liabilities**: Credit Card Debt, Loans, Mortgage
- **Income**: Salary, Dividends, Rental Income
- **Expenses**: Rent, Groceries, Transportation, Entertainment

## Development

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build locally

### Adding Features

Some ideas for extending the application:

- **Data Visualization**: Add charts and graphs for financial trends
- **Budget Planning**: Set budget goals and track progress
- **Receipt Scanning**: Upload and parse receipts for expenses
- **Export/Import**: Export data to CSV or Excel formats
- **Multi-Currency Dashboard**: View all transactions in their native currencies

## License

This project is licensed under the MIT License - see the LICENSE file for details. 