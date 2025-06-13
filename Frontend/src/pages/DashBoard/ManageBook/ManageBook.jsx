import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDeleteBookMutation, useFetchAllBooksQuery } from '../../../redux/features/Books/BookApi';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';

const ManageBooks = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: books, isLoading, isError, error, refetch } = useFetchAllBooksQuery();
  const [deleteBook] = useDeleteBookMutation();

  const { currentUser, loading: authLoading } = auth;

  if (authLoading) return <div>Loading...</div>;

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/login');
    return null;
  }

  if (isLoading) return <div>Loading books...</div>;

  if (isError) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to load books. Please try again.',
      icon: 'error',
      confirmButtonColor: '#EF4444',
    });
    return <div>Error loading books: {error.message}</div>;
  }

  const handleDeleteBook = async (id) => {
    try {
      await deleteBook(id).unwrap();
      Swal.fire({
        title: 'Book Deleted',
        text: 'Book deleted successfully!',
        icon: 'success',
        confirmButtonColor: '#4F46E5',
      });
      refetch();
    } catch (error) {
      console.error('Failed to delete book:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete book. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  return (
    <div className="relative bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          className="bg-white rounded-2xl shadow-xl px-6 py-10 md:px-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h3
            className="text-3xl font-bold text-gray-900 mb-8 font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="text-indigo-600">Manage</span> All Books
          </motion.h3>

          {books && books.length === 0 ? (
            <div>No books found. Add a book to get started.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['#', 'Book Title', 'Category', 'Price', 'Actions'].map((header, index) => (
                      <motion.th
                        key={header}
                        className="px-6 py-4 bg-gray-50 text-gray-600 text-left text-sm font-semibold uppercase tracking-wider border-b border-gray-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                      >
                        {header}
                      </motion.th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {books.map((book, index) => (
                    <motion.tr
                      key={book._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                    >
                      <td className="px-6 py-4 text-base text-gray-700 border-b border-gray-200">{index + 1}</td>
                      <td className="px-6 py-4 text-base text-gray-900 border-b border-gray-200">{book.title}</td>
                      <td className="px-6 py-4 text-base text-gray-700 border-b border-gray-200">{book.category}</td> {/* Changed from book.genre to book.category */}
                      <td className="px-6 py-4 text-base text-gray-700 border-b border-gray-200">Rs {book.price}</td>
                      <td className="px-6 py-4 text-base border-b border-gray-200 space-x-4">
                        <button
                          onClick={() => navigate(`/dashboard/edit-book/${book._id}`)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-base hover:underline underline-offset-4 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="px-4 py-2 bg-red-500 text-white text-base font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-200 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-200 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};

export default ManageBooks;