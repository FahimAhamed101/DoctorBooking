"use client";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined } from "@ant-design/icons";
import { Pagination, Spin } from "antd";
import React, { useState } from "react";
import { useListAppointmentsQuery } from "@/redux/features/auth/appontmentApi";
import notfound from "@/assets/pagepad.png";
import Image from "next/image";
import Link from "next/link";

type AppointmentStatus = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface AppointmentParams {
  page: number;
  limit: number;
  status?: string;
}

interface Appointment {
  id: string;
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAddress: string;
  visitType: string;
  category: string;
  timeSlot: string;
  date: string;
  status: string;
  reason?: string;
  specificConditions?: string;
}

const MyAppointment: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [activeTab, setActiveTab] = useState<AppointmentStatus>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const queryParams: AppointmentParams = {
    page: currentPage,
    limit: pageSize,
  };

  if (activeTab !== 'all') {
    queryParams.status = activeTab;
  }

  const { data, isLoading, isError } = useListAppointmentsQuery(queryParams);

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

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleTabChange = (tab: AppointmentStatus) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleBackToList = () => {
    setSelectedAppointment(null);
  };

  if (isLoading) {
    return (
      <section className="w-full px-5 py-10 bg-[#F1F9FF] min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="w-full px-5 py-10 bg-[#F1F9FF] min-h-screen flex justify-center items-center">
        <div className="text-red-500 text-lg">Failed to load appointments</div>
      </section>
    );
  }

  const appointments = data?.data?.attributes?.results || [];
  const pagination = data?.data?.attributes || {
    page: 1,
    limit: 5,
    totalPages: 1,
    totalResults: 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="bg-yellow-400 text-black text-xs font-medium px-3 py-1 rounded-full">Pending</span>;
      case 'confirmed':
        return <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">Confirmed</span>;
      case 'cancelled':
        return <span className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">Cancelled</span>;
      case 'completed':
        return <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">Completed</span>;
      default:
        return <span className="bg-gray-400 text-white text-xs font-medium px-3 py-1 rounded-full">{status}</span>;
    }
  };

  if (selectedAppointment) {
    return (
      <section className="w-full px-5 py-10 bg-[#F1F9FF] min-h-screen">
        <MainContainer className="flex flex-col items-center">
          <div className="w-full max-w-6xl">
            <CustomBreadcrumb items={breadcrumbItems} />
            
            <h2 className="text-3xl font-semibold text-gray-800 text-center mt-8 mb-10">
              Appointment Details
            </h2>

            <div className="bg-transparent rounded-lg border border-[#77C4FE] p-10 shadow-sm mb-6">
              <div className="border-b border-[#77C4FE] pb-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Appointment ID:</span>
                <span className="text-gray-900 col-span-3">{selectedAppointment.appointmentId}</span>
              </div>



              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Name:</span>
                <span className="text-gray-900">{selectedAppointment.patientName}</span>
              </div>
              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-gray-900">{selectedAppointment.patientEmail}</span>
              </div>
              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Phone Number:</span>
                <span className="text-gray-900">{selectedAppointment.patientPhone}</span>
              </div>
              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Address:</span>
                <span className="text-gray-900">{selectedAppointment.patientAddress}</span>
              </div>
              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Reason for Visit:</span>
                <span className="text-gray-900">{selectedAppointment.visitType}</span>
              </div>
              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Department:</span>
                <span className="text-gray-900">{selectedAppointment.category}</span>
              </div>
              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Preferred Time:</span>
                <span className="text-gray-900">{selectedAppointment.timeSlot}</span>
              </div>
              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Preferred Date:</span>
                <span className="text-gray-900">
                  {new Date(selectedAppointment.date).toLocaleDateString()}
                </span>
              </div>
              <div className="border-b border-[#77C4FE] py-4 grid grid-cols-4">
                <span className="font-medium text-gray-700">Status:</span>
                <span className="text-gray-900 capitalize">{selectedAppointment.status}</span>
              </div>
              {selectedAppointment.reason && (
                <div className="pt-4 grid grid-cols-4">
                  <span className="font-medium text-gray-700">Additional Reason:</span>
                  <span className="text-gray-900 col-span-3">{selectedAppointment.reason}</span>
                </div>
              )}
              {selectedAppointment.specificConditions && (
                <div className="pt-4 grid grid-cols-4">
                  <span className="font-medium text-gray-700">Specific Conditions:</span>
                  <span className="text-gray-900 col-span-3">{selectedAppointment.specificConditions}</span>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button 
                onClick={handleBackToList}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Back to Appointments
              </button>
            </div>
          </div>
        </MainContainer>
      </section>
    );
  }

  return (
    <section className="w-full px-5 py-10 bg-[#F1F9FF] min-h-screen">
      <MainContainer className="flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <CustomBreadcrumb items={breadcrumbItems} />
          
          <h2 className="text-3xl font-semibold text-gray-800 text-center mt-8 mb-10">
            My Appointment
          </h2>

          <div className="min-h-screen bg-blue-50 p-6">
            <div className="mx-auto max-w-4xl">
              {/* Navigation Tabs */}
              <div className="mb-8">
                <div className="flex space-x-8 border-b border-gray-200">
                  <button 
                    className={`pb-2 text-sm font-medium ${activeTab === 'all' ? 'text-gray-900 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`pb-2 text-sm font-medium ${activeTab === 'pending' ? 'text-gray-900 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('pending')}
                  >
                    Pending
                  </button>
                  <button 
                    className={`pb-2 text-sm font-medium ${activeTab === 'confirmed' ? 'text-gray-900 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('confirmed')}
                  >
                    Confirmed
                  </button>
                  <button 
                    className={`pb-2 text-sm font-medium ${activeTab === 'cancelled' ? 'text-gray-900 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('cancelled')}
                  >
                    Cancelled
                  </button>
                  <button 
                    className={`pb-2 text-sm font-medium ${activeTab === 'completed' ? 'text-gray-900 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('completed')}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Appointment Cards */}
              {appointments.length === 0 ? (
                <section className="w-full min-h-screen px-5 py-10 bg-[#F1F9FF]">
                  <MainContainer className="flex flex-col items-center">
                    <h2 className="text-3xl font-semibold text-gray-800 text-center mt-8 mb-5">
                      You don&apos;t have any {activeTab !== 'all' ? activeTab : ''} appointments
                    </h2>
                    <p className="text-md font-semibold text-gray-800 text-center mb-10">
                      {activeTab === 'all' 
                        ? "You don't have any appointments scheduled at the moment."
                        : `You don't have any ${activeTab} appointments at the moment.`}
                    </p>
                    <div className="flex justify-center">
                      <Image 
                        src={notfound} 
                        alt="Empty appointment illustration" 
                        width={300} 
                        height={250} 
                        className="max-w-full h-auto"
                      />
                    </div>
                  </MainContainer>
                </section>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="bg-transparent rounded-lg border border-[#77C4FE]  shadow-sm mb-6">
                        <div className="flex p-5 justify-between items-center mb-6 bg-[#77C4FE] w-full flex-col-12">
                          <h3 className="text-gray-900 text-lg font-medium">{appointment.visitType}</h3>
                          <div className="flex justify-center items-center gap-2 mx-2">               
                               <div >{getStatusBadge(appointment.status)}</div><div className="px-2">
  <Link href={`message/${appointment.id}`}>
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="24" fill="#F1F9FF"/>
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M32 23C32 20.1911 32 18.7866 31.3259 17.7777C31.034 17.341 30.659 16.966 30.2223 16.6741C29.2134 16 27.8089 16 25 16H23C20.1911 16 18.7866 16 17.7777 16.6741C17.341 16.966 16.966 17.341 16.6741 17.7777C16 18.7866 16 20.1911 16 23C16 25.8089 16 27.2134 16.6741 28.2223C16.966 28.659 17.341 29.034 17.7777 29.3259C18.6591 29.9148 19.8423 29.9892 22 29.9986V30L23.1056 32.2111C23.4741 32.9482 24.5259 32.9482 24.8944 32.2111L26 30V29.9986C28.1577 29.9892 29.3409 29.9148 30.2223 29.3259C30.659 29.034 31.034 28.659 31.3259 28.2223C32 27.2134 32 25.8089 32 23ZM25 25C25 24.4477 24.5523 24 24 24H21C20.4477 24 20 24.4477 20 25C20 25.5523 20.4477 26 21 26H24C24.5523 26 25 25.5523 25 25ZM28 21C28 20.4477 27.5523 20 27 20H21C20.4477 20 20 20.4477 20 21C20 21.5523 20.4477 22 21 22H27C27.5523 22 28 21.5523 28 21Z" 
        fill="#77C4FE"
      />
    </svg>
  </Link>
</div></div>
       
                        </div>
                        <div className="p-2">
                        <div className="flex flex-row items-center mx-auto border-b border-[#77C4FE] pb-4">
  <span className="font-medium text-gray-700 flex-1">Appointment ID:</span>
  <span className="text-gray-900 flex-1 ">{appointment.appointmentId}</span>
</div>
                        <div className="flex flex-row items-center border-b border-[#77C4FE] py-4">
                          <span className="font-medium text-gray-700 flex-1 ">Name:</span>
                          <span className="text-gray-900 flex-1">{appointment.patientName}</span>
                        </div>
                        <div className="flex flex-row items-center border-b border-[#77C4FE] py-4">
                          <span className="font-medium text-gray-700 flex-1 ">Email:</span>
                          <span className="text-gray-900 flex-1 ">{appointment.patientEmail}</span>
                        </div>
                        <div className="flex justify-end mt-6">
                          <button 
                            onClick={() => handleViewDetails(appointment)}
                            className="text-blue-600 text-sm font-medium hover:text-blue-700"
                          >
                            See all
                          </button>
                        </div>
                      </div></div>
                    ))}
                  </div>

                  {pagination.totalResults > 0 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={pagination.totalResults}
                        onChange={handlePageChange}
                        showSizeChanger
                        pageSizeOptions={['5', '10', '20', '50']}
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </MainContainer>
    </section>
  );
};

export default MyAppointment;