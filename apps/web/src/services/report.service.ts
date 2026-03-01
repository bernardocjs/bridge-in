import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { reportKeys } from '@/lib/constants'
import { queryClient } from '@/lib/query-client'
import type {
  CreateReportInput,
  DashboardStatsResponse,
  PaginatedResponse,
  ReportDetailResponse,
  ReportFilters,
  ReportListItem,
  ReportSummaryResponse,
  UpdateReportInput,
} from '@/types'

// ── API calls ──────────────────────────────────────────────────────────────

const createAnonymousReportApi = ({
  slug,
  data,
}: {
  slug: string
  data: CreateReportInput
}) =>
  apiClient
    .post<ReportSummaryResponse>(`/reports/anonymous/${slug}`, data)
    .then(r => r.data)

const getReportsApi = (filters: ReportFilters) =>
  apiClient
    .get<PaginatedResponse<ReportListItem>>('/reports', { params: filters })
    .then(r => r.data)

const getReportByIdApi = (id: string) =>
  apiClient.get<ReportDetailResponse>(`/reports/${id}`).then(r => r.data)

const updateReportApi = ({
  id,
  data,
}: {
  id: string
  data: UpdateReportInput
}) =>
  apiClient
    .patch<ReportDetailResponse>(`/reports/${id}`, data)
    .then(r => r.data)

const getDashboardApi = () =>
  apiClient.get<DashboardStatsResponse>('/reports/dashboard').then(r => r.data)

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useCreateAnonymousReport() {
  return useMutation({
    mutationFn: createAnonymousReportApi,
  })
}

export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => getReportsApi(filters),
    placeholderData: prev => prev, // Keep previous data while fetching new page
  })
}

export function useReportById(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => getReportByIdApi(id),
    enabled: !!id,
  })
}

export function useUpdateReport() {
  return useMutation({
    mutationFn: updateReportApi,
    onSuccess: data => {
      // Update detail cache directly to avoid extra fetch
      queryClient.setQueryData(reportKeys.detail(data.id), data)
      // Invalidate list (status/priority might have changed)
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: getDashboardApi,
  })
}
