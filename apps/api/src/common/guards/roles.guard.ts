import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from '@prisma/client';
import { AppException } from '../exceptions/app.exception';
import { ExceptionCodes } from '../exceptions/exception-codes';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new AppException(
        ExceptionCodes.AUTH_UNAUTHORIZED,
        'You do not have permission to perform this action',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
