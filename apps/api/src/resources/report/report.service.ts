import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { PrismaService } from '../../providers/database/prisma.service';
import {
  IMailer,
  MAILER_SERVICE,
} from '../../providers/mailer/mailer.interface';
import { CreateReportDto, QueryReportDto, UpdateReportDto } from './dtos';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MAILER_SERVICE) private readonly mailer: IMailer,
  ) {}

  /**
   * Creates a report anonymously via the company's magic link slug.
   * No authentication required.
   */
  async createAnonymous(magicLinkSlug: string, dto: CreateReportDto) {
    const company = await this.prisma.company.findUnique({
      where: { magicLinkSlug },
      select: { id: true, name: true, users: { select: { email: true } } },
    });

    if (!company) {
      throw new AppException(
        ExceptionCodes.COMPANY_INVALID_MAGIC_LINK,
        'Invalid or expired company link',
        HttpStatus.NOT_FOUND,
      );
    }

    const report = await this.prisma.report.create({
      data: {
        title: dto.title,
        content: dto.content,
        reporterContact: dto.reporterContact,
        companyId: company.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    company.users.forEach((user) => {
      void this.mailer.send({
        to: user.email,
        subject: `New anonymous report: ${report.title}`,
        body: `A new anonymous report has been submitted to ${company.name}. Please review it in your dashboard.`,
      });
    });

    return report;
  }

  /**
   * Lists all reports for a company with optional filtering and pagination.
   * Tenancy is enforced via the companyId from the JWT.
   * @
   */
  async findAllByCompany(companyId: string, query: QueryReportDto) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(query.limit || String(DEFAULT_PAGE_SIZE), 10)),
    );
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = { companyId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          reporterContact: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Returns a single report by ID, enforcing company tenancy.
   * Returns 404 even if the report exists in another company (no information leakage).
   */
  async findOne(id: string, companyId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, companyId },
    });

    if (!report) {
      throw new AppException(
        ExceptionCodes.REPORT_NOT_FOUND,
        'Report not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return report;
  }

  /**
   * Updates a report's status and/or priority.
   * Tenancy is enforced via companyId.
   */
  async update(id: string, companyId: string, dto: UpdateReportDto) {
    await this.findOne(id, companyId);

    return this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
      },
    });
  }

  /**
   * Returns aggregated stats for the company dashboard.
   */
  async getDashboardStats(companyId: string) {
    const [statusCounts, priorityCounts, total] =
      await this.prisma.$transaction([
        this.prisma.report.groupBy({
          by: ['status'],
          where: { companyId },
          orderBy: { status: 'asc' },
          _count: { status: true },
        }),
        this.prisma.report.groupBy({
          by: ['priority'],
          where: { companyId },
          orderBy: { priority: 'asc' },
          _count: { priority: true },
        }),
        this.prisma.report.count({ where: { companyId } }),
      ]);

    return {
      total,
      byStatus: Object.fromEntries(
        statusCounts.map((s) => [s.status, s._count.status]),
      ),
      byPriority: Object.fromEntries(
        priorityCounts.map((p) => [p.priority, p._count.priority]),
      ),
    };
  }
}
