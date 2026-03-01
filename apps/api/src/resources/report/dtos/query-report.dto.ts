import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ReportPriority, ReportStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/helpers/pagination';

export class QueryReportDto extends PaginationDto {
  @ApiProperty({
    enum: ReportStatus,
    example: ReportStatus.OPEN,
    description: 'Filter by status',
    required: false,
  })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiProperty({
    enum: ReportPriority,
    example: ReportPriority.HIGH,
    description: 'Filter by priority',
    required: false,
  })
  @IsEnum(ReportPriority)
  @IsOptional()
  priority?: ReportPriority;
}
