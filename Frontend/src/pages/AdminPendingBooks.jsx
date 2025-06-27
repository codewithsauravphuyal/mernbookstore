import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import getBaseUrl from '../utils/getBaseUrl';

const AdminPendingBooks = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingBooks, setPendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && currentUser && currentUser.role === 'admin') {
      fetchPendingBooks();
    }
  }, [authLoading, currentUser]);

  const fetchPendingBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${getBaseUrl()}/api/books/unapproved`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPendingBooks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending books.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `${getBaseUrl()}/api/books/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      Swal.fire({
        icon: 'success',
        title: 'Book Approved',
        text: 'The book has been approved and is now visible in the marketplace.',
        confirmButtonColor: '#4F46E5',
      });
      setPendingBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err.response?.data?.message || 'Failed to approve book.',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pending Book Approvals</h1>
        {loading ? (
          <div className="text-center">Loading pending books...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : pendingBooks.length === 0 ? (
          <div className="text-center text-gray-500">No pending books to approve.</div>
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
                {pendingBooks.map((book, idx) => (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{idx + 1}</td>
                    <td className="px-4 py-2 border-b">{book.title}</td>
                    <td className="px-4 py-2 border-b">{book.author}</td>
                    <td className="px-4 py-2 border-b">{book.category}</td>
                    <td className="px-4 py-2 border-b">Rs {book.price}</td>
                    <td className="px-4 py-2 border-b">{book.quantity}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleApprove(book._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Approve
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

export default AdminPendingBooks; 