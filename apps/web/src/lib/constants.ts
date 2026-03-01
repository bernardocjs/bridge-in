// Read from Vite env with sensible fallback for local development
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

// ── React Query key factories ──────────────────────────────────────────────
// Convention: each domain exposes a key factory so invalidation is type-safe
// and co-located with the data it describes.

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
