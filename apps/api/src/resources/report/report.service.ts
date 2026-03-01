import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { paginate, buildPaginationMeta } from '../../common/helpers/pagination';
import { PrismaService } from '../../providers/database/prisma.service';
import {
  IMailer,
  MAILER_SERVICE,
} from '../../providers/mailer/mailer.interface';
import { CreateReportDto, QueryReportDto, UpdateReportDto } from './dtos';
import {
  DashboardStatsResponse,
  ReportDetailResponse,
  ReportListResponse,
  ReportSummaryResponse,
} from './interfaces';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly defaultPageSize: number;
  private readonly maxPageSize: number;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MAILER_SERVICE) private readonly mailer: IMailer,
    private readonly config: ConfigService,
  ) {
    this.defaultPageSize = this.config.get<number>(
      'app.pagination.defaultSize',
      10,
    );
    this.maxPageSize = this.config.get<number>('app.pagination.maxSize', 50);
  }

  /**
   * Creates a report anonymously via the company's magic link slug.
   * No authentication required — tenant extension is NOT active on public routes,
   * so companyId is resolved explicitly from the magic link.
   */
  async createAnonymous(
    magicLinkSlug: string,
    dto: CreateReportDto,
  ): Promise<ReportSummaryResponse> {
    const company = await this.prisma.company.findUnique({
      where: { magicLinkSlug },
      select: {
        id: true,
        name: true,
        memberships: {
          where: { status: 'APPROVED' },
          select: { user: { select: { email: true } } },
        },
      },
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

    // Send notifications to all approved members — log failures without blocking
    const emailPromises = company.memberships.map((m) =>
      this.mailer.send({
        to: m.user.email,
        subject: `New anonymous report: ${report.title}`,
        body: `A new anonymous report has been submitted to ${company.name}. Please review it in your dashboard.`,
      }),
    );

    const results = await Promise.allSettled(emailPromises);
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      this.logger.warn(
        `Failed to send ${failures.length}/${results.length} notification emails for report ${report.id}`,
      );
    }

    return report;
  }

  /**
   * Lists all reports for the current tenant with optional filtering and pagination.
   * The tenant extension automatically injects companyId from AsyncLocalStorage.
   */
  async findAllByCompany(
    companyId: string,
    query: QueryReportDto,
  ): Promise<ReportListResponse> {
    const { skip, take, page, limit } = paginate({
      page: query.page,
      limit: query.limit,
      maxLimit: this.maxPageSize,
    });

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
        take,
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
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Returns a single report by ID.
   * The tenant extension ensures companyId is enforced automatically.
   */
  async findOne(id: string, companyId: string): Promise<ReportDetailResponse> {
    const report = await this.prisma.report.findUnique({
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
   */
  async update(
    id: string,
    companyId: string,
    dto: UpdateReportDto,
  ): Promise<ReportDetailResponse> {
    const existing = await this.prisma.report.findFirst({
      where: { id, companyId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppException(
        ExceptionCodes.REPORT_NOT_FOUND,
        'Report not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.prisma.report.update({
      where: { id, companyId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
      },
    });
  }

  /**
   * Returns aggregated stats for the company dashboard.
   * The tenant extension injects companyId into groupBy/count.
   */
  async getDashboardStats(companyId: string): Promise<DashboardStatsResponse> {
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
