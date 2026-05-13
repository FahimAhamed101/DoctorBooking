"use client";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import React, { useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";

interface Review {
  name: string;
  location: string;
  review: string;
  rating: number;
  image?: string;
  service: string;
}

// Male and female placeholder images
const maleImages = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face"
];

const femaleImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face"
];

// Function to get a consistent random image based on name
const getImageForName = (name: string) => {
  // Check if name is anonymous
  if (name.toLowerCase() === "anonymous") {
    return undefined;
  }
  
  // Determine gender based on name (very basic approach)
  const maleNames = ["Michael", "David", "James", "Thomas", "William", 
                     ];
  const femaleNames = ["Sarah", "Emma", "Sophie", "Olivia", "Charlotte", 
                      ];
  
  // Create a simple hash from the name for consistent results
  let nameHash = 0;
  for (let i = 0; i < name.length; i++) {
    nameHash = (nameHash << 5) - nameHash + name.charCodeAt(i);
    nameHash |= 0; // Convert to 32-bit integer
  }
  
  // Determine gender based on name
  let isMale = false;
  if (maleNames.some(maleName => name.includes(maleName))) {
    isMale = true;
  } else if (femaleNames.some(femaleName => name.includes(femaleName))) {
    isMale = false;
  } else {
    // If name doesn't match known names, use hash to determine gender
    isMale = nameHash % 2 === 0;
  }
  
  // Select a consistent random image from the appropriate collection
  const images = isMale ? maleImages : femaleImages;
  const imageIndex = Math.abs(nameHash) % images.length;
  return images[imageIndex];
};

const rawReviews = [
  {
    name: "Sarah Johnson",
    location: "London",
    review: "The fertility consultation was incredibly supportive. The doctor explained all our options clearly and gave us hope after years of struggling.",
    rating: 5,
    service: "fertility"
  },
  {
    name: "Anonymous",
    location: "Manchester",
    review: "I was hesitant to seek help for ED, but the discreet service made it comfortable. The treatment has significantly improved my confidence and relationship.",
    rating: 5,
    service: "ed"
  },
  {
    name: "Michael Thompson",
    location: "Birmingham",
    review: "The weight loss program provided personalized advice that actually worked. I've lost 15kg in 3 months with ongoing support from the medical team.",
    rating: 5,
    service: "weight"
  },
  {
    name: "Emma Wilson",
    location: "Bristol",
    review: "After years of fertility struggles, the compassionate care and expert guidance finally helped us conceive. We're forever grateful.",
    rating: 5,
    service: "fertility"
  },
  {
    name: "Anonymous",
    location: "Edinburgh",
    review: "ED treatment was delivered discreetly and effectively. The consultation was thorough without being embarrassing.",
    rating: 4,
    service: "ed"
  },
  {
    name: "David Clark",
    location: "Leeds",
    review: "The weight management program addressed my metabolic issues comprehensively, not just telling me to 'eat less' like previous doctors.",
    rating: 5,
    service: "weight"
  },
  {
    name: "Sophie Williams",
    location: "Cardiff",
    review: "Our fertility specialist was knowledgeable and empathetic. They explained complex medical information in terms we could understand.",
    rating: 5,
    service: "fertility"
  },
  {
    name: "Anonymous",
    location: "Newcastle",
    review: "ED treatment has restored intimacy in my marriage. I appreciate the professional yet compassionate approach.",
    rating: 5,
    service: "ed"
  },
  {
    name: "James Roberts",
    location: "London",
    review: "The weight loss medication combined with behavioral coaching has been life-changing. I've kept the weight off for over a year now.",
    rating: 5,
    service: "weight"
  },
  {
    name: "Olivia Brown",
    location: "Nottingham",
    review: "Fertility testing was convenient and the results were explained thoroughly. We felt supported throughout the entire process.",
    rating: 4,
    service: "fertility"
  },
  {
    name: "Anonymous",
    location: "Glasgow",
    review: "ED consultation was efficient and judgment-free. The prescription arrived quickly and discreetly.",
    rating: 5,
    service: "ed"
  },
  {
    name: "Thomas Davis",
    location: "Birmingham",
    review: "The weight loss program addressed the emotional aspects of eating, not just the physical. This holistic approach made all the difference.",
    rating: 4,
    service: "weight"
  },
  {
    name: "Charlotte Martin",
    location: "Liverpool",
    review: "After multiple failed IVF cycles, the fertility advice here gave us new hope and a different approach that finally worked.",
    rating: 5,
    service: "fertility"
  },
  {
    name: "Anonymous",
    location: "Bristol",
    review: "ED treatment was explained in detail with realistic expectations. The results have exceeded what I hoped for.",
    rating: 5,
    service: "ed"
  },
  {
    name: "William Taylor",
    location: "Edinburgh",
    review: "The medical weight loss approach actually addressed my hormonal issues that were preventing weight loss despite diet and exercise.",
    rating: 5,
    service: "weight"
  },
  {
    name: "Amelia Wilson",
    location: "Manchester",
    review: "Fertility preservation services were handled with sensitivity and professionalism during a difficult time in my life.",
    rating: 5,
    service: "fertility"
  },
  
  {
    name: "Anonymous",
    location: "Manchester",
    review: "Quick, confidential help with my ED — professional and caring every step of the way.",
    rating: 5,
    service: "ed"
  },
  {
    name: "Isabella Thompson",
    location: "Birmingham",
    review: "Fertility advice that was clear, honest, and hopeful. Truly grateful for the support.",
    rating: 5,
    service: "fertility"
  },
  {
    name: "Anonymous",
    location: "Leeds",
    review: "Received discreet prescriptions for my health needs without any hassle or judgment.",
    rating: 4,
    service: "ed"
  },
  {
    name: "Joseph White",
    location: "Newcastle",
    review: "The virtual consultation for my weight concerns was thorough and motivating with practical advice.",
    rating: 5,
    service: "weight"
  },
  {
    name: "Anonymous",
    location: "Glasgow",
    review: "Help with ED that restored my confidence, all from the comfort and privacy of home.",
    rating: 5,
    service: "ed"
  },
  {
    name: "Emily Harris",
    location: "Cardiff",
    review: "Expert guidance on fertility treatments that made a real difference in our journey.",
    rating: 5,
    service: "fertility"
  },

];

