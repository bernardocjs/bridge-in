import type { MonthlyCountResponse } from '@/types'
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
} from 'recharts'

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  return `${MONTH_LABELS[m]} ${year.slice(2)}`
}

interface MonthlyChartProps {
  data: MonthlyCountResponse | undefined
  isLoading: boolean
}

export function MonthlyChart({ data, isLoading }: MonthlyChartProps) {
  const chartData = (data ?? []).map(item => ({
    name: formatMonth(item.month),
    count: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          Reports — Last 12 Months
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
              <Bar
                dataKey='count'
                name='Reports'
                fill='var(--blue-500)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
