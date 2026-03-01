import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useReportById, useUpdateReport } from '@/services/hooks/use-report'
import { ReportStatus, ReportPriority } from '@/types'
import { PageHeader } from '@/presentation/components/shared/page-header'
import { StatusBadge } from '@/presentation/components/shared/status-badge'
import { PriorityBadge } from '@/presentation/components/shared/priority-badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Separator } from '@/presentation/components/ui/separator'
import { Button } from '@/presentation/components/ui/button'
import { ArrowLeft, Mail, Calendar } from 'lucide-react'

export function ReportDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: report, isLoading } = useReportById(id)
  const updateReport = useUpdateReport()

  const handleStatusChange = (status: ReportStatus) => {
    updateReport.mutate(
      { id, data: { status } },
      {
        onSuccess: () => toast.success('Status updated'),
      },
    )
  }

  const handlePriorityChange = (priority: ReportPriority) => {
    updateReport.mutate(
      { id, data: { priority } },
      {
        onSuccess: () => toast.success('Priority updated'),
      },
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-[400px] w-full' />
      </div>
    )
  }

  if (!report) {
    return (
      <div className='py-16 text-center'>
        <p className='text-neutral'>Report not found</p>
        <Button variant='link' onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Button
        variant='ghost'
        size='sm'
        className='mb-4 gap-1 text-neutral'
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className='h-4 w-4' /> Back
      </Button>

      <PageHeader title={report.title} />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main content */}
        <Card className='lg:col-span-2'>
          <CardContent className='pt-6'>
            <p className='text-sm leading-relaxed whitespace-pre-wrap text-foreground'>
              {report.content}
            </p>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className='space-y-4'>
          {/* Status & Priority controls */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Properties</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='mb-1.5 block text-xs font-medium text-neutral'>
                  Status
                </label>
                <Select
                  value={report.status}
                  onValueChange={v => handleStatusChange(v as ReportStatus)}
                  disabled={updateReport.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ReportStatus).map(s => (
                      <SelectItem key={s} value={s}>
                        {s.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='mb-1.5 block text-xs font-medium text-neutral'>
                  Priority
                </label>
                <Select
                  value={report.priority}
                  onValueChange={v => handlePriorityChange(v as ReportPriority)}
                  disabled={updateReport.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ReportPriority).map(p => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Meta info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex items-center gap-2 text-neutral'>
                <Calendar className='h-4 w-4' />
                <span>Created {format(new Date(report.createdAt), 'PPp')}</span>
              </div>
              <div className='flex items-center gap-2 text-neutral'>
                <Calendar className='h-4 w-4' />
                <span>Updated {format(new Date(report.updatedAt), 'PPp')}</span>
              </div>

              {report.reporterContact && (
                <>
                  <Separator />
                  <div className='flex items-center gap-2 text-neutral'>
                    <Mail className='h-4 w-4' />
                    <span>{report.reporterContact}</span>
                  </div>
                </>
              )}

              <Separator />
              <div className='flex items-center gap-2'>
                <span className='text-neutral'>Status:</span>
                <StatusBadge status={report.status} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-neutral'>Priority:</span>
                <PriorityBadge priority={report.priority} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
