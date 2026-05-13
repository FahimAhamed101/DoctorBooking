import MemberDetails from "@/components/Pages/TeamMembers/MemberDetails/MemberDetails";
import React from "react";

interface PageProps {
  params: { 
    memberId: string // Changed to string to match API expectation
  }
}

const Page = ({ params }: PageProps) => {
  return <MemberDetails memberId={params.memberId} />;
};

export default Page;