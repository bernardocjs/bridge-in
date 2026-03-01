import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createReportSchema,
  type CreateReportFormData,
} from '@/schemas/report.schemas'
import { useCompanyBySlug } from '@/services/hooks/use-company'
import { useCreateAnonymousReport } from '@/services/hooks/use-report'
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
import { ReportNotFound } from './components/report-not-found'
import { ReportSubmitted } from './components/report-submitted'

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
      },
    )
  }

  if (!companyLoading && isError) {
    return (
      <Card className='mx-auto max-w-md border-border/40 shadow-lg'>
        <ReportNotFound />
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card className='mx-auto max-w-md border-border/40 shadow-lg'>
        <ReportSubmitted
          companyName={company?.name}
          onReset={() => {
            setSubmitted(false)
            form.reset()
          }}
        />
      </Card>
    )
  }

  return (
    <Card className='border-border/40 shadow-lg'>
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
