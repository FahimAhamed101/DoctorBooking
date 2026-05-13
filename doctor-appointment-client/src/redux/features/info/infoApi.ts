// src/redux/features/info/infoApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface InfoAttributes {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface InfoResponse {
  code: number;
  message: string;
  data: {
    attributes: InfoAttributes[];
  };
}

export const infoApi = createApi({
  reducerPath: 'infoApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPrivacyPolicy: builder.query<InfoResponse, void>({
      query: () => '/info/privacy-policy',
    }),
    getTermsConditions: builder.query<InfoResponse, void>({
      query: () => '/info/terms-condition',
    }),
  }),
});

export const { 
  useGetPrivacyPolicyQuery,
  useGetTermsConditionsQuery 
} = infoApi;