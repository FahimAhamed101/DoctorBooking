import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface RegisterResponse {
  message: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  //dateOfBirth: string;
  callingCode: string;
  phoneNumber: number; // Changed to string for consistency
  address: string;
  email: string;
  password: string;
}

interface TeamMemberDetailsResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      team: TeamMember;
      scheduleList: Array<{
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        timezone: string;
      }>;
    };
  };
}

interface LoginResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      user: {
        profileImage: string;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
      tokens: {
        access: {
          token: string;
          expires: string;
        };
        refresh: {
          token: string;
          expires: string;
        };
      };
    };
  };
}

interface UserProfileResponse {
  profileImage: string;
  code: number;
  message: string;
  data: {
    attributes: {
      user: {
        id: string;
        userName: string;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        profileImage: string;
        dateOfBirth: string | null;
        gender: string;
        callingCode: string;
        phoneNumber: string;
        address: string;
        height: { value: string | null; unit: string };
        weight: { value: string | null; unit: string };
        medicalCondition: string[];
        role: string;
        isProfileCompleted: boolean;
        chartCredits: number;
        appointmentCredits: number;
        createdAt: string;
        subscription: {
          subscriptionExpirationDate: string | null;
          status: string;
          isSubscriptionTaken: boolean;
        };
      };
      securitySettings: {
        recoveryEmail: string | null;
        recoveryPhone: string | null;
        securityQuestion: string | null;
      };
      documents: Array<{
        user: string;
        title: string;
        description: string;
        type: string;
        files: string[];
        createdAt: string;
        id: string;
      }>;
    };
  };
}

interface ForgotPasswordResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      oneTimeCode: number;
    };
  };
}

interface LoginRequest {
  email: string;
  password: string;
}



interface ForgotPasswordRequest {
  email: string;
}

interface VerifyEmailRequest {
  email: string;
  code: string;
}

interface VerifyEmailResponse {
  code: number;
  message: string;
}

interface ResetPasswordRequest {
  email: string;
  password: string;
}

interface ResetPasswordResponse {
  code: number;
  message: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  designation: string;
  specialties: string;
  about: string;
  callingCode: string;
  phoneNumber: string; // Changed to string for consistency
  email: string;
  profileImage: string;
  media: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    X?: string;
  };
  degrees: Array<{
    school: string;
    degree: string;
    subject: string;
    grade?: string;
    startDate?: string;
    endDate?: string;
    skills?: string[];
    status?: string;
    _id?: string;
  }>;
  experience: Array<{
    title: string;
    employmentType: string;
    company: string;
    location: string;
    startDate?: string;
    endDate?: string;
    description: string | null;
    profileHeadline: string | null;
    skills?: string[];
    status?: string;
    _id?: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    date?: string;
    status?: string;
    _id?: string;
  }>;
  createdAt?: string;
  createdBy?: {
    fullName: string;
    email: string;
    profileImage: string;
    id: string;
  };
}

interface ContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  message: string;
}

interface ContactResponse {
  code: number;
  message: string;
}

interface TeamMembersResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      results: TeamMember[];
      page: number;
      limit: number;
      totalPages: number;
      totalResults: number;
    };
  };
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  createdAt?: string;
}

interface FaqResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      results: FaqItem[];
      page: number;
      limit: number;
      totalPages: number;
      totalResults: number;
    };
  };
}

interface ChatBotRequest {
  model: string;
  prompt: string;
}

interface ChatBotResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      candidates: Array<{
        content: {
          parts: Array<{
            text: string;
          }>;
          role: string;
        };
        finishReason: string;
        citationMetadata?: {
          citationSources: Array<{
            startIndex: number;
            endIndex: number;
            uri: string;
          }>;
        };
        avgLogprobs?: number;
      }>;
      usageMetadata: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
        promptTokensDetails: Array<{
          modality: string;
          tokenCount: number;
        }>;
        candidatesTokensDetails: Array<{
          modality: string;
          tokenCount: number;
        }>;
      };
      modelVersion: string;
      responseId: string;
    };
  };
}
interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  code: number;
  message: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Profile"], // Added tagTypes to fix the error
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    getProfile: builder.query<UserProfileResponse, void>({
      query: () => "/users/self/in",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<UserProfileResponse, FormData>({
      query: (formData) => ({
        url: "/users/self/update",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Profile"],
    }),
    uploadDocument: builder.mutation<
      {
        code: number;
        message: string;
        data: {
          attributes: {
            user: string;
            title: string;
            description: string;
            type: string;
            files: string[];
            createdAt: string;
            id: string;
          };
        };
      },
      FormData
    >({
      query: (formData) => ({
        url: "/document",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Profile"],
    }),
    
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (credentials) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: credentials, // Fixed to send object
      }),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: (credentials) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: credentials,
      }),
    }),
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (credentials) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: credentials,
      }),
    }),
    getTeamMembers: builder.query<
      TeamMembersResponse,
      { page?: number; limit?: number; email?: string }
    >({
      query: ({ page = 1, limit = 10, email = "" }) => ({
        url: "/team/member/all",
        params: {
          sortBy: "createdAt:desc",
          email,
          page,
          limit,
        },
      }),
    }),
    getTeamMemberDetails: builder.query<TeamMemberDetailsResponse, string>({
      query: (memberId) => `/team/member/${memberId}`,
    }),
    contactUs: builder.mutation<ContactResponse, ContactRequest>({
      query: (contactData) => ({
        url: "/contact",
        method: "POST",
        body: contactData,
      }),
    }),
    getFaqs: builder.query<FaqResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/faq",
        params: {
          page,
          limit,
        },
      }),
    }),
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (credentials) => ({
        url: "/auth/change-password",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Profile"],
    }),
    chatWithBot: builder.mutation<ChatBotResponse, ChatBotRequest>({
      query: (body) => ({
        url: "/gemini/conversation",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUploadDocumentMutation,
  useUpdateProfileMutation,
  useChatWithBotMutation,
  useGetFaqsQuery,
  useContactUsMutation,
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useResetPasswordMutation,
  useGetTeamMembersQuery,
  useGetTeamMemberDetailsQuery,useChangePasswordMutation
} = authApi;