interface CustomArrowProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  direction: "prev" | "next";
}

const CustomArrow: React.FC<CustomArrowProps> = ({ onClick, direction }) => (
  <button
    onClick={onClick}
    type="button"
    aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
    className={`
      absolute z-10 
      ${direction === "prev" ? "left-2" : "right-2"}
      top-1/2 -translate-y-1/2
      w-8 h-5 rounded-xl
      bg-[#77C4FE] hover:bg-white/50
      backdrop-blur-sm
      shadow-lg
      flex items-center justify-center
      transition-all 
      hover:scale-110
      focus:outline-none
    `}
  >
    {direction === "prev" ? (
      <svg width="14" className="h-2 w-4" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.78033 1.53033C6.07322 1.23744 6.07322 0.762563 5.78033 0.46967C5.48744 0.176777 5.01256 0.176777 4.71967 0.46967L0.71967 4.46967C0.573223 4.61612 0.5 4.80806 0.5 5C0.5 5.10169 0.520239 5.19866 0.556909 5.28709C0.593509 5.37555 0.647763 5.45842 0.71967 5.53033L4.71967 9.53033C5.01256 9.82322 5.48744 9.82322 5.78033 9.53033C6.07322 9.23744 6.07322 8.76256 5.78033 8.46967L3.06066 5.75H12.75C13.1642 5.75 13.5 5.41421 13.5 5C13.5 4.58579 13.1642 4.25 12.75 4.25H3.06066L5.78033 1.53033Z" fill="#32526B"/>
      </svg>
    ) : (
      <svg width="14" className="h-2 w-4" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.21967 8.46967C7.92678 8.76256 7.92678 9.23744 8.21967 9.53033C8.51256 9.82322 8.98744 9.82322 9.28033 9.53033L13.2803 5.53033C13.4268 5.38388 13.5 5.19194 13.5 5C13.5 4.89831 13.4798 4.80134 13.4431 4.71291C13.4065 4.62445 13.3522 4.54158 13.2803 4.46967L9.28033 0.46967C8.98744 0.176776 8.51256 0.176776 8.21967 0.46967C7.92678 0.762563 7.92678 1.23744 8.21967 1.53033L10.9393 4.25L1.25 4.25C0.835786 4.25 0.5 4.58579 0.5 5C0.5 5.41421 0.835786 5.75 1.25 5.75L10.9393 5.75L8.21967 8.46967Z" fill="#32526B"/>
      </svg>
    )}
  </button>
);

const Review: React.FC = () => {
  // Use useMemo to ensure consistent images across renders
  const reviews = useMemo(() => {
    return rawReviews.map(review => ({
      ...review,
      image: getImageForName(review.name)
    }));
  }, []);

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="w-full px-5 py-16">
      <MainContainer>
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-4xl font-semibold text-[#32526B]">Some Reviews</h1>
          <p className="text-gray-900">What Are People Saying About Us</p>
        </div>
        <div className="relative">
          {/* Static background (outside Slider) */}
          <div className="hidden absolute md:block w-[13%] z-[-17] h-[520px] bg-[#D3B5D3] rounded-xl left-[78px] top-0"></div>
          
          {/* Slider (moves independently) */}
          <Slider {...settings} className="w-full">
            {reviews.map((review, index) => (
              <div key={index} className="w-full px-4">
                <div className="w-full flex items-center">
                  <div className="w-full md:w-[87%] h-full flex flex-col md:flex-row items-center gap-10 md:z-50 md:ml-[13%]">
                    {/* Image - only show if not anonymous */}
                    {review.image ? (
                      <div className="w-full h-[300px] md:w-[400px] md:h-[400px] relative">
                        <Image
                          src={review.image}
                          alt={`${review.name}'s review`}
                          fill
                          className="rounded-xl object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-[300px] md:w-[400px] md:h-[400px] relative bg-gray-200 rounded-xl flex items-center justify-center">
                        <span className="text-gray-500 text-lg">No Image</span>
                      </div>
                    )}
                    {/* Review text */}
                    <div className="p-4 flex-1">
                      <h4 className="text-3xl font-semibold text-gray-800">
                        {review.name}
                      </h4>
                      <p className="text-gray-500">{review.location}</p>
                      <p className="mt-4 text-gray-700">{review.review}</p>
                      <div className="mt-4 text-yellow-500 text-2xl">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </MainContainer>
    </section>
  );
};

export default Review;