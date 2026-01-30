
export interface ApiCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface Balance {
  asset: string;
  available: string;
  frozen: string;
  total: string;
}

export interface MarketRanking {
  market: string;
  score: number;
  price: string;
  change24h: string;
  volume: string;
  signals: {
    rsi: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    volatility: number;
  };
}

export interface BotState {
  isActive: boolean;
  mode: 'SIMULATION' | 'LIVE';
  maxBalanceUsage: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  username: string | null;
}

export enum SignalType {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL'
}
