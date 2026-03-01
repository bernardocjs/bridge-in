import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/presentation/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { useMe } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { router } from '@/router'

/**
 * Bootstrap layer that hydrates user profile from the persisted JWT token.
 * Renders a minimal loading state to prevent flash of wrong content
 * (e.g. showing login page while /me is still in-flight).
 */
function AppBootstrap() {
  const token = useAuthStore(s => s.token)
  const { isLoading } = useMe()

  // If we have a token but haven't resolved /me yet, show a spinner
  if (token && isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-background'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    )
  }

  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
      <Toaster richColors position='top-right' />
    </QueryClientProvider>
  )
}
