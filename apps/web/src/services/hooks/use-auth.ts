import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi } from '@/services/api/auth.api'
import { authKeys } from '@/lib/query-client'
import { queryClient } from '@/lib/query-client'
import { decodeJwtPayload } from '@/lib/decode-jwt'
import { useAuthStore } from '@/stores/auth.store'
import { handleApiError } from '@/utils/error-handler'
import type { MemberRole, UserProfile } from '@/types'

export function useLogin() {
  const { setToken } = useAuthStore.getState()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ accessToken }) => {
      setToken(accessToken)
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
    onError: error => handleApiError(error, { fallback: 'Login failed.' }),
  })
}

export function useRegister() {
  const { setToken } = useAuthStore.getState()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ accessToken }) => {
      setToken(accessToken)
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
    onError: error =>
      handleApiError(error, { fallback: 'Registration failed.' }),
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
      const profile = await authApi.getMe()

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
