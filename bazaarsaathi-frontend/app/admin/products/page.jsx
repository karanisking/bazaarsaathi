'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import DataTable from '@/components/admin/DataTable'

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10, ...(search && { search }) })
      const res = await api.get(`/products?${params}`)
      setProducts(res.data.data.products)
      setPagination(res.data.data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted.')
      fetchProducts()
    } catch (err) {
      toast.error('Failed to delete product.')
    }
  }

  const columns = [
    {
      key: 'image', label: '', width: '60px',
      render: (row) => (
        <img
          src={`${row.images[0]?.url}?tr=w-60,h-60,fo-auto`}
          alt={row.name}
          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
        />
      ),
    },
    {
      key: 'name', label: 'Product',
      render: (row) => (
        <div>
          <p className="font-semibold text-dark line-clamp-1">{row.name}</p>
          <p className="text-gray-400 text-xs">{row.category?.name}</p>
        </div>
      ),
    },
    {
      key: 'price', label: 'Price',
      render: (row) => (
        <div>
          <p className="font-bold text-dark">₹{row.discountedPrice}</p>
          {row.discountPercentage > 0 && (
            <p className="text-gray-400 text-xs line-through">₹{row.sellingPrice}</p>
          )}
        </div>
      ),
    },
    {
      key: 'stock', label: 'Stock',
      render: (row) => (
        <span className={
          row.stock === 0 ? 'stock-out' :
          row.stock < 5  ? 'stock-low'  : 'stock-in'
        }>
          {row.stock === 0 ? 'Out of Stock' : `${row.stock} left`}
        </span>
      ),
    },
    {
      key: 'sold', label: 'Sold',
      render: (row) => (
        <span className="font-semibold text-dark">{row.sold}</span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/products/${row._id}`}
            className="text-primary text-xs font-semibold hover:underline"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDelete(row._id, row.name)}
            className="text-error text-xs font-semibold hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="input w-64"
          />
          <button type="submit" className="btn-primary px-4">
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
              className="btn-outline px-4"
            >
              Clear
            </button>
          )}
        </form>

        <Link href="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products found."
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={!pagination.hasPrevPage}
            className="btn-outline py-2 px-4 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
            className="btn-outline py-2 px-4 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}