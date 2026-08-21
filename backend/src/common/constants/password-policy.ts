// bcrypt only processes the first 72 bytes; reject longer input instead of truncating silently.
export const PASSWORD_MIN_BYTES = 8;
export const PASSWORD_MAX_BYTES = 72;
