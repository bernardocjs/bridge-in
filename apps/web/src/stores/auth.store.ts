import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { decodeJwtPayload } from '@/lib/decode-jwt'
import { MemberRole } from '@/types'
import type { UserProfile } from '@/types'

interface AuthState {
  token: string | null
  user: UserProfile | null
}

interface AuthActions {
  setToken: (token: string) => void
  setUser: (user: UserProfile) => void
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
      partialize: state => ({ token: state.token }),
    },
  ),
)

export const selectIsAuthenticated = (s: AuthStore) => !!s.token
export const selectHasCompany = (s: AuthStore) => !!s.user?.companyId

export const selectIsAdmin = (s: AuthStore) => {
  if (s.user?.role === MemberRole.ADMIN) return true
  if (s.token) {
    try {
      return decodeJwtPayload(s.token).role === MemberRole.ADMIN
    } catch {
      return false
    }
  }
  return false
}
