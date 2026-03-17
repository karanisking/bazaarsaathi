'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import useAuthStore from '@/store/useAuthStore'
import useCartStore from '@/store/useCartStore'

export default function RegisterPage() {
  const router    = useRouter()
  const login     = useAuthStore((state) => state.login)
  const fetchCart = useCartStore((state) => state.fetchCart)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    if (!form.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
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
      const res = await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
      })
      const { token, user } = res.data.data

      await login(token, user)
      await fetchCart()

      toast.success(`Welcome to BazaarSathi, ${user.name}!`)
      router.push('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* Logo */}
    

      {/* Card */}
      <div className="card p-8">
        <h2 className="font-heading text-2xl font-bold text-dark mb-1">
          Create account 🛒
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Join BazaarSathi and start shopping
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={`input ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && (
              <p className="text-error text-xs mt-1">{errors.name}</p>
            )}
          </div>

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
              placeholder="Min 6 characters"
              className={`input ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && (
              <p className="text-error text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}