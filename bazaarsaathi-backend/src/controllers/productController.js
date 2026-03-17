const Product = require('../models/product')

const { validate, productSchema, updateProductSchema } = require('../utils/validator')

const calcDiscountPercentage = (sellingPrice, discountedPrice) => {
  if (!discountedPrice || discountedPrice >= sellingPrice) return 0
  return Math.round(((sellingPrice - discountedPrice) / sellingPrice) * 100)
}

const getPagination = (query, defaultLimit = 12) => {
  const page  = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaultLimit))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
})


const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort, inStock } = req.query
    const { page, limit, skip } = getPagination(req.query)

    const query = {}
    if (search)          query.$text = { $search: search }
    if (category)        query.category = category
    if (inStock === 'true') query.stock = { $gt: 0 }

    const sortMap = {
      price_asc:  { discountedPrice: 1 },
      price_desc: { discountedPrice: -1 },
      newest:     { createdAt: -1 },
      popular:    { sold: -1 },
      discount:   { discountPercentage: -1 },
    }
    const sortQuery = sortMap[sort] || { createdAt: -1 }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug image')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ])

    res.status(200).json({
      success: true,
      message: 'Products fetched.',
      data: { products, pagination: paginationMeta(total, page, limit) },
    })
  } catch (err) {
    next(err)
  }
}


const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug image')
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }
    res.status(200).json({ success: true, message: 'Product fetched.', data: product })
  } catch (err) {
    next(err)
  }
}


const createProduct = async (req, res, next) => {
  try {
    const data = validate(productSchema, req.body)

 
    let { sellingPrice, discountedPrice } = data
    if (!discountedPrice || discountedPrice >= sellingPrice) {
      discountedPrice = sellingPrice
    }
    const discountPercentage = calcDiscountPercentage(sellingPrice, discountedPrice)

    const product = await Product.create({ ...data, discountedPrice, discountPercentage })
    await product.populate('category', 'name slug image')

    res.status(201).json({ success: true, message: 'Product created.', data: product })
  } catch (err) {
    next(err)
  }
}

const updateProduct = async (req, res, next) => {
  try {
    const data = validate(updateProductSchema, req.body)

    // Recalculate pricing if price fields are being updated
    if (data.sellingPrice !== undefined || data.discountedPrice !== undefined) {
      const existing = await Product.findById(req.params.id)
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found.' })
      }
      const sellingPrice    = data.sellingPrice    ?? existing.sellingPrice
      const discountedPrice = data.discountedPrice ?? existing.discountedPrice

      if (!data.discountedPrice || data.discountedPrice >= sellingPrice) {
        data.discountedPrice    = sellingPrice
        data.discountPercentage = 0
      } else {
        data.discountPercentage = calcDiscountPercentage(sellingPrice, discountedPrice)
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    ).populate('category', 'name slug image')

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }
    res.status(200).json({ success: true, message: 'Product updated.', data: product })
  } catch (err) {
    next(err)
  }
}


const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }
    res.status(200).json({ success: true, message: 'Product deleted.' })
  } catch (err) {
    next(err)
  }
}


const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ stock: { $lt: 5 } })
      .populate('category', 'name')
      .sort({ stock: 1 })
    res.status(200).json({ success: true, message: 'Low stock products.', data: products })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
}