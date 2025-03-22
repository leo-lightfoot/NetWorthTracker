import { useState } from 'react';

interface LoginProps {
  onLogin: (token: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a valid GitHub token');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      await onLogin(token);
    } catch (err) {
      setError('Authentication failed. Please check your token.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">Login with GitHub</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          To use this app, you need to authenticate with GitHub to store your data.
          Create a personal access token with "repo" permissions.
        </p>
        <ol className="list-decimal list-inside text-gray-600 mb-4">
          <li>Go to GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens</li>
          <li>Generate new token (select "repo" scope)</li>
          <li>Copy the token and paste it below</li>
        </ol>
      </div>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="token" className="block text-gray-700 mb-2">GitHub Personal Access Token</label>
          <input
            type="password"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="ghp_xxxxxxxxxxxx"
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit"
          className={`w-full ${
            isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
          } text-white py-2 px-4 rounded`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login; 