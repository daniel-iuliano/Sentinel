
import type { NextApiRequest, NextApiResponse } from "next";
import { getBalances } from "../../../lib/coinex/client";

export const config = { runtime: "nodejs" };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { apiKey, apiSecret } = req.body || {};
    if (!apiKey || !apiSecret) return res.status(400).json({ error: "Missing API keys" });

    const rawBalances = await getBalances(apiKey, apiSecret);
    
    // Map CoinEx balance format to our internal structure
    const balances = Object.entries(rawBalances).map(([ccy, data]: [string, any]) => ({
      asset: ccy,
      available: data.available,
      frozen: data.frozen,
      total: (parseFloat(data.available) + parseFloat(data.frozen)).toString()
    })).filter(b => parseFloat(b.total) > 0);

    res.status(200).json({ balances });
  } catch (e: any) {
    res.status(200).json({ error: e.message || "Failed to fetch balances" });
  }
}
