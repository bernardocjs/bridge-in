import { Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

/**
 * Centered card layout for login, register, and onboarding pages.
 */
export function AuthLayout() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div className='w-full max-w-md space-y-6'>
        <div className='flex items-center justify-center gap-2 text-primary'>
          <ShieldAlert className='h-8 w-8' />
          <span className='text-2xl font-bold tracking-tight text-foreground'>
            Bridge In
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
