import { useMutation, useQuery } from '@tanstack/react-query'
import { companyApi } from '@/services/api/company.api'
import { authKeys, companyKeys } from '@/lib/query-client'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { handleApiError } from '@/utils/error-handler'
import type { MembershipStatus } from '@/types'

export function useCreateCompany() {
  return useMutation({
    mutationFn: companyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
    onError: error =>
      handleApiError(error, { fallback: 'Failed to create company.' }),
  })
}

export function useJoinCompany() {
  return useMutation({
    mutationFn: companyApi.join,
    onError: error =>
      handleApiError(error, { fallback: 'Failed to join company.' }),
  })
}

export function useCompanyBySlug(slug: string) {
  return useQuery({
    queryKey: companyKeys.bySlug(slug),
    queryFn: () => companyApi.getBySlug(slug),
    enabled: !!slug,
  })
}

export function useMyCompany() {
  const hasCompany = useAuthStore(s => !!s.user?.companyId)

  return useQuery({
    queryKey: companyKeys.me(),
    queryFn: companyApi.getMyCompany,
    enabled: hasCompany,
  })
}

export function useMembers(status?: MembershipStatus) {
  return useQuery({
    queryKey: companyKeys.members(status),
    queryFn: () => companyApi.getMembers(status),
  })
}

export function useReviewMembership() {
  return useMutation({
    mutationFn: companyApi.reviewMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all })
    },
    onError: error =>
      handleApiError(error, { fallback: 'Failed to review membership.' }),
  })
}

export function useRotateLink() {
  return useMutation({
    mutationFn: companyApi.rotateLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.me() })
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
    onError: error =>
      handleApiError(error, { fallback: 'Failed to rotate link.' }),
  })
}
