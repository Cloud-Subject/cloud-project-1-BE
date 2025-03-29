import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategyType } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyType) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.SECRET_KEY ||
        configService.get<string>('JWT_SECRET', 'supersecret'),
    });
  }

  validate(payload: { sub: string; email: string }) {
    console.log('JWT payload:', payload);
    return { userId: payload.sub, email: payload.email };
  }
}
