import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30s — good balance between freshness and perf
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
