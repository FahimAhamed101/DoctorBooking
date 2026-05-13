"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface IActiveLink {
  title: string;
  destination: string;
  onClick?: () => void;
}

const ActiveLink = ({ title, destination, onClick }: IActiveLink) => {
  const path = usePathname();
  // Check if current path exactly matches destination or starts with destination (for nested routes)
  const active = path === destination || 
                (destination !== "/" && path.startsWith(destination));

  return (
    <Link href={destination} onClick={onClick} className="group block">
      <li
        className={`
          font-medium
          text-sm xs:text-base sm:text-[17px]
          py-1.5 sm:py-2
          border-b-2
          duration-200
          transition-all
          whitespace-nowrap
          px-1
          ${
            active
              ? "border-sky-400 text-gray-900" // Active state styles
              : "text-gray-600 border-transparent group-hover:border-sky-400 group-hover:text-gray-900" // Default + hover styles
          }
        `}
      >
        {title}
      </li>
    </Link>
  );
};

export default ActiveLink;