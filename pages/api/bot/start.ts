
import type { NextApiRequest, NextApiResponse } from "next";

export const config = { runtime: "nodejs" };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  // In a production stateless environment, this would verify the user's intent 
  // and perhaps record the signal in an external database/event stream.
  res.status(200).json({ status: 'active', startedAt: new Date().toISOString() });
}
