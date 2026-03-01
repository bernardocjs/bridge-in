import { ReportStatus } from '@/types'
import type { DashboardStatsResponse } from '@/types'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

const statCards = [
  {
    key: 'total',
    label: 'Total Reports',
    icon: FileText,
    color: 'text-primary',
    bg: 'bg-primary-50 dark:bg-primary-900/30',
  },
  {
    key: ReportStatus.OPEN,
    label: 'Open',
    icon: AlertCircle,
    color: 'text-blue',
    bg: 'bg-blue-50 dark:bg-blue-50',
  },
  {
    key: ReportStatus.IN_PROGRESS,
    label: 'In Progress',
    icon: Clock,
    color: 'text-tag-warning',
    bg: 'bg-tag-warning/10',
  },
  {
    key: ReportStatus.RESOLVED,
    label: 'Resolved',
    icon: CheckCircle2,
    color: 'text-success-600',
    bg: 'bg-success/10',
  },
] as const

interface StatCardsProps {
  stats: DashboardStatsResponse | undefined
  isLoading: boolean
}

export function StatCards({ stats, isLoading }: StatCardsProps) {
  return (
    <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {statCards.map(({ key, label, icon: Icon, color, bg }) => (
        <Card
          key={key}
          className='transition-shadow duration-200 hover:shadow-md'
        >
          <CardContent className='flex items-center gap-4 pt-6'>
            <div className={`rounded-xl p-3 ${bg} ${color}`}>
              <Icon className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-neutral'>{label}</p>
              {isLoading ? (
                <Skeleton className='mt-1 h-8 w-14' />
              ) : (
                <p className='text-3xl font-bold tracking-tight'>
                  {key === 'total'
                    ? (stats?.total ?? 0)
                    : (stats?.byStatus[key as ReportStatus] ?? 0)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
