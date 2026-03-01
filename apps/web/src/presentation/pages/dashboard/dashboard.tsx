import { useDashboard } from '@/services/hooks/use-report'
import { ReportStatus, ReportPriority } from '@/types'
import { PageHeader } from '@/presentation/components/shared/page-header'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

const STATUS_COLORS: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'var(--blue-500)',
  [ReportStatus.IN_PROGRESS]: 'var(--tag-warning)',
  [ReportStatus.RESOLVED]: 'var(--success-600)',
  [ReportStatus.DISMISSED]: 'var(--neutral-400)',
}

const PRIORITY_COLORS: Record<ReportPriority, string> = {
  [ReportPriority.LOW]: 'var(--neutral-400)',
  [ReportPriority.MEDIUM]: 'var(--blue-500)',
  [ReportPriority.HIGH]: 'var(--tag-warning)',
  [ReportPriority.CRITICAL]: 'var(--error-600)',
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'Open',
  [ReportStatus.IN_PROGRESS]: 'In Progress',
  [ReportStatus.RESOLVED]: 'Resolved',
  [ReportStatus.DISMISSED]: 'Dismissed',
}

const PRIORITY_LABELS: Record<ReportPriority, string> = {
  [ReportPriority.LOW]: 'Low',
  [ReportPriority.MEDIUM]: 'Medium',
  [ReportPriority.HIGH]: 'High',
  [ReportPriority.CRITICAL]: 'Critical',
}

const statCards = [
  {
    key: 'total',
    label: 'Total Reports',
    icon: FileText,
    color: 'text-foreground',
  },
  {
    key: ReportStatus.OPEN,
    label: 'Open',
    icon: AlertCircle,
    color: 'text-blue',
  },
  {
    key: ReportStatus.IN_PROGRESS,
    label: 'In Progress',
    icon: Clock,
    color: 'text-tag-warning',
  },
  {
    key: ReportStatus.RESOLVED,
    label: 'Resolved',
    icon: CheckCircle2,
    color: 'text-success-600',
  },
] as const

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboard()

  const statusChartData = Object.values(ReportStatus).map(status => ({
    name: STATUS_LABELS[status],
    value: stats?.byStatus[status] ?? 0,
    fill: STATUS_COLORS[status],
  }))

  const priorityChartData = Object.values(ReportPriority).map(priority => ({
    name: PRIORITY_LABELS[priority],
    value: stats?.byPriority[priority] ?? 0,
    fill: PRIORITY_COLORS[priority],
  }))

  return (
    <div>
      <PageHeader
        title='Dashboard'
        description='Overview of reports in your company'
      />

      {/* Stat cards */}
      <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardContent className='flex items-center gap-4 pt-6'>
              <div className={`rounded-lg bg-neutral-100 p-3 ${color}`}>
                <Icon className='h-5 w-5' />
              </div>
              <div>
                <p className='text-sm text-neutral'>{label}</p>
                {isLoading ? (
                  <Skeleton className='mt-1 h-7 w-12' />
                ) : (
                  <p className='text-2xl font-bold'>
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

      {/* Charts */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Reports by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-[250px] w-full' />
            ) : (
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={statusChartData}>
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Reports by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-[250px] w-full' />
            ) : (
              <ResponsiveContainer width='100%' height={250}>
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey='value'
                  >
                    {priorityChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType='circle' />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
