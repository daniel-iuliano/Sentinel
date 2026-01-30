
import type { NextApiRequest, NextApiResponse } from 'next';
import { CoinExClient } from '../../../lib/coinex';

export const config = { runtime: 'nodejs' };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { apiKey, apiSecret } = req.body;
  if (!apiKey || !apiSecret) return res.status(400).json({ valid: false, error: 'Missing credentials' });

  try {
    const client = new CoinExClient(apiKey, apiSecret);
    const info = await client.request('GET', '/account/info');
    return res.status(200).json({ 
      valid: true, 
      username: info.user_name || info.email || 'CoinExUser' 
    });
  } catch (err: any) {
    return res.status(401).json({ valid: false, error: 'Authentication failed' });
  }
}
