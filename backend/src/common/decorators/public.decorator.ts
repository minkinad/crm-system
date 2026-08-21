import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Public endpoints are explicit exceptions to the global deny-by-default policy.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
