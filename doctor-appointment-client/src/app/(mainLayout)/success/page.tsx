"use client"

import React from 'react';

export default function AppointmentSuccess() {










  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      
      <div className="relative z-20 container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="relative">
         <svg width="70" height="55" viewBox="0 0 70 55" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clipPath="url(#clip0_1290_33673)">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M67.6815 1.30004C70.6207 3.77547 70.9972 8.16514 68.5221 11.1047L33.3637 52.855C32.0765 54.3837 30.1942 55.2848 28.1958 55.3293C26.198 55.3739 24.2768 54.557 22.9235 53.0867L2.41439 30.82C-0.189068 27.9935 -0.00822282 23.591 2.81846 20.9879C5.64515 18.3841 10.0473 18.565 12.6507 21.3915L27.8075 37.8479L57.8766 2.14047C60.3523 -0.799076 64.7416 -1.17538 67.6815 1.30004Z" 
      fill="#2E8BC9" 
    />
  </g>
  <defs>
    <clipPath id="clip0_1290_33673">
      <rect width="70" height="55" fill="white" />
    </clipPath>
  </defs>
</svg>

              <div className="absolute inset-0 w-20 h-20 bg-green-500/20 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Appointment Confirmed! wait for the email!
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Your appointment has been successfully booked 
          </p>

    
        </div>


   </div>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}