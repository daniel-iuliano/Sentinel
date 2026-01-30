
import React, { useEffect, useState } from 'react';
import { ApiCredentials, BotState, MarketRanking, Balance } from '../types';

interface DashboardProps {
  credentials: ApiCredentials;
  botState: BotState;
  setBotState: React.Dispatch<React.SetStateAction<BotState>>;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ credentials, botState, setBotState, onLogout }) => {
  const [rankings, setRankings] = useState<MarketRanking[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'success'}[]>([]);
  const [simPnL, setSimPnL] = useState(0);
  
  const addLog = (msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    setLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const fetchData = async () => {
    try {
      // 1. Fetch Balances
      const balanceRes = await fetch('/api/account/balances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const balanceData = await balanceRes.json();
      if (balanceData.balances) setBalances(balanceData.balances);

      // 2. Fetch Market Rankings via Scan
      const scanRes = await fetch('/api/market/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const scanData = await scanRes.json();
      if (scanData.rankings) setRankings(scanData.rankings);
      
      if (scanData.rankings?.[0]) {
        addLog(`System identifying opportunities in ${scanData.rankings[0].market}`, 'info');
      }

      // Simulation PnL logic
      if (botState.isActive) {
        setSimPnL(p => p + (Math.random() - 0.48) * 1.5);
      }
    } catch (err) {
      addLog('Synchronization delay. Checking network...', 'warn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [credentials, botState.isActive]);

  const toggleBot = async () => {
    const action = botState.isActive ? 'stop' : 'start';
    try {
      await fetch(`/api/bot/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      setBotState(s => ({ ...s, isActive: !s.isActive }));
      addLog(`Bot Engine ${action.toUpperCase()}ED`, action === 'start' ? 'success' : 'info');
    } catch (e) {
      addLog(`Failed to ${action} bot.`, 'warn');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card-bg p-4 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SENTINEL-v2</h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <span className={`w-1.5 h-1.5 rounded-full ${botState.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
               {botState.isActive ? 'RUNNING' : 'IDLE'} // {botState.username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-right">
             <p className="text-[10px] text-gray-500 uppercase font-bold">Bot PnL (Sim)</p>
             <p className={`text-sm font-mono font-bold ${simPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
               {simPnL >= 0 ? '+' : ''}{simPnL.toFixed(2)} USDT
             </p>
           </div>
           <div className="h-8 w-px bg-gray-800 mx-2"></div>
           <button 
             onClick={toggleBot}
             className={`px-8 py-2.5 rounded-lg font-black text-xs transition-all shadow-xl ${botState.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
           >
             {botState.isActive ? 'STOP BOT' : 'START BOT'}
           </button>
           <button onClick={onLogout} className="text-gray-600 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="card-bg p-5 rounded-xl border border-gray-800">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Risk Level</h3>
            <div className="space-y-4">
               <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                 <label className="text-[10px] text-gray-500 block mb-2 font-bold">STRATEGY MODE</label>
                 <div className="flex gap-1">
                   {['SIMULATION', 'LIVE'].map(m => (
                     <button 
                      key={m}
                      onClick={() => setBotState(s => ({...s, mode: m as any}))}
                      className={`flex-1 text-[10px] py-1.5 rounded font-bold border transition-all ${botState.mode === m ? 'bg-gray-700 border-green-500 text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}>
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               <div>
                 <div className="flex justify-between mb-1">
                   <label className="text-[10px] text-gray-500 font-bold">BAL USAGE</label>
                   <span className="text-[10px] text-green-400">{botState.maxBalanceUsage}%</span>
                 </div>
                 <input 
                   type="range" min="5" max="100" 
                   value={botState.maxBalanceUsage} 
                   onChange={(e) => setBotState(s => ({...s, maxBalanceUsage: parseInt(e.target.value)}))}
                   className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
               </div>
            </div>
          </div>

          <div className="card-bg p-5 rounded-xl border border-gray-800">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Assets</h3>
            <div className="space-y-3">
              {balances.length > 0 ? balances.slice(0, 6).map(b => (
                <div key={b.asset} className="flex justify-between items-end border-b border-gray-800/50 pb-2">
                   <div>
                     <p className="text-[10px] font-bold text-gray-500">{b.asset}</p>
                     <p className="text-sm font-mono">{parseFloat(b.available).toFixed(3)}</p>
                   </div>
                </div>
              )) : <p className="text-xs text-gray-600 italic">Scanning wallet...</p>}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="card-bg rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/20">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Market Scan</h3>
               <span className="text-[9px] text-gray-500 font-mono">NEXT UPDATE 8S</span>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-900 text-gray-500 text-[9px] uppercase font-black">
                   <tr>
                     <th className="px-4 py-3 border-b border-gray-800">Market</th>
                     <th className="px-4 py-3 border-b border-gray-800 text-right">Price</th>
                     <th className="px-4 py-3 border-b border-gray-800 text-right">Score</th>
                     <th className="px-4 py-3 border-b border-gray-800 text-center">Trend</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                    {loading && rankings.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-600 italic font-mono text-xs uppercase tracking-widest">Hydrating data streams...</td></tr>
                    ) : rankings.map((r, i) => (
                      <tr key={r.market} className={`group hover:bg-green-500/5 transition-colors border-b border-gray-800/30 ${i === 0 ? 'bg-green-500/5' : ''}`}>
                        <td className="px-4 py-3 font-black text-gray-300 tracking-tight">
                          {r.market.replace('USDT', '')}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                           <div className="text-white font-bold">{r.price}</div>
                           <div className={`text-[10px] ${parseFloat(r.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                             {r.change24h}%
                           </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded font-mono text-xs font-black border ${
                            r.score > 65 ? 'bg-green-900 border-green-500 text-green-400' :
                            r.score > 40 ? 'bg-blue-900 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-500'
                          }`}>
                            {r.score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                           <div className="flex justify-center">
                              <span className={`text-[10px] font-bold ${r.signals.trend === 'BULLISH' ? 'text-green-500' : 'text-red-500'}`}>
                                {r.signals.trend}
                              </span>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="card-bg rounded-xl border border-gray-800 flex flex-col h-full max-h-[600px]">
             <div className="p-4 border-b border-gray-800">
               <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Execution Logs</h3>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] leading-relaxed">
                    <span className="text-gray-600 mr-2">{log.time}</span>
                    <span className={log.type === 'success' ? 'text-green-500' : log.type === 'warn' ? 'text-red-400' : 'text-blue-300'}>
                      {log.msg}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
