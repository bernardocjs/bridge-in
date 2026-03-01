import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumberString } from 'class-validator';
import { ReportPriority, ReportStatus } from '@prisma/client';

export class QueryReportDto {
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

  @ApiProperty({ example: '1', description: 'Page number', required: false })
  @IsNumberString()
  @IsOptional()
  page?: string;

  @ApiProperty({
    example: '10',
    description: 'Items per page',
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  limit?: string;
}
