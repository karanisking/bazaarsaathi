const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    // Overall order rating — submitted once per order
    // Same value stored on every review belonging to that order
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    overallComment: {
      type: String,
      trim: true,
      maxlength: [500, 'Overall comment cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
)

// One review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)