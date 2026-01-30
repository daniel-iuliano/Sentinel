
import type { NextApiRequest, NextApiResponse } from 'next';
import { CoinExClient } from '../../../lib/coinex';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { apiKey, apiSecret } = req.body;
  if (!apiKey || !apiSecret) {
    return res.status(400).json({ valid: false, error: 'Missing credentials' });
  }

  try {
    const client = new CoinExClient(apiKey, apiSecret);
    const info = await client.request('GET', '/account/info');
    
    // CoinEx Account info returns user_name or email
    return res.status(200).json({ 
      valid: true, 
      username: info.user_name || info.email || 'CoinExUser' 
    });
  } catch (err: any) {
    return res.status(401).json({ valid: false, error: err.message || 'Invalid API keys' });
  }
}
