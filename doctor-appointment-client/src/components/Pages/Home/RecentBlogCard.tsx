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
  content: string;
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

  // Get preview content (first 35 words)
  const previewContent = blog.content.trim().split(/\s+/).filter(Boolean).slice(0, 35).join(' ');
  const blogUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${blog.slug}` : '';

  const shareOnSocialMedia = (platform: string) => {
    if (typeof window === 'undefined') return;
    
    let shareUrl = '';
    const title = encodeURIComponent(blog.title);
    const summary = encodeURIComponent(blog.summary || previewContent);
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

   
        <h3 className="text-xl font-semibold text-gray-800">{blog.title}</h3>

        <div className="text-gray-700 line-clamp-3">
          {previewContent}
        </div>

        {/* Read More Link */}
        <Link 
          href={`/blog/${blog.slug}`} 
          className="inline-block mt-2 text-[#32526B] font-semibold underline transition-all"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
};

export default RecentBlogCard;