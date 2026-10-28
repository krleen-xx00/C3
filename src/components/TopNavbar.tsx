import React from 'react';
import { ViewSwitcher, AppViewMode } from './ViewSwitcher';
import { NightModeToggle } from './NightModeToggle';
import { GraduationCap } from 'lucide-react';
import { User } from '../types';

interface TopNavbarProps {
  viewMode: AppViewMode;
  onViewChange: (mode: AppViewMode) => void;
  isDarkMode: boolean;
  onToggleNightMode: () => void;
  currentUser?: User;
  onOpenStudentAuth?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  viewMode,
  onViewChange,
  isDarkMode,
  onToggleNightMode,
  currentUser,
  onOpenStudentAuth
}) => {
  return (
    <header
      id="main-app-header"
      className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 border-b backdrop-blur-md ${
        isDarkMode
          ? 'bg-[#181412]/95 border-[#2C231D]/90 shadow-[0_2px_16px_rgba(0,0,0,0.3)]'
          : 'bg-[#FAF7F2]/95 border-[#EAE1D4]/90 shadow-[0_2px_16px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Official School Seal & Title */}
        <button
          type="button"
          onClick={() => onViewChange('student')}
          className="flex items-center space-x-1.5 sm:space-x-3 cursor-pointer shrink-0 group select-none text-left focus:outline-none"
          title="Cabiao National Senior High School - Student Wellness Haven"
          aria-label="Return to Student Wellness Haven"
        >
          {/* Logo seal container */}
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 flex items-center justify-center transition-all duration-300 border shadow-xs group-hover:scale-105 shrink-0 ${
              isDarkMode
                ? 'bg-[#221D19] border-[#2E4A3B]'
                : 'bg-white border-[#0e2c1f]/25'
            }`}
          >
            <img
              src="/logo.png"
              alt="Cabiao National Senior High School Seal"
              className="w-full h-full object-cover rounded-full"
              draggable={false}
            />
          </div>

          {/* School Name & Subtitle - Desktop (lg+) */}
          <div className="hidden lg:flex flex-col">
            <span
              className={`text-xs sm:text-sm font-bold tracking-tight leading-tight transition-colors ${
                isDarkMode ? 'text-[#B4D7C1]' : 'text-[#0e2c1f]'
              }`}
            >
              Cabiao National Senior High School
            </span>
            <span
              className={`text-[10px] font-medium leading-tight transition-colors ${
                isDarkMode ? 'text-[#7FA98E]' : 'text-[#0e2c1f]/65'
              }`}
            >
              Student Wellness Haven
            </span>
          </div>

          {/* School Name - Tablet (sm to lg) */}
          <div className="hidden sm:flex lg:hidden flex-col">
            <span
              className={`text-xs font-bold tracking-tight leading-tight transition-colors ${
                isDarkMode ? 'text-[#B4D7C1]' : 'text-[#0e2c1f]'
              }`}
            >
              Cabiao SHS
            </span>
            <span
              className={`text-[9px] font-medium leading-tight transition-colors ${
                isDarkMode ? 'text-[#7FA98E]' : 'text-[#0e2c1f]/65'
              }`}
            >
              Wellness Haven
            </span>
          </div>
        </button>

        {/* Right: Quick Controls, ViewSwitcher Tabs + Night Mode Toggle */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 max-w-[calc(100vw-3.2rem)] sm:max-w-none overflow-x-auto no-scrollbar py-0.5">
          {/* Student Account Badge */}
          {currentUser && onOpenStudentAuth && (
            <button
              type="button"
              onClick={onOpenStudentAuth}
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#241D19] hover:bg-[#30251F] border-[#3D3026] text-[#E0A868]'
                  : 'bg-[#FFF9F2] hover:bg-[#FCEFD9] border-[#ECDCC6] text-[#8F5B34]'
              }`}
              title="Click to view or edit student school account credentials"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentUser.name.split(' ')[0]}</span>
              <span className="opacity-75 font-mono text-[10px]">({currentUser.studentId || 'STU-8921'})</span>
            </button>
          )}

          {/* View Mode Switcher and Theme Toggle */}
          <ViewSwitcher
            viewMode={viewMode}
            onViewChange={onViewChange}
            isDarkMode={isDarkMode}
          />
          <NightModeToggle
            isDarkMode={isDarkMode}
            onToggle={onToggleNightMode}
            className="shrink-0"
          />
        </div>
      </div>
    </header>
  );
};

