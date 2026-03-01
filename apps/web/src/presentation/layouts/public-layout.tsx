import { Outlet, useParams } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useCompanyBySlug } from '@/services/hooks/use-company'
import { Skeleton } from '@/presentation/components/ui/skeleton'

/**
 * Minimal layout for the public anonymous report submission page.
 * Shows the company name (fetched from the magic link slug) in the header.
 */
export function PublicLayout() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: company, isLoading } = useCompanyBySlug(slug)

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <header className='border-b border-border px-6 py-4'>
        <div className='mx-auto flex max-w-2xl items-center gap-2'>
          <ShieldAlert className='h-6 w-6 text-primary' />
          {isLoading ? (
            <Skeleton className='h-6 w-40' />
          ) : (
            <span className='text-lg font-semibold text-foreground'>
              {company?.name ?? 'Anonymous Report'}
            </span>
          )}
        </div>
      </header>
      <main className='mx-auto w-full max-w-2xl flex-1 px-6 py-8'>
        <Outlet />
      </main>
    </div>
  )
}
