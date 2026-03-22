'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/useAuthStore'
import useCartStore from '@/store/useCartStore'

export default function Navbar() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const clearCart = useCartStore((state) => state.clearCart)
  const count = useCartStore((state) => state.count)

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    clearCart()
    toast.success('Logged out successfully.')
    router.push('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/search?q=${encodeURIComponent(search.trim())}`)
    setSearch('')
    setSearchOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="page-wrapper">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <img src="/logo.png" alt="BazaarSathi" className="h-10 w-auto" />
            <span className="font-heading font-bold text-xl text-dark">
              Bazaar<span className="text-primary">Sasthi</span>
            </span>
          </Link>

          {/* ── Search Bar (desktop) ─────────────────────── */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-primary transition-all"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groceries, vegetables, fruits..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-white text-dark placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-500 transition-colors"
            >
              Search
            </button>
          </form>

          {/* ── Right Actions ────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Search icon mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              🔍
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
            <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-dark"
  >
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-dark">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-gray-400 text-xs">▾</span>
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-dark text-sm">{user.name}</p>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    </div>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        📊 Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-primary-50 hover:text-primary transition-colors"
                    >
                      📦 My Orders
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-primary-50 hover:text-primary transition-colors"
                    >
                      👤 Profile
                    </Link>
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={() => { handleLogout(); setDropOpen(false) }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 transition-colors w-full text-left"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-outline py-2 px-4 text-sm">
                  Login
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm hidden sm:block">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* ── Mobile Search ─────────────────────────────── */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form
              onSubmit={handleSearch}
              className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-primary transition-all"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2.5 text-sm outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2.5 text-sm font-semibold"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* ── Mobile Menu ───────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary-50 text-sm font-semibold text-dark"
            >
              🏠 Home
            </Link>
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary-50 text-sm font-semibold text-dark"
            >
              🛒 Cart {count > 0 && <span className="badge-primary">{count}</span>}
            </Link>
            <Link
              href="/orders"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary-50 text-sm font-semibold text-dark"
            >
              📦 My Orders
            </Link>
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="btn-outline py-2 px-4 text-sm flex-1 text-center">
                  Login
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm flex-1 text-center">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}