const express      = require('express')
const cors         = require('cors')
const morgan       = require('morgan')
const cookieParser = require('cookie-parser')
const errorHandler = require('./src/middleware/errorMiddleware')
const authRoutes    = require('./src/routes/authRoute');
const categoryRoutes = require('./src/routes/categoryRoute');
const productRoutes  = require('./src/routes/productRoute');
const addressRoutes  = require('./src/routes/addressRoute');
const cartRoutes     = require('./src/routes/cartRoute');
const discountRoutes = require('./src/routes/discountRoute');
const orderRoutes    = require('./src/routes/orderRoute');
const reviewRoutes   = require('./src/routes/reviewRoute');
const uploadRoutes   = require('./src/routes/uploadRoute');
const analyticsRoutes = require('./src/routes/analyticsRoute');


const app = express()

// ─── Core Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))      // 10mb for base64 image uploads
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',authRoutes)
app.use('/api/categories',categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/discounts',discountRoutes)
app.use('/api/orders',orderRoutes)
app.use('/api/reviews',reviewRoutes)
app.use('/api/upload',uploadRoutes)
app.use('/api/analytics',analyticsRoutes)

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: '🚀 API is running.' })
})

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` })
})

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler)

module.exports = app