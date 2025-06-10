const mongoose = require("mongoose");
const express = require("express");
const Book = require("../Books/book.model");
const Order = require("../Order/order.model");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // 1. Total number of orders
    const totalOrders = await Order.countDocuments();

    // 2. Total sales (sum of all totalPrice from orders)
    const totalSalesResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // 3. Trending books statistics
    const trendingBooksCount = await Book.aggregate([
      { $match: { trending: true } },
      { $count: "trendingBooksCount" },
    ]);
    const trendingBooks = trendingBooksCount.length > 0 ? trendingBooksCount[0].trendingBooksCount : 0;

    // 4. Total number of books
    const totalBooks = await Book.countDocuments();

    // 5. Monthly sales (group by month number)
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month number (1-12)
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format monthly sales data
    const monthlySalesFormatted = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlySales.find((item) => item._id === i + 1);
      return {
        month: i + 1,
        totalSales: monthData ? monthData.totalSales : 0,
        totalOrders: monthData ? monthData.totalOrders : 0,
      };
    });

    res.status(200).json({
      totalOrders,
      totalSales,
      trendingBooks,
      totalBooks,
      monthlySales: monthlySalesFormatted,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

module.exports = router;