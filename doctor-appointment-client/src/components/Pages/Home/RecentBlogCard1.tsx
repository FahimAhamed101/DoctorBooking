"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiFacebook, FiLinkedin, FiTwitter } from "react-icons/fi";
import dayjs from "dayjs";
import blog1 from "@/assets/blogs/blog1.png";
import blog2 from "@/assets/blogs/blog2.png";
import blog3 from "@/assets/blogs/blog3.png";

interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  createdAt: string;
  category: string;
  views: number;
  likes: number;
}

interface RecentBlogCardProps {
  blog: Blog;
}

const RecentBlogCard = ({ blog }: RecentBlogCardProps) => {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://doctorbooking-2wjk.onrender.com').replace(/\/+$/, '');

  const getCategoryFallback = (category?: string, slug?: string) => {
    const cat = (category || slug || '').toLowerCase();
    if (cat.includes('pediatric') || cat.includes('child')) return blog2.src;
    if (cat.includes('allergy') || cat.includes('general') || cat.includes('respiratory')) return blog3.src;
    return blog1.src;
  };

  const getFullImageUrl = (rawImage?: string) => {
    if (!rawImage) return getCategoryFallback(blog.category, blog.slug);
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return rawImage;
    }
    const cleanPath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
    return `${backendUrl}${cleanPath}`;
  };

  const [imgSrc, setImgSrc] = useState<string>(() => getFullImageUrl(blog.coverImage));

  useEffect(() => {
    setImgSrc(getFullImageUrl(blog.coverImage));
  }, [blog.coverImage, backendUrl]);

  return (
    <div className="w-full bg-[#F1F9FF] p-5 rounded-xl shadow-lg overflow-hidden">
      {/* Blog Image Container */}
      <div className="w-full h-56 md:h-72 relative rounded-t-xl overflow-hidden">
        <Image
          src={imgSrc}
          alt={`Blog post: ${blog.title}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          onError={() => {
            setImgSrc(getCategoryFallback(blog.category, blog.slug));
          }}
        />
      </div>

      {/* Blog Info */}
      <div className="mt-4 space-y-3">
        {/* Date and Social Icons */}
        <div className="flex justify-between items-center text-gray-500">
          <div className="flex items-center space-x-2">
            <FiCalendar className="flex-shrink-0" />
            <span>{dayjs(blog.createdAt).format("MMM D, YYYY")}</span>
          </div>
          <div className="flex space-x-3">
            {[FiFacebook, FiLinkedin, FiTwitter].map((Icon, index) => (
              <Link
                key={index}
                href="/"
                className="size-9 border border-secondary text-secondary rounded-full flex justify-center items-center hover:bg-[#6CB2E7] hover:text-white transition-all duration-300 flex-shrink-0"
                aria-label={`Share on ${Icon.name.replace('Fi', '')}`}
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>

        {/* Blog Description */}
        <p className="text-gray-700 line-clamp-3">{blog.summary}</p>

        {/* Read More Link */}
        <Link 
          href={`/blog/${blog.id}`} 
          className="inline-block mt-2 text-secondary font-semibold hover:underline transition-all"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
};

export default RecentBlogCard;