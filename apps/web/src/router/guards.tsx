import { Navigate, Outlet } from 'react-router-dom'
import {
  useAuthStore,
  selectIsAuthenticated,
  selectHasCompany,
  selectIsAdmin,
} from '@/stores/auth.store'
import { useMe } from '@/services/hooks/use-auth'
import { Routes } from './routes'

const Spinner = () => (
  <div className='flex h-screen items-center justify-center bg-background'>
    <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
  </div>
)

/** Requires authentication — redirects to login if no token */
export function AuthGuard() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  if (!isAuthenticated) return <Navigate to={Routes.LOGIN} replace />
  return <Outlet />
}

/**
 * Blocks authenticated users — redirects to dashboard.
 */
export function GuestGuard() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const { isLoading } = useMe()

  if (isAuthenticated && isLoading) return <Spinner />
  if (isAuthenticated) return <Navigate to={Routes.DASHBOARD} replace />
  return <Outlet />
}

/** Requires user to belong to a company — redirects to onboarding */
export function CompanyGuard() {
  const hasCompany = useAuthStore(selectHasCompany)
  const user = useAuthStore(s => s.user)
  const token = useAuthStore(s => s.token)
  const { isLoading, isFetching } = useMe()

  if (token && (isLoading || (isFetching && !user))) return <Spinner />
  if (!hasCompany) return <Navigate to={Routes.ONBOARDING} replace />
  return <Outlet />
}

/** Requires ADMIN role — redirects to dashboard otherwise */
export function AdminGuard() {
  const isAdmin = useAuthStore(selectIsAdmin)
  if (!isAdmin) return <Navigate to={Routes.DASHBOARD} replace />
  return <Outlet />
}
