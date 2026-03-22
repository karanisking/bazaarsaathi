'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/useAuthStore'
import useCartStore from '@/store/useCartStore'

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/admin/dashboard',  icon: '📊' },
  { label: 'Products',   href: '/admin/products',   icon: '📦' },
  { label: 'Categories', href: '/admin/categories', icon: '🗂️' },
  { label: 'Orders',     href: '/admin/orders',     icon: '🧾' },
  { label: 'Discounts',  href: '/admin/discounts',  icon: '🎟️' },
  { label: 'Reviews',    href: '/admin/reviews',    icon: '⭐' },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const logout    = useAuthStore((state) => state.logout)
  const clearCart = useCartStore((state) => state.clearCart)
  const user      = useAuthStore((state) => state.user)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    clearCart()
    toast.success('Logged out.')
    router.push('/admin/login')
  }

  return (
    <aside className={`bg-dark text-white flex flex-col transition-all duration-300 shrink-0
      ${collapsed ? 'w-16' : 'w-56'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <Link href="/admin/dashboard" className="font-heading font-bold text-lg">
            Bazaar<span className="text-primary">Saathi</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-auto"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm font-semibold">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-white font-semibold text-sm truncate">
              {user.name}
            </p>
            <p className="text-gray-400 text-xs truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400
            hover:bg-red-500/20 hover:text-red-400 transition-all w-full"
        >
          <span className="text-lg shrink-0">🚪</span>
          {!collapsed && (
            <span className="text-sm font-semibold">Logout</span>
          )}
        </button>
      </div>
    </aside>
  )
}