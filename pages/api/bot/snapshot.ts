
import type { NextApiRequest, NextApiResponse } from 'next';
import { CoinExClient } from '../../../lib/coinex';
import { evaluateMarket } from '../../../lib/engine/ranking';

export const config = { runtime: 'nodejs' };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const tickers = await CoinExClient.getPublicTicker();
    const activeMarkets = tickers
      .filter((t: any) => t.market.endsWith('USDT') && parseFloat(t.value) > 20000)
      .sort((a: any, b: any) => parseFloat(b.value) - parseFloat(a.value))
      .slice(0, 10);

    const rankings = await Promise.all(activeMarkets.map(async (ticker: any) => {
      try {
        const kRes = await fetch(`https://api.coinex.com/v2/spot/kline?market=${ticker.market}&period=1H&limit=50`);
        const kData = await kRes.json();
        const prices = kData.data.map((k: any) => parseFloat(k.close));
        return evaluateMarket(ticker.market, prices, ticker);
      } catch { return null; }
    }));

    return res.status(200).json({ 
      rankings: rankings.filter(r => r !== null).sort((a, b) => b.score - a.score) 
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Analysis Engine Fault' });
  }
}
