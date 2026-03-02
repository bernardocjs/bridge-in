import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const handleAuthError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    useAuthStore.getState().logout()
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleAuthError,
  }),
  mutationCache: new MutationCache({
    onError: handleAuthError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

export const companyKeys = {
  all: ['company'] as const,
  me: () => [...companyKeys.all, 'me'] as const,
  bySlug: (slug: string) => [...companyKeys.all, 'slug', slug] as const,
  members: (status?: string) =>
    [...companyKeys.all, 'members', { status }] as const,
}

export const reportKeys = {
  all: ['reports'] as const,
  list: (filters: Record<string, unknown> | object) =>
    [...reportKeys.all, 'list', filters] as const,
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
  dashboard: () => [...reportKeys.all, 'dashboard'] as const,
  monthlyCount: () => [...reportKeys.all, 'monthly-count'] as const,
}
