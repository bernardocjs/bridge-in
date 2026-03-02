import { createBrowserRouter } from 'react-router-dom'
import { Routes } from './routes'
import { GuestGuard, ProtectedRoute } from './guards'

import { AuthLayout } from '@/presentation/layouts/auth-layout'
import { AppLayout } from '@/presentation/layouts/app-layout'
import { PublicLayout } from '@/presentation/layouts/public-layout'

import { LoginPage } from '@/presentation/pages/auth/login'
import { RegisterPage } from '@/presentation/pages/auth/register'
import { OnboardingPage } from '@/presentation/pages/onboarding/onboarding'
import { DashboardPage } from '@/presentation/pages/dashboard/dashboard'
import { ReportListPage } from '@/presentation/pages/reports/report-list'
import { ReportDetailPage } from '@/presentation/pages/reports/report-detail'
import { MembersPage } from '@/presentation/pages/members/members'
import { AnonymousReportPage } from '@/presentation/pages/public/anonymous-report'

const router = createBrowserRouter([
  {
    path: Routes.ANONYMOUS_REPORT,
    element: <PublicLayout />,
    children: [{ index: true, element: <AnonymousReportPage /> }],
  },

  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: Routes.LOGIN, element: <LoginPage /> },
          { path: Routes.REGISTER, element: <RegisterPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: Routes.ONBOARDING,
        element: <AuthLayout />,
        children: [{ index: true, element: <OnboardingPage /> }],
      },
    ],
  },

  {
    element: <ProtectedRoute requireCompany />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: Routes.DASHBOARD, element: <DashboardPage /> },
          { path: Routes.REPORTS, element: <ReportListPage /> },
          { path: Routes.REPORT_DETAIL, element: <ReportDetailPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute requireCompany requireAdmin />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: Routes.MEMBERS, element: <MembersPage /> }],
      },
    ],
  },
])

export { router }
