import { IsEnum, IsOptional } from 'class-validator';
import { ReportPriority, ReportStatus } from '@prisma/client';

export class UpdateReportDto {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsEnum(ReportPriority)
  @IsOptional()
  priority?: ReportPriority;
}
