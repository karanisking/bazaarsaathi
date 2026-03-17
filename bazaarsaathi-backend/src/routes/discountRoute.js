const express = require('express')
const router = express.Router()
const {
  getDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  applyDiscount,
} = require('../controllers/discountController')
const { protect } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/roleMiddleware')


router.post('/apply', protect, applyDiscount)


router.get('/',       protect, isAdmin, getDiscounts)
router.get('/:id',    protect, isAdmin, getDiscount)
router.post('/',      protect, isAdmin, createDiscount)
router.put('/:id',    protect, isAdmin, updateDiscount)
router.delete('/:id', protect, isAdmin, deleteDiscount)

module.exports = router