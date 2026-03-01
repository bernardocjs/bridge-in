import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { authKeys } from '@/lib/constants'
import { queryClient } from '@/lib/query-client'
import { decodeJwtPayload } from '@/lib/decode-jwt'
import { useAuthStore } from '@/stores/auth.store'
import type {
  AuthTokenResponse,
  LoginInput,
  RegisterInput,
  UserProfile,
  MemberRole,
} from '@/types'

// ── API calls (pure, testable) ─────────────────────────────────────────────

const loginApi = (data: LoginInput) =>
  apiClient.post<AuthTokenResponse>('/auth/login', data).then(r => r.data)

const registerApi = (data: RegisterInput) =>
  apiClient.post<AuthTokenResponse>('/auth/register', data).then(r => r.data)

const getMeApi = () =>
  apiClient.get<Omit<UserProfile, 'role'>>('/auth/me').then(r => r.data)

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setToken } = useAuthStore.getState()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: ({ accessToken }) => {
      setToken(accessToken)
      // Immediately fetch the user profile to hydrate the store
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}

export function useRegister() {
  const { setToken } = useAuthStore.getState()

  return useMutation({
    mutationFn: registerApi,
    onSuccess: ({ accessToken }) => {
      setToken(accessToken)
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}

/**
 * Fetches /auth/me and hydrates Zustand store.
 * Only runs when there's a persisted token. The /me response doesn't include
 * `role`, so we supplement it by decoding the JWT payload.
 */
export function useMe() {
  const token = useAuthStore(s => s.token)
  const setUser = useAuthStore(s => s.setUser)

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const profile = await getMeApi()

      // Derive role from JWT since /me doesn't return it
      let role: MemberRole | null = null
      if (token) {
        try {
          role = decodeJwtPayload(token).role
        } catch {
          /* ignore bad token */
        }
      }

      const enrichedProfile: UserProfile = { ...profile, role }
      setUser(enrichedProfile)
      return enrichedProfile
    },
    enabled: !!token,
    retry: false,
    staleTime: 60 * 1000, // 1min — profile changes infrequently
  })
}
