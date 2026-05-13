// src/redux/features/blog/blogApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface BlogAuthor {
  fullName: string;
  email: string;
  profileImage: string;
  id: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  coverImage: string;
  createdAt: string;
  category: string;
  views: number;
  likes: number;
  tags: string[];
  author: BlogAuthor;
  isPublished?: boolean;
  commentsCount?: number;
}

interface BlogListResponse {
  code: number;
  message: string;
  data: {
    attributes: {
      results: Blog[];
      page: number;
      limit: number;
      totalPages: number;
      totalResults: number;
    };
  };
}

interface SingleBlogResponse {
  code: number;
  message: string;
  data: {
    attributes: Blog;
  };
}

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  tagTypes: ['Blogs', 'Blog'],
  endpoints: (builder) => ({
    getBlogs: builder.query<BlogListResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: '/blogs',
        params: {
          page,
          limit,
          sortBy: 'createdAt:desc'
        }
      }),
      providesTags: ['Blogs'],
    }),
    getBlogBySlug: builder.query<SingleBlogResponse, string>({
      query: (slug) => `/blogs/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
    }),
  }),
});

export const { useGetBlogsQuery, useGetBlogBySlugQuery } = blogApi;