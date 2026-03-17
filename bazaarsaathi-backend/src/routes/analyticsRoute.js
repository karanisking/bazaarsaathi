const express = require('express')
const router = express.Router()
const {
  getDashboardStats,
  getTopProducts,
} = require('../controllers/analyticsController')
const { protect } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/roleMiddleware')


router.use(protect, isAdmin)

router.get('/dashboard',     getDashboardStats)
router.get('/top-products',  getTopProducts)

module.exports = router