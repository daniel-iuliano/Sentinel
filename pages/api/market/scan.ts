
import type { NextApiRequest, NextApiResponse } from "next";
import { scanMarkets } from "../../../lib/engine/ranker";

export const config = { runtime: "nodejs" };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ranked = await scanMarkets();
    res.status(200).json({ rankings: ranked });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Market scan failed" });
  }
}
