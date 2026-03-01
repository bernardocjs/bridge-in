import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, Public } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { AuthTokenResponse, UserProfileResponse } from './interfaces';
import { LoginDto, RegisterDto } from './dtos';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user account.
   * @param dto - Registration payload (email, password, name).
   * @returns Access token only.
   */
  @ApiOperation({ summary: 'Register a new user account' })
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthTokenResponse> {
    return this.authService.register(dto);
  }

  /**
   * Authenticates a user and issues a JWT.
   * @param dto - Login credentials (email, password).
   * @returns Access token only. Use GET /auth/me for user data.
   */
  @ApiOperation({ summary: 'Authenticate user and obtain JWT' })
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthTokenResponse> {
    return this.authService.login(dto);
  }

  /**
   * Returns the profile of the currently authenticated user.
   * @param user - JWT payload extracted from the bearer token.
   * @returns User profile including company association.
   */
  @ApiOperation({ summary: 'Return authenticated user profile' })
  @Get('me')
  me(@CurrentUser() user: JwtPayload): Promise<UserProfileResponse> {
    return this.authService.me(user.userId);
  }
}
