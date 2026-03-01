import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/services/hooks/use-auth'
import { Routes } from '@/router/routes'
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
import { PendingRequestCard } from './components/pending-request-card'
import { CreateCompanyForm } from './components/create-company-form'
import { JoinCompanyForm } from './components/join-company-form'

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const logout = useLogout()
  const [pendingRequest, setPendingRequest] = useState(false)

  if (pendingRequest) {
    return (
      <Card className='border-border/40 shadow-xl'>
        <PendingRequestCard
          onSignOut={() => {
            logout()
            navigate(Routes.LOGIN)
          }}
        />
      </Card>
    )
  }

  return (
    <Card className='border-border/40 shadow-xl'>
      <CardHeader className='pb-2 text-center'>
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
            <CreateCompanyForm />
          </TabsContent>

          <TabsContent value='join' className='mt-4'>
            <JoinCompanyForm onPendingRequest={() => setPendingRequest(true)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
