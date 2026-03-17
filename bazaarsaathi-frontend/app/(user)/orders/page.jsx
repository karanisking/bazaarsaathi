'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/axios'

const STATUS_STYLES = {
  Placed:             'status-placed',
  Confirmed:          'status-confirmed',
  Shipped:            'status-shipped',
  'Out for Delivery': 'status-out-for-delivery',
  Delivered:          'status-delivered',
}

// ── Defined outside — no remount ─────────────────────────────
const StarDisplay = ({ rating }) => {
  if (!rating) return null
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span
          key={s}
          className={`text-sm ${s <= Math.round(rating) ? 'text-accent' : 'text-gray-200'}`}
        >
          ★
        </span>
      ))}
      <span className="text-xs font-semibold text-dark ml-1">
        {rating}
      </span>
    </div>
  )
}

export default function OrdersPage() {
  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [pagination,    setPagination]    = useState(null)
  const [page,          setPage]          = useState(1)
  // overallRatings: { [orderId]: { overallRating, overallComment } | null }
  const [overallRatings, setOverallRatings] = useState({})
  const [ratingsLoading, setRatingsLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res            = await api.get(`/orders/my?page=${page}&limit=10`)
        const fetchedOrders  = res.data.data.orders
        setOrders(fetchedOrders)
        setPagination(res.data.data.pagination)

        // Fetch overall ratings for all delivered orders in parallel
        const deliveredOrders = fetchedOrders.filter(
          (o) => o.status === 'Delivered'
        )
        if (deliveredOrders.length === 0) return

        setRatingsLoading(true)
        const ratingsMap = {}

        await Promise.all(
          deliveredOrders.map(async (order) => {
            try {
              const r = await api.get(`/reviews/overall/${order._id}`)
              // r.data.data is { overallRating, overallComment } or null
              ratingsMap[order._id] = r.data.data ?? null
            } catch (_) {
              ratingsMap[order._id] = null
            }
          })
        )

        setOverallRatings(ratingsMap)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
        setRatingsLoading(false)
      }
    }
    fetchOrders()
  }, [page])

  if (loading) {
    return (
      <div className="section">
        <div className="page-wrapper space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse card h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="page-wrapper">
        <h1 className="font-heading text-2xl font-bold text-dark mb-6">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-heading text-xl font-bold text-dark mb-2">
              No orders yet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Start shopping to see your orders here
            </p>
            <Link href="/" className="btn-primary inline-block">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const overall   = overallRatings[order._id]
              const isDelivered = order.status === 'Delivered'
              // null means delivered but not yet rated
              // undefined means not fetched yet (non-delivered)
              const notRatedYet = isDelivered && overall === null

              return (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="card-hover p-5 block"
                >
                  {/* ── Top row: order id + status ─────── */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-dark text-sm">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={STATUS_STYLES[order.status] ?? 'badge'}>
                      {order.status}
                    </span>
                  </div>

                  {/* ── Items preview ───────────────────── */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={`${item.image}?tr=w-60,h-60,fo-auto`}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border-2 border-white bg-gray-50"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">
                      {order.items.length}{' '}
                      {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* ── Bottom row: payment + rating ────── */}
                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">

                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-gray-400 text-sm">
                        {order.paymentMethod}
                      </p>

                      {/* Overall rating — show stars if rated */}
                      {isDelivered && overall?.overallRating && (
                        <div className="flex items-center gap-1.5">
                          <StarDisplay rating={overall.overallRating} />
                          {overall.overallComment && (
                            <p className="text-gray-400 text-xs italic line-clamp-1 max-w-[140px]">
                              "{overall.overallComment}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Nudge to rate if not yet rated */}
                      {notRatedYet && !ratingsLoading && (
                        <span className="inline-flex items-center gap-1 text-xs text-accent font-semibold bg-accent-50 px-2.5 py-1 rounded-full">
                          ⭐ Rate this order
                        </span>
                      )}
                    </div>

                    <p className="font-heading font-bold text-dark">
                      ₹{order.finalPrice}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────── */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn-outline py-2 px-4 text-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500 self-center">
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
    </div>
  )
}
