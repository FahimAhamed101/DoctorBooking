"use client";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import React from "react";

const Prescription: React.FC = () => {
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
        <div className="w-full max-w-[1800px]"> {/* Increased max-width */}
          <CustomBreadcrumb items={breadcrumbItems} />
          
          <h2 className="text-3xl font-semibold text-gray-800 text-center mt-8 mb-10">
            Prescription Document
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5, 6].map((appointment) => (
              <div 
                key={appointment}
                className="min-w-[250px] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full"
              >
                {/* Header */}
                <div className="bg-[#77C4FE] px-4 py-4 flex justify-between items-center">
                  <div className="text-white">
                    <h1 className="text-xl font-bold">e-Clinic</h1>
                    <p className="text-xs opacity-90">Specialist healthcare</p>
                    <p className="text-xs font-medium mt-1">Dr. Evan</p>
                  </div>
                  <div className="bg-white rounded-full p-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">e-Clinic</span>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="p-4 space-y-3 flex-grow">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 text-xs mr-2">Patient:</span>
                      <div className="border-b border-gray-300 flex-1 pb-1">
                        <span className="text-gray-400 text-xs">X</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 text-xs mr-2">Date:</span>
                      <div className="border-b border-gray-300 flex-1 pb-1">
                        <span className="text-gray-400 text-xs">X</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 text-xs mr-1">Age:</span>
                      <div className="border-b border-gray-300 flex-1 pb-1">
                        <span className="text-gray-400 text-xs">X</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 text-xs mr-1">Gender:</span>
                      <div className="border-b border-gray-300 flex-1 pb-1">
                        <span className="text-gray-400 text-xs">X</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 text-xs mr-1">Weight:</span>
                      <div className="border-b border-gray-300 flex-1 pb-1">
                        <span className="text-gray-400 text-xs">X</span>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Symbol */}
                  <div className="mt-4 mb-3">
                    <div className="text-blue-300 text-3xl font-serif">℞</div>
                  </div>

                  {/* Medication List */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 text-xs mr-2">1.</span>
                      <span className="text-gray-700 text-xs">Napa</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 text-xs mr-2">2.</span>
                      <span className="text-gray-700 text-xs">Seclo</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 text-xs mr-2">3.</span>
                      <span className="text-gray-700 text-xs">Seclo</span>
                    </div>
                  </div>

                  {/* Empty space for additional medications */}
                  <div className="h-16"></div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                  <div className="flex flex-col space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <PhoneOutlined className="w-3 h-3 mr-1 text-blue-500" />
                      <span>+8801614234567</span>
                    </div>
                    <div className="flex items-center">
                      <MailOutlined className="w-3 h-3 mr-1 text-blue-500" />
                      <span>Live@doctor.com</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>  
        </div>
      </MainContainer>
    </section>
  );
};

export default Prescription;