const Order = require('../models/order')
const Cart = require('../models/cart')
const Product = require('../models/product')
const Discount = require('../models/discount')
const Address = require('../models/address')
const { validate, placeOrderSchema, updateOrderStatusSchema } = require('../utils/validator')

const ORDER_STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']

const calcCouponDiscount = (discount, cartTotal) => {
  let amount = 0
  if (discount.discountType === 'percentage') {
    amount = (cartTotal * discount.discountValue) / 100
    if (discount.maxDiscountAmount && amount > discount.maxDiscountAmount) {
      amount = discount.maxDiscountAmount
    }
  } else {
    amount = discount.discountValue
  }
  return Math.round(Math.min(amount, cartTotal))
}

const getPagination = (query, defaultLimit = 10) => {
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


const placeOrder = async (req, res, next) => {
  console.log('🟢 placeOrder called')
  console.log('🟢 req.body:', JSON.stringify(req.body))
  console.log('🟢 req.user:', req.user)

  try {
    console.log('🟡 step 1: validating body')
    const { addressId, discountCode } = validate(placeOrderSchema, req.body)
    console.log('🟡 step 1 done — addressId:', addressId, 'discountCode:', discountCode)

    console.log('🟡 step 2: fetching cart')
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product')
    console.log('🟡 step 2 done — cart items:', cart?.items?.length)

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' })
    }

    console.log('🟡 step 3: fetching address')
    const address = await Address.findOne({ _id: addressId, user: req.user.id })
    console.log('🟡 step 3 done — address found:', !!address)

    if (!address) {
      return res.status(404).json({ success: false, message: 'Delivery address not found.' })
    }

    console.log('🟡 step 4: building order items')
    const orderItems = []
    let itemsTotal = 0

    for (const item of cart.items) {
      const product = item.product
      if (!product) {
        return res.status(400).json({ success: false, message: 'One or more products no longer exist.' })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" only has ${product.stock} item(s) left in stock.`,
        })
      }
      const pricePaid = product.discountedPrice ?? product.sellingPrice
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url ?? '',
        sellingPrice: product.sellingPrice,
        discountedPrice: pricePaid,
        quantity: item.quantity,
      })
      itemsTotal += pricePaid * item.quantity
    }
    console.log('🟡 step 4 done — itemsTotal:', itemsTotal, 'items:', orderItems.length)

    console.log('🟡 step 5: coupon logic')
    let couponDiscount = 0
    let discountSnapshot = {
      code: '',
      discountType: '',
      discountValue: 0,
      discountAmount: 0,
    }

    if (discountCode) {
      const discount = await Discount.findOne({ code: discountCode })
      console.log('🟡 discount found:', !!discount)
      if (
        discount &&
        discount.isActive &&
        discount.expiryDate > new Date() &&
        discount.usedCount < discount.usageLimit &&
        itemsTotal >= discount.minOrderValue
      ) {
        couponDiscount = calcCouponDiscount(discount, itemsTotal)
        discountSnapshot = {
          code: discount.code,
          discountType: discount.discountType,
          discountValue: discount.discountValue,
          discountAmount: couponDiscount,
        }
        discount.usedCount += 1
        await discount.save()
      }
    }
    console.log('🟡 step 5 done — couponDiscount:', couponDiscount)

    const finalPrice = itemsTotal - couponDiscount
    console.log('🟡 step 6: creating order — finalPrice:', finalPrice)

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      address: {
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 ?? '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      discount: discountSnapshot,
      itemsTotal,
      couponDiscount,
      finalPrice,
    })
    console.log('🟡 step 6 done — order created:', order._id)

    console.log('🟡 step 7: updating stock')
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      })
    }
    console.log('🟡 step 7 done')

    console.log('🟡 step 8: deleting cart')
    await Cart.findOneAndDelete({ user: req.user.id })
    console.log('🟡 step 8 done')

    res.status(201).json({ success: true, message: 'Order placed successfully.', data: order })
    console.log('🟢 placeOrder completed successfully')

  } catch (err) {
    console.error('🔴 placeOrder error:', err.message)
    console.error('🔴 full error:', err)
    next(err)
  }
}

const getMyOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const query = { user: req.user.id }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ])

    res.status(200).json({
      success: true,
      message: 'Orders fetched.',
      data: { orders, pagination: paginationMeta(total, page, limit) },
    })
  } catch (err) {
    next(err)
  }
}

const getMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }
    res.status(200).json({ success: true, message: 'Order fetched.', data: order })
  } catch (err) {
    next(err)
  }
}

const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query
    const { page, limit, skip } = getPagination(req.query, 20)
    const query = {}
    if (status) query.status = status

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ])

    res.status(200).json({
      success: true,
      message: 'All orders fetched.',
      data: { orders, pagination: paginationMeta(total, page, limit) },
    })
  } catch (err) {
    next(err)
  }
}


const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }
    res.status(200).json({ success: true, message: 'Order fetched.', data: order })
  } catch (err) {
    next(err)
  }
}


const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = validate(updateOrderStatusSchema, req.body)

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }

    // Prevent going backwards in status
    const currentIdx = ORDER_STATUSES.indexOf(order.status)
    const newIdx     = ORDER_STATUSES.indexOf(status)
    if (newIdx < currentIdx) {
      return res.status(400).json({
        success: false,
        message: `Cannot revert status from "${order.status}" to "${status}".`,
      })
    }

    order.status = status
    order.statusHistory.push({ status, updatedAt: new Date() })
    await order.save()

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: order,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  placeOrder,
  getMyOrders,
  getMyOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
}