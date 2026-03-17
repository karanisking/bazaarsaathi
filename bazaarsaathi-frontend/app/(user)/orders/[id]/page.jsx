'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import OrderTimeline from '@/components/user/OrderTimeline'

const STATUS_STYLES = {
  Placed:             'status-placed',
  Confirmed:          'status-confirmed',
  Shipped:            'status-shipped',
  'Out for Delivery': 'status-out-for-delivery',
  Delivered:          'status-delivered',
}

// ── Defined outside — prevents remount ──────────────────────
const StarPicker = ({ value, onChange, disabled = false }) => {
  const [hovered, setHovered] = useState(0)
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return (
    <div>
      <div className="flex gap-1">
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(s)}
            onMouseEnter={() => !disabled && setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className={`text-3xl transition-transform ${!disabled ? 'hover:scale-110' : 'cursor-default'}`}
          >
            <span className={s <= (hovered || value) ? 'text-accent' : 'text-gray-200'}>
              ★
            </span>
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-xs text-gray-500 mt-1">{labels[value]}</p>
      )}
    </div>
  )
}

const StarDisplay = ({ rating, size = 'sm' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <span
        key={s}
        className={`${size === 'lg' ? 'text-2xl' : 'text-sm'} ${
          s <= Math.round(rating) ? 'text-accent' : 'text-gray-200'
        }`}
      >
        ★
      </span>
    ))}
    <span className={`font-semibold text-dark ml-1 ${size === 'lg' ? 'text-lg' : 'text-xs'}`}>
      {rating}
    </span>
  </div>
)

export default function OrderDetailPage() {
  const { id } = useParams()

  const [order,             setOrder]             = useState(null)
  const [loading,           setLoading]           = useState(true)

  // Per-product review state
  const [showReviewBox,     setShowReviewBox]     = useState(false)
  const [reviewedIds,       setReviewedIds]       = useState(new Set())
  const [ratings,           setRatings]           = useState({})
  const [comments,          setComments]          = useState({})
  const [submitting,        setSubmitting]        = useState({})
  const [submitted,         setSubmitted]         = useState({})
  const [productReviews,    setProductReviews]    = useState({})

  // Overall order rating state
  const [overallRating,     setOverallRating]     = useState(0)
  const [overallComment,    setOverallComment]    = useState('')
  const [existingOverall,   setExistingOverall]   = useState(null)
  const [submittingOverall, setSubmittingOverall] = useState(false)
  const [showOverallForm,   setShowOverallForm]   = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1. Fetch order
        const res = await api.get(`/orders/my/${id}`)
        const o   = res.data.data
        setOrder(o)

        // 2. Fetch current user
        const meRes = await api.get('/auth/me')
        const myId  = meRes.data.data.id

        // 3. Unique product ids
        const uniqueProductIds = [
          ...new Set(o.items.map((i) => i.product?._id ?? i.product)),
        ].filter(Boolean)

        // 4. Fetch reviews for each product in parallel
        const reviewChecks = await Promise.all(
          uniqueProductIds.map((pid) =>
            api.get(`/reviews/product/${pid}`).then((r) => ({
              pid,
              reviews: r.data.data.reviews,
            }))
          )
        )

        // 5. Build already-reviewed set + store existing review data
        const alreadyReviewed  = new Set()
        const existingReviewMap = {}

        reviewChecks.forEach(({ pid, reviews }) => {
          const myReview = reviews.find(
            (r) =>
              (r.user?._id ?? r.user) === myId &&
              (r.order?._id ?? r.order) === o._id   // ← must match current order
          )
          if (myReview) {
            alreadyReviewed.add(String(pid))
            existingReviewMap[String(pid)] = {
              rating:  myReview.rating,
              comment: myReview.comment ?? '',
            }
          }
        })

        setReviewedIds(alreadyReviewed)
        setProductReviews(existingReviewMap)

        // 6. Fetch existing overall rating for this order
        if (o.status === 'Delivered') {
          try {
            const overallRes = await api.get(`/reviews/overall/${id}`)
            if (overallRes.data.data) {
              setExistingOverall(overallRes.data.data)
            }
          } catch (_) {}
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  // Deduplicate items by productId — one review per product
  const uniqueItems = order
    ? Object.values(
        order.items.reduce((acc, item) => {
          const pid = String(item.product?._id ?? item.product ?? item.name)
          if (!acc[pid]) acc[pid] = item
          return acc
        }, {})
      )
    : []

  const reviewableItems = uniqueItems.filter((item) => {
    const pid = String(item.product?._id ?? item.product)
    return !reviewedIds.has(pid) && !submitted[pid]
  })

  const handleSubmitReview = async (item) => {
    const pid    = String(item.product?._id ?? item.product)
    const rating = ratings[pid]
    if (!rating) {
      alert('Please select a star rating.')
      return
    }
    setSubmitting((prev) => ({ ...prev, [pid]: true }))
    try {
      await api.post('/reviews', {
        productId: pid,
        orderId:   order._id,
        rating,
        comment:   comments[pid] ?? '',
      })
      setSubmitted((prev)      => ({ ...prev, [pid]: true }))
      setProductReviews((prev) => ({
        ...prev,
        [pid]: { rating: ratings[pid], comment: comments[pid] ?? '' },
      }))

      // Check if all reviewable items are done
      const remaining = reviewableItems.filter((i) => {
        const p = String(i.product?._id ?? i.product)
        return p !== pid && !submitted[p]
      })
      if (remaining.length === 0) {
        setShowReviewBox(false)
        setOrder((prev) => ({ ...prev, isRated: true }))
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmitting((prev) => ({ ...prev, [pid]: false }))
    }
  }

  const handleSubmitOverall = async () => {
    if (!overallRating) {
      alert('Please select an overall rating.')
      return
    }
    setSubmittingOverall(true)
    try {
      const res = await api.post('/reviews/overall', {
        orderId:        order._id,
        overallRating,
        overallComment,
      })
      setExistingOverall(res.data.data)
      setShowOverallForm(false)
      setOrder((prev) => ({ ...prev, overallRating, overallComment }))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit overall rating.')
    } finally {
      setSubmittingOverall(false)
    }
  }

  // ── Loading skeleton ─────────────────────────────────────
  if (loading) {
    return (
      <div className="section">
        <div className="page-wrapper animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-60 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  // ── Order not found ──────────────────────────────────────
  if (!order) {
    return (
      <div className="section text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-heading text-xl font-bold text-dark mb-4">
          Order not found
        </p>
        <Link href="/orders" className="btn-primary inline-block">
          Back to Orders
        </Link>
      </div>
    )
  }

  const isDelivered = order.status === 'Delivered'
  const canReview   = isDelivered && reviewableItems.length > 0
  const canOverall  = isDelivered && !existingOverall

  return (
    <div className="section">
      <div className="page-wrapper">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <Link
              href="/orders"
              className="text-primary text-sm font-semibold hover:underline"
            >
              ← Back to Orders
            </Link>
            <h1 className="font-heading text-2xl font-bold text-dark mt-1">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={STATUS_STYLES[order.status] ?? 'badge'}>
              {order.status}
            </span>
            {canReview && !showReviewBox && (
              <button
                onClick={() => setShowReviewBox(true)}
                className="btn-accent py-2 px-4 text-sm"
              >
                ✍️ Rate Products
              </button>
            )}
            {canOverall && !showOverallForm && (
              <button
                onClick={() => setShowOverallForm(true)}
                className="btn-outline py-2 px-4 text-sm"
              >
                ⭐ Rate Order
              </button>
            )}
          </div>
        </div>

        {/* ── Overall Order Rating Form ───────────────────── */}
        {showOverallForm && (
          <div className="card p-6 mb-6 border-2 border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-dark text-lg">
                Rate This Order Overall
              </h2>
              <button
                onClick={() => setShowOverallForm(false)}
                className="text-gray-400 hover:text-dark text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-dark mb-2">
                  Overall Rating
                </p>
                <StarPicker
                  value={overallRating}
                  onChange={setOverallRating}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-dark mb-1.5 block">
                  Overall Comment{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  placeholder="How was your overall experience with this order?"
                  rows={3}
                  maxLength={500}
                  className="input resize-none"
                />
                <p className="text-gray-400 text-xs mt-0.5 text-right">
                  {overallComment.length}/500
                </p>
              </div>
              <button
                onClick={handleSubmitOverall}
                disabled={submittingOverall || !overallRating}
                className="btn-primary w-full disabled:opacity-40"
              >
                {submittingOverall ? 'Submitting...' : 'Submit Overall Rating'}
              </button>
            </div>
          </div>
        )}

        {/* ── Per-product Review Box ──────────────────────── */}
        {showReviewBox && reviewableItems.length > 0 && (
          <div className="card p-6 mb-6 border-2 border-accent-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-dark text-lg">
                Rate Your Products
              </h2>
              <button
                onClick={() => setShowReviewBox(false)}
                className="text-gray-400 hover:text-dark text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-6">
              {reviewableItems.map((item) => {
                const pid            = String(item.product?._id ?? item.product)
                const isSubmittedNow = submitted[pid]
                const isSubmitting   = submitting[pid]

                if (isSubmittedNow) {
                  return (
                    <div
                      key={pid}
                      className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-2xl"
                    >
                      <img
                        src={`${item.image}?tr=w-80,h-80,fo-auto`}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-dark text-sm">
                          {item.name}
                        </p>
                        <p className="text-green-600 text-sm mt-1">
                          ✅ Review submitted!
                        </p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={pid}
                    className="border border-gray-100 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`${item.image}?tr=w-80,h-80,fo-auto`}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-dark text-sm">
                          {item.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          ₹{item.discountedPrice} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark mb-1.5">
                        Your Rating
                      </p>
                      <StarPicker
                        value={ratings[pid] ?? 0}
                        onChange={(val) =>
                          setRatings((prev) => ({ ...prev, [pid]: val }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-dark mb-1.5 block">
                        Comment{' '}
                        <span className="text-gray-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        value={comments[pid] ?? ''}
                        onChange={(e) =>
                          setComments((prev) => ({
                            ...prev,
                            [pid]: e.target.value,
                          }))
                        }
                        placeholder="Share your experience..."
                        rows={2}
                        maxLength={500}
                        className="input resize-none text-sm"
                      />
                      <p className="text-gray-400 text-xs mt-0.5 text-right">
                        {(comments[pid] ?? '').length}/500
                      </p>
                    </div>
                    <button
                      onClick={() => handleSubmitReview(item)}
                      disabled={isSubmitting || !ratings[pid]}
                      className="btn-primary w-full py-2 text-sm disabled:opacity-40"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Main Grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left col ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Timeline */}
            <div className="card p-5">
              <h2 className="font-heading font-bold text-dark mb-4">
                Order Tracking
              </h2>
              <OrderTimeline
                status={order.status}
                history={order.statusHistory}
              />
            </div>

            {/* Items — with per-product rating display */}
            <div className="card p-5">
              <h2 className="font-heading font-bold text-dark mb-4">
                Items Ordered
              </h2>
              <div className="space-y-4">
                {uniqueItems.map((item, i) => {
                  const pid      = String(item.product?._id ?? item.product)
                  const myReview = productReviews[pid]
                  return (
                    <Link key={i}  href={`/product/${pid}`} className="flex items-start gap-4">
                      <img
                        src={`${item.image}?tr=w-80,h-80,fo-auto`}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark text-sm line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          ₹{item.discountedPrice} × {item.quantity}
                        </p>
                        {/* Show existing review inline */}
                        {myReview && (
                          <div className="mt-2 space-y-1">
                            <StarDisplay rating={myReview.rating} />
                            {myReview.comment && (
                              <p className="text-gray-500 text-xs italic">
                                "{myReview.comment}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-dark shrink-0 text-sm">
                        ₹{item.discountedPrice * item.quantity}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card p-5">
              <h2 className="font-heading font-bold text-dark mb-3">
                Delivery Address
              </h2>
              <div className="text-sm text-gray-500 space-y-1">
                <p className="font-semibold text-dark">
                  {order.address.fullName}
                </p>
                <p>
                  {order.address.addressLine1}
                  {order.address.addressLine2 &&
                    `, ${order.address.addressLine2}`}
                </p>
                <p>
                  {order.address.city}, {order.address.state} —{' '}
                  {order.address.pincode}
                </p>
                <p>📞 {order.address.phone}</p>
              </div>
            </div>
          </div>

          {/* ── Right col ──────────────────────────────── */}
       {/* ── Right col ──────────────────────────────── */}
<div className="lg:col-span-1 space-y-5">

{/* Payment Summary — normal flow, no sticky */}
<div className="card p-5">
  <h2 className="font-heading font-bold text-dark mb-4">
    Payment Summary
  </h2>
  <div className="space-y-2 text-sm">
    <div className="flex justify-between text-gray-500">
      <span>Subtotal</span>
      <span className="font-semibold text-dark">
        ₹{order.itemsTotal}
      </span>
    </div>
    {order.couponDiscount > 0 && (
      <div className="flex justify-between text-green-600">
        <span>Discount ({order.discount?.code})</span>
        <span className="font-semibold">
          −₹{order.couponDiscount}
        </span>
      </div>
    )}
    <div className="flex justify-between text-gray-500">
      <span>Delivery</span>
      <span className="text-green-600 font-semibold">FREE</span>
    </div>
    <div className="border-t border-gray-100 pt-3 flex justify-between">
      <span className="font-bold text-dark">Total Paid</span>
      <span className="font-heading font-bold text-xl text-dark">
        ₹{order.finalPrice}
      </span>
    </div>
  </div>
  <div className="mt-4 bg-gray-50 rounded-xl p-3 text-sm text-gray-500 flex items-center gap-2">
    <span>💳</span>
    <span>{order.paymentMethod}</span>
  </div>
</div>

{/* Overall Order Rating card — normal flow, no sticky */}
{isDelivered && (
  <div className="card p-5">
    <h2 className="font-heading font-bold text-dark mb-3">
      Overall Order Rating
    </h2>
    {existingOverall ? (
      <div className="space-y-2">
        <StarDisplay
          rating={existingOverall.overallRating}
          size="lg"
        />
        {existingOverall.overallComment && (
          <p className="text-gray-500 text-sm italic mt-2">
            "{existingOverall.overallComment}"
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          You cannot edit your overall rating.
        </p>
      </div>
    ) : (
      <div className="text-center py-4">
        <p className="text-gray-400 text-sm mb-3">
          How was your overall experience?
        </p>
        <button
          onClick={() => setShowOverallForm(true)}
          className="btn-outline py-2 px-4 text-sm w-full"
        >
          ⭐ Rate This Order
        </button>
      </div>
    )}
  </div>
)}

</div>
        </div>
      </div>
    </div>
  )
}