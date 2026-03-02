import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemberRole, MembershipStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { PrismaService } from '../../providers/database/prisma.service';
import { CompanyService } from './company.service';

const makeMembership = (overrides: Record<string, unknown> = {}) => ({
  id: 'mem-1',
  userId: 'user-1',
  companyId: 'company-1',
  role: MemberRole.MEMBER,
  status: MembershipStatus.PENDING,
  requestedAt: new Date(),
  reviewedAt: null,
  reviewedBy: null,
  ...overrides,
});

const makeCompany = (overrides: Record<string, unknown> = {}) => ({
  id: 'company-1',
  name: 'Acme Corp',
  magicLinkSlug: 'magic-slug',
  createdAt: new Date(),
  ...overrides,
});

const txMock = {
  company: { create: vi.fn() },
  companyMembership: { create: vi.fn() },
};

const prismaMock = {
  companyMembership: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  company: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

const configMock = {
  getOrThrow: vi.fn((key: string): any => {
    if (key === 'app.slug.maxRetries') return 3;
    if (key === 'app.prisma.uniqueViolation') return 'P2002';
    throw new Error(`Config key not mocked: ${key}`);
  }),
};

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CompanyService(
      prismaMock as unknown as PrismaService,
      configMock as unknown as ConfigService,
    );
  });

  describe('create', () => {
    it('should create a company and return it', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(null);
      const company = makeCompany();
      prismaMock.$transaction.mockImplementationOnce(
        async (cb: (tx: any) => unknown) => {
          txMock.company.create.mockResolvedValueOnce(company);
          txMock.companyMembership.create.mockResolvedValueOnce(
            makeMembership(),
          );
          return cb(txMock);
        },
      );

      const result = await service.create('user-1', { name: 'Acme Corp' });

      expect(result.name).toBe('Acme Corp');
      expect(txMock.company.create).toHaveBeenCalledOnce();
      const callData = txMock.company.create.mock.calls[0][0].data;
      expect(callData.magicLinkSlug).toMatch(/^acme-corp-[a-z0-9]{6}$/);
      expect(txMock.companyMembership.create).toHaveBeenCalledOnce();
    });

    it('should throw when user already has a pending membership', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(
        makeMembership({ status: MembershipStatus.PENDING }),
      );

      try {
        await service.create('user-1', { name: 'New Co' });
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_ALREADY_ASSIGNED,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should throw when user already belongs to a company', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(
        makeMembership({ status: MembershipStatus.APPROVED }),
      );

      try {
        await service.create('user-1', { name: 'New Co' });
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_ALREADY_ASSIGNED,
        );
      }
    });
  });

  describe('join', () => {
    it('should create a PENDING membership when magic link is valid', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(null);
      prismaMock.company.findUnique.mockResolvedValueOnce(makeCompany());
      const mem = makeMembership();
      prismaMock.$transaction.mockImplementationOnce(
        async (cb: (tx: any) => unknown) => {
          txMock.companyMembership.create.mockResolvedValueOnce(mem);
          return cb(txMock);
        },
      );

      const result = await service.join('user-1', 'magic-slug');

      expect(result.status).toBe(MembershipStatus.PENDING);
      expect(result.companyName).toBe('Acme Corp');
    });

    it('should throw when magic link does not exist', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(null);
      prismaMock.company.findUnique.mockResolvedValueOnce(null);

      try {
        await service.join('user-1', 'invalid-slug');
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw when user already has a membership', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(
        makeMembership({ status: MembershipStatus.APPROVED }),
      );

      await expect(service.join('user-1', 'magic-slug')).rejects.toThrowError(
        AppException,
      );
    });
  });

  describe('findByMagicLink', () => {
    it('should return public company information', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce({
        name: 'Acme Corp',
      });

      const result = await service.findByMagicLink('magic-slug');

      expect(result.name).toBe('Acme Corp');
    });

    it('should throw when slug is invalid', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce(null);

      try {
        await service.findByMagicLink('bad-slug');
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        );
      }
    });
  });

  describe('findUserCompany', () => {
    it('should return the authenticated user company', async () => {
      const company = makeCompany();
      prismaMock.company.findUnique.mockResolvedValueOnce(company);

      const result = await service.findUserCompany('company-1');

      expect(result.id).toBe('company-1');
    });

    it('should throw when company is not found', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce(null);

      try {
        await service.findUserCompany('missing-id');
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(ExceptionCodes.COMPANY_NOT_FOUND);
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('rotateMagicLink', () => {
    it('should fetch current slug, rotate the suffix and return updated data', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce({
        magicLinkSlug: 'acme-corp-abc123',
      });
      prismaMock.company.update.mockImplementationOnce(async ({ data }) => ({
        id: 'company-1',
        magicLinkSlug: data.magicLinkSlug,
      }));

      const result = await service.rotateMagicLink('company-1');

      expect(prismaMock.company.findUnique).toHaveBeenCalledOnce();
      expect(prismaMock.company.update).toHaveBeenCalledOnce();
      expect(result.magicLinkSlug).toMatch(/^acme-corp-[a-z0-9]{6}$/);
      expect(result.magicLinkSlug).not.toBe('acme-corp-abc123');
    });

    it('should throw when company is not found', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce(null);

      try {
        await service.rotateMagicLink('missing-id');
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(ExceptionCodes.COMPANY_NOT_FOUND);
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('listMembers', () => {
    it('should return all members when no filter is provided', async () => {
      const members = [makeMembership(), makeMembership({ id: 'mem-2' })];
      prismaMock.companyMembership.findMany.mockResolvedValueOnce(members);

      const result = await service.listMembers('company-1');

      expect(result).toHaveLength(2);
      expect(prismaMock.companyMembership.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        orderBy: { requestedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should filter members by status when provided', async () => {
      prismaMock.companyMembership.findMany.mockResolvedValueOnce([]);

      await service.listMembers('company-1', MembershipStatus.PENDING);

      const callArgs = prismaMock.companyMembership.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe(MembershipStatus.PENDING);
    });
  });

  describe('reviewMembership', () => {
    it('should approve a PENDING membership', async () => {
      const pending = makeMembership({ status: MembershipStatus.PENDING });
      const approved = {
        ...pending,
        status: MembershipStatus.APPROVED,
        reviewedAt: new Date(),
      };
      prismaMock.companyMembership.findFirst.mockResolvedValueOnce(pending);
      prismaMock.companyMembership.update.mockResolvedValueOnce(approved);

      const result = await service.reviewMembership(
        'mem-1',
        'company-1',
        'reviewer-1',
        MembershipStatus.APPROVED,
      );

      expect(result.status).toBe(MembershipStatus.APPROVED);
    });

    it('should throw when membership is not found', async () => {
      prismaMock.companyMembership.findFirst.mockResolvedValueOnce(null);

      try {
        await service.reviewMembership(
          'missing',
          'company-1',
          'rev-1',
          MembershipStatus.APPROVED,
        );
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.MEMBERSHIP_NOT_FOUND,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw when membership has already been reviewed', async () => {
      prismaMock.companyMembership.findFirst.mockResolvedValueOnce(
        makeMembership({ status: MembershipStatus.APPROVED }),
      );

      try {
        await service.reviewMembership(
          'mem-1',
          'company-1',
          'rev-1',
          MembershipStatus.REJECTED,
        );
        expect.fail('should have thrown');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.MEMBERSHIP_ALREADY_REVIEWED,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });
  });
});
