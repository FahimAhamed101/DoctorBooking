"use client";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import CustomInput from "@/components/UI/CustomInput";
import CustomLoadingButton from "@/components/UI/CustomLoadingButton";
import {
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Form, message } from "antd";
import { CiLocationOn } from "react-icons/ci";
import { IoMdCall, IoMdMail } from "react-icons/io";
import { useContactUsMutation } from "@/redux/features/auth/authApi";

interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  message: string;
}


interface ApiError {
  data?: {
    message?: string;
  };
  status?: number;
}

const breadcrumbItems = [
  {
    href: "/",
    title: (
      <div className="flex gap-2 texl">
        <HomeOutlined />
        <span>Home</span>
      </div>
    ),
  },
  {
    title: "Contact",
  },
];

const Contact: React.FC = () => {
  const [form] = Form.useForm<ContactFormValues>();
  const [contactUs, { isLoading }] = useContactUsMutation();

  const handleSubmit = async (values: ContactFormValues) => {
    try {
      const response = await contactUs({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        message: values.message
      }).unwrap();
      
      if (response.code === 201) { // Changed from 200 to 201 to match your API response
        message.success(response.message || "Message sent successfully!");
        form.resetFields();
      } else {
        message.error("Unexpected response from server");
      }
    } catch (error: unknown) {
      console.error("Contact submission error:", error);
      const apiError = error as ApiError;
      message.error(apiError?.data?.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <section className="w-full px-5 py-10 bg-[#F1F9FF]">
      <MainContainer>
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="w-full flex flex-col md:flex-row gap-8 md:gap-16 my-16">
          {/* Left Section */}
          <div className="w-full md:w-[40%]">
            <div className="bg-[#D5EDFF] p-10 rounded-2xl">
              <div className="mb-16 flex gap-5">
                <div className="bg-[#77C4FE] p-2 rounded-full size-14 flex justify-center items-center">
                  <IoMdCall className="text-white" size={20} />
                </div>
                <div className="mt-2">
                  <h1 className="text-gray-800 text-xl font-semibold">
                    Call To Us
                  </h1>
                  <div className="space-y-4 mt-7">
                    <p className="text-gray-500 text-lg">
                      We are available 24/7, 7 days a week.
                    </p>
                    <p className="text-gray-800 font-medium">
                      Phone: +447584921976
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-b border-[#929292] my-5"></div>
              <div className="mb-6 flex gap-5">
                <div className="bg-[#77C4FE] p-2 rounded-full size-14 flex justify-center items-center">
                  <IoMdMail className="text-white" size={20} />
                </div>
                <div className="mt-2">
                  <h1 className="text-gray-800 text-xl font-semibold">
                    Send us an email
                  </h1>
                  <div className="space-y-4 mt-7">
                    <p className="text-gray-500 text-lg">
                      Fill out our form and we will contact you within 24 hours.
                    </p>
                
                    <p className="text-gray-800 font-medium">
                      Email: support@trustedgpclinic.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="w-full md:w-[60%] p-4 md:p-6 rounded-md ">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-[40px]"
            >
              <Form.Item
                name="firstName"
                label="First Name"  className="font-bold"
                rules={[
                  { required: true, message: "Please input your first name!" },
                ]}
              >
                <CustomInput
                  icon={UserOutlined}
                  placeholder="Enter your first name"
                  className="bg-[#77C4FE]"
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: "Please input your last name!" },
                ]}
              >
                <CustomInput
                  icon={UserOutlined}
                  placeholder="Enter your last name"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Your Email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please input a valid email!",
                  },
                ]}
              >
                <CustomInput
                  icon={MailOutlined}
                  placeholder="Enter your email"
                />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Your Phone Number"
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                ]}
              >
                <CustomInput
                  icon={PhoneOutlined}
                  placeholder="Enter your phone number"
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Your Address"
                className="col-span-full"
                rules={[
                  { required: true, message: "Please input your address!" },
                ]}
              >
                <CustomInput
                  icon={CiLocationOn}
                  placeholder="Enter your address"
                />
              </Form.Item>

              <Form.Item
                name="message"
                label="Your Message"
                className="col-span-full"
                rules={[
                  { required: true, message: "Please input your message!" },
                ]}
              >
                <CustomInput placeholder="Write your message here" isTextArea />
              </Form.Item>

              <Form.Item className="col-span-full">
                <CustomLoadingButton loading={isLoading} >
                  {isLoading ? "Sending..." : "Submit"}
                </CustomLoadingButton>
              </Form.Item>
            </Form>
          </div>
        </div>
      </MainContainer>
    </section>
  );
};

export default Contact;