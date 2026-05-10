import { validateEnv } from './env.validation';

function createEnvironment(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    NODE_ENV: 'development',
    PORT: '3000',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_USER: 'crm',
    POSTGRES_PASSWORD: 'crm',
    POSTGRES_DB: 'crm',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    REDIS_PASSWORD: '',
    JWT_ACCESS_SECRET: 'local-access-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_SECRET: 'local-refresh-secret',
    JWT_REFRESH_EXPIRES_IN: '7d',
    REFRESH_COOKIE_NAME: 'crm_refresh_token',
    REFRESH_COOKIE_SECURE: 'false',
    CSRF_COOKIE_NAME: 'crm_csrf_token',
    API_PREFIX: 'api',
    DEFAULT_API_VERSION: '1',
    TENANT_HEADER: 'x-tenant-id',
    ...overrides
  };
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
        createEnvironment({
          NODE_ENV: 'production',
          REFRESH_COOKIE_SECURE: 'true',
          JWT_ACCESS_SECRET: 'replace-with-strong-access-secret'
        })
      )
    ).toThrow('JWT_ACCESS_SECRET');
  });

  it('requires secure refresh cookies in production', () => {
    expect(() =>
      validateEnv(
        createEnvironment({
          NODE_ENV: 'production',
          REFRESH_COOKIE_SECURE: 'false'
        })
      )
    ).toThrow('REFRESH_COOKIE_SECURE');
  });
});
