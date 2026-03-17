'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import CategoryForm from '@/components/admin/CategoryForm'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editData,   setEditData]   = useState(null)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSaved = (saved) => {
    if (editData) {
      setCategories((prev) => prev.map((c) => c._id === saved._id ? saved : c))
      setEditData(null)
    } else {
      setCategories((prev) => [saved, ...prev])
      setShowForm(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return
    try {
      await api.delete(`/categories/${id}`)
      setCategories((prev) => prev.filter((c) => c._id !== id))
      toast.success('Category deleted.')
    } catch (err) {
      toast.error('Failed to delete category.')
    }
  }

  return (
    <div className="space-y-5">

      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">
          {categories.length} categories
        </p>
        <button
          onClick={() => { setShowForm(!showForm); setEditData(null) }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-5">
          <h2 className="font-heading font-bold text-dark mb-4">
            New Category
          </h2>
          <CategoryForm
            onSaved={handleSaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Edit form */}
      {editData && (
        <div className="card p-5">
          <h2 className="font-heading font-bold text-dark mb-4">
            Edit Category
          </h2>
          <CategoryForm
            editData={editData}
            onSaved={handleSaved}
            onCancel={() => setEditData(null)}
          />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse card aspect-square" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-sm">No categories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-3 flex flex-col items-center gap-2 group">
              <img
                src={`${cat.image.url}?tr=w-150,h-150,fo-auto`}
                alt={cat.name}
                className="w-full aspect-square rounded-xl object-cover bg-gray-50"
              />
              <p className="font-semibold text-dark text-sm text-center line-clamp-1">
                {cat.name}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditData(cat); setShowForm(false) }}
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className="text-error text-xs font-semibold hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}