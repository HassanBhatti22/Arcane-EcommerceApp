const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/Product');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Total Revenue (sum of paid orders)
        const revenueData = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Total Orders
        const totalOrders = await Order.countDocuments();

        // Total Customers (users with role 'user')
        const totalCustomers = await User.countDocuments({ role: 'user' });

        // Low Stock Products (stock < 10)
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
            .select('name stock')
            .limit(5);

        // Recent Orders (last 5)
        const recentOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id user totalPrice isPaid isDelivered createdAt');

        // Top Categories by sales count
        const categoryStats = await Order.aggregate([
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$productInfo.category',
                    count: { $sum: '$orderItems.qty' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            revenue: totalRevenue,
            orders: totalOrders,
            customers: totalCustomers,
            lowStockCount: lowStockProducts.length,
            lowStockProducts,
            recentOrders,
            topCategories: categoryStats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getDashboardStats
};
