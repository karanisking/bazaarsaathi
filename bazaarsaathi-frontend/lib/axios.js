import axios from 'axios'
import { handleUnauthorized, isAdminRoute } from '@/lib/middleware'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !err.config?._isInitRequest  // skip silent init calls
    ) {
      handleUnauthorized(isAdminRoute())
    }
    return Promise.reject(err)
  }
)

export default api