import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user account.
   * @param dto - Registration payload (email, password, name).
   * @returns Access token and the created user record.
   */
  @ApiOperation({ summary: 'Register a new user account' })
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto): ReturnType<AuthService['register']> {
    return this.authService.register(dto);
  }

  /**
   * Authenticates a user and issues a JWT.
   * @param dto - Login credentials (email, password).
   * @returns Access token and the authenticated user with company info.
   */
  @ApiOperation({ summary: 'Authenticate user and obtain JWT' })
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto): ReturnType<AuthService['login']> {
    return this.authService.login(dto);
  }

  /**
   * Returns the profile of the currently authenticated user.
   * @param user - JWT payload extracted from the bearer token.
   * @returns User profile including company association.
   */
  @ApiOperation({ summary: 'Return authenticated user profile' })
  @Get('me')
  me(@CurrentUser() user: JwtPayload): ReturnType<AuthService['me']> {
    return this.authService.me(user.userId);
  }
}
