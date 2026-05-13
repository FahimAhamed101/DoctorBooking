"use client";
import aboutBg from "@/assets/about/aboutbg.png";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import CustomDatePicker from "@/components/UI/CustomDatePicker";
import CustomInput from "@/components/UI/CustomInput";
import CustomLoadingButton from "@/components/UI/CustomLoadingButton";
import { ClockCircleOutlined, HomeOutlined } from "@ant-design/icons";
import { Form, Radio, TimePicker, message } from "antd";
import circle from "@/assets/circle.svg";
import Image from "next/image";
import { useBookAppointmentMutation } from "@/redux/features/auth/appontmentApi";
import dayjs, { Dayjs } from "dayjs";
import CustomSelect from "@/components/UI/CustomSelect";
import { useState, useEffect } from "react";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateAppointmentPaymentMutation } from "@/redux/features/auth/appontmentApi";

interface FormValues {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAddress: string;
  preferredTime: Dayjs;
  preferredDate: Dayjs;
  visitType: 'Old Patient Visit' | 'New Patient Visit' | 'Specific Concern' | 'other';
  category: string;
  specificConditions: string;
  bodyPart: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  reason: string;
}
interface BookAppointmentResponse {
  code?: number;
  message?: string;
  data?: {
    appointmentId?: string;
    attributes?: {
      appointmentId?: string;
    };
  };
}

interface PaymentResponse {
  code?: number;
  message?: string;
  data?: {
    paymentId?: string;
    status?: string;
    attributes?:
       string;
    
  };
}
// Breadcrumb items
const breadcrumbItems = [
  {
    href: "/",
    title: (
      <div className="flex gap-2">
        <HomeOutlined />
        <span>Home</span>
      </div>
    ),
  },
  {
    title: "Appointment Form",
  },
];

const categoryOptions = [
  { label: "Mental Health", value: "Mental Health" },
  { label: "General Health", value: "General Health" },
  { label: "Pediatric", value: "Pediatric" },
  { label: "Cardiology", value: "Cardiology" },
];

const specificConditionOptions = {
  "Mental Health": [
    { label: "Depression", value: "Depression" },
    { label: "Anxiety", value: "Anxiety" },
    { label: "Bipolar Disorder", value: "Bipolar Disorder" },
  ],
  "General Health": [
    { label: "Fever", value: "Fever" },
    { label: "Cold", value: "Cold" },
    { label: "Headache", value: "Headache" },
  ],
  "Pediatric": [
    { label: "Childhood Fever", value: "Childhood Fever" },
    { label: "Vaccination", value: "Vaccination" },
  ],
  "Cardiology": [
    { label: "High Blood Pressure", value: "High Blood Pressure" },
    { label: "Heart Pain", value: "Heart Pain" },
  ],
};

const visitReasons = [
  { label: "Old Patient Visit", value: "Old Patient Visit" },
  { label: "New Patient Visit", value: "New Patient Visit" },
  { label: "Specific Concern", value: "Specific Concern" },
];

