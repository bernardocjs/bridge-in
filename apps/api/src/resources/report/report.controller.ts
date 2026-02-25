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
import { CurrentUser, Public } from '../../common/decorators';
import { HasCompanyGuard } from '../../common/guards/has-company.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ReportService } from './report.service';
import { CreateReportDto, QueryReportDto, UpdateReportDto } from './dtos';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Public()
  @Post('anonymous/:magicLinkSlug')
  createAnonymous(
    @Param('magicLinkSlug') magicLinkSlug: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportService.createAnonymous(magicLinkSlug, dto);
  }

  @UseGuards(HasCompanyGuard)
  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryReportDto) {
    return this.reportService.findAllByCompany(user.companyId!, query);
  }

  @UseGuards(HasCompanyGuard)
  @Get('dashboard')
  getDashboardStats(@CurrentUser() user: JwtPayload) {
    return this.reportService.getDashboardStats(user.companyId!);
  }

  @UseGuards(HasCompanyGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.reportService.findOne(id, user.companyId!);
  }

  @UseGuards(HasCompanyGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportService.update(id, user.companyId!, dto);
  }
}
