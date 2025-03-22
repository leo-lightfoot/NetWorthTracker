/**
 * Net Worth Tracker - Main Application Component
 * 
 * This component handles:
 * - Data management and Google Drive integration
 * - Transaction tracking (add, delete, view)
 * - Financial calculations (net worth, income, expenses)
 * - Currency conversion and formatting
 * - UI rendering with responsive design
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleAuthCallback } from './components/GoogleAuthCallback';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { TransactionForm } from './components/TransactionForm';
import { Transaction, Currency } from './types';
import { dataService } from './utils/dataService';
import { formatCurrency } from './utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

function App() {
  // State management for financial data and UI
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const [netWorth, setNetWorth] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
  const [assets, setAssets] = useState<number>(0);
  const [liabilities, setLiabilities] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  /**
   * Initialize data service when the component mounts
   * Configures the data service based on whether Google auth tokens exist
   */
  useEffect(() => {
    const initializeDataService = async () => {
      const hasGoogleTokens = localStorage.getItem('google_drive_tokens');
      
      await dataService.initialize({
        type: hasGoogleTokens ? 'google-drive' : 'local',
        credentials: hasGoogleTokens ? {
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback'
        } : undefined
      });
    };

    initializeDataService();
  }, []);

  /**
   * Load transactions data when the component mounts
   * Retrieves data from storage (local or Google Drive)
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await dataService.loadData();
        if (data && data.transactions) {
          setTransactions(data.transactions);
          calculateFinancials(data.transactions);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setStatusMessage({
          text: 'Failed to load data. Please try reconnecting to Google Drive.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Recalculate financials when currency changes or transactions are updated
   */
  useEffect(() => {
    if (transactions.length > 0) {
      calculateFinancials(transactions);
    }
  }, [selectedCurrency, transactions]);

  /**
   * Calculate financial metrics based on transactions
   * Updates state for assets, liabilities, net worth, monthly income, and expenses
   * 
   * @param transactions The array of transactions to calculate from
   */
  const calculateFinancials = (transactions: Transaction[]) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let assetTotal = 0;
    let liabilityTotal = 0;
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
      // Convert to selected currency if needed
      const amount = transaction.currency === selectedCurrency 
        ? transaction.amount 
        : convertCurrency(transaction.amount, transaction.currency, selectedCurrency);

      if (transaction.type === 'asset') {
        assetTotal += amount;
      } else if (transaction.type === 'liability') {
        liabilityTotal += amount;
      } else if (transaction.type === 'income') {
        // Check if the transaction is from the current month
        const transactionDate = new Date(transaction.date);
        if (transactionDate >= firstDayOfMonth) {
          income += amount;
        }
      } else if (transaction.type === 'expense') {
        // Check if the transaction is from the current month
        const transactionDate = new Date(transaction.date);
        if (transactionDate >= firstDayOfMonth) {
          expenses += amount;
        }
      }
    });

    setAssets(assetTotal);
    setLiabilities(liabilityTotal);
    setNetWorth(assetTotal - liabilityTotal);
    setMonthlyIncome(income);
    setMonthlyExpenses(expenses);
  };

  /**
   * Convert amount between currencies
   * 
   * @param amount The amount to convert
   * @param from Source currency
   * @param to Target currency
   * @returns The converted amount
   */
  const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
    // Simple conversion rates (you might want to use a real API for this)
    const rates: Record<Currency, Record<Currency, number>> = {
      EUR: { EUR: 1, INR: 90.0 },
      INR: { INR: 1, EUR: 0.011 }
    };

    if (from === to) return amount;
    return amount * rates[from][to];
  };

  /**
   * Handle currency selection change
   */
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Currency;
    setSelectedCurrency(newCurrency);
  };

  /**
   * Add a new transaction
   * Generates a unique ID, saves to storage, and updates UI
   * 
   * @param newTransaction The transaction data from the form
   */
  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    try {
      setIsLoading(true);
      const transaction: Transaction = {
        ...newTransaction,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        currency: selectedCurrency
      };
  
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      
      // Save to storage
      await dataService.saveData({ transactions: updatedTransactions });
      setStatusMessage({ text: 'Transaction added successfully!', type: 'success' });
      
      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error adding transaction:', error);
      setStatusMessage({ text: 'Failed to save transaction. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Delete a transaction by ID
   * Removes from storage and updates UI
   * 
   * @param transactionId The ID of the transaction to delete
   */
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      setIsLoading(true);
      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      
      // Save to storage first, to ensure it works
      await dataService.saveData({ transactions: updatedTransactions });
      
      // Then update state
      setTransactions(updatedTransactions);
      calculateFinancials(updatedTransactions);
      
      setStatusMessage({ text: 'Transaction deleted successfully!', type: 'success' });
      
      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setStatusMessage({ text: 'Failed to delete transaction. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Force a data sync with Google Drive
   * Reloads data from storage and updates the UI
   */
  const handleForceSync = async () => {
    try {
      setIsLoading(true);
      setStatusMessage({ text: 'Syncing with Google Drive...', type: 'success' });
      
      // Force reload data from Google Drive
      const data = await dataService.loadData();
      if (data && data.transactions) {
        setTransactions(data.transactions);
        calculateFinancials(data.transactions);
        setStatusMessage({ text: 'Sync completed successfully!', type: 'success' });
      }
      
      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error syncing with Google Drive:', error);
      setStatusMessage({ text: 'Failed to sync with Google Drive. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Google Auth Callback Route */}
          <Route path="/auth/callback" element={<GoogleAuthCallback />} />
          
          {/* Main Application Route */}
          <Route
            path="/"
            element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Status Message - Shows success/error notifications */}
                {statusMessage && (
                  <div className={`mb-4 p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {statusMessage.text}
                  </div>
                )}
                
                {/* Loading Overlay - Displays during async operations */}
                {isLoading && (
                  <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-md shadow-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header - App title and controls */}
                <header className="mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                      Net Worth Tracker
                    </h1>
                    <div className="flex items-center gap-3">
                      {/* Currency Selector */}
                      <select
                        value={selectedCurrency}
                        onChange={handleCurrencyChange}
                        className="block w-20 px-2 py-1 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="EUR">EUR</option>
                        <option value="INR">INR</option>
                      </select>
                      <div className="flex gap-2">
                        {/* Sync Button */}
                        <button
                          onClick={handleForceSync}
                          className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sync
                        </button>
                        {/* Google Drive Auth Button */}
                        <div className="h-9">
                          <GoogleAuthButton />
                        </div>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Net Worth Summary Card */}
                <div className="bg-white overflow-hidden shadow-lg rounded-xl mb-8">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-gray-500">Net Worth</h2>
                        <p className="mt-1 text-4xl font-bold text-gray-900">
                          {formatCurrency(netWorth, selectedCurrency)}
                        </p>
                      </div>
                      
                      <div className="mt-4 md:mt-0 grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Assets</p>
                          <p className="mt-1 text-2xl font-semibold text-green-600">
                            {formatCurrency(assets, selectedCurrency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Liabilities</p>
                          <p className="mt-1 text-2xl font-semibold text-red-600">
                            {formatCurrency(liabilities, selectedCurrency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Income Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden shadow-md rounded-xl">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-5">
                          <dt className="text-sm font-medium text-gray-500">Monthly Income</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">
                            {formatCurrency(monthlyIncome, selectedCurrency)}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Card */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 overflow-hidden shadow-md rounded-xl">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="ml-5">
                          <dt className="text-sm font-medium text-gray-500">Monthly Expenses</dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">
                            {formatCurrency(monthlyExpenses, selectedCurrency)}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Management Section */}
                <div className="bg-white shadow-md rounded-xl mb-8 overflow-hidden">
                  <Tabs defaultValue="add">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Transaction Management</h2>
                        <TabsList className="grid grid-cols-2 w-[200px]">
                          <TabsTrigger value="add">Add</TabsTrigger>
                          <TabsTrigger value="view">View</TabsTrigger>
                        </TabsList>
                      </div>
                    </div>
                  
                    {/* Add Transaction Tab */}
                    <TabsContent value="add" className="p-6">
                      <TransactionForm onSubmit={handleAddTransaction} selectedCurrency={selectedCurrency} />
                    </TabsContent>
                    
                    {/* View Transactions Tab */}
                    <TabsContent value="view">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {transactions.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                    <div className="flex flex-col items-center">
                                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <p>No transactions yet. Add your first one in the "Add" tab!</p>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                transactions
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .map(transaction => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(transaction.date).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          transaction.type === 'asset' ? 'bg-blue-100 text-blue-800' :
                                          transaction.type === 'liability' ? 'bg-yellow-100 text-yellow-800' :
                                          transaction.type === 'income' ? 'bg-green-100 text-green-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{transaction.category}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.description}</td>
                                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                        transaction.type === 'asset' || transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {formatCurrency(
                                          transaction.currency === selectedCurrency 
                                            ? transaction.amount 
                                            : convertCurrency(transaction.amount, transaction.currency, selectedCurrency),
                                          selectedCurrency
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                          onClick={() => handleDeleteTransaction(transaction.id)}
                                          className="text-red-600 hover:text-red-900 transition-colors"
                                        >
                                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center text-sm text-gray-500">
                  <p>© {new Date().getFullYear()} Net Worth Tracker • Track your finances with ease</p>
                </footer>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 