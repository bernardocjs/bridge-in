import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schemas'
import { useRegister } from '@/services/hooks/use-auth'
import { Routes } from '@/router/routes'
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
import { Button } from '@/presentation/components/ui/button'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = (data: RegisterFormData) => {
    register.mutate(
      { ...data, name: data.name || undefined },
      {
        onSuccess: () => {
          navigate(Routes.ONBOARDING)
        },
      },
    )
  }

  return (
    <Card className='border-border/40 shadow-xl'>
      <CardHeader className='pb-2 text-center'>
        <CardTitle className='text-xl'>Create an account</CardTitle>
        <CardDescription>
          Sign up to start reporting or managing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className='text-neutral'>(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='John Doe'
                      autoComplete='name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='you@example.com'
                      autoComplete='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='At least 8 characters'
                      autoComplete='new-password'
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
              disabled={register.isPending}
            >
              {register.isPending ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Form>

        <p className='mt-4 text-center text-sm text-neutral'>
          Already have an account?{' '}
          <Link
            to={Routes.LOGIN}
            className='font-medium text-primary hover:underline'
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
