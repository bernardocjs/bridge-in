import { MemberRole } from '@prisma/client';

export interface AuthTokenResponse {
  accessToken: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string | null;
  companyId: string | null;
  role: MemberRole | null;
  company: {
    name: string;
    magicLinkSlug: string;
  } | null;
}
