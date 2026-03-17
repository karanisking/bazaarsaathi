'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/axios'
import ProductCard from '@/components/user/ProductCard'

const SORT_OPTIONS = [
  { label: 'Newest',        value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular',  value: 'popular' },
  { label: 'Best Discount', value: 'discount' },
]

export default function CategoryPage() {
  const { slug } = useParams()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [sort,     setSort]     = useState('newest')
  const [inStock,  setInStock]  = useState(false)
  const [page,     setPage]     = useState(1)

  // Fetch category info
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/categories/${slug}`)
        setCategory(res.data.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchCategory()
  }, [slug])

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return
      setLoading(true)
      try {
        const params = new URLSearchParams({
          category: category._id,
          sort,
          page,
          limit: 12,
          ...(inStock && { inStock: 'true' }),
        })
        const res = await api.get(`/products?${params}`)
        setProducts(res.data.data.products)
        setPagination(res.data.data.pagination)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category, sort, inStock, page])

  return (
    <div className="section">
      <div className="page-wrapper">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          {category?.image && (
            <img
              src={`${category.image.url}?tr=w-80,h-80,fo-auto`}
              alt={category.name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          )}
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-dark">
              {category?.name ?? '...'}
            </h1>
            {pagination && (
              <p className="text-gray-500 text-sm mt-0.5">
                {pagination.total} products found
              </p>
            )}
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            className="input w-auto text-sm py-2"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* In stock toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => { setInStock(!inStock); setPage(1) }}
              className={`w-10 h-6 rounded-full transition-colors duration-200 relative
                ${inStock ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${inStock ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </div>
            <span className="text-sm font-semibold text-dark">In Stock Only</span>
          </label>
        </div>

        {/* ── Products Grid ────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse card">
                <div className="bg-gray-200 rounded-xl aspect-square mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🥬</p>
            <p className="font-heading text-xl font-bold text-dark mb-2">
              No products found
            </p>
            <p className="text-gray-400 text-sm">
              Try changing the filters above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────── */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn-outline py-2 px-4 text-sm disabled:opacity-40"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
                    ${page === i + 1
                      ? 'bg-primary text-white'
                      : 'text-dark hover:bg-primary-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

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
    </div>
  )
}