import { Outlet, useParams } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useCompanyBySlug } from '@/services/hooks/use-company'
import { Skeleton } from '@/presentation/components/ui/skeleton'

export function PublicLayout() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: company, isLoading } = useCompanyBySlug(slug)

  return (
    <div className='flex min-h-screen flex-col bg-gradient-to-br from-neutral-100 via-background to-primary-50/20 dark:from-neutral-900 dark:via-background dark:to-primary-900/5'>
      <header className='border-b border-border/60 bg-card/80 px-6 py-4 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-2xl items-center gap-2.5'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
            <ShieldAlert className='h-5 w-5 text-primary' />
          </div>
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
