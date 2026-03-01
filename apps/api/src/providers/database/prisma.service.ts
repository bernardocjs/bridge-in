import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from './types';
import { getCurrentTenantId } from './tenant-context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  private _tenantClient: ReturnType<typeof this.withTenantExtension> | null =
    null;

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Returns a Prisma client extended with tenant-scoped filtering.
   * Automatically injects `companyId` into Report queries when
   * a tenant context is active (via AsyncLocalStorage).
   */
  get tenant() {
    if (!this._tenantClient) {
      this._tenantClient = this.withTenantExtension();
    }
    return this._tenantClient;
  }

  private withTenantExtension() {
    return this.$extends({
      query: {
        report: {
          async findMany({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId };
            }
            return query(args);
          },
          async findFirst({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId };
            }
            return query(args);
          },
          async update({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId } as any;
            }
            return query(args);
          },
          async updateMany({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId };
            }
            return query(args);
          },
          async delete({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId } as any;
            }
            return query(args);
          },
          async deleteMany({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId };
            }
            return query(args);
          },
          async count({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId };
            }
            return query(args);
          },
          async groupBy({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId };
            }
            return query(args);
          },
          async aggregate({ args, query }) {
            const tenantId = getCurrentTenantId();
            if (tenantId) {
              args.where = { ...args.where, companyId: tenantId };
            }
            return query(args);
          },
        },
      },
    });
  }
}
