
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'operational',
    timestamp: Date.now(),
    version: '2.0.0-sentinel',
    uptime: process.uptime()
  });
}
