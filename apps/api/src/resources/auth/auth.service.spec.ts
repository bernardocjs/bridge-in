import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { PrismaService } from '../../providers/database/prisma.service';
import { AuthService } from './auth.service';

const makeUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed',
  name: 'Test User',
  membership: null,
  ...overrides,
});

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const jwtMock = {
  sign: vi.fn().mockReturnValue('jwt-token'),
};

const configMock = {
  get: vi.fn().mockReturnValue(10),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      prismaMock as unknown as PrismaService,
      jwtMock as unknown as JwtService,
      configMock as unknown as ConfigService,
    );
  });

  describe('register', () => {
    it('should create user and return a token when email does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({
        id: 'user-1',
        email: 'new@example.com',
      });

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
      expect(prismaMock.user.create).toHaveBeenCalledOnce();
      expect(result).toEqual({ accessToken: 'jwt-token' });
    });

    it('should throw AppException when email is already in use', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(makeUser());

      await expect(
        service.register({
          email: 'test@example.com',
          password: '123',
          name: 'X',
        }),
      ).rejects.toThrowError(AppException);

      const call = prismaMock.user.findUnique.mock.calls[0];
      expect(call[0]).toEqual({ where: { email: 'test@example.com' } });
    });

    it('should throw AppException with AUTH_EMAIL_TAKEN code', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(makeUser());

      try {
        await service.register({
          email: 'test@example.com',
          password: '123',
          name: 'X',
        });
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(ExceptionCodes.AUTH_EMAIL_TAKEN);
        expect((e as AppException).getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should hash password before saving', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({
        id: 'u1',
        email: 'a@b.com',
      });

      await service.register({
        email: 'a@b.com',
        password: 'plain',
        name: 'A',
      });

      const createCall = prismaMock.user.create.mock.calls[0][0];
      const storedPassword: string = createCall.data.password;
      expect(storedPassword).not.toBe('plain');
      expect(await bcrypt.compare('plain', storedPassword)).toBe(true);
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const hashed = await bcrypt.hash('secret', 10);
      prismaMock.user.findUnique.mockResolvedValueOnce(
        makeUser({ password: hashed, membership: null }),
      );

      const result = await service.login({
        email: 'test@example.com',
        password: 'secret',
      });

      expect(result).toEqual({ accessToken: 'jwt-token' });
      expect(jwtMock.sign).toHaveBeenCalledOnce();
    });

    it('should throw AppException when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      try {
        await service.login({ email: 'none@example.com', password: 'x' });
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.AUTH_INVALID_CREDENTIALS,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('should throw AppException when password is incorrect', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      prismaMock.user.findUnique.mockResolvedValueOnce(
        makeUser({ password: hashed, membership: null }),
      );

      try {
        await service.login({ email: 'test@example.com', password: 'wrong' });
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.AUTH_INVALID_CREDENTIALS,
        );
      }
    });

    it('should include companyId and role in token when user has approved membership', async () => {
      const hashed = await bcrypt.hash('pass', 10);
      const membership = {
        companyId: 'company-1',
        role: 'ADMIN',
        status: MembershipStatus.APPROVED,
      };
      prismaMock.user.findUnique.mockResolvedValueOnce(
        makeUser({ password: hashed, membership }),
      );

      await service.login({ email: 'test@example.com', password: 'pass' });

      const signPayload = jwtMock.sign.mock.calls[0][0];
      expect(signPayload.companyId).toBe('company-1');
      expect(signPayload.role).toBe('ADMIN');
    });
  });

  describe('me', () => {
    it('should return authenticated user profile', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        membership: {
          companyId: 'company-1',
          role: 'MEMBER',
          company: { name: 'Acme Corp', magicLinkSlug: 'abc' },
        },
      };
      prismaMock.user.findUnique.mockResolvedValueOnce(user);

      const result = await service.me('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.companyId).toBe('company-1');
    });

    it('should throw AppException when user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      try {
        await service.me('missing-id');
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(ExceptionCodes.AUTH_UNAUTHORIZED);
        expect((e as AppException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('should return null companyId when user has no membership', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        membership: null,
      });

      const result = await service.me('user-1');

      expect(result.companyId).toBeNull();
      expect(result.company).toBeNull();
    });
  });
});
