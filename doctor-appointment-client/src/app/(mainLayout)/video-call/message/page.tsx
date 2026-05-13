import file from "@/assets/file.svg";
import Image from "next/image";
import { DownOutlined } from "@ant-design/icons";

const Page = () => {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h1 className="text-xl font-medium text-blue-400">Message</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-gray-600">
            <span className="text-sm">All</span>
            <DownOutlined className="w-4 h-4" />
          </div>
          <button className="p-1 h-auto">x</button>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-8">
        {/* First Message */}
        <div>
          <div className="text-blue-400 text-sm mb-4">10:24 Am</div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">Revised Project timeline</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Here&apos;s the revised project timeline that includes parallel development of the website and social media
              content design during the first 15-20 days. These tasks will run in parallel with the app development
              activities to maximize efficiency and ensure that everything is ready by the 31/10/2024 deadline.
            </p>
            <p className="text-sm font-medium text-gray-900">Updated Project Time Frame: 19/09/2024 to 31/10/2024</p>
          </div>
        </div>

        {/* Second Message */}
        <div>
          <div className="text-blue-400 text-sm mb-4">11:24 Am</div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image src={file} alt="file icon" width={20} height={16} />
              </div>
              <span className="text-sm text-gray-600">scch-light.pdf</span>
            </div>
          </div>
        </div>

        {/* Third Message */}
        <div>
          <div className="text-blue-400 text-sm mb-4">8:24 Am</div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">Revised Project timeline</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Here&apos;s the revised project timeline that includes parallel development of the website and social media
              content design during the first 15-20 days. These tasks will run in parallel with the app development
              activities to maximize efficiency and ensure that everything is ready by the 31/10/2024 deadline.
            </p>
            <p className="text-sm font-medium text-gray-900">Updated Project Time Frame: 19/09/2024 to 31/10/2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;