import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_SECRET is not defined. Set it in your environment variables.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        /* eslint-disable @typescript-eslint/no-unsafe-return */
        (request: Request): string | null => {
          return request?.cookies?.access_token || null;
        },
        /* eslint-enable @typescript-eslint/no-unsafe-return */
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
