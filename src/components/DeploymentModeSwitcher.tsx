import React, { useState, useRef, useEffect } from 'react';
import { Layers, GraduationCap, Shield, ChevronDown, Check, Sparkles } from 'lucide-react';

export type DeploymentMode = 'all' | 'student' | 'counselor';

interface DeploymentModeSwitcherProps {
  deploymentMode: DeploymentMode;
  onSelectDeploymentMode: (mode: DeploymentMode) => void;
  isDarkMode: boolean;
  className?: string;
}

export const DEPLOYMENT_MODES: {
  id: DeploymentMode;
  label: string;
  shortLabel: string;
  route: string;
  badgeText: string;
  description: string;
  icon: typeof Layers;
  accentColor: string;
}[] = [
  {
    id: 'all',
    label: 'All-in-One Prototype',
    shortLabel: 'All Tabs',
    route: '/',
    badgeText: 'Default',
    description: 'Defense presentation view with all 4 navigation tabs visible (Wellness, Counselor, Companions, About).',
    icon: Layers,
    accentColor: 'text-amber-500'
  },
  {
    id: 'student',
    label: 'Deployed Student Portal',
    shortLabel: 'Student Portal',
    route: '/student',
    badgeText: '/student',
    description: 'Isolated student experience. Counselor View button is completely hidden from navigation.',
    icon: GraduationCap,
    accentColor: 'text-emerald-500'
  },
  {
    id: 'counselor',
    label: 'Deployed Counselor Portal',
    shortLabel: 'Counselor Portal',
    route: '/counselor',
    badgeText: '/counselor',
    description: 'Direct access to Guidance & Counseling authentication and triage dashboard. Student tabs hidden.',
    icon: Shield,
    accentColor: 'text-amber-600'
  }
];

export const DeploymentModeSwitcher: React.FC<DeploymentModeSwitcherProps> = ({
  deploymentMode,
  onSelectDeploymentMode,
  isDarkMode,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeDef = DEPLOYMENT_MODES.find(m => m.id === deploymentMode) || DEPLOYMENT_MODES[0];
  const ActiveIcon = activeDef.icon;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="btn-deployment-mode-switcher"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition-all duration-200 cursor-pointer shadow-2xs select-none ${
          deploymentMode === 'counselor'
            ? isDarkMode
              ? 'bg-[#3A2416] hover:bg-[#482D1B] border-[#724524] text-[#F3C498]'
              : 'bg-[#FFF3E5] hover:bg-[#FEE9D1] border-[#F0C99E] text-[#9A5217]'
            : deploymentMode === 'student'
            ? isDarkMode
              ? 'bg-[#182C1D] hover:bg-[#1E3925] border-[#2D5A38] text-[#A6E3B5]'
              : 'bg-[#EBF7EF] hover:bg-[#DEF1E4] border-[#BCE1C7] text-[#236836]'
            : isDarkMode
            ? 'bg-[#241C18] hover:bg-[#30251F] border-[#3D3026] text-[#E0CDBC]'
            : 'bg-white hover:bg-[#FBF6EE] border-[#E9DFCE] text-[#635147]'
        }`}
        title={`Current Deployment Mode: ${activeDef.label} (${activeDef.route}). Click to switch.`}
      >
        <ActiveIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${activeDef.accentColor}`} />
        <span className="hidden md:inline font-semibold text-[10px] uppercase tracking-wider opacity-60">Mode:</span>
        <span className="font-bold truncate max-w-[90px] sm:max-w-none">{activeDef.shortLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Deployment Mode Options"
          className={`absolute right-0 mt-1.5 w-72 sm:w-80 rounded-2xl border shadow-xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode
              ? 'bg-[#1C1613]/95 border-[#3E3127] text-[#EDE5DB] shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
              : 'bg-white/95 border-[#E8DFD3] text-[#3D2C2C] shadow-[0_12px_40px_rgba(0,0,0,0.12)]'
          }`}
        >
          {/* Header */}
          <div className="px-2.5 py-2 border-b border-inherit mb-1 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Deployment &amp; Route Mode</span>
              </span>
              <p className={`text-[10px] mt-0.5 leading-tight ${isDarkMode ? 'text-[#9A8A7C]' : 'text-[#7D6B5E]'}`}>
                Test isolated routes or switch for defense demo
              </p>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
              isDarkMode ? 'bg-[#291E18] text-amber-300' : 'bg-amber-100 text-amber-900'
            }`}>
              Live Routes
            </span>
          </div>

          {/* Mode Options */}
          <div className="space-y-1">
            {DEPLOYMENT_MODES.map((mode) => {
              const isSelected = mode.id === deploymentMode;
              const Icon = mode.icon;

              return (
                <button
                  key={mode.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelectDeploymentMode(mode.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-all duration-150 flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#2D2119] ring-1 ring-[#5E422E]'
                        : 'bg-[#F9EFE4] ring-1 ring-[#DFC8B2]'
                      : isDarkMode
                      ? 'hover:bg-[#251D18]'
                      : 'hover:bg-[#FAF4EB]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-[#3D2C20] text-amber-300'
                          : 'bg-[#F2DFCD] text-amber-900'
                        : isDarkMode
                        ? 'bg-[#241C18] text-[#8E7E70]'
                        : 'bg-[#F5EDE1] text-[#7A695C]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold leading-tight truncate">
                        {mode.label}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          isSelected
                            ? isDarkMode
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-amber-500/15 text-amber-900 font-extrabold'
                            : isDarkMode
                            ? 'bg-[#281F19] text-[#7A6D61]'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {mode.badgeText}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] mt-0.5 leading-snug ${
                        isSelected
                          ? isDarkMode
                            ? 'text-[#C9B9A8]'
                            : 'text-[#5E4B40]'
                          : isDarkMode
                          ? 'text-[#7A6D61]'
                          : 'text-[#8E7B6E]'
                      }`}
                    >
                      {mode.description}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Route URL note */}
          <div
            className={`mt-2 pt-2 border-t border-inherit px-2 py-1 flex items-center justify-between text-[10px] ${
              isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7A6D]'
            }`}
          >
            <span>Direct URLs:</span>
            <span className="font-mono text-[9px] space-x-1">
              <span className="underline decoration-dotted cursor-pointer" onClick={() => onSelectDeploymentMode('student')}>/student</span>
              <span>•</span>
              <span className="underline decoration-dotted cursor-pointer" onClick={() => onSelectDeploymentMode('counselor')}>/counselor</span>
              <span>•</span>
              <span className="underline decoration-dotted cursor-pointer" onClick={() => onSelectDeploymentMode('all')}>/</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
