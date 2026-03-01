import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@email.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password@123',
    description: 'Password (8-72 characters)',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({
    example: 'John Smith',
    description: 'User display name (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;
}
