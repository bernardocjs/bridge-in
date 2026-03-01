import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  useMembers,
  useReviewMembership,
  useMyCompany,
  useRotateLink,
} from '@/services/company.service'
import { MembershipStatus } from '@/types'
import { PageHeader } from '@/presentation/components/shared/page-header'
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
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog'
import { CheckCircle2, XCircle, RefreshCw, Copy, Users } from 'lucide-react'
import { cn } from '@/utils'

const ALL_VALUE = '__all__'

const statusBadgeStyles: Record<MembershipStatus, string> = {
  [MembershipStatus.PENDING]:
    'bg-tag-warning/10 text-tag-warning border-tag-warning/20',
  [MembershipStatus.APPROVED]:
    'bg-success/10 text-success-600 border-success/20',
  [MembershipStatus.REJECTED]: 'bg-error/10 text-error-600 border-error/20',
}

export function MembersPage() {
  const [statusFilter, setStatusFilter] = useState<
    MembershipStatus | undefined
  >()
  const { data: members, isLoading } = useMembers(statusFilter)
  const { data: company } = useMyCompany()
  const reviewMembership = useReviewMembership()
  const rotateLink = useRotateLink()
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false)

  const handleReview = (
    membershipId: string,
    status: MembershipStatus.APPROVED | MembershipStatus.REJECTED,
  ) => {
    reviewMembership.mutate(
      { membershipId, data: { status } },
      {
        onSuccess: () => {
          toast.success(
            status === MembershipStatus.APPROVED
              ? 'Member approved'
              : 'Member rejected',
          )
        },
        onError: () => toast.error('Failed to review membership'),
      },
    )
  }

  const handleRotateLink = () => {
    rotateLink.mutate(undefined, {
      onSuccess: () => {
        toast.success('Magic link rotated! Old links are now invalid.')
        setRotateDialogOpen(false)
      },
      onError: () => toast.error('Failed to rotate link'),
    })
  }

  const magicLink = company?.magicLinkSlug
    ? `${window.location.origin}/report/${company.magicLinkSlug}`
    : null

  return (
    <div>
      <PageHeader
        title='Members'
        description='Manage company members and membership requests'
        actions={
          <div className='flex gap-2'>
            {magicLink && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  navigator.clipboard.writeText(magicLink)
                  toast.success('Magic link copied!')
                }}
              >
                <Copy className='mr-1 h-4 w-4' /> Copy Link
              </Button>
            )}
            <Dialog open={rotateDialogOpen} onOpenChange={setRotateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <RefreshCw className='mr-1 h-4 w-4' /> Rotate Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rotate Magic Link?</DialogTitle>
                  <DialogDescription>
                    This will invalidate the current magic link. Anyone with the
                    old link won't be able to submit reports or request to join.
                    A new link will be generated.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setRotateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={handleRotateLink}
                    disabled={rotateLink.isPending}
                  >
                    {rotateLink.isPending ? 'Rotating...' : 'Rotate'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filter */}
      <div className='mb-4'>
        <Select
          value={statusFilter ?? ALL_VALUE}
          onValueChange={v =>
            setStatusFilter(
              v === ALL_VALUE ? undefined : (v as MembershipStatus),
            )
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Members</SelectItem>
            {Object.values(MembershipStatus).map(s => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      ) : !members || members.length === 0 ? (
        <EmptyState
          icon={<Users className='h-12 w-12' />}
          title='No members found'
          description='Share your magic link to invite people'
        />
      ) : (
        <div className='rounded-md border border-border'>
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
                        {member.user.name ?? 'Unnamed'}
                      </p>
                      <p className='text-xs text-neutral'>
                        {member.user.email}
                      </p>
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
                      className={cn(
                        'text-xs',
                        statusBadgeStyles[member.status],
                      )}
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
                          disabled={reviewMembership.isPending}
                          onClick={() =>
                            handleReview(member.id, MembershipStatus.APPROVED)
                          }
                        >
                          <CheckCircle2 className='mr-1 h-4 w-4' /> Approve
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-error-600 hover:bg-error/10'
                          disabled={reviewMembership.isPending}
                          onClick={() =>
                            handleReview(member.id, MembershipStatus.REJECTED)
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
      )}
    </div>
  )
}
