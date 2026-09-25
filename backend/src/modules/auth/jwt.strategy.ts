import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'rthub-super-secret-jwt-key-2026-production',
    });
  }

  async validate(payload: any) {
    const userId = payload?.sub || payload?.id;
    if (!userId) {
      throw new UnauthorizedException('Sesi telah berakhir atau token tidak valid.');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        rt: true,
        rw: true,
        kelurahan: true,
      },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Sesi telah berakhir atau akun tidak aktif.');
    }
    return user;
  }
}
