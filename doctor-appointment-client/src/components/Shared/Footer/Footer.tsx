import { MdLocalPhone, MdLocationOn, MdOutlineEmail } from "react-icons/md";
import logo from '@/assets/logotrust.png'
import Image from "next/image";
import { FiFacebook, FiLinkedin } from "react-icons/fi";
import { PiWhatsappLogo } from "react-icons/pi";
import MainContainer from "../MainContainer/MainContainer";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full py-20 bg-[#548BB4] px-5">
      <MainContainer className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          <div className="space-y-4 text-center md:text-start col-span-2 md:col-span-1">
            <div className="size-[80px] relative mx-auto md:mx-0">
              <Image fill src={logo} alt="logo" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white">
                Doctor Appointment Booking
              </h1>
              <h1 className="text-white">
                Take control of your health journey with Trusted GP Clinic a trusted
                companion committed to your well-being. Your health, your time,
                your way. Start your journey today.
              </h1>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white text-center md:text-start">
            Explore
            </h1>
            <ul className="flex flex-col text-center md:text-start gap-4 mt-5">
              <li>
                <Link href="/" className="text-white hover:text-gray-700 hover:underline">
                Home
                </Link>
              </li>
              <li>
                <Link href="/chat-bot" className="text-white hover:text-gray-700 hover:underline">
                Chat bot
                </Link>
              </li>
              <li>
                <Link href="/about-me" className="text-white hover:text-gray-700 hover:underline">
                About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white hover:text-gray-700 hover:underline">
                Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-gray-700 hover:underline">
                Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white text-center md:text-start">
            Support
            </h1>
            <ul className="flex flex-col gap-4 mt-5 text-center md:text-start">
              <li>
                <Link href="/faq" className="text-white hover:text-gray-700 hover:underline">
                FAQ.s
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-white hover:text-gray-700 hover:underline">
                Terms & Condition
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-white hover:text-gray-700 hover:underline">
                Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-gray-700 hover:underline">
                Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h1 className="text-2xl font-semibold text-white text-center md:text-start">
              Contact
            </h1>
            <ul className="flex flex-col gap-4 mt-5 text-center md:text-start">
              <li className="flex justify-center md:justify-start items-center gap-2 text-white">
                <MdOutlineEmail size={20} />
                <span className="ml-2">support@trustedgpclinic.com</span>
              </li>
              <li className="flex justify-center md:justify-start items-center gap-2 text-white">
                <MdLocalPhone size={20} />
                <span className="ml-2">+447584921976</span>
              </li>
              <li className="flex justify-center md:justify-start items-center gap-2 text-white">
                <MdLocationOn size={20} />
                <span className="ml-2">5 Mahogany Walk, PL31 2TH, Bodmin, Cornwall, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>
        <hr />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="font-semibold text-white text-center sm:text-start">
            Copyright @2025. All Rights Reserved
          </h1>
          <div className="flex justify-center md:justify-start items-center gap-5">
            <Link href="https://www.facebook.com/profile.php?id=61579295817727" className="bg-white size-10 rounded-full flex justify-center items-center">
              <FiFacebook className="text-[#548BB4]" size={18} />
            </Link>
            <Link href="https://www.linkedin.com/company/trusted-gp-clinic/" className="bg-white size-10 rounded-full flex justify-center items-center">
              <FiLinkedin className="text-[#548BB4]" size={18} />
            </Link>

            <div className="bg-white size-10 rounded-full flex justify-center items-center">
              <PiWhatsappLogo className="text-[#548BB4]" size={18} />
            </div>
          </div>
        </div>
      </MainContainer>
    </footer>
  );
};

export default Footer;