import { formatDistanceToNow } from 'date-fns'
import { MembershipStatus } from '@/types'
import type { MembershipResponse } from '@/types'
import { EmptyState } from '@/presentation/components/shared/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { CheckCircle2, XCircle, Users } from 'lucide-react'
import { cn } from '@/utils'

const statusBadgeStyles: Record<MembershipStatus, string> = {
  [MembershipStatus.PENDING]:
    'bg-tag-warning/10 text-tag-warning border-tag-warning/20',
  [MembershipStatus.APPROVED]:
    'bg-success/10 text-success-600 border-success/20',
  [MembershipStatus.REJECTED]: 'bg-error/10 text-error-600 border-error/20',
}

interface MembersTableProps {
  members: MembershipResponse[] | undefined
  isLoading: boolean
  onReview: (
    id: string,
    status: MembershipStatus.APPROVED | MembershipStatus.REJECTED,
  ) => void
  reviewIsPending: boolean
}

export function MembersTable({
  members,
  isLoading,
  onReview,
  reviewIsPending,
}: MembersTableProps) {
  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-14 w-full' />
        ))}
      </div>
    )
  }

  if (!members || members.length === 0) {
    return (
      <EmptyState
        icon={<Users className='h-12 w-12' />}
        title='No members found'
        description='Share your magic link to invite people'
      />
    )
  }

  return (
    <div className='overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map(member => (
            <TableRow key={member.id}>
              <TableCell>
                <div>
                  <p className='font-medium'>
                    {member.user?.name ?? 'Unknown'}
                  </p>
                  <p className='text-xs text-neutral'>{member.user?.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant='secondary' className='text-xs'>
                  {member.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant='outline'
                  className={cn('text-xs', statusBadgeStyles[member.status])}
                >
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell className='text-sm text-neutral'>
                {formatDistanceToNow(new Date(member.requestedAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className='text-right'>
                {member.status === MembershipStatus.PENDING && (
                  <div className='flex justify-end gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='text-success-600 hover:bg-success/10'
                      disabled={reviewIsPending}
                      onClick={() =>
                        onReview(member.id, MembershipStatus.APPROVED)
                      }
                    >
                      <CheckCircle2 className='mr-1 h-4 w-4' /> Approve
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='text-error-600 hover:bg-error/10'
                      disabled={reviewIsPending}
                      onClick={() =>
                        onReview(member.id, MembershipStatus.REJECTED)
                      }
                    >
                      <XCircle className='mr-1 h-4 w-4' /> Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
