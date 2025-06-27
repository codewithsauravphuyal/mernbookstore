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
        if (action.payload.quantity <= 0) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Out of Stock',
            text: `${action.payload.title} is currently out of stock.`,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }
        const itemToAdd = {
          ...action.payload,
          price: Number(action.payload.price || 0),
          category: action.payload.category || 'Other',
          cartQuantity: 1, // Initialize cartQuantity to 1
        };
        state.cartItem.push(itemToAdd);
        localStorage.setItem('cartItem', JSON.stringify(state.cartItem));
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Added to Cart!',
          text: `${action.payload.title} has been added to your cart.`,
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        if (existingItem.cartQuantity >= action.payload.quantity) {
          Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'Maximum Quantity Reached',
            text: `Only ${action.payload.quantity} units of ${action.payload.title} are available.`,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }
        existingItem.cartQuantity += 1;
        localStorage.setItem('cartItem', JSON.stringify(state.cartItem));
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Quantity Updated',
          text: `${action.payload.title} quantity increased to ${existingItem.cartQuantity}.`,
          showConfirmButton: false,
          timer: 1500,
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
        });
      }
    },
    decreaseCartQuantity: (state, action) => {
      const item = state.cartItem.find(item => item._id === action.payload._id);
      if (item) {
        if (item.cartQuantity > 1) {
          item.cartQuantity -= 1;
        } else {
          state.cartItem = state.cartItem.filter(item => item._id !== action.payload._id);
        }
        localStorage.setItem('cartItem', JSON.stringify(state.cartItem));
      }
    },
    increaseCartQuantity: (state, action) => {
      const item = state.cartItem.find(item => item._id === action.payload._id);
      if (item) {
        if (item.cartQuantity >= item.quantity) {
          Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'Maximum Quantity Reached',
            text: `Only ${item.quantity} units of ${item.title} are available.`,
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }
        item.cartQuantity += 1;
        localStorage.setItem('cartItem', JSON.stringify(state.cartItem));
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
      });
    },
  },
});

export const { addToCart, removeToCart, clearCart, decreaseCartQuantity, increaseCartQuantity } = cartSlice.actions;
export default cartSlice.reducer;