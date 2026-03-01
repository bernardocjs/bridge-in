import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useReports } from '@/services/hooks/use-report'
import { ReportStatus, ReportPriority } from '@/types'
import type { ReportFilters } from '@/types'
import { PageHeader } from '@/presentation/components/shared/page-header'
import { StatusBadge } from '@/presentation/components/shared/status-badge'
import { PriorityBadge } from '@/presentation/components/shared/priority-badge'
import { EmptyState } from '@/presentation/components/shared/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  FileText,
} from 'lucide-react'

const ALL_VALUE = '__all__'

export function ReportListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 10,
  })

  const { data, isLoading } = useReports(filters)
  const reports = data?.data ?? []
  const meta = data?.meta

  const updateFilter = (
    key: keyof ReportFilters,
    value: string | undefined,
  ) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const hasActiveFilters = !!filters.status || !!filters.priority

  return (
    <div>
      <PageHeader
        title='Reports'
        description='All anonymous reports submitted to your company'
      />

      {/* Filters */}
      <div className='mb-6 rounded-xl border border-border/60 bg-card p-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 dark:bg-neutral-700'>
            <SlidersHorizontal className='h-4 w-4' />
          </div>
          <div className='flex flex-1 flex-wrap items-center gap-3'>
            <div className='space-y-1'>
              <label className='text-xs font-medium tracking-wider text-neutral-400 uppercase'>
                Status
              </label>
              <Select
                value={filters.status ?? ALL_VALUE}
                onValueChange={v =>
                  updateFilter(
                    'status',
                    v === ALL_VALUE ? undefined : (v as ReportStatus),
                  )
                }
              >
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='All Statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All Statuses</SelectItem>
                  {Object.values(ReportStatus).map(s => (
                    <SelectItem key={s} value={s}>
                      {s.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <label className='text-xs font-medium tracking-wider text-neutral-400 uppercase'>
                Priority
              </label>
              <Select
                value={filters.priority ?? ALL_VALUE}
                onValueChange={v =>
                  updateFilter(
                    'priority',
                    v === ALL_VALUE ? undefined : (v as ReportPriority),
                  )
                }
              >
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='All Priorities' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All Priorities</SelectItem>
                  {Object.values(ReportPriority).map(p => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className='flex items-end'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='mt-auto gap-1 text-neutral-400 hover:text-foreground'
                  onClick={() => setFilters({ page: 1, limit: 10 })}
                >
                  <X className='h-3.5 w-3.5' /> Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className='mt-3 flex items-center gap-2 border-t border-border/40 pt-3'>
            <span className='text-xs text-neutral-400'>Active:</span>
            {filters.status && (
              <span className='inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary-900/30 dark:text-primary-400'>
                {filters.status.replace('_', ' ')}
                <button
                  onClick={() => updateFilter('status', undefined)}
                  className='ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary-100 dark:hover:bg-primary-800/50'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            )}
            {filters.priority && (
              <span className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue dark:bg-blue-50 dark:text-blue'>
                {filters.priority}
                <button
                  onClick={() => updateFilter('priority', undefined)}
                  className='ml-0.5 rounded-full p-0.5 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-600'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-14 w-full' />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FileText className='h-12 w-12' />}
          title='No reports found'
          description={
            hasActiveFilters
              ? 'Try adjusting your filters'
              : 'No reports have been submitted yet'
          }
        />
      ) : (
        <>
          <div className='overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[40%]'>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className='text-right'>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(report => (
                  <TableRow
                    key={report.id}
                    className='cursor-pointer'
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <TableCell className='font-medium'>
                      {report.title}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={report.priority} />
                    </TableCell>
                    <TableCell className='text-right text-sm text-neutral'>
                      {formatDistanceToNow(new Date(report.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className='mt-4 flex items-center justify-between'>
              <p className='text-sm text-neutral'>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={meta.page <= 1}
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      page: (prev.page ?? 1) - 1,
                    }))
                  }
                >
                  <ChevronLeft className='mr-1 h-4 w-4' /> Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={meta.page >= meta.totalPages}
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      page: (prev.page ?? 1) + 1,
                    }))
                  }
                >
                  Next <ChevronRight className='ml-1 h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
