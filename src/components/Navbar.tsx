import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  authenticated: boolean;
  onLogout: () => void;
  onSave: () => Promise<void>;
}

const Navbar: React.FC<NavbarProps> = ({ authenticated, onLogout, onSave }) => {
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!authenticated) {
    return null;
  }
  
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Net Worth Tracker
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded hover:bg-gray-700 ${
                location.pathname === '/' ? 'bg-gray-700' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/add" 
              className={`px-3 py-2 rounded hover:bg-gray-700 ${
                location.pathname === '/add' ? 'bg-gray-700' : ''
              }`}
            >
              Add Transaction
            </Link>
            <Link 
              to="/history" 
              className={`px-3 py-2 rounded hover:bg-gray-700 ${
                location.pathname === '/history' ? 'bg-gray-700' : ''
              }`}
            >
              History
            </Link>
            
            <button 
              onClick={handleSave} 
              className={`px-3 py-2 rounded mr-2 ${
                isSaving ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save to GitHub'}
            </button>
            
            <button 
              onClick={onLogout} 
              className="px-3 py-2 rounded bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 