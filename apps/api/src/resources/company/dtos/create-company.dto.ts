import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Company name (minimum 2 characters)',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;
}
