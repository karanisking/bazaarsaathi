'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import useAuthStore from '@/store/useAuthStore'
import useCartStore from '@/store/useCartStore'
import Image from 'next/image'

export default function LoginPage() {
  const router    = useRouter()
  const login     = useAuthStore((state) => state.login)
  const fetchCart = useCartStore((state) => state.fetchCart)

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.email)    newErrors.email    = 'Email is required'
    if (!form.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const { token, user } = res.data.data

      await login(token, user)
      await fetchCart()

      toast.success(`Welcome back, ${user.name}!`)

      // Redirect based on role
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

     

      {/* Card */}
      <div className="card p-8">
        <h2 className="font-heading text-2xl font-bold text-dark mb-1">
          Welcome back 👋
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Login to bazaarsaathi and continue shopping your favorite products!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && (
              <p className="text-error text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`input ${errors.password ? 'input-error' : ''}`}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}