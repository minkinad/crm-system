import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { Role } from '../../common/constants/roles';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthService } from './auth.service';

// Authentication endpoints with refresh token rotation.
@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @RateLimit(20, 60)
  register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.register(dto, response);
  }

  @Post('login')
  @HttpCode(200)
  @RateLimit(30, 60)
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(dto, response);
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  refresh(
    @Req() req: Request & {
      user: {
        sub: string;
        tenantId: string;
        email: string;
        role: Role;
        sessionId: string;
        refreshToken: string;
      };
    },
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.refresh(req.user, response);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.logout(user.userId, user.tenantId, user.sessionId, response);
  }
}
