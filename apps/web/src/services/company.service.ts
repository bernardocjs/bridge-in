import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { authKeys, companyKeys } from '@/lib/constants'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { MemberRole, MembershipStatus } from '@/types'
import type {
  CompanyMeResponse,
  CompanyPublicResponse,
  CompanyResponse,
  CreateCompanyInput,
  MagicLinkResponse,
  MembershipRequestResponse,
  MembershipResponse,
  ReviewMembershipInput,
} from '@/types'

// ── API calls ──────────────────────────────────────────────────────────────

const createCompanyApi = (data: CreateCompanyInput) =>
  apiClient.post<CompanyResponse>('/companies', data).then(r => r.data)

const joinCompanyApi = (slug: string) =>
  apiClient
    .post<MembershipRequestResponse>(`/companies/join/${slug}`)
    .then(r => r.data)

const getCompanyBySlugApi = (slug: string) =>
  apiClient
    .get<CompanyPublicResponse>(`/companies/magic/${slug}`)
    .then(r => r.data)

const getMyCompanyApi = () =>
  apiClient.get<CompanyMeResponse>('/companies/me').then(r => r.data)

const getMembersApi = (status?: MembershipStatus) =>
  apiClient
    .get<MembershipResponse[]>('/companies/members', {
      params: status ? { status } : undefined,
    })
    .then(r => r.data)

const reviewMembershipApi = ({
  membershipId,
  data,
}: {
  membershipId: string
  data: ReviewMembershipInput
}) =>
  apiClient
    .patch<MembershipResponse>(`/companies/members/${membershipId}`, data)
    .then(r => r.data)

const rotateLinkApi = () =>
  apiClient.patch<MagicLinkResponse>('/companies/rotate-link').then(r => r.data)

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useCreateCompany() {
  const setRole = useAuthStore.getState().setRole

  return useMutation({
    mutationFn: createCompanyApi,
    onSuccess: () => {
      // Creator is always ADMIN — set locally so the UI updates immediately
      setRole(MemberRole.ADMIN)
      // Refetch /me to get the new companyId + company info
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}

export function useJoinCompany() {
  return useMutation({
    mutationFn: joinCompanyApi,
  })
}

export function useCompanyBySlug(slug: string) {
  return useQuery({
    queryKey: companyKeys.bySlug(slug),
    queryFn: () => getCompanyBySlugApi(slug),
    enabled: !!slug,
  })
}

export function useMyCompany() {
  const hasCompany = useAuthStore(s => !!s.user?.companyId)

  return useQuery({
    queryKey: companyKeys.me(),
    queryFn: getMyCompanyApi,
    enabled: hasCompany,
  })
}

export function useMembers(status?: MembershipStatus) {
  return useQuery({
    queryKey: companyKeys.members(status),
    queryFn: () => getMembersApi(status),
  })
}

export function useReviewMembership() {
  return useMutation({
    mutationFn: reviewMembershipApi,
    onSuccess: () => {
      // Invalidate all member queries regardless of filter
      queryClient.invalidateQueries({ queryKey: companyKeys.all })
    },
  })
}

export function useRotateLink() {
  return useMutation({
    mutationFn: rotateLinkApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.me() })
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}
