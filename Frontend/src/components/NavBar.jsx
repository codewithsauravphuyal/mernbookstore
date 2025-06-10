import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CiSearch, CiMenuBurger, CiCircleRemove } from "react-icons/ci";
import { FaShoppingCart, FaBookOpen } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineLogout } from "react-icons/hi";
import { RiAccountCircleLine, RiHistoryLine } from "react-icons/ri";
import { useFetchAllBooksQuery } from '../redux/features/Books/BookApi';
import { motion, AnimatePresence } from 'framer-motion';
import avatar from "../assets/avatar.png";

const navigation = [
  { name: "My Orders", href: "/orders", icon: <RiHistoryLine className="mr-2" /> },
  { name: "Account", href: "/account", icon: <RiAccountCircleLine className="mr-2" /> },
];

const NavBar = () => {
  const [isDropdown, setIsDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartItems = useSelector(state => state.cart.cartItem);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const { data: allBooks } = useFetchAllBooksQuery();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBooks = allBooks?.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookClick = (bookId) => {
    navigate(`/books/${bookId}`);
    setSearchTerm("");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdown(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-gradient-to-r from-indigo-50 to-purple-50 py-3'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Left: Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-4 text-gray-700 md:hidden"
            >
              <CiMenuBurger className="h-6 w-6" />
            </button>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <NavLink to="/" className="flex items-center">
                <FaBookOpen className="h-6 w-6 text-indigo-600 mr-2" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  BookHauls
                </h1>
              </NavLink>
            </motion.div>
          </div>

          {/* Center: Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for books, authors..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <AnimatePresence>
                {searchTerm && filteredBooks?.length > 0 && (
                  <motion.div
                    className="absolute bg-white border border-gray-200 rounded-lg w-full mt-2 z-20 max-h-80 overflow-y-auto shadow-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ul className="divide-y divide-gray-100">
                      {filteredBooks.map((book) => (
                        <li
                          key={book._id}
                          className="py-3 px-4 cursor-pointer hover:bg-indigo-50 transition-colors"
                          onClick={() => handleBookClick(book._id)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-md flex items-center justify-center mr-3">
                              <FaBookOpen className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{book.title}</p>
                              <p className="text-xs text-gray-500">{book.author}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right: User Actions & Cart */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="relative">
                <motion.button
                  className="flex items-center gap-2"
                  onClick={() => setIsDropdown(!isDropdown)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <img
                      src={currentUser?.photo || avatar}
                      alt="User Avatar"
                      className="h-9 w-9 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                    {scrolled && (
                      <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white"></span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800 hidden lg:block">
                    {currentUser.userName || currentUser.email.split('@')[0]}
                  </span>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdown && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-56 bg-white shadow-2xl rounded-lg z-40 overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{currentUser.userName || currentUser.email}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        {navigation.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                            onClick={() => setIsDropdown(false)}
                          >
                            {item.icon}
                            {item.name}
                          </NavLink>
                        ))}
                        <button
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          onClick={handleLogout}
                        >
                          <HiOutlineLogout className="mr-2" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink to="/login">
                <motion.button
                  className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HiOutlineUser className="h-5 w-5" />
                  <span className="text-sm font-medium">Sign In</span>
                </motion.button>
              </NavLink>
            )}

            {/* Cart */}
            <NavLink to="/cart" className="relative">
              <motion.div
                className="flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-indigo-50 transition-colors relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaShoppingCart className="text-indigo-600" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </motion.div>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <FaBookOpen className="h-6 w-6 text-indigo-600 mr-2" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      BookHauls
                    </h1>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <CiCircleRemove className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiSearch className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search books..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                    {searchTerm && filteredBooks?.length > 0 && (
                      <div className="mt-2 bg-white border border-gray-200 rounded-lg max-h-64 overflow-y-auto shadow-inner">
                        <ul className="divide-y divide-gray-100">
                          {filteredBooks.map((book) => (
                            <li
                              key={book._id}
                              className="py-2 px-3 cursor-pointer hover:bg-indigo-50"
                              onClick={() => handleBookClick(book._id)}
                            >
                              <p className="text-sm font-medium text-gray-900">{book.title}</p>
                              <p className="text-xs text-gray-500">{book.author}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {currentUser ? (
                      <>
                        <div className="flex items-center p-3 rounded-lg bg-gray-50">
                          <img
                            src={currentUser?.photo || avatar}
                            alt="User Avatar"
                            className="h-10 w-10 rounded-full border-2 border-white shadow-sm object-cover mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {currentUser.userName || currentUser.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                          </div>
                        </div>

                        {navigation.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            className="flex items-center p-3 rounded-lg hover:bg-indigo-50 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.icon}
                            <span>{item.name}</span>
                          </NavLink>
                        ))}

                        <button
                          className="flex items-center w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          onClick={handleLogout}
                        >
                          <HiOutlineLogout className="mr-2" />
                          Sign out
                        </button>
                      </>
                    ) : (
                      <NavLink
                        to="/login"
                        className="flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <HiOutlineUser className="mr-2" />
                        Sign In
                      </NavLink>
                    )}
                  </div>
                </div>

                <div className="mt-auto p-4 border-t border-gray-200">
                  <NavLink
                    to="/cart"
                    className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 text-indigo-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <FaShoppingCart className="mr-2" />
                      <span>Shopping Cart</span>
                    </div>
                    {cartItems.length > 0 && (
                      <span className="bg-indigo-600 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                        {cartItems.length}
                      </span>
                    )}
                  </NavLink>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;