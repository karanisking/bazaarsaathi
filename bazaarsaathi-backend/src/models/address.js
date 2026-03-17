const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Address', addressSchema)