
import { ema } from "./ema";

export function macd(values: number[]) {
  if (values.length < 26) return null;
  const fast = ema(values, 12);
  const slow = ema(values, 26);
  if (fast === null || slow === null) return null;
  return fast - slow;
}
