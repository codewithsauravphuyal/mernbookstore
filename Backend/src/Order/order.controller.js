const mongoose = require('mongoose');
const Order = require('./order.model');
const axios = require('axios');
require('dotenv').config();

const createAOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      paymentStatus: req.body.paymentMethod === 'COD' ? 'Pending' : 'Pending',
      orderStatus: 'Pending',
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create an order', error: error.message });
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

    // Validation for Khalti (online) payments
    if (order.paymentMethod === "Khalti") {
      // Khalti orders must have payment completed before any status change
      if (order.paymentStatus !== "Completed") {
        return res.status(400).json({
          message: "Khalti orders must have completed payment before updating order status."
        });
      }

      // Additional validation for Khalti orders:
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


const verifyKhaltiPayment = async (req, res) => {
  try {
    const { token, amount, orderId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      { token, amount },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );
    if (response.data.state.name === 'Completed') {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      order.paymentStatus = 'Completed';
      order.orderStatus = 'Processing';
      await order.save();
      res.status(200).json({ message: 'Payment verified successfully', order });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

module.exports = {
  createAOrder,
  getOrderByEmail,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  verifyKhaltiPayment,
  updatePaymentStatus,
};