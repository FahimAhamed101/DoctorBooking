import { Form, Upload, Button } from "antd";
import { IoChevronBack } from "react-icons/io5";
import { UploadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import CustomInput from "../../../utils/CustomInput";
import { useAddValueMutation } from "../../../redux/features/value/valueApi";

const AddValuePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [addValue, { isLoading }] = useAddValueMutation();
  const [fileList, setFileList] = useState([]);

  const onFinish = async (values) => {
    try {
      // Create FormData object since API expects form-data
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      
      // Add icon file if uploaded
      if (fileList.length > 0) {
        formData.append('icon', fileList[0].originFileObj);
      }

      const response = await addValue(formData).unwrap();
      
      toast.success("Value added successfully");
      form.resetFields();
      setFileList([]);
        navigate("/ourvalues");
    } catch (error) {
      console.error("Error adding value:", error);
      toast.error(error.data?.message || "Failed to add value");
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('You can only upload image files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error('Image must be smaller than 2MB!');
    }
    return false; // Prevent automatic upload
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 items-center my-6">
        <Link to="/values">
          <IoChevronBack className="size-6" />
        </Link>
        <h1 className="text-2xl font-semibold">Add Value</h1>
      </div>

      {/* Form Section */}
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-5">
        {/* Name */}
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter the value name!" }]}
          className="w-[40%]"
        >
          <CustomInput 
            className="bg-[#D5EDFF] border-[#77C4FE]"
            placeholder="Enter value name"
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter the description!" }]}
          className="w-[40%]"
        >
          <textarea
            className="w-full h-32 p-3 rounded-md border border-blue-300 bg-[#D5EDFF] text-gray-800 resize-none focus:outline-none focus:border-blue-400"
            placeholder="Write the value description here"
          />
        </Form.Item>

        {/* Icon Upload */}
        <Form.Item
          label="Icon"
          name="icon"
          className="w-[40%]"
        >
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={beforeUpload}
            maxCount={1}
            accept="image/*"
            listType="picture"
          >
            <Button icon={<UploadOutlined />} className="bg-[#D5EDFF] border-[#77C4FE]">
              Select Icon File
            </Button>
          </Upload>
        </Form.Item>

        {/* Submit Button */}
        <div className="flex justify-center mr-[10rem]">
          <button 
            type="submit"
            disabled={isLoading}
            className="mt-12 bg-[#77C4FE] px-14 py-3 flex items-center gap-5 text-white rounded-md border-none disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default AddValuePage;