
/**
 * Core Technical Analysis Indicators for Sentinel Engine
 */

export const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length === 0) return 0;
  const k = 2 / (period + 1);
  return prices.reduce((acc, val, i) => {
    if (i === 0) return val;
    return val * k + acc * (1 - k);
  }, prices[0]);
};

export const calculateMACD = (prices: number[]) => {
  if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
  
  const ema12 = calculateEMA(prices.slice(-12), 12);
  const ema26 = calculateEMA(prices.slice(-26), 26);
  const macd = ema12 - ema26;
  
  // Simplified signal: EMA of the last 9 MACD values (mocked for stateless efficiency)
  const signal = macd * 0.9; 
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
};

export const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length <= period) return 50;
  
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

export const calculateVolatility = (prices: number[]): number => {
  const n = prices.length;
  if (n < 2) return 0;
  const mean = prices.reduce((a, b) => a + b) / n;
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  return Math.sqrt(variance) / mean;
};

export const calculateVolumeDelta = (ticker: any): number => {
  // Simple check: is buy volume > sell volume (if available)
  // Fallback: Volume vs 24h Average
  const currentVolume = parseFloat(ticker.value);
  const volume24h = parseFloat(ticker.volume_24h || ticker.value);
  return currentVolume / (volume24h / 24); // Ratio of current hour vs avg hour
};
