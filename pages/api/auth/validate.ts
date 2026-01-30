
import type { NextApiRequest, NextApiResponse } from "next";
import { validateKeys } from "../../../lib/coinex/client";

export const config = { runtime: "nodejs" };

/**
 * Validates CoinEx API keys by attempting to fetch account info.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { apiKey, apiSecret } = req.body || {};

    if (!apiKey || !apiSecret) {
      return res.status(400).json({ valid: false, error: "Missing API keys" });
    }

    const username = await validateKeys(apiKey, apiSecret);

    return res.status(200).json({ valid: true, username });
  } catch (e: any) {
    return res.status(200).json({ valid: false, error: e.message || "Invalid API keys or connection error" });
  }
}
