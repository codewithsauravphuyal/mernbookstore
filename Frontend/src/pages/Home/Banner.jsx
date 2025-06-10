import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import banner from "../../assets/banner1.png.png";

const Banner = () => {
  return (
    <div className="relative bg-gray-50 overflow-hidden">
      {/* Container with max-width and padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="relative z-10">
          {/* Flex container for responsive layout */}
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            {/* Text content - takes full width on mobile, half on desktop */}
            <div className="lg:w-1/2 w-full space-y-6">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="block text-indigo-600">Discover Your Next</span>
                Favorite Book Adventure
              </motion.h1>
              
              <motion.p 
                className="text-lg text-gray-600 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Explore our carefully curated collection of books that will transport you to new worlds, 
                expand your knowledge, and ignite your imagination.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <NavLink 
                  to="/explore-books" 
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-center font-medium shadow-sm"
                >
                  Browse Books
                </NavLink>
                <NavLink 
                  to="/about" 
                  className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center font-medium shadow-sm"
                >
                  About Us
                </NavLink>
              </motion.div>
            </div>
            
            {/* Image container - takes full width on mobile, half on desktop */}
            <motion.div 
              className="lg:w-1/2 w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img 
                  src={banner} 
                  alt="Book collection" 
                  className="w-full h-auto object-cover"
                />
                {/* Decorative element to enhance the image */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-indigo-500/10 mix-blend-overlay"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};

export default Banner;  