import { createSlice } from '@reduxjs/toolkit';
import Swal from 'sweetalert2';

const initialState = {
  cartItem: JSON.parse(localStorage.getItem('cartItem')) || [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cartItem.find(item => item._id === action.payload._id);
      if (!existingItem) {
        const itemToAdd = {
          ...action.payload,
          price: Number(action.payload.price || 0),
          category: action.payload.category || 'Other',
        };
        state.cartItem.push(itemToAdd);
        localStorage.setItem('cartItem', JSON.stringify(state.cartItem));
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Added to Cart!',
          text: `${action.payload.title} has been successfully added to your cart.`,
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
      } else {
        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: 'Item Already in Cart',
          text: `${action.payload.title} is already in your cart.`,
          showConfirmButton: true,
          confirmButtonText: 'OK',
          confirmButtonColor: '#4F46E5',
          showCancelButton: true,
          cancelButtonText: 'Continue Shopping',
          cancelButtonColor: '#EF4444',
          customClass: {
            popup: 'bg-white rounded-xl shadow-2xl',
            title: 'text-xl font-bold text-gray-800',
            content: 'text-gray-600',
            confirmButton: 'px-6 py-2 rounded-lg font-semibold',
            cancelButton: 'px-6 py-2 rounded-lg font-semibold',
          },
          background: 'rgba(255, 255, 255, 0.95)',
          backdrop: 'rgba(0, 0, 0, 0.3)',
        });
      }
    },
    removeToCart: (state, action) => {
      const itemToRemove = state.cartItem.find(item => item._id === action.payload._id);
      state.cartItem = state.cartItem.filter(item => item._id !== action.payload._id);
      localStorage.setItem('cartItem', JSON.stringify(state.cartItem));
      if (itemToRemove) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Removed from Cart',
          text: `${itemToRemove.title} has been removed from your cart.`,
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
      }
    },
    clearCart: (state) => {
      state.cartItem = [];
      localStorage.removeItem('cartItem');
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Cart Cleared',
        text: 'Your cart has been cleared successfully.',
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
    },
  },
});

export const { addToCart, removeToCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;