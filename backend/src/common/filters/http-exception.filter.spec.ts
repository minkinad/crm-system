import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('does not reflect query parameters in the error contract', () => {
    const json = jest.fn();
    const response = {
      status: jest.fn().mockReturnThis(),
      json,
      getHeader: jest.fn().mockReturnValue('request-id')
    } as unknown as Response;
    const request = {
      method: 'GET',
      url: '/contacts?q=customer@example.com',
      path: '/contacts',
      headers: {}
    } as Request;
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request
      })
    } as ArgumentsHost;

    new HttpExceptionFilter().catch(
      new HttpException('Invalid query', HttpStatus.BAD_REQUEST),
      host
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/contacts', requestId: 'request-id' })
    );
    expect(JSON.stringify(json.mock.calls)).not.toContain('customer@example.com');
  });
});
