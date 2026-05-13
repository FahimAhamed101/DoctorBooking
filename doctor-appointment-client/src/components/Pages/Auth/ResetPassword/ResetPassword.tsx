"use client";
import Image from "next/image";
import { Form } from "antd";
import { LockOutlined } from "@ant-design/icons";
import logo from "@/assets/logotrust.png";
import nurseImage from "@/assets/hero-section/nurse.png";
import circle from "@/assets/hero-section/circle.png";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomLoadingButton from "@/components/UI/CustomLoadingButton";
import React from "react";
import CustomInput from "@/components/UI/CustomInput";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { message } from "antd";

interface ResetPasswordFormValues {
  new_password: string;
  confirm_password: string;
}

interface ApiError {
  data?: {
    message?: string;
  };
}

const ResetPassword: React.FC = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [form] = Form.useForm();
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const validatePassword = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject('Please input your password!');
    }
   
   
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: unknown, value: string) => {
    if (value && value !== form.getFieldValue("new_password")) {
      return Promise.reject("Passwords do not match!");
    }
    return Promise.resolve();
  };

  const onFinish = async (values: ResetPasswordFormValues) => {
    if (!email) {
      message.error("Email is required");
      return;
    }

    try {
      const response = await resetPassword({
        email: email,
        password: values.new_password
      }).unwrap();

      if (response.code === 200) {
        message.success(response.message || "Password reset successfully");
        router.push('/login');
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      const apiError = error as ApiError;
      message.error(apiError?.data?.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <section className="w-full h-full lg:h-screen flex justify-between items-center p-5">
      <MainContainer className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white">
        {/* Left side: Form */}
        <div>
          <div className="space-y-2">
            <div className="size-[80px] relative mx-auto md:mx-0">
              <Image fill src={logo} alt="logo" />
            </div>
            <h2 className="text-3xl font-semibold">Reset Password!</h2>
            <p className="text-gray-500">
              Your password must be 8-10 characters long and contain:
            </p>
            <ul className="text-gray-500 list-disc pl-5">
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>
          <Form<ResetPasswordFormValues>
            form={form}
            name="reset-password"
            onFinish={onFinish}
            className="space-y-3 mt-5"
            layout="vertical"
          >
            <Form.Item
              name="new_password"
              label="New Password"
              rules={[
                { validator: validatePassword }
              ]}
            >
              <CustomInput
                icon={LockOutlined}
                isPassword={true}
                placeholder="Enter your new password"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Confirm Password"
              rules={[
                { required: true, message: "Please confirm your password!" },
                { validator: validateConfirmPassword },
              ]}
            >
              <CustomInput
                icon={LockOutlined}
                isPassword={true}
                placeholder="Confirm your password"
              />
            </Form.Item>

            <Form.Item>
              <div className="mt-5">
                <CustomLoadingButton loading={isLoading}>
                  Reset Password
                </CustomLoadingButton>
              </div>
            </Form.Item>
          </Form>
        </div>

        {/* Right side: Nurse image */}
        <div className="w-full h-[850px] bg-[#C0E4FF] rounded-xl flex justify-center items-center relative order-first md:order-last">
          <img
            src={circle.src}
            alt=""
            className="w-[400px] sm:w-[450px] md:w-[480px] xl:w-[500px] -mr-14 md:-mr-16 xl:-mr-20 2xl:-mr-28"
          />
          <img
            src={nurseImage.src}
            alt=""
            className="h-[270px] sm:h-[310px] md:h-[320px] xl:h-[390px] 2xl:h-[420px] bottom-0 absolute"
          />
        </div>
      </MainContainer>
    </section>
  );
};

export default ResetPassword;