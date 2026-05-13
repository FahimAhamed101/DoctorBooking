import { Form, Upload, Button, Spin } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import CustomInput from "../../../utils/CustomInput";
import { 
  useUpdateValueMutation,
  useGetValueByIdQuery 
} from "../../../redux/features/value/valueApi";
import { BASE_URL } from "../../../utils/constants";

const EditValue = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: valueData, isLoading: isFetching } = useGetValueByIdQuery(id);
  const [updateValue, { isLoading }] = useUpdateValueMutation();

  useEffect(() => {
    if (valueData) {
      form.setFieldsValue({
        name: valueData.name,
        description: valueData.description
      });
      
      if (valueData.icon) {
        const imageUrl = valueData.icon.startsWith('http') 
          ? valueData.icon 
          : `${BASE_URL}${valueData.icon}`;
          
        setFileList([{
          uid: '-1',
          name: 'icon',
          status: 'done',
          url: imageUrl
        }]);
      }
    }
  }, [valueData, form]);

  const onFinish = async (values) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('icon', fileList[0].originFileObj);
      }

      await updateValue({ 
        id, 
        data: formData 
      }).unwrap();
      
      toast.success("Value updated successfully");
      navigate("/ourvalues");
    } catch (error) {
      console.error("Error updating value:", error);
      toast.error(error.data?.message || "Failed to update value");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('You can only upload image files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error('Image must be smaller than 2MB!');
      return false;
    }
    return false; // Prevent automatic upload
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex gap-4 items-center mb-6">
        <Link to="/values">
          <IoChevronBack className="size-6" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Value</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter the value name!" }]}
          className="w-full md:w-1/2"
        >
          <CustomInput 
            className="bg-[#D5EDFF] border-[#77C4FE]"
            placeholder="Enter value name"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter the description!" }]}
          className="w-full md:w-1/2"
        >
          <textarea
            className="w-full h-32 p-3 rounded-md border border-blue-300 bg-[#D5EDFF] text-gray-800 resize-none focus:outline-none focus:border-blue-400"
            placeholder="Write the value description here"
          />
        </Form.Item>

        <Form.Item
          label="Icon"
          name="icon"
          className="w-full md:w-1/2"
        >
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={beforeUpload}
            maxCount={1}
            accept="image/*"
            listType="picture-card"
          >
            {fileList.length >= 1 ? null : (
              <Button icon={<UploadOutlined />} className="bg-[#D5EDFF] border-[#77C4FE]">
                {valueData?.icon ? "Change Icon" : "Upload Icon"}
              </Button>
            )}
          </Upload>
        </Form.Item>

        <div className="flex justify-start mt-8">
          <button 
            type="submit"
            disabled={isLoading || isUploading}
            className="px-8 py-2 bg-[#77C4FE] text-white flex items-center gap-2 rounded-md border-none disabled:opacity-50 hover:bg-[#5cb0fd] transition-colors"
          >
            {(isLoading || isUploading) ? (
              <>
                <Spin size="small" />
                Updating...
              </>
            ) : "Update Value"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default EditValue;