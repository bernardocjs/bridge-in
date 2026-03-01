import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useJoinCompany } from '@/services/hooks/use-company'
import { getApiErrorCode } from '@/utils/error-handler'
import { Routes } from '@/router/routes'
import { Input } from '@/presentation/components/ui/input'
import { Button } from '@/presentation/components/ui/button'

interface JoinCompanyFormProps {
  onPendingRequest: () => void
}

export function JoinCompanyForm({ onPendingRequest }: JoinCompanyFormProps) {
  const navigate = useNavigate()
  const joinCompany = useJoinCompany()
  const [joinSlug, setJoinSlug] = useState('')

  const handleSubmit = () => {
    if (!joinSlug.trim()) {
      toast.error('Please enter a magic link slug')
      return
    }

    joinCompany.mutate(joinSlug.trim(), {
      onSuccess: result => {
        if (result.status === 'PENDING') {
          onPendingRequest()
          toast.info('Join request sent! Waiting for admin approval.')
        } else {
          toast.success(`Joined ${result.companyName}!`)
          setTimeout(() => navigate(Routes.DASHBOARD), 300)
        }
      },
      onError: error => {
        const code = getApiErrorCode(error)
        if (code === 'MEMBERSHIP_PENDING') {
          onPendingRequest()
        }
      },
    })
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Magic Link Slug</label>
        <Input
          placeholder='e.g. demo-company-2024'
          value={joinSlug}
          onChange={e => setJoinSlug(e.target.value)}
        />
        <p className='text-xs text-neutral'>
          Ask a company admin for the magic link slug
        </p>
      </div>
      <Button
        className='w-full'
        disabled={joinCompany.isPending}
        onClick={handleSubmit}
      >
        {joinCompany.isPending ? 'Joining...' : 'Request to Join'}
      </Button>
    </div>
  )
}
