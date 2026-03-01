import type { ReportPriority, ReportStatus } from './common'

export interface ReportSummaryResponse {
  id: string
  title: string
  status: ReportStatus
  createdAt: string
}

export interface ReportListItem {
  id: string
  title: string
  status: ReportStatus
  priority: ReportPriority
  createdAt: string
}

export interface ReportDetailResponse {
  id: string
  title: string
  content: string
  status: ReportStatus
  priority: ReportPriority
  reporterContact: string | null
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface DashboardStatsResponse {
  total: number
  byStatus: Record<ReportStatus, number>
  byPriority: Record<ReportPriority, number>
}

export interface CreateReportInput {
  title: string
  content: string
  reporterContact?: string
}

export interface UpdateReportInput {
  status?: ReportStatus
  priority?: ReportPriority
}

export interface ReportFilters {
  page?: number
  limit?: number
  status?: ReportStatus
  priority?: ReportPriority
}
