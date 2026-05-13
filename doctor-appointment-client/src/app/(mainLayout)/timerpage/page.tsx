"use client";

import { useState, useEffect } from "react";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import {
  useListAppointmentsQuery,
  useCreateAppointmentPaymentMutation,
} from "@/redux/features/auth/appontmentApi";
import { IoEllipsisVertical } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { RootState } from "@/redux/store";
import Image from "next/image";
import moment from "moment";

interface Appointment {
  id: string;
  date: string;
  timeSlot: string;
  status: string;
  appointmentId: string;
  paymentDetails: {
    method: string;
  };
  patientName: string;
}

interface PaymentResponse {
  code: number;
  message: string;
  data: {
    attributes: string;
  };
}

interface AppointmentWithTimer extends Appointment {
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export default function AllAppointmentsWithTimers() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useGetProfileQuery(undefined);
  const profileData = profile?.data?.attributes;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.0.60.18:6060';
  const imageUrl = profileData?.user?.profileImage?.startsWith('http') 
    ? profileData.user.profileImage
    : profileData?.user?.profileImage
      ? `${backendUrl}${profileData.user.profileImage}`
      : "/default-profile.png";

  const {
    data: appointmentsData,
    isLoading,
    error,
  } = useListAppointmentsQuery({
    page: 1,
    limit: 100,
  });

  const [appointments, setAppointments] = useState<AppointmentWithTimer[]>([]);
  const [createPayment, { isLoading: isPaymentLoading }] = useCreateAppointmentPaymentMutation();

  useEffect(() => {
    if (appointmentsData?.data?.attributes?.results?.length) {
      const initialAppointments = appointmentsData.data.attributes.results.map(appt => ({
        ...appt,
        timeRemaining: calculateTimeRemaining(new Date(appt.date))
      }));

      setAppointments(initialAppointments);

      const timer = setInterval(() => {
        setAppointments(prevAppointments => 
          prevAppointments.map(appt => ({
            ...appt,
            timeRemaining: calculateTimeRemaining(new Date(appt.date))
          }))
        );
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [appointmentsData]);

  const calculateTimeRemaining = (appointmentDate: Date) => {
    const now = new Date();
    const diff = appointmentDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const handlePayment = async (appointmentId: string) => {
    try {
      const paymentData = {
        appointmentId,
        amount: "9.99",
      };

      const result = (await createPayment(paymentData).unwrap()) as PaymentResponse;

      if (result?.code === 200 && result?.data?.attributes) {
        window.location.href = result.data.attributes;
      } else {
        console.error("Payment successful but no redirect URL provided");
      }
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading appointments...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error loading appointments</div>;

  return (
    <MainContainer className="min-h-screen bg-[#F1F9FF]">
      {/* Header - Maintained exactly as original */}
      <div className="flex justify-center items-center pt-[5.25rem]">
        <header className="flex items-center w-3/4 justify-between px-6 py-5 bg-[#C0E4FF] shadow-sm">
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex gap-2">
                <button
                  className="rounded-full overflow-hidden border-2 border-transparent hover:border-sky-300 transition-all"
                  aria-label="Profile"
                >
                  <Image
                    src={imageUrl}
                    alt="Profile"
                    width={28}
                    height={28}
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 object-cover"
                  />
                </button>
                <div className="text-sm text-gray-700 pt-3">
                  {user?.firstName}{user?.lastName}
                </div>
              </div>
            ) : (
              <div className="hidden sm:block">
                <div className="h-6 w-6 bg-gray-800 text-xs flex items-center justify-center">
                  user
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-cols-1 justify-center items-center gap-4">
            <div className="flex flex-col justify-center items-center">
              <div className="flex items-center gap-1">chat</div>
              <button className="bg-[#F46767] hover:bg-red-500 text-white  px-2 py-1 h-6 text-md text-xs rounded-md">
                Inactive
              </button>
            </div>
            <div>
              <div className="flex items-center gap-1">Appointment</div>
              <button className="bg-[#FBFB3C] text-black px-2 py-1 h-6 text-xs rounded">
                pending
              </button>
            </div>
            
            <div>
              <div className="flex items-center gap-1"></div>
              <button className="px-2 py-1 bg-white rounded-2xl flex items-center">
                <IoEllipsisVertical className="h-5 w-4" />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Main content - Modified to show all appointments */}
      <main className="flex flex-col items-center justify-center mt-[10.25rem]">
        <div className="space-y-8 max-w-2xl px-4 w-full">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="text-center space-y-2  p-6 rounded-lg ">
              <div className="text-5xl font-bold text-gray-800 tracking-wide">
                {String(appointment.timeRemaining.days)} d:{" "}
                {String(appointment.timeRemaining.hours).padStart(2, "0")}h:{" "}
                {String(appointment.timeRemaining.minutes).padStart(2, "0")}m:{" "}
                {String(appointment.timeRemaining.seconds).padStart(2, "0")}s
              </div>
              <p className="text-gray-600">
                Please wait for doctor confirmation 
              </p>

              <p className="text-gray-600">
                Scheduled for: {moment(appointment.date).format("MMMM D, YYYY")}{" "}
                at {appointment.timeSlot}
              </p>

              {appointment.status === 'pending' && (
                <button
                  onClick={() => handlePayment(appointment.appointmentId)}
                  disabled={isPaymentLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-medium rounded disabled:opacity-50 mt-4"
                >
                  {isPaymentLoading ? "Processing..." : "Pay"}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </MainContainer>
  );
}