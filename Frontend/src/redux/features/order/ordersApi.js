import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/getBaseUrl";

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/orders`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      console.warn("No token found in localStorage for orders API");
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery,
  tagTypes: ["Orders", "Order"],
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: () => {
        console.log("Fetching all orders from /api/orders/all"); // Debug log
        return "/all";
      },
      providesTags: ["Orders"],
      onError: (error) => {
        console.error("Error fetching all orders:", error);
      },
    }),
    getOrderByEmail: builder.query({
      query: (email) => `/email/${email}`,
      providesTags: (result, error, email) => [{ type: "Orders", id: email }],
    }),
    getOrderById: builder.query({
      query: (id) => {
        console.log(`Fetching order by ID: ${id}`); // Debug log
        return `/${id}`;
      },
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation({
      query: (order) => ({
        url: "/",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Orders"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, orderStatus }) => ({
        url: `/status/${id}`,
        method: "PUT",
        body: { orderStatus },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Orders" },
        { type: "Order", id },
      ],
    }),
    updatePaymentStatus: builder.mutation({
      query: ({ id, paymentStatus }) => ({
        url: `/payment-status/${id}`,
        method: "PUT",
        body: { paymentStatus },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Orders" },
        { type: "Order", id },
      ],
    }),
    verifyEsewaPayment: builder.mutation({
      query: (data) => ({
        url: '/verify-esewa',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderByEmailQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation, // Added export
  useVerifyEsewaPaymentMutation,
} = ordersApi;

export default ordersApi;