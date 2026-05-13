"use client"

import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined } from "@ant-design/icons";
import { Alert, Spin } from "antd";
import React from "react";
import { useGetPrivacyPolicyQuery } from "@/redux/features/info/infoApi";
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import rehypeRaw from 'rehype-raw';

interface BreadcrumbItem {
  href?: string;
  title: React.ReactNode;
}

const breadcrumbItems: BreadcrumbItem[] = [
  {
    href: "/",
    title: (
      <div className="flex gap-2 items-center">
        <HomeOutlined />
        <span>Home</span>
      </div>
    ),
  },
  {
    title: "Privacy Policy",
  },
];

const PrivacyPolicy: React.FC = () => {
  const { data, error, isLoading } = useGetPrivacyPolicyQuery();

  if (isLoading) {
    return (
      <section className="w-full px-5 bg-[#F1F9FF] py-10 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full px-5 bg-[#F1F9FF] py-10 min-h-screen flex justify-center items-center">
        <Alert
          message="Error"
          description="Failed to load privacy policy"
          type="error"
          showIcon
        />
      </section>
    );
  }

  const policyData = data?.data.attributes[0];

const decodeHtmlEntities = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};
  // Sanitize the HTML content
const rawContent = policyData?.content || "";
const decodedContent = decodeHtmlEntities(rawContent);
const sanitizedContent = DOMPurify.sanitize(decodedContent);

  const lastUpdated = policyData?.updatedAt
    ? new Date(policyData.updatedAt).toLocaleDateString()
    : null;

  return (
    <section className="w-full px-5 bg-[#F1F9FF] py-10 min-h-screen">
      <MainContainer>
        <CustomBreadcrumb items={breadcrumbItems} />
        <div>
          <h1 className="text-3xl font-semibold my-5">Privacy Policy</h1>
          {lastUpdated && (
            <p className="text-gray-500 mb-5">
              Last updated: {lastUpdated}
            </p>
          )}
          <div className="prose max-w-none">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {sanitizedContent}
            </ReactMarkdown>
          </div>
        </div>
      </MainContainer>
    </section>
  );
};

export default PrivacyPolicy;