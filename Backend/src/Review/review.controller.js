const Review = require('./review.model');
const Order = require('../Order/order.model');
const Book = require('../Books/book.model');
const { uploadImage } = require('../utils/cloudinary');
const mongoose = require('mongoose');

// Create a review
const createReview = async (req, res) => {
  try {
    const { book, rating, comment, images } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(book)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    // Check if user has purchased and received the book
    const order = await Order.findOne({
      email: req.user.email,
      productIds: book,
      orderStatus: 'Delivered',
    });

    if (!order) {
      return res.status(403).json({ message: 'You can only review books from delivered orders' });
    }

    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({ book, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = new Review({
      book,
      user: userId,
      rating: Number(rating),
      comment,
      images,
      verifiedPurchase: true,
    });

    await review.save();
    await Book.updateBookRating(book);
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
};

// Get reviews for a book
const getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const reviews = await Review.find({ book: bookId })
      .populate('user', 'userName')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    review.rating = rating ? Number(rating) : review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;

    await review.save();
    await Book.updateBookRating(review.book);
    res.status(200).json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Admins can delete any review, users can only delete their own
    if (review.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    const bookId = review.book;
    await review.deleteOne();
    await Book.updateBookRating(bookId);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};

// Get all reviews (admin only)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'userName email')
      .populate('book', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsByBook,
  updateReview,
  deleteReview,
  getAllReviews,
};