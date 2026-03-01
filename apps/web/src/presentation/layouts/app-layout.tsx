import { Outlet } from 'react-router-dom'
import { TooltipProvider } from '@/presentation/components/ui/tooltip'
import { AppSidebar } from './components/app-sidebar'

export function AppLayout() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex h-screen overflow-hidden'>
        <AppSidebar />
        <main className='flex-1 overflow-y-auto bg-background p-6'>
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
