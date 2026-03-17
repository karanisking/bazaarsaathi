'use client'
import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import useAuthStore from '@/store/useAuthStore'
import useCartStore from '@/store/useCartStore'

export default function ProductCard({ product }) {
  const user    = useAuthStore((state) => state.user)
  const setCart = useCartStore((state) => state.setCart)
  const [loading, setLoading] = useState(false)

  const isOutOfStock = product.stock === 0
  const hasDiscount  = product.discountPercentage > 0

  const handleAddToCart = async (e) => {
    e.preventDefault()  // prevent Link navigation
    if (!user) {
      toast.error('Please login to add items to cart.')
      return
    }
    if (isOutOfStock) return

    setLoading(true)
    try {
      const res = await api.post('/cart', {
        productId: product._id,
        quantity: 1,
      })
      const { items, itemsTotal } = res.data.data
      setCart(items, itemsTotal)
      toast.success(`${product.name} added to cart!`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add to cart.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/product/${product._id}`} className="card-hover group flex flex-col">

      {/* Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
        <img
          src={`${product.images[0]?.url}?tr=w-300,h-300,fo-auto`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 discount-tag">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-dark font-semibold text-sm line-clamp-2 leading-tight">
          {product.name}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-heading font-bold text-dark text-base">
            ₹{product.discountedPrice}
          </span>
          {hasDiscount && (
            <span className="text-gray-400 text-xs line-through">
              ₹{product.sellingPrice}
            </span>
          )}
        </div>

        {/* Stock status */}
        {product.stock > 0 && product.stock < 5 && (
          <p className="text-warning text-xs font-semibold">
            Only {product.stock} left!
          </p>
        )}
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={loading || isOutOfStock}
        className={`mt-3 w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200
          ${isOutOfStock
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-primary-50 text-primary hover:bg-primary hover:text-white'
          }`}
      >
        {loading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : '+ Add to Cart'}
      </button>

    </Link>
  )
}
