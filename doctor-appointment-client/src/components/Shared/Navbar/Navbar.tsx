"use client";
import logo from "@/assets/logotrust.png";
import CustomButton from "@/components/UI/CustomButton";
import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ActiveLink from "./ActiveLink";

import DropdownModal from "./DropdownModal";
import LogoutModal from "./LogoutModal";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import './navbar.css'
interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About Me", href: "/about-me" },
  { label: "Team Members", href: "/team-members" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useGetProfileQuery(undefined);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalLogoutOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Pathname checks
  const isHomePage = pathname === "/";
  const isPricing = pathname === "/pricing";
  const isFaq = pathname === "/faq";
  const isContact = pathname === "/contact";
  const isReview = pathname === "/review";
  const isNotFound = pathname === "/notfound";
  const isTermCondition = pathname === "/terms-conditions";
  const isPrivacyPolicy = pathname === "/privacy-policy";
  const isChangePassword = pathname === "/change-password";
  const isMessage = pathname === "/message";

  const profileData = profile?.data?.attributes;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.0.60.18:6060';
  const imageUrl = profileData?.user?.profileImage?.startsWith('http') 
    ? profileData.user.profileImage
    : profileData?.user?.profileImage
      ? `${backendUrl}${profileData.user.profileImage}`
      : "/default-profile.png";

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const getNavbarBackground = (): string => {
    if (isHomePage) return "bg-sky-50 pt-5";
    if (isPricing) return "bg-[#F4FCF8] pt-5";
    if (isFaq || isContact || isReview || isTermCondition || isPrivacyPolicy) return "bg-sky-50 pt-5";
    if (isNotFound || isChangePassword || isMessage) return "bg-[#F1F9FF] pt-5";
    return "bg-white py-2 sm:py-3 md:py-4 lg:py-5";
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 header-index ${getNavbarBackground()}`}>
      <div className="w-full container mx-auto p-2 sm:p-3 md:p-4 bg-sky-100 flex justify-between items-center rounded-lg">
        {/* Logo */}
        <div className="flex items-center">
          <div
            className="relative rounded-full overflow-hidden shadow-md shadow-sky-100"
            style={{
              width: 'clamp(2.5rem, 5vw, 5rem)',
              height: 'clamp(2.5rem, 5vw, 5rem)',
              boxShadow: '0 0 15px rgba(119, 196, 254, 0.7)'
            }}
          >
            <Link href="/">
              <Image
                src={logo}
                alt="logo"
                fill
                priority
                sizes="(max-width: 768px) 60px, 90px"
                className="object-cover"
                style={{
                  objectPosition: 'center'
                }}
              />
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex justify-center items-center gap-4 xl:gap-6 2xl:gap-8">
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <ActiveLink title={label} destination={href} />
            </li>
          ))}
        </ul>

        {/* Tablet Navigation */}
        <ul className="hidden md:flex lg:hidden justify-center items-center gap-3">
          {navLinks.slice(0, 4).map(({ label, href }) => (
            <li key={label}>
              <ActiveLink title={label} destination={href} />
            </li>
          ))}
        </ul>

        {/* Right side buttons */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {user ? (
            <>
              <div className="hidden sm:block">
                {/* <Link href="/book-appointment" passHref legacyBehavior>
                  <CustomButton className="bg-sky-300 text-xs sm:text-sm md:text-base lg:text-lg">
                    Book Now
                  </CustomButton>
                </Link> */}

                <Link href="https://dashboard.curoflow.uk/trustedgpclinic" passHref legacyBehavior>
                  <CustomButton className="bg-sky-300 text-xs sm:text-sm md:text-base lg:text-lg">
                    Book Now
                  </CustomButton>
                </Link>
              </div>
              
              {/* Mail button */}
              <Link 
                href="/message"
                className="bg-sky-200 text-sky-700 flex flex-col justify-center items-center p-1 xs:p-1.5 sm:p-1.5 md:p-2 rounded-full hover:bg-sky-300 transition-colors"
                aria-label="Contact us"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.00034 10.4146C3 10.5689 3 10.7302 3 10.8991V14.9998C3 17.8283 3 19.2425 3.87868 20.1212C4.75736 20.9998 6.17157 20.9998 9 20.9998H15C17.8284 20.9998 19.2426 20.9998 20.1213 20.1212C21 19.2425 21 17.8283 21 14.9998V10.8991C21 10.7302 21 10.5689 20.9997 10.4146L19.2929 12.1213C18.7303 12.6839 17.9672 13 17.1716 13H6.82843C6.03278 13 5.26972 12.6839 4.70711 12.1213L3.00034 10.4146ZM3.23713 7.82292L6.12132 10.7071C6.30886 10.8946 6.56321 11 6.82843 11H17.1716C17.4368 11 17.6911 10.8946 17.8787 10.7071L20.7629 7.82292C20.6991 7.63977 20.6182 7.47274 20.5155 7.31472C20.031 6.56916 19.1662 6.18484 17.4368 5.41621L17.4368 5.41621L13.6246 3.72187C12.8245 3.36627 12.4244 3.18848 12 3.18848C11.5756 3.18848 11.1755 3.36627 10.3754 3.72187L6.56317 5.41621C4.83375 6.18484 3.96905 6.56915 3.48452 7.31472C3.38183 7.47274 3.30091 7.63977 3.23713 7.82292Z" fill="#414141"/>
                </svg>
              </Link>

              {/* Profile button */}
              <button
                className="rounded-full overflow-hidden border-2 border-transparent hover:border-sky-300 transition-all flex-shrink-0"
                onClick={() => setIsModalOpen(true)}
                aria-label="Profile"
              >
                <Image
                  src={imageUrl}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 object-cover rounded-full"
                />
              </button>

              {/* Mobile menu button */}
              <Button
                className="lg:hidden ml-1 sm:ml-2 flex-shrink-0"
                type="text"
                icon={<MenuOutlined className="text-base sm:text-lg" />}
                onClick={showDrawer}
                aria-label="Menu"
              />
            </>
          ) : (
            <div className="flex gap-2 items-center">
              {/* <Link href="/book-appointment" passHref legacyBehavior>
                <CustomButton className="bg-sky-300 text-xs sm:text-sm md:text-base lg:text-lg">
                  Book Now
                </CustomButton>
              </Link> */}

              <Link href="https://dashboard.curoflow.uk/trustedgpclinic" passHref legacyBehavior>
                <CustomButton className="bg-sky-300 text-xs sm:text-sm md:text-base lg:text-lg">
                  Book Now
                </CustomButton>
              </Link>
              <Link href="/login" passHref legacyBehavior>
                <CustomButton className="bg-sky-300 text-xs sm:text-sm md:text-base lg:text-lg">
                  Login
                </CustomButton>
              </Link>
              
              {/* Mobile menu button for non-logged in users */}
              <Button
                className="lg:hidden ml-1 sm:ml-2 flex-shrink-0"
                type="text"
                icon={<MenuOutlined className="text-base sm:text-lg" />}
                onClick={showDrawer}
                aria-label="Menu"
              />
            </div>
          )}
        </div>

        <DropdownModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          setIsLogoutModalOpen={setIsLogoutModalOpen}
        />
        <LogoutModal
          isOpen={isModalLogoutOpen}
          onClose={() => setIsLogoutModalOpen(false)}
        />

        {/* Mobile Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src={logo} alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-lg font-medium">Menu</span>
            </div>
          }
          placement="right"
          onClose={closeDrawer}
          open={drawerVisible}
          width="85%"
          className="[&_.ant-drawer-body]:pt-3"
        >
          <ul className="flex flex-col gap-3 sm:gap-4">
            {navLinks.map(({ label, href }) => (
              <li key={label}>
                <ActiveLink
                  title={label}
                  destination={href}
                  onClick={closeDrawer}
                />
              </li>
            ))}
          </ul>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar;