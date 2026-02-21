import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';

// Intercepts mutating requests and persists immutable audit records.
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    if (request.method === 'GET') {
      return next.handle();
    }

    const startedAt = Date.now();

    return next.handle().pipe(
      tap(async (responseBody) => {
        await this.auditService.write({
          tenantId: request.user?.tenantId ?? request.tenantId,
          userId: request.user?.userId,
          action: `${request.method} ${request.path}`,
          resource: request.route?.path ?? request.path,
          metadata: {
            requestId: request.headers['x-request-id'],
            durationMs: Date.now() - startedAt,
            statusCode: request.res?.statusCode,
            responseId: responseBody?.id
          }
        });
      })
    );
  }
}
