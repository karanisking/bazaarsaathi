'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
  })

const EMPTY = {
  name: '', description: '', sellingPrice: '',
  discountedPrice: '', stock: '', category: '',
}

// ─── Moved OUTSIDE ProductForm ────────────────────────────────
// This is key — if defined inside, it remounts on every keystroke
const Field = ({ name, label, placeholder, type = 'text', as, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-dark mb-1.5">
      {label}
    </label>
    {as === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className={`input resize-none ${error ? 'input-error' : ''}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input ${error ? 'input-error' : ''}`}
      />
    )}
    {error && (
      <p className="text-error text-xs mt-1">{error}</p>
    )}
  </div>
)
// ─────────────────────────────────────────────────────────────

export default function ProductForm({ editData, onSaved }) {
  const [form, setForm] = useState(editData ? {
    name:            editData.name,
    description:     editData.description,
    sellingPrice:    editData.sellingPrice,
    discountedPrice: editData.discountedPrice,
    stock:           editData.stock,
    category:        editData.category?._id ?? editData.category,
  } : EMPTY)

  const [images,     setImages]     = useState(editData?.images ?? [])
  const [categories, setCategories] = useState([])
  const [uploading,  setUploading]  = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState({})

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed.')
      return
    }
    setUploading(true)
    try {
      for (const file of files) {
        const base64 = await toBase64(file)
        const res = await api.post('/upload', {
          file:     base64,
          fileName: file.name,
          folder:   '/bazaarSathi/products',
        })
        setImages((prev) => [...prev, res.data.data])
      }
      toast.success('Image uploaded.')
    } catch (err) {
      toast.error('Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (fileId, index) => {
    try {
      await api.delete(`/upload/${fileId}`)
      setImages((prev) => prev.filter((_, i) => i !== index))
      toast.success('Image removed.')
    } catch (err) {
      toast.error('Failed to remove image.')
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name)          e.name         = 'Name is required'
    if (!form.description)   e.description  = 'Description is required'
    if (!form.sellingPrice)  e.sellingPrice = 'Selling price is required'
    if (!form.stock)         e.stock        = 'Stock is required'
    if (!form.category)      e.category     = 'Category is required'
    if (images.length === 0) e.images       = 'At least one image is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        ...form,
        sellingPrice:    Number(form.sellingPrice),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
        stock:           Number(form.stock),
        images,
      }

      let res
      if (editData) {
        res = await api.put(`/products/${editData._id}`, payload)
        toast.success('Product updated.')
      } else {
        res = await api.post('/products', payload)
        toast.success('Product created.')
      }
      onSaved?.(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <Field
        name="name"
        label="Product Name"
        placeholder="e.g. Fresh Tomatoes 1kg"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />

      <Field
        name="description"
        label="Description"
        placeholder="Describe the product..."
        as="textarea"
        value={form.description}
        onChange={handleChange}
        error={errors.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field
          name="sellingPrice"
          label="Selling Price (₹)"
          placeholder="100"
          type="number"
          value={form.sellingPrice}
          onChange={handleChange}
          error={errors.sellingPrice}
        />
        <Field
          name="discountedPrice"
          label="Discounted Price (₹)"
          placeholder="80 (optional)"
          type="number"
          value={form.discountedPrice}
          onChange={handleChange}
          error={errors.discountedPrice}
        />
        <Field
          name="stock"
          label="Stock Quantity"
          placeholder="50"
          type="number"
          value={form.stock}
          onChange={handleChange}
          error={errors.stock}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-dark mb-1.5">
          Category
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className={`input ${errors.category ? 'input-error' : ''}`}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        {errors.category && (
          <p className="text-error text-xs mt-1">{errors.category}</p>
        )}
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-semibold text-dark mb-1.5">
          Product Images{' '}
          <span className="text-gray-400 font-normal">(max 5)</span>
        </label>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20">
                <img
                  src={`${img.url}?tr=w-100,h-100,fo-auto`}
                  alt=""
                  className="w-full h-full object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.fileId, i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 5 && (
          <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl">{uploading ? '⏳' : '📸'}</span>
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Click to upload images'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
        {errors.images && (
          <p className="text-error text-xs mt-1">{errors.images}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="btn-primary w-full"
      >
        {loading
          ? 'Saving...'
          : editData ? 'Update Product' : 'Create Product'
        }
      </button>
    </form>
  )
}