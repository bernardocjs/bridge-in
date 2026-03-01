import { Badge } from '@/presentation/components/ui/badge'
import { ReportPriority } from '@/types'
import { cn } from '@/utils'

const priorityConfig: Record<
  ReportPriority,
  { label: string; className: string }
> = {
  [ReportPriority.LOW]: {
    label: 'Low',
    className: 'bg-neutral-100 text-neutral border-neutral/20',
  },
  [ReportPriority.MEDIUM]: {
    label: 'Medium',
    className: 'bg-blue-50 text-blue border-blue/20',
  },
  [ReportPriority.HIGH]: {
    label: 'High',
    className: 'bg-tag-warning/10 text-tag-warning border-tag-warning/20',
  },
  [ReportPriority.CRITICAL]: {
    label: 'Critical',
    className: 'bg-error/10 text-error-600 border-error/20',
  },
}

export function PriorityBadge({ priority }: { priority: ReportPriority }) {
  const config = priorityConfig[priority]
  return (
    <Badge
      variant='outline'
      className={cn('text-xs font-medium', config.className)}
    >
      {config.label}
    </Badge>
  )
}
