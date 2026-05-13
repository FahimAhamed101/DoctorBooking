// src/redux/features/subscription/subscriptionApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Subscription {
  createdBy: string;
  title: string;
  limitation: string;
  stripePriceId: string;
  days: number;
  amount: number;
  features: string[];
  createdAt: string;
  id: string;
}

interface SubscriptionResponse {
  code: number;
  message: string;
  data: {
    attributes: Subscription[];
  };
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  endpoints: (builder) => ({
    getAllSubscriptions: builder.query<SubscriptionResponse, void>({
      query: () => '/subscription/all',
    }),
  }),
});

export const { useGetAllSubscriptionsQuery } = subscriptionApi;