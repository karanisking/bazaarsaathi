const express = require('express')
const router = express.Router()
const {
  getImageKitAuth,
  uploadImage,
  deleteImage,
} = require('../controllers/uploadController')
const { protect } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/roleMiddleware')


router.use(protect, isAdmin)

router.get('/auth',        getImageKitAuth)
router.post('/',           uploadImage)
router.delete('/:fileId',  deleteImage)

module.exports = router