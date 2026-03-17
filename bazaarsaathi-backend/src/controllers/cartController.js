const Cart = require('../models/cart')
const Product = require('../models/product')
const { validate, addToCartSchema, updateCartSchema } = require('../utils/validator')

const PRODUCT_FIELDS = 'name sellingPrice discountedPrice discountPercentage images stock'

const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', PRODUCT_FIELDS)

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty.',
        data: { items: [], itemsTotal: 0 },
      })
    }

    // Calculate total on the fly
    const itemsTotal = cart.items.reduce((sum, item) => {
      const price = item.product?.discountedPrice ?? item.product?.sellingPrice ?? 0
      return sum + price * item.quantity
    }, 0)

    res.status(200).json({
      success: true,
      message: 'Cart fetched.',
      data: { ...cart.toObject(), itemsTotal },
    })
  } catch (err) {
    next(err)
  }
}

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = validate(addToCartSchema, req.body)

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }
    if (product.stock === 0) {
      return res.status(400).json({ success: false, message: 'Product is out of stock.' })
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available in stock.`,
      })
    }

    let cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      })
    } else {
      const idx = cart.items.findIndex((i) => i.product.toString() === productId)
      if (idx > -1) {
        const newQty = cart.items[idx].quantity + quantity
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} item(s) available in stock.`,
          })
        }
        cart.items[idx].quantity = newQty
      } else {
        cart.items.push({ product: productId, quantity })
      }
      await cart.save()
    }

    await cart.populate('items.product', PRODUCT_FIELDS)
    res.status(200).json({ success: true, message: 'Item added to cart.', data: cart })
  } catch (err) {
    next(err)
  }
}


const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = validate(updateCartSchema, req.body)
    const { productId } = req.params

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' })
    }
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available in stock.`,
      })
    }

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' })
    }

    const idx = cart.items.findIndex((i) => i.product.toString() === productId)
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' })
    }

    cart.items[idx].quantity = quantity
    await cart.save()
    await cart.populate('items.product', PRODUCT_FIELDS)

    res.status(200).json({ success: true, message: 'Cart updated.', data: cart })
  } catch (err) {
    next(err)
  }
}


const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' })
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId)
    await cart.save()
    await cart.populate('items.product', PRODUCT_FIELDS)

    res.status(200).json({ success: true, message: 'Item removed from cart.', data: cart })
  } catch (err) {
    next(err)
  }
}


const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id })
    res.status(200).json({ success: true, message: 'Cart cleared.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart }