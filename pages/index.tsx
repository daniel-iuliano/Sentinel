
import React, { useState } from 'react';
import { ApiCredentials, BotState } from '../types';
import Dashboard from '../components/Dashboard';
import AuthForm from '../components/AuthForm';

export default function Home() {
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
    <main className="min-h-screen">
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
    </main>
  );
}
