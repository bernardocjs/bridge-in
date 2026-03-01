import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Items per page', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit?: number = 10;
}
