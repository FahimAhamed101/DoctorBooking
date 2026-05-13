"use client";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined } from "@ant-design/icons";
import React from "react";
import Pad from "@/assets/pagepad.png";
import Image from "next/image";

const MyAppointmentEmpty: React.FC = () => {
  const breadcrumbItems = [
    {
      href: "/",
      title: (
        <div className="flex gap-2 items-center">
          <HomeOutlined />
          <span>Home</span>
        </div>
      ),
    },
    {
      href: "/my-appointment",
      title: "My Appointment",
    },
    {
      title: "Complete Appointment",
    },
    {
      title: "Prescription document",
    },
  ];

  return (
    <section className="w-full px-5 py-10 bg-blue-50 min-h-screen">
      <MainContainer className="flex flex-col items-center">
        <CustomBreadcrumb items={breadcrumbItems} />
        <h2 className="text-3xl font-semibold text-gray-800 text-center mt-8 mb-5">
          You don&apos;t have an appointment yet
        </h2>
        <p className="text-md font-semibold text-gray-800 text-center mb-10">
          You don&apos;t have a doctor&apos;s appointment scheduled <br /> at the moment.
        </p>
        <div className="flex justify-center">
          <Image 
            src={Pad} 
            alt="Empty appointment illustration" 
            width={300} 
            height={250} 
            className="max-w-full h-auto"
          />
        </div>
      </MainContainer>
    </section>
  );
};

export default MyAppointmentEmpty;