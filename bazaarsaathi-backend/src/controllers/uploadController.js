const imagekit = require('../config/imagekit')


const getImageKitAuth = (req, res) => {
  const params = imagekit.getAuthenticationParameters()
  res.status(200).json({ success: true, message: 'ImageKit auth params.', data: params })
}


const uploadImage = async (req, res, next) => {
  try {
    const { file, fileName, folder = '/ecommerce/products' } = req.body
    if (!file || !fileName) {
      return res.status(400).json({ success: false, message: '"file" and "fileName" are required.' })
    }

    const result = await imagekit.upload({ file, fileName, folder })

    res.status(200).json({
      success: true,
      message: 'Image uploaded.',
      data: {
        url: result.url,
        fileId: result.fileId,
        thumbnailUrl: result.thumbnailUrl,
      },
    })
  } catch (err) {
    next(err)
  }
}


const deleteImage = async (req, res, next) => {
  try {
    await imagekit.deleteFile(req.params.fileId)
    res.status(200).json({ success: true, message: 'Image deleted.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getImageKitAuth, uploadImage, deleteImage }