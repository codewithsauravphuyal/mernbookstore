import { useParams, Link, Navigate } from "react-router-dom";
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation, useUpdatePaymentStatusMutation } from "../../redux/features/order/ordersApi";
import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import getImgUrl from "../../utils/getImgUrl";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

// Validate MongoDB ObjectId (24-character hexadecimal string)
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const OrderDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  console.log(`[${new Date().toISOString()}] OrderDetails: Processing order ID: ${id}`);
  const { data: order, isLoading, isError, error } = useGetOrderByIdQuery(id, {
    skip: !isValidObjectId(id) || !currentUser || currentUser.role !== "admin",
  });
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();

  const handleOrderStatusChange = async (newStatus) => {
    if (!order) return;

    try {
      console.log(`[${new Date().toISOString()}] Updating order status to: ${newStatus} for order ID: ${id}`);
      await updateOrderStatus({ id, orderStatus: newStatus }).unwrap();
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Status Updated",
        text: `Order status updated to ${newStatus}`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error updating order status:`, {
        error: error?.data?.message || error?.message || 'Unknown error',
        status: error?.status,
        orderId: id,
        newStatus
      });
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Update Failed",
        text: error?.data?.message || error?.message || "Failed to update order status",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  const handlePaymentStatusChange = async (newStatus) => {
    if (!order) return;

    try {
      console.log(`[${new Date().toISOString()}] Updating payment status to: ${newStatus} for order ID: ${id}`);
      await updatePaymentStatus({ id, paymentStatus: newStatus }).unwrap();
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Payment Status Updated",
        text: `Payment status updated to ${newStatus}`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error updating payment status:`, {
        error: error?.data?.message || error?.message || 'Unknown error',
        status: error?.status,
        rawError: error,
        orderId: id,
        newStatus
      });
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Update Failed",
        text: error?.data?.message || `Failed to update payment status (Error: ${error?.status || 'Unknown'})`,
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  const isDeliveredDisabled =
    order?.paymentMethod === "COD" && order?.paymentStatus === "Pending";
  const isPaymentStatusDisabled = order?.paymentStatus !== "Pending";

  if (!isValidObjectId(id)) {
    console.warn(`[${new Date().toISOString()}] Invalid order ID: ${id}`);
    return <Navigate to="/dashboard/orders" replace />;
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
          <p className="mt-4 text-gray-600 text-lg font-semibold">Loading order details...</p>
        </div>
      </motion.div>
    );
  }

  if (isError || !order) {
    const errorMessage = error?.data?.message || error?.message || "Please try again later.";
    console.error(`[${new Date().toISOString()}] Error fetching order: ${errorMessage}`);
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-red-600">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error fetching order</p>
          <p className="text-gray-500 mt-2">{errorMessage}</p>
          <Link
            to="/dashboard/orders"
            className="mt-4 inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Back to Orders
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 px-4 md:px-8">
      <motion.div
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Order Details
        </motion.h2>
        <div className="text-sm text-gray-500 mb-4">Order ID: {order._id}</div>
        <div className="space-y-4 text-gray-700">
          <p><strong>Name:</strong> {order.name}</p>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Total Price:</strong> Rs {order.totalPrice}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p>
            <strong>Payment Status:</strong>{" "}
            <span
              className={`inline-block px-2 py-1 rounded-full text-sm ${
                order.paymentStatus === "Completed"
                  ? "bg-green-100 text-green-700"
                  : order.paymentStatus === "Failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.paymentStatus}
            </span>
          </p>
          <p>
            <strong>Order Status:</strong>{" "}
            <span
              className={`inline-block px-2 py-1 rounded-full text-sm ${
                order.orderStatus === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : order.orderStatus === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.orderStatus}
            </span>
          </p>
          <div>
            <h4 className="font-semibold text-gray-900 mt-4">Shipping Address</h4>
            <p className="text-gray-600">
              {order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mt-4">Products</h4>
            <ul className="space-y-4 mt-2">
              {order.productIds.map((product) => (
                <li key={product._id} className="flex items-center gap-4">
                  <img
                    src={getImgUrl(product.coverImage)}
                    alt={product.title}
                    className="h-16 w-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-gray-700 font-semibold">{product.title}</p>
                    <p className="text-gray-600">Rs {product.price}</p>
                    <p className="text-gray-600 capitalize">Category: {product.category}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mt-4">Update Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  id="orderStatus"
                  value={order.orderStatus}
                  onChange={(e) => handleOrderStatusChange(e.target.value)}
                  disabled={order.orderStatus === "Delivered" || order.orderStatus === "Cancelled"}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option
                    value="Delivered"
                    disabled={isDeliveredDisabled}
                    style={isDeliveredDisabled ? { color: "#ccc", cursor: "not-allowed" } : {}}
                  >
                    Delivered {isDeliveredDisabled && "(Complete payment first)"}
                  </option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  id="paymentStatus"
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  disabled={isPaymentStatusDisabled}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {order.paymentMethod === 'COD' ? (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </>
                  ) : (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
        <Link
          to="/dashboard/orders"
          className="mt-6 inline-block bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
        >
          Back to Orders
        </Link>
      </motion.div>
    </div>
  );
};

export default OrderDetails;