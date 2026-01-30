
import { getMarkets, getMarketTicker } from "../coinex/client";
import { scoreMarket } from "./scorer";
import { rsi } from "../indicators/rsi";
import { volatility as calcVolatility } from "../indicators/volatility";

export async function scanMarkets() {
  const marketList = await getMarkets();
  
  // Filter for USDT pairs to simplify scanning
  const targetMarkets = marketList
    .filter((m: string) => m.endsWith("USDT"))
    .slice(0, 15); // limit for serverless execution time

  const evaluations = await Promise.all(targetMarkets.map(async (m: string) => {
    try {
      // In production, we'd fetch K-lines here for TA. 
      // For this stateless demo, we fetch the ticker.
      const tickerData = await getMarketTicker(m);
      const ticker = tickerData.ticker;

      // Mocking historic prices for RSI calculation in a stateless environment
      // In a real bot, we'd fetch 50+ K-lines
      const mockPrices = [
        parseFloat(ticker.last) * 0.98,
        parseFloat(ticker.last) * 0.99,
        parseFloat(ticker.last) * 1.01,
        parseFloat(ticker.last)
      ];

      const currentRsi = rsi(mockPrices, 2) || 50;
      const currentVol = calcVolatility(mockPrices);
      const trend = parseFloat(ticker.last) > mockPrices[0] ? 'BULLISH' : 'BEARISH';

      const score = scoreMarket({
        rsi: currentRsi,
        volume: parseFloat(ticker.vol),
        spread: 0.001,
        volatility: currentVol,
        trend: trend as any
      });

      return {
        market: m,
        score,
        price: ticker.last,
        change24h: ((parseFloat(ticker.last) - mockPrices[0]) / mockPrices[0] * 100).toFixed(2),
        volume: ticker.vol,
        signals: {
          rsi: currentRsi,
          trend: trend as any,
          volatility: currentVol
        }
      };
    } catch (e) {
      return null;
    }
  }));

  return evaluations
    .filter(e => e !== null)
    .sort((a: any, b: any) => b.score - a.score);
}
