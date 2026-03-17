'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'

export default function AdminReviewsPage() {
  const [reviews,    setReviews]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [pagination, setPagination] = useState(null)
  const [page,       setPage]       = useState(1)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/reviews/all?page=${page}&limit=20`)
        setReviews(res.data.data.reviews)
        setPagination(res.data.data.pagination)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [page])

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      await api.delete(`/reviews/${id}`)
      setReviews((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.')
    }
  }

  const StarDisplay = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span
          key={s}
          className={`text-sm ${s <= rating ? 'text-accent' : 'text-gray-200'}`}
        >
          ★
        </span>
      ))}
      <span className="text-xs font-semibold text-dark ml-1">{rating}</span>
    </div>
  )

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-dark">
            Reviews
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            All customer product reviews
          </p>
        </div>
        {pagination && (
          <p className="text-gray-400 text-sm">
            {pagination.total} total reviews
          </p>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-4 p-4 border-b border-gray-50"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-400 text-sm">No reviews yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">
                    Rating
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">
                    Comment
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">
                    Overall
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr
                    key={review._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-dark line-clamp-1 max-w-[140px]">
                        {review.product?.name ?? '—'}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-dark">
                        {review.user?.name ?? '—'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {review.user?.email ?? ''}
                      </p>
                    </td>

                    {/* Product rating */}
                    <td className="px-4 py-3">
                      <StarDisplay rating={review.rating} />
                    </td>

                    {/* Comment */}
                    <td className="px-4 py-3 max-w-[200px]">
                      {review.comment ? (
                        <p className="text-gray-500 text-xs line-clamp-2 italic">
                          "{review.comment}"
                        </p>
                      ) : (
                        <span className="text-gray-300 text-xs">No comment</span>
                      )}
                    </td>

                    {/* Overall order rating */}
                    <td className="px-4 py-3">
                      {review.overallRating ? (
                        <div className="space-y-1">
                          <StarDisplay rating={review.overallRating} />
                          {review.overallComment && (
                            <p className="text-gray-400 text-xs italic line-clamp-1 max-w-[140px]">
                              "{review.overallComment}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day:   'numeric',
                        month: 'short',
                        year:  'numeric',
                      })}
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-error text-xs font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
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
  )
}