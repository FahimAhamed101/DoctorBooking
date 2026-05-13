"use client";
import { useGetAllSubscriptionsQuery } from "@/redux/features/subscription/subscriptionApi";
import { FaPoundSign } from "react-icons/fa";
import { Spin } from "antd";
import { useRouter } from "next/navigation";

interface Subscription {
  id: string;
  title: string;
  amount: number;
  features: string[];
  limitation: "weekly" | "monthly";
}

interface ApiResponse {
  data: {
    attributes: Subscription[];
  };
}

const HomePricing = () => {
  const router = useRouter();
  const { data, isLoading, error } = useGetAllSubscriptionsQuery();

  if (isLoading) return <Spin size="large" className="flex justify-center my-20" />;
  if (error) return <div>Error loading pricing</div>;

  const subscriptions = (data as ApiResponse)?.data?.attributes || [];

  const payment = (price: number) => {
    router.push(`/book-appointment/paid/?price=${price}`);
  };

  const mappedPlans = subscriptions.map(sub => ({
    title: sub.title,
    price: sub.amount,
    features: sub.features,
    type: sub.limitation === "weekly" ? "Pay Consultation" : "Pay Prescription",
    bgColor: sub.title.toLowerCase() === "consultation" ? "bg-[#77C4FE]" : "bg-[#D5EDFF]",
    textColor: sub.title.toLowerCase() === "consultation" ? "text-white" : "text-gray-800"
  }));

  return (
    <section className="w-full bg-[#F4FCF8] px-4 sm:px-5 py-10 sm:py-16 md:py-20">
   

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 items-stretch">
        {mappedPlans.map((plan, index) => (
          <div key={index}  style={{ 
              transitionProperty: 'transform, box-shadow, background-color, color',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column'
            }} className={`${plan.bgColor} ${plan.title.toLowerCase() === "consultation" ? "hover:bg-[#D5EDFF] hover:text-gray-800 hover:cursor-pointer" : "hover:bg-[#77C4FE] hover:cursor-pointer hover:text-white"}  relative  py-5 sm:py-6 transition-all duration-500 ease-out
              transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl px-4 sm:px-4 rounded-2xl ${plan.textColor}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold pt-6 sm:pt-8 text-center">{plan.title}</h2>
            <div className="border-b border-white"></div>
            <div className="flex gap-2 pt-3 justify-center items-center">
              <p className="text-4xl sm:text-5xl md:text-6xl pt-3 font-bold">{plan.price.toFixed(2)}</p>
              <div className="text-base sm:text-lg">
                <span><FaPoundSign/></span>
                <br />
                <span className="font-bold text-xs sm:text-sm md:text-base">{plan.type}</span>
              </div>
            </div>
            <div className="px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10 flex flex-col items-center flex-grow">
             {/*<ul className={`space-y-6 ${plan.textColor}`}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className={`size-8 rounded-full flex justify-center items-center ${
                      plan.title === "Consultation" 
                        ? "bg-white text-[#77C4FE]" 
                        : idx < 3 
                          ? "bg-[#6CB2E7] text-white" 
                          : "bg-[#BDBDBD] text-white"
                    }`}>
                      <IoCheckmarkOutline size={20} />
                    </span>
                    <span className="ml-2">{feature}</span>
                  </li>
                ))}
              </ul> */} 
            </div>
          <div className="pt-8 sm:pt-10 md:pt-12 flex items-end mt-auto">  
            <button 
              onClick={() => payment(plan.price)} 
              className={`mb-6 sm:mb-8 py-2.5 sm:py-3 rounded-xl w-full text-sm sm:text-base ${
                plan.title === "Consultation" 
                  ? "bg-white text-[#77C4FE] hover:bg-[#6CB2E7] hover:text-white" 
                  : "bg-[#6CB2E7] text-white hover:bg-white hover:text-[#77C4FE]"
              }`}
            >
              {plan.price === 0 ? "Try Free" : "Book Now"}
            </button>
          </div>
          
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomePricing;