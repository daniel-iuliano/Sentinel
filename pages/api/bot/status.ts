
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = { runtime: 'nodejs' };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'operational',
    service: 'Sentinel Engine',
    version: '2.5.0-nextjs'
  });
}
