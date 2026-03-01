import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReportPriority, ReportStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { PrismaService } from '../../providers/database/prisma.service';
import { ReportService } from './report.service';

const makeReport = (overrides: Record<string, unknown> = {}) => ({
  id: 'report-1',
  title: 'Test Report',
  content: 'Some content',
  status: ReportStatus.OPEN,
  priority: ReportPriority.MEDIUM,
  reporterContact: undefined,
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const prismaMock = {
  company: {
    findUnique: vi.fn(),
  },
  report: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    groupBy: vi.fn(),
  },
  $transaction: vi.fn(),
};

const configMock = {
  get: vi.fn((key: string, fallback?: number): number => {
    if (key === 'app.pagination.defaultSize') return fallback ?? 10;
    if (key === 'app.pagination.maxSize') return fallback ?? 50;
    return fallback ?? 0;
  }),
};

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ReportService(
      prismaMock as unknown as PrismaService,
      configMock as unknown as ConfigService,
    );
  });

  describe('createAnonymous', () => {
    it('deve criar um relatório anônimo com sucesso', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce({ id: 'company-1' });
      const report = makeReport();
      prismaMock.report.create.mockResolvedValueOnce(report);

      const result = await service.createAnonymous('magic-slug', {
        title: 'Test Report',
        content: 'Some content',
      });

      expect(result.id).toBe('report-1');
      expect(prismaMock.company.findUnique).toHaveBeenCalledWith({
        where: { magicLinkSlug: 'magic-slug' },
        select: { id: true },
      });
      expect(prismaMock.report.create).toHaveBeenCalledOnce();
    });

    it('deve lançar AppException quando o magic link é inválido', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce(null);

      try {
        await service.createAnonymous('bad-slug', {
          title: 'T',
          content: 'C',
        });
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(
          ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        );
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('deve salvar o contato do denunciante quando fornecido', async () => {
      prismaMock.company.findUnique.mockResolvedValueOnce({ id: 'company-1' });
      prismaMock.report.create.mockResolvedValueOnce(makeReport());

      await service.createAnonymous('magic-slug', {
        title: 'T',
        content: 'C',
        reporterContact: 'anon@mail.com',
      });

      const createArgs = prismaMock.report.create.mock.calls[0][0].data;
      expect(createArgs.reporterContact).toBe('anon@mail.com');
    });
  });

  describe('findAllByCompany', () => {
    it('deve retornar relatórios paginados', async () => {
      const reports = [makeReport(), makeReport({ id: 'report-2' })];
      prismaMock.$transaction.mockResolvedValueOnce([reports, 2]);

      const result = await service.findAllByCompany('company-1', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('deve aplicar filtro de status quando fornecido', async () => {
      prismaMock.$transaction.mockResolvedValueOnce([[], 0]);

      await service.findAllByCompany('company-1', {
        page: 1,
        limit: 10,
        status: ReportStatus.OPEN,
      });

      const txCall = prismaMock.$transaction.mock.calls[0][0];
      expect(Array.isArray(txCall)).toBe(true);
    });

    it('deve usar valores padrão de paginação', async () => {
      prismaMock.$transaction.mockResolvedValueOnce([[], 0]);

      const result = await service.findAllByCompany('company-1', {});

      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('deve retornar um relatório pelo id', async () => {
      prismaMock.report.findUnique.mockResolvedValueOnce(makeReport());

      const result = await service.findOne('report-1', 'company-1');

      expect(result.id).toBe('report-1');
      expect(prismaMock.report.findUnique).toHaveBeenCalledWith({
        where: { id: 'report-1', companyId: 'company-1' },
      });
    });

    it('deve lançar AppException quando o relatório não é encontrado', async () => {
      prismaMock.report.findUnique.mockResolvedValueOnce(null);

      try {
        await service.findOne('missing', 'company-1');
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(ExceptionCodes.REPORT_NOT_FOUND);
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('update', () => {
    it('deve atualizar o status do relatório', async () => {
      prismaMock.report.findFirst.mockResolvedValueOnce(makeReport());
      const updated = makeReport({ status: ReportStatus.IN_PROGRESS });
      prismaMock.report.update.mockResolvedValueOnce(updated);

      const result = await service.update('report-1', 'company-1', {
        status: ReportStatus.IN_PROGRESS,
      });

      expect(result.status).toBe(ReportStatus.IN_PROGRESS);
      expect(prismaMock.report.update).toHaveBeenCalledOnce();
    });

    it('deve atualizar a prioridade do relatório', async () => {
      prismaMock.report.findFirst.mockResolvedValueOnce(makeReport());
      const updated = makeReport({ priority: ReportPriority.HIGH });
      prismaMock.report.update.mockResolvedValueOnce(updated);

      const result = await service.update('report-1', 'company-1', {
        priority: ReportPriority.HIGH,
      });

      expect(result.priority).toBe(ReportPriority.HIGH);
    });

    it('deve lançar AppException quando o relatório não existe', async () => {
      prismaMock.report.findFirst.mockResolvedValueOnce(null);

      try {
        await service.update('missing', 'company-1', {
          status: ReportStatus.RESOLVED,
        });
        expect.fail('deveria ter lançado exception');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(AppException);
        expect((e as AppException).code).toBe(ExceptionCodes.REPORT_NOT_FOUND);
        expect((e as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getDashboardStats', () => {
    it('deve retornar estatísticas agregadas do dashboard', async () => {
      const statusCounts = [
        { status: ReportStatus.OPEN, _count: { status: 3 } },
        { status: ReportStatus.RESOLVED, _count: { status: 1 } },
      ];
      const priorityCounts = [
        { priority: ReportPriority.HIGH, _count: { priority: 2 } },
        { priority: ReportPriority.MEDIUM, _count: { priority: 2 } },
      ];
      prismaMock.$transaction.mockResolvedValueOnce([
        statusCounts,
        priorityCounts,
        4,
      ]);

      const result = await service.getDashboardStats('company-1');

      expect(result.total).toBe(4);
      expect(result.byStatus[ReportStatus.OPEN]).toBe(3);
      expect(result.byStatus[ReportStatus.RESOLVED]).toBe(1);
      expect(result.byPriority[ReportPriority.HIGH]).toBe(2);
    });

    it('deve retornar totais zerados quando não há relatórios', async () => {
      prismaMock.$transaction.mockResolvedValueOnce([[], [], 0]);

      const result = await service.getDashboardStats('company-1');

      expect(result.total).toBe(0);
      expect(Object.keys(result.byStatus)).toHaveLength(0);
      expect(Object.keys(result.byPriority)).toHaveLength(0);
    });
  });
});
