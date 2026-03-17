'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import useAuthStore from '@/store/useAuthStore'

export default function AdminLoginPage() {
  const router = useRouter()
  const login  = useAuthStore((state) => state.login)
  const token  = useAuthStore((state) => state.token)
  const user   = useAuthStore((state) => state.user)

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  // Already logged in as admin → redirect to dashboard
  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [token, user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const { token, user } = res.data.data

      // Block non-admin from using this login page
      if (user.role !== 'ADMIN') {
        toast.error('Access denied. This login is for admins only.')
        return
      }

      await login(token, user)
      toast.success(`Welcome back, ${user.name}!`)
      router.push('/admin/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-btn">
          <span className="text-3xl">🛒</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-white">
          Bazaar<span className="text-primary">Sathi</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
      </div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
        <h2 className="font-heading text-xl font-bold text-white mb-1">
          Admin Login 🔐
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Restricted access — admins only
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@bazaarsathi.com"
              className={`w-full bg-white/10 border-2 rounded-xl px-4 py-2.5
                text-white placeholder-gray-500 outline-none
                focus:border-primary transition-all
                ${errors.email ? 'border-error' : 'border-white/20'}`}
            />
            {errors.email && (
              <p className="text-error text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter admin password"
              className={`w-full bg-white/10 border-2 rounded-xl px-4 py-2.5
                text-white placeholder-gray-500 outline-none
                focus:border-primary transition-all
                ${errors.password ? 'border-error' : 'border-white/20'}`}
            />
            {errors.password && (
              <p className="text-error text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
          </button>

        </form>

        {/* Hint */}
        <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-gray-400 text-xs text-center">
            Not an admin?{' '}
            <a href="/" className="text-primary font-semibold hover:underline">
              Go to Store →
            </a>
          </p>
        </div>
      </div>

      {/* Default credentials hint for dev */}
      <p className="text-center text-gray-500 text-xs mt-6">
        Default: admin@store.com / admin123
      </p>
    </div>
  )
}