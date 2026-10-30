import React, { useState } from 'react';
import { Layers, GraduationCap, Shield, ChevronRight, X } from 'lucide-react';
import { DeploymentMode } from './DeploymentModeSwitcher';

interface RouteBadgeProps {
  deploymentMode: DeploymentMode;
  onSelectDeploymentMode: (mode: DeploymentMode) => void;
  isDarkMode: boolean;
}

export const RouteBadge: React.FC<RouteBadgeProps> = ({
  deploymentMode,
  onSelectDeploymentMode,
  isDarkMode
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getBadgeDetails = () => {
    switch (deploymentMode) {
      case 'student':
        return {
          label: 'Deployed Student Mode',
          route: '/student',
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: isDarkMode ? 'bg-[#15271A] border-[#294B33]' : 'bg-[#EDF8F1] border-[#B7E4C7]',
          icon: GraduationCap
        };
      case 'counselor':
        return {
          label: 'Deployed Counselor Mode',
          route: '/counselor',
          color: 'text-amber-600 dark:text-amber-400',
          bg: isDarkMode ? 'bg-[#2E1D13] border-[#5A3821]' : 'bg-[#FFF3E5] border-[#F0CCA8]',
          icon: Shield
        };
      default:
        return {
          label: 'All-in-One Prototype Mode',
          route: '/',
          color: 'text-stone-700 dark:text-stone-300',
          bg: isDarkMode ? 'bg-[#221C18] border-[#3D3228]' : 'bg-white border-[#E5DACD]',
          icon: Layers
        };
    }
  };

  const badge = getBadgeDetails();
  const Icon = badge.icon;

  return (
    <aside
      aria-label="Deployment Route Simulation Controls"
      className="fixed bottom-3 left-3 z-30 select-none print:hidden"
    >
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-md backdrop-blur-md transition-all duration-200 hover:scale-103 cursor-pointer ${badge.bg}`}
          title="Click to view and switch deployment routes (/student, /counselor, /)"
        >
          <Icon className={`w-3 h-3 ${badge.color}`} />
          <span className="font-mono opacity-80">{badge.route}</span>
          <span className="hidden sm:inline font-sans opacity-70">({badge.label})</span>
          <ChevronRight className="w-3 h-3 opacity-60" />
        </button>
      ) : (
        <div
          className={`p-2 rounded-2xl border shadow-xl backdrop-blur-md flex items-center space-x-2 text-[11px] animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            isDarkMode
              ? 'bg-[#1C1613]/95 border-[#3E3127] text-[#EDE5DB]'
              : 'bg-white/95 border-[#E8DFD3] text-[#3D2C2C]'
          }`}
        >
          <span className="font-bold text-[10px] uppercase tracking-wider opacity-60 pl-1">
            Simulate Route:
          </span>

          <div className="flex items-center space-x-1">
            {/* All-in-One */}
            <button
              type="button"
              onClick={() => {
                onSelectDeploymentMode('all');
                setIsExpanded(false);
              }}
              className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                deploymentMode === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-2xs font-extrabold'
                  : isDarkMode
                  ? 'bg-[#2A211B] text-[#A8988A] hover:text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All (/)
            </button>

            {/* Student */}
            <button
              type="button"
              onClick={() => {
                onSelectDeploymentMode('student');
                setIsExpanded(false);
              }}
              className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                deploymentMode === 'student'
                  ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                  : isDarkMode
                  ? 'bg-[#2A211B] text-[#A8988A] hover:text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              /student
            </button>

            {/* Counselor */}
            <button
              type="button"
              onClick={() => {
                onSelectDeploymentMode('counselor');
                setIsExpanded(false);
              }}
              className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                deploymentMode === 'counselor'
                  ? 'bg-amber-600 text-white shadow-2xs font-extrabold'
                  : isDarkMode
                  ? 'bg-[#2A211B] text-[#A8988A] hover:text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              /counselor
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            aria-label="Minimize route switcher"
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 cursor-pointer ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </aside>
  );
};
