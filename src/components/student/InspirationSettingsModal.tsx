import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, BookOpen, Heart, Settings, Check } from 'lucide-react';
import { InspirationSource } from '../../types';

interface InspirationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspirationSource: InspirationSource;
  onChangeInspirationSource: (source: InspirationSource) => void;
  isDarkMode: boolean;
}

export const InspirationSettingsModal: React.FC<InspirationSettingsModalProps> = ({
  isOpen,
  onClose,
  inspirationSource,
  onChangeInspirationSource,
  isDarkMode
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-3xl p-6 space-y-5 transition-colors ${
          isDarkMode
            ? 'bg-[#221C1A] text-[#EDE5DB] border border-[#3D352F] shadow-2xl'
            : 'bg-[#FAF7F2] text-[#3D2C2C] border border-[#EAE2D5] shadow-xl'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Preferences & Inspiration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your daily encouragement source
            </p>
          </div>
        </div>

        {/* Setting 1: Daily inspiration source */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Daily inspiration source
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Option 1: Affirmations only (Default) */}
            <div
              onClick={() => onChangeInspirationSource('affirmations')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                inspirationSource === 'affirmations'
                  ? isDarkMode
                    ? 'bg-[#2C221D] border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white border-amber-400/90 shadow-md ring-1 ring-amber-400/30'
                  : isDarkMode
                  ? 'bg-[#1A1614] border-[#332A24] hover:border-[#4D3F36]'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${
                inspirationSource === 'affirmations'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Affirmations only
                  </span>
                  {inspirationSource === 'affirmations' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
                      Selected (Default)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Gentle, secular daily affirmations matched to your current mood without religious texts.
                </p>
              </div>
            </div>

            {/* Option 2: Include scripture verses */}
            <div
              onClick={() => onChangeInspirationSource('scripture')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                inspirationSource === 'scripture'
                  ? isDarkMode
                    ? 'bg-[#2C221D] border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-white border-amber-400/90 shadow-md ring-1 ring-amber-400/30'
                  : isDarkMode
                  ? 'bg-[#1A1614] border-[#332A24] hover:border-[#4D3F36]'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-xl mt-0.5 ${
                inspirationSource === 'scripture'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Include scripture verses
                  </span>
                  {inspirationSource === 'scripture' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Displays calming inspirational Bible verses matched to your mood and reflections.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Save & Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
