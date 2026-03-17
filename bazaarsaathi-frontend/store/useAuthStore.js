import { create } from 'zustand'
import api from '@/lib/axios'
import { clearAuthSilently } from '@/lib/middleware'

const useAuthStore = create((set) => ({
  user:        null,
  token:       null,
  initialized: false,

  login: async (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },

  // Runs on every page load — NEVER redirects or shows toast
  // If token is invalid → silently clears and continues as guest
  init: async () => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('token')

    if (!token) {
      set({ initialized: true })
      return
    }

    try {
      // _isInitRequest tells interceptor to skip 401 redirect
      const res = await api.get('/auth/me', {
        _isInitRequest: true,
      })
      set({ token, user: res.data.data, initialized: true })
    } catch (err) {
      // Silently clear — no toast, no redirect
      clearAuthSilently()
      set({ token: null, user: null, initialized: true })
    }
  },
}))

export default useAuthStore
