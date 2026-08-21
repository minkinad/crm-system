import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CsrfMiddleware } from './csrf.middleware';

function request(path: string, cookie?: string, header?: string): Request {
  return {
    method: 'POST',
    path,
    cookies: cookie ? { crm_csrf_token: cookie } : {},
    header: jest.fn((name: string) => (name === 'x-csrf-token' ? header : undefined))
  } as unknown as Request;
}

describe('CsrfMiddleware', () => {
  const configService = {
    get: jest.fn().mockReturnValue('crm_csrf_token')
  } as unknown as ConfigService;
  const middleware = new CsrfMiddleware(configService);
  const response = {} as Response;

  it('protects refresh requests with a double-submit token', () => {
    expect(() =>
      middleware.use(request('/api/v1/auth/refresh'), response, jest.fn())
    ).toThrow(ForbiddenException);
  });

  it('accepts refresh when cookie and header tokens match', () => {
    const next = jest.fn();
    middleware.use(request('/api/v1/auth/refresh', 'nonce', 'nonce'), response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('allows login before a CSRF cookie exists', () => {
    const next = jest.fn();
    middleware.use(request('/api/v1/auth/login'), response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
