// src/redux/features/value/valueApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface ValueAttributes {
  _id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ValueResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      results: ValueAttributes[];
      page: number;
      limit: number;
      totalPages: number;
      totalResults: number;
    };
  };
}

export const valueApi = createApi({
  reducerPath: 'valueApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Values'],
  endpoints: (builder) => ({
    getValues: builder.query<ValueResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: '/values',
        params: { page, limit }
      }),
      transformResponse: (response: ValueResponse) => ({
        ...response,
        data: {
          attributes: {
            ...response.data.attributes,
            results: response.data.attributes.results || []
          }
        }
      }),
      providesTags: ['Values'],
    }),
  }),
});

export const { 
  useGetValuesQuery 
} = valueApi;