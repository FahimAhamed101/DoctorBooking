// src/app/about-me/page.tsx
"use client";

import circle from "@/assets/hero-section/circle.png";
import profileImage from "@/assets/hero-section/nurse.png"; // Fallback image
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import CustomButton from "@/components/UI/CustomButton";
import { HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { FaAward } from "react-icons/fa";
import { FiFacebook, FiInstagram, FiLinkedin, FiTwitter } from "react-icons/fi";
import {
  MdLocalPhone,
  MdOutlineCalendarMonth,
  MdOutlineEmail,
 
  MdSchool,
  MdWork,
} from "react-icons/md";
import { useGetAboutMeQuery } from "@/redux/features/aboutMe/aboutMeApi";

interface BreadcrumbItem {
  href?: string;
  title: React.ReactNode;
}

interface Media {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  X?: string;
}










const breadcrumbItems: BreadcrumbItem[] = [
  {
    href: "/",
    title: (
      <div className="flex gap-2">
        <HomeOutlined />
        <span>Home</span>
      </div>
    ),
  },
  {
    title: "About Me",
  },
];

const AboutMe = () => {
  const { data, isLoading, isError } = useGetAboutMeQuery();

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (isError) return <div className="text-center py-10 text-red-500">Error loading data</div>;

  const aboutMeData = data?.data?.attributes?.team;
  const scheduleList = data?.data?.attributes?.scheduleList;

  if (!aboutMeData) {
    return <div className="text-center py-10">No data available</div>;
  }

  // Parse the media string if it exists
  let media: Media = {};
  try {
    media = aboutMeData.media ? JSON.parse(aboutMeData.media) : {};
  } catch (e) {
    console.error("Error parsing media:", e);
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.0.60.18:6060';
  const imageUrl = aboutMeData?.profileImage
    ? `${backendUrl}${aboutMeData?.profileImage}`
    : profileImage.src;

  return (
    <section className="w-full px-5 py-10">
      <div className="pl-40">
        <CustomBreadcrumb items={breadcrumbItems} /> 
      </div>
     
      <div className="w-full hidden lg:block p-36 my-5 rounded-xl bg-[#F1F9FF]"></div>
      
      {/* Main content container */}
      <div className="w-full md:w-[80%] mx-auto flex flex-col lg:flex-row gap-20 mt-10">
        {/* Left Section (Doctor Image and Contact Info) */}
        <div className="w-full lg:w-1/3 rounded-xl">
          <div className="flex flex-col items-center">
            <div className="w-full h-full max-w-[500px] mx-auto bg-[#C0E4FF] flex justify-center relative rounded-xl px-5 py-8 -mt-0 lg:-mt-32">
              <img
                src={circle.src}
                alt="Decorative circle background"
                className="w-[300px] md:w-[380px] lg:w-[390px] xl:w-[400px] mb-[7.25rem] -mr-14 md:-mr-16 xl:-mr-20 2xl:-mr-28"
              />
              <img
                src={imageUrl}
                alt={`Profile of ${aboutMeData.fullName}`}
                className="h-[470px] bottom-0 absolute ml-[2.5rem] object-cover"
              />
            </div>
          </div>
          <div className="w-full space-y-4 my-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-[#32526B]">
                Contact Us
              </h1>
              <div className="flex space-x-3">
                {media.facebook && (
                  <Link
                    href={media.facebook}
                    className="size-9 border border-[#6CB2E7] text-[#6CB2E7] rounded-full flex justify-center items-center hover:bg-[#6CB2E7] hover:text-white transition-all duration-300"
                    aria-label="Facebook profile"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiFacebook size={18} />
                  </Link>
                )}
                {media.linkedin && (
                  <Link
                    href={media.linkedin}
                    className="size-9 border border-[#6CB2E7] text-[#6CB2E7] rounded-full flex justify-center items-center hover:bg-[#6CB2E7] hover:text-white transition-all duration-300"
                    aria-label="LinkedIn profile"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiLinkedin size={18} />
                  </Link>
                )}
                {media.X && (
                  <Link
                    href={media.X}
                    className="size-9 border border-[#6CB2E7] text-[#6CB2E7] rounded-full flex justify-center items-center hover:bg-[#6CB2E7] hover:text-white transition-all duration-300"
                    aria-label="Twitter profile"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiTwitter size={18} />
                  </Link>
                )}
                {media.instagram && (
                  <Link
                    href={media.instagram}
                    className="size-9 border border-[#6CB2E7] text-[#6CB2E7] rounded-full flex justify-center items-center hover:bg-[#6CB2E7] hover:text-white transition-all duration-300"
                    aria-label="Instagram profile"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiInstagram size={18} />
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdLocalPhone color="#77C4FE" size={24} />
              <h1 className="font-semibold">
                {aboutMeData.callingCode} {aboutMeData.phoneNumber}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <MdOutlineEmail color="#77C4FE" size={24} />
              <h1 className="font-semibold">{aboutMeData.email}</h1>
            </div>
            <div className="flex items-center gap-3">
              <MdOutlineCalendarMonth color="#77C4FE" size={24} />
              <h1 className="text-2xl font-semibold">
                Appointment Schedules
              </h1>
            </div>
            <div className="w-full space-y-4 p-8 rounded-xl text-gray-800 bg-[#D5EDFF]">
              {scheduleList && scheduleList.length > 0 ? (
                scheduleList.map((schedule) => (
                  <div key={schedule.id} className="flex justify-between items-center">
                    <h1>{schedule.dayOfWeek}</h1>
                    <h1 className="font-semibold flex items-center gap-1">
                      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.79492 12C3.79492 7.30558 7.6005 3.5 12.2949 3.5C16.9893 3.5 20.7949 7.30558 20.7949 12C20.7949 16.6944 16.9893 20.5 12.2949 20.5C7.6005 20.5 3.79492 16.6944 3.79492 12ZM13.0449 7C13.0449 6.58579 12.7091 6.25 12.2949 6.25C11.8807 6.25 11.5449 6.58579 11.5449 7V12C11.5449 12.2586 11.6781 12.4989 11.8974 12.636L14.8974 14.511C15.2487 14.7305 15.7114 14.6238 15.9309 14.2725C16.1505 13.9212 16.0437 13.4585 15.6924 13.239L13.0449 11.5843V7Z" fill="#77C4FE"/>
                      </svg>
                      {schedule.startTime} - {schedule.endTime}
                    </h1>
                  </div>
                ))
              ) : (
                <p>No schedules available</p>
              )}
            </div>
          </div>
          <div className="flex justify-end items-center my-5">
            <Link href="/book-appointment" passHref legacyBehavior>
              <CustomButton className="bg-sky-300">Book an appointment</CustomButton>
            </Link>
          </div>
        </div>

        {/* Right Section (Doctor Info and Biography) */}
        <div className="w-full md:w-[600px] mx-auto rounded-xl -mb-2 lg:-mt-[17rem]">
          <div className="space-y-16">
            {/* Header Section */}
            <div className="space-y-4 text-gray-800">
              <h1 className="text-4xl font-semibold">
                {aboutMeData.fullName}
              </h1>
              <p className="text-xl font-semibold">
                {aboutMeData.designation}
              </p>
              <p className="text-xl font-semibold text-[#77C4FE]">
                {aboutMeData.specialties}
              </p>
              <p>
                {aboutMeData.about}
              </p>
            </div>

            {/* Degrees Section */}
            {aboutMeData.degrees?.length > 0 && (
              <div>
                <h3 className="font-bold text-2xl mb-3 text-[#32526B] flex items-center gap-3">
                  <MdSchool color="#77C4FE" size={32} /> Degrees
                </h3>
                <ul className="space-y-4 px-6">
                  {aboutMeData.degrees.map((degree) => (
                    <li key={degree._id} className="flex items-start gap-3">
                      <span className="bg-[#77C4FE] w-2 h-2 mt-2 rounded-full inline-block"></span>
                      <div>
                        <h1 className="text-xl font-semibold text-[#32526B]">
                          {degree.school}
                        </h1>
                        {degree.degree && <p className="text-[#627D98]">{degree.degree}</p>}
                        {degree.subject && <p className="text-[#627D98]">{degree.subject}</p>}
                        {degree.grade && <p className="text-[#627D98]">{degree.grade}</p>}
                        <p className="text-[#627D98]">
                          {new Date(degree.startDate).toLocaleDateString()} -{' '}
                          {new Date(degree.endDate).toLocaleDateString()}
                        </p>
                        {degree.skills?.length > 0 && (
                          <div className="mt-2">
                            <span className="font-semibold">Skills:</span>{' '}
                            {degree.skills.join(', ')}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experiences Section */}
            {aboutMeData.experience?.length > 0 && (
              <div>
                <h3 className="font-bold text-2xl mb-3 text-[#32526B] flex items-center gap-3">
                  <MdWork color="#77C4FE" size={32} /> Experiences
                </h3>
                <ul className="space-y-4 px-6">
                  {aboutMeData.experience.map((exp) => (
                    <li key={exp._id} className="flex items-start gap-3">
                      <span className="bg-[#77C4FE] w-2 h-2 mt-2 rounded-full inline-block"></span>
                      <div>
                        <h1 className="text-xl font-semibold text-[#32526B]">
                          {exp.title} at {exp.company}
                        </h1>
                        <p className="text-[#627D98]">
                          {exp.location} • {exp.employmentType}
                        </p>
                        <p className="text-[#627D98]">
                          {new Date(exp.startDate).toLocaleDateString()} -{' '}
                          {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-[#627D98] mt-2">{exp.description}</p>
                        )}
                        {exp.skills?.length > 0 && (
                          <div className="mt-2">
                            <span className="font-semibold">Skills:</span>{' '}
                            {exp.skills.join(', ')}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Awards/Achievements Section */}
            {aboutMeData.achievements?.length > 0 && (
              <div>
                <h3 className="font-bold text-2xl mb-3 text-[#32526B] flex items-center gap-3">
                  <FaAward color="#77C4FE" size={32} /> Awards/Achievements
                </h3>
                <ul className="space-y-4 px-6">
                  {aboutMeData.achievements.map((achievement) => (
                    <li key={achievement._id} className="flex items-start gap-3">
                      <span className="bg-[#77C4FE] w-2 h-2 mt-2 rounded-full inline-block"></span>
                      <div>
                        <h1 className="text-xl font-semibold text-[#32526B]">
                          {achievement.title}
                        </h1>
                        <p className="text-[#627D98]">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                        {achievement.description && (
                          <p className="text-[#627D98] mt-2">{achievement.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;