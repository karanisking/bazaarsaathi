'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import useAuthStore from '@/store/useAuthStore'
import useCartStore from '@/store/useCartStore'
import ReviewCard from '@/components/user/ReviewCard'

// ── Receives id as prop from server page ─────────────────────
export default function ProductClient({ id }) {
  const router  = useRouter()
  const user    = useAuthStore((state) => state.user)
  const setCart = useCartStore((state) => state.setCart)

  const [product,      setProduct]      = useState(null)
  const [reviews,      setReviews]      = useState([])
  const [summary,      setSummary]      = useState(null)
  const [quantity,     setQuantity]     = useState(1)
  const [activeImg,    setActiveImg]    = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, reviewRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
        ])
        setProduct(prodRes.data.data)
        setReviews(reviewRes.data.data.reviews)
        setSummary(reviewRes.data.data.summary)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart.')
      router.push('/login')
      return
    }
    setAddingToCart(true)
    try {
      const res = await api.post('/cart', { productId: product._id, quantity })
      const { items, itemsTotal } = res.data.data
      setCart(items, itemsTotal)
      toast.success(`${product.name} added to cart!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart.')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="section">
        <div className="page-wrapper animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-200 rounded-3xl aspect-square" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="section text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-heading text-xl font-bold text-dark mb-2">
          Product not found
        </p>
        <Link href="/" className="btn-primary mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const hasDiscount  = product.discountPercentage > 0

  return (
    <div className="section">
      <div className="page-wrapper">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.category?.slug}`} className="hover:text-primary">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-dark font-semibold line-clamp-1">{product.name}</span>
        </div>

        {/* Product detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">

          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={`${product.images[activeImg]?.url}?tr=w-600,h-600,fo-auto`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === i
                        ? 'border-primary'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <img
                      src={`${img.url}?tr=w-100,h-100,fo-auto`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <Link
              href={`/category/${product.category?.slug}`}
              className="badge-primary w-fit"
            >
              {product.category?.name}
            </Link>

            <h1 className="font-heading text-2xl md:text-3xl font-bold text-dark leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            {summary && summary.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <span
                      key={s}
                      className={
                        s <= Math.round(summary.avgRating)
                          ? 'text-accent'
                          : 'text-gray-200'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-semibold text-dark text-sm">
                  {summary.avgRating}
                </span>
                <span className="text-gray-400 text-sm">
                  ({summary.totalReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-heading text-4xl font-bold text-dark">
                ₹{product.discountedPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-gray-400 text-lg line-through mb-1">
                    ₹{product.sellingPrice}
                  </span>
                  <span className="discount-tag mb-1">
                    {product.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div>
              {isOutOfStock ? (
                <span className="stock-out">Out of Stock</span>
              ) : product.stock < 5 ? (
                <span className="stock-low">Only {product.stock} left!</span>
              ) : (
                <span className="stock-in">In Stock</span>
              )}
            </div>

            <p className="text-gray-500 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Quantity + Add to cart */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2.5 text-dark font-bold hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2.5 font-semibold text-dark min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-4 py-2.5 text-dark font-bold hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="btn-primary flex-1"
                >
                  {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
              <span>💳</span>
              <span>Cash on Delivery available</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-gray-100 pt-10">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold text-dark">
              Customer Reviews
              {summary && (
                <span className="text-gray-400 font-normal text-base ml-2">
                  ({summary.totalReviews})
                </span>
              )}
            </h2>
            {!user && (
              <p className="text-gray-400 text-sm mt-1">
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Login
                </Link>{' '}
                and purchase this product to leave a review.
              </p>
            )}
            {user && (
              <p className="text-gray-400 text-sm mt-1">
                Purchased this product?{' '}
                <Link href="/orders" className="text-primary font-semibold hover:underline">
                  Go to your orders
                </Link>{' '}
                to write a review.
              </p>
            )}
          </div>

          {summary && summary.totalReviews > 0 && (
            <div className="flex items-center gap-6 mb-8 p-5 bg-gray-50 rounded-2xl">
              <div className="text-center shrink-0">
                <p className="font-heading text-5xl font-bold text-dark">
                  {summary.avgRating}
                </p>
                <div className="flex justify-center mt-1">
                  {[1,2,3,4,5].map((s) => (
                    <span
                      key={s}
                      className={
                        s <= Math.round(summary.avgRating)
                          ? 'text-accent text-xl'
                          : 'text-gray-200 text-xl'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {summary.totalReviews} reviews
                </p>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-gray-400 text-sm">
                No reviews yet. Purchase this product to be the first to review!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
