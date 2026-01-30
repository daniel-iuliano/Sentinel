
import type { NextApiRequest, NextApiResponse } from 'next';
import { CoinExClient } from '../../../lib/coinex';

export const config = { runtime: 'nodejs' };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { apiKey, apiSecret } = req.body;
  
  try {
    const client = new CoinExClient(apiKey, apiSecret);
    const data = await client.request('GET', '/spot/balance');
    const balances = data
      .filter((b: any) => parseFloat(b.available) > 0 || parseFloat(b.frozen) > 0)
      .map((b: any) => ({
        asset: b.ccy,
        available: b.available,
        frozen: b.frozen,
        total: (parseFloat(b.available) + parseFloat(b.frozen)).toString()
      }));
    return res.status(200).json({ balances });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
