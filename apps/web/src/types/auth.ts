import type { MemberRole } from './common'

export interface AuthTokenResponse {
  accessToken: string
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  companyId: string | null
  role: MemberRole | null
  company: {
    name: string
    magicLinkSlug: string
  } | null
}

/** Payload encoded inside the JWT issued by the backend */
export interface JwtPayload {
  userId: string
  email: string
  companyId: string | null
  role: MemberRole | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name?: string
}
