const express = require('express')
const router = express.Router()
const {
  placeOrder,
  getMyOrders,
  getMyOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController')
const { protect } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/roleMiddleware')


router.post('/',         protect, placeOrder)
router.get('/my',        protect, getMyOrders)
router.get('/my/:id',    protect, getMyOrder)


router.get('/',          protect, isAdmin, getAllOrders)
router.get('/:id',       protect, isAdmin, getOrderById)
router.put('/:id/status',protect, isAdmin, updateOrderStatus)

module.exports = router