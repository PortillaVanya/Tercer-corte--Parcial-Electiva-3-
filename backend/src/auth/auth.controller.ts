import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Response } from 'express';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    console.log('=== REGISTRO INICIADO ===');
    console.log('DTO completo:', dto);
    console.log('Username:', dto.username);
    console.log('Email:', dto.email);
    console.log('Password length:', dto.password?.length);
    console.log('========================');
    return this.authService.register(dto);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UsePipes(new SanitizationPipe())
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto, request);
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });
    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return {
      message: 'Login successful',
      user: result.user,
    };
  }

  @Post('refresh')
  async refreshTokens(
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refreshTokens(dto.refreshToken);
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });
    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return {
      message: 'Tokens refreshed successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('revoke')
  async revokeRefreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.revokeRefreshToken(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('revoke-all')
  async revokeAllUserTokens(@Req() request: Request) {
    const user: any = request['user'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.revokeAllUserTokens(String(user.sub));
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @UsePipes(new SanitizationPipe())
  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @UsePipes(new SanitizationPipe())
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('send-verification-email')
  async sendVerificationEmail(@Req() request: Request) {
    const user: any = request['user'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.sendEmailVerification(String(user.sub));
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @UsePipes(new SanitizationPipe())
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }
}
