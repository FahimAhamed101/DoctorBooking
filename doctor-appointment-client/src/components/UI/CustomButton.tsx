"use client";

import React from "react";

interface CustomButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  htmlType?: "button" | "submit" | "reset";
  disabled?: boolean;
 loading?: boolean;
  type?: "button" | "submit" | "reset"; // Added for consistency with HTML button
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  className = "",
  onClick,
  htmlType = "button",
  disabled = false,
  type, // Fallback to htmlType if type is not provided
}) => {
  return (
    <button
      type={type || htmlType}
      className={`${className} bg-[#77C4FE] flex px-12 py-3.5 justify-center border items-center gap-5 text-white rounded-xl hover:bg-[#77C4FE] hover:border-[#77C4FE] transition-all duration-500 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;