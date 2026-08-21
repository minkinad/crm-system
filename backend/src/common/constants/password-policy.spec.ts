import { validate } from 'class-validator';
import { RegisterDto } from '../../modules/auth/dto/register.dto';

function registration(password: string): RegisterDto {
  return Object.assign(new RegisterDto(), {
    tenantName: 'Acme Sales',
    tenantSlug: 'acme-sales',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password
  });
}

describe('password policy', () => {
  it('accepts a password within the bcrypt byte boundary', async () => {
    await expect(validate(registration('correct-horse-battery-staple'))).resolves.toHaveLength(0);
  });

  it('rejects input that bcrypt would silently truncate', async () => {
    const errors = await validate(registration('x'.repeat(73)));

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
