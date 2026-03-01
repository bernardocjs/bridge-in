import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/presentation/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { useMe } from '@/services/hooks/use-auth'
import { router } from '@/router'

function AppBootstrap() {
  useMe()
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
