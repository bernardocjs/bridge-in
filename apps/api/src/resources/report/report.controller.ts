import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, Public } from '../../common/decorators';
import { HasCompanyGuard } from '../../common/guards/has-company.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ReportService } from './report.service';
import { CreateReportDto, QueryReportDto, UpdateReportDto } from './dtos';
import {
  DashboardStatsResponse,
  MonthlyCountResponse,
  ReportDetailResponse,
  ReportListResponse,
  ReportSummaryResponse,
} from './interfaces';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Submits an anonymous report to a company identified by its magic link slug.
   *
   * @param magicLinkSlug - The company's magic link slug from the URL.
   * @param dto - Report payload (title, content, optional contact).
   * @returns Summary of the created report.
   */
  @ApiOperation({
    summary: 'Submit an anonymous report via magic link (public)',
  })
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Public()
  @Post('anonymous/:magicLinkSlug')
  createAnonymous(
    @Param('magicLinkSlug') magicLinkSlug: string,
    @Body() dto: CreateReportDto,
  ): Promise<ReportSummaryResponse> {
    return this.reportService.createAnonymous(magicLinkSlug, dto);
  }

  /**
   * Lists reports for the authenticated user's company with optional filters.
   *
   * @param user - JWT payload of the authenticated user.
   * @param query - Pagination and filter options.
   * @returns Paginated list of report summaries.
   */
  @ApiOperation({
    summary: 'List company reports with optional filters and pagination',
  })
  @UseGuards(HasCompanyGuard)
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryReportDto,
  ): Promise<ReportListResponse> {
    return this.reportService.findAllByCompany(user.companyId!, query);
  }

  /**
   * Returns aggregated report statistics for the company dashboard.
   *
   * @param user - JWT payload of the authenticated user.
   * @returns Report counts broken down by status and priority.
   */
  @ApiOperation({
    summary: 'Get aggregated report statistics for the dashboard',
  })
  @UseGuards(HasCompanyGuard)
  @Get('dashboard')
  getDashboardStats(
    @CurrentUser() user: JwtPayload,
  ): Promise<DashboardStatsResponse> {
    return this.reportService.getDashboardStats(user.companyId!);
  }

  /**
   * Returns the count of reports per month for the last 12 months.
   *
   * @param user - JWT payload of the authenticated user.
   * @returns Array with month and count for the last 12 months.
   */
  @ApiOperation({
    summary: 'Get monthly report count for the last 12 months',
  })
  @UseGuards(HasCompanyGuard)
  @Get('monthly-count')
  getMonthlyCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<MonthlyCountResponse> {
    return this.reportService.getMonthlyCount(user.companyId!);
  }

  /**
   * Returns a single report by ID, scoped to the authenticated user's company.
   *
   * @param id - The report unique identifier.
   * @param user - JWT payload of the authenticated user.
   * @returns Full report details.
   */
  @ApiOperation({ summary: 'Get a report by ID' })
  @UseGuards(HasCompanyGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReportDetailResponse> {
    return this.reportService.findOne(id, user.companyId!);
  }

  /**
   * Updates a report's status and/or priority.
   *
   * @param id - The report unique identifier.
   * @param user - JWT payload of the authenticated user.
   * @param dto - Fields to update (status, priority).
   * @returns Updated report details.
   */
  @ApiOperation({ summary: "Update a report's status and/or priority" })
  @UseGuards(HasCompanyGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateReportDto,
  ): Promise<ReportDetailResponse> {
    return this.reportService.update(id, user.companyId!, dto);
  }
}
