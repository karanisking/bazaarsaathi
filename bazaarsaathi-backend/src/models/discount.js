// src/models/Discount.model.js
const mongoose = require('mongoose')

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    // ── Type & Value ──────────────────────────────────────────
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: [true, 'Discount type is required'],
      // percentage → e.g. 20% off
      // flat       → e.g. ₹100 off
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 1,
      // if type=percentage → 1 to 100
      // if type=flat       → any positive number
    },

    // ── Caps & Conditions ─────────────────────────────────────
    maxDiscountAmount: {
      // Only for percentage type
      // e.g. 20% off but max ₹300 off
      type: Number,
      default: null,
    },
    minOrderValue: {
      // Minimum cart total to apply this code
      type: Number,
      default: 0,
    },

    // ── Applicability ─────────────────────────────────────────
    applicableTo: {
      type: {
        type: String,
        enum: ['all', 'category', 'product'],
        default: 'all',
      },
      ids: [
        {
          type: mongoose.Schema.Types.ObjectId,
          // category _ids or product _ids depending on type above
        },
      ],
    },

    // ── Validity ─────────────────────────────────────────────
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    usageLimit: {
      type: Number,
      required: [true, 'Usage limit is required'],
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual: quick validity check
discountSchema.virtual('isValid').get(function () {
  return (
    this.isActive &&
    this.expiryDate > new Date() &&
    this.usedCount < this.usageLimit
  )
})

module.exports = mongoose.model('Discount', discountSchema)