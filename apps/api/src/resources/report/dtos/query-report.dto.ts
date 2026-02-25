import { IsEnum, IsOptional, IsNumberString } from 'class-validator';
import { ReportPriority, ReportStatus } from '@prisma/client';

export class QueryReportDto {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsEnum(ReportPriority)
  @IsOptional()
  priority?: ReportPriority;

  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;
}
