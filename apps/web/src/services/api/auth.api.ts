import { apiClient } from '@/lib/api-client'
import type {
  AuthTokenResponse,
  LoginInput,
  RegisterInput,
  UserProfile,
} from '@/types'

export const authApi = {
  login: (data: LoginInput) =>
    apiClient.post<AuthTokenResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterInput) =>
    apiClient.post<AuthTokenResponse>('/auth/register', data).then(r => r.data),

  getMe: () =>
    apiClient.get<Omit<UserProfile, 'role'>>('/auth/me').then(r => r.data),
}
