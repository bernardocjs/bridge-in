import { apiClient } from '@/lib/api-client'
import type {
  CompanyMeResponse,
  CompanyPublicResponse,
  CompanyResponse,
  CreateCompanyInput,
  MagicLinkResponse,
  MembershipRequestResponse,
  MembershipResponse,
  MembershipStatus,
  ReviewMembershipInput,
} from '@/types'

export const companyApi = {
  create: (data: CreateCompanyInput) =>
    apiClient.post<CompanyResponse>('/companies', data).then(r => r.data),

  join: (slug: string) =>
    apiClient
      .post<MembershipRequestResponse>(`/companies/join/${slug}`)
      .then(r => r.data),

  getBySlug: (slug: string) =>
    apiClient
      .get<CompanyPublicResponse>(`/companies/magic/${slug}`)
      .then(r => r.data),

  getMyCompany: () =>
    apiClient.get<CompanyMeResponse>('/companies/me').then(r => r.data),

  getMembers: (status?: MembershipStatus) =>
    apiClient
      .get<MembershipResponse[]>('/companies/members', {
        params: status ? { status } : undefined,
      })
      .then(r => r.data),

  reviewMembership: (params: {
    membershipId: string
    data: ReviewMembershipInput
  }) =>
    apiClient
      .patch<MembershipResponse>(
        `/companies/members/${params.membershipId}`,
        params.data,
      )
      .then(r => r.data),

  rotateLink: () =>
    apiClient
      .patch<MagicLinkResponse>('/companies/rotate-link')
      .then(r => r.data),
}
