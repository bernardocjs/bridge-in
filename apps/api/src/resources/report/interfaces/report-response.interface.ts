import { ReportPriority, ReportStatus } from '@prisma/client';
import { PaginatedResponse } from '../../../common/helpers/pagination';

export interface ReportSummaryResponse {
  id: string;
  title: string;
  status: ReportStatus;
  createdAt: Date;
}

export interface ReportListItem {
  id: string;
  title: string;
  status: ReportStatus;
  priority: ReportPriority;
  reporterContact: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportListResponse = PaginatedResponse<ReportListItem>;

export interface ReportDetailResponse {
  id: string;
  title: string;
  content: string;
  status: ReportStatus;
  priority: ReportPriority;
  reporterContact: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStatsResponse {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}
