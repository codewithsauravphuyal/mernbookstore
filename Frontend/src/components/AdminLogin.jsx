import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import getBaseUrl from '../../../Backend/src/utils/getBaseUrl';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const AdminLogin = () => {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${getBaseUrl()}/api/auth/admin`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const auth = response.data;

      if (auth.token) {
        localStorage.setItem('token', auth.token);
        setTimeout(() => {
          localStorage.removeItem('token');
          Swal.fire({
            position: 'center',
            icon: 'info',
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            confirmButtonColor: '#4F46E5',
            customClass: {
              popup: 'bg-white rounded-xl shadow-2xl',
              title: 'text-xl font-bold text-gray-800',
              content: 'text-gray-600',
              confirmButton: 'px-6 py-2 rounded-lg font-semibold',
            },
            background: 'rgba(255, 255, 255, 0.95)',
            backdrop: 'rgba(0, 0, 0, 0.3)',
          });
          navigate('/admin');
        }, 3600 * 1000);

        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Admin Login Successful!',
          text: 'You are now logged into the admin dashboard.',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: 'bg-white rounded-xl shadow-2xl',
            title: 'text-xl font-bold text-gray-800',
            content: 'text-gray-600',
          },
          background: 'rgba(255, 255, 255, 0.95)',
          backdrop: 'rgba(0, 0, 0, 0.3)',
        });
        navigate('/dashboard');
      } else {
        setMessage('Login failed. No token received.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setMessage(error.response?.data?.message || 'Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Admin Dashboard Login
        </motion.h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* UserName Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label htmlFor="userName" className="block text-gray-700 text-sm font-semibold mb-2">
              User Name
            </label>
            <input
              {...register('userName', { required: 'User name is required' })}
              type="text"
              name="userName"
              id="userName"
              placeholder="Enter your user name"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            />
            {errors.userName && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.userName.message}
              </motion.p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            />
            {errors.password && (
              <motion.p
                className="text-red-500 text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>

          {/* Error Message */}
          {message && (
            <motion.p
              className="text-red-500 text-sm text-center font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </motion.div>
        </form>

        <motion.p
          className="mt-6 text-center text-gray-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          ©2025 Book Store. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;