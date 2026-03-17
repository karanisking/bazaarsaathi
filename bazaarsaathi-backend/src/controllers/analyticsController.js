const Order = require('../models/order')
const Product = require('../models/product')
const User = require('../models/user')


const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [
      totalOrdersToday,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      revenueResult,
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ status: 'Placed' }),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0, $lt: 5 } }),
      User.countDocuments({ role: 'USER' }),
      Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } },
      ]),
    ])

    res.status(200).json({
      success: true,
      message: 'Dashboard stats fetched.',
      data: {
        totalOrdersToday,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        totalRevenue: revenueResult[0]?.total ?? 0,
      },
    })
  } catch (err) {
    next(err)
  }
}

''
const getTopProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ sold: { $gt: 0 } })
      .sort({ sold: -1 })
      .limit(10)
      .populate('category', 'name')
      .select('name sold sellingPrice discountedPrice discountPercentage images category stock')

    res.status(200).json({
      success: true,
      message: 'Top selling products fetched.',
      data: products,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getDashboardStats, getTopProducts }
