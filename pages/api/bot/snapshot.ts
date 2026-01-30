
import type { NextApiRequest, NextApiResponse } from 'next';
import { CoinExClient } from '../../../lib/coinex';
import { evaluateMarket } from '../../../lib/engine/ranking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    // 1. Get all spot tickers
    const tickers = await CoinExClient.getPublicTicker();
    
    // 2. Filter for USDT markets with decent volume
    const activeMarkets = tickers
      .filter((t: any) => t.market.endsWith('USDT') && parseFloat(t.value) > 10000)
      .sort((a: any, b: any) => parseFloat(b.value) - parseFloat(a.value))
      .slice(0, 15); // Evaluate top 15 by volume for serverless speed

    // 3. For each market, get simplified price history for indicators
    // Note: In a real prod env, we'd cache this or use a more efficient batch call.
    // For Vercel Serverless, we process a limited subset.
    const rankings = await Promise.all(activeMarkets.map(async (ticker: any) => {
      try {
        const klinesRes = await fetch(`https://api.coinex.com/v2/spot/kline?market=${ticker.market}&period=1H&limit=50`);
        const klinesData = await klinesRes.json();
        const prices = klinesData.data.map((k: any) => parseFloat(k.close));
        
        return evaluateMarket(ticker.market, prices, ticker);
      } catch (e) {
        return null;
      }
    }));

    const validRankings = rankings
      .filter((r): r is any => r !== null)
      .sort((a, b) => b.score - a.score);

    return res.status(200).json({ rankings: validRankings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
