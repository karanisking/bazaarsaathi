'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
  })

export default function CategoryForm({ editData, onSaved, onCancel }) {
  const [name,      setName]      = useState(editData?.name ?? '')
  const [image,     setImage]     = useState(editData?.image ?? null)
  const [uploading, setUploading] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const base64 = await toBase64(file)
      const res = await api.post('/upload', {
        file:     base64,
        fileName: file.name,
        folder:   '/bazaarSathi/categories',
      })
      setImage(res.data.data)
      toast.success('Image uploaded.')
    } catch (err) {
      toast.error('Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!image?.fileId) { setImage(null); return }
    try {
      await api.delete(`/upload/${image.fileId}`)
      setImage(null)
    } catch (err) {
      toast.error('Failed to remove image.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!name.trim()) errs.name  = 'Name is required'
    if (!image)       errs.image = 'Image is required'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      if (editData) {
        const res = await api.put(`/categories/${editData._id}`, { name, image })
        toast.success('Category updated.')
        onSaved?.(res.data.data)
      } else {
        const res = await api.post('/categories', { name, image })
        toast.success('Category created.')
        onSaved?.(res.data.data)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-dark mb-1.5">
          Category Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }) }}
          placeholder="e.g. Fresh Vegetables"
          className={`input ${errors.name ? 'input-error' : ''}`}
        />
        {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-semibold text-dark mb-1.5">
          Category Image
        </label>
        {image ? (
          <div className="flex items-center gap-3">
            <img
              src={`${image.url}?tr=w-100,h-100,fo-auto`}
              alt="category"
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-error text-sm font-semibold hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl">{uploading ? '⏳' : '📸'}</span>
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Click to upload image'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
        {errors.image && <p className="text-error text-xs mt-1">{errors.image}</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-primary flex-1"
        >
          {loading ? 'Saving...' : editData ? 'Update' : 'Create Category'}
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