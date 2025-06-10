const express = require("express");
const {
  createAOrder,
  getOrderByEmail,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  verifyKhaltiPayment,
} = require("./order.controller");
const { authenticateAdmin } = require("../middleware/auth");

const router = express.Router();

// Request logging middleware
router.use((req, res, next) => {
  // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // console.log('Headers:', req.headers);
  // console.log('Body:', req.body);
  next();
});

// Routes
router.post("/", createAOrder);
router.get("/email/:email", getOrderByEmail);
router.get("/all", authenticateAdmin, getAllOrders);
router.get("/:id", authenticateAdmin, getOrderById);
router.put("/status/:id", authenticateAdmin, updateOrderStatus);
router.put('/payment-status/:id', authenticateAdmin, updatePaymentStatus);
router.post("/verify-payment", verifyKhaltiPayment);

module.exports = router;