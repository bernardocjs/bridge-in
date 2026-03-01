import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  createCompanySchema,
  type CreateCompanyFormData,
} from '@/schemas/company.schemas'
import { useCreateCompany, useJoinCompany } from '@/services/hooks/use-company'
import { getApiErrorCode } from '@/utils/error-handler'
import { Routes } from '@/router/routes'
import { useAuthStore } from '@/stores/auth.store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/presentation/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/components/ui/form'
import { Input } from '@/presentation/components/ui/input'
import { Button } from '@/presentation/components/ui/button'
import { Clock } from 'lucide-react'

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const createCompany = useCreateCompany()
  const joinCompany = useJoinCompany()
  const [joinSlug, setJoinSlug] = useState('')
  const [pendingRequest, setPendingRequest] = useState(false)

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: '' },
  })

  const onCreateSubmit = (data: CreateCompanyFormData) => {
    createCompany.mutate(data, {
      onSuccess: () => {
        toast.success('Company created! You are the admin.')
        // Small delay to let /me refetch hydrate the store
        setTimeout(() => navigate(Routes.DASHBOARD), 300)
      },
    })
  }

  const onJoinSubmit = () => {
    if (!joinSlug.trim()) {
      toast.error('Please enter a magic link slug')
      return
    }

    joinCompany.mutate(joinSlug.trim(), {
      onSuccess: result => {
        if (result.status === 'PENDING') {
          setPendingRequest(true)
          toast.info('Join request sent! Waiting for admin approval.')
        } else {
          toast.success(`Joined ${result.companyName}!`)
          setTimeout(() => navigate(Routes.DASHBOARD), 300)
        }
      },
      onError: error => {
        // Toast is handled by the hook; only handle page-specific side effects
        const code = getApiErrorCode(error)
        if (code === 'MEMBERSHIP_PENDING') {
          setPendingRequest(true)
        }
      },
    })
  }

  // If user already submitted a join request
  if (pendingRequest) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center py-10 text-center'>
          <Clock className='mb-4 h-12 w-12 text-tag-warning' />
          <h3 className='text-lg font-semibold'>Request Pending</h3>
          <p className='mt-2 max-w-xs text-sm text-neutral'>
            Your join request has been submitted. An admin needs to approve it
            before you can access the company.
          </p>
          <Button
            variant='outline'
            className='mt-6'
            onClick={() => {
              useAuthStore.getState().logout()
              navigate(Routes.LOGIN)
            }}
          >
            Sign out and try later
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle className='text-xl'>Get Started</CardTitle>
        <CardDescription>
          {user?.name ? `Hi ${user.name}! ` : ''}Create a new company or join an
          existing one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='create'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='create'>Create Company</TabsTrigger>
            <TabsTrigger value='join'>Join Company</TabsTrigger>
          </TabsList>

          <TabsContent value='create' className='mt-4'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Acme Corp' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full'
                  disabled={createCompany.isPending}
                >
                  {createCompany.isPending ? 'Creating...' : 'Create Company'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value='join' className='mt-4 space-y-4'>
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
              onClick={onJoinSubmit}
            >
              {joinCompany.isPending ? 'Joining...' : 'Request to Join'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
