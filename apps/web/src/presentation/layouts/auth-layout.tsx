import { Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-background to-primary-50/30 px-4 dark:from-neutral-900 dark:via-background dark:to-primary-900/10'>
      <div className='w-full max-w-md space-y-6'>
        <div className='flex items-center justify-center gap-2.5 text-primary'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
            <ShieldAlert className='h-6 w-6' />
          </div>
          <span className='text-2xl font-bold tracking-tight text-foreground'>
            Bridge In
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
