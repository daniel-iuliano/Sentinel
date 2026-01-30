
export function volatility(values: number[]) {
  const n = values.length;
  if (n < 2) return 0;
  const mean = values.reduce((a, b) => a + b) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  return Math.sqrt(variance) / mean;
}
