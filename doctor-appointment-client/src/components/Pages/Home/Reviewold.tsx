"use client";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import Image from "next/image";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Review {
  name: string;
  location: string;
  review: string;
  rating: number;
  image: string;
}

const reviews: Review[] = [
  {
    name: "Sarah M.",
    location: "London",
    review: "I was honestly amazed at how simple the process was. I booked a same-day consultation, spoke to a warm and professional GP, and had my prescription delivered within hours. Discreet, efficient, and genuinely caring service.",
    rating: 5,
    image: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "James O.",
    location: "Manchester",
    review: "I've used online GP services before, but this is by far the best. The doctor really took the time to listen, and I never felt rushed. It's reassuring to know I can access such quality care from home.",
    rating: 5,
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Anika P.",
    location: "Birmingham",
    review: "The whole experience was seamless—from booking to consultation to delivery. I felt respected and understood, and my privacy was treated as a top priority.",
    rating: 5,
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Daniel W.",
    location: "Bristol",
    review: "I needed urgent help but didn't have time to visit a clinic. Within an hour, I was speaking to a GP and had my treatment sorted. I can't thank the team enough.",
    rating: 4,
    image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Lola T.",
    location: "Edinburgh",
    review: "Professionalism and empathy are rare to find together, but Trusted GP Clinic delivers both effortlessly. My doctor listened with genuine care and explained everything in a way I understood.",
    rating: 4,
    image: "https://images.pexels.com/photos/712521/pexels-photo-712521.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Ahmed K.",
    location: "Leeds",
    review: "As someone who travels a lot for work, having a service like this is a lifesaver. Reliable, confidential, and available wherever I am. Highly recommended.",
    rating: 5,
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Maria S.",
    location: "Cardiff",
    review: "It's refreshing to speak to a GP who actually listens. I felt heard, reassured, and confident in the advice given. Plus, the follow-up was excellent.",
    rating: 5,
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Peter R.",
    location: "Newcastle",
    review: "From start to finish, the service was outstanding. Clear communication, fast response, and genuine care. This is the future of healthcare, and I'm glad I found it.",
    rating: 5,
    image: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Olivia R.",
    location: "London",
    review: "Finally, a GP service that actually listens.",
    rating: 5,
    image: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Mark D.",
    location: "Nottingham",
    review: "Fast, discreet, and so easy to use.",
    rating: 4,
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Hannah L.",
    location: "Glasgow",
    review: "I felt cared for, not just treated.",
    rating: 5,
    image: "https://images.pexels.com/photos/3769020/pexels-photo-3769020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Tariq A.",
    location: "Birmingham",
    review: "Professional advice without leaving my living room.",
    rating: 4,
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Grace P.",
    location: "Liverpool",
    review: "They made my health feel like a priority.",
    rating: 5,
    image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Ethan K.",
    location: "Bristol",
    review: "Quick help, zero judgment—exactly what I needed.",
    rating: 5,
    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Sophia N.",
    location: "Edinburgh",
    review: "It's like having a GP in my pocket.",
    rating: 5,
    image: "https://images.pexels.com/photos/4725133/pexels-photo-4725133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Jason M.",
    location: "Manchester",
    review: "I trust them with my health, every time.",
    rating: 5,
    image: "https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Emma S.",
    location: "London",
    review: "The weight loss program was straightforward and supportive — I finally feel in control.",
    rating: 5,
    image: "https://images.pexels.com/photos/38554/girl-people-landscape-sun-38554.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "David J.",
    location: "Manchester",
    review: "Quick, confidential help with my ED — professional and caring every step.",
    rating: 5,
    image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
  },
  {
    name: "Rachel K.",
    location: "Birmingham",
    review: "Fertility advice that was clear, honest, and hopeful. Truly grateful.",
    rating: 5,
    image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Mark W.",
    location: "Leeds",
    review: "I received discreet prescriptions for my health needs without any hassle.",
    rating: 4,
    image: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Lisa M.",
    location: "Newcastle",
    review: "The virtual consultation for my weight concerns was thorough and motivating.",
    rating: 5,
    image: "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Sam T.",
    location: "Glasgow",
    review: "Help with ED that restored my confidence, all from the comfort of home.",
    rating: 5,
    image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Claire B.",
    location: "Cardiff",
    review: "Expert guidance on fertility treatments that made a real difference.",
    rating: 5,
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    name: "Anthony R.",
    location: "Bristol",
    review: "Fast, compassionate support for my ongoing health goals — highly recommend.",
    rating: 5,
    image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  }
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
    <div className="relative"> {/* Wrap Slider and background in a container */}
  {/* Static background (outside Slider) */}
  <div className="hidden absolute md:block w-[13%] z-[-17] h-[520px] bg-[#D3B5D3] rounded-xl left-[78px] top-0"></div>

  {/* Slider (moves independently) */}
  <Slider {...settings} className="w-full">
    {reviews.map((review, index) => (
      <div key={index} className="w-full px-4">
        <div className="w-full flex items-center">
          <div className="w-full md:w-[87%] h-full flex flex-col md:flex-row items-center gap-10 md:z-50 md:ml-[13%]"> {/* Adjust margin to overlap */}
            {/* Image */}
            <div className="w-full h-[300px] md:w-[400px] md:h-[400px] relative">
              <Image
                src={review.image}
                alt={`${review.name}'s review`}
                fill
                className="rounded-xl object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            {/* Review text */}
            <div className="p-4">
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