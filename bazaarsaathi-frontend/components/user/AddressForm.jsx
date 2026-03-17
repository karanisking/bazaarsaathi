'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

const EMPTY = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
}

// ── Defined OUTSIDE to prevent remount on every keystroke ────
const Field = ({ name, label, placeholder, type = 'text', value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-dark mb-1.5">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`input ${error ? 'input-error' : ''}`}
    />
    {error && <p className="text-error text-xs mt-1">{error}</p>}
  </div>
)

export default function AddressForm({ onAdded, onUpdated, editData, onCancel }) {
  const [form,    setForm]    = useState(editData ?? EMPTY)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const isEdit = !!editData

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.fullName || form.fullName.trim().length < 2)
      e.fullName = 'Full name is required'
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone))
      e.phone = 'Enter valid 10-digit phone number'
    if (!form.addressLine1 || form.addressLine1.trim().length < 5)
      e.addressLine1 = 'Address must be at least 5 characters'
    if (!form.city || form.city.trim().length < 2)
      e.city = 'City is required'
    if (!form.state || form.state.trim().length < 2)
      e.state = 'State is required'
    if (!form.pincode || !/^\d{6}$/.test(form.pincode))
      e.pincode = 'Enter valid 6-digit pincode'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        const res = await api.put(`/addresses/${editData._id}`, form)
        toast.success('Address updated.')
        onUpdated?.(res.data.data)
      } else {
        const res = await api.post('/addresses', form)
        toast.success('Address saved.')
        onAdded?.(res.data.data)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Label selector */}
      <div>
        <label className="block text-sm font-semibold text-dark mb-2">
          Address Type
        </label>
        <div className="flex gap-2">
          {['Home', 'Office', 'Other'].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, label: l }))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                ${form.label === l
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 text-dark hover:border-primary'
                }`}
            >
              {l === 'Home' ? '🏠' : l === 'Office' ? '🏢' : '📍'} {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          name="fullName"
          label="Full Name"
          placeholder="John Doe"
          value={form.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />
        <Field
          name="phone"
          label="Phone Number"
          placeholder="9876543210"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <Field
          name="addressLine1"
          label="Address Line 1"
          placeholder="House no, Street name"
          value={form.addressLine1}
          onChange={handleChange}
          error={errors.addressLine1}
        />
        <Field
          name="addressLine2"
          label="Address Line 2 (optional)"
          placeholder="Landmark, Area"
          value={form.addressLine2}
          onChange={handleChange}
          error={errors.addressLine2}
        />
        <Field
          name="city"
          label="City"
          placeholder="Mumbai"
          value={form.city}
          onChange={handleChange}
          error={errors.city}
        />
        <Field
          name="state"
          label="State"
          placeholder="Maharashtra"
          value={form.state}
          onChange={handleChange}
          error={errors.state}
        />
        <Field
          name="pincode"
          label="Pincode"
          placeholder="400001"
          value={form.pincode}
          onChange={handleChange}
          error={errors.pincode}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Address' : 'Save Address'}
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
  )
}