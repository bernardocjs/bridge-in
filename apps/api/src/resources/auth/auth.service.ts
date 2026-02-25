import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../providers/database/prisma.service';
import { LoginDto, RegisterDto } from './dtos';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
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

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: { id: true, email: true, name: true, companyId: true },
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
    });

    return {
      accessToken: token,
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        company: { select: { id: true, name: true, magicLinkSlug: true } },
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

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        companyId: true,
        company: { select: { id: true, name: true, magicLinkSlug: true } },
      },
    });

    if (!user) {
      throw new AppException(
        ExceptionCodes.AUTH_UNAUTHORIZED,
        'User not found',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      ...user,
      hasCompany: !!user.companyId,
    };
  }

  private generateToken(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }
}
