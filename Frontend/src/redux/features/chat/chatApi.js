import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/getBaseUrl';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Chat', 'Message'],
  endpoints: (builder) => ({
    // Get all chats for a user
    getChats: builder.query({
      query: () => '/api/chats',
      providesTags: ['Chat'],
    }),

    // Get specific chat
    getChat: builder.query({
      query: (chatId) => `/api/chats/${chatId}`,
      providesTags: (result, error, chatId) => [{ type: 'Chat', id: chatId }],
    }),

    // Create or get existing chat for a product
    createOrGetChat: builder.mutation({
      query: (productId) => ({
        url: `/api/chats/product/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Chat'],
    }),

    // Send message in a chat
    sendMessage: builder.mutation({
      query: ({ chatId, content, image }) => ({
        url: `/api/chats/${chatId}/messages`,
        method: 'POST',
        body: image ? { content, image } : { content },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Chat', id: chatId },
        'Chat'
      ],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation({
      query: (chatId) => ({
        url: `/api/chats/${chatId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, chatId) => [
        { type: 'Chat', id: chatId },
        'Chat'
      ],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useCreateOrGetChatMutation,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
} = chatApi; 