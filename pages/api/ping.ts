
import type { NextApiRequest, NextApiResponse } from "next";

export const config = { runtime: "nodejs" };

/**
 * Basic health check endpoint.
 */
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ ok: true, timestamp: Date.now() });
}
