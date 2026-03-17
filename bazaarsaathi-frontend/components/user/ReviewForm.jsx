'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/axios'

export default function ReviewForm({ productId, orderId, onSubmitted, onCancel }) {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/reviews', {
        productId,
        orderId,
        rating,
        comment,
      })
      toast.success('Review submitted!')
      onSubmitted(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <h3 className="font-heading font-bold text-dark mb-4">
        Write Your Review
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-2">
            Your Rating
          </label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <span className={
                  s <= (hovered || rating)
                    ? 'text-accent'
                    : 'text-gray-200'
                }>
                  ★
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">
            Comment{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={3}
            maxLength={500}
            className="input resize-none"
          />
          <p className="text-gray-400 text-xs mt-1 text-right">
            {comment.length}/500
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline flex-1"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}
