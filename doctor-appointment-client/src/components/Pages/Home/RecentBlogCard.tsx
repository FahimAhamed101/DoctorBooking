
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiFacebook, FiLinkedin, FiTwitter } from "react-icons/fi";
import dayjs from "dayjs";

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
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.0.60.18:6060';
  
  // Construct the full image URL
  const imageUrl = blog.coverImage.startsWith('http') 
    ? blog.coverImage 
    : `${backendUrl}${blog.coverImage}`;

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