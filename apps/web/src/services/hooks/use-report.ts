import { useMutation, useQuery } from '@tanstack/react-query'
import { reportApi } from '@/services/api/report.api'
import { reportKeys } from '@/lib/query-client'
import { queryClient } from '@/lib/query-client'
import { handleApiError } from '@/utils/error-handler'
import type { ReportFilters } from '@/types'

export function useCreateAnonymousReport() {
  return useMutation({
    mutationFn: reportApi.createAnonymous,
    onError: error =>
      handleApiError(error, { fallback: 'Failed to submit report.' }),
  })
}

export function useReports(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => reportApi.getAll(filters),
    placeholderData: prev => prev,
  })
}

export function useReportById(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportApi.getById(id),
    enabled: !!id,
  })
}

export function useUpdateReport() {
  return useMutation({
    mutationFn: reportApi.update,
    onSuccess: data => {
      queryClient.setQueryData(reportKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
    onError: error =>
      handleApiError(error, { fallback: 'Failed to update report.' }),
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: reportApi.getDashboard,
  })
}
