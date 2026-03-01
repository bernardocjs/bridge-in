import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  companyId: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

/**
 * Get the current tenant companyId from AsyncLocalStorage.
 * Returns undefined if no tenant context is set (e.g. public routes).
 */
export function getCurrentTenantId(): string | undefined {
  return tenantStorage.getStore()?.companyId;
}
