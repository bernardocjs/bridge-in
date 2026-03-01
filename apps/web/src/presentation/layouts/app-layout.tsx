import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  ShieldAlert,
  Link as LinkIcon,
  Check,
} from 'lucide-react'
import { cn } from '@/utils'
import { Routes } from '@/router/routes'
import { useAuthStore, selectIsAdmin } from '@/stores/auth.store'
import { useLogout } from '@/services/hooks/use-auth'
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

export function AppLayout() {
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(selectIsAdmin)
  const logout = useLogout()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

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

  const handleCopyLink = useCallback(() => {
    if (!reportLink) return
    navigator.clipboard.writeText(reportLink)
    setCopied(true)
  }, [reportLink])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex h-screen overflow-hidden'>
        {/* Sidebar */}
        <aside className='flex w-[240px] flex-col bg-gradient-to-b from-sidebar-background to-neutral-900'>
          {/* Brand */}
          <div className='flex items-center gap-2.5 px-5 py-5'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20'>
              <ShieldAlert className='h-5 w-5 text-primary-300' />
            </div>
            <span className='text-lg font-bold tracking-tight text-white'>
              Bridge In
            </span>
          </div>

          <Separator className='bg-white/10' />

          {/* User */}
          <div className='flex items-center gap-3 px-5 py-4'>
            <Avatar className='h-9 w-9 ring-2 ring-primary-400/30'>
              <AvatarFallback className='bg-primary-600 text-sm text-white'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-white'>
                {user?.name ?? user?.email}
              </p>
              <p className='truncate text-xs text-neutral-400'>
                {user?.company?.name}
              </p>
            </div>
          </div>

          <Separator className='bg-white/10' />

          {/* Navigation */}
          <nav className='flex-1 space-y-1 px-3 py-4'>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === Routes.DASHBOARD}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/20 text-white shadow-sm'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                        isActive ? 'bg-primary text-white' : 'text-current',
                      )}
                    >
                      <Icon className='h-4 w-4' />
                    </div>
                    {label}
                  </>
                )}
              </NavLink>
            ))}

            {isAdmin &&
              adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/20 text-white shadow-sm'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                          isActive ? 'bg-primary text-white' : 'text-current',
                        )}
                      >
                        <Icon className='h-4 w-4' />
                      </div>
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
          </nav>

          {/* Footer */}
          <div className='space-y-3 px-3 pb-4'>
            {reportLink && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      copied
                        ? 'bg-success/20 text-success'
                        : 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110',
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className='h-4 w-4' />
                        Copied!
                      </>
                    ) : (
                      <>
                        <LinkIcon className='h-4 w-4' />
                        Copy Report Link
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side='right'>
                  <p className='text-xs'>
                    Share this link for anonymous reports
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            <Separator className='bg-white/10' />

            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start gap-2 text-neutral-400 hover:bg-white/5 hover:text-white'
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
