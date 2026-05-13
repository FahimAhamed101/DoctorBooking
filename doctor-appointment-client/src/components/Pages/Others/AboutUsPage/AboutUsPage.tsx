"use client"

import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import { HomeOutlined } from "@ant-design/icons";
import { Alert, Spin } from "antd";
import React from "react";

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
    title: "About Us",
  },
];

const AboutUsPage: React.FC = () => {
  // Simulating loading state
  const isLoading = false;
  const error = null;

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
          description="Failed to load content"
          type="error"
          showIcon
        />
      </section>
    );
  }

  return (
    <section className="w-full px-5 bg-[#F1F9FF] py-10 min-h-screen">
      <MainContainer>
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold my-5 text-center">About Trusted GP Clinic</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Who We Are</h2>
            <p className="text-gray-700 mb-4">
              Trusted GP Clinic is a UK-based virtual healthcare platform providing private online GP consultations, 
              medical advice, and prescription services. All consultations are provided by GMC-registered General 
              Practitioners and qualified clinical professionals.
            </p>
            <p className="text-gray-700">
              We are committed to making healthcare accessible, convenient, and professional for everyone across 
              the United Kingdom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">Our Mission</h3>
              <p className="text-gray-700">
                To provide high-quality, accessible healthcare services that put patients&apos needs first, 
                leveraging technology to make medical consultations more convenient without compromising on quality.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">Our Values</h3>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Professionalism and clinical excellence</li>
                <li>Patient confidentiality and data security</li>
                <li>Accessibility and convenience</li>
                <li>Compassionate care</li>
                <li>Innovation in healthcare delivery</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-lg">Online Consultations</h3>
                <p className="text-gray-600">Video or phone consultations with UK-licensed GPs</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-semibold text-lg">Prescription Services</h3>
                <p className="text-gray-600">Private prescriptions delivered to your door</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-semibold text-lg">Specialist Advice</h3>
                <p className="text-gray-600">Weight loss, ED, fertility, and more</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Our Commitment to Quality</h2>
            <p className="text-gray-700 mb-4">
              At Trusted GP Clinic, we maintain the highest standards of medical practice. All our doctors are 
              GMC-registered and follow UK medical best practices and guidelines. We adhere strictly to:
            </p>
            <ul className="list-disc pl-5 text-gray-700">
              <li>UK General Data Protection Regulation (UK GDPR)</li>
              <li>NHS Digital standards</li>
              <li>CQC confidentiality requirements</li>
              <li>GMC professional standards</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <p className="text-gray-700">support@trustedgpclinic.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Phone</h3>
                <p className="text-gray-700">+447584921976</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Address</h3>
                <p className="text-gray-700">5 Mahogany Walk, PL31 2TH, Bodmin, Cornwall, United Kingdom</p>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </section>
  );
};

export default AboutUsPage;