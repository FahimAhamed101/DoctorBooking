'use client'
import line from "@/assets/faq/line.png";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined } from "@ant-design/icons";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { FiCalendar, FiFacebook, FiLinkedin, FiTwitter, FiEye, FiHeart } from "react-icons/fi";
import { useGetBlogBySlugQuery } from "@/redux/features/blog/blogApi";
import dayjs from "dayjs";
import { MDXRemote } from 'next-mdx-remote/rsc';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { useEffect } from 'react';
import type { MDXComponents as MDXComponentsType } from 'mdx/types';

interface BlogDetailsProps {
  params: {
    slug: string;
  };
}






const components: MDXComponentsType = {
  img: ({ src, alt, width, height }) => (
    src ? (
      <div className="my-4">
        <Image
          src={src}
          alt={alt || ''}
          width={width ? Number(width) : 800}
          height={height ? Number(height) : 450}
          className="rounded-lg mx-auto"
        />
      </div>
    ) : null
  ),
  a: ({ href, children }) => (
    <a 
      href={href}
      className="text-blue-600 hover:underline" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold my-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold my-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold my-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 my-4 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 my-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 my-4">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 italic pl-4 my-4 text-gray-600">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const language = className?.replace('language-', '');
    
    if (language) {
      const highlighted = hljs.highlightAuto(String(children), [language]);
      return (
        <pre className="hljs rounded-md my-4 p-4 overflow-x-auto">
          <code dangerouslySetInnerHTML={{ __html: highlighted.value }} />
        </pre>
      );
    }
    
    return (
      <code className={`${className || ''} bg-gray-100 px-2 py-1 rounded`}>
        {children}
      </code>
    );
  }
};

const BlogDetails = ({ params }: BlogDetailsProps) => {
  const { slug } = params;
  const { data, isLoading, isError } = useGetBlogBySlugQuery(slug);

  useEffect(() => {
    hljs.highlightAll();
  }, []);

  const breadcrumbItems = [
    {
      href: "/",
      title: (
        <div className="flex gap-2 items-center">
          <HomeOutlined />
          <span>Home</span>
        </div>
      ),
    },
    {
      href: "/blog",
      title: "Blogs",
    },
    {
      title: "Blog Details",
    },
  ];

  if (isLoading) return <div className="text-center py-10">Loading blog post...</div>;
  if (isError) return <div className="text-center py-10">Error loading blog post</div>;

  const blog = data?.data?.attributes;
  if (!blog) return <div className="text-center py-10">Blog not found</div>;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://10.0.60.18:6060";

  const imageUrl = blog.coverImage.startsWith("http")
    ? blog.coverImage
    : `${backendUrl}${blog.coverImage}`;

  const authorImageUrl = blog.author.profileImage.startsWith("http")
    ? blog.author.profileImage
    : `${backendUrl}${blog.author.profileImage}`;


 const blogUrl = `${window.location.origin}/blog/${blog.slug}`;

 const shareOnSocialMedia = (platform: string) => {
    let shareUrl = '';
    const title = encodeURIComponent(blog.title);
    const summary = encodeURIComponent(blog.summary );
    const url = encodeURIComponent(blogUrl);

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <section className="w-full px-5 py-10">
      <MainContainer>
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="text-center space-y-3 my-5">
          <h1 className="text-4xl font-semibold text-[#32526B]">Blog Details</h1>
          <Image
            width={150}
            height={200}
            src={line as StaticImageData}
            alt="line"
            className="mx-auto"
          />
       
        </div>

        <div className="w-full p-5 rounded-xl">
          {/* Blog Image */}
          <div className="relative w-full aspect-[16/9] md:aspect-[3/1] rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Blog Info */}
          <div className="mt-8 space-y-6">
            {/* Blog Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-500">
                  <FiCalendar />
                  <span>{dayjs(blog.createdAt).format("MMMM D, YYYY")}</span>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {blog.category}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-gray-500">
                <div className="flex items-center space-x-1">
                  <FiEye />
                  <span>{blog.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiHeart />
                  <span>{blog.likes}</span>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={authorImageUrl}
                  alt={blog.author.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{blog.author.fullName}</p>
                <p className="text-sm text-gray-500">{blog.author.email}</p>
              </div>
            </div>

            {/* Blog Content */}
            <div className="prose max-w-none">
              {typeof blog.content === 'string' ? (
                <MDXRemote 
                  source={blog.content}
                  components={components}
                />
              ) : (
                <MDXRemote 
                   source={blog.content}
                  components={components}
                />
              )}
            </div>

            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Sharing */}
            <div className="flex justify-end space-x-3 pt-4">
             <button
              onClick={() => shareOnSocialMedia('facebook')}
              className="size-9 border border-[#77C4FE] text-[#77C4FE] rounded-full flex justify-center items-center hover:bg-[#6CB2E7] hover:text-white transition-all duration-300 flex-shrink-0"
              aria-label="Share on Facebook"
            >
              <FiFacebook size={18} />
            </button>
            <button
              onClick={() => shareOnSocialMedia('linkedin')}
              className="size-9 border border-[#77C4FE] text-[#77C4FE] rounded-full flex justify-center items-center hover:bg-[#6CB2E7] hover:text-white transition-all duration-300 flex-shrink-0"
              aria-label="Share on LinkedIn"
            >
              <FiLinkedin size={18} />
            </button>
            <button
              onClick={() => shareOnSocialMedia('twitter')}
              className="size-9 border border-[#77C4FE] text-[#77C4FE] rounded-full flex justify-center items-center hover:bg-[#6CB2E7] hover:text-white transition-all duration-300 flex-shrink-0"
              aria-label="Share on Twitter"
            >
              <FiTwitter size={18} />
            </button>
            </div>
          </div>
        </div>
      </MainContainer>
    </section>
  );
};

export default BlogDetails;