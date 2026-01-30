
import React, { useState } from 'react';
import { ApiCredentials } from '../types';

interface AuthFormProps {
  onAuthSuccess: (creds: ApiCredentials, username: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Logic for authentication validation via backend
      const res = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret })
      });

      const data = await res.json();
      if (data.valid) {
        onAuthSuccess({ apiKey, apiSecret }, data.username);
      } else {
        setError(data.error || 'Invalid API keys');
      }
    } catch (err) {
      setError('Connection error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="card-bg p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Sentinel Engine</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Stateless Secure CoinEx Trading Terminal</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">API Key</label>
            <input 
              type="text" 
              required
              className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-green-500 focus:outline-none"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">API Secret</label>
            <input 
              type="password" 
              required
              className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:border-green-500 focus:outline-none"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
          </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 transition-colors text-white font-semibold py-3 rounded-lg"
          >
            {loading ? 'Validating...' : 'Connect to Exchange'}
          </button>
        </form>
        <div className="mt-6 border-t border-gray-800 pt-4">
          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            Your API keys are never stored on any database. They exist only in your browser's memory and are sent over HTTPS to our serverless endpoints for execution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
