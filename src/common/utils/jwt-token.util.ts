import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenSecret(): string {
  return process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key';
}

export function signAccessToken(
  jwtService: JwtService,
  payload: { userId: string; email: string },
): string {
  return jwtService.sign(
    { sub: payload.userId, email: payload.email },
    {
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any, 
      secret: process.env.JWT_SECRET || 'fallback-access-secret-key'
    },
  );
}


export function signRefreshToken(
  jwtService: JwtService,
  payload: { userId: string },
): string {
  return jwtService.sign(
    { sub: payload.userId },
    {
      expiresIn: '7d',
      secret: getRefreshTokenSecret(),
    },
  );
}


export function verifyRefreshToken(
  jwtService: JwtService,
  refreshToken: string,
): { sub: string } | null {
  try {
    return jwtService.verify(refreshToken, {
      secret: getRefreshTokenSecret(),
    }) as { sub: string };
  } catch {
    return null;
  }
}