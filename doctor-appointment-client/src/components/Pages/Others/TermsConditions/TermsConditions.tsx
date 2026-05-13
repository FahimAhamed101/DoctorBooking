"use client"

import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined } from "@ant-design/icons";
import { Alert, Spin } from "antd";
import React from "react";
import { useGetTermsConditionsQuery } from "@/redux/features/info/infoApi";
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
    title: "Terms & Conditions",
  },
];

const DEFAULT_TERMS_CONTENT = "No terms and conditions content available";

const TermsConditions: React.FC = () => {
  const { data, error, isLoading } = useGetTermsConditionsQuery();

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
          description="Failed to load terms and conditions"
          type="error"
          showIcon
        />
      </section>
    );
  }

  const termsData = data?.data.attributes[0];

  const decodeHtmlEntities = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  const rawContent = termsData?.content || DEFAULT_TERMS_CONTENT;
  const decodedContent = decodeHtmlEntities(rawContent);
  const sanitizedContent = DOMPurify.sanitize(decodedContent);

  const lastUpdated = termsData?.updatedAt
    ? new Date(termsData.updatedAt).toLocaleDateString()
    : null;

  return (
    <section className="w-full px-5 bg-[#F1F9FF] py-10 min-h-screen">
      <MainContainer>
        <CustomBreadcrumb items={breadcrumbItems} />
        <div>
          <h1 className="text-3xl font-semibold my-5">Terms & Conditions</h1>
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

export default TermsConditions;