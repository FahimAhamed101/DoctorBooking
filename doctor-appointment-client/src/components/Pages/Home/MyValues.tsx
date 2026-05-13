"use client"

import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import Image from "next/image";
import { useGetValuesQuery } from "@/redux/features/values/valueApi";

const MyValues = () => {
  const page  = 1;
  const limit = 6; // Number of values per page

  const { data, isLoading, isError } = useGetValuesQuery({ page , limit });
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.10.11.87:6060';

  if (isLoading) return <div className="text-center py-10">Loading values...</div>;
  if (isError) return <div className="text-center py-10">Error loading values</div>;

  const values = data?.data?.attributes?.results || [];

  return (
    <section className="w-full bg-[#FAF6FA] py-8 sm:py-12 md:py-16 px-4 sm:px-5">
      <MainContainer>
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#32526B]">Our Values</h1>
          {/* <p className="text-sm sm:text-base text-gray-900 px-2">
            At the heart of our service is a commitment to PIPEC—<br className="hidden sm:block" />{" "}
            the principles that define how we care for you. These values shape every consultation, ensuring your experience is professional, respectful, and deeply human
          </p> */}
        </div>
         <div className="text-center space-y-2 sm:space-y-3 mt-4">
          {/* <p className="text-sm sm:text-base text-gray-900 px-2">
            Our promise is simple: Professionalism, Integrity, Patience, Empathy, and Compassion in every interaction.<br className="hidden sm:block" />{" "} 
            From the moment you reach out to us, we listen without rushing, act with honesty, treat you with dignity, and deliver expert care discreetly and efficiently—because your health deserves nothing less.
          </p> */}
        </div>
      <div className={`w-full justify-center grid gap-4 sm:gap-5 my-6 sm:my-8 md:my-10 ${
  values?.length === 1 
    ? 'grid-cols-1 place-items-center' 
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
}`}>
  {values?.map((value) => {
    const imageUrl = value.icon
      ? value.icon.startsWith('http')
        ? value.icon
        : `${backendUrl}${value.icon}`
      : '/default-value-icon.png';
    
    return (
      <div
        key={value._id}
        className={`h-full bg-blue-400 py-0.5 rounded-3xl ${
          values?.length === 1 ? 'w-full max-w-80' : 'w-full'
        }`}
      >
        <div className="w-full bg-[#F1F9FF] p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 rounded-3xl">
          <div className="size-12 sm:size-14 md:size-16 bg-blue-400 rounded-full flex justify-center items-center">
            <Image 
              src={imageUrl} 
              alt={value.name} 
              width={35} 
              height={35}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700">
            {value.name}
          </h1>
          <p className="text-sm sm:text-base">{value.description}</p>
        </div>
      </div>
    );
  })}
</div>
       
      </MainContainer>
    </section>
  );
};
   
export default MyValues;