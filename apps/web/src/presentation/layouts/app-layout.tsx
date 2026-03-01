import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  ShieldAlert,
  Link as LinkIcon,
} from 'lucide-react'
import { cn } from '@/utils'
import { Routes } from '@/router/routes'
import { useAuthStore, selectIsAdmin } from '@/stores/auth.store'
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar'
import { Button } from '@/presentation/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/presentation/components/ui/tooltip'
import { Separator } from '@/presentation/components/ui/separator'

const navItems = [
  { to: Routes.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: Routes.REPORTS, icon: FileText, label: 'Reports' },
]

const adminItems = [{ to: Routes.MEMBERS, icon: Users, label: 'Members' }]

/**
 * Main authenticated layout with a dark sidebar and scrollable content area.
 * Uses the sidebar design tokens already defined in style.css.
 */
export function AppLayout() {
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(selectIsAdmin)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.charAt(0).toUpperCase() ?? '?')

  const handleLogout = () => {
    logout()
    navigate(Routes.LOGIN)
  }

  const magicSlug = user?.company?.magicLinkSlug
  const reportLink = magicSlug
    ? `${window.location.origin}/report/${magicSlug}`
    : null

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex h-screen overflow-hidden'>
        {/* Sidebar */}
        <aside className='flex w-[220px] flex-col bg-sidebar-background text-white'>
          {/* Brand */}
          <div className='flex items-center gap-2 px-5 py-5'>
            <ShieldAlert className='h-6 w-6 text-primary-400' />
            <span className='text-lg font-bold tracking-tight'>Bridge In</span>
          </div>

          <Separator className='bg-sidebar-disabled-top' />

          {/* User */}
          <div className='flex items-center gap-3 px-5 py-4'>
            <Avatar className='h-9 w-9 bg-primary-600 text-sm'>
              <AvatarFallback className='bg-primary-600 text-white'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>
                {user?.name ?? user?.email}
              </p>
              <p className='truncate text-xs text-neutral-400'>
                {user?.company?.name}
              </p>
            </div>
          </div>

          <Separator className='bg-sidebar-disabled-top' />

          {/* Navigation */}
          <nav className='flex-1 space-y-1 px-3 py-3'>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === Routes.DASHBOARD}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-l-2 border-sidebar-item-active-border bg-sidebar-item-active text-white'
                      : 'text-neutral-300 hover:bg-sidebar-disabled-top hover:text-white',
                  )
                }
              >
                <Icon className='h-4 w-4' />
                {label}
              </NavLink>
            ))}

            {isAdmin &&
              adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-l-2 border-sidebar-item-active-border bg-sidebar-item-active text-white'
                        : 'text-neutral-300 hover:bg-sidebar-disabled-top hover:text-white',
                    )
                  }
                >
                  <Icon className='h-4 w-4' />
                  {label}
                </NavLink>
              ))}
          </nav>

          {/* Footer */}
          <div className='space-y-2 px-3 pb-4'>
            {reportLink && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start gap-2 text-neutral-400 hover:text-white'
                    onClick={() => navigator.clipboard.writeText(reportLink)}
                  >
                    <LinkIcon className='h-4 w-4' />
                    <span className='truncate text-xs'>Copy Report Link</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='right'>
                  <p className='text-xs'>{reportLink}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start gap-2 text-neutral-400 hover:text-white'
              onClick={handleLogout}
            >
              <LogOut className='h-4 w-4' />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className='flex-1 overflow-y-auto bg-background p-6'>
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
