import type { JwtPayload } from '@/types'

/**
 * Decode the payload section of a JWT without verifying the signature.
 * Verification is the backend's responsibility — the frontend only needs
 * to read claims for UI decisions (role, companyId).
 */
export function decodeJwtPayload(token: string): JwtPayload {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}
