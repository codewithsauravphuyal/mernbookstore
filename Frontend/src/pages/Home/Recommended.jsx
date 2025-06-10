import React from "react";
import BookCard from "../books/BookCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import { Autoplay, Navigation } from "swiper/modules";
import { useFetchAllBooksQuery } from "../../redux/features/Books/BookApi";
import { NavLink } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";

const Recommended = () => {
  const { data: books = [], isLoading, isError } = useFetchAllBooksQuery();
  const recommendedBooks = books.slice(0, 8); // Get first 8 books as recommended

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading recommendations...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load recommendations
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Recommended For You
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Curated selections based on your reading preferences
          </p>
        </motion.div>

        {/* Book Carousel */}
        {recommendedBooks.length > 0 ? (
          <div className="relative">
            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 25 },
                1024: { slidesPerView: 4, spaceBetween: 30 },
              }}
              navigation={{
                nextEl: '.recommended-next',
                prevEl: '.recommended-prev',
              }}
              modules={[Autoplay, Navigation]}
              className="pb-12"
            >
              {recommendedBooks.map((book) => (
                <SwiperSlide key={book._id}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="px-2 py-4"
                  >
                    <BookCard book={book} />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <button className="recommended-prev hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-indigo-100 absolute left-0 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer border border-gray-200">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="recommended-next hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-indigo-100 absolute right-0 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer border border-gray-200">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No recommendations available at the moment</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Recommended;