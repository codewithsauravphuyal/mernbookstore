const mongoose = require('mongoose');
const Order = require('./order.model');
const Book = require('../Books/book.model');
const axios = require('axios');
require('dotenv').config();

const createAOrder = async (req, res) => {
  try {
    const { productIds, quantities } = req.body; // Expect quantities array in request body

    if (!quantities || productIds.length !== quantities.length) {
      return res.status(400).json({
        message: 'Quantities must be provided for each product ID',
      });
    }

    // Fetch all products
    const products = await Book.find({ _id: { $in: productIds } });

    // Create a map of product IDs to their details
    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    // Validate stock for each product
    const outOfStockProducts = [];
    const orderItems = productIds.map((id, index) => {
      const product = productMap[id];
      const qty = Number(quantities[index]);
      if (!product) {
        outOfStockProducts.push({ id, title: 'Unknown Product', reason: 'Not found' });
      } else if (product.quantity < qty || qty <= 0) {
        outOfStockProducts.push({ id, title: product.title, reason: 'Insufficient stock or invalid quantity' });
      }
      return { id, qty };
    });

    if (outOfStockProducts.length > 0) {
      return res.status(400).json({
        message: 'Some items are out of stock or invalid',
        outOfStock: outOfStockProducts,
      });
    }

    // Calculate total price
    const totalPrice = orderItems.reduce((sum, item) => {
      const product = productMap[item.id];
      return sum + (product.price * item.qty);
    }, 0);

    // Create the order
    const newOrder = new Order({
      ...req.body,
      productIds: productIds, // Store as array of ObjectIds
      quantities, // Store quantities
      totalPrice,
      paymentStatus: req.body.paymentMethod === 'COD' ? 'Pending' : 'Pending',
      orderStatus: 'Pending',
    });

    const savedOrder = await newOrder.save();

    // Update product quantities and sold counts
    for (const item of orderItems) {
      await Book.updateOne(
        { _id: item.id },
        {
          $inc: {
            quantity: -item.qty,
            sold: item.qty
          }
        }
      );
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Failed to create order',
      error: error.message
    });
  }
};

const getOrderByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ email })
      .populate('productIds', 'title price coverImage category')
      .sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders by email:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching order by ID: ${id}`); // Debug log
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn(`Invalid order ID: ${id}`);
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    const order = await Order.findById(id).populate('productIds', 'title price coverImage category');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    console.log('Fetching all orders'); // Debug log
    const orders = await Order.find()
      .populate('productIds', 'title price coverImage category')
      .sort({ createdAt: -1 });
    console.log(`Found ${orders.length} orders`);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const { orderStatus } = req.body;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validation for COD orders
    if (order.paymentMethod === "COD") {
      // COD order cannot be marked Delivered if payment is still Pending
      if (orderStatus === "Delivered" && order.paymentStatus !== "Completed") {
        return res.status(400).json({
          message: "COD order cannot be marked 'Delivered' if payment is still pending. Please mark payment as completed first."
        });
      }

      // For COD, payment should be marked Completed when order is Delivered
      if (orderStatus === "Delivered") {
        order.paymentStatus = "Completed";
      }
    }

    // Validation for eSewa (online) payments
    if (order.paymentMethod === "eSewa") {
      // eSewa orders must have payment completed before any status change
      if (order.paymentStatus !== "Paid") {
        return res.status(400).json({
          success: false,
          message: "eSewa orders must have completed payment before updating order status."
        });
      }
      
      // Additional validation for eSewa orders:
      // - Can't be marked Delivered if not yet Shipped
      if (orderStatus === "Delivered" && order.orderStatus !== "Shipped") {
        return res.status(400).json({
          message: "Order must be shipped before it can be marked as delivered."
        });
      }
    }

    // General validations for all order types
    // 1. Can't change status from Delivered or Cancelled
    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Order status cannot be changed from ${order.orderStatus}.`
      });
    }

    // 2. Validate the new status is one of allowed values
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (orderStatus && !allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Update the order status
    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[${new Date().toISOString()}] Updating payment status for order ID: ${id}`);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn(`Invalid order ID format: ${id}`);
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const { paymentStatus } = req.body;
    console.log(`Requested payment status: ${paymentStatus}`);
    if (!['Pending', 'Completed', 'Failed'].includes(paymentStatus)) {
      console.warn(`Invalid payment status: ${paymentStatus}`);
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      console.warn(`Order not found for ID: ${id}`);
      return res.status(404).json({ message: `Order not found for ID: ${id}` });
    }

    // For COD orders, can only change from Pending to Completed
    if (order.paymentMethod === 'COD') {
      console.log(`COD order, current payment status: ${order.paymentStatus}`);
      if (order.paymentStatus === 'Completed') {
        return res.status(400).json({
          message: 'COD payment already marked as completed'
        });
      }
      if (paymentStatus !== 'Completed') {
        return res.status(400).json({
          message: 'COD payments can only be marked as Completed'
        });
      }
    }

    order.paymentStatus = paymentStatus;
    const updatedOrder = await order.save();
    console.log(`Payment status updated to ${paymentStatus} for order ID: ${id}`);

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating payment status:`, {
      error: error.message,
      stack: error.stack,
      orderId: id,
      paymentStatus: req.body.paymentStatus
    });
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
};

// Verify eSewa payment
const verifyEsewaPayment = async (req, res) => {
  try {
    const { orderId, transactionId, amount } = req.body;

    if (!orderId || !transactionId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification data"
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Verify payment amount matches order total
    if (order.totalAmount !== amount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch"
      });
    }

    // Update order with payment details
    order.paymentStatus = "Paid";
    order.paymentMethod = "eSewa";
    order.paymentDetails = {
      transactionId,
      paymentDate: new Date(),
      paymentMethod: "eSewa"
    };
    order.orderStatus = "Confirmed";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order
    });

  } catch (error) {
    console.error("eSewa payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
};

module.exports = {
  createAOrder,
  getOrderByEmail,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  verifyEsewaPayment,
  updatePaymentStatus,
};