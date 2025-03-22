import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Transaction } from '../utils/csvUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardProps {
  netWorth: number;
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ netWorth, transactions }) => {
  const [view, setView] = useState<'summary' | 'details'>('summary'); 
  
  // Calculate summary data
  const totalAssets = transactions
    .filter(tx => tx.type === 'asset')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
  const totalLiabilities = transactions
    .filter(tx => tx.type === 'liability')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  // Group assets and liabilities by category
  const assetsByCategory = transactions
    .filter(tx => tx.type === 'asset')
    .reduce<Record<string, number>>((acc, tx) => {
      const category = tx.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(tx.amount);
      return acc;
    }, {});
    
  const liabilitiesByCategory = transactions
    .filter(tx => tx.type === 'liability')
    .reduce<Record<string, number>>((acc, tx) => {
      const category = tx.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(tx.amount);
      return acc;
    }, {});
  
  // Chart colors
  const assetColors = [
    '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', 
    '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'
  ];
  
  const liabilityColors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'
  ];
  
  // Chart data
  const assetsPieData = {
    labels: Object.keys(assetsByCategory),
    datasets: [
      {
        data: Object.values(assetsByCategory),
        backgroundColor: assetColors.slice(0, Object.keys(assetsByCategory).length),
      },
    ],
  };
  
  const liabilitiesPieData = {
    labels: Object.keys(liabilitiesByCategory),
    datasets: [
      {
        data: Object.values(liabilitiesByCategory),
        backgroundColor: liabilityColors.slice(0, Object.keys(liabilitiesByCategory).length),
      },
    ],
  };
  
  const barData = {
    labels: ['Assets', 'Liabilities', 'Net Worth'],
    datasets: [
      {
        label: 'Amount',
        data: [totalAssets, totalLiabilities, netWorth],
        backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
      },
    ],
  };
  
  return (
    <div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No data yet. Add your first transaction to get started!</p>
            <Link to="/add" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
              Add Transaction
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap -mx-2 mb-6">
              <div className="w-full md:w-1/3 px-2 mb-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800">Net Worth</h3>
                  <p className="text-2xl font-bold">${netWorth.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2 mb-4">
                <div className="bg-green-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">Total Assets</h3>
                  <p className="text-2xl font-bold">${totalAssets.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full md:w-1/3 px-2 mb-4">
                <div className="bg-red-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800">Total Liabilities</h3>
                  <p className="text-2xl font-bold">${totalLiabilities.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <button
                  className={`mx-2 px-4 py-2 rounded ${view === 'summary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setView('summary')}
                >
                  Summary
                </button>
                <button
                  className={`mx-2 px-4 py-2 rounded ${view === 'details' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setView('details')}
                >
                  Details
                </button>
              </div>
              
              {view === 'summary' ? (
                <div className="h-80">
                  <Bar data={barData} options={{ maintainAspectRatio: false }} />
                </div>
              ) : (
                <div className="flex flex-wrap -mx-2">
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-center">Assets Breakdown</h3>
                    <div className="h-64">
                      <Pie data={assetsPieData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-center">Liabilities Breakdown</h3>
                    <div className="h-64">
                      <Pie data={liabilitiesPieData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-center">
        <Link to="/add" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-4">
          Add Transaction
        </Link>
        <Link to="/history" className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
          View History
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 