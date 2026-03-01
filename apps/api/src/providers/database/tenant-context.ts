import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  companyId: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

/**
 * Gets the current tenant companyId from AsyncLocalStorage.
 *
 * @returns The current tenant companyId, or undefined if no tenant context is active.
 */
export function getCurrentTenantId(): string | undefined {
  return tenantStorage.getStore()?.companyId;
}
