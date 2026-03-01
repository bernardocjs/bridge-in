import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ReportPriority, ReportStatus } from '@prisma/client';

export class UpdateReportDto {
  @ApiProperty({
    enum: ReportStatus,
    example: ReportStatus.IN_PROGRESS,
    description: 'New report status',
    required: false,
  })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiProperty({
    enum: ReportPriority,
    example: ReportPriority.HIGH,
    description: 'New report priority',
    required: false,
  })
  @IsEnum(ReportPriority)
  @IsOptional()
  priority?: ReportPriority;
}
