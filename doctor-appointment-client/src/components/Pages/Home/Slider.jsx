import React, { useState, useEffect } from 'react';

const ReviewsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fake review data
  const reviews = [
    {
      name: "Sarah Johnson",
      location: "New York, NY",
      review: "Absolutely amazing experience! The service was exceptional and exceeded all my expectations. The attention to detail was remarkable and the staff was incredibly professional throughout the entire process.",
      rating: 5
    },
    {
      name: "Michael Chen",
      location: "Los Angeles, CA",
      review: "Outstanding quality and fantastic customer service. I was impressed by how quickly they resolved my concerns and went above and beyond to ensure my satisfaction. Highly recommended!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      location: "Miami, FL",
      review: "Great value for money and excellent results. The team was knowledgeable, friendly, and delivered exactly what they promised. Will definitely be using their services again.",
      rating: 4
    },
    {
      name: "David Thompson",
      location: "Chicago, IL",
      review: "Professional, reliable, and efficient. They completed the work on time and within budget. The quality of work was superb and communication was excellent throughout the project.",
      rating: 5
    },
    {
      name: "Lisa Wang",
      location: "Seattle, WA",
      review: "Impressive attention to detail and great communication. The team was responsive to all my questions and concerns. The final result was better than I had imagined!",
      rating: 4
    },
    {
      name: "James Wilson",
      location: "Austin, TX",
      review: "Exceptional service from start to finish. The professionalism and expertise shown by the team was remarkable. They delivered high-quality work that exceeded my expectations.",
      rating: 5
    }
  ];

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-3xl font-bold text-center">Customer Reviews</h2>
        <p className="text-center mt-2 opacity-90">What our clients say about us</p>
      </div>

      {/* Slider Container */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {reviews.map((review, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="w-full flex items-center justify-center min-h-[400px]">
                <div className="w-full md:w-[87%] h-full flex flex-col justify-center items-center p-8">
                  
                  {/* Review Content */}
                  <div className="text-center max-w-2xl">
                    {/* Name with Quote Icons */}
                    <h4 className="flex justify-center items-center gap-3 text-3xl font-semibold text-gray-800 mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" className="text-blue-500 flex-shrink-0 rotate-180" aria-label="Opening quote">
                        <path d="M6 7C5.45 7 5 7.45 5 8V10C5 10.55 5.45 11 6 11H8V14C8 15.1 7.1 16 6 16C5.45 16 5 16.45 5 17C5 17.55 5.45 18 6 18C8.21 18 10 16.21 10 14V8C10 7.45 9.55 7 9 7H6Z" fill="currentColor"/>
                        <path d="M16 7C15.45 7 15 7.45 15 8V10C15 10.55 15.45 11 16 11H18V14C18 15.1 17.1 16 16 16C15.45 16 15 16.45 15 17C15 17.55 15.45 18 16 18C18.21 18 20 16.21 20 14V8C20 7.45 9.55 7 9 7H6Z" fill="currentColor"/>
                        <path d="M16 7C15.45 7 15 7.45 15 8V10C15 10.55 15.45 11 16 11H18V14C18 15.1 17.1 16 16 16C15.45 16 15 16.45 15 17C15 17.55 15.45 18 16 18C18.21 18 20 16.21 20 14V8C20 7.45 19.55 7 19 7H16Z" fill="currentColor"/>
                      </svg>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {review.name}
                      </span>
                      <svg width="24" height="24" viewBox="0 0 24 24" className="text-blue-500 flex-shrink-0" aria-label="Closing quote">
                        <path d="M6 7C5.45 7 5 7.45 5 8V10C5 10.55 5.45 11 6 11H8V14C8 15.1 7.1 16 6 16C5.45 16 5 16.45 5 17C5 17.55 5.45 18 6 18C8.21 18 10 16.21 10 14V8C10 7.45 9.55 7 9 7H6Z" fill="currentColor"/>
                        <path d="M16 7C15.45 7 15 7.45 15 8V10C15 10.55 15.45 11 16 11H18V14C18 15.1 17.1 16 16 16C15.45 16 15 16.45 15 17C15 17.55 15.45 18 16 18C18.21 18 20 16.21 20 14V8C20 7.45 19.55 7 19 7H16Z" fill="currentColor"/>
                      </svg>
                    </h4>
                    
                    {/* Location */}
                    <p className="text-gray-500 text-lg mb-6 font-medium">{review.location}</p>
                    
                    {/* Review Text */}
                    <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                     &quot;{review.review}&quot;
                    </p>
                    
                    {/* Star Rating */}
                    <div className="flex justify-center items-center gap-1 text-3xl mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    
                    {/* Rating Text */}
                    <p className="text-gray-600 font-semibold">
                      {review.rating}/5 Stars
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center p-6 bg-gray-50">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
          aria-label="Previous review"
        >
          <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="flex space-x-3">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
          aria-label="Next review"
        >
          <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
          style={{ width: `${((currentSlide + 1) / reviews.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ReviewsSlider;