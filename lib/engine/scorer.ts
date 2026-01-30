
/**
 * Assigns a score to a market based on momentum, volume, and volatility.
 */
export function scoreMarket(input: {
  rsi: number | null;
  volume: number;
  spread: number;
  volatility: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}) {
  let score = 50; // Baseline

  // RSI Factors (Mean Reversion)
  if (input.rsi) {
    if (input.rsi < 30) score += 20; // Oversold
    else if (input.rsi > 70) score -= 15; // Overbought
    else if (input.rsi > 50 && input.rsi < 65) score += 5; // Healthy momentum
  }

  // Trend Factors
  if (input.trend === 'BULLISH') score += 10;
  else if (input.trend === 'BEARISH') score -= 10;

  // Volume & Risk Factors
  if (input.volume > 1000000) score += 10; // High liquidity
  if (input.spread < input.volatility) score += 5; // Good entry conditions

  return Math.min(100, Math.max(0, score));
}