const bodyParts = [
  { label: "Stomach", value: "Stomach" },
  { label: "Ears", value: "Ears" },
  { label: "Eyes", value: "Eyes" },
  { label: "Leg", value: "Leg" },
  { label: "Head", value: "Head" },
  { label: "Neck", value: "Neck" },
  { label: "Shoulder", value: "Shoulder" },
  { label: "Arm", value: "Arm" },
  { label: "Elbow", value: "Elbow" },
  { label: "Hand", value: "Hand" },
  { label: "Chest", value: "Chest" },
  { label: "Back", value: "Back" },
  { label: "Hip", value: "Hip" },
  { label: "Thigh", value: "Thigh" },
  { label: "Knee", value: "Knee" },
  { label: "Foot", value: "Foot" },
  { label: "Breast", value: "Breast" },
  { label: "Pelvis", value: "Pelvis" },
  { label: "Abdomen", value: "Abdomen" },
  { label: "Genitals", value: "Genitals" },
  { label: "Skin", value: "Skin" },
  { label: "Whole Body", value: "Whole Body" },
  { label: "Respiratory System", value: "Respiratory System" },
  { label: "Digestive System", value: "Digestive System" },
  { label: "Nervous System", value: "Nervous System" },
];

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const BookAppointment = () => {
  const [form] = Form.useForm<FormValues>();
  const [bookAppointment, { isLoading }] = useBookAppointmentMutation();
  const [createPayment] = useCreateAppointmentPaymentMutation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { data: profileData } = useGetProfileQuery();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get price from URL parameter
  const price = searchParams.get('price') || "0";

  useEffect(() => {
    if (profileData?.data?.attributes?.user) {
      const user = profileData.data.attributes.user;
      const currentYear = new Date().getFullYear();
      const birthYear = user.dateOfBirth ? new Date(user.dateOfBirth).getFullYear() : currentYear;
      const age = currentYear - birthYear;

      form.setFieldsValue({
        patientName: user.fullName,
        patientEmail: user.email,
        patientPhone: `${user.callingCode}${user.phoneNumber}`,
        patientAddress: user.address,
        patientAge: age,
        patientGender: user.gender as 'male' | 'female' | 'other'
      });
    }
  }, [profileData, form]);
 const disabledDate = (current: Dayjs) => {
    // Disable dates before today
    return current && current < dayjs().startOf('day');
  };

  const disabledDateTime = (current: Dayjs) => {
    if (current && current.isSame(dayjs(), 'day')) {
      return {
        disabledHours: () => {
          const currentHour = dayjs().hour();
          const hours = [];
          for (let i = 0; i < currentHour; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour: number) => {
          if (selectedHour === dayjs().hour()) {
            const currentMinute = dayjs().minute();
            const minutes = [];
            for (let i = 0; i < currentMinute; i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        }
      };
    }
    return {};
  };
const onFinish = async (values: FormValues) => {
  try {
            // Additional validation to ensure date/time is not in the past
          const selectedDateTime = dayjs(values.preferredDate)
            .hour(values.preferredTime.hour())
            .minute(values.preferredTime.minute());
          
          if (selectedDateTime.isBefore(dayjs())) {
            message.error('Cannot book appointment in the past. Please select a future date and time.');
            return;
          }
    
    const appointmentData = {
      patientName: values.patientName,
      patientEmail: values.patientEmail,
      patientPhone: values.patientPhone,
      patientAge: values.patientAge,
      patientGender: values.patientGender,
      patientAddress: values.patientAddress,
      visitType: values.visitType,
      category: values.category,
      specificConditions: values.specificConditions,
      bodyPart: values.bodyPart,
      date: values.preferredDate.format('YYYY-MM-DD'),
      timeSlot: values.preferredTime.format('h:mm A'),
      reason: values.reason || "",
      price: parseFloat(price)
    };

    // Step 1: Create appointment with proper typing
    const response = await bookAppointment(appointmentData).unwrap() as BookAppointmentResponse;
    
    if (response?.code === 200 || response?.code === 201) {
      message.success('Appointment booked successfully!');
      
      // Step 2: Handle payment if price > 0
      if (parseFloat(price) > 0) {
        try {
          // Get the appointment ID from the correct path in the response
          const appointmentId = response.data?.appointmentId || response.data?.attributes?.appointmentId;
          
          if (!appointmentId) {
            throw new Error('No appointment ID received');
          }

          const paymentData = {
            appointmentId: appointmentId,
            amount: price
          };
const paymentResult = await createPayment(paymentData).unwrap() as PaymentResponse;
console.log(paymentResult)
if ((paymentResult?.code === 200 || paymentResult?.code === 201) && paymentResult?.data?.attributes) {
  window.location.href = paymentResult.data.attributes;
  console.log(paymentResult)
} else {
  message.error("Payment successful but no redirect URL provided");
}
        } catch (paymentError) {
          console.error('Payment error details:', paymentError);
          message.error("Payment failed. Please try again.");
        }
      } else {
        // If no payment needed, reset form and redirect
        form.resetFields();
        setSelectedCategory("");
        router.push('/appointments');
      }
    } else {
      message.error(response?.message || 'Failed to book appointment');
    }
  } catch (err: unknown) {
    console.error('Full error:', err);
    const error = err as { data?: { message?: string } };
    message.error(error.data?.message || 'Failed to book appointment');
  }
};

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    form.setFieldsValue({ specificConditions: undefined });
  };

  const renderRadioOptions = (options: { label: string; value: string }[]) =>
    options.map((option) => (
      <Radio key={option.value} value={option.value} className="text-lg">
        {option.label}
      </Radio>
    ));

  return (
    <section className="w-full px-5 py-12 bg-[#EFF8FE]">
      <MainContainer>
        <CustomBreadcrumb items={breadcrumbItems} />

        <div className="w-full max-w-7xl mx-auto py-5 relative">
          <div className="absolute top-0 right-0">
            <Image
              src={circle}
              alt="circle"
              width={150}
              height={250}
              style={{ objectFit: "cover" }}
            />
          </div>
         
          <h1 className="text-3xl font-semibold mb-8">Book Appointment</h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="w-full"
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 place-content-center place-items-center  mb-5">
              <div className="w-full grid grid-cols-2 gap-2">
        

                <Form.Item
                  name="patientName"
                  label="Name"
                  rules={[
                    { required: true, message: "Please input your name!" },
                  ]}
                >
                  <CustomInput placeholder="Enter Your Name" />
                </Form.Item>

                <Form.Item
                  name="patientEmail"
                  label="Email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <CustomInput placeholder="Enter Your Email" />
                </Form.Item>

                <Form.Item
                  name="patientPhone"
                  label="Phone"
                  rules={[
                    {
                      required: true,
                      message: "Please input your phone number!",
                    },
                  ]}
                  className="w-full col-span-full"
                >
                  <CustomInput 
                    type="tel" 
                    placeholder="Enter Your Phone" 
                  />
                </Form.Item>

                <Form.Item
                  name="patientAge"
                  label="Age"
                  rules={[
                    { required: true, message: "Please input your age!" },
                  ]}
                >
                  <CustomInput type="number" placeholder="Enter Your Age" />
                </Form.Item>

                <Form.Item
                  name="patientGender"
                  label="Gender"
                  rules={[
                    { required: true, message: "Please select your gender!" },
                  ]}
                >
                  <Radio.Group className="flex flex-wrap gap-4">
                    {renderRadioOptions(genderOptions)}
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="patientAddress"
                  label="Address"
                  rules={[
                    { required: true, message: "Please input your address!" },
                  ]}
                  className="w-full col-span-full"
                >
                  <CustomInput placeholder="Enter Your Address" />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Category"
                  rules={[
                    { required: true, message: "Please select a category!" },
                  ]}
                  className="col-span-1"
                >
                  <CustomSelect
                    options={categoryOptions}
                    placeholder="Select"
                    onChange={handleCategoryChange}
                  />
                </Form.Item>

                <Form.Item
                  name="specificConditions"
                  label="Specific Condition"
                  rules={[
                    { required: true, message: "Please select a condition!" },
                  ]}
                  className="col-span-1"
                >
                  <CustomSelect
                    options={specificConditionOptions[selectedCategory as keyof typeof specificConditionOptions] || []}
                    placeholder="Select"
                  />
                </Form.Item>

               <Form.Item
                  name="preferredTime"
                  label={<span className="text-lg">Preferred Time</span>}
                  rules={[{ required: true, message: "Please select a time" }]}
                >
                  <TimePicker
                    placeholder="--:-- --"
                    className="w-full border border-[#77C4FE] px-4 py-2 text-[16px] bg-[#F1F9FF] text-gray-700 rounded-lg focus:border-[#77C4FE]"
                    format="h:mm A"
                    minuteStep={30}
                    use12Hours={true}
                    suffixIcon={
                      <ClockCircleOutlined style={{ color: "#77C4FE" }} />
                    }
                     disabledTime={disabledDateTime}
                  />
                </Form.Item>

                <Form.Item
                  name="preferredDate"
                  label={<span className="text-lg bg-[#F1F9FF]">Preferred Date</span>}
                  rules={[{ required: true, message: "Please select a date" }]}
                >
                  <CustomDatePicker 
                    className="bg-[#F1F9FF]" 
                    disabledDate={disabledDate}
                  />
                </Form.Item>
                <Form.Item
                  name="visitType"
                  label={<span className="text-lg">Reason for Visit</span>}
                  rules={[{ required: true, message: "Please select Reason" }]}
                  className="w-full col-span-full"
                >
                  <Radio.Group className="flex flex-wrap gap-4">
                    {renderRadioOptions(visitReasons)}
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="bodyPart"
                  label={<span className="text-lg bg-transparent">Part of Body</span>}
                  rules={[
                    { required: true, message: "Please select a body part" },
                  ]}
                  className="w-full col-span-full"
                >
                  <Radio.Group className="w-full">
                    <div className="w-[74vw]">
                      <div className="flex flex-wrap gap-2">
                        {bodyParts.map((part) => (
                          <div key={part.value} className="flex-[0_0_calc(14.2857%-0.5rem)]">
                            <Radio
                              value={part.value}
                              className={`w-full flex gap-1 text-sm py-2 rounded-lg ${
                                form.getFieldValue('bodyPart') === part.value 
                                  ? 'border-[#77C4FE]' 
                                  : ''
                              }`}
                            >
                              {part.label}
                            </Radio>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Radio.Group>
                </Form.Item>
              </div>
              
              <div className="w-full relative h-[400px] flex justify-center items-center pt-5 order-1 md:order-2">
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="relative w-[600px] h-[600px] rounded-full overflow-hidden">
                    <Image
                      src={aboutBg.src}
                      alt="background"
                      fill
                      className="object-cover"
                      style={{ 
                        borderRadius: '50%',
                        filter: 'blur(4px) brightness(0.9)',
                        opacity: 0.8
                      }}
                    />
                    <div className="absolute inset-0 bg-opacity-20 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute bottom-[-16%] left-[10%]">
                  <Image
                    src={circle}
                    alt="decorative circle"
                    width={80}
                    height={80}
                    className="object-cover opacity-70"
                  />
                </div>

                <div className="">
                  <div>
                    <h1 className="text-2xl">Contact Info</h1>
                    <div className="border-b border-gray-900 my-3" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-xl">Phone</p>
                    <p className="text-gray-600">+447584921976</p>
                  </div>
                  <div>
                    <p className="text-gray-900 text-xl">Email</p>
                    <p className="text-gray-600">support@trustedgpclinic.com</p>
                  </div>
                  <div>
                    <p className="text-gray-900 text-xl">Address</p>
                    <p className="text-gray-600">
                      5 Mahogany Walk, PL31 2TH, Bodmin, Cornwall, United Kingdom
                    </p>
                  </div>
                </div> 
              </div>
            </div>
             <Form.Item label="Consultation Fee">
  <Radio.Group 
    defaultValue={`$${price}`} 
    className="w-full"
  >
    <div className="w-[74vw]">
      <div className="flex flex-wrap gap-2">
        <div className="flex-[0_0_calc(14.2857%-0.5rem)]">
          <Radio
            value={`$${price}`}
            checked={true}
            className={`w-full flex gap-1 text-sm py-2 rounded-lg bg-[#F1F9FF] border-[#77C4FE]`}
            style={{ color: '#77C4FE' }}
      
          >
            {`$${price}`}
          </Radio>
        </div>
      </div>
    </div>
  </Radio.Group>
</Form.Item>
            <Form.Item className="w-full md:w-[30%] mt-10">
              <CustomLoadingButton 
                className="bg-sky-300" 
                border={false}
                loading={isLoading}
              >
                {parseFloat(price) > 0 ? 'Proceed to Payment' : 'Book Appointment'}
              </CustomLoadingButton>
            </Form.Item>
          </Form>
        </div>
      </MainContainer>
    </section>
  );
};

export default BookAppointment;