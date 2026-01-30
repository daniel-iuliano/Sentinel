
import { sign } from "./signer";

const BASE = "https://api.coinex.com";

/**
 * Makes a signed or unsigned request to the CoinEx API.
 */
async function call(path: string, apiKey?: string, apiSecret?: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const query = `timestamp=${timestamp}`;

  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  if (apiKey && apiSecret) {
    headers["X-COINEX-KEY"] = apiKey;
    headers["X-COINEX-SIGN"] = sign(query, apiSecret);
  }

  // CoinEx V1 API uses query parameters for the signature payload often
  const res = await fetch(`${BASE}${path}?${query}`, { headers });
  const json = await res.json();

  if (!json || json.code !== 0) {
    throw new Error(json?.message || "CoinEx API returned an error code.");
  }

  return json.data;
}

export async function validateKeys(key: string, secret: string) {
  // Use account/info to verify keys and get username
  const data = await call("/v1/account/info", key, secret);
  return data.user_name || data.email;
}

export async function getBalances(key: string, secret: string) {
  return await call("/v1/balance/info", key, secret);
}

export async function getMarkets() {
  // Public endpoint
  return await call("/v1/market/list");
}

export async function getMarketTicker(market: string) {
  const data = await call(`/v1/market/ticker?market=${market}`);
  return data;
}
