'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

const EMPTY = {
  code:              '',
  discountType:      'percentage',
  discountValue:     '',
  maxDiscountAmount: '',
  minOrderValue:     '',
  expiryDate:        '',
  usageLimit:        '',
  firstOrderOnly:    false,
}

export default function DiscountForm({ onSaved, onCancel, editData }) {
  const isEdit = !!editData

  const [form, setForm] = useState(isEdit ? {
    code:              editData.code              ?? '',
    discountType:      editData.discountType      ?? 'percentage',
    discountValue:     editData.discountValue     ?? '',
    maxDiscountAmount: editData.maxDiscountAmount ?? '',
    minOrderValue:     editData.minOrderValue     ?? '',
    expiryDate:        editData.expiryDate?.slice(0, 10) ?? '',
    usageLimit:        editData.usageLimit        ?? '',
    firstOrderOnly:    editData.firstOrderOnly    ?? false,
  } : EMPTY)

  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!isEdit && !form.code) e.code = 'Code is required'
    if (!form.discountValue)   e.discountValue = 'Value is required'
    if (form.discountType === 'percentage') {
      const val = Number(form.discountValue)
      if (val < 1)   e.discountValue = 'Minimum 1%'
      if (val > 100) e.discountValue = 'Cannot exceed 100%'
    }
    if (!form.expiryDate) e.expiryDate = 'Expiry date is required'
    if (!form.usageLimit) e.usageLimit = 'Usage limit is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload = {
        discountType:      form.discountType,
        discountValue:     Number(form.discountValue),
        expiryDate:        form.expiryDate,
        usageLimit:        Number(form.usageLimit),
        minOrderValue:     form.minOrderValue     ? Number(form.minOrderValue)     : 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        firstOrderOnly:    form.firstOrderOnly,
      }
      if (!isEdit) {
        payload.code = form.code.toUpperCase().trim()
      }
      const res = isEdit
        ? await api.put(`/discounts/${editData._id}`, payload)
        : await api.post('/discounts', payload)
      toast.success(isEdit ? 'Discount updated.' : 'Discount created.')
      onSaved?.(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save discount.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={isEdit ? '' : ''}>
      {isEdit && (
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono font-bold text-primary text-lg tracking-wider">
            {editData.code}
          </span>
          <span className="text-gray-400 text-sm">— editing</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {/* Code — only on create */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Code
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="SAVE20"
                className={`input ${errors.code ? 'input-error' : ''}`}
              />
              {errors.code && (
                <p className="text-error text-xs mt-1">{errors.code}</p>
              )}
            </div>
          )}

          {/* Type — only on create */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                Type
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="input"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
          )}

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Value
              {form.discountType === 'percentage' && (
                <span className="text-gray-400 font-normal ml-1 text-xs">(1–100)</span>
              )}
            </label>
            <input
              type="number"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              placeholder={form.discountType === 'percentage' ? '20' : '100'}
              min="1"
              max={form.discountType === 'percentage' ? '100' : undefined}
              className={`input ${errors.discountValue ? 'input-error' : ''}`}
            />
            {errors.discountValue && (
              <p className="text-error text-xs mt-1">{errors.discountValue}</p>
            )}
          </div>

          {/* Max Discount */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Max Cap (₹){' '}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="number"
              name="maxDiscountAmount"
              value={form.maxDiscountAmount}
              onChange={handleChange}
              placeholder="300"
              className="input"
            />
          </div>

          {/* Min Order */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Min Order (₹){' '}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="number"
              name="minOrderValue"
              value={form.minOrderValue}
              onChange={handleChange}
              placeholder="0"
              className="input"
            />
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Usage Limit
            </label>
            <input
              type="number"
              name="usageLimit"
              value={form.usageLimit}
              onChange={handleChange}
              placeholder="100"
              className={`input ${errors.usageLimit ? 'input-error' : ''}`}
            />
            {errors.usageLimit && (
              <p className="text-error text-xs mt-1">{errors.usageLimit}</p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className={`input ${errors.expiryDate ? 'input-error' : ''}`}
            />
            {errors.expiryDate && (
              <p className="text-error text-xs mt-1">{errors.expiryDate}</p>
            )}
          </div>

        </div>

        {/* First Order Only toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="font-semibold text-dark text-sm">First Order Only</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Only valid for users placing their very first order
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({ ...prev, firstOrderOnly: !prev.firstOrderOnly }))
            }
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              form.firstOrderOnly ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              form.firstOrderOnly ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading
              ? 'Saving...'
              : isEdit ? 'Update Discount' : 'Create Discount'
            }
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}