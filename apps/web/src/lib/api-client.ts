import axios from 'axios'
import { API_BASE_URL } from './constants'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: inject auth token ─────────────────────────────────
// We import the store lazily to avoid circular deps (store → apiClient → store)
apiClient.interceptors.request.use(config => {
  // Dynamic import of persisted state from localStorage to avoid importing
  // the Zustand store module directly (which would create a circular dep)
  const raw = localStorage.getItem('auth-storage')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch {
      // corrupted storage — ignore
    }
  }
  return config
})

// ── Response interceptor: handle 401 globally ──────────────────────────────
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      // Only redirect if not already on a public page
      const { pathname } = window.location
      if (
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/register') &&
        !pathname.startsWith('/report/')
      ) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
