import React from 'react';
import { Sparkles, Shield } from 'lucide-react';

interface ViewSwitcherProps {
  viewMode: 'student' | 'counselor';
  onViewChange: (mode: 'student' | 'counselor') => void;
  isDarkMode: boolean;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  viewMode,
  onViewChange,
  isDarkMode
}) => {
  return (
    <div
      id="view-mode-switcher"
      className={`flex items-center p-1 rounded-full border transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
        isDarkMode
          ? 'bg-[#26211E] border-[#3D352F]'
          : 'bg-white border-[#EDE5DA]'
      }`}
    >
      <button
        type="button"
        id="btn-student-view"
        onClick={() => onViewChange('student')}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          viewMode === 'student'
            ? isDarkMode
              ? 'bg-[#47382B] text-[#EDE5DB] shadow-xs'
              : 'bg-[#EDE2D4] text-[#3D2C2C] shadow-xs'
            : isDarkMode
            ? 'text-[#A8988A] hover:text-[#EDE5DB]'
            : 'text-[#8C7575] hover:text-[#3D2C2C]'
        }`}
        aria-pressed={viewMode === 'student'}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Student View</span>
      </button>

      <button
        type="button"
        id="btn-counselor-view"
        onClick={() => onViewChange('counselor')}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          viewMode === 'counselor'
            ? isDarkMode
              ? 'bg-[#D4A373] text-[#1E1712] font-bold shadow-xs'
              : 'bg-[#8F5B34] text-white font-bold shadow-xs'
            : isDarkMode
            ? 'text-[#A8988A] hover:text-[#EDE5DB]'
            : 'text-[#8C7575] hover:text-[#3D2C2C]'
        }`}
        aria-pressed={viewMode === 'counselor'}
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Counselor View</span>
      </button>
    </div>
  );
};
