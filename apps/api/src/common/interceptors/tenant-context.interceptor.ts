import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantStorage } from '../../providers/database/tenant-context';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Interceptor that sets the tenant context (companyId) from the JWT payload
 * into AsyncLocalStorage for the duration of the request.
 *
 * This enables the Prisma tenant extension to automatically inject companyId
 * into queries for tenant-scoped models.
 *
 * For public routes (unauthenticated), no tenant context is set, and the
 * extension will not inject companyId — services must handle it explicitly.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (user?.companyId) {
      return new Observable((subscriber) => {
        tenantStorage.run({ companyId: user.companyId! }, () => {
          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        });
      });
    }

    return next.handle();
  }
}
