const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByBook,
  updateReview,
  deleteReview,
  getAllReviews,
} = require('./review.controller');
const { authenticateAdmin } = require('../middleware/auth');
const verifyAdminToken = require('../middleware/verifyToken');

// Request logging middleware
router.use((req, res, next) => {
  // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // console.log('Headers:', req.headers);
  // console.log('Body:', req.body);
  next();
});

// Routes
router.post('/', verifyAdminToken, createReview);
router.get('/book/:bookId', getReviewsByBook);
router.put('/:reviewId', verifyAdminToken, updateReview);
router.delete('/:reviewId', verifyAdminToken, deleteReview);
router.get('/all', authenticateAdmin, getAllReviews);

module.exports = router;