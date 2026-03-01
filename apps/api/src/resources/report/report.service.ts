import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Prisma, Report, ReportPriority, ReportStatus } from '@prisma/client';
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
   * @param magicLinkSlug - Unique slug identifying the target company.
   * @param dto - Report data submitted by the anonymous reporter.
   * @returns Minimal report record (id, title, status, createdAt) and sends email notifications.
   */
  async createAnonymous(
    magicLinkSlug: string,
    dto: CreateReportDto,
  ): Promise<{
    id: string;
    title: string;
    status: ReportStatus;
    createdAt: Date;
  }> {
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
   * @param companyId - ID of the company (from JWT) used to scope the query.
   * @param query - Optional filters (status, priority) and pagination params (page, limit).
   * @returns Paginated list of reports with metadata (total, page, limit, totalPages).
   */
  async findAllByCompany(
    companyId: string,
    query: QueryReportDto,
  ): Promise<{
    data: Array<{
      id: string;
      title: string;
      status: ReportStatus;
      priority: ReportPriority;
      reporterContact: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
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
   * @param id - UUID of the report to retrieve.
   * @param companyId - ID of the company (from JWT) used to scope the query.
   * @returns The full report record.
   */
  async findOne(id: string, companyId: string): Promise<Report> {
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
   * @param id - UUID of the report to update.
   * @param companyId - ID of the company (from JWT) used for tenancy validation.
   * @param dto - Fields to update (status, priority).
   * @returns The full updated report record.
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateReportDto,
  ): Promise<Report> {
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
   * @param companyId - ID of the company (from JWT) to aggregate stats for.
   * @returns Total report count, counts grouped by status, and counts grouped by priority.
   */
  async getDashboardStats(companyId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
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
        statusCounts.map((s) => [
          s.status,
          (s._count as { status: number }).status,
        ]),
      ),
      byPriority: Object.fromEntries(
        priorityCounts.map((p) => [
          p.priority,
          (p._count as { priority: number }).priority,
        ]),
      ),
    };
  }
}
