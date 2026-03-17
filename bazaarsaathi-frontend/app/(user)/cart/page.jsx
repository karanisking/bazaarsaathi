'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import useAuthStore from '@/store/useAuthStore'
import useCartStore from '@/store/useCartStore'
import CartItem from '@/components/user/CartItem'

export default function CartPage() {
  const router  = useRouter()
  const user    = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const { items, itemsTotal: _storeTotal, setCart, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)

  // Always compute from items — never trust stale store total
  const itemsTotal = items.reduce((sum, item) => {
    const price = item.product?.discountedPrice ?? item.product?.sellingPrice ?? 0
    return sum + price * item.quantity
  }, 0)

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity })
      const { items, itemsTotal } = res.data.data
      setCart(items, itemsTotal)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart.')
    }
  }

  const handleRemove = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`)
      const { items, itemsTotal } = res.data.data
      setCart(items, itemsTotal)
      toast.success('Item removed from cart.')
    } catch (err) {
      toast.error('Failed to remove item.')
    }
  }

  const handleClear = async () => {
    try {
      await api.delete('/cart/clear')
      clearCart()
      toast.success('Cart cleared.')
    } catch (err) {
      toast.error('Failed to clear cart.')
    }
  }

  // Wait for init before showing login gate
  if (!initialized) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="section text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="font-heading text-xl font-bold text-dark mb-2">
          Please login to view your cart
        </p>
        <Link href="/login" className="btn-primary inline-block mt-4">
          Login
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="section text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="font-heading text-xl font-bold text-dark mb-2">
          Your cart is empty
        </p>
        <p className="text-gray-400 text-sm mb-6">
          Add some products to get started
        </p>
        <Link href="/" className="btn-primary inline-block">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="page-wrapper">
        <h1 className="font-heading text-2xl font-bold text-dark mb-6">
          My Cart
          <span className="text-gray-400 font-normal text-lg ml-2">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Cart Items ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-end">
              <button
                onClick={handleClear}
                className="text-error text-sm font-semibold hover:underline"
              >
                Clear Cart
              </button>
            </div>

            {items.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* ── Order Summary ─────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h2 className="font-heading font-bold text-dark text-lg mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dark">
                    ₹{itemsTotal}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="text-success font-semibold">FREE</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-dark">Total</span>
                  <span className="font-heading font-bold text-xl text-dark">
                    ₹{itemsTotal}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="btn-primary w-full mt-5"
              >
                Proceed to Checkout →
              </button>

              <Link
                href="/"
                className="block text-center text-sm text-primary font-semibold mt-3 hover:underline"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}