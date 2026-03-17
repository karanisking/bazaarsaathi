'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

const ALL_STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']

export default function OrderStatusUpdater({ orderId, currentStatus, onUpdated }) {
  const [selected, setSelected] = useState(currentStatus)
  const [loading,  setLoading]  = useState(false)

  const currentIdx = ALL_STATUSES.indexOf(currentStatus)

  const handleUpdate = async () => {
    if (selected === currentStatus) {
      toast.error('Select a different status.')
      return
    }
    setLoading(true)
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: selected })
      toast.success(`Status updated to "${selected}".`)
      onUpdated?.(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((s, i) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            disabled={i < currentIdx}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
              disabled:opacity-30 disabled:cursor-not-allowed
              ${selected === s
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 text-dark hover:border-primary'
              }`}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={handleUpdate}
        disabled={loading || selected === currentStatus}
        className="btn-primary px-6 disabled:opacity-40"
      >
        {loading ? 'Updating...' : 'Update Status'}
      </button>
    </div>
  )
}