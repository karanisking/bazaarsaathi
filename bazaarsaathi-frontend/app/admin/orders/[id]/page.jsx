'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import api from '@/lib/axios'
import OrderTimeline from '@/components/user/OrderTimeline'
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater'
export const dynamic = 'force-dynamic'

export default function AdminOrderDetailPage() {
  const { id }   = useParams()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-60 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Order not found.</p>
      <Link href="/admin/orders" className="btn-primary mt-4 inline-block">
        Back to Orders
      </Link>
    </div>
  )

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-primary text-sm font-semibold hover:underline"
          >
            ← Back to Orders
          </Link>
          <h1 className="font-heading text-xl font-bold text-dark mt-1">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-400 text-sm">
            {order.user?.name} · {order.user?.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Update status */}
          <div className="card p-5">
            <h2 className="font-heading font-bold text-dark mb-4">
              Update Status
            </h2>
            <OrderStatusUpdater
              orderId={order._id}
              currentStatus={order.status}
              onUpdated={(updated) => setOrder(updated)}
            />
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h2 className="font-heading font-bold text-dark mb-4">
              Order Timeline
            </h2>
            <OrderTimeline
              status={order.status}
              history={order.statusHistory}
            />
          </div>

          {/* Items */}
          <div className="card p-5">
            <h2 className="font-heading font-bold text-dark mb-4">
              Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <img
                    src={`${item.image}?tr=w-80,h-80,fo-auto`}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-dark text-sm">{item.name}</p>
                    <p className="text-gray-400 text-xs">
                      ₹{item.discountedPrice} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-dark">
                    ₹{item.discountedPrice * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-heading font-bold text-dark mb-3">
              Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-dark">₹{order.itemsTotal}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>−₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-dark">
                <span>Total</span>
                <span>₹{order.finalPrice}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-heading font-bold text-dark mb-3">
              Delivery Address
            </h2>
            <div className="text-sm text-gray-500 space-y-1">
              <p className="font-semibold text-dark">{order.address.fullName}</p>
              <p>{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
              <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
              <p>📞 {order.address.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
