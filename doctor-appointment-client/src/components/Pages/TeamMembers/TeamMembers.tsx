"use client"
import React from "react";
import { HomeOutlined } from "@ant-design/icons";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import CustomBreadcrumb from "@/components/UI/CustomBreadcrumb";
import TeamMemberCard from "./TeamMemberCard";
import { useGetTeamMembersQuery } from "@/redux/features/auth/authApi"
import { Spin } from "antd";

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
    title: "Team Members",
  },
];

function TeamMembers() {
  const { data, isLoading, isError } = useGetTeamMembersQuery({
    page: 1,
    limit: 12,
    email: ""
  });

  if (isLoading) {
    return (
       <section className="w-full px-5 py-10 bg-[#F1F9FF] min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="w-full px-5 py-10">
        <MainContainer>
          <CustomBreadcrumb items={breadcrumbItems} />
          <div className="text-center py-10">
            <p className="text-red-500">Failed to load team members</p>
          </div>
        </MainContainer>
      </section>
    );
  }

  const teamMembers = data?.data?.attributes?.results || [];

  return (
    <section className="w-full px-5 py-10">
      <MainContainer>
        <CustomBreadcrumb items={breadcrumbItems} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-10">
          {teamMembers.map((member) => (
            <TeamMemberCard 
              key={member.id} 
              member={{
                id: member.id,
                name: member.fullName,
                degree: member.designation,
                specialty: member.specialties,
                imageUrl: member.profileImage || "https://i.ibb.co.com/87g3Kwr/doctor.png",
                about: member.about,
                socialMedia: member.media
              }} 
            />
          ))}
        </div>
      </MainContainer>
    </section>
  );
}

export default TeamMembers;