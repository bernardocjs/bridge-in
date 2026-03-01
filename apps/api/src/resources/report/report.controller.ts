import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../../common/decorators';
import { HasCompanyGuard } from '../../common/guards/has-company.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ReportService } from './report.service';
import { CreateReportDto, QueryReportDto, UpdateReportDto } from './dtos';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Submits an anonymous report to a company identified by its magic link slug.
   * @param magicLinkSlug - Unique slug from the company's anonymous report URL.
   * @param dto - Report content (title, content, optional reporterContact).
   * @returns Minimal report record confirming the submission.
   */
  @ApiOperation({
    summary: 'Submit an anonymous report via magic link (public)',
  })
  @Public()
  @Post('anonymous/:magicLinkSlug')
  createAnonymous(
    @Param('magicLinkSlug') magicLinkSlug: string,
    @Body() dto: CreateReportDto,
  ): ReturnType<ReportService['createAnonymous']> {
    return this.reportService.createAnonymous(magicLinkSlug, dto);
  }

  /**
   * Lists reports for the authenticated user's company with optional filters.
   * @param user - JWT payload used to scope the query to the user's company.
   * @param query - Optional filters (status, priority) and pagination params.
   * @returns Paginated list of reports with metadata.
   */
  @ApiOperation({
    summary: 'List company reports with optional filters and pagination',
  })
  @UseGuards(HasCompanyGuard)
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryReportDto,
  ): ReturnType<ReportService['findAllByCompany']> {
    return this.reportService.findAllByCompany(user.companyId!, query);
  }

  /**
   * Returns aggregated report statistics for the company dashboard.
   * @param user - JWT payload used to scope aggregation to the user's company.
   * @returns Total count and breakdowns by status and priority.
   */
  @ApiOperation({
    summary: 'Get aggregated report statistics for the dashboard',
  })
  @UseGuards(HasCompanyGuard)
  @Get('dashboard')
  getDashboardStats(
    @CurrentUser() user: JwtPayload,
  ): ReturnType<ReportService['getDashboardStats']> {
    return this.reportService.getDashboardStats(user.companyId!);
  }

  /**
   * Returns a single report by ID, scoped to the authenticated user's company.
   * @param id - UUID of the report to retrieve.
   * @param user - JWT payload used for company tenancy check.
   * @returns The full report record.
   */
  @ApiOperation({ summary: 'Get a report by ID' })
  @UseGuards(HasCompanyGuard)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): ReturnType<ReportService['findOne']> {
    return this.reportService.findOne(id, user.companyId!);
  }

  /**
   * Updates a report's status and/or priority.
   * @param id - UUID of the report to update.
   * @param user - JWT payload used for company tenancy check.
   * @param dto - Fields to update (status, priority).
   * @returns The full updated report record.
   */
  @ApiOperation({ summary: "Update a report's status and/or priority" })
  @UseGuards(HasCompanyGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateReportDto,
  ): ReturnType<ReportService['update']> {
    return this.reportService.update(id, user.companyId!, dto);
  }
}
