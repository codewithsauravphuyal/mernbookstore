import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiStar, FiChevronLeft, FiEdit, FiTrash } from "react-icons/fi";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFetchbookbyIdQuery } from "../../redux/features/Books/BookApi";
import { addToCart } from "../../redux/features/cart/cartSlice";
import getImgUrl from "../../utils/getImgUrl";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import getBaseUrl from "../../utils/getBaseUrl";
import { FaRegComment, FaRegImages, FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import ProductChat from "../../components/ProductChat";

const SingleBook = () => {
  const { id } = useParams();
  const { data: book, isLoading, isError } = useFetchbookbyIdQuery(id, { skip: !id });
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userCanReview, setUserCanReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    if (product.quantity > 0) {
      dispatch(addToCart(product));
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Added to Cart!',
        text: `${product.title} has been added to your cart.`,
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Out of Stock',
        text: 'This book is currently out of stock.',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${getBaseUrl()}/api/reviews/book/${id}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load reviews',
        });
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  // Check if user can review
  useEffect(() => {
    const checkUserCanReview = async () => {
      if (!currentUser) {
        setUserCanReview(false);
        return;
      }

      try {
        const response = await axios.get(`${getBaseUrl()}/api/orders/email/${currentUser.email}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const hasPurchased = response.data.some(
          (order) =>
            order.productIds.some((product) => product._id === id) &&
            order.orderStatus === 'Delivered'
        );
        const hasReviewed = reviews.some((review) => review.user._id === currentUser.id);
        setUserCanReview(hasPurchased && !hasReviewed);
      } catch (error) {
        console.error("Error checking review eligibility:", error);
      }
    };

    checkUserCanReview();
  }, [currentUser, reviews, id]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      Swal.fire({
        icon: 'error',
        title: 'Maximum 3 images allowed',
        text: 'You can upload up to 3 images per review',
      });
      return;
    }

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
          );

          return {
            url: response.data.secure_url,
            public_id: response.data.public_id,
          };
        })
      );

      setImages([...images, ...uploadedImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      Swal.fire({
        icon: 'error',
        title: 'Image Upload Failed',
        text: 'Failed to upload images',
      });
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Submit or update review
  const submitReview = async () => {
    if (rating === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Rating required',
        text: 'Please select a rating between 1 and 5 stars',
      });
      return;
    }

    if (!reviewText.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Review text required',
        text: 'Please write your review before submitting',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingReview) {
        // Update existing review
        const response = await axios.put(
          `${getBaseUrl()}/api/reviews/${editingReview._id}`,
          {
            rating,
            comment: reviewText,
            images,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        setReviews(reviews.map((r) => (r._id === editingReview._id ? response.data : r)));
        Swal.fire({
          icon: 'success',
          title: 'Review Updated',
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        // Create new review
        const response = await axios.post(
          `${getBaseUrl()}/api/reviews`,
          {
            book: id,
            rating,
            comment: reviewText,
            images,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        setReviews([response.data, ...reviews]);
        setUserCanReview(false);
        Swal.fire({
          icon: 'success',
          title: 'Review Submitted',
          showConfirmButton: false,
          timer: 1500,
        });
      }

      setRating(0);
      setReviewText("");
      setImages([]);
      setEditingReview(null);
    } catch (error) {
      console.error('Error submitting/updating review:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || 'Failed to submit review',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit review
  const editReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setReviewText(review.comment);
    setImages(review.images || []);
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${getBaseUrl()}/api/reviews/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setReviews(reviews.filter((r) => r._id !== reviewId));
        setUserCanReview(true);
        Swal.fire({
          icon: 'success',
          title: 'Review Deleted',
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.error('Error deleting review:', error);
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: error.response?.data?.message || 'Failed to delete review',
        });
      }
    }
  };

  if (!id || isError || (!isLoading && !book)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-4">This book has been removed or does not exist.</p>
          <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Go to Home</Link>
        </div>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          className="text-center text-gray-700 text-xl font-semibold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          Loading...
        </motion.div>
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          className="text-center text-red-600 text-xl font-semibold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          Error loading book info
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 px-4 md:px-8">
      <div className="mb-6">
        <Link
          to="/"
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <FiChevronLeft className="mr-1" /> Back to Home
        </Link>
      </div>

      <motion.div
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative p-8 md:p-12">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center tracking-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {book.title}
          </motion.h1>
          <motion.p
            className="text-center text-lg text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            By {book.author || "Unknown Author"}
          </motion.p>

          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            <motion.div
              className="w-full lg:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <img
                src={getImgUrl(book.coverImage)}
                alt={book.title}
                className="w-full h-[450px] object-cover rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105"
              />
              {book.trending && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-semibold px-4 py-1 rounded-full shadow">
                  Trending
                </div>
              )}
            </motion.div>

            <motion.div
              className="w-full lg:w-1/2 space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="space-y-3">
                <p className="text-gray-700 text-lg">
                  <strong className="text-gray-900">Category:</strong>{" "}
                  <span className="capitalize bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                    {book.category || "Uncategorized"}
                  </span>
                </p>
                <p className="text-gray-700 text-lg">
                  <strong className="text-gray-900">Published:</strong>{" "}
                  {book.publicationDate
                    ? (typeof book.publicationDate === 'string'
                        ? new Date(book.publicationDate).getFullYear()
                        : book.publicationDate)
                    : (book.createdAt ? new Date(book.createdAt).getFullYear() : '')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(book.averageRating) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  ({book.averageRating || 'No'} rating, {book.reviewCount || '0'} reviews)
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Description:</strong> {book.description}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-indigo-600">Rs {book.price}</span>
                  {book.oldPrice && (
                    <span className="text-base text-gray-400 line-through ml-4">Rs {book.oldPrice}</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {book.quantity > 0 ? (
                    <span className="text-green-600 font-medium">
                      {book.quantity} in stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>

              <motion.div className="flex items-center gap-4 mt-8">
                {book.quantity > 0 ? (
                  <button
                    onClick={() => handleAddToCart(book)}
                    className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-indigo-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    className="flex-1 py-3 px-6 bg-gray-400 text-white rounded-lg font-semibold text-lg shadow cursor-not-allowed"
                    disabled
                  >
                    Out of Stock
                  </button>
                )}
                <button
                  onClick={() => navigate(`/chat/${book._id}`)}
                  className="flex items-center gap-2 py-3 px-6 bg-white border border-indigo-600 text-indigo-600 rounded-lg font-semibold text-lg shadow hover:bg-indigo-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l.8-3.2A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Chat with Admin
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="bg-gray-50 p-8 rounded-b-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Book</h3>
          <p className="text-gray-600 leading-relaxed">
            Discover {book.title}, a captivating read that dives deep into{" "}
            {book.category ? book.category.toLowerCase() : "its genre"}. Written by{" "}
            {book.author || "an acclaimed author"}, this book offers a unique perspective and engaging narrative that will keep you hooked from start to finish.
          </p>
        </motion.div>
      </motion.div>

      {/* Reviews Section */}
      <motion.div
        className="max-w-5xl mx-auto mt-16 bg-white rounded-3xl shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaRegComment className="text-indigo-600" />
          Customer Reviews ({reviews.length})
        </h2>

        {userCanReview && !editingReview && (
          <div className="mb-8 bg-indigo-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Write Your Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <FiStar
                      className={`h-6 w-6 ${(hoverRating || rating) >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Share your thoughts about this book..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Images (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <FaRegImages className="inline mr-2" />
                  Select Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 3}
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {images.length}/3 images
                </span>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url}
                      alt={`Review ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiTrash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={submitReview}
              disabled={isSubmitting}
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {editingReview && (
          <div className="mb-8 bg-indigo-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Your Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <FiStar
                      className={`h-6 w-6 ${(hoverRating || rating) >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Share your thoughts about this book..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Images (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <FaRegImages className="inline mr-2" />
                  Select Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 3}
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {images.length}/3 images
                </span>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url}
                      alt={`Review ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiTrash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={submitReview}
                disabled={isSubmitting}
                className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Review'}
              </button>
              <button
                onClick={() => {
                  setEditingReview(null);
                  setRating(0);
                  setReviewText('');
                  setImages([]);
                }}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <motion.div
                key={review._id}
                className="border-b border-gray-200 pb-6 last:border-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.user?.userName || 'Anonymous'}
                    </h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        <FaCheckCircle className="mr-1" /> Verified Purchase
                      </span>
                    )}
                    {currentUser && review.user._id === currentUser.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => editReview(review)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => deleteReview(review._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{review.comment}</p>

                {review.images?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt={`Review ${index + 1}`}
                        className="h-16 w-16 object-cover rounded border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      {showChat && book && (
        <ProductChat product={book} />
      )}
    </div>
  );
};

export default SingleBook;