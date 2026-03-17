// src/models/Category.model.js
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      // auto-generated from name in controller
    },
    image: {
      url: {
        type: String,
        required: [true, 'Category image URL is required'],
      },
      fileId: {
        type: String,
        required: [true, 'Category image fileId is required'],
      },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Category', categorySchema)