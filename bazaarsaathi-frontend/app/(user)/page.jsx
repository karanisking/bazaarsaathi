'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/axios'
import ProductCard from '@/components/user/ProductCard'
import CategoryCard from '@/components/user/CategoryCard'
import Image from 'next/image'


export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=8&sort=newest'),
        ])
        setCategories(catRes.data.data)
        setFeatured(prodRes.data.data.products)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 py-14">
        <div className="page-wrapper">
          <div className="flex flex-col md:flex-row items-center gap-10">

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-primary-100 text-primary-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                🌿 Fresh & Natural
              </span>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-dark leading-tight mb-4">
                Your Daily Groceries,{' '}
                <span className="text-primary">Delivered Fast</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                Shop fresh vegetables, fruits, dairy and more — all at
                the best prices. Cash on delivery available.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href="/search?q=" className="btn-primary text-center flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  Shop Now
                </Link>
                <Link href="/search?q=" className="btn-accent text-center shrink-0 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  Start Shopping
                </Link>
              </div>
            </div>

            {/* Illustration */}
            {/* Illustration */}
            <div className="flex-1 flex justify-center">
              <div className="w-72 h-72 bg-primary-50 rounded-full flex items-center justify-center">
               <Image src="/logo.png" alt="BazaarSaathi" width={180} height={60} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ──────────────────────────────── */}
      <section className="bg-white border-y border-gray-100">
        <div className="page-wrapper py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: 'Same day delivery' },
              { icon: '💰', title: 'Best Prices', desc: 'Lowest guaranteed' },
              { icon: '🌿', title: 'Fresh Products', desc: '100% fresh & natural' },
              { icon: '💳', title: 'Cash on Delivery', desc: 'Pay when you receive' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-3">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-dark text-sm">{f.title}</p>
                  <p className="text-gray-400 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────── */}
      <section id="categories" className="section">
        <div className="page-wrapper">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-dark">
                Shop by Category
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Find what you need quickly
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-square mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              No categories found.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────── */}
      <section className="section bg-gray-50">
        <div className="page-wrapper">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-dark">
                Latest Products
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Freshly added to our store
              </p>
            </div>
            <Link
              href="/search?q="
              className="text-primary font-semibold text-sm hover:underline"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse card">
                  <div className="bg-gray-200 rounded-xl aspect-square mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              No products found.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Banner ──────────────────────────────────────── */}
    

    </div>
  )
}
