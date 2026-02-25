export interface JwtPayload {
  userId: string;
  email: string;
  companyId: string | null;
}
