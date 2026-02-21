import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

// Injects request-id for distributed tracing and easier production debugging.
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
