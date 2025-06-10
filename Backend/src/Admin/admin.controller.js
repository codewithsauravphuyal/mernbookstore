const Book = require("../Books/book.model");
const Order = require("../Order/order.model");

const getAdminDashboardData = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const trendingBooks = await Book.countDocuments({ trending: true });
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      { $match: {} },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.status(200).json({
      totalBooks,
      totalSales: totalSales[0]?.total || 0,
      trendingBooks,
      totalOrders,
      monthlyOrders: monthlyOrders.map((item) => ({
        month: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

module.exports = { getAdminDashboardData };