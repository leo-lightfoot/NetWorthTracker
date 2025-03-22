import React, { useState, useEffect } from 'react';

type Currency = 'USD' | 'EUR' | 'INR';

interface Transaction {
  id: string;
  date: string;
  type: 'asset' | 'liability' | 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  currency: Currency;
}

type TabType = 'net-worth' | 'cash-flow';

// Exchange rates (fixed for simplicity - in real app, would use an API)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92, // 1 USD = 0.92 EUR
  INR: 83.12  // 1 USD = 83.12 INR
};

const formatCurrency = (amount: number, currency: Currency) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('net-worth');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [netWorth, setNetWorth] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id' | 'date'>>({
    type: 'asset',
    category: '',
    description: '',
    amount: 0,
    currency: 'USD'
  });

  // Convert amount to USD (base currency)
  const toUSD = (amount: number, fromCurrency: Currency) => {
    return amount / EXCHANGE_RATES[fromCurrency];
  };

  // Convert amount from USD to target currency
  const fromUSD = (amount: number, toCurrency: Currency) => {
    return amount * EXCHANGE_RATES[toCurrency];
  };

  // Load transactions from localStorage on startup
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
    
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      setTransactions(parsed);
      calculateFinancials(parsed, savedCurrency || 'USD');
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Save selected currency to localStorage
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
    calculateFinancials(transactions, selectedCurrency);
  }, [selectedCurrency]);

  const calculateFinancials = (txs: Transaction[], currency: Currency) => {
    // Convert all amounts to the selected currency for display
    const convertedTxs = txs.map(tx => ({
      ...tx,
      amount: fromUSD(toUSD(tx.amount, tx.currency), currency)
    }));

    // Calculate net worth
    const assets = convertedTxs
      .filter(tx => tx.type === 'asset')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const liabilities = convertedTxs
      .filter(tx => tx.type === 'liability')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    setNetWorth(assets - liabilities);

    // Calculate monthly income and expenses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthTransactions = convertedTxs.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const monthIncome = thisMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const monthExpenses = thisMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    setMonthlyIncome(monthIncome);
    setMonthlyExpenses(monthExpenses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10)
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    calculateFinancials(updatedTransactions, selectedCurrency);
    
    // Reset form
    setNewTransaction({
      type: activeTab === 'net-worth' ? 'asset' : 'income',
      category: '',
      description: '',
      amount: 0,
      currency: selectedCurrency
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.date,
        tx.type,
        tx.category,
        `"${tx.description}"`,
        tx.amount,
        tx.currency
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-data-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Financial Tracker</h1>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Currency:</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('net-worth');
                  setNewTransaction(prev => ({ ...prev, type: 'asset' }));
                }}
                className={`${
                  activeTab === 'net-worth'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Net Worth
              </button>
              <button
                onClick={() => {
                  setActiveTab('cash-flow');
                  setNewTransaction(prev => ({ ...prev, type: 'income' }));
                }}
                className={`${
                  activeTab === 'cash-flow'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Income & Expenses
              </button>
            </nav>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {activeTab === 'net-worth' ? (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Net Worth</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatCurrency(netWorth, selectedCurrency)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Assets</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {formatCurrency(
                      transactions
                        .filter(t => t.type === 'asset')
                        .reduce((sum, t) => sum + fromUSD(toUSD(t.amount, t.currency), selectedCurrency), 0),
                      selectedCurrency
                    )}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Liabilities</dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600">
                    {formatCurrency(
                      transactions
                        .filter(t => t.type === 'liability')
                        .reduce((sum, t) => sum + fromUSD(toUSD(t.amount, t.currency), selectedCurrency), 0),
                      selectedCurrency
                    )}
                  </dd>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {formatCurrency(monthlyIncome, selectedCurrency)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Expenses</dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600">
                    {formatCurrency(monthlyExpenses, selectedCurrency)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Net Monthly Savings</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {formatCurrency(monthlyIncome - monthlyExpenses, selectedCurrency)}
                  </dd>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add Transaction Form */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Add {activeTab === 'net-worth' ? 'Asset/Liability' : 'Income/Expense'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newTransaction.type}
                    onChange={e => setNewTransaction({...newTransaction, type: e.target.value as Transaction['type']})}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    {activeTab === 'net-worth' ? (
                      <>
                        <option value="asset">Asset</option>
                        <option value="liability">Liability</option>
                      </>
                    ) : (
                      <>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    value={newTransaction.currency}
                    onChange={e => setNewTransaction({...newTransaction, currency: e.target.value as Currency})}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={newTransaction.category}
                    onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={activeTab === 'net-worth' ? "e.g., Cash, Car, Mortgage" : "e.g., Salary, Rent, Groceries"}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add more details"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      value={newTransaction.amount}
                      onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Export to CSV
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .filter(tx => {
                      if (activeTab === 'net-worth') {
                        return tx.type === 'asset' || tx.type === 'liability';
                      } else {
                        return tx.type === 'income' || tx.type === 'expense';
                      }
                    })
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(tx => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tx.type === 'asset' || tx.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={tx.type === 'asset' || tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(tx.amount, tx.currency)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {tx.currency}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 