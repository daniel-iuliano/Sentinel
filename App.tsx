
import React, { useState, useEffect } from 'react';
import { ApiCredentials, BotState, MarketRanking } from './types';
import Dashboard from './components/Dashboard';
import AuthForm from './components/AuthForm';

const App: React.FC = () => {
  const [credentials, setCredentials] = useState<ApiCredentials | null>(null);
  const [botState, setBotState] = useState<BotState>({
    isActive: false,
    mode: 'SIMULATION',
    maxBalanceUsage: 50,
    riskLevel: 'MEDIUM',
    username: null
  });

  const handleAuth = (creds: ApiCredentials, username: string) => {
    setCredentials(creds);
    setBotState(prev => ({ ...prev, username }));
  };

  const handleLogout = () => {
    setCredentials(null);
    setBotState(prev => ({ ...prev, username: null, isActive: false }));
  };

  return (
    <div className="min-h-screen">
      {!credentials ? (
        <AuthForm onAuthSuccess={handleAuth} />
      ) : (
        <Dashboard 
          credentials={credentials} 
          botState={botState} 
          setBotState={setBotState} 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
