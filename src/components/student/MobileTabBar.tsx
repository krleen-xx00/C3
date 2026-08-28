import React from 'react';
import { Home, MessageCircleHeart, Sparkles, LifeBuoy, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

export type MobileTabId = 'overview' | 'companions' | 'inspiration' | 'resources';

interface MobileTabBarProps {
  activeTab: MobileTabId;
  onTabChange: (tab: MobileTabId) => void;
  isDarkMode: boolean;
  onOpenPersonalization: () => void;
}

interface TabItem {
  id: MobileTabId;
  label: string;
  icon: React.ReactNode;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  onOpenPersonalization
}) => {
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
    { id: 'companions', label: 'Companions', icon: <MessageCircleHeart className="w-5 h-5" /> },
    { id: 'inspiration', label: 'Inspiration', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'resources', label: 'Resources', icon: <LifeBuoy className="w-5 h-5" /> }
  ];

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 pb-[env(safe-area-inset-bottom)] pt-2 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#1C1815]/95 backdrop-blur-xl border-t border-[#3A322B]'
          : 'bg-[#FFFDF9]/95 backdrop-blur-xl border-t border-[#EFE6DB]'
      }`}
      style={{ boxShadow: '0 -6px 24px rgba(0,0,0,0.06)' }}
      aria-label="Main navigation"
    >
      {/* Personalization quick button */}
      <button
        type="button"
        onClick={onOpenPersonalization}
        className={`absolute -top-12 left-4 z-10 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all cursor-pointer ${
          isDarkMode
            ? 'bg-[#2C221D]/95 text-[#E8CDAC] border-[#4D3F36]'
            : 'bg-white/95 text-amber-700 border-[#ECDCC6]'
        }`}
        title="Personalize your AI companion"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold">Personalize</span>
      </button>

      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-pressed={isActive}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-colors cursor-pointer ${
                isActive
                  ? isDarkMode
                    ? 'text-[#E8CDAC]'
                    : 'text-amber-700'
                  : isDarkMode
                  ? 'text-[#9E8F82] hover:text-[#EDE5DB]'
                  : 'text-[#9E8A8A] hover:text-[#3D2C2C]'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-tab-indicator"
                  className={`absolute inset-0 rounded-2xl ${
                    isDarkMode ? 'bg-[#3A2F28]' : 'bg-[#F7EFE3]'
                  }`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10 text-[10px] font-semibold mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
