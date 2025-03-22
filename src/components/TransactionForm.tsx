/**
 * TransactionForm Component
 * 
 * This component provides a form for adding new financial transactions.
 * It handles:
 * - Different transaction types (asset, liability, income, expense)
 * - Form data collection and validation
 * - Currency selection and display
 * - Form submission and reset
 */
import React, { useState, useEffect } from 'react';
import { Transaction, Currency, TransactionType } from '../types';
import { Button } from './ui/button';

/**
 * Props interface for the TransactionForm component
 */
interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  selectedCurrency: Currency;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, selectedCurrency }) => {
  /**
   * State to track the form input values
   * Excludes 'id' and 'date' as these are generated on submission
   */
  const [transaction, setTransaction] = useState<Omit<Transaction, 'id' | 'date'>>({
    type: 'asset',
    category: '',
    description: '',
    amount: 0,
    currency: selectedCurrency
  });

  /**
   * Update the transaction currency when the selected currency changes
   */
  useEffect(() => {
    setTransaction(prev => ({
      ...prev,
      currency: selectedCurrency
    }));
  }, [selectedCurrency]);

  /**
   * Handle form input changes
   * Special handling for amount field to ensure it's a number
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  /**
   * Handle form submission
   * Prevents default form behavior, submits the data, and resets the form
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(transaction);
    
    // Reset form after submission
    setTransaction({
      type: 'asset',
      category: '',
      description: '',
      amount: 0,
      currency: selectedCurrency
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Transaction Type Selector */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={transaction.type}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category Input */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={transaction.category}
            onChange={handleChange}
            placeholder="e.g., Savings, Salary, Rent"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={transaction.description}
            onChange={handleChange}
            placeholder="Brief description"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Amount Input with Currency Symbol */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">
                {selectedCurrency === 'EUR' ? '€' : '₹'}
              </span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              min="0"
              step="0.01"
              value={transaction.amount}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">{selectedCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Transaction
        </Button>
      </div>
    </form>
  );
}; 