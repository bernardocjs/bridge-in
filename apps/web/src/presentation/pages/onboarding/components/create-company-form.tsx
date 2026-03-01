import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  createCompanySchema,
  type CreateCompanyFormData,
} from '@/schemas/company.schemas'
import { useCreateCompany } from '@/services/hooks/use-company'
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

export function CreateCompanyForm() {
  const createCompany = useCreateCompany()

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: '' },
  })

  const onSubmit = (data: CreateCompanyFormData) => {
    createCompany.mutate(data, {
      onSuccess: () => {
        toast.success('Company created! You are the admin.')
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
  )
}
