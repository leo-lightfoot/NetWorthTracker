import React from 'react';
import { Currency } from '../types';

interface DashboardProps {
  netWorth: number;
  assets: number;
  liabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  formatCurrency: (amount: number, currency: Currency) => string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  netWorth,
  assets,
  liabilities,
  monthlyIncome,
  monthlyExpenses,
  selectedCurrency,
  onCurrencyChange,
  formatCurrency,
}) => {
  return (
    <div className="space-y-6">
      {/* Currency Selector */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Currency:</label>
          <select
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="EUR">EUR</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Net Worth</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{formatCurrency(netWorth, selectedCurrency)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-500">
                Updated in real-time
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Assets</dt>
                  <dd className="text-2xl font-semibold text-green-600">{formatCurrency(assets, selectedCurrency)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-500">
                {((assets / (assets + liabilities)) * 100).toFixed(1)}% of total
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Liabilities</dt>
                  <dd className="text-2xl font-semibold text-red-600">{formatCurrency(liabilities, selectedCurrency)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="font-medium text-red-500">
                {((liabilities / (assets + liabilities)) * 100).toFixed(1)}% of total
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
                  <dd className="text-2xl font-semibold text-green-600">{formatCurrency(monthlyIncome, selectedCurrency)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-500">
                This month
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Expenses</dt>
                  <dd className="text-2xl font-semibold text-red-600">{formatCurrency(monthlyExpenses, selectedCurrency)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-500">
                This month
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Savings</dt>
                  <dd className="text-2xl font-semibold text-indigo-600">
                    {formatCurrency(monthlyIncome - monthlyExpenses, selectedCurrency)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-500">
                {((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)}% of income
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 