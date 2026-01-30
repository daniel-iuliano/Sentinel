
export function ema(values: number[], period: number) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let emaVal = values.slice(0, period).reduce((a, b) => a + b) / period;
  for (let i = period; i < values.length; i++) {
    emaVal = (values[i] - emaVal) * k + emaVal;
  }
  return emaVal;
}
