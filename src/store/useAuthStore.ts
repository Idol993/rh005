import { create } from 'zustand'
import type { UserRole, User } from '@/types'
import { mockUsers } from '@/mock/data'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (role: UserRole) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (role: UserRole) => {
    const user = mockUsers.find((u) => u.role === role)
    if (user) {
      set({ user, isAuthenticated: true })
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },
}))
