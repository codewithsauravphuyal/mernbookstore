import React, { useState, useEffect } from "react";
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
  const [paymentError, setPaymentError] = useState(null);
  const [khaltiLoaded, setKhaltiLoaded] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItem);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createOrder, { isLoading: isOrderLoading, error: orderError }] = useCreateOrderMutation();
  const [verifyKhaltiPayment, { isLoading: isPaymentLoading }] = useVerifyKhaltiPaymentMutation();
  const { currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Check if Khalti script is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.KhaltiCheckout) {
      setKhaltiLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KhaltiCheckout.min.js';
      script.async = true;
      script.onload = () => setKhaltiLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Khalti script');
        setPaymentError('Payment service unavailable. Please try Cash on Delivery.');
      };
      document.body.appendChild(script);
    }
  }, []);

  // Calculate total price with fallback
  const totalPrice = cartItems
    .reduce((acc, item) => {
      const price = Number(item.price || item.newPrice || 0);
      return acc + (isNaN(price) ? 0 : price);
    }, 0)
    .toFixed(2);

  const initiateKhaltiPayment = async (orderId) => {
    if (!khaltiLoaded) {
      throw new Error('Payment service is still loading. Please try again.');
    }

    return new Promise((resolve, reject) => {
      try {
        const checkout = new window.KhaltiCheckout({
          publicKey: import.meta.env.VITE_KHALTI_PUBLIC_KEY,
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

        checkout.show();
      } catch (error) {
        reject(error);
      }
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

    // Clear previous errors
    setPaymentError(null);

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
        try {
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
        } catch (error) {
          console.error("Khalti payment error:", error);
          setPaymentError(error.message || "Payment failed. Please try again or use Cash on Delivery.");
          
          // Show error to user but don't block the UI
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Payment Issue",
            text: error.message || "Could not complete payment. You can try again or contact support.",
            showConfirmButton: true,
            confirmButtonColor: "#4F46E5",
          });
        }
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

        {paymentError && (
          <motion.div 
            className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex justify-between items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>{paymentError}</span>
            <button 
              onClick={() => {
                setPaymentMethod("COD");
                setPaymentError(null);
              }}
              className="text-blue-600 underline text-sm"
            >
              Switch to COD
            </button>
          </motion.div>
        )}

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
                {...register("phone", { 
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number"
                  }
                })}
                type="tel"
                id="phone"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="98XXXXXXXX"
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
                defaultValue="Nepal"
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
                {...register("zipcode", { 
                  required: "Zipcode is required",
                  pattern: {
                    value: /^[0-9]{5}$/,
                    message: "Please enter a valid 5-digit zipcode"
                  }
                })}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
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
                    disabled={!khaltiLoaded}
                  />
                  <span className={`${!khaltiLoaded ? 'text-gray-400' : 'text-gray-700'}`}>
                    Khalti {!khaltiLoaded && '(Loading...)'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600 rounded mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link to="/terms" className="text-indigo-600 hover:underline font-semibold">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/shipping" className="text-indigo-600 hover:underline font-semibold">
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
              <ul className="space-y-3 divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const price = Number(item.price || item.newPrice || 0);
                  return (
                    <li key={item._id} className="flex justify-between py-3 text-gray-600">
                      <span className="truncate max-w-[200px]">{item.title}</span>
                      <span>Rs {isNaN(price) ? 'N/A' : price.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-300 text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>Rs {totalPrice}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Shipping and taxes calculated at checkout.
              </p>
            </div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                disabled={!isChecked || isOrderLoading || isPaymentLoading}
                type="submit"
                className={`w-full py-3 px-8 rounded-full font-semibold text-white transition-all duration-300 shadow-lg ${
                  isChecked ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
                }`}
                whileHover={isChecked ? { scale: 1.02, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" } : {}}
                whileTap={isChecked ? { scale: 0.98 } : {}}
              >
                {isOrderLoading || isPaymentLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Place Order (Rs ${totalPrice})`
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </form>
      </motion.div>
    </section>
  );
};

export default CheckOut;