"use client";

import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import Image from "next/image";
import React from "react";
import notfound from "@/assets/notfound.svg"
import Link from "next/link";


const NotFound : React.FC = () => {



  return (
    <section className="w-full min-h-screen px-5 py-10 bg-[#F1F9FF] f">
      <MainContainer className="text-center flex justify-center">
        
        <div>  <h1 className="text-4xl font-semibold mb-6">Sorry,Page not Found!</h1>  
           <Link href="/" className="text-2xl font-semibold mb-6">Go to Homepage</Link>  
        <Image src={notfound} alt="lock icon" width={600} height={16} /> </div>
     

  
      </MainContainer>
    </section>
  );
};

export default NotFound;
