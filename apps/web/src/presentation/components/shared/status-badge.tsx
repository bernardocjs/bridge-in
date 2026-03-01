import { Badge } from '@/presentation/components/ui/badge'
import { ReportStatus } from '@/types'
import { cn } from '@/utils'

const statusConfig: Record<ReportStatus, { label: string; className: string }> =
  {
    [ReportStatus.OPEN]: {
      label: 'Open',
      className: 'bg-blue-50 text-blue border-blue/20',
    },
    [ReportStatus.IN_PROGRESS]: {
      label: 'In Progress',
      className: 'bg-tag-warning/10 text-tag-warning border-tag-warning/20',
    },
    [ReportStatus.RESOLVED]: {
      label: 'Resolved',
      className: 'bg-success/10 text-success-600 border-success/20',
    },
    [ReportStatus.DISMISSED]: {
      label: 'Dismissed',
      className: 'bg-neutral-100 text-neutral border-neutral/20',
    },
  }

export function StatusBadge({ status }: { status: ReportStatus }) {
  const config = statusConfig[status]
  return (
    <Badge
      variant='outline'
      className={cn('text-xs font-medium', config.className)}
    >
      {config.label}
    </Badge>
  )
}
