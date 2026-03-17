const express = require('express')
const router  = express.Router()
const {
  createReview,
  submitOverallRating,
  getOverallRating,
  getProductReviews,
  getAllReviews,
  deleteReview,
} = require('../controllers/reviewController')
const { protect } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/roleMiddleware')

router.post('/',               protect, createReview)
router.post('/overall',        protect, submitOverallRating)   // ← new
router.get('/overall/:orderId',protect, getOverallRating)      // ← new
router.get('/product/:productId',        getProductReviews)
router.get('/all',             protect, isAdmin, getAllReviews)
router.delete('/:id', protect, isAdmin, deleteReview) 

module.exports = router