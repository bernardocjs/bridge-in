import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { decodeJwtPayload } from '@/lib/decode-jwt'
import type { MemberRole } from '@/types'
import type { UserProfile } from '@/types'

interface AuthState {
  token: string | null
  user: UserProfile | null
}

interface AuthActions {
  setToken: (token: string) => void
  setUser: (user: UserProfile) => void
  /** Manually override role when we know it (e.g. after creating a company ⇒ ADMIN) */
  setRole: (role: MemberRole) => void
  logout: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      token: null,
      user: null,
      setToken: token => set({ token }),
      setUser: user => set({ user }),
      setRole: role =>
        set(state => (state.user ? { user: { ...state.user, role } } : {})),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist the token — user profile is re-fetched from /me on mount
      partialize: state => ({ token: state.token }),
    },
  ),
)

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectIsAuthenticated = (s: AuthStore) => !!s.token
export const selectHasCompany = (s: AuthStore) => !!s.user?.companyId

/**
 * Determine admin role: prefer user.role (set explicitly after company creation),
 * fall back to decoding the JWT payload for the role claim.
 */
export const selectIsAdmin = (s: AuthStore) => {
  if (s.user?.role === 'ADMIN') return true
  if (s.token) {
    try {
      return decodeJwtPayload(s.token).role === 'ADMIN'
    } catch {
      return false
    }
  }
  return false
}
