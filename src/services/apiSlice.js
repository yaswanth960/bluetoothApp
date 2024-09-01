import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com' }),
  endpoints: (builder) => ({
    fetchPosts: builder.query({
      query: () => '/posts',
    }),
    fetchUsers: builder.query({
      query: () => '/users',
    }),
    fetchTodos: builder.query({
      query: () => '/todos',
    }),
  }),
});


export const { useFetchPostsQuery, useFetchUsersQuery, useFetchTodosQuery } = apiSlice;
