import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils'

interface SidebarNavItemProps {
  to: string
  icon: LucideIcon
  label: string
  end?: boolean
}

export function SidebarNavItem({ to, icon: Icon, label, end }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
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
  )
}
