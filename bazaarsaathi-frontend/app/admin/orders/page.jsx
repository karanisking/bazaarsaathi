'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/axios'
import DataTable from '@/components/admin/DataTable'

const STATUS_STYLES = {
  Placed:            'status-placed',
  Confirmed:         'status-confirmed',
  Shipped:           'status-shipped',
  'Out for Delivery':'status-out-for-delivery',
  Delivered:         'status-delivered',
}

const ALL_STATUSES = ['', 'Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']

export default function AdminOrdersPage() {
  const [orders,     setOrders]     = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [status,     setStatus]     = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page, limit: 15, ...(status && { status }) })
        const res = await api.get(`/orders?${params}`)
        setOrders(res.data.data.orders)
        setPagination(res.data.data.pagination)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [page, status])

  const columns = [
    {
      key: 'id', label: 'Order ID',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-dark">
          #{row._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'customer', label: 'Customer',
      render: (row) => (
        <div>
          <p className="font-semibold text-dark text-sm">{row.user?.name}</p>
          <p className="text-gray-400 text-xs">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'items', label: 'Items',
      render: (row) => (
        <span className="text-dark">
          {row.items.length} item{row.items.length > 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'total', label: 'Total',
      render: (row) => (
        <span className="font-bold text-dark">₹{row.finalPrice}</span>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={STATUS_STYLES[row.status] ?? 'badge'}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'date', label: 'Date',
      render: (row) => (
        <span className="text-gray-400 text-xs">
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <Link
          href={`/admin/orders/${row._id}`}
          className="text-primary text-xs font-semibold hover:underline"
        >
          Manage →
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-4">

      {/* Filter by status */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
              ${status === s
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 text-dark hover:border-primary'
              }`}
          >
            {s || 'All Orders'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found."
      />

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