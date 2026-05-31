import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RoleEnum } from 'src/common/enums/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { EmailVerificationEntity } from './entities/email-verification.entity';
import { Request } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsuariosService))
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(PasswordResetEntity)
    private readonly passwordResetRepository: Repository<PasswordResetEntity>,
    @InjectRepository(EmailVerificationEntity)
    private readonly emailVerificationRepository: Repository<EmailVerificationEntity>,
  ) {}

  async register(dto: RegisterDto) {
    console.log('Iniciando registro para:', dto.username);
    console.log('Contraseña recibida (longitud):', dto.password?.length);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    console.log('Contraseña hasheada correctamente');

    const user = await this.usuariosService.createUser({
      username: dto.username,
      email: dto.email,
      passwordHash,
      roleName: RoleEnum.USER,
    });
    console.log('Usuario creado:', user.username);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto, request: Request) {
    const user = await this.usuariosService.validateCredentials(
      dto.email,
      dto.password,
    );
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role.name,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(
      String(user.id),
      request,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  async generateRefreshToken(userId: string, request: Request) {
    const token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: request?.ip || 'unknown',
      userAgent: request?.headers['user-agent'] || 'unknown',
    });

    await this.refreshTokenRepository.save(refreshToken);
    return refreshToken;
  }

  async refreshTokens(refreshToken: string) {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenEntity.expiresAt < new Date()) {
      await this.refreshTokenRepository.update(tokenEntity.id, {
        isRevoked: true,
        revokedAt: new Date(),
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = tokenEntity.user;
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role.name,
    };

    const newAccessToken = this.jwtService.sign(payload);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const newRefreshToken = await this.generateRefreshToken(String(user.id), {
      ip: tokenEntity.ipAddress,
      headers: { 'user-agent': tokenEntity.userAgent },
    } as any);

    await this.refreshTokenRepository.update(tokenEntity.id, {
      isRevoked: true,
      revokedAt: new Date(),
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken.token,
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (tokenEntity) {
      await this.refreshTokenRepository.update(tokenEntity.id, {
        isRevoked: true,
        revokedAt: new Date(),
      });
    }

    return { message: 'Refresh token revoked' };
  }

  async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
    return { message: 'All user tokens revoked' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usuariosService.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe
      return {
        message: 'Si el email existe, se enviará un enlace de recuperación',
      };
    }

    // Invalidar tokens anteriores
    await this.passwordResetRepository.update(
      { userId: String(user.id), isUsed: false },
      { isUsed: true, usedAt: new Date() },
    );

    // Generar nuevo token
    const token = randomBytes(32).toString('hex');
    const passwordReset = this.passwordResetRepository.create({
      userId: String(user.id),
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    });

    await this.passwordResetRepository.save(passwordReset);

    // En un entorno real, aquí se enviaría el email
    // Por ahora, devolvemos el token para desarrollo
    return {
      message: 'Token de recuperación generado',
      token, // Solo para desarrollo, en producción esto se envía por email
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token, isUsed: false },
      relations: ['user'],
    });

    if (!passwordReset) {
      throw new BadRequestException('Token inválido o expirado');
    }

    if (passwordReset.expiresAt < new Date()) {
      await this.passwordResetRepository.update(passwordReset.id, {
        isUsed: true,
        usedAt: new Date(),
      });
      throw new BadRequestException('Token expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usuariosService.updatePassword(
      String(passwordReset.user.id),
      passwordHash,
    );

    await this.passwordResetRepository.update(passwordReset.id, {
      isUsed: true,
      usedAt: new Date(),
    });

    // Revocar todos los tokens del usuario por seguridad
    await this.revokeAllUserTokens(String(passwordReset.user.id));

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async sendEmailVerification(userId: string) {
    // Invalidar tokens anteriores
    await this.emailVerificationRepository.update(
      { userId, isUsed: false },
      { isUsed: true, usedAt: new Date() },
    );

    // Generar nuevo token
    const token = randomBytes(32).toString('hex');
    const emailVerification = this.emailVerificationRepository.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    });

    await this.emailVerificationRepository.save(emailVerification);

    // En un entorno real, aquí se enviaría el email
    return {
      message: 'Token de verificación generado',
      token, // Solo para desarrollo
    };
  }

  async verifyEmail(token: string) {
    const emailVerification = await this.emailVerificationRepository.findOne({
      where: { token, isUsed: false },
      relations: ['user'],
    });

    if (!emailVerification) {
      throw new BadRequestException('Token inválido o expirado');
    }

    if (emailVerification.expiresAt < new Date()) {
      await this.emailVerificationRepository.update(emailVerification.id, {
        isUsed: true,
        usedAt: new Date(),
      });
      throw new BadRequestException('Token expirado');
    }

    await this.emailVerificationRepository.update(emailVerification.id, {
      isUsed: true,
      usedAt: new Date(),
    });

    return { message: 'Email verificado exitosamente' };
  }
}
