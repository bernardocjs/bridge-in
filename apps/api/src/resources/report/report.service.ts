import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ExceptionCodes } from '../../common/exceptions/exception-codes';
import { paginate, buildPaginationMeta } from '../../common/helpers/pagination';
import { PrismaService } from '../../providers/database/prisma.service';
import { CreateReportDto, QueryReportDto, UpdateReportDto } from './dtos';
import {
  DashboardStatsResponse,
  ReportDetailResponse,
  ReportListResponse,
  ReportSummaryResponse,
} from './interfaces';

@Injectable()
export class ReportService {
  private readonly defaultPageSize: number;
  private readonly maxPageSize: number;

  constructor(
    private readonly prisma: PrismaService,
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
   *
   * @param magicLinkSlug - Magic link slug identifying the target company.
   * @param dto - Report creation payload (title, content, optional contact).
   * @returns Summary of the created report.
   */
  async createAnonymous(
    magicLinkSlug: string,
    dto: CreateReportDto,
  ): Promise<ReportSummaryResponse> {
    const company = await this.prisma.company.findUnique({
      where: { magicLinkSlug },
      select: {
        id: true,
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

    return report;
  }

  /**
   * Lists all reports for a company with optional filtering and pagination.
   *
   * @param companyId - The company identifier to scope the query.
   * @param query - Pagination and filter options (status, priority, page, limit).
   * @returns Paginated list of report summaries.
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
   * Returns a single report by ID scoped to the given company.
   *
   * @param id - The report unique identifier.
   * @param companyId - The company identifier to enforce scoping.
   * @returns Full report details.
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
   *
   * @param id - The report unique identifier.
   * @param companyId - The company identifier to enforce scoping.
   * @param dto - Fields to update (status, priority).
   * @returns Updated report details.
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
   * Returns aggregated statistics for the company dashboard.
   *
   * @param companyId - The company identifier to scope the aggregation.
   * @returns Breakdown of reports by status and priority, plus total count.
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
