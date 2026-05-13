"use client"; // Add this if using interactivity

import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiFacebook, FiLinkedin, FiTwitter } from "react-icons/fi";
import dayjs from "dayjs";

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
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.0.60.18:6060';
  
  // Construct the full image URL
  const imageUrl = blog.coverImage.startsWith('http') 
    ? blog.coverImage 
    : `${backendUrl}${blog.coverImage}`;


  return (
    <div className="w-full bg-[#F1F9FF] p-5 rounded-xl shadow-lg overflow-hidden">
      {/* Blog Image Container */}
      <div className="w-full h-56 md:h-72 relative rounded-t-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Blog post: ${blog.title}...`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
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