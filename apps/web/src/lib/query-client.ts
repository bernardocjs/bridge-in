import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
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
}
