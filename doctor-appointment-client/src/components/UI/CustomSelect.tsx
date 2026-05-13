"use client";
import { Select } from "antd";
import { FC } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  placeholder?: string;
  className?: string;
  options?: Option[];
  [key: string]: unknown;
}

const CustomSelect: FC<CustomSelectProps> = ({
  placeholder,
  className = "",
  options = [],
  ...rest
}) => {
  return (
    <Select
      size="large"
      placeholder={placeholder || "Select value"}
      className={`w-full ${className}`}
      style={{
        width: '100%',
        height: '40px', // Match Ant Design's large input height
      }}
      {...rest}
    >
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default CustomSelect;