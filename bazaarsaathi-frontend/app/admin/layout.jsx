'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'
import Sidebar from '@/components/admin/Sidebar'
import TopBar from '@/components/admin/Topbar'

export default function AdminLayout({ children }) {
  const router      = useRouter()
  const pathname    = usePathname()
  const user        = useAuthStore((state) => state.user)
  const token       = useAuthStore((state) => state.token)
  const initialized = useAuthStore((state) => state.initialized)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Wait until init() has finished before making any redirect decision
    if (!initialized) return

    if (isLoginPage) return

    // Not logged in → admin login
    if (!token) {
      router.push('/admin/login')
      return
    }

    // Logged in but not admin → home
    if (user && user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [initialized, token, user, isLoginPage])

  // Show nothing while init is running — prevents flash
  if (!initialized && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-500 to-primary-900 flex items-center justify-center p-4">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}