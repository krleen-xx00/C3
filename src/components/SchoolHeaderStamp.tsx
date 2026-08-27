import React from 'react';
import { CabiaoLogo } from './CabiaoLogo';

interface SchoolHeaderStampProps {
  isDarkMode?: boolean;
}

export const SchoolHeaderStamp: React.FC<SchoolHeaderStampProps> = ({ isDarkMode = false }) => {
  return (
    <div
      id="school-header-stamp"
      className="absolute top-4 left-4 sm:top-5 sm:left-6 z-30 flex items-center space-x-2.5 transition-all duration-300 pointer-events-auto select-none"
    >
      {/* Soft circular backdrop for the logo (40-48px) with gentle 88% opacity to blend warmly */}
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full p-1 flex items-center justify-center transition-colors duration-300 border shadow-[0_2px_10px_rgba(0,0,0,0.03)] ${
          isDarkMode
            ? 'bg-[#261F1C]/90 border-[#3D322A]/80'
            : 'bg-[#FFFDF9]/90 border-[#EFE5D8]/90'
        }`}
      >
        <div className="w-full h-full opacity-90 transition-opacity hover:opacity-100 flex items-center justify-center">
          <CabiaoLogo className="w-full h-full drop-shadow-2xs" />
        </div>
      </div>

      {/* Small muted official stamp text */}
      <div className="flex flex-col">
        <span
          className={`text-xs sm:text-[13px] font-semibold tracking-tight leading-tight transition-colors ${
            isDarkMode ? 'text-[#B8A796]' : 'text-[#6E5959]'
          }`}
        >
          Cabiao National Senior High School
        </span>
        <span
          className={`text-[10px] font-normal leading-tight transition-colors ${
            isDarkMode ? 'text-[#87786C]' : 'text-[#9C8A8A]'
          }`}
        >
          Student Wellness Haven
        </span>
      </div>
    </div>
  );
};
