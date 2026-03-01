import { Button } from '@/presentation/components/ui/button'
import { CardContent } from '@/presentation/components/ui/card'
import { Clock } from 'lucide-react'

interface PendingRequestCardProps {
  onSignOut: () => void
}

export function PendingRequestCard({ onSignOut }: PendingRequestCardProps) {
  return (
    <CardContent className='flex flex-col items-center py-12 text-center'>
      <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-tag-warning/10'>
        <Clock className='h-8 w-8 animate-pulse text-tag-warning' />
      </div>
      <h3 className='text-lg font-semibold'>Request Pending</h3>
      <p className='mt-2 max-w-xs text-sm text-neutral'>
        Your join request has been submitted. An admin needs to approve it
        before you can access the company.
      </p>
      <Button variant='outline' className='mt-6' onClick={onSignOut}>
        Sign out and try later
      </Button>
    </CardContent>
  )
}
