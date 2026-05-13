"use client";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import React from "react";

const Letter: React.FC = () => {
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
    <section className="w-full px-5 py-10 bg-[#F1F9FF] min-h-screen">
      <MainContainer className="flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <CustomBreadcrumb items={breadcrumbItems}  />
          
          <h2 className="text-3xl font-semibold text-gray-800 text-center mt-8 mb-10">
           Letter
          </h2>

         <div className="max-w-2xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="bg-[#77C4FE]  px-6 py-4 flex justify-between items-center">
        <div className="text-white">
          <h1 className="text-2xl font-bold">e-Clinic</h1>
          <p className="text-sm opacity-90">Specialist online healthcare</p>
          <p className="text-sm font-medium mt-1">Dr. Evan</p>
        </div>
        <div className="bg-white rounded-full p-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">e-Clinic</span>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-3">Patient name:</span>
            <div className="border-b border-gray-300 flex-1 pb-1">
              <span className="text-gray-400">X</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-3">Date:</span>
            <div className="border-b border-gray-300 flex-1 pb-1">
              <span className="text-gray-400">X</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-3">Age:</span>
            <div className="border-b border-gray-300 flex-1 pb-1">
              <span className="text-gray-400">X</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-3">Gender:</span>
            <div className="border-b border-gray-300 flex-1 pb-1">
              <span className="text-gray-400">X</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-3">Weight:</span>
            <div className="border-b border-gray-300 flex-1 pb-1">
              <span className="text-gray-400">X</span>
            </div>
          </div>
        </div>

        {/* Prescription Symbol */}
        <div className="mt-8 mb-6">
          <div className="text-blue-300 text-4xl font-serif">℞</div>
        </div>

        {/* Medication List */}
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-3">1.</span>
            <span className="text-gray-700">Napa</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-3">1.</span>
            <span className="text-gray-700">Seclo</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-3">1.</span>
            <span className="text-gray-700">Seclo</span>
          </div>
        </div>

        {/* Empty space for additional medications */}
        <div className="h-32"></div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-center space-x-8 text-sm text-gray-600">
          <div className="flex items-center">
            <PhoneOutlined className="w-4 h-4 mr-2 text-blue-500"  />
            <span>+8801614234567</span>
          </div>
          <div className="flex items-center">
           <MailOutlined className="w-4 h-4 mr-2 text-blue-500" />
            <span>Live@doctor.com</span>
          </div>
        </div>
      </div>
    </div>
        </div>
      </MainContainer>
    </section>
  );
};

export default Letter;