import { ReportPriority } from '@/types'
import type { DashboardStatsResponse } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const PRIORITY_COLORS: Record<ReportPriority, string> = {
  [ReportPriority.LOW]: 'var(--neutral-400)',
  [ReportPriority.MEDIUM]: 'var(--blue-500)',
  [ReportPriority.HIGH]: 'var(--tag-warning)',
  [ReportPriority.CRITICAL]: 'var(--error-600)',
}

const PRIORITY_LABELS: Record<ReportPriority, string> = {
  [ReportPriority.LOW]: 'Low',
  [ReportPriority.MEDIUM]: 'Medium',
  [ReportPriority.HIGH]: 'High',
  [ReportPriority.CRITICAL]: 'Critical',
}

interface PriorityChartProps {
  stats: DashboardStatsResponse | undefined
  isLoading: boolean
}

export function PriorityChart({ stats, isLoading }: PriorityChartProps) {
  const chartData = Object.values(ReportPriority).map(priority => ({
    name: PRIORITY_LABELS[priority],
    value: stats?.byPriority[priority] ?? 0,
    fill: PRIORITY_COLORS[priority],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          Reports by Priority
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-[250px] w-full' />
        ) : (
          <ResponsiveContainer width='100%' height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey='value'
              >
                {chartData.map((entry, i) => (
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
  )
}
