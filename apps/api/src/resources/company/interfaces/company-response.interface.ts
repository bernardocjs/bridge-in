import { MemberRole, MembershipStatus } from '@prisma/client';

export interface CompanyResponse {
  id: string;
  name: string;
  magicLinkSlug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyPublicResponse {
  name: string;
}

export interface MagicLinkResponse {
  id: string;
  magicLinkSlug: string;
}

export interface CompanyMeResponse {
  id: string;
  name: string;
  magicLinkSlug: string;
  createdAt: Date;
}

export interface MembershipResponse {
  id: string;
  userId: string;
  companyId: string;
  role: MemberRole;
  status: MembershipStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface MembershipRequestResponse {
  id: string;
  status: MembershipStatus;
  companyName: string;
}
