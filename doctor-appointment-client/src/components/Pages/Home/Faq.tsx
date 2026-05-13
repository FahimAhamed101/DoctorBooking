"use client";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import Image from "next/image";
import { useState } from "react";
import line from "@/assets/faq/line.png";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useGetFaqsQuery } from "@/redux/features/auth/authApi";
import { Skeleton } from "antd";

const Faq = () => {
  // State to manage which FAQ is open
  const [openFirstFaq, setOpenFirstFaq] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { data, isLoading, isError } = useGetFaqsQuery({});

  // Toggle function for first FAQ
  const toggleFirstFaq = () => {
    setOpenFirstFaq(!openFirstFaq);
  };

  // Toggle function for remaining FAQs
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (isLoading) {
    return (
      <section className="w-full px-4 sm:px-5 py-10 sm:py-12 md:py-16 bg-[#F1F9FF]">
        <MainContainer>
          <div className="text-center space-y-3">
            <Skeleton.Input active size="large" className="w-1/2 mx-auto" />
            <Skeleton.Image active className="mx-auto" />
            <Skeleton paragraph={{ rows: 2 }} active />
          </div>
          <div className="mt-8 sm:mt-10 md:mt-12 space-y-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} active paragraph={{ rows: 2 }} />
            ))}
          </div>
        </MainContainer>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="w-full px-4 sm:px-5 py-10 sm:py-12 md:py-16 bg-[#F1F9FF]">
        <MainContainer>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#32526B]">
              Frequently Asked Questions
            </h1>
            <p className="text-red-500 mt-4 text-sm sm:text-base">Failed to load FAQs. Please try again later.</p>
          </div>
        </MainContainer>
      </section>
    );
  }

  const faqs = data?.data?.attributes?.results || [];
  const firstFaq = faqs[0];
  const remainingFaqs = faqs.slice(1, 5);

  return (
    <section className="w-full flex items-center px-4 sm:px-5 py-10 sm:py-12 md:py-16 bg-[#F1F9FF]">
      <MainContainer>
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#32526B] px-2">
            Frequently Asked Questions
          </h1>
          <Image
            width={400}
            height={200}
            src={line}
            alt="line"
            className="mx-auto w-[200px] sm:w-[250px] md:w-[350px] lg:w-[400px] h-auto"
          />
        </div>

        {/* First FAQ Section */}
        <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 max-w-3xl space-y-3 sm:space-y-4 mx-auto">
          {firstFaq && (
            <div
              key={firstFaq.id}
              onClick={toggleFirstFaq}
              className={`w-full 0.25rem cursor-pointer transition-all duration-500 ease-in-out rounded-xl ${
                openFirstFaq
                  ? "bg-[#6CB2E7]"
                  : "border border-gray-900"
              }`}
            >
              <div className="flex justify-between items-center px-3 sm:px-4 gap-2 sm:gap-3">
                <div className="w-full space-y-1.5 sm:space-y-2 md:space-y-3 pt-2">
                  <h3
                    className={`text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-snug ${
                      openFirstFaq ? "text-white" : "text-[#32526B]"
                    }`}
                  >
                    {firstFaq.question}
                  </h3>
                  {openFirstFaq && <hr />}
                </div>
                <span className="text-base sm:text-lg md:text-xl flex-shrink-0">
                  {openFirstFaq ? (
                    <span className="size-5 sm:size-6 flex justify-center items-center border rounded-full p-0.5">
                      <FiMinus size={16} className="text-white sm:w-[17px] sm:h-[17px]" />
                    </span>
                  ) : (
                    <span className="size-5 sm:size-6 flex justify-center items-center border rounded-full border-gray-700 p-0.5">
                      <FiPlus size={16} className="text-gray-700 sm:w-[17px] sm:h-[17px]" />
                    </span>
                  )}
                </span>
              </div>

              {/* Answer section */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openFirstFaq ? "max-h-[400px] sm:max-h-[500px] p-3 sm:p-4 md:p-5" : "max-h-0"
                }`}
              >
                <p
                  className={`mt-1 sm:mt-2 text-xs sm:text-sm md:text-base leading-relaxed ${
                    openFirstFaq ? "opacity-100 text-white" : "opacity-0"
                  }`}
                >
                  {firstFaq.answer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Remaining FAQs Section */}
        <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-[7rem] space-y-2 sm:space-y-3 md:space-y-4 max-w-2xl mx-auto">
          {remainingFaqs.map((faq, index) => (
            <div
              key={faq.id}
              onClick={() => toggleFaq(index)}
              className={`w-full p-1.5 sm:p-2 cursor-pointer transition-all duration-300 ease-in-out  ${
                openFaqIndex === index
                  ? "bg-[#6CB2E7]"
                  : "border-b border-[#32526B] hover:border-[#6CB2E7]"
              }`}
            >
              <div className="flex items-center">
                {/* Bullet point */}
                <span className={`flex-shrink-0 w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center text-sm sm:text-base ${
                  openFaqIndex === index ? "text-white" : "text-[#32526B]"
                }`}>
                  •
                </span>

                {/* Question text */}
                <div className="flex-1">
                  <h3 className={`text-sm sm:text-base md:text-lg font-medium leading-snug ${
                    openFaqIndex === index ? "text-white" : "text-[#32526B]"
                  }`}>
                    {faq.question}
                  </h3>
                </div>

             
              </div>

              {/* Answer section */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaqIndex === index ? "max-h-[500px] mt-2 sm:mt-3" : "max-h-0"
                }`}
              >
                <div className={`pl-5 sm:pl-6 md:pl-8 lg:pl-9 pr-2 ${
                  openFaqIndex === index ? "opacity-100 text-white" : "opacity-0"
                }`}>
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MainContainer>
    </section>
  );
};

export default Faq;