import { Navigate, Outlet } from 'react-router-dom'
import {
  useAuthStore,
  selectIsAuthenticated,
  selectHasCompany,
  selectIsAdmin,
} from '@/stores/auth.store'
import { Routes } from './routes'

/** Requires authentication — redirects to login if no token */
export function AuthGuard() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  if (!isAuthenticated) return <Navigate to={Routes.LOGIN} replace />
  return <Outlet />
}

/** Blocks authenticated users — redirects to home */
export function GuestGuard() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  if (isAuthenticated) return <Navigate to={Routes.DASHBOARD} replace />
  return <Outlet />
}

/** Requires the user to belong to a company — redirects to onboarding otherwise */
export function CompanyGuard() {
  const hasCompany = useAuthStore(selectHasCompany)
  if (!hasCompany) return <Navigate to={Routes.ONBOARDING} replace />
  return <Outlet />
}

/** Requires ADMIN role — redirects to dashboard otherwise */
export function AdminGuard() {
  const isAdmin = useAuthStore(selectIsAdmin)
  if (!isAdmin) return <Navigate to={Routes.DASHBOARD} replace />
  return <Outlet />
}
