import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { ExceptionCodes } from '../exceptions/exception-codes';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class HasCompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user?.companyId) {
      throw new AppException(
        ExceptionCodes.COMPANY_REQUIRED,
        'You must belong to a company to access this resource',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
