const errorHandler = (err, req, res, next) => {
    console.error(`❌ [${req.method} ${req.originalUrl}]`, err.message)
  
    // Thrown manually by validate() in validator.js
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      })
    }
  
    // Mongoose field-level validation failed
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(', ')
      return res.status(400).json({ success: false, message })
    }
  
    // Mongoose duplicate key — unique index violated
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]
      const value = err.keyValue[field]
      return res.status(400).json({
        success: false,
        message: `"${value}" already exists for field: ${field}.`,
      })
    }
  
    // Mongoose invalid ObjectId — e.g. /products/abc
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid value for field: ${err.path}.`,
      })
    }
  
    // JWT errors (fallback — normally caught in auth.middleware)
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' })
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' })
    }
  
    // Generic fallback
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error.',
    })
  }
  
  module.exports = errorHandler
  