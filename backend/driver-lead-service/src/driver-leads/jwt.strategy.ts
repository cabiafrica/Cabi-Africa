import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // In a production app, this secret should be loaded from a secure configuration service.
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-key-that-is-long',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // The payload is what we signed in AuthTokenService.
    // Passport will build a `user` object based on the return value of this method.
    // For this implementation, we trust the payload. A db lookup could be added here.
    // This object will be attached to the request as `req.user`.
    return { userId: payload.sub, email: payload.email };
  }
}