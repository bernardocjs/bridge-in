import type { ReactNode } from 'react'
import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <div className='mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200/50 text-neutral-400 dark:from-neutral-700 dark:to-neutral-800/50 dark:text-neutral-500'>
        {icon ?? <InboxIcon className='h-10 w-10' />}
      </div>
      <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
      {description && (
        <p className='mt-1.5 max-w-sm text-sm text-neutral'>{description}</p>
      )}
      {action && <div className='mt-5'>{action}</div>}
    </div>
  )
}
