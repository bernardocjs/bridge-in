import { HttpStatus } from '@nestjs/common';
import { MemberRole, MembershipStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { PrismaService } from '../../providers/database/prisma.service';
import { CompanyService } from './company.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
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

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CompanyService(prismaMock as unknown as PrismaService);
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------
  describe('create', () => {
    it('deve criar uma empresa e retorná-la', async () => {
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
      expect(txMock.companyMembership.create).toHaveBeenCalledOnce();
    });

    it('deve lançar AppException quando o usuário já tem membership (PENDING)', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(
        makeMembership({ status: MembershipStatus.PENDING }),
      );

      try {
        await service.create('user-1', { name: 'New Co' });
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_ALREADY_ASSIGNED,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });

    it('deve lançar AppException quando o usuário já pertence a uma empresa (APPROVED)', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(
        makeMembership({ status: MembershipStatus.APPROVED }),
      );

      try {
        await service.create('user-1', { name: 'New Co' });
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_ALREADY_ASSIGNED,
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // join
  // -------------------------------------------------------------------------
  describe('join', () => {
    it('deve criar membership PENDING quando o magic link é válido', async () => {
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

    it('deve lançar AppException quando o magic link não existe', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(null);
      prismaMock.company.findUnique.mockResolvedValueOnce(null);

      try {
        await service.join('user-1', 'invalid-slug');
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('deve lançar AppException quando o usuário já tem membership', async () => {
      prismaMock.companyMembership.findUnique.mockResolvedValueOnce(
        makeMembership({ status: MembershipStatus.APPROVED }),
      );

      await expect(service.join('user-1', 'magic-slug')).rejects.toThrowError(
        AppException,
      );
    });
  });

  // -------------------------------------------------------------------------
  // findByMagicLink
  // -------------------------------------------------------------------------
  describe('findByMagicLink', () => {
    it('deve retornar informações públicas da empresa', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce({
        name: 'Acme Corp',
      });

      const result = await service.findByMagicLink('magic-slug');

      expect(result.name).toBe('Acme Corp');
    });

    it('deve lançar AppException quando o slug é inválido', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce(null);

      try {
        await service.findByMagicLink('bad-slug');
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // findUserCompany
  // -------------------------------------------------------------------------
  describe('findUserCompany', () => {
    it('deve retornar a empresa do usuário autenticado', async () => {
      const company = makeCompany();
      prismaMock.company.findUnique.mockResolvedValueOnce(company);

      const result = await service.findUserCompany('company-1');

      expect(result.id).toBe('company-1');
    });

    it('deve lançar AppException quando empresa não é encontrada', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce(null);

      try {
        await service.findUserCompany('missing-id');
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(ExceptionCodes.COMPANY_NOT_FOUND);
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  // -------------------------------------------------------------------------
  // rotateMagicLink
  // -------------------------------------------------------------------------
  describe('rotateMagicLink', () => {
    it('deve atualizar o magic link slug e retornar os novos dados', async () => {
      const updated = { id: 'company-1', magicLinkSlug: 'new-uuid' };
      prismaMock.company.update.mockResolvedValueOnce(updated);

      const result = await service.rotateMagicLink('company-1');

      expect(prismaMock.company.update).toHaveBeenCalledOnce();
      expect(result.magicLinkSlug).toBe('new-uuid');
    });
  });

  // -------------------------------------------------------------------------
  // listMembers
  // -------------------------------------------------------------------------
  describe('listMembers', () => {
    it('deve retornar todos os membros quando nenhum filtro é fornecido', async () => {
      const members = [makeMembership(), makeMembership({ id: 'mem-2' })];
      prismaMock.companyMembership.findMany.mockResolvedValueOnce(members);

      const result = await service.listMembers('company-1');

      expect(result).toHaveLength(2);
      expect(prismaMock.companyMembership.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        orderBy: { requestedAt: 'desc' },
      });
    });

    it('deve filtrar membros por status quando fornecido', async () => {
      prismaMock.companyMembership.findMany.mockResolvedValueOnce([]);

      await service.listMembers('company-1', MembershipStatus.PENDING);

      const callArgs = prismaMock.companyMembership.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe(MembershipStatus.PENDING);
    });
  });

  // -------------------------------------------------------------------------
  // reviewMembership
  // -------------------------------------------------------------------------
  describe('reviewMembership', () => {
    it('deve aprovar uma membership PENDING', async () => {
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

    it('deve lançar AppException quando o membership não é encontrado', async () => {
      prismaMock.companyMembership.findFirst.mockResolvedValueOnce(null);

      try {
        await service.reviewMembership(
          'missing',
          'company-1',
          'rev-1',
          MembershipStatus.APPROVED,
        );
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.MEMBERSHIP_NOT_FOUND,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('deve lançar AppException quando o membership já foi revisado', async () => {
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
        expect.fail('deveria ter lançado exception');
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
