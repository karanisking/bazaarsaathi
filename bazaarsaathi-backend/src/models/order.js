// src/models/Order.model.js
const mongoose = require('mongoose')

const ORDER_STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']

// ── Snapshot of each product at time of order ──────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    sellingPrice: { type: Number, required: true },    // MRP at time of order
    discountedPrice: { type: Number, required: true }, // price paid per unit
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

// ── Status timeline entry ──────────────────────────────────────
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [orderItemSchema],

    // ── Address snapshot (not a ref, so it never changes) ─────
    address: {
      label: String,
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
    },

    // ── Coupon applied ────────────────────────────────────────
    discount: {
      code: { type: String, default: '' },
      discountType: { type: String, enum: ['percentage', 'flat', ''], default: '' },
      discountValue: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },  // actual ₹ saved
    },

    // ── Price breakdown ───────────────────────────────────────
    itemsTotal: { type: Number, required: true },     // sum before coupon
    couponDiscount: { type: Number, default: 0 },     // ₹ off from coupon
    finalPrice: { type: Number, required: true },     // itemsTotal - couponDiscount

    paymentMethod: {
      type: String,
      default: 'COD',
    },

    // ── Status ───────────────────────────────────────────────
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Placed',
    },
    statusHistory: [statusHistorySchema],    // full timeline for order tracker UI

    // ── Review gate ──────────────────────────────────────────
    isRated: {
      type: Boolean,
      default: false,   // flipped to true after user submits review
    },
  },
  { timestamps: true }
)

// Auto-push first status on create
// ── Auto-push first status on create ─────────────────────────
orderSchema.pre('save', function () {
  // No `next` parameter — use async/await style
  // Mongoose handles errors automatically when no next() is used
  if (this.isNew) {
    this.statusHistory = [{ status: 'Placed', updatedAt: new Date() }]
  }
})

module.exports = mongoose.model('Order', orderSchema)