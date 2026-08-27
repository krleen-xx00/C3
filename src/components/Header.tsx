import React from 'react';
import { User, UserRole, CompanionId } from '../types';
import { Shield, Sparkles, LogOut, Bell } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unresolvedAlertsCount: number;
  activeCompanionRoomId?: CompanionId | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchRole,
  onLogout,
  activeTab,
  setActiveTab,
  unresolvedAlertsCount,
  activeCompanionRoomId
}) => {

  const getLogoStyles = () => {
    if (activeCompanionRoomId === 'casti') {
      return {
        boxBg: 'bg-blue-600 shadow-blue-500/30',
        badgeBg: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        badgeLabel: "Casti's Calm Room ☁️"
      };
    }
    if (activeCompanionRoomId === 'cedi') {
      return {
        boxBg: 'bg-orange-500 shadow-orange-500/30',
        badgeBg: 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        badgeLabel: "Cedi's Hype Room ⚡"
      };
    }
    if (activeCompanionRoomId === 'cali') {
      return {
        boxBg: 'bg-emerald-600 shadow-emerald-500/30',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        badgeLabel: "Cali's Guide Room 🌿"
      };
    }
    return {
      boxBg: 'bg-orange-400 shadow-orange-400/30',
      badgeBg: 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-300 border-orange-100 dark:border-orange-800',
      badgeLabel: 'SHS Prototype'
    };
  };

  const logoStyle = getLogoStyles();

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCFB]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & School Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0 ring-1 ring-black/5 dark:ring-white/10 border border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 transition-all duration-300 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="Cabiao National Senior High School logo"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Companion
                </span>
                <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold ${logoStyle.badgeBg} rounded-full border transition-colors duration-300`}>
                  {logoStyle.badgeLabel}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-none">
                Cabiao Senior High School Guidance System
              </p>
            </div>
          </div>

          {/* Navigation & Action Controls for Authenticated User */}
          {currentUser && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Role Switcher Pill */}
              <div className="hidden md:flex items-center p-1 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-sm">
                <button
                  type="button"
                  onClick={() => onSwitchRole('student')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentUser.role === 'student'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student View</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('counselor')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                    currentUser.role === 'counselor'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Counselor View</span>
                  {unresolvedAlertsCount > 0 && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  )}
                </button>
              </div>

              {/* Counselor Crisis Alert Notification Bell */}
              {currentUser.role === 'counselor' && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveTab('alerts')}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 transition-colors relative"
                    title="View Crisis Escalation Alerts"
                  >
                    <Bell className="w-5 h-5" />
                    {unresolvedAlertsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-md">
                        {unresolvedAlertsCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Urgent Support Pill Badge */}
              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-full hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <span>Urgent Support</span>
              </button>

              {/* User Avatar Pill */}
              <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
                    {currentUser.role === 'student' ? currentUser.gradeSection : 'Guidance Counselor'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </header>
  );
};
