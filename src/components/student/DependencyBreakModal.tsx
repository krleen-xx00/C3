import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Coffee,
  X,
  Sparkles,
  Clock,
  BookOpen
} from 'lucide-react';

interface DependencyBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToHomeHub: () => void;
  onOpenOfflineTools?: () => void;
  messageCount: number;
  activeMinutes: number;
  isDarkMode: boolean;
}

export const DependencyBreakModal: React.FC<DependencyBreakModalProps> = ({
  isOpen,
  onClose,
  onBackToHomeHub,
  onOpenOfflineTools,
  messageCount,
  activeMinutes,
  isDarkMode
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-md bg-black/65">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden relative ${
            isDarkMode
              ? 'bg-[#1D1714] border-[#3D322A] text-[#EDE5DB]'
              : 'bg-white border-[#EAE0D2] text-[#3D2C2C]'
          }`}
        >
          {/* Decorative Warm Top Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-4 right-4 p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-[#2C241F] text-[#8A796B]' : 'hover:bg-[#EFE5D8] text-[#9C8888]'
            }`}
            title="Continue softly"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main Grounding Prompt */}
          <div className="p-6 sm:p-8 text-center space-y-6">
            {/* Calm Icon */}
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md">
              <Coffee className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs">
                🌿
              </span>
            </div>

            {/* Title & Safeguard Badge */}
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Dependency &amp; Wellbeing Safeguard</span>
              </span>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {messageCount >= 40 ? "Take a Breather!" : "Time for a gentle pause"}
              </h3>

              {/* Exact Mandated Grounding Message */}
              <p className="text-sm sm:text-base font-semibold leading-relaxed max-w-md mx-auto text-stone-800 dark:text-stone-100">
                {messageCount >= 40
                  ? "Take a Breather! You've reached the 40-message session limit. Remember to rest, hydrate, or talk to someone offline."
                  : "You've been sharing with us for a while! Remember to take a break, grab some water, or talk to someone you trust offline."}
              </p>
            </div>

            {/* Session Stats Chips */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-center space-x-4 text-xs ${
                isDarkMode ? 'bg-[#15100E] border-[#2E241E] text-[#A09080]' : 'bg-[#FAF6F0] border-[#EFE2D2] text-[#7D6B5E]'
              }`}
            >
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Session: <strong>{activeMinutes >= 20 ? '20+ mins active' : `${activeMinutes} mins`}</strong></span>
              </span>
              <span>•</span>
              <span>Messages: <strong>{messageCount >= 40 ? '40 msgs (Session limit)' : `${messageCount} of 40 msgs`}</strong></span>
            </div>

            {/* Action Buttons: [Explore Offline Tools] and [Back to Home Hub] */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onOpenOfflineTools && (
                <button
                  type="button"
                  onClick={onOpenOfflineTools}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Offline Tools</span>
                </button>
              )}

              <button
                type="button"
                onClick={onBackToHomeHub}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md ${
                  isDarkMode
                    ? 'bg-[#D4A373] hover:bg-[#C28F5E] text-[#1E1712]'
                    : 'bg-[#8F5B34] hover:bg-[#784823] text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Back to Home Hub</span>
              </button>
            </div>

            <p className={`text-[11px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
              Our AI companions are here to guide your study and reflection, but real-world balance, rest, and human connection always come first.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
