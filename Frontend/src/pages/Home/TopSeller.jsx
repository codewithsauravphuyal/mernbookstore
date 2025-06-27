import { useState, useMemo } from "react";
import BookCard from "../books/BookCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { useFetchAllBooksQuery } from "../../redux/features/Books/BookApi";
import { NavLink } from "react-router-dom";

const TopSeller = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const { data: books = [], isLoading, isError } = useFetchAllBooksQuery();

  // Dynamically generate categories based on available books
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        books
          .filter((book) => book.category) // Ensure category exists
          .map((book) => book.category)
      ),
    ];
    return ["All Categories", ...uniqueCategories.sort()];
  }, [books]);

  const filteredBooks =
    selectedCategory === "All Categories"
      ? books
      : books.filter((book) =>
          book.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

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
    <section className="py-12 px-4 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Bestselling Books
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the most popular reads
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="relative inline-block w-full max-w-xs">
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            >
              {categories.map((category, index) => (
                <option value={category} key={index}>
                  {category}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          {filteredBooks.length > 0 ? (
            <>
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
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }}
                modules={[Autoplay, Navigation]}
                className="pb-12"
              >
                {filteredBooks.map((book) => (
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

              <div className="swiper-button-prev hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-100 absolute left-0 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <div className="swiper-button-next hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-100 absolute right-0 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No books found in this category</p>
            </div>
          )}
        </div>

        <motion.div
          className="text-center mt-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <NavLink to="/explore-books">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-all duration-300 inline-flex items-center">
              Explore All Books
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </NavLink>
        </motion.div>
      </div>
    </section>
  );
};

export default TopSeller;