import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../utils/csvUtils';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'asset' as Transaction['type'],
    category: '',
    description: '',
    amount: '',
  });
  
  const categoryOptions = {
    asset: ['Cash', 'Bank Account', 'Investment', 'Real Estate', 'Vehicle', 'Other'],
    liability: ['Credit Card', 'Loan', 'Mortgage', 'Other'],
    income: ['Salary', 'Investment', 'Side Hustle', 'Gift', 'Other'],
    expense: ['Housing', 'Transportation', 'Food', 'Utilities', 'Entertainment', 'Healthcare', 'Other'],
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === 'type' ? { category: '' } : {})
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description || !formData.amount) {
      alert('Please fill in all fields');
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    onSubmit({
      type: formData.type,
      category: formData.category,
      description: formData.description,
      amount,
    });
    
    // Reset form and navigate to dashboard
    setFormData({
      type: 'asset',
      category: '',
      description: '',
      amount: '',
    });
    
    navigate('/');
  };
  
  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <h2 className="text-2xl font-bold mb-6">Add Transaction</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="type" className="block text-gray-700 mb-2">Transaction Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 mb-2">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a category</option>
            {categoryOptions[formData.type].map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., Savings Account, Car Loan"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="amount" className="block text-gray-700 mb-2">Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm; 