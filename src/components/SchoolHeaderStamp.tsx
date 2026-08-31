import React from 'react';

interface SchoolHeaderStampProps {
  isDarkMode?: boolean;
}

export const SchoolHeaderStamp: React.FC<SchoolHeaderStampProps> = ({ isDarkMode = false }) => {
  return (
    <div
      id="school-header-stamp"
      className="absolute top-4 left-4 sm:top-5 sm:left-6 z-30 flex items-center space-x-2.5 transition-all duration-300 pointer-events-auto select-none"
    >
      {/* Soft circular backdrop for the logo (56-64px) with gentle school-green tint */}
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 flex items-center justify-center transition-colors duration-300 border shadow-[0_2px_10px_rgba(0,0,0,0.03)] ${
          isDarkMode
            ? 'bg-[#1C1A17]/90 border-[#224033]/90'
            : 'bg-[#FCFDFB]/95 border-[#0e2c1f]/30'
        }`}
      >
        <div className="w-full h-full opacity-95 transition-opacity hover:opacity-100 flex items-center justify-center overflow-hidden rounded-full">
          <img
            src="/logo.jpg"
            alt="Cabiao National Senior High School logo"
            className="w-full h-full object-contain p-0.5"
            draggable={false}
          />
        </div>
      </div>

      {/* School stamp text in official dark-green brand color */}
      <div className="flex flex-col hidden sm:flex">
        <span
          className={`text-sm sm:text-lg font-bold tracking-tight leading-tight transition-colors ${
            isDarkMode ? 'text-[#A8C9B4]' : 'text-[#0e2c1f]'
          }`}
        >
          Cabiao National Senior High School
        </span>
        <span
          className={`text-[11px] sm:text-xs font-medium leading-tight transition-colors ${
            isDarkMode ? 'text-[#7FA98E]' : 'text-[#0e2c1f]/65'
          }`}
        >
          Student Wellness Haven
        </span>
      </div>
    </div>
  );
};
