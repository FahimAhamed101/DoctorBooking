"use client"; 

import MainContainer from "@/components/Shared/MainContainer/MainContainer";

import RecentBlogCard from "./RecentBlogCard";
import { useGetBlogsQuery } from "@/redux/features/blog/blogApi";




const RecentBlogs = () => {

  const page = 1;
  const limit = 6; // Number of blogs per page

  const { data, isLoading, isError } = useGetBlogsQuery({ page, limit });

  if (isLoading) return <div className="text-center py-10">Loading blogs...</div>;
  if (isError) return <div className="text-center py-10">Error loading blogs</div>;

  const blogs = data?.data?.attributes?.results || [];




  return (
    <section className="w-full px-5 py-16 bg-white">
      <MainContainer>
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold text-[#32526B]">Recent Blog</h1>
         
        </div>

        {/* Grid of Blog Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <RecentBlogCard key={blog.id} blog={blog} />
          ))}
        </div>

       
      </MainContainer>
    </section>
  );
};

export default RecentBlogs;