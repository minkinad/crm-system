import { parseDurationToMs } from '../common/utils/duration.util';

const REQUIRED_ENV_KEYS = [
  'PORT',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_ACCESS_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'REFRESH_COOKIE_NAME',
  'CSRF_COOKIE_NAME',
  'API_PREFIX',
  'DEFAULT_API_VERSION',
  'TENANT_HEADER'
] as const;

function readRequiredString(
  environment: Record<string, unknown>,
  key: (typeof REQUIRED_ENV_KEYS)[number]
): string {
  const value = environment[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Environment variable ${key} is required`);
  }

  return value.trim();
}

function readPositiveNumber(environment: Record<string, unknown>, key: string): number {
  const raw = environment[key];
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Environment variable ${key} must be a positive number`);
  }

  return value;
}

function readBoolean(environment: Record<string, unknown>, key: string): boolean {
  const raw = environment[key];
  if (raw === 'true') {
    return true;
  }

  if (raw === 'false') {
    return false;
  }

  throw new Error(`Environment variable ${key} must be either "true" or "false"`);
}

function assertDuration(environment: Record<string, unknown>, key: string): void {
  const raw = String(environment[key] ?? '').trim();
  const durationMs = parseDurationToMs(raw, Number.NaN);
  if (durationMs <= 0 || Number.isNaN(durationMs)) {
    throw new Error(
      `Environment variable ${key} must be a positive duration like 15m, 7d, 3600s or milliseconds`
    );
  }
}

export function validateEnv(environment: Record<string, unknown>): Record<string, unknown> {
  for (const key of REQUIRED_ENV_KEYS) {
    readRequiredString(environment, key);
  }

  const nodeEnv = String(environment.NODE_ENV ?? 'development').trim();
  const accessSecret = readRequiredString(environment, 'JWT_ACCESS_SECRET');
  const refreshSecret = readRequiredString(environment, 'JWT_REFRESH_SECRET');
  const refreshCookieSecure = readBoolean(environment, 'REFRESH_COOKIE_SECURE');

  readPositiveNumber(environment, 'PORT');
  readPositiveNumber(environment, 'POSTGRES_PORT');
  readPositiveNumber(environment, 'REDIS_PORT');
  assertDuration(environment, 'JWT_ACCESS_EXPIRES_IN');
  assertDuration(environment, 'JWT_REFRESH_EXPIRES_IN');

  if (nodeEnv === 'production') {
    if (!refreshCookieSecure) {
      throw new Error('REFRESH_COOKIE_SECURE must be true in production');
    }

    if (accessSecret.includes('replace-with-strong') || accessSecret === 'access-secret') {
      throw new Error('JWT_ACCESS_SECRET must be replaced with a strong production secret');
    }

    if (refreshSecret.includes('replace-with-strong') || refreshSecret === 'refresh-secret') {
      throw new Error('JWT_REFRESH_SECRET must be replaced with a strong production secret');
    }
  }

  return environment;
}
