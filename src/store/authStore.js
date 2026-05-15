import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, usersAPI } from '@/api/endpoints'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        if (get().isLoading) return
        set({ isLoading: true })
        try {
          const { data } = await authAPI.login({ email, password })
          // Use ref_ prefix — separate session from main app
          localStorage.setItem('ref_access_token', data.access)
          localStorage.setItem('ref_refresh_token', data.refresh)
          const { data: me } = await usersAPI.getMe()
          set({ user: me, isAuthenticated: true })
          return me
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          const refresh = localStorage.getItem('ref_refresh_token')
          if (refresh) await authAPI.logout({ refresh })
        } catch (_) {}
        localStorage.removeItem('ref_access_token')
        localStorage.removeItem('ref_refresh_token')
        set({ user: null, isAuthenticated: false })
      },

      refreshUser: async () => {
        try {
          const { data } = await usersAPI.getMe()
          set({ user: data })
          return data
        } catch (_) {}
      },

      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'nexcribe-ref-auth',   // separate from main app's 'nexcribe-auth'
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)

export default useAuthStore