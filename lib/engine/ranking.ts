
import { calculateRSI, calculateVolatility, calculateMACD, calculateVolumeDelta } from '../indicators';
import { MarketRanking } from '../../types';

export const evaluateMarket = (
  market: string, 
  prices: number[], 
  ticker: any
): MarketRanking => {
  const rsi = calculateRSI(prices);
  const volatility = calculateVolatility(prices);
  const { histogram } = calculateMACD(prices);
  const volDelta = calculateVolumeDelta(ticker);
  
  let score = 50; // Baseline
  
  // 1. Mean Reversion (RSI)
  if (rsi < 30) score += 25;
  else if (rsi > 70) score -= 20;

  // 2. Momentum (MACD Histogram)
  if (histogram > 0) score += 15;
  else score -= 10;

  // 3. Volume Strength (Breakout confirmation)
  if (volDelta > 1.5) score += 20;

  // 4. Volatility Filtering
  if (volatility > 0.04) score -= 15; // Too risky
  
  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const trend = lastPrice > firstPrice ? 'BULLISH' : 'BEARISH';

  return {
    market,
    score: Math.max(0, Math.min(100, score)),
    price: ticker.last,
    change24h: ticker.price_change_percent,
    volume: ticker.value,
    signals: {
      rsi,
      trend,
      volatility
    }
  };
};
