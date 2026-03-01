import { apiClient } from '@/lib/api-client'
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

export const reportApi = {
  createAnonymous: (params: { slug: string; data: CreateReportInput }) =>
    apiClient
      .post<ReportSummaryResponse>(
        `/reports/anonymous/${params.slug}`,
        params.data,
      )
      .then(r => r.data),

  getAll: (filters: ReportFilters) =>
    apiClient
      .get<PaginatedResponse<ReportListItem>>('/reports', { params: filters })
      .then(r => r.data),

  getById: (id: string) =>
    apiClient.get<ReportDetailResponse>(`/reports/${id}`).then(r => r.data),

  update: (params: { id: string; data: UpdateReportInput }) =>
    apiClient
      .patch<ReportDetailResponse>(`/reports/${params.id}`, params.data)
      .then(r => r.data),

  getDashboard: () =>
    apiClient
      .get<DashboardStatsResponse>('/reports/dashboard')
      .then(r => r.data),
}
