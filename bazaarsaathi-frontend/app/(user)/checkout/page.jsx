'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import useCartStore from '@/store/useCartStore'
import useAuthStore from '@/store/useAuthStore'
import AddressCard from '@/components/user/AddressCard'
import AddressForm from '@/components/user/AddressForm'
import DiscountInput from '@/components/user/DiscountInput'
export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  const router      = useRouter()
  const user        = useAuthStore((state) => state.user)
  const token       = useAuthStore((state) => state.token)
  const initialized = useAuthStore((state) => state.initialized)
  const { items, clearCart } = useCartStore()

  // Always compute from items — prevents NaN and stale values
  const itemsTotal = items.reduce((sum, item) => {
    const price = item.product?.discountedPrice ?? item.product?.sellingPrice ?? 0
    return sum + price * item.quantity
  }, 0)

  const [addresses,       setAddresses]       = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [discount,        setDiscount]        = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [addressLoading,  setAddressLoading]  = useState(true)

  useEffect(() => {
    if (!initialized) return
    if (!token) {
      router.push('/login')
      return
    }
    if (items.length === 0) {
      router.push('/cart')
      return
    }
    fetchAddresses()
  }, [initialized, token])

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses')
      setAddresses(res.data.data)
      if (res.data.data.length > 0) {
        setSelectedAddress(res.data.data[0]._id)
      }
    } catch (err) {
      toast.error('Failed to load addresses.')
    } finally {
      setAddressLoading(false)
    }
  }

  const handleAddressAdded = (newAddress) => {
    setAddresses((prev) => [newAddress, ...prev])
    setSelectedAddress(newAddress._id)
    setShowAddressForm(false)
  }

  const couponDiscount = discount?.discountAmount ?? 0
  const finalTotal     = itemsTotal - couponDiscount

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/orders', {
        addressId:    selectedAddress,
        discountCode: discount?.code ?? undefined,
      })
      clearCart()
      toast.success('Order placed successfully! 🎉')
      router.push(`/orders/${res.data.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  if (!initialized) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="page-wrapper">
        <h1 className="font-heading text-2xl font-bold text-dark mb-6">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Address + Discount ─────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-dark">
                  📍 Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  {showAddressForm ? 'Cancel' : '+ Add New'}
                </button>
              </div>

              {showAddressForm && (
                <div className="mb-4">
                  <AddressForm onAdded={handleAddressAdded} />
                </div>
              )}

              {addressLoading ? (
                <div className="space-y-3">
                  {[1,2].map((i) => (
                    <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No addresses yet. Add one above.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr._id}
                      address={addr}
                      selectable
                      selected={selectedAddress === addr._id}
                      onSelect={() => setSelectedAddress(addr._id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Discount Code */}
            <div className="card p-5">
              <h2 className="font-heading font-bold text-dark mb-4">
                🎟️ Discount Code
              </h2>
              <DiscountInput
                cartTotal={itemsTotal}
                items={items}
                onApply={setDiscount}
                onRemove={() => setDiscount(null)}
              />
            </div>
          </div>

          {/* ── Right: Order Summary ──────────────────── */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h2 className="font-heading font-bold text-dark text-lg mb-4">
                Order Summary
              </h2>

              {/* Per item breakdown */}
              <div className="space-y-2 mb-4">
                {items.map((item) => {
                  const price = item.product?.discountedPrice
                    ?? item.product?.sellingPrice
                    ?? 0
                  return (
                    <div
                      key={item.product._id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-500 line-clamp-1 flex-1 mr-2">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-semibold text-dark shrink-0">
                        ₹{price * item.quantity}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dark">₹{itemsTotal}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="text-success font-semibold">FREE</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({discount.code})</span>
                    <span className="font-semibold">−₹{couponDiscount}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-dark">Total</span>
                  <span className="font-heading font-bold text-xl text-dark">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-sm text-gray-500">
                <span>💳</span>
                <span>Payment: Cash on Delivery</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="btn-primary w-full mt-4"
              >
                {loading ? 'Placing Order...' : `Place Order · ₹${finalTotal}`}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
