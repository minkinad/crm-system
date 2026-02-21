import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Role } from '../../common/constants/roles';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { USERS_REPOSITORY, UsersRepository } from '../users/repositories/users.repository.interface';
import { UserEntity } from '../users/user.entity';
import { TenantsService } from '../tenants/tenants.service';
import { AuthSessionEntity } from './auth-session.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface TokenSet {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

// Auth service handles onboarding, login, refresh rotation and logout.
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tenantsService: TenantsService,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    @InjectRepository(AuthSessionEntity)
    private readonly authSessionRepository: Repository<AuthSessionEntity>
  ) {}

  async register(dto: RegisterDto, response: Response) {
    const existingTenant = await this.tenantsService.findBySlug(dto.tenantSlug);
    if (existingTenant) {
      throw new ConflictException('Tenant slug is already taken');
    }

    const tenant = await this.tenantsService.create({
      name: dto.tenantName,
      slug: dto.tenantSlug,
      isActive: true
    });

    const createUserDto: CreateUserDto = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      role: Role.ADMIN
    };

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const admin = await this.usersRepository.create(
      tenant.id,
      createUserDto,
      passwordHash
    );

    return this.finishAuthFlow(admin, response);
  }

  async login(dto: LoginDto, response: Response) {
    const tenant = await this.tenantsService.findBySlug(dto.tenantSlug);
    if (!tenant || !tenant.isActive) {
      throw new UnauthorizedException('Tenant not found or inactive');
    }

    const user = await this.usersRepository.findByEmail(tenant.id, dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.finishAuthFlow(user, response);
  }

  async refresh(
    payload: {
      sub: string;
      tenantId: string;
      email: string;
      role: Role;
      sessionId: string;
      refreshToken: string;
    },
    response: Response
  ) {
    const session = await this.authSessionRepository
      .createQueryBuilder('session')
      .addSelect('session.refreshTokenHash')
      .where('session.id = :id', { id: payload.sessionId })
      .andWhere('session.userId = :userId', { userId: payload.sub })
      .andWhere('session.tenantId = :tenantId', { tenantId: payload.tenantId })
      .andWhere('session.revokedAt IS NULL')
      .getOne();

    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh session is invalid');
    }

    const matches = await bcrypt.compare(payload.refreshToken, session.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    const user = await this.usersRepository.findById(payload.tenantId, payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    const nextTokens = await this.issueTokens(user, session.id);

    session.refreshTokenHash = await bcrypt.hash(nextTokens.refreshToken, 12);
    await this.authSessionRepository.save(session);

    this.setRefreshCookie(response, nextTokens.refreshToken);
    const csrfToken = this.setCsrfCookie(response);

    return {
      accessToken: nextTokens.accessToken,
      accessTokenExpiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
      csrfToken,
      user: this.serializeUser(user)
    };
  }

  async logout(userId: string, tenantId: string, sessionId: string, response: Response) {
    await this.authSessionRepository.update(
      { id: sessionId, userId, tenantId },
      { revokedAt: new Date() }
    );
    this.clearRefreshCookie(response);
    this.clearCsrfCookie(response);
    return { success: true };
  }

  private async finishAuthFlow(user: UserEntity, response: Response) {
    const session = await this.authSessionRepository.save(
      this.authSessionRepository.create({
        userId: user.id,
        tenantId: user.tenantId,
        refreshTokenHash: '',
        expiresAt: this.calculateRefreshExpirationDate(),
        revokedAt: null
      })
    );

    const tokens = await this.issueTokens(user, session.id);
    session.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
    await this.authSessionRepository.save(session);
    this.setRefreshCookie(response, tokens.refreshToken);
    const csrfToken = this.setCsrfCookie(response);

    return {
      accessToken: tokens.accessToken,
      accessTokenExpiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
      csrfToken,
      user: this.serializeUser(user)
    };
  }

  private async issueTokens(user: UserEntity, sessionId: string): Promise<TokenSet> {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        sessionId
      },
      this.configService.getOrThrow<string>('jwt.accessSecret'),
      {
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m')
      }
    ) as string;

    const refreshToken = jwt.sign(
      {
        sub: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        sessionId
      },
      this.configService.getOrThrow<string>('jwt.refreshSecret'),
      {
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d')
      }
    ) as string;

    return {
      accessToken,
      refreshToken,
      sessionId
    };
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    const refreshCookieName = this.configService.get<string>('jwt.refreshCookieName', 'crm_refresh_token');
    const isSecure = this.configService.get<boolean>('jwt.refreshCookieSecure', false);

    response.cookie(refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }

  private clearRefreshCookie(response: Response): void {
    const refreshCookieName = this.configService.get<string>('jwt.refreshCookieName', 'crm_refresh_token');
    response.clearCookie(refreshCookieName, {
      path: '/'
    });
  }

  private setCsrfCookie(response: Response): string {
    const cookieName = this.configService.get<string>('jwt.csrfCookieName', 'crm_csrf_token');
    const token = randomUUID();
    response.cookie(cookieName, token, {
      httpOnly: false,
      secure: this.configService.get<boolean>('jwt.refreshCookieSecure', false),
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return token;
  }

  private clearCsrfCookie(response: Response): void {
    const cookieName = this.configService.get<string>('jwt.csrfCookieName', 'crm_csrf_token');
    response.clearCookie(cookieName, { path: '/' });
  }

  private serializeUser(user: UserEntity) {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }

  private calculateRefreshExpirationDate(): Date {
    const raw = this.configService.get<string>('jwt.refreshExpiresIn', '7d');
    const daysMatch = raw.match(/^(\d+)d$/);
    if (daysMatch) {
      const days = Number(daysMatch[1]);
      return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    const hoursMatch = raw.match(/^(\d+)h$/);
    if (hoursMatch) {
      const hours = Number(hoursMatch[1]);
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
}
