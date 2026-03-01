import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Company name (2-100 characters)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
