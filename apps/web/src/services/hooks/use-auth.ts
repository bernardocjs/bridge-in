import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi } from '@/services/api/auth.api'
import { authKeys } from '@/lib/query-client'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { handleApiError } from '@/utils/error-handler'
import type { UserProfile } from '@/types'

export function useLogin() {
  const { setToken } = useAuthStore.getState()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ accessToken }) => {
      queryClient.removeQueries({ queryKey: authKeys.me() })
      setToken(accessToken)
    },
    onError: error => handleApiError(error, { fallback: 'Login failed.' }),
  })
}
export function useLogout() {
  return () => {
    queryClient.removeQueries({ queryKey: authKeys.me() })
    useAuthStore.getState().logout()
  }
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

export function useMe() {
  const token = useAuthStore(s => s.token)
  const setUser = useAuthStore(s => s.setUser)

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const profile = await authApi.getMe()

      const enrichedProfile: UserProfile = {
        ...profile,
        role: profile.role ?? null,
      }
      setUser(enrichedProfile)
      return enrichedProfile
    },
    enabled: !!token,
    retry: false,
    staleTime: 60 * 1000,
  })
}
