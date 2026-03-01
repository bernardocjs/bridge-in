import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@email.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password@123',
    description: 'Password with at least 8 characters',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'John Smith',
    description: 'User display name (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
