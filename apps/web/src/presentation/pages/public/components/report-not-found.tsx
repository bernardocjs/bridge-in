import { CardContent } from '@/presentation/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export function ReportNotFound() {
  return (
    <CardContent className='flex flex-col items-center py-12 text-center'>
      <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-tag-warning/10'>
        <AlertTriangle className='h-8 w-8 text-tag-warning' />
      </div>
      <h3 className='text-lg font-semibold'>Link Not Found</h3>
      <p className='mt-2 text-sm text-neutral'>
        This report link is invalid or has been rotated. Please contact the
        company for an updated link.
      </p>
    </CardContent>
  )
}
