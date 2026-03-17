// src/models/Product.model.js
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },

    // ── Pricing ───────────────────────────────────────────────
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    discountedPrice: {
      // what customer actually pays
      // if not set → same as sellingPrice
      type: Number,
      min: 0,
    },
    discountPercentage: {
      // auto-calculated: ((sellingPrice - discountedPrice) / sellingPrice) * 100
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── Inventory ─────────────────────────────────────────────
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: 0,
      default: 0,
    },

    // ── Relations ─────────────────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },

    // ── Images ────────────────────────────────────────────────
    images: [
      {
        url: { type: String, required: true },     // ImageKit delivery URL
        fileId: { type: String, required: true },  // ImageKit fileId for deletion
      },
    ],

    // ── Analytics ─────────────────────────────────────────────
    sold: {
      type: Number,
      default: 0,     // incremented on every order placed
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual: stock status label
productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'out_of_stock'
  if (this.stock < 5) return 'low_stock'
  return 'in_stock'
})

// Full-text search index
productSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('Product', productSchema)