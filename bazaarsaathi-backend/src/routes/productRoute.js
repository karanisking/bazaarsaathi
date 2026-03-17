const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require('../controllers/productController')
const { protect } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/roleMiddleware')


router.get('/low-stock', protect, isAdmin, getLowStockProducts)

router.get('/',       getProducts)
router.get('/:id',    getProduct)
router.post('/',      protect, isAdmin, createProduct)
router.put('/:id',    protect, isAdmin, updateProduct)
router.delete('/:id', protect, isAdmin, deleteProduct)

module.exports = router