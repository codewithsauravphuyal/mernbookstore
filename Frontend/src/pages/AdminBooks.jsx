import { useNavigate } from 'react-router-dom';
import { useFetchAllBooksQuery, useDeleteBookMutation } from '../redux/features/Books/BookApi';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const AdminBooks = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: books, isLoading, isError, refetch } = useFetchAllBooksQuery();
  const [deleteBook] = useDeleteBookMutation();

  // Admin check
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-700">You must be an admin to view this page.</p>
          <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Go to Login</button>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading books...</div>;
  if (isError) return <div className="flex items-center justify-center min-h-screen text-red-600">Error: Failed to load books.</div>;

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
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete book. Please try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Books</h1>
        {books && books.length === 0 ? (
          <div className="text-center text-gray-500">No books found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">#</th>
                  <th className="px-4 py-2 border-b text-left">Title</th>
                  <th className="px-4 py-2 border-b text-left">Author</th>
                  <th className="px-4 py-2 border-b text-left">Category</th>
                  <th className="px-4 py-2 border-b text-left">Price</th>
                  <th className="px-4 py-2 border-b text-left">Quantity</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, idx) => (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{idx + 1}</td>
                    <td className="px-4 py-2 border-b">{book.title}</td>
                    <td className="px-4 py-2 border-b">{book.author}</td>
                    <td className="px-4 py-2 border-b">{book.category}</td>
                    <td className="px-4 py-2 border-b">Rs {book.price}</td>
                    <td className="px-4 py-2 border-b">{book.quantity}</td>
                    <td className="px-4 py-2 border-b space-x-2">
                      <button
                        onClick={() => navigate(`/dashboard/edit-book/${book._id}`)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBooks; 