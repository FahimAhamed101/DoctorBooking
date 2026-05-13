"use client"
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined } from "@ant-design/icons";
import RecentBlogCard from "../Home/RecentBlogCard";
import { useGetBlogsQuery } from "@/redux/features/blog/blogApi";

import { Spin } from "antd";

const Blogs = () => {
  const breadcrumbItems = [
    {
      href: "/",
      title: (
        <div className="flex gap-2 texl">
          <HomeOutlined />
          <span>Home</span>
        </div>
      ),
    },
    {
      title: "Blogs",
    },
  ];

  const page = 1
  const limit = 1000; // Number of blogs per page

  const { data, isLoading, isError } = useGetBlogsQuery({ page, limit });

  if (isLoading) return <section className="w-full px-5 py-10 bg-[#F1F9FF] min-h-screen flex justify-center items-center">
    <Spin size="large" />
  </section>;
  if (isError) return <div className="text-center py-10">Error loading blogs</div>;

  const blogs = data?.data?.attributes?.results || [];


  return (
    <section className="w-full px-5 py-10 ">
      <MainContainer>
        <CustomBreadcrumb items={breadcrumbItems} />
    
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4">
            <h1 className="text-4xl font-semibold text-[#32526B] pb-4">Blogs</h1>
            <div className="w-20 h-0.5 bg-[#77C4FE]"></div>
          </div>
         
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-10">
          {blogs.map((blog) => (
            <RecentBlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </MainContainer>
    </section>
  );
};

export default Blogs;