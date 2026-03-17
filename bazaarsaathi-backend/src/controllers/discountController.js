const Discount = require('../models/discount')
const { validate, discountSchema, updateDiscountSchema, applyDiscountSchema } = require('../utils/validator')

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

const getDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, message: 'Discounts fetched.', data: discounts })
  } catch (err) {
    next(err)
  }
}

const getDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id)
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found.' })
    }
    res.status(200).json({ success: true, message: 'Discount fetched.', data: discount })
  } catch (err) {
    next(err)
  }
}

// @route  POST /api/discounts
// @access Admin
const createDiscount = async (req, res, next) => {
  try {
    const data = validate(discountSchema, req.body)
    const discount = await Discount.create(data)
    res.status(201).json({ success: true, message: 'Discount code created.', data: discount })
  } catch (err) {
    next(err)
  }
}

// @route  PUT /api/discounts/:id
// @access Admin
// Only allows toggling isActive, updating expiry, updating usageLimit
const updateDiscount = async (req, res, next) => {
  try {
    const data = validate(updateDiscountSchema, req.body)
    const discount = await Discount.findByIdAndUpdate(req.params.id, data, { new: true })
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found.' })
    }
    res.status(200).json({ success: true, message: 'Discount updated.', data: discount })
  } catch (err) {
    next(err)
  }
}

// @route  DELETE /api/discounts/:id
// @access Admin
const deleteDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id)
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found.' })
    }
    res.status(200).json({ success: true, message: 'Discount deleted.' })
  } catch (err) {
    next(err)
  }
}

// @route  POST /api/discounts/apply
// @access Private (User)
// Previews discount — does NOT increment usedCount
// usedCount increments only when order is placed
const applyDiscount = async (req, res, next) => {
  try {
    const { code, cartTotal, productIds, categoryIds } = validate(applyDiscountSchema, req.body)

    const discount = await Discount.findOne({ code })
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Invalid discount code.' })
    }
    if (!discount.isActive) {
      return res.status(400).json({ success: false, message: 'This discount code is inactive.' })
    }
    if (discount.expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: 'This discount code has expired.' })
    }
    if (discount.usedCount >= discount.usageLimit) {
      return res.status(400).json({ success: false, message: 'This discount code has reached its usage limit.' })
    }
    if (cartTotal < discount.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${discount.minOrderValue} required for this code.`,
      })
    }

    // Check applicability
    if (discount.applicableTo.type === 'category') {
      const valid = discount.applicableTo.ids.some((id) =>
        categoryIds.map(String).includes(String(id))
      )
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: 'This code is not applicable to any item in your cart.',
        })
      }
    }

    if (discount.applicableTo.type === 'product') {
      const valid = discount.applicableTo.ids.some((id) =>
        productIds.map(String).includes(String(id))
      )
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: 'This code is not applicable to any item in your cart.',
        })
      }
    }

    const discountAmount = calcCouponDiscount(discount, cartTotal)

    res.status(200).json({
      success: true,
      message: 'Discount code is valid.',
      data: {
        code: discount.code,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        maxDiscountAmount: discount.maxDiscountAmount,
        discountAmount,
        finalTotal: cartTotal - discountAmount,
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  applyDiscount,
}