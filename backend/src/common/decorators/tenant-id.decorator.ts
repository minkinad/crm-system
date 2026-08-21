import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

type TenantRequest = {
  tenantId?: string;
};

export function readTenantId(request: TenantRequest): string {
  if (!request.tenantId) {
    throw new UnauthorizedException('Authenticated tenant context is missing');
  }

  return request.tenantId;
}

// Reads the server-owned tenant context populated by TenantAccessGuard.
export const TenantId = createParamDecorator((_data: unknown, context: ExecutionContext): string =>
  readTenantId(context.switchToHttp().getRequest<TenantRequest>())
);
