import { ReportStatus } from '@/types'
import type { DashboardStatsResponse } from '@/types'
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
  Cell,
} from 'recharts'

const STATUS_COLORS: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'var(--blue-500)',
  [ReportStatus.IN_PROGRESS]: 'var(--tag-warning)',
  [ReportStatus.RESOLVED]: 'var(--success-600)',
  [ReportStatus.DISMISSED]: 'var(--neutral-400)',
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'Open',
  [ReportStatus.IN_PROGRESS]: 'In Progress',
  [ReportStatus.RESOLVED]: 'Resolved',
  [ReportStatus.DISMISSED]: 'Dismissed',
}

interface StatusChartProps {
  stats: DashboardStatsResponse | undefined
  isLoading: boolean
}

export function StatusChart({ stats, isLoading }: StatusChartProps) {
  const chartData = Object.values(ReportStatus).map(status => ({
    name: STATUS_LABELS[status],
    value: stats?.byStatus[status] ?? 0,
    fill: STATUS_COLORS[status],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          Reports by Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-[250px] w-full' />
        ) : (
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={chartData}>
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
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
