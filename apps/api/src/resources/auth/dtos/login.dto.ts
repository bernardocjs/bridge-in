import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@email.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password@123', description: 'User password' })
  @IsString()
  password: string;
}
