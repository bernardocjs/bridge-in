import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MemberRole } from '@/types'
import type { UserProfile } from '@/types'

interface AuthState {
  token: string | null
  user: UserProfile | null
}

interface AuthActions {
  setToken: (token: string) => void
  setUser: (user: UserProfile) => void
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

export const selectIsAdmin = (s: AuthStore) => s.user?.role === MemberRole.ADMIN
