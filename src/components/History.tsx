import { useState } from 'react';
import { Transaction } from '../utils/csvUtils';

interface HistoryProps {
  transactions: Transaction[];
}

const History: React.FC<HistoryProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSortChange = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });
  
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
  });
  
  // Get transaction type badge style
  const getTypeBadgeClass = (type: string): string => {
    switch (type) {
      case 'asset':
        return 'bg-green-100 text-green-800';
      case 'liability':
        return 'bg-red-100 text-red-800';
      case 'income':
        return 'bg-blue-100 text-blue-800';
      case 'expense':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <label htmlFor="filterType" className="block text-gray-700 mb-2">Filter by Type</label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Types</option>
            <option value="asset">Assets</option>
            <option value="liability">Liabilities</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
        
        <div className="flex items-end space-x-2">
          <button
            onClick={() => handleSortChange('date')}
            className={`px-3 py-2 rounded border ${
              sortBy === 'date' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'
            }`}
          >
            Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('amount')}
            className={`px-3 py-2 rounded border ${
              sortBy === 'amount' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'
            }`}
          >
            Amount {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      
      {sortedTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No transactions found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(tx.type)}`}>
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History; 