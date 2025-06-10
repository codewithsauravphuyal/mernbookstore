import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCreateOrderMutation, useVerifyKhaltiPaymentMutation } from "../../redux/features/order/ordersApi";
import { clearCart } from "../../redux/features/cart/cartSlice";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const CheckOut = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const cartItems = useSelector((state) => state.cart.cartItem);
  const dispatch = useDispatch();

  // Debug log to inspect cart items
  console.log('Checkout Cart Items:', cartItems);

  // Calculate total price with fallback
  const totalPrice = cartItems
    .reduce((acc, item) => {
      const price = Number(item.price || item.newPrice || 0);
      return acc + (isNaN(price) ? 0 : price);
    }, 0)
    .toFixed(2);

  const navigate = useNavigate();
  const [createOrder, { isLoading: isOrderLoading, error: orderError }] = useCreateOrderMutation();
  const [verifyKhaltiPayment, { isLoading: isPaymentLoading }] = useVerifyKhaltiPaymentMutation();
  const { currentUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const initiateKhaltiPayment = async (orderId) => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-undef
      KhaltiCheckout.show({
        publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY,
        productIdentity: orderId,
        productName: "BookHauls Order",
        productUrl: window.location.href,
        amount: totalPrice * 100, // Khalti expects amount in paisa
        eventHandler: {
          onSuccess: async (payload) => {
            try {
              const response = await verifyKhaltiPayment({
                token: payload.token,
                amount: totalPrice * 100,
                orderId,
              }).unwrap();
              dispatch(clearCart());
              resolve(response);
            } catch (error) {
              reject(error);
            }
          },
          onError: (error) => {
            reject(error);
          },
          onClose: () => {
            reject(new Error("Payment cancelled by user"));
          },
        },
      });
    });
  };

  const onSubmit = async (data) => {
    if (!isChecked) {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Terms Not Accepted",
        text: "Please agree to the Terms & Conditions and Shipping Policy.",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    const newOrder = {
      name: data.name,
      email: currentUser?.email,
      address: {
        city: data.city,
        country: data.country,
        state: data.state,
        zipcode: data.zipcode,
      },
      phone: data.phone,
      productIds: cartItems.map((item) => item._id),
      totalPrice: Number(totalPrice),
      paymentMethod,
    };

    try {
      const orderResponse = await createOrder(newOrder).unwrap();
      if (paymentMethod === "COD") {
        dispatch(clearCart());
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Order Placed Successfully!",
          text: "Your order has been confirmed. You'll be redirected to your orders.",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/orders");
      } else if (paymentMethod === "Khalti") {
        await initiateKhaltiPayment(orderResponse._id);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Payment Successful!",
          text: "Your order has been confirmed. You'll be redirected to your orders.",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/orders");
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Checkout Failed",
        text: error.data?.message || "There was an issue processing your order. Please try again.",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  if (isOrderLoading || isPaymentLoading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl font-semibold text-gray-700">Processing...</h1>
      </motion.div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-16 px-4">
      <motion.div
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Checkout
        </motion.h2>
        <motion.p
          className="text-center text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Total: Rs {totalPrice} | Items: {cartItems.length}
        </motion.p>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                {...register("name", { required: "Full name is required" })}
                type="text"
                id="name"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="John Doe"
              />
              {errors.name && (
                <motion.p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.name.message}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="text"
                name="email"
                id="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
                disabled
                defaultValue={currentUser?.email}
                placeholder="email@domain.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register("phone", { required: "Phone number is required" })}
                type="tel"
                id="phone"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="+123 456 7890"
              />
              {errors.phone && (
                <motion.p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.phone.message}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <input
                {...register("city", { required: "City is required" })}
                type="text"
                id="city"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Kathmandu"
              />
              {errors.city && (
                <motion.p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.city.message}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                Country
              </label>
              <input
                {...register("country", { required: "Country is required" })}
                type="text"
                id="country"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Nepal"
              />
              {errors.country && (
                <motion.p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.country.message}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                State / Province
              </label>
              <input
                {...register("state", { required: "State is required" })}
                type="text"
                id="state"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Bagmati"
              />
              {errors.state && (
                <motion.p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.state.message}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="zipcode" className="block text-sm font-semibold text-gray-700 mb-2">
                Zipcode
              </label>
              <input
                {...register("zipcode", { required: "Zipcode is required" })}
                type="text"
                id="zipcode"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="44600"
              />
              {errors.zipcode && (
                <motion.p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.zipcode.message}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="text-gray-700">Cash on Delivery</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="Khalti"
                    checked={paymentMethod === "Khalti"}
                    onChange={() => setPaymentMethod("Khalti")}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="text-gray-700">Khalti</span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="billing_same"
                onChange={(e) => setIsChecked(e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600 rounded"
              />
              <label htmlFor="billing_same" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link className="text-indigo-600 hover:underline font-semibold">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link className="text-indigo-600 hover:underline font-semibold">
                  Shipping Policy
                </Link>
              </label>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col justify-between bg-gray-50 p-6 rounded-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <ul className="space-y-3">
                {cartItems.map((item) => {
                  const price = Number(item.price || item.newPrice || 0);
                  return (
                    <li key={item._id} className="flex justify-between text-gray-600">
                      <span className="truncate max-w-[200px]">{item.title}</span>
                      <span>Rs {isNaN(price) ? 'N/A' : price.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="flex justify-between mt-6 text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>Rs {totalPrice}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Shipping and taxes calculated at checkout.
              </p>
            </div>

            <motion.div
              className="mt-6 text-right"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                disabled={!isChecked || isOrderLoading || isPaymentLoading}
                type="submit"
                className={`w-full sm:w-auto py-3 px-8 rounded-full font-semibold text-white transition-all duration-300 shadow-lg ${
                  isChecked ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
                }`}
                whileHover={isChecked ? { scale: 1.05, boxShadow: "0 4px 15px rgba(0,0,0,0.2)" } : {}}
                whileTap={isChecked ? { scale: 0.95 } : {}}
              >
                Place Order
              </motion.button>
            </motion.div>
          </motion.div>
        </form>
      </motion.div>
    </section>
  );
};

export default CheckOut;