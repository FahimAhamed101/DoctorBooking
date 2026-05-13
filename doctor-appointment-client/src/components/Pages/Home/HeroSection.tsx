"use client";

import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomButton from "@/components/UI/CustomButton";
import React, { useState, useEffect } from "react";
import doctorImage1 from "@/assets/hero-section/doctor1.png";
import doctorImage2 from "@/assets/hero-section/doctor.png";
import doctorImage3 from "@/assets/hero-section/nurse.png";
import circle from "@/assets/hero-section/circle.png";
import emoji from "@/assets/hero-section/emoji.png";
import checked from "@/assets/hero-section/checked.png";
import Image from "next/image";
import call from "@/assets/call.svg";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Animation variants with proper typing
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const imageVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const floatingVariants: Variants = {
  float: {
    y: [-10, 10],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  },
};

const doctorImages = [
  { id: 1, src: doctorImage1 },
  { id: 2, src: doctorImage3 },
  { id: 3, src:  doctorImage2},
 
];

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === doctorImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full px-5 bg-[#F1F9FF] overflow-hidden">
      <MainContainer className="w-full h-full md:h-[75vh] grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center place-content-center pt-10 md:pt-0">
        {/* Left side: Animated content */}
        <motion.div
          className="w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero title */}
          <motion.h1 className="flex flex-col mt-[50px] sm:mt-0 sm:pt-5" variants={itemVariants}>
            <span className="text-[#414141] text-[40px] sm:text-[50px] md:text-[60px] lg:text-[70px] font-[600] leading-tight">
              Doctor live
            </span>
            <motion.span
              className="text-[#2AA7FF] text-[40px] sm:text-[50px] md:text-[60px] lg:text-[70px] font-[600] leading-tight"
              variants={itemVariants}
            >
              Consultation.
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-[16px] leading-relaxed text-gray-600 font-[600] my-6"
            variants={itemVariants}
          >
             Trusted GP care, on your terms    -  discreet, fast, convenient, and truly personal.
          </motion.p>

          {/* Appointment button */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-2"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            > 
              {/* <Link href="/book-appointment" passHref legacyBehavior>
                <CustomButton className="bg-[#77C4FE] hover:bg-sky-500 text-white px-8 py-2 text-base font-medium whitespace-nowrap">
                  Book an appointment
                </CustomButton>
              </Link> */}

              <Link href="https://dashboard.curoflow.uk/trustedgpclinic" passHref legacyBehavior>
                <CustomButton className="bg-[#77C4FE] hover:bg-sky-500 text-white px-8 py-2 text-base font-medium whitespace-nowrap">
                  Book an appointment
                </CustomButton>
              </Link>
            </motion.div>

            <div className="flex items-start gap-2">
              <div className="flex items-center p-2">
                <Image
                  src={call}
                  alt="Emergency call"
                  width={50}
                  height={20}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">If you have an emergency, </div>
                <div className="text-gray-600">please call NHS 111 or ambulance on 999 if life threatening</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side: Animated image section */}
        <motion.div
          className="w-full h-full rounded-xl flex justify-center items-center relative"
          initial="hidden"
          animate="visible"
          variants={imageVariants}
        >
          {/* Circle background */}
          <motion.div
            variants={floatingVariants}
            animate="float"
          >
            <Image
              src={circle}
              alt="Background circle"
              width={580}
              height={580}
              className="w-[400px] sm:w-[450px] md:w-[480px] xl:w-[580px]"
              priority
            />
          </motion.div>

          {/* Doctor image with auto-changing animation */}
          <div className="h-[280px] sm:h-[320px] md:h-[330px] xl:h-[400px] 2xl:h-[480px] mr-0 sm:mr-[9.5rem] -bottom-[25px] absolute z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={doctorImages[currentImageIndex].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={doctorImages[currentImageIndex].src}
                  alt="Doctor"
                  width={400}
                  height={480}
                  className="h-[280px] sm:h-[320px] md:h-[330px] xl:h-[400px] 2xl:h-[521px] w-auto"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Happy Client badge */}
          <motion.div
            className="flex gap-3 items-center -left-8 absolute top-36 bg-[#F6F9FFCF] shadow-lg shadow-blue-200 px-8 py-4 rounded-3xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Image 
              src={emoji} 
              alt="Happy emoji" 
              width={50} 
              height={50}
              priority
            />
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-secondary">84k+</h1>
              <h1>Happy Client</h1>
            </div>
          </motion.div>

          {/* Regular Checkup badge */}
          <motion.div
            className="flex gap-5 items-center right-28 absolute bottom-9 bg-[#F6F9FFCF] shadow-lg shadow-blue-200 px-10 py-5 rounded-3xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Image 
              src={checked} 
              alt="Checkmark" 
              width={50} 
              height={50}
              priority
            />
            <h1 className="font-semibold">
              Regular <br /> Checkup
            </h1>
          </motion.div>
        </motion.div>
    
      </MainContainer>
    </section>
  );
};

export default HeroSection;