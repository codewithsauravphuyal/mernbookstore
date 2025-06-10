import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useGetOrderByEmailQuery } from "../../redux/features/order/ordersApi";
import { motion } from "framer-motion";
import { FiAlertCircle, FiShoppingBag, FiCalendar, FiPackage, FiCreditCard, FiMapPin, FiChevronRight } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa";
import getImgUrl from "../../utils/getImgUrl";
import { Link } from "react-router-dom";

const OrderPage = () => {
  const { currentUser } = useAuth();
  const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email || "", {
    skip: !currentUser?.email,
  });

  if (isLoading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <motion.div
            className="w-10 h-10 border-t-2 border-b-2 border-indigo-600 rounded-full animate-spin"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600 text-lg font-semibold">Loading your orders...</p>
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-red-600">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error fetching your orders</p>
          <p className="text-gray-500 mt-2">Please try again later.</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <FiShoppingBag className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Orders</h1>
          <span className="ml-auto bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            className="text-center py-12 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">When you place orders, they'll appear here</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </div>
                      <div className="text-lg font-bold text-gray-900">Rs {order.totalPrice?.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="flex items-center text-sm font-medium text-gray-500 mb-2">
                        <FiPackage className="mr-2" /> Items
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {order.productIds?.slice(0, 3).map((item) => (
                          <div key={item._id} className="flex items-center space-x-3">
                            <img
                              src={getImgUrl(item.coverImage)}
                              alt={item.title}
                              className="h-12 w-12 rounded-md object-cover border border-gray-200"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                              <p className="text-xs text-gray-500">Rs {item.price?.toFixed(2)}</p>
                              <div className="flex gap-2">
                                <Link
                                  to={`/books/${item._id}`}
                                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-xs mt-1"
                                >
                                  View book details <FiChevronRight className="ml-1" />
                                </Link>
                                {order.orderStatus === 'Delivered' && (
                                  <Link
                                    to={`/books/${item._id}`}
                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-xs mt-1"
                                  >
                                    <FaRegComment className="mr-1" /> Leave a Review
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.productIds?.length > 3 && (
                          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 text-xs font-medium text-gray-500">
                            +{order.productIds.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="flex items-center text-sm font-medium text-gray-500 mb-2">
                          <FiCreditCard className="mr-2" /> Payment
                        </h4>
                        <p className="text-sm text-gray-900">
                          {order.paymentMethod} •{" "}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </p>
                      </div>

                      <div>
                        <h4 className="flex items-center text-sm font-medium text-gray-500 mb-2">
                          <FiMapPin className="mr-2" /> Shipping
                        </h4>
                        <p className="text-sm text-gray-900 line-clamp-1">
                          {order.address?.street}, {order.address?.city}, {order.address?.state} {order.address?.zipcode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;