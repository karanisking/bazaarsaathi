// Centralized auth/session handling
// Called by axios interceptor on 401

let isRedirecting = false  // prevents multiple redirects + toasts firing at once

export const handleUnauthorized = (isAdminContext = false) => {
  if (typeof window === 'undefined') return
  if (isRedirecting) return  // already handling — don't fire again

  // Check if we're already on a login page — no need to redirect again
  const path = window.location.pathname
  if (path.includes('/login')) return

  isRedirecting = true

  // Clear token
  localStorage.removeItem('token')

  const loginPath = isAdminContext ? '/admin/login' : '/login'

  // Show toast then redirect
  import('react-hot-toast').then(({ default: toast }) => {
    toast.error('Session expired. Please log in again.', { id: 'session-expired' })
  })

  setTimeout(() => {
    window.location.href = loginPath
    isRedirecting = false
  }, 1200)
}

export const clearAuthSilently = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
}

export const isAdminRoute = () => {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/admin')
}