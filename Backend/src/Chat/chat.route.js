const express = require('express');
const jwt = require('jsonwebtoken');
const Chat = require('./chat.model');
const User = require('../user/user.model');
const Book = require('../Books/book.model');
const router = express.Router();
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Middleware to verify user token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Get all chats for a user
router.get('/chats', verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
    .populate('product', 'title author image')
    .populate('buyer', 'userName firstName lastName')
    .populate('seller', 'userName firstName lastName')
    .populate('messages.sender', 'userName firstName lastName')
    .sort({ lastMessage: -1 });

    res.status(200).json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// Get specific chat
router.get('/chats/:chatId', verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId)
      .populate('product', 'title author image price')
      .populate('buyer', 'userName firstName lastName')
      .populate('seller', 'userName firstName lastName')
      .populate('messages.sender', 'userName firstName lastName');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of this chat
    if (chat.buyer._id.toString() !== req.user._id.toString() && 
        chat.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
});

// Create or get existing chat for a product
router.post('/chats/product/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('Attempting to create/find chat for productId:', productId);
    
    // Check if product exists
    const product = await Book.findById(productId);
    if (!product) {
      console.error('Product not found for productId:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Always use admin as the seller
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('Admin user not found');
      return res.status(500).json({ message: 'Admin user not found' });
    }
    const sellerId = adminUser._id;

    // Find existing chat or create new one
    let chat = await Chat.findOne({
      product: productId,
      buyer: req.user._id,
      seller: sellerId
    });

    if (!chat) {
      chat = new Chat({
        product: productId,
        buyer: req.user._id,
        seller: sellerId
      });
      await chat.save();
    }

    // Populate the chat data
    chat = await Chat.findById(chat._id)
      .populate('product', 'title author image price')
      .populate('buyer', 'userName firstName lastName')
      .populate('seller', 'userName firstName lastName')
      .populate('messages.sender', 'userName firstName lastName');

    res.status(200).json({ chat });
  } catch (error) {
    console.error('Error creating/finding chat for productId:', req.params.productId);
    console.error(error.stack || error);
    res.status(500).json({ message: 'Failed to create/find chat', error: error.message });
  }
});

// Send message in a chat
router.post('/chats/:chatId/messages', verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, image } = req.body;

    if ((!content || content.trim().length === 0) && !image) {
      return res.status(400).json({ message: 'Message content or image is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of this chat
    if (chat.buyer.toString() !== req.user._id.toString() && 
        chat.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add message to chat
    chat.messages.push({
      sender: req.user._id,
      content: content ? content.trim() : '',
      image: image || '',
      timestamp: new Date()
    });

    chat.lastMessage = new Date();
    await chat.save();

    // Populate the new message
    const populatedChat = await Chat.findById(chatId)
      .populate('messages.sender', 'userName firstName lastName');

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Mark messages as read
router.patch('/chats/:chatId/read', verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is part of this chat
    if (chat.buyer.toString() !== req.user._id.toString() && 
        chat.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark unread messages as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user._id.toString() && !message.isRead) {
        message.isRead = true;
      }
    });

    await chat.save();

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

module.exports = router; 