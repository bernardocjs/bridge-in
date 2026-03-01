import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import axios from 'axios'
import {
  createReportSchema,
  type CreateReportFormData,
} from '@/schemas/report.schemas'
import { useCompanyBySlug } from '@/services/company.service'
import { useCreateAnonymousReport } from '@/services/report.service'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/components/ui/form'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Button } from '@/presentation/components/ui/button'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

export function AnonymousReportPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const {
    data: company,
    isLoading: companyLoading,
    isError,
  } = useCompanyBySlug(slug)
  const createReport = useCreateAnonymousReport()
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<CreateReportFormData>({
    resolver: zodResolver(createReportSchema),
    defaultValues: { title: '', content: '', reporterContact: '' },
  })

  const onSubmit = (data: CreateReportFormData) => {
    createReport.mutate(
      {
        slug,
        data: {
          ...data,
          reporterContact: data.reporterContact || undefined,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true)
        },
        onError: error => {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
              toast.error(
                'Too many submissions. Please wait a moment and try again.',
              )
            } else if (
              error.response?.data?.code === 'COMPANY_INVALID_MAGIC_LINK'
            ) {
              toast.error('This report link is no longer valid.')
            } else {
              toast.error(
                error.response?.data?.message ?? 'Failed to submit report',
              )
            }
          }
        },
      },
    )
  }

  // Invalid or expired slug
  if (!companyLoading && isError) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardContent className='flex flex-col items-center py-10 text-center'>
          <AlertTriangle className='mb-4 h-12 w-12 text-tag-warning' />
          <h3 className='text-lg font-semibold'>Link Not Found</h3>
          <p className='mt-2 text-sm text-neutral'>
            This report link is invalid or has been rotated. Please contact the
            company for an updated link.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Success state
  if (submitted) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardContent className='flex flex-col items-center py-10 text-center'>
          <CheckCircle2 className='mb-4 h-12 w-12 text-success-600' />
          <h3 className='text-lg font-semibold'>Report Submitted</h3>
          <p className='mt-2 max-w-xs text-sm text-neutral'>
            Your anonymous report has been securely submitted to{' '}
            <strong>{company?.name}</strong>. Thank you for speaking up.
          </p>
          <Button
            variant='outline'
            className='mt-6'
            onClick={() => {
              setSubmitted(false)
              form.reset()
            }}
          >
            Submit another report
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit an Anonymous Report</CardTitle>
        <CardDescription>
          Your identity is completely anonymous. The company will not know who
          submitted this report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Brief summary of the issue'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Provide details about the issue you want to report...'
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reporterContact'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contact Email{' '}
                    <span className='text-neutral'>(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='Only if you want to be contacted back'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='w-full'
              disabled={createReport.isPending}
            >
              {createReport.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
