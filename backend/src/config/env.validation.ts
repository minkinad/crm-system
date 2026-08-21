import { parseDurationToMs } from '../common/utils/duration.util';

const REQUIRED_ENV_KEYS = [
  'NODE_ENV',
  'PORT',
  'TRUST_PROXY_HOPS',
  'REQUEST_BODY_LIMIT',
  'ENABLE_SWAGGER',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'CORS_ORIGINS',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_ACCESS_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'JWT_ISSUER',
  'JWT_AUDIENCE',
  'REFRESH_COOKIE_NAME',
  'CSRF_COOKIE_NAME',
  'API_PREFIX',
  'DEFAULT_API_VERSION'
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

function readNonNegativeInteger(environment: Record<string, unknown>, key: string): number {
  const value = Number(environment[key]);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Environment variable ${key} must be a non-negative integer`);
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
  const swaggerEnabled = readBoolean(environment, 'ENABLE_SWAGGER');

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test or production');
  }

  const corsOrigins = readRequiredString(environment, 'CORS_ORIGINS').split(',');
  for (const origin of corsOrigins) {
    let url: URL;
    try {
      url = new URL(origin.trim());
    } catch {
      throw new Error('CORS_ORIGINS must contain valid absolute origins');
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin.trim()) {
      throw new Error('CORS_ORIGINS must contain origins without paths');
    }
  }

  readPositiveNumber(environment, 'PORT');
  readNonNegativeInteger(environment, 'TRUST_PROXY_HOPS');
  readPositiveNumber(environment, 'POSTGRES_PORT');
  readPositiveNumber(environment, 'REDIS_PORT');
  assertDuration(environment, 'JWT_ACCESS_EXPIRES_IN');
  assertDuration(environment, 'JWT_REFRESH_EXPIRES_IN');

  const requestBodyLimit = readRequiredString(environment, 'REQUEST_BODY_LIMIT');
  if (!/^\d+(?:b|kb|mb)$/i.test(requestBodyLimit)) {
    throw new Error('REQUEST_BODY_LIMIT must be a size like 100kb or 1mb');
  }

  if (nodeEnv === 'production') {
    if (!refreshCookieSecure) {
      throw new Error('REFRESH_COOKIE_SECURE must be true in production');
    }

    if (swaggerEnabled) {
      throw new Error('ENABLE_SWAGGER must be false in production');
    }

    if (corsOrigins.some((origin) => new URL(origin.trim()).protocol !== 'https:')) {
      throw new Error('CORS_ORIGINS must use HTTPS in production');
    }

    const redisPassword = String(environment.REDIS_PASSWORD ?? '');
    if (redisPassword.length < 16) {
      throw new Error('REDIS_PASSWORD must contain at least 16 characters in production');
    }

    if (readRequiredString(environment, 'POSTGRES_PASSWORD') === 'crm') {
      throw new Error('POSTGRES_PASSWORD must be replaced in production');
    }

    if (accessSecret.includes('replace-with-strong') || accessSecret === 'access-secret') {
      throw new Error('JWT_ACCESS_SECRET must be replaced with a strong production secret');
    }

    if (refreshSecret.includes('replace-with-strong') || refreshSecret === 'refresh-secret') {
      throw new Error('JWT_REFRESH_SECRET must be replaced with a strong production secret');
    }

    if (Buffer.byteLength(accessSecret, 'utf8') < 32) {
      throw new Error('JWT_ACCESS_SECRET must contain at least 32 bytes in production');
    }

    if (Buffer.byteLength(refreshSecret, 'utf8') < 32) {
      throw new Error('JWT_REFRESH_SECRET must contain at least 32 bytes in production');
    }

    if (accessSecret === refreshSecret) {
      throw new Error('JWT access and refresh secrets must be different');
    }
  }

  return environment;
}
