import { createBrowserRouter } from 'react-router-dom'
import { Routes } from './routes'
import { AuthGuard, GuestGuard, CompanyGuard, AdminGuard } from './guards'

// Layouts
import { AuthLayout } from '@/presentation/layouts/auth-layout'
import { AppLayout } from '@/presentation/layouts/app-layout'
import { PublicLayout } from '@/presentation/layouts/public-layout'

// Pages — lazy-loaded via dynamic import would be ideal for large apps,
// but with ~8 pages the bundle is small enough to import directly. KISS.
import { LoginPage } from '@/presentation/pages/auth/login'
import { RegisterPage } from '@/presentation/pages/auth/register'
import { OnboardingPage } from '@/presentation/pages/onboarding/onboarding'
import { DashboardPage } from '@/presentation/pages/dashboard/dashboard'
import { ReportListPage } from '@/presentation/pages/reports/report-list'
import { ReportDetailPage } from '@/presentation/pages/reports/report-detail'
import { MembersPage } from '@/presentation/pages/members/members'
import { AnonymousReportPage } from '@/presentation/pages/public/anonymous-report'

const router = createBrowserRouter([
  // ── Public: anonymous report submission ──────────────────────────────
  {
    path: Routes.ANONYMOUS_REPORT,
    element: <PublicLayout />,
    children: [{ index: true, element: <AnonymousReportPage /> }],
  },

  // ── Guest-only: login / register ────────────────────────────────────
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

  // ── Authenticated: onboarding (no company yet) ──────────────────────
  {
    element: <AuthGuard />,
    children: [
      {
        path: Routes.ONBOARDING,
        element: <AuthLayout />,
        children: [{ index: true, element: <OnboardingPage /> }],
      },

      // ── Authenticated + has company ───────────────────────────────
      {
        element: <CompanyGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: Routes.DASHBOARD, element: <DashboardPage /> },
              { path: Routes.REPORTS, element: <ReportListPage /> },
              { path: Routes.REPORT_DETAIL, element: <ReportDetailPage /> },

              // ── Admin-only ────────────────────────────────────────
              {
                element: <AdminGuard />,
                children: [{ path: Routes.MEMBERS, element: <MembersPage /> }],
              },
            ],
          },
        ],
      },
    ],
  },
])

export { router }
