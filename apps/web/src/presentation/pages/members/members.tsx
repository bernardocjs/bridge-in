import { useState } from 'react'
import { toast } from 'sonner'
import { useMembers, useReviewMembership } from '@/services/hooks/use-company'
import { MembershipStatus } from '@/types'
import { PageHeader } from '@/presentation/components/shared/page-header'
import { MagicLinkActions } from './components/magic-link-actions'
import { MembersFilter } from './components/members-filter'
import { MembersTable } from './components/members-table'

export function MembersPage() {
  const [statusFilter, setStatusFilter] = useState<
    MembershipStatus | undefined
  >()
  const { data: members, isLoading } = useMembers(statusFilter)
  const reviewMembership = useReviewMembership()

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
      },
    )
  }

  return (
    <div>
      <PageHeader
        title='Members'
        description='Manage company members and membership requests'
        actions={<MagicLinkActions />}
      />

      <MembersFilter value={statusFilter} onChange={setStatusFilter} />

      <MembersTable
        members={members}
        isLoading={isLoading}
        onReview={handleReview}
        reviewIsPending={reviewMembership.isPending}
      />
    </div>
  )
}
