import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGetOrderByEmailQuery } from '../../redux/features/order/ordersApi';
import getImgUrl from '../../utils/getImgUrl';
import { clearCart, removeToCart } from '../../redux/features/cart/cartSlice';
import { motion } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';

const CartBook = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItem);
  const { currentUser } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useGetOrderByEmailQuery(currentUser?.email, {
    skip: !currentUser?.email,
  });

  console.log('Cart Items:', cartItems);
  console.log('Orders:', orders);

  const totalPrice = cartItems
    .reduce((acc, item) => {
      const price = Number(item.price || 0);
      return acc + (isNaN(price) ? 0 : price);
    }, 0)
    .toFixed(2);

  const handleClearCart = (product) => {
    dispatch(removeToCart(product));
  };

  const handleDeleteCart = () => {
    dispatch(clearCart());
  };

  // Map cart items to their latest order details
  const getOrderDetails = (productId) => {
    for (const order of orders) {
      if (order.productIds.some(item => item._id === productId)) {
        return {
          paymentMethod: order.paymentMethod || 'N/A',
          paymentStatus: order.paymentStatus || 'Pending',
          orderStatus: order.orderStatus || 'Pending',
        };
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 md:px-8">
      <motion.div
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-center pb-6 border-b border-gray-200">
          <motion.h2
            className="text-3xl md:text-4xl font-extrabold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Shopping Cart
          </motion.h2>
          {cartItems.length > 0 && (
            <motion.button
              onClick={handleDeleteCart}
              className="bg-red-500 text-white py-2 px-5 rounded-full font-semibold flex items-center gap-2 hover:bg-red-600 transition-all duration-300 shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiTrash2 className="text-lg" />
              Clear Cart
            </motion.button>
          )}
        </div>

        <div className="mt-8">
          {ordersLoading ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-600 text-lg">Loading order details...</p>
            </motion.div>
          ) : cartItems.length > 0 ? (
            <ul className="space-y-6">
              {cartItems.map((product) => {
                const price = Number(product.price || 0);
                const orderDetails = getOrderDetails(product._id);
                return (
                  <motion.li
                    key={product._id}
                    className="flex flex-col md:flex-row items-center bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-full md:w-1/4 flex justify-center md:justify-start mb-4 md:mb-0">
                      <img
                        src={`${getImgUrl(product.coverImage)}`}
                        alt={product.title}
                        className="h-[160px] w-[100px] object-contain rounded-lg"
                      />
                    </div>
                    <div className="w-full md:w-3/4 flex flex-col md:ml-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <Link
                          to={`/books/${product._id}`}
                          className="text-xl font-semibold text-gray-800 hover:text-indigo-600 transition"
                        >
                          {product.title}
                        </Link>
                        <p className="text-lg font-bold text-indigo-600 mt-2 md:mt-0">
                          Rs {isNaN(price) ? '0.00' : price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Category:</strong> <span className="capitalize bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{product.category}</span>
                      </p>
                      {orderDetails && (
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <p>
                            <strong>Payment Method:</strong> <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{orderDetails.paymentMethod}</span>
                          </p>
                          <p>
                            <strong>Payment Status:</strong> <span className={`px-2 py-1 rounded-full ${orderDetails.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{orderDetails.paymentStatus}</span>
                          </p>
                          <p>
                            <strong>Order Status:</strong> <span className={`px-2 py-1 rounded-full ${orderDetails.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : orderDetails.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{orderDetails.orderStatus}</span>
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-gray-600">
                          <strong>Qty:</strong> 1
                        </p>
                        <motion.button
                          onClick={() => handleClearCart(product)}
                          className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiTrash2 className="text-lg" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-600 text-lg">Your cart is empty.</p>
              <Link
                to="/"
                className="mt-4 inline-block bg-indigo-600 text-white py-2 px-6 rounded-full hover:bg-indigo-700 transition-all duration-300"
              >
                <span style={{ display: 'inline' }}>Start Shopping</span>
              </Link>
            </motion.div>
          )}
        </div>

        {cartItems.length > 0 && (
          <motion.div
            className="mt-10 p-6 bg-gray-100 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center text-xl font-semibold text-gray-900">
              <span>Subtotal</span>
              <span>Rs {totalPrice}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                to="/checkout"
                className="w-full sm:w-auto text-center bg-gray-800 text-white py-3 px-8 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-300 shadow"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto text-center bg-gray-600 text-white border-gray-400 py-3 px-8 rounded-xl font-semibold hover:bg-gray-500 hover:border-gray-600 transition-all duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CartBook;