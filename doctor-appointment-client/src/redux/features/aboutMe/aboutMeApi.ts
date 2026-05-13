// src/redux/features/aboutMe/aboutMeApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Degree {
  school: string;
  degree: string;
  subject: string;
  grade: string;
  startDate: string;
  endDate: string;
  skills: string[];
  status: string;
  _id: string;
}

interface Experience {
  title: string;
  employmentType: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  profileHeadline: string | null;
  skills: string[];
  status: string;
  _id: string;
}

interface Achievement {
  title: string;
  description: string;
  date: string;
  status: string;
  _id: string;
}



interface TeamMember {
  createdBy: {
    fullName: string;
    email: string;
    profileImage: string;
    id: string;
  };
  firstName: string;
  lastName: string;
  fullName: string;
  designation: string;
  specialties: string;
  about: string;
  callingCode: string;
  phoneNumber: number;
  email: string;
  profileImage: string;
  media:  string; // Can be either object or string
  degrees: Degree[];
  experience: Experience[];
  achievements: Achievement[];
  isAdmin: boolean;
  createdAt: string;
  id: string;
}

interface Schedule {
  userId: {
    fullName: string;
    email: string;
    profileImage: string;
    id: string;
  };
  type: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
  repeatRule: string;
  status: string;
  createdAt: string;
  id: string;
}

interface AboutMeData {
  team: TeamMember;
  scheduleList: Schedule[];
}

interface AboutMeResponse {
  code: number;
  message: string;
  data: {
    attributes: AboutMeData;
  };
}

export const aboutMeApi = createApi({
  reducerPath: 'aboutMeApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  endpoints: (builder) => ({
    getAboutMe: builder.query<AboutMeResponse, void>({
      query: () => '/team/about-me',
    }),
  }),
});

export const { useGetAboutMeQuery } = aboutMeApi;