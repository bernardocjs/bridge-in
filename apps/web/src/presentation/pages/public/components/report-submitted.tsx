import { CardContent } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface ReportSubmittedProps {
  companyName: string | undefined
  onReset: () => void
}

export function ReportSubmitted({
  companyName,
  onReset,
}: ReportSubmittedProps) {
  return (
    <CardContent className='flex flex-col items-center py-12 text-center'>
      <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/10'>
        <CheckCircle2 className='h-8 w-8 text-success-600' />
      </div>
      <h3 className='text-lg font-semibold'>Report Submitted</h3>
      <p className='mt-2 max-w-xs text-sm text-neutral'>
        Your anonymous report has been securely submitted to{' '}
        <strong>{companyName}</strong>. Thank you for speaking up.
      </p>
      <Button variant='outline' className='mt-6' onClick={onReset}>
        Submit another report
      </Button>
    </CardContent>
  )
}
