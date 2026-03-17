'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

export default function DiscountInput({ cartTotal, items, onApply, onRemove }) {
  const [code,    setCode]    = useState('')
  const [applied, setApplied] = useState(null)
  const [loading, setLoading] = useState(false)

  // Extract both productIds AND categoryIds properly
  const productIds  = items.map((i) => i.product._id)
  const categoryIds = items
    .map((i) => i.product.category?._id ?? i.product.category)
    .filter(Boolean)

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      toast.error('Enter a discount code.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/discounts/apply', {
        code: trimmed,
        cartTotal,
        productIds,
        categoryIds,   // ← now properly extracted
      })
      const data = res.data.data
      setApplied(data)
      onApply(data)
      toast.success(`Code applied! You save ₹${data.discountAmount}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setApplied(null)
    setCode('')
    onRemove()
    toast.success('Discount code removed.')
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div>
          <p className="font-semibold text-green-600 text-sm">
            ✅ {applied.code} applied!
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            You save ₹{applied.discountAmount}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="text-error text-sm font-semibold hover:underline"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}   // ← NO toUpperCase here
        placeholder="Enter discount code"
        className="input flex-1"                     // ← removed uppercase CSS
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
      />
      <button
        onClick={handleApply}
        disabled={loading}
        className="btn-primary px-5 shrink-0"
      >
        {loading ? '...' : 'Apply'}
      </button>
    </div>
  )
}