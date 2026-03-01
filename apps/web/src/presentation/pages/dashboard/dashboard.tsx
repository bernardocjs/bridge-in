import { useDashboard } from '@/services/hooks/use-report'
import { PageHeader } from '@/presentation/components/shared/page-header'
import { StatCards } from './components/stat-cards'
import { StatusChart } from './components/status-chart'
import { PriorityChart } from './components/priority-chart'

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboard()

  return (
    <div>
      <PageHeader
        title='Dashboard'
        description='Overview of reports in your company'
      />

      <StatCards stats={stats} isLoading={isLoading} />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <StatusChart stats={stats} isLoading={isLoading} />
        <PriorityChart stats={stats} isLoading={isLoading} />
      </div>
    </div>
  )
}
