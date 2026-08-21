import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Public()
class PublicController {
  endpoint(): void {}
}

describe('JwtAuthGuard', () => {
  it('allows only explicitly public handlers to bypass access authentication', () => {
    const guard = new JwtAuthGuard(new Reflector());
    const context = {
      getHandler: () => PublicController.prototype.endpoint,
      getClass: () => PublicController
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});
