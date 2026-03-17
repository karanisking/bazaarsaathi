'use client'
import { useState, useEffect } from 'react'
import React from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import DiscountForm from '@/components/admin/DiscountForm'

export default function AdminDiscountsPage() {
  const [discounts,  setDiscounts]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId,  setEditingId]  = useState(null)

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/discounts')
      setDiscounts(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDiscounts() }, [])

  const handleCreated = (saved) => {
    setDiscounts((prev) => [saved, ...prev])
    setShowCreate(false)
  }

  const handleUpdated = (saved) => {
    setDiscounts((prev) => prev.map((d) => d._id === saved._id ? saved : d))
    setEditingId(null)
  }

  const handleToggle = async (id, current) => {
    try {
      const res = await api.put(`/discounts/${id}`, { isActive: !current })
      setDiscounts((prev) => prev.map((d) => d._id === id ? res.data.data : d))
      toast.success(`Discount ${!current ? 'activated' : 'deactivated'}.`)
    } catch (err) {
      toast.error('Failed to update.')
    }
  }

  const handleFirstOrderToggle = async (id, current) => {
    try {
      const res = await api.put(`/discounts/${id}`, { firstOrderOnly: !current })
      setDiscounts((prev) => prev.map((d) => d._id === id ? res.data.data : d))
    } catch (err) {
      toast.error('Failed to update.')
    }
  }

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete discount "${code}"?`)) return
    try {
      await api.delete(`/discounts/${id}`)
      setDiscounts((prev) => prev.filter((d) => d._id !== id))
      toast.success('Discount deleted.')
    } catch (err) {
      toast.error('Failed to delete.')
    }
  }

  // Small toggle pill component
  const Toggle = ({ value, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
        value ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
        value ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  )

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-dark">
            Discount Codes
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {discounts.length} code{discounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(!showCreate)
            setEditingId(null)
          }}
          className="btn-primary"
        >
          {showCreate ? '✕ Cancel' : '+ Add Discount'}
        </button>
      </div>

      {/* ── Create Form ───────────────────────────────── */}
      {showCreate && (
        <div className="card p-6 border-2 border-primary-100">
          <h2 className="font-heading font-bold text-dark mb-5">
            New Discount Code
          </h2>
          <DiscountForm
            onSaved={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* ── Table ─────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex gap-4 p-4 border-b border-gray-50"
              >
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded flex-1" />
              </div>
            ))}
          </div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎟️</p>
            <p className="text-gray-400 text-sm">No discount codes yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary mt-4 inline-block text-sm"
            >
              Create First Code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-500">Code</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Discount</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Min Order</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Max Cap</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Usage</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Expires</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">First Order</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Active</th>
                  <th className="px-4 py-3 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <React.Fragment key={d._id}>
                    {/* ── Main row ───────────────────── */}
                    <tr
                      className={`border-b border-gray-50 transition-colors ${
                        editingId === d._id ? 'bg-primary-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-dark tracking-wider text-sm">
                          {d.code}
                        </span>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-dark">
                            {d.discountType === 'percentage'
                              ? `${d.discountValue}%`
                              : `₹${d.discountValue}`
                            }
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                            d.discountType === 'percentage'
                              ? 'bg-blue-50 text-blue-500'
                              : 'bg-orange-50 text-orange-500'
                          }`}>
                            {d.discountType === 'percentage' ? '%' : 'flat'}
                          </span>
                        </div>
                      </td>

                      {/* Min Order */}
                      <td className="px-4 py-3 text-gray-500">
                        {d.minOrderValue > 0 ? `₹${d.minOrderValue}` : '—'}
                      </td>

                      {/* Max Cap */}
                      <td className="px-4 py-3 text-gray-500">
                        {d.maxDiscountAmount ? `₹${d.maxDiscountAmount}` : '—'}
                      </td>

                      {/* Usage with progress */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-dark text-xs font-semibold">
                            {d.usedCount}/{d.usageLimit}
                          </span>
                          <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${Math.min(100, (d.usedCount / d.usageLimit) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3">
                        <span className={`text-xs ${
                          new Date(d.expiryDate) < new Date()
                            ? 'text-error font-semibold'
                            : 'text-gray-400'
                        }`}>
                          {new Date(d.expiryDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* First Order toggle */}
                      <td className="px-4 py-3">
                        <Toggle
                          value={d.firstOrderOnly}
                          onChange={() => handleFirstOrderToggle(d._id, d.firstOrderOnly)}
                        />
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-3">
                        <Toggle
                          value={d.isActive}
                          onChange={() => handleToggle(d._id, d.isActive)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditingId(editingId === d._id ? null : d._id)
                              setShowCreate(false)
                            }}
                            className="text-primary text-xs font-semibold hover:underline"
                          >
                            {editingId === d._id ? 'Close' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDelete(d._id, d.code)}
                            className="text-error text-xs font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Inline edit row ─────────────── */}
                    {editingId === d._id && (
                      <tr key={`edit-${d._id}`}>
                        <td
                          colSpan={9}
                          className="px-6 py-6 bg-gray-50 border-b border-gray-100"
                        >
                          <DiscountForm
                            editData={d}
                            onSaved={handleUpdated}
                            onCancel={() => setEditingId(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}