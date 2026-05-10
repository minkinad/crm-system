const DURATION_PATTERN = /^(\d+)(ms|s|m|h|d)$/;

const MULTIPLIERS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000
};

export function parseDurationToMs(value: string, fallbackMs: number): number {
  const normalized = value.trim();
  const numericValue = Number(normalized);
  if (Number.isFinite(numericValue) && numericValue > 0) {
    return numericValue;
  }

  const match = normalized.match(DURATION_PATTERN);
  if (!match) {
    return fallbackMs;
  }

  const [, amount, unit] = match;
  return Number(amount) * MULTIPLIERS[unit];
}
