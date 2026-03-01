import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuthTokenResponse, UserProfileResponse } from './interfaces';
import { LoginDto, RegisterDto } from './dtos';

@Injectable()
export class AuthService {
  private readonly bcryptSaltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.bcryptSaltRounds = this.config.get<number>(
      'app.bcrypt.saltRounds',
      12,
    );
  }

  async register(dto: RegisterDto): Promise<AuthTokenResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new AppException(
        ExceptionCodes.AUTH_EMAIL_TAKEN,
        'This email is already registered',
        HttpStatus.CONFLICT,
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.bcryptSaltRounds,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: { id: true, email: true },
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      companyId: null,
      role: null,
    });

    return { accessToken: token };
  }

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        membership: {
          where: { status: MembershipStatus.APPROVED },
          select: { companyId: true, role: true },
        },
      },
    });

    if (!user) {
      throw new AppException(
        ExceptionCodes.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new AppException(
        ExceptionCodes.AUTH_INVALID_CREDENTIALS,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const membership = user.membership;

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      companyId: membership?.companyId ?? null,
      role: membership?.role ?? null,
    });

    return { accessToken: token };
  }

  async me(userId: string): Promise<UserProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        membership: {
          where: { status: MembershipStatus.APPROVED },
          select: {
            companyId: true,
            role: true,
            company: { select: { name: true, magicLinkSlug: true } },
          },
        },
      },
    });

    if (!user) {
      throw new AppException(
        ExceptionCodes.AUTH_UNAUTHORIZED,
        'User not found',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const membership = user.membership;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: membership?.companyId ?? null,
      company: membership?.company ?? null,
    };
  }

  private generateToken(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }
}
