import React from "react";
import { useFetchAllBooksQuery } from "../redux/features/Books/BookApi";
import getImgUrl from "../utils/getImgUrl";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/features/cart/cartSlice";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ExploreBook = () => {
  const { data: books = [], isLoading, isError } = useFetchAllBooksQuery();
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading books...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load books
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <section className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-6 rounded-xl shadow-2xl mb-12">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Explore Our Book Collection
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Dive into a world of stories, knowledge, and inspiration with our curated selection of books.
        </motion.p>
        <div className="flex justify-center items-center flex-wrap gap-4">
          <motion.button
            className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-100 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Easy to Order
          </motion.button>
          <motion.button
            className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-100 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Premium Quality
          </motion.button>
          <motion.button
            className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-100 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            Fast Delivery
          </motion.button>
        </div>
      </section>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
        {books.map((book) => (
          <motion.div
            key={book._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white shadow-xl rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <Link to={`/books/${book._id}`}>
              {/* Book Cover */}
              <div className="relative overflow-hidden">
                <motion.img
                  src={getImgUrl(book.coverImage)}
                  alt={book.title}
                  className="h-[400px] w-full object-cover"
                  initial={{ scale: 1.1 }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                />
                {/* Category & Trending Badge */}
                <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  {book.category || "General"}
                </div>
                {book.trending && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Trending
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">
                  {book.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {book.description || "No description available"}
                </p>
              </div>
            </Link>

            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-indigo-600">
                  Rs {book.price}
                </span>
                {book.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    Rs {book.oldPrice}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <motion.button
                className="w-full bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-800 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(book);
                }}
              >
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExploreBook;