import React from 'react';
import { PhoneCall, ShieldAlert, Heart } from 'lucide-react';

interface PersistentCrisisButtonProps {
  onClick: () => void;
  isDarkMode?: boolean;
}

export const PersistentCrisisButton: React.FC<PersistentCrisisButtonProps> = ({
  onClick,
  isDarkMode = false
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        onClick={onClick}
        className={`group flex items-center space-x-2.5 px-3.5 py-2.5 rounded-full shadow-lg border transition-all duration-300 active:scale-95 cursor-pointer ${
          isDarkMode
            ? 'bg-[#2B1B18]/95 hover:bg-[#3D2520] border-rose-800/60 text-[#F5C2BC] shadow-black/40'
            : 'bg-white/95 hover:bg-rose-50/90 border-rose-200/80 text-rose-800 shadow-rose-950/10'
        } backdrop-blur-md`}
        title="24/7 Crisis Support & Hotlines"
      >
        <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <span className="text-xs font-bold tracking-tight whitespace-nowrap">
          Crisis Support
        </span>
        <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-300">
          24/7
        </span>
      </button>
    </div>
  );
};
