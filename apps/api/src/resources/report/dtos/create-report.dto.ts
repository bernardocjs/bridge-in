import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    example: 'Harassment issue in department X',
    description: 'Report title (5-255 characters)',
    minLength: 5,
    maxLength: 255,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'On 02/10, manager X acted inappropriately by...',
    description: 'Detailed description of the incident (minimum 10 characters)',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiProperty({
    example: 'anonymous@protonmail.com',
    description: 'Optional reporter contact',
    required: false,
  })
  @IsString()
  @IsOptional()
  reporterContact?: string;
}
