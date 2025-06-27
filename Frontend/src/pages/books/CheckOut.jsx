import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  useCreateOrderMutation,
} from "../../redux/features/order/ordersApi";
import { useGetUserProfileQuery } from "../../redux/features/user/UserApi";
import { clearCart } from "../../redux/features/cart/cartSlice";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const CheckOut = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [esewaLoaded, setEsewaLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const cartItems = useSelector((state) => state.cart.cartItem);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createOrder, { isLoading: isOrderLoading }] = useCreateOrderMutation();
  const { currentUser } = useAuth();

  // Get user profile data
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // Pre-fill form with user profile data
  useEffect(() => {
    if (profileData?.user) {
      const user = profileData.user;
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      setValue('name', fullName || currentUser?.userName || '');
      setValue('phone', user.phone || '');
      setValue('city', user.shippingAddress?.city || '');
      setValue('state', user.shippingAddress?.state || '');
      setValue('country', user.shippingAddress?.country || 'Nepal');
      setValue('zipcode', user.shippingAddress?.zipcode || '');
    }
  }, [profileData, currentUser, setValue]);

  // Load payment scripts
  useEffect(() => {
    // eSewa script is not accessible, so we'll use form-based payment
    setEsewaLoaded(true); // Mark as loaded to enable eSewa option
  }, []);

  // Auto-switch to COD if online payments are not available
  useEffect(() => {
    if (!esewaLoaded && paymentMethod !== "COD") {
      setPaymentMethod("COD");
      Swal.fire({
        title: 'Payment Method Changed',
        text: 'Online payment is currently unavailable. Your payment method has been changed to Cash on Delivery.',
        icon: 'info',
        confirmButtonColor: '#4F46E5',
      });
    }
  }, [esewaLoaded, paymentMethod]);

  // Calculate total price with fallback
  const totalPrice = cartItems
    .reduce((acc, item) => {
      const price = Number(item.price || item.newPrice || 0);
      return acc + (isNaN(price) ? 0 : price * item.cartQuantity);
    }, 0)
    .toFixed(2);

  // Generate invoice data
  const generateInvoiceData = (orderData) => {
    return {
      orderId: orderData._id,
      customerName: orderData.name,
      customerEmail: orderData.email,
      customerPhone: orderData.phone,
      items: cartItems.map(item => ({
        name: item.title,
        quantity: item.cartQuantity,
        price: item.price,
        total: item.price * item.cartQuantity
      })),
      subtotal: totalPrice,
      total: totalPrice,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
  };

  const showInvoice = (orderData) => {
    const invoiceData = generateInvoiceData(orderData);
    
    const invoiceHTML = `
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div class="text-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">BookHauls</h2>
          <p class="text-gray-600">Invoice</p>
        </div>
        
        <div class="border-b pb-4 mb-4">
          <div class="flex justify-between mb-2">
            <span class="font-semibold">Order ID:</span>
            <span>${invoiceData.orderId}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="font-semibold">Date:</span>
            <span>${invoiceData.date} ${invoiceData.time}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="font-semibold">Customer:</span>
            <span>${invoiceData.customerName}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="font-semibold">Email:</span>
            <span>${invoiceData.customerEmail}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="font-semibold">Phone:</span>
            <span>${invoiceData.customerPhone}</span>
          </div>
        </div>
        
        <div class="mb-4">
          <h3 class="font-semibold mb-2">Items:</h3>
          ${invoiceData.items.map(item => `
            <div class="flex justify-between mb-1">
              <span>${item.name} (x${item.quantity})</span>
              <span>Rs. ${item.total}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="border-t pt-4">
          <div class="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>Rs. ${invoiceData.total}</span>
          </div>
        </div>
        
        <div class="mt-4 text-center text-sm text-gray-600">
          <p>Thank you for your purchase!</p>
          <p>Payment Method: ${paymentMethod}</p>
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Order Confirmed!',
      html: invoiceHTML,
      icon: 'success',
      confirmButtonText: 'View Orders',
      confirmButtonColor: '#4F46E5',
      showCloseButton: true,
      width: '500px'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/orders");
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
      quantities: cartItems.map((item) => item.cartQuantity), // Include quantities
      totalPrice: Number(totalPrice),
      paymentMethod,
    };

    try {
      if (paymentMethod === "COD") {
        // For COD, create order directly
        const orderResponse = await createOrder(newOrder).unwrap();
        dispatch(clearCart());
        showInvoice(orderResponse);
      } else if (paymentMethod === "eSewa") {
        // For eSewa, create order with pending payment status
        const orderWithPendingPayment = {
          ...newOrder,
          paymentStatus: 'Pending',
          orderStatus: 'Pending'
        };
        
        const orderResponse = await createOrder(orderWithPendingPayment).unwrap();
        
        try {
          // Attempt eSewa payment
          await initiateEsewaPayment(orderResponse._id);
          
          // If payment is successful, show success message
          showInvoice(orderResponse);
        } catch (paymentError) {
          console.error("eSewa payment error:", paymentError);
          setPaymentError(paymentError.message || "Payment failed. Please try again or use Cash on Delivery.");
          
          // Show payment error but don't redirect - let user try again
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Payment Issue",
            text: paymentError.message || "Could not complete payment. You can try again or contact support.",
            showConfirmButton: true,
            confirmButtonColor: "#4F46E5",
          });
          
          // Note: Order is created but payment is pending
          // User can retry payment or contact support
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

  const initiateEsewaPayment = async (orderId) => {
    // Use form-based eSewa payment
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    form.target = '_blank';
    
    const params = {
      amt: totalPrice,
      pdc: 0,
      psc: 0,
      txAmt: 0,
      tAmt: totalPrice,
      pid: orderId,
      scd: "EPAYTEST", // Test merchant code
      su: `${window.location.origin}/payment-success`,
      fu: `${window.location.origin}/payment-failure`
    };
    
    // Add form fields
    Object.keys(params).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Show success message
    Swal.fire({
      title: 'Redirecting to eSewa',
      text: 'You will be redirected to eSewa payment page. Please complete your payment.',
      icon: 'info',
      confirmButtonColor: '#4F46E5',
    });
    
    return Promise.resolve();
  };

  if (isOrderLoading || isProfileLoading) {
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
          Total: Rs {totalPrice} | Items: {cartItems.reduce((sum, item) => sum + item.cartQuantity, 0)}
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
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="cod" className="text-base font-medium text-gray-700">
                    Cash on Delivery (COD)
                  </label>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id="esewa"
                    name="paymentMethod"
                    value="eSewa"
                    checked={paymentMethod === "eSewa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={!esewaLoaded}
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <label 
                    htmlFor="esewa" 
                    className={`text-base font-medium ${!esewaLoaded ? 'text-gray-400' : 'text-gray-700'}`}
                  >
                    Online Payment (eSewa)
                    {!esewaLoaded && <span className="text-sm text-gray-500 ml-2">(Unavailable)</span>}
                  </label>
                </div>
                {paymentError && (
                  <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    ⚠️ {paymentError}
                  </div>
                )}
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
                      <span className="truncate max-w-[200px]">{item.title} (x{item.cartQuantity})</span>
                      <span>Rs {isNaN(price) ? 'N/A' : (price * item.cartQuantity).toFixed(2)}</span>
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
                disabled={!isChecked || isOrderLoading}
                type="submit"
                className={`w-full py-3 px-8 rounded-full font-semibold text-white transition-all duration-300 shadow-lg ${
                  isChecked ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
                }`}
                whileHover={isChecked ? { scale: 1.02, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" } : {}}
                whileTap={isChecked ? { scale: 0.98 } : {}}
              >
                {isOrderLoading ? (
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