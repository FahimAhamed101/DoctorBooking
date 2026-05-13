import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import React from "react";
import file from "@/assets/file.svg";
import mic from "@/assets/mic.svg";
import video1 from "@/assets/video1.svg";
import share from "@/assets/share.svg";
import Setting from "@/assets/Settings.svg";
import Setting1 from "@/assets/Group 12.svg";
import Call2 from "@/assets/call2.svg";
import Backarrow from "@/assets/Backarrow.svg";
import Chat from "@/assets/chat.svg";
import videoimage from "@/assets/videocallImg.jpg";
import Image, { StaticImageData } from "next/image";

const VoiceCall: React.FC = () => {
  return (
    <section className="w-full bg-[#F1F9FF] min-h-screen">
      <MainContainer className="flex flex-col justify-center items-center w-full p-4">
        {/* Video Container */}
        <div className="w-full max-w-4xl rounded-lg overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-[#77C4FE] right-0 z-10 flex items-center p-4">
            <button className="bg-[#FFFFFF] w-10 h-10 rounded-full flex justify-center items-center hover:bg-white">
              <Image src={Backarrow} alt="Back arrow" width={12} height={12} />
            </button>
            <span className="ml-2 text-white">Back</span>
          </div>
          <div className="relative">
            {/* Video Background */}
            <div className="relative w-full aspect-video">
              <Image
                src={videoimage}
                alt="Video call background"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Timestamp */}
            <div className="absolute top-10 left-4 z-10">
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white font-mono text-lg tracking-wider">
                  02 : 30
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="absolute bottom-28 left-4 z-10 text-white text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
              27 Jan 2023 10:15 AM
            </div>

            {/* Controls Container */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#FFFFFF] p-4">
              <div className="flex justify-between items-center">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <ControlButton icon={mic} alt="Microphone" />
                  <ControlButton icon={video1} alt="Video" />
                  <ControlButton icon={file} alt="File" />
                  <ControlButton icon={share} alt="Share" />

                  <button
                    className={`w-12 bg-[#D9D9D9] h-12 flex items-center justify-center rounded-full text-[#000000] `}
                  >
                    <Image
                      src={Setting1}
                      alt={"Button icon"}
                      width={6}
                      height={5}
                      className=" text-[#000000]"
                    />
                  </button>
                  {/* Center Control (End Call) */}
                  <ControlButton
                    icon={Call2}
                    alt="End call"
                    className="bg-red-500 hover:bg-red-600"
                  />
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <ControlButton text="cc" />
                  <ControlButton icon={Setting} alt="More settings" />
                  <ControlButton icon={Chat} alt="Chat" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </section>
  );
};

// Reusable control button component
interface ControlButtonProps {
  icon?: StaticImageData;
  alt?: string;
  text?: string;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  alt,
  text,
  className = "bg-[#D9D9D9] hover:bg-white/20",
}) => {
  return (
    <button
      className={`w-12 h-12 flex items-center justify-center rounded-full text-[#000000] ${className}`}
    >
      {icon ? (
        <Image
          src={icon}
          alt={alt || "Button icon"}
          width={20}
          height={20}
          className="text-[#000000]"
        />
      ) : (
        <span className="">{text}</span>
      )}
    </button>
  );
};

export default VoiceCall;