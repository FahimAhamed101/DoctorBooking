import React from "react";
import Image from "next/image";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  imageUrl: string;
  about?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    X?: string;
  };
}

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://10.0.60.18:6060';
  const imageUrl = member.imageUrl.startsWith('http') 
    ? member.imageUrl
    : `${backendUrl}${member.imageUrl}`;

  return (
    <div className="bg-[#EEE2EE] text-[#fff] shadow-lg rounded-xl overflow-hidden px-4 py-4">
      {/* Profile Image with rounded top corners */}
  <div className="relative w-full h-96 mb-3">
  <Link href={`/team-members/${member.id}`} className="block h-full">
    <div className="relative h-full rounded-t-lg overflow-hidden">
      <Image
        src={imageUrl}
        alt={member.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/default-profile.png';
        }}
      />
      {/* Bottom shadow effect */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#EEE2EE] to-transparent pointer-events-none"></div>
    </div>
  </Link>
</div>

      {/* Profile Info */}
      <div className="px-2 pb-2">
        <h2 className="text-xl font-semibold text-black mb-1">{member.name}</h2>
        <p className="text-gray-600 text-[#fff] mb-3">{member.degree}</p>

        {/* Specialties */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-[#fff] text-sm">Specialties</p>
          <div className="relative">
            <Image
              width={180}
              height={120}
              src="https://i.ibb.co.com/R64gCDv/Rectangle-18831.png"
              alt="Specialty background"
              className="relative"
            />
            <span className="absolute top-2 left-8 text-white text-sm font-medium">
              {member.specialty.trim().split(/\s+/).filter(Boolean).slice(0, 1).join(' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;