import { PrismaClient } from '@prisma/client';
import { getCurrentTenantId } from './tenant-context';

/**
 * Creates a Prisma Client Extension that automatically injects `companyId`
 * into `where` clauses for tenant-scoped models (Report).
 *
 * This provides RLS-like behavior at the application level:
 * - On authenticated requests, `companyId` is set via AsyncLocalStorage
 * - On public routes (no tenant context), extensions are bypassed and
 *   services must handle `companyId` explicitly
 */
export function tenantExtension() {
  return PrismaClient.prototype.$extends({
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
        async findUnique({ args, query }) {
          const tenantId = getCurrentTenantId();
          if (tenantId) {
            args.where = { ...args.where, companyId: tenantId } as any;
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
