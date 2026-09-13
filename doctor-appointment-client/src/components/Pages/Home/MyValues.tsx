"use client";

import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import { useGetValuesQuery } from "@/redux/features/values/valueApi";
import { useState, useEffect } from "react";

const getIconSrc = (icon?: string, name?: string) => {
  if (icon && (icon.startsWith("http://") || icon.startsWith("https://"))) {
    return icon;
  }
  const clean = (icon || "").toLowerCase();
  const lowerName = (name || "").toLowerCase();

  if (clean === "award" || lowerName.includes("excellence") || lowerName.includes("integrity")) {
    return "/icons/award.svg";
  }
  if (clean === "shield-check" || clean.includes("shield") || lowerName.includes("privacy") || lowerName.includes("trust")) {
    return "/icons/shield-check.svg";
  }
  if (clean === "laptop-medical" || clean.includes("laptop") || lowerName.includes("digital") || lowerName.includes("healthcare")) {
    return "/icons/laptop-medical.svg";
  }
  if (clean === "heart-pulse" || clean.includes("heart") || lowerName.includes("compassion") || lowerName.includes("patient")) {
    return "/icons/heart-pulse.svg";
  }
  if (icon && icon.startsWith("/")) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://doctorbooking-2wjk.onrender.com";
    return `${backendUrl.replace(/\/$/, "")}${icon}`;
  }
  return "/icons/award.svg";
};

const ValueIcon = ({ icon, name }: { icon?: string; name: string }) => {
  const [src, setSrc] = useState<string>(() => getIconSrc(icon, name));

  useEffect(() => {
    setSrc(getIconSrc(icon, name));
  }, [icon, name]);

  const fallback = () => {
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("excellence") || lowerName.includes("integrity")) return "/icons/award.svg";
    if (lowerName.includes("privacy") || lowerName.includes("trust")) return "/icons/shield-check.svg";
    if (lowerName.includes("digital") || lowerName.includes("healthcare")) return "/icons/laptop-medical.svg";
    if (lowerName.includes("compassion") || lowerName.includes("patient")) return "/icons/heart-pulse.svg";
    return "/icons/award.svg";
  };

  return (
    <img
      src={src}
      alt={name}
      className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
      onError={() => {
        setSrc(fallback());
      }}
    />
  );
};

const MyValues = () => {
  const page = 1;
  const limit = 6; // Number of values per page

  const { data, isLoading, isError } = useGetValuesQuery({ page, limit });

  if (isLoading) return <div className="text-center py-10">Loading values...</div>;
  if (isError) return <div className="text-center py-10">Error loading values</div>;

  const values = data?.data?.attributes?.results || [];

  return (
    <section className="w-full bg-[#FAF6FA] py-8 sm:py-12 md:py-16 px-4 sm:px-5">
      <MainContainer>
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#32526B]">Our Values</h1>
        </div>
        <div className="text-center space-y-2 sm:space-y-3 mt-4">
        </div>
        <div
          className={`w-full justify-center grid gap-4 sm:gap-5 my-6 sm:my-8 md:my-10 ${
            values?.length === 1
              ? "grid-cols-1 place-items-center"
              : values?.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
          }`}
        >
          {values?.map((value: any) => (
            <div
              key={value._id || value.id}
              className={`h-full bg-blue-400 py-0.5 rounded-3xl transition-transform hover:-translate-y-1 duration-300 ${
                values?.length === 1 ? "w-full max-w-80" : "w-full"
              }`}
            >
              <div className="w-full h-full bg-[#F1F9FF] p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 rounded-3xl flex flex-col">
                <div className="size-12 sm:size-14 md:size-16 bg-blue-500 rounded-full flex justify-center items-center shadow-sm flex-shrink-0">
                  <ValueIcon icon={value.icon} name={value.name} />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-800 leading-snug">
                  {value.name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </MainContainer>
    </section>
  );
};

export default MyValues;