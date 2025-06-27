import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/getBaseUrl';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query({
      query: () => '/api/auth/profile',
      providesTags: ['User'],
    }),

    // Update user profile
    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: '/api/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Get all users (admin only)
    getAllUsers: builder.query({
      query: () => '/api/auth/users',
      providesTags: ['User'],
    }),

    // Delete user (admin only)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/api/auth/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Toggle user role (admin only)
    toggleUserRole: builder.mutation({
      query: (userId) => ({
        url: `/api/auth/users/${userId}/role`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),

    // Get user by ID (admin only)
    getUserById: builder.query({
      query: (userId) => `/api/auth/users/${userId}`,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useToggleUserRoleMutation,
  useGetUserByIdQuery,
} = userApi;