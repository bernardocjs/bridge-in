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

export function GuestGuard() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const { isLoading } = useMe()

  if (isAuthenticated && isLoading) return <Spinner />
  if (isAuthenticated) return <Navigate to={Routes.DASHBOARD} replace />
  return <Outlet />
}

interface ProtectedRouteProps {
  requireCompany?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({
  requireCompany = false,
  requireAdmin = false,
}: ProtectedRouteProps = {}) {
  const token = useAuthStore(s => s.token)
  const hasCompany = useAuthStore(selectHasCompany)
  const isAdmin = useAuthStore(selectIsAdmin)
  const user = useAuthStore(s => s.user)
  const { isLoading, isFetching } = useMe()

  if (!token) return <Navigate to={Routes.LOGIN} replace />

  if (isLoading || (isFetching && !user)) return <Spinner />

  if (requireCompany && !hasCompany) {
    return <Navigate to={Routes.ONBOARDING} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={Routes.DASHBOARD} replace />
  }

  return <Outlet />
}
