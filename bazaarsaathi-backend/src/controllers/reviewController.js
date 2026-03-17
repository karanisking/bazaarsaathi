const Review = require('../models/review')
const Order  = require('../models/order')
const { validate, reviewSchema, overallRatingSchema } = require('../utils/validator')


// ── Create individual product review ─────────────────────────
const createReview = async (req, res, next) => {
  try {
    const { orderId, productId, rating, comment } = validate(reviewSchema, req.body)

    const order = await Order.findOne({ _id: orderId, user: req.user.id })
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }
    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review after your order is delivered.',
      })
    }

    const inOrder = order.items.some((i) => i.product.toString() === productId)
    if (!inOrder) {
      return res.status(400).json({
        success: false,
        message: 'This product was not part of the specified order.',
      })
    }

    // Scoped to this order — correct, allows same product in different orders
    const exists = await Review.findOne({
      user:    req.user.id,
      product: productId,
      order:   orderId,
    })
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product for this order.',
      })
    }

    // Carry over overallRating if already set on this order
    const existingOrderReview = await Review.findOne({
      user:  req.user.id,
      order: orderId,
    })
    const existingOverallRating  = existingOrderReview?.overallRating  ?? null
    const existingOverallComment = existingOrderReview?.overallComment ?? ''

    const review = await Review.create({
      user:           req.user.id,
      product:        productId,
      order:          orderId,
      rating,
      comment,
      overallRating:  existingOverallRating,
      overallComment: existingOverallComment,
    })

    // ── Check if ALL products in this order are now reviewed ──
    // Only mark isRated=true when every unique product has a review
    const uniqueProductIds = [
      ...new Set(order.items.map((i) => i.product.toString())),
    ]
    const reviewCount = await Review.countDocuments({
      user:    req.user.id,
      order:   orderId,
      product: { $in: uniqueProductIds },
    })
    const allReviewed = reviewCount >= uniqueProductIds.length

    if (allReviewed && !order.isRated) {
      // Use findByIdAndUpdate to avoid triggering pre-save hook
      await Order.findByIdAndUpdate(orderId, { isRated: true })
    }

    await review.populate('user', 'name')
    res.status(201).json({
      success: true,
      message: 'Review submitted.',
      data:    review,
    })
  } catch (err) {
    next(err)
  }
}


// ── Submit / update overall order rating ─────────────────────
// POST /api/reviews/overall
// User submits one overall rating + comment per order
// Updates all reviews of that order by this user
const submitOverallRating = async (req, res, next) => {
  try {
    const { orderId, overallRating, overallComment } = validate(
      overallRatingSchema,
      req.body
    )

    const order = await Order.findOne({ _id: orderId, user: req.user.id })
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }
    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate a delivered order.',
      })
    }

    // Check if overall already submitted
    const alreadyRated = await Review.findOne({
      user:          req.user.id,
      order:         orderId,
      overallRating: { $ne: null },
    })
    if (alreadyRated) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an overall rating for this order.',
      })
    }

    // Update all reviews for this order by this user
    await Review.updateMany(
      { user: req.user.id, order: orderId },
      { $set: { overallRating, overallComment: overallComment ?? '' } }
    )

    // Also store on order directly for quick lookup
    await Order.findByIdAndUpdate(orderId, {
      overallRating,
      overallComment: overallComment ?? '',
      isRated: true,
    })

    res.status(200).json({
      success: true,
      message: 'Overall rating submitted.',
      data: { overallRating, overallComment },
    })
  } catch (err) {
    next(err)
  }
}


// ── Get overall rating for an order ──────────────────────────
// GET /api/reviews/overall/:orderId
const getOverallRating = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      order:         req.params.orderId,
      user:          req.user.id,
      overallRating: { $ne: null },
    })

    res.status(200).json({
      success: true,
      data: review
        ? {
            overallRating:  review.overallRating,
            overallComment: review.overallComment,
          }
        : null,
    })
  } catch (err) {
    next(err)
  }
}


// ── Get all reviews for a product ────────────────────────────
const getProductReviews = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 10)
    const skip  = (page - 1) * limit
    const query = { product: req.params.productId }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user',  'name')
        .populate('order', '_id')   // ← add this
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ])

    const allRatings = await Review.find(query).select('rating')
    const avgRating  = allRatings.length > 0
      ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1)
      : 0

    res.status(200).json({
      success: true,
      message: 'Reviews fetched.',
      data: {
        reviews,
        summary: { avgRating: Number(avgRating), totalReviews: total },
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    })
  } catch (err) {
    next(err)
  }
}


// ── Admin: get all reviews ────────────────────────────────────
const getAllReviews = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip  = (page - 1) * limit
    const total = await Review.countDocuments()

    const reviews = await Review.find()
      .populate('user',    'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      message: 'All reviews fetched.',
      data: {
        reviews,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    })
  } catch (err) {
    next(err)
  }
}

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id)
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' })
    }
    res.status(200).json({ success: true, message: 'Review deleted.' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createReview,
  submitOverallRating,
  getOverallRating,
  getProductReviews,
  getAllReviews,
  deleteReview,
}