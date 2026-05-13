// src/redux/features/appointment/appointmentApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface BookAppointmentRequest {
  doctor?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientAddress: string;
  visitType: 'Old Patient Visit' | 'New Patient Visit' | 'Specific Concern' | 'other';
 
  bodyPart?: string;
  date: string;
  timeSlot: string;
  reason?: string;
}

interface BookAppointmentResponse {
  success: boolean;
  message: string;
  data: {
   
    id: string;
  };
}

interface Appointment {
  id: string;
  doctor?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  patientAddress: string;
  visitType: string;
  category: string;
  bodyPart?: string;
  date: string;
  timeSlot: string;
  reason?: string;
  specificConditions?: string;
  status: string;
  isPaid: boolean;
  appointmentId: string;
  createdAt: string;
  paymentDetails: {
    method: string;
  };
}

interface ListAppointmentsResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      results: Appointment[];
      page: number;
      limit: number;
      totalPages: number;
      totalResults: number;
    };
  };
}

interface AppointmentPaymentRequest {
  appointmentId: string;
  amount: string;
}

interface AppointmentPaymentResponse {
  code: number;
  message: string;
  data: {
    attributes: string  ;
    
    paymentId?: string;
    status?: string;
  };
}

interface AppointmentParams {
  page: number;
  limit: number;
  status?: string;
  sortBy?: string;
}

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Appointment'],
  endpoints: (builder) => ({
    bookAppointment: builder.mutation<BookAppointmentResponse, BookAppointmentRequest>({
      query: (body) => ({
        url: '/appointment/book',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Appointment'],
    }),
    listAppointments: builder.query<ListAppointmentsResponse, AppointmentParams>({
      query: (params) => ({
        url: '/appointment/list',
        params: {
          ...params,
          sortBy: params.sortBy || 'createdAt:desc',
        },
      }),
      providesTags: ['Appointment'],
    }),
    createAppointmentPayment: builder.mutation<AppointmentPaymentResponse, AppointmentPaymentRequest>({
      query: (paymentData) => ({
        url: '/appointment/payment',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Appointment'],
    }),
  }),
});

export const { 
  useBookAppointmentMutation,
  useListAppointmentsQuery, 
  useCreateAppointmentPaymentMutation,
} = appointmentApi;