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
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

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
      <div className='mb-4 flex items-center gap-3'>
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
            <SelectValue placeholder='Status' />
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
            <SelectValue placeholder='Priority' />
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

        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setFilters({ page: 1, limit: 10 })}
          >
            <X className='mr-1 h-4 w-4' /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title='No reports found'
          description={
            hasActiveFilters
              ? 'Try adjusting your filters'
              : 'No reports have been submitted yet'
          }
        />
      ) : (
        <>
          <div className='rounded-md border border-border'>
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
                    className='cursor-pointer hover:bg-neutral-50'
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
