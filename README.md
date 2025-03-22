# Financial Tracker

A comprehensive financial tracking application that helps you manage your assets, liabilities, income, and expenses in multiple currencies.

## Features

- Track assets and liabilities to calculate net worth
- Monitor income and expenses with monthly summaries
- Multi-currency support (USD, EUR, INR)
- Automatic currency conversion for consolidated views
- Export data to CSV for backup or analysis
- Data persists in your browser's local storage
- Clean, modern UI with responsive design

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser

## Usage

### Currency Management
- Select your preferred display currency (USD, EUR, or INR)
- Add transactions in any supported currency
- Automatic conversion between currencies using fixed exchange rates

### Net Worth Tracking
- Add assets and liabilities
- View total assets, liabilities, and net worth
- All values automatically converted to selected currency

### Income & Expense Tracking
- Record income and expenses
- View monthly income, expenses, and savings
- Filter transactions by type

### Data Management
- All data is stored locally in your browser
- Export data to CSV format for backup or analysis
- View transaction history with sorting and filtering

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Local Storage for data persistence

## Project Structure

```
src/
├── App.tsx         # Main application component
├── index.css      # Global styles and Tailwind imports
└── main.tsx       # Application entry point
```

## Future Enhancements

- [ ] Add data backup to cloud storage
- [ ] Implement real-time currency conversion rates
- [ ] Add data visualization and charts
- [ ] Enable transaction categories customization
- [ ] Add budget tracking features 