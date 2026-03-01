import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-background to-primary-50/30 px-4 dark:from-neutral-900 dark:via-background dark:to-primary-900/10'>
      <div className='w-full max-w-md space-y-6'>
        <div className='flex items-center justify-center'>
          <img src='/LOGO.webp' alt='Bridge In' className='h-8 w-auto' />
        </div>
        <Outlet />
      </div>
    </div>
  )
}
