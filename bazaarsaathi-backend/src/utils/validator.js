const { z } = require('zod')

// ─────────────────────────────────────────────────────────────
// CORE HELPER - throws 400 with all validation errors joined
// ─────────────────────────────────────────────────────────────
const validate = (schema, data) => {
  // If body is empty or not an object, reject immediately
  if (!data || typeof data !== 'object') {
    const err = new Error('Request body is empty or invalid.')
    err.statusCode = 400
    throw err
  }

  const result = schema.safeParse(data)

  if (!result.success) {
    console.log('🔴 Zod validation failed:')
    console.log('🔴 Input data:', JSON.stringify(data, null, 2))
    console.log('🔴 Errors:', JSON.stringify(result.error.errors, null, 2))
    const errors = result.error?.errors
    const message = Array.isArray(errors) && errors.length > 0
      ? errors.map((e) => e.message).join(', ')
      : 'Invalid request data.'
    const err = new Error(message)
    err.statusCode = 400
    throw err
  }

  return result.data
}

// ─────────────────────────────────────────────────────────────
// REUSABLE FIELDS
// ─────────────────────────────────────────────────────────────
const imageKitObject = z.object({
  url: z.string().url('Invalid image URL'),
  fileId: z.string().min(1, 'ImageKit fileId is required'),
})

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format')

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
 role: z.enum(['USER', 'ADMIN']).default('USER'),  
})

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
})

// ─────────────────────────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────────────────────────
const categorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  image: imageKitObject,
})

const updateCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
  image: imageKitObject.optional(),
})

// ─────────────────────────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters'),
  sellingPrice: z
    .number({ required_error: 'Selling price is required' })
    .positive('Selling price must be positive'),
  discountedPrice: z
    .number()
    .positive('Discounted price must be positive')
    .optional(),
  stock: z
    .number({ required_error: 'Stock is required' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  category: mongoId,
  images: z.array(imageKitObject).min(1, 'At least one image is required'),
})

const updateProductSchema = productSchema.partial()

// ─────────────────────────────────────────────────────────────
// ADDRESS
// ─────────────────────────────────────────────────────────────
const addressSchema = z.object({
  label: z.enum(['Home', 'Office', 'Other']).default('Home'),
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .trim(),
  phone: z
    .string({ required_error: 'Phone is required' })
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  addressLine1: z
    .string({ required_error: 'Address line 1 is required' })
    .min(5, 'Address line 1 must be at least 5 characters')
    .trim(),
  addressLine2: z.string().trim().optional(),
  city: z
    .string({ required_error: 'City is required' })
    .min(2, 'City must be at least 2 characters')
    .trim(),
  state: z
    .string({ required_error: 'State is required' })
    .min(2, 'State must be at least 2 characters')
    .trim(),
  pincode: z
    .string({ required_error: 'Pincode is required' })
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
})

const updateAddressSchema = addressSchema.partial()

// ─────────────────────────────────────────────────────────────
// DISCOUNT
// ─────────────────────────────────────────────────────────────
const discountSchema = z
  .object({
    code: z
      .string({ required_error: 'Code is required' })
      .min(3, 'Code must be at least 3 characters')
      .trim()
      .toUpperCase(),
    discountType: z.enum(['percentage', 'flat'], {
      required_error: 'Discount type is required',
      invalid_type_error: 'discountType must be "percentage" or "flat"',
    }),
    discountValue: z
      .number({ required_error: 'Discount value is required' })
      .positive('Discount value must be positive'),
    maxDiscountAmount: z
      .number()
      .positive('Max discount amount must be positive')
      .nullable()
      .optional(),
    minOrderValue: z
      .number()
      .min(0, 'Min order value cannot be negative')
      .default(0),
    applicableTo: z
      .object({
        type: z.enum(['all', 'category', 'product']).default('all'),
        ids: z.array(mongoId).default([]),
      })
      .default({ type: 'all', ids: [] }),
    expiryDate: z
      .string({ required_error: 'Expiry date is required' })
      .refine((d) => new Date(d) > new Date(), 'Expiry date must be in the future'),
    usageLimit: z
      .number({ required_error: 'Usage limit is required' })
      .int('Must be a whole number')
      .positive('Usage limit must be positive'),
    isActive: z.boolean().optional().default(true),
     firstOrderOnly:    z.boolean().optional().default(false)
})

const updateDiscountSchema = z.object({
  isActive:          z.boolean().optional(),
  expiryDate:        z.string().optional(),
  usageLimit:        z.number({ coerce: true }).int().positive().optional(),
  minOrderValue:     z.number({ coerce: true }).min(0).optional(),
  maxDiscountAmount: z.number({ coerce: true }).nullable().optional(),
  discountValue:     z.number({ coerce: true }).positive().optional(),
  firstOrderOnly:    z.boolean().optional(),
})

// ─────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────
const addToCartSchema = z.object({
  productId: mongoId,
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1')
    .default(1),
})

const updateCartSchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1'),
})

// ─────────────────────────────────────────────────────────────
// ORDER
// ─────────────────────────────────────────────────────────────
const placeOrderSchema = z.object({
  addressId: z
    .string({ required_error: 'Address is required' })
    .min(1, 'Address is required'),
  discountCode: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val?.trim().toUpperCase() || undefined),
})

const updateOrderStatusSchema = z.object({
  status: z.enum(
    ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'],
    {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid order status',
    }
  ),
})

// ─────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────
const reviewSchema = z.object({
  orderId: mongoId,
  productId: mongoId,
  rating: z
    .number({ required_error: 'Rating is required' })
    .int()
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5'),
  comment: z
    .string()
    .trim()
    .max(500, 'Comment cannot exceed 500 characters')
    .optional(),
})

// ─────────────────────────────────────────────────────────────
// DISCOUNT APPLY (user-facing — lighter schema)
// ─────────────────────────────────────────────────────────────
const applyDiscountSchema = z.object({
  code: z
    .string({ required_error: 'Discount code is required' })
    .trim()
    .toUpperCase(),
  cartTotal: z.number().min(0).default(0),
  productIds: z.array(mongoId).default([]),
  categoryIds: z.array(mongoId).default([]),
})

const overallRatingSchema = z.object({
  orderId: z
    .string({ required_error: 'Order ID is required' })
    .min(1),
  overallRating: z
    .number({ required_error: 'Overall rating is required' })
    .int()
    .min(1)
    .max(5),
  overallComment: z
    .string()
    .max(500)
    .optional()
    .default(''),
})

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
  validate,
  registerSchema,
  loginSchema,
  categorySchema,
  updateCategorySchema,
  productSchema,
  updateProductSchema,
  addressSchema,
  overallRatingSchema,
  updateAddressSchema,
  discountSchema,
  updateDiscountSchema,
  applyDiscountSchema,
  addToCartSchema,
  updateCartSchema,
  placeOrderSchema,
  updateOrderStatusSchema,
  reviewSchema,
}