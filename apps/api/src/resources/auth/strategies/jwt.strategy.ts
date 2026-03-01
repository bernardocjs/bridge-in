import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../../providers/database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        membership: {
          where: { status: 'APPROVED' },
          select: { companyId: true, role: true },
        },
      },
    });

    if (!user) {
      return undefined;
    }

    const membership = user.membership;

    return {
      userId: user.id,
      email: user.email,
      companyId: membership?.companyId ?? null,
      role: membership?.role ?? null,
    };
  }
}
