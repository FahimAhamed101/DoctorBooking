// src/components/DropdownModal.tsx
"use client";
import { UserOutlined, CalendarOutlined, LockOutlined, LogoutOutlined } from "@ant-design/icons";
import Link from "next/link";


export default function DropdownModal({ isOpen, onClose, setIsLogoutModalOpen }) {
  if (!isOpen) return null;

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
    onClose(); // Close the dropdown when logout is clicked
  };

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-end pt-40 pr-4" onClick={onClose}>
      <div className="w-64 rounded-lg overflow-hidden shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="bg-sky-200 rounded-lg overflow-hidden">
          <button className="w-full bg-sky-400 text-white px-4 py-3 flex items-center hover:bg-sky-500 transition-colors">
            <UserOutlined className="mr-3 h-5 w-5" />
            <Link href="/profile">
              <span>My Account</span>
            </Link>
          </button>

          <button className="w-full text-gray-700 px-4 py-3 flex items-center hover:bg-sky-300 transition-colors">
            <CalendarOutlined className="mr-3 h-5 w-5" />
            <Link href="/my-appointment">
              <span>My Appointment</span>
            </Link>
          </button>

          <button className="w-full text-gray-700 px-4 py-3 flex items-center hover:bg-sky-300 transition-colors">
            <LockOutlined className="mr-3 h-5 w-5" />
            <Link href="/change-password">
              <span>Change Password</span>
            </Link>
          </button>

          <button
            onClick={handleLogoutClick}
            className="w-full text-gray-700 px-4 py-3 flex items-center hover:bg-sky-300 transition-colors"
          >
            <LogoutOutlined className="mr-3 h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}