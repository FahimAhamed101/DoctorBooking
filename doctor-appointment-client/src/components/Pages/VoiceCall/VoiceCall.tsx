




import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import React from "react";
import file from "@/assets/file.svg"
import mic from "@/assets/mic.svg"
import video from "@/assets/video.svg"
import share from "@/assets/share.svg"
import Setting from "@/assets/Settings.svg"
import Setting1 from "@/assets/Group 12.svg"
import Call2 from "@/assets/call2.svg"
import Backarrow from "@/assets/Backarrow.svg"
import Chat from "@/assets/chat.svg"
import Image from "next/image";
const VideoCall: React.FC = () => {
  return (
    <section className="w-full  bg-[#F1F9FF]">
      <MainContainer className="flex flex-col   justify-center items-center w-full">
        
       
        <div className="w-[600px] h-[600px] bg-pink-100 rounded-lg  relative flex flex-col items-center">
          {/* Header */}
           <div className="flex flex-col-2  w-full p-2 bg-blue-300 text-white text-left  rounded-t-lg text-lg">
         
            <span className="bg-white w-10 h-10  rounded-full flex justify-center items-center text-white ">
              <Image src={Backarrow} alt="lock icon" width={12} height={12} />
            </span>
           
          <span className="p-1"> Back</span>
          </div>
          <div className="mt-[10.5rem] flex items-center">
  <div className="w-48 h-48 rounded-full border-4 border-purple-300 flex items-center justify-center">
          {/* Center Circle */}
          <div className="bg-gray-300 rounded-full w-40 h-40 flex justify-center items-center  relative">
            <div className="bg-pink-500 w-12 h-12 rounded-full flex justify-center items-center text-white text-2xl">
              🔊
            </div>
          </div>
</div></div>
          {/* User Name */}
          <div className="mt-4 text-lg text-gray-600">Angela Vatiga</div>

          {/* Timestamp */}
          <div className="absolute top-[4rem] left-[4rem] text-sm text-gray-500">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white/60 rounded-full px-4 py-2 shadow-sm">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-700 font-mono text-lg tracking-wider">02 : 30</span>
      </div>
          </div>

   
           <div className="absolute bottom-[4rem] left-[4rem] text-sm text-gray-500">
            27 Jan 2023 10:15 AM
          </div>   
        </div>   
        
     <div className="bg-white w-[600px] flex flex-row items-center justify-between">
        {/* Left controls */}
        <div className="flex flex-row  items-center p-2">
          <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
          <Image src={mic} alt="lock icon" width={15} height={15} />
          </button>

          <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
              <Image src={video} alt="lock icon" width={15} height={15} />
          </button>

         <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
             <Image src={file} alt="lock icon" width={20} height={15} />
          </button>

       <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
          <Image src={share} alt="lock icon" width={20} height={16} />
          </button>

           <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
            <Image src={Setting1} alt="lock icon" width={5} height={5} />
          </button>
            <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
            <Image src={Call2} alt="lock icon" width={20} height={16} />
          </button>
        </div>

   

        {/* Right controls */}
        <div className="flex items-center space-x-3">
      <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
        cc
          </button>
       <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
     <Image src={Setting} alt="lock icon" width={20} height={16} />
          </button>
           <button  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-gray-200">
           <Image src={Chat} alt="lock icon" width={20} height={16} />
          </button>
        </div>
      </div>
      </MainContainer>
    </section>
  );
};

export default VideoCall;
