import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getBaseUrl from '../../utils/getBaseUrl';
import { FiTrash, FiStar } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import Loading from '../../components/Loading';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${getBaseUrl()}/api/reviews/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setReviews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load reviews',
        });
      }
    };

    fetchReviews();
  }, []);

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
        setReviews(reviews.filter((review) => review._id !== reviewId));
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

  if (loading) return <Loading />;

  return (
    <div className="p-6 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews available.
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <motion.div
                key={review._id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {review.book?.title || 'Unknown Book'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      By {review.user?.userName || 'Anonymous'} ({review.user?.email || 'No email'})
                    </p>
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
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash className="h-5 w-5" />
                  </button>
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
                {review.verifiedPurchase && (
                  <span className="inline-flex items-center text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded mt-2">
                    <FaCheckCircle className="mr-1" /> Verified Purchase
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReviewList;