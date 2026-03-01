import type { MemberRole, MembershipStatus } from './common'

export interface CompanyResponse {
  id: string
  name: string
  magicLinkSlug: string
  createdAt: string
  updatedAt: string
}

export interface CompanyPublicResponse {
  name: string
}

export interface CompanyMeResponse {
  id: string
  name: string
  magicLinkSlug: string
  createdAt: string
}

export interface MembershipRequestResponse {
  id: string
  status: MembershipStatus
  companyName: string
}

export interface MembershipResponse {
  id: string
  userId: string
  user: {
    email: string
    name: string | null
  }
  role: MemberRole
  status: MembershipStatus
  requestedAt: string
  reviewedAt: string | null
}

export interface MagicLinkResponse {
  id: string
  magicLinkSlug: string
}

export interface CreateCompanyInput {
  name: string
}

export interface ReviewMembershipInput {
  status: MembershipStatus.APPROVED | MembershipStatus.REJECTED
}
