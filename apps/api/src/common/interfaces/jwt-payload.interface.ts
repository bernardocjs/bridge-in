import { MemberRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  companyId: string | null;
  role: MemberRole | null;
}
