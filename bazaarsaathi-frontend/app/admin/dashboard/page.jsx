'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/axios'
import StatsCard from '@/components/admin/StatsCard'

export default function DashboardPage() {
  const [stats,    setStats]    = useState(null)
  const [topProds, setTopProds] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, topRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/top-products'),
        ])
        setStats(statsRes.data.data)
        setTopProds(topRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Today's Orders"
          value={stats?.totalOrdersToday}
          icon="📋"
          color="primary"
        />
        <StatsCard
          title="Pending Orders"
          value={stats?.pendingOrders}
          icon="⏳"
          color="warning"
        />
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts}
          icon="📦"
          color="accent"
        />
        <StatsCard
          title="Low Stock"
          value={stats?.lowStockProducts}
          icon="⚠️"
          color="error"
          sub="Items below 5 units"
        />
        <StatsCard
          title="Customers"
          value={stats?.totalCustomers}
          icon="👥"
          color="success"
        />
        <StatsCard
          title="Total Revenue"
          value={stats ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : null}
          icon="💰"
          color="primary"
          sub="From delivered orders"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Add Product',   href: '/admin/products/new', icon: '➕', color: 'bg-primary-50 text-primary' },
          { label: 'Add Category',  href: '/admin/categories',   icon: '🗂️', color: 'bg-accent-50 text-accent' },
          { label: 'View Orders',   href: '/admin/orders', icon: '🧾', color: 'bg-green-50 text-green-600' },
          { label: 'Add Discount',  href: '/admin/discounts',    icon: '🎟️', color: 'bg-purple-50 text-purple-600' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`card-hover p-4 flex items-center gap-3 ${action.color}`}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="font-semibold text-sm">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Top Products */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-dark">
            Top Selling Products
          </h2>
          <Link
            href="/admin/products"
            className="text-primary text-sm font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : topProds.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No sales data yet.
          </p>
        ) : (
          <div className="space-y-3">
            {topProds.map((product, i) => (
              <div
                key={product._id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400 font-bold text-sm w-5 shrink-0">
                  #{i + 1}
                </span>
                <img
                  src={`${product.images[0]?.url}?tr=w-60,h-60,fo-auto`}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark text-sm line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {product.category?.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-dark text-sm">
                    ₹{product.discountedPrice}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {product.sold} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}