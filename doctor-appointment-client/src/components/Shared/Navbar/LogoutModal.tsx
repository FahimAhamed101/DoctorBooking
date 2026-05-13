// src/components/LogoutModal.tsx
"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/UI/Dialog"
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import DropdownModal from "./DropdownModal";
import { useState } from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  setIsDropdownOpen?: (open: boolean) => void;
}

export default function LogoutModal({ isOpen, onClose, setIsDropdownOpen }: LogoutModalProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancel = () => {
    onClose();
  };

  const handleLogout = () => {
    // Dispatch the logout action from authSlice
    dispatch(logout());
    
    // Close dropdown modal if it exists
    if (setIsDropdownOpen) {
      setIsDropdownOpen(false);
    }
    
    // Redirect to home
    router.push('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#F1F9FF] rounded-[1.5rem]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900">Logout</DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            Are you sure you want to log out?
          </DialogDescription>
        </DialogHeader>
        
        <DropdownModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} 
          setIsLogoutModalOpen={() => {}}
        />
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-10 font-medium"
          >
            No
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg h-10 font-medium border-0"
          >
            Yes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}