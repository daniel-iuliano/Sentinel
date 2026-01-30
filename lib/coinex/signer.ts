
import crypto from "crypto";

/**
 * Generates an HMAC-SHA256 signature for CoinEx API authentication.
 * @param params The query string or message to sign.
 * @param secret The API secret key.
 * @returns A hexadecimal signature string.
 */
export function sign(params: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(params).digest("hex");
}
