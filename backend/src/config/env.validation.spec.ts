import { validateEnv } from './env.validation';

function createEnvironment(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    NODE_ENV: 'development',
    PORT: '3000',
    TRUST_PROXY_HOPS: '0',
    REQUEST_BODY_LIMIT: '100kb',
    ENABLE_SWAGGER: 'true',
    CORS_ORIGINS: 'http://localhost:5173',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'crm',
    POSTGRES_PASSWORD: 'crm',
    POSTGRES_DB: 'crm',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    REDIS_PASSWORD: 'local-redis-password',
    JWT_ACCESS_SECRET: 'local-access-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_SECRET: 'local-refresh-secret',
    JWT_REFRESH_EXPIRES_IN: '7d',
    JWT_ISSUER: 'crm-api',
    JWT_AUDIENCE: 'crm-web',
    REFRESH_COOKIE_NAME: 'crm_refresh_token',
    REFRESH_COOKIE_SECURE: 'false',
    CSRF_COOKIE_NAME: 'crm_csrf_token',
    API_PREFIX: 'api',
    DEFAULT_API_VERSION: '1',
    ...overrides
  };
}

function createProductionEnvironment(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return createEnvironment({
    NODE_ENV: 'production',
    REFRESH_COOKIE_SECURE: 'true',
    ENABLE_SWAGGER: 'false',
    CORS_ORIGINS: 'https://crm.example.com',
    POSTGRES_PASSWORD: 'strong-database-password',
    REDIS_PASSWORD: 'strong-redis-password',
    JWT_ACCESS_SECRET: 'a-production-access-secret-long-enough',
    JWT_REFRESH_SECRET: 'a-production-refresh-secret-long-enough',
    ...overrides
  });
}

describe('validateEnv', () => {
  it('accepts a complete development environment', () => {
    expect(validateEnv(createEnvironment())).toEqual(createEnvironment());
  });

  it('rejects invalid booleans', () => {
    expect(() =>
      validateEnv(
        createEnvironment({
          REFRESH_COOKIE_SECURE: 'sometimes'
        })
      )
    ).toThrow('REFRESH_COOKIE_SECURE');
  });

  it('rejects placeholder secrets in production', () => {
    expect(() =>
      validateEnv(
        createProductionEnvironment({
          JWT_ACCESS_SECRET: 'replace-with-strong-access-secret'
        })
      )
    ).toThrow('JWT_ACCESS_SECRET');
  });

  it('requires secure refresh cookies in production', () => {
    expect(() =>
      validateEnv(
        createProductionEnvironment({
          REFRESH_COOKIE_SECURE: 'false'
        })
      )
    ).toThrow('REFRESH_COOKIE_SECURE');
  });

  it('rejects short or reused signing secrets in production', () => {
    expect(() =>
      validateEnv(
        createProductionEnvironment({
          JWT_ACCESS_SECRET: 'short-secret',
          JWT_REFRESH_SECRET: 'another-but-still-short-secret'
        })
      )
    ).toThrow('JWT_ACCESS_SECRET');

    const sharedSecret = 'a-production-secret-that-is-long-enough';
    expect(() =>
      validateEnv(
        createProductionEnvironment({
          JWT_ACCESS_SECRET: sharedSecret,
          JWT_REFRESH_SECRET: sharedSecret
        })
      )
    ).toThrow('must be different');
  });

  it('requires production-only infrastructure protections', () => {
    expect(() =>
      validateEnv(
        createProductionEnvironment({
          ENABLE_SWAGGER: 'true',
        })
      )
    ).toThrow('ENABLE_SWAGGER');
  });
});
