import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AboutUsViewProps {
  isDarkMode?: boolean;
  onBackToDashboard: () => void;
}

const PROPONENTS = [
  {
    id: 1,
    name: 'Castor, Ashley L.',
    initials: 'AC',
    cardBg: 'bg-gradient-to-b from-white to-[#F4EDFA] dark:from-[#241D31] to-[#1E1828]',
    border: 'border-[#E7DBF3] dark:border-[#3A2F50]',
    shadow: 'shadow-[0_6px_24px_rgba(150,120,195,0.07)] hover:shadow-[0_14px_34px_rgba(145,110,190,0.16)]',
    avatarRing: 'bg-white text-[#7D5EAA] ring-4 ring-[#EADBFA] dark:bg-[#2E2440] dark:text-[#CDB4EC] dark:ring-[#3E3260]',
  },
  {
    id: 2,
    name: 'Munsayac, Josh Caleb B.',
    initials: 'JM',
    cardBg: 'bg-gradient-to-b from-white to-[#FBF0E2] dark:from-[#2C2119] to-[#251C15]',
    border: 'border-[#F3DCBD] dark:border-[#463322]',
    shadow: 'shadow-[0_6px_24px_rgba(220,150,90,0.06)] hover:shadow-[0_14px_34px_rgba(215,140,75,0.15)]',
    avatarRing: 'bg-white text-[#B5783A] ring-4 ring-[#FCE5CF] dark:bg-[#3D281C] dark:text-[#F2C9A3] dark:ring-[#573926]',
  },
  {
    id: 3,
    name: 'Hipolito, Jhon Cedrick M.',
    initials: 'JH',
    cardBg: 'bg-gradient-to-b from-white to-[#EBF6EE] dark:from-[#1B2720] to-[#16201B]',
    border: 'border-[#D5E9D9] dark:border-[#2E4A36]',
    shadow: 'shadow-[0_6px_24px_rgba(100,170,120,0.06)] hover:shadow-[0_14px_34px_rgba(90,160,110,0.15)]',
    avatarRing: 'bg-white text-[#4A855A] ring-4 ring-[#D8EDE0] dark:bg-[#233527] dark:text-[#A6DCB1] dark:ring-[#314D37]',
  },
];

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  isDarkMode = false,
  onBackToDashboard,
}) => {
  return (
    <div className={`max-w-4xl mx-auto pt-16 sm:pt-20 pb-12 px-4 space-y-10 transition-colors duration-300 ${
      isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'
    }`}>

      {/* Back to Dashboard Button */}
      <button
        type="button"
        onClick={onBackToDashboard}
        className={`group inline-flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer backdrop-blur-xs border shadow-2xs hover:-translate-x-0.5 ${
          isDarkMode
            ? 'text-[#C9BAAB] bg-[#201B17]/60 border-[#3A322B] hover:bg-[#2A231D]'
            : 'text-[#7D665B] bg-white/70 border-[#EFE5D8] hover:bg-white'
        }`}
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Section Header */}
      <section className="text-center space-y-2 -mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          About the Research Team
        </h1>
        <p className={`text-xs sm:text-sm max-w-lg mx-auto ${isDarkMode ? 'text-[#A39486]' : 'text-[#857070]'}`}>
          A Senior High School research initiative developed for Cabiao National High School students.
        </p>
      </section>

      {/* Proponent Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {PROPONENTS.map((member) => (
          <div
            key={member.id}
            className={`group ${member.cardBg} ${member.border} ${member.shadow} rounded-2xl p-7 border transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:-translate-y-1`}
          >
            {/* Initials Avatar */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-base font-black tracking-wide ${member.avatarRing} transition-transform duration-300 group-hover:scale-105`}
            >
              {member.initials}
            </div>
            <h3 className="font-bold text-base tracking-tight leading-snug">
              {member.name}
            </h3>
          </div>
        ))}
      </section>
    </div>
  );
};