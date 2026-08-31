import React from 'react';
import { Sparkles, Bot, Shield, Presentation } from 'lucide-react';

export type AppViewMode = 'student' | 'companions' | 'counselor' | 'about';

interface ViewSwitcherProps {
  viewMode: AppViewMode;
  onViewChange: (mode: AppViewMode) => void;
  isDarkMode: boolean;
  className?: string;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  viewMode,
  onViewChange,
  isDarkMode,
  className = ""
}) => {
  return (
    <div
      id="view-mode-switcher"
      className={`flex items-center p-1 rounded-full border transition-all duration-300 shadow-[0_2px_14px_rgba(0,0,0,0.06)] backdrop-blur-md ${
        isDarkMode
          ? 'bg-[#221C18]/90 border-[#3D332B]'
          : 'bg-white/90 border-[#E8DFC0]'
      } ${className}`}
      role="tablist"
      aria-label="Application View Switcher"
    >
      {/* 1. Wellness Tab */}
      <button
        type="button"
        id="btn-wellness-view"
        role="tab"
        aria-selected={viewMode === 'student'}
        onClick={() => onViewChange('student')}
        className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
          viewMode === 'student'
            ? isDarkMode
              ? 'bg-[#3D2E22] text-[#F9E6CD] shadow-xs ring-1 ring-[#5C4533]'
              : 'bg-[#F2E5D5] text-[#3D2C2C] shadow-xs ring-1 ring-[#DEC5AB]'
            : isDarkMode
              ? 'text-[#9A897B] hover:text-[#EDE5DB] hover:bg-[#2B231D]'
              : 'text-[#7D665B] hover:text-[#3D2C2C] hover:bg-[#F8F2EA]'
        }`}
      >
        <Sparkles className={`w-3.5 h-3.5 ${viewMode === 'student' ? 'text-amber-500' : ''}`} />
        <span>Wellness</span>
      </button>

      {/* 2. Counselor View Tab (Placed right beside Student View) */}
      <button
        type="button"
        id="btn-counselor-view"
        role="tab"
        aria-selected={viewMode === 'counselor'}
        onClick={() => onViewChange('counselor')}
        className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
          viewMode === 'counselor'
            ? isDarkMode
              ? 'bg-[#D4A373] text-[#1E1712] font-extrabold shadow-xs ring-1 ring-[#E8BE92]'
              : 'bg-[#8F5B34] text-white font-extrabold shadow-xs ring-1 ring-[#6E4221]'
            : isDarkMode
              ? 'text-[#9A897B] hover:text-[#EDE5DB] hover:bg-[#2B231D]'
              : 'text-[#7D665B] hover:text-[#3D2C2C] hover:bg-[#F8F2EA]'
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Counselor View</span>
        <span className="inline md:hidden">Counselor</span>
      </button>

      {/* 3. AI Companions Tab */}
      <button
        type="button"
        id="btn-companions-view"
        role="tab"
        aria-selected={viewMode === 'companions'}
        onClick={() => onViewChange('companions')}
        className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
          viewMode === 'companions'
            ? isDarkMode
              ? 'bg-[#332244] text-[#EADCF7] shadow-xs ring-1 ring-[#5E3D80]'
              : 'bg-[#EDE5F8] text-[#5C348A] shadow-xs ring-1 ring-[#D8C7F0]'
            : isDarkMode
              ? 'text-[#9A897B] hover:text-[#EDE5DB] hover:bg-[#2B231D]'
              : 'text-[#7D665B] hover:text-[#3D2C2C] hover:bg-[#F8F2EA]'
        }`}
      >
        <Bot className={`w-3.5 h-3.5 ${viewMode === 'companions' ? (isDarkMode ? 'text-purple-300' : 'text-purple-600') : ''}`} />
        <span className="hidden md:inline">AI Companions</span>
        <span className="inline md:hidden">Companions</span>
      </button>

      {/* 4. About & Presentation Deck Tab */}
      <button
        type="button"
        id="btn-about-view"
        role="tab"
        aria-selected={viewMode === 'about'}
        onClick={() => onViewChange('about')}
        className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
          viewMode === 'about'
            ? isDarkMode
              ? 'bg-[#1F3D27] text-[#C2F2CF] shadow-xs ring-1 ring-[#2E5E3C]'
              : 'bg-[#18532A] text-white shadow-xs ring-1 ring-[#0F3A1C]'
            : isDarkMode
              ? 'text-[#9A897B] hover:text-[#EDE5DB] hover:bg-[#2B231D]'
              : 'text-[#7D665B] hover:text-[#3D2C2C] hover:bg-[#F8F2EA]'
        }`}
      >
        <Presentation className={`w-3.5 h-3.5 ${viewMode === 'about' ? (isDarkMode ? 'text-[#84E19C]' : 'text-[#A3EBB6]') : ''}`} />
        <span className="hidden md:inline">About &amp; Deck</span>
        <span className="inline md:hidden">About</span>
      </button>
    </div>
  );
};
