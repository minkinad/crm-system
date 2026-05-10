// Centralized typed configuration factory for the whole application.
export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  defaultApiVersion: process.env.DEFAULT_API_VERSION ?? '1',
  tenantHeader: process.env.TENANT_HEADER ?? 'x-tenant-id',
  postgres: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'crm',
    password: process.env.POSTGRES_PASSWORD ?? 'crm',
    database: process.env.POSTGRES_DB ?? 'crm'
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? ''
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'crm_refresh_token',
    refreshCookieSecure: process.env.REFRESH_COOKIE_SECURE === 'true',
    csrfCookieName: process.env.CSRF_COOKIE_NAME ?? 'crm_csrf_token'
  }
});
