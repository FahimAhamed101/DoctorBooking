"use client";
import Image from "next/image";
import { Form } from "antd";
import { MailOutlined } from "@ant-design/icons";
import logo from "@/assets/logotrust.png";
import nurseImage from "@/assets/hero-section/nurse.png";
import circle from "@/assets/hero-section/circle.png";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomLoadingButton from "@/components/UI/CustomLoadingButton";
import React from "react";
import CustomInput from "@/components/UI/CustomInput";
import { useRouter } from "next/navigation";
import { useForgotPasswordMutation } from "@/redux/features/auth/authApi"; // Import the hook

interface IForgotPasswordProps {
  email: string;
}

const ForgotPassword = () => {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation(); // Use the mutation hook

 const onFinish = async (values: IForgotPasswordProps) => {
  try {
    // Pass an object with email property instead of just the string
    const response = await forgotPassword({ email: values.email }).unwrap();
    
    if (response.code === 200) {
      // Navigate to verify-email page with email and OTP
      router.push(`/verify-email?email=${values.email}&otp=${response.data.attributes.oneTimeCode}`);
    }
  } catch (error) {
    // Handle error (you might want to show a toast or message)
    console.error("Forgot password error:", error);
  }
};

  return (
    <section className="w-full h-full px-5 py-10">
      {/* Main container */}
      <MainContainer className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white">
        {/* Left side: Form */}
        <div>
          <div className="space-y-2">
            <div className="size-[80px] relative mx-auto md:mx-0">
              <Image fill src={logo} alt="logo" />
            </div>
            <h2 className="text-3xl font-semibold">Forgot Password!</h2>
            <p className="text-gray-500">
              Please enter your Email to reset your password.
            </p>
          </div>
          <Form
            name="login"
            onFinish={onFinish}
            className="space-y-3 mt-5"
            layout="vertical"
          >
            {/* Email Input Wrapped in Form.Item */}
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your Email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <CustomInput icon={MailOutlined} placeholder="Enter your Email" />
            </Form.Item>
            
            <Form.Item>
              <div className="mt-2">
                <CustomLoadingButton loading={isLoading}>
                  Get OTP
                </CustomLoadingButton>
              </div>
            </Form.Item>
          </Form>
        </div>

        <div className="w-full h-[650px] bg-[#C0E4FF] rounded-xl hidden sm:flex justify-center items-center relative order-first md:order-last">
          <img
            src={circle.src}
            alt=""
            className="w-[400px] sm:w-[450px] md:w-[480px] xl:w-[500px] -mr-14 md:-mr-16 xl:-mr-20 2xl:-mr-28"
          />
          <img
            src={nurseImage.src}
            alt=""
            className="h-[350px] sm:h-[390px] md:h-[400px] xl:h-[470px] 2xl:h-[500px] bottom-0 absolute"
          />
        </div>
      </MainContainer>
    </section>
  );
};

export default ForgotPassword;