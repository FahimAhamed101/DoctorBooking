import Image from "next/image";
import about1 from "@/assets/about/about1.png"; // Doctor image
import about2 from "@/assets/about/about2.png"; // Smaller nurse image
import about3 from "@/assets/about/about3.png";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomButton from "@/components/UI/CustomButton";
import circle from "@/assets/circle.svg"
import Link from "next/link";
const AboutUs = () => {
  return (
    <section className="w-full px-5 py-16 relative">
      <MainContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Right section with text content (first on mobile, second on larger screens) */}
        <div className="w-full h-full relative flex items-center bg-cover bg-left order-1 md:order-2" 
        >
                <div className="absolute top-[-224px] left-[-288px]  z-10">
        <Image
          src={about3}
          alt="Background"
       
          
          
           // Adjust opacity as needed
        />
      </div>
          <div className="text-center md:text-left z-50">
            <h2 className="text-3xl font-bold text-gray-800">About Us</h2>
            <h3 className="text-xl font-semibold text-gray-700 mt-4">
              World-Class Preventive, Prescriptive & Curative Medical Practices
            </h3>
            <p className="text-lg text-gray-600 mt-4">
              Discover quality healthcare close to you with our easy-to-use
              platform. Quickly locate and connect with nearby healthcare
              professionals who meet your needs. Take charge of your
              well-being—find a doctor today. Your health journey starts here.
            </p>

            <div className="mt-5">
              <Link href="/about-us">
                <CustomButton className="bg-sky-300">See More </CustomButton></Link>
             
            
            </div>
          </div>
           <div className="absolute rounded-lg right-[168px] top-[91px]">
          <Image
              src={circle}
              alt="circle"
              className=""
              width={80}
              height={80}
              objectFit="cover"
            />
      </div>
        </div>

        {/* Left section with doctor and circular nurse image (second on mobile, first on larger screens) */}
        <div className="relative w-full order-2 md:order-1">
            {/* Doctor Image */}
            <Image
              src={about1}
              alt="Doctor"
              className="rounded-lg shadow-sm"
              width={600}
              height={500}
              objectFit="cover"
            />
            {/* Circular overlay image of the nurse */}
            <div className="absolute  left-1/2 md:left-[55%] transform -translate-x-1/2 md:translate-x-0 bottom-4 size-40 md:size-96 overflow-hidden">
              <Image
                src={about2}
                width={300}
              height={300}
                alt="Nurse smiling"
               
                objectFit="cover"
              />
            </div>     
        </div>
       
      </MainContainer>
  
      <div className="absolute rounded-lg right-0 top-[-8.25rem] pb-25">
          <Image
              src={circle}
              alt="circle"
              className=""
              width={180}
              height={180}
              objectFit="cover"
            />
      </div>
    
    </section>
  );
};

export default AboutUs;
