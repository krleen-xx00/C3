import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface NightModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  className?: string;
}

export const NightModeToggle: React.FC<NightModeToggleProps> = ({
  isDarkMode,
  onToggle,
  className
}) => {
  return (
    <div className={className || "fixed right-3 sm:right-6 top-5 z-40"}>
      <button
        type="button"
        onClick={onToggle}
        className={`group flex items-center space-x-2 px-3 py-2 rounded-full border transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] cursor-pointer ${
          isDarkMode
            ? 'bg-[#26211E] hover:bg-[#2F2925] text-[#EDE5DB] border-[#3D352F]'
            : 'bg-white hover:bg-[#FAF7F2] text-[#3D2C2C] border-[#EDE5DA]'
        }`}
        title={isDarkMode ? 'Switch to warm day mode' : 'Switch to cozy night mode'}
        aria-label={isDarkMode ? 'Switch to warm day mode' : 'Switch to cozy night mode'}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {isDarkMode ? (
            <Moon className="w-4 h-4 text-[#D8C29D] transform transition-transform group-hover:-rotate-12 duration-300" />
          ) : (
            <Sun className="w-4 h-4 text-[#D19B64] transform transition-transform group-hover:rotate-45 duration-300" />
          )}
        </div>
        <span className="text-xs font-medium tracking-wide">
          {isDarkMode ? 'Night' : 'Day'}
        </span>
      </button>
    </div>
  );
};
