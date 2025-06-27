import { Link } from "react-router-dom";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "../../redux/features/order/ordersApi";
import { motion } from "framer-motion";
import { FiAlertCircle, FiEye } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

const OrderList = () => {
  const { currentUser } = useAuth();
  const { data: orders = [], isLoading, isError, error } = useGetAllOrdersQuery(undefined, {
    skip: !currentUser || currentUser.role !== "admin",
  });
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ id: orderId, orderStatus: newStatus }).unwrap();
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Status Updated",
        text: `Order status updated to ${newStatus}`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Update Failed",
        text: error.data?.message || error.message || "Failed to update order status",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-red-600">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Access Denied</p>
          <p className="text-gray-500 mt-2">You must be an admin to view this page.</p>
          <Link to="/login" className="mt-4 inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg">
            Login as Admin
          </Link>
        </div>
      </motion.div>
    );
  }

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
          <p className="mt-4 text-gray-600 text-lg font-semibold">Loading orders...</p>
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
          <p className="text-lg font-semibold">Error fetching orders</p>
          <p className="text-gray-500 mt-2">{error?.data?.message || error?.message || "Please try again later."}</p>
          <Link to="/dashboard" className="mt-4 inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg">
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Processing: "bg-blue-100 text-blue-800",
    Shipped: "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
    Completed: "bg-green-100 text-green-800",
    Failed: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-2 md:mt-0">
            Total Orders: <span className="font-semibold">{orders.length}</span>
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            className="text-center py-12 bg-white rounded-lg shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-600 text-lg font-semibold">No orders found!</p>
          </motion.div>
        ) : (
          <motion.div
            className="bg-white shadow-md rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order._id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.name}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rs {order.totalPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[order.paymentStatus]}`}>
                          {order.paymentMethod} - {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={isUpdating}
                          className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                            statusStyles[order.orderStatus]
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/dashboard/orders/${order._id}`}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                        >
                          <FiEye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderList;