import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, Bookmark, Check, Calendar } from 'lucide-react';
import { InspirationSource } from '../../types';
import { getDailyInspiration } from '../../data/affirmationsData';

interface DailyInspirationCardProps {
  inspirationSource?: InspirationSource;
  isDarkMode?: boolean;
  embedded?: boolean;
  className?: string;
  onOpenSettings?: () => void;
}

export const DailyInspirationCard: React.FC<DailyInspirationCardProps> = ({
  inspirationSource: propSource = 'affirmations',
  isDarkMode = false,
  embedded = false,
  className = ''
}) => {
  const [source, setSource] = useState<'affirmations' | 'bible'>(() => {
    try {
      const saved = localStorage.getItem('c3-inspiration-source');
      if (saved === 'bible' || saved === 'affirmations') return saved;
    } catch {}
    return propSource === 'bible' ? 'bible' : 'affirmations';
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Deterministic daily entry derived from the current local calendar date
  const todayEntry = getDailyInspiration(source);

  // Formatted date string for student reference (e.g., "Thursday, October 29")
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleToggleSource = (newSource: 'affirmations' | 'bible') => {
    setSource(newSource);
    try {
      localStorage.setItem('c3-inspiration-source', newSource);
    } catch {}
  };

  const handleCopy = () => {
    const copyText =
      todayEntry.type === 'scripture'
        ? `"${todayEntry.text}" — ${todayEntry.referenceOrTheme}`
        : `"${todayEntry.text}" — Daily Affirmation (${todayEntry.referenceOrTheme})`;
    
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const isScripture = todayEntry.type === 'scripture';

  return (
    <div
      className={`relative overflow-hidden flex flex-col justify-between transition-colors duration-300 text-left ${
        embedded
          ? `rounded-2xl p-4 sm:p-5 border ${
              isDarkMode
                ? 'bg-[#1D1714]/90 border-[#382E26] shadow-none'
                : 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 border-amber-200/60 shadow-2xs'
            }`
          : `rounded-3xl p-5 sm:p-6 border shadow-xs ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#241E1B] via-[#1E1916] to-[#251E1C] border-[#3D342E]'
                : 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 border-amber-200/60'
            }`
      } ${className}`}
    >
      {/* Decorative Warm Side Accent Line */}
      <div
        className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${
          isScripture
            ? 'from-emerald-400 via-teal-400 to-emerald-500'
            : 'from-amber-400 via-orange-400 to-amber-500'
        } ${embedded ? 'rounded-l-2xl' : 'rounded-l-3xl'}`}
      />

      <div>
        {/* Top Header: Badge, Calendar Date & Quick Toggle */}
        <div className="flex items-center justify-between mb-3 pl-2 flex-wrap gap-2">
          {/* Badge & Date Indicator */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-2xs ${
                isScripture
                  ? isDarkMode
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isDarkMode
                  ? 'bg-amber-950/70 text-amber-300 border-amber-800/40'
                  : 'bg-amber-100/80 text-amber-900 border-amber-200'
              }`}
            >
              {isScripture ? <BookOpen className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isScripture ? 'Scripture of the Day' : 'Daily Affirmation'}</span>
            </span>

            {/* Calendar Day Pill */}
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                isDarkMode ? 'bg-[#251D18] text-[#A8988A] border-[#3A2D23]' : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
              title="Updates automatically every calendar day"
            >
              <Calendar className="w-2.5 h-2.5 opacity-60" />
              <span>{todayFormatted}</span>
            </span>
          </div>

          {/* Simple Source Switcher & Copy Action */}
          <div className="flex items-center space-x-1.5">
            <div
              className={`p-0.5 rounded-full border flex items-center text-[10px] font-bold ${
                isDarkMode ? 'bg-[#15110E] border-[#33271F]' : 'bg-stone-100 border-stone-200'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleSource('affirmations')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  source === 'affirmations'
                    ? isDarkMode
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-amber-500 text-white shadow-xs'
                    : isDarkMode
                    ? 'text-[#8A796B] hover:text-[#EDE5DB]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Switch to Daily Affirmation"
              >
                Affirmation
              </button>
              <button
                type="button"
                onClick={() => handleToggleSource('bible')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  source === 'bible'
                    ? isDarkMode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                    : isDarkMode
                    ? 'text-[#8A796B] hover:text-[#EDE5DB]'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Switch to Daily Scripture Verse"
              >
                Scripture
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-[#382E26] hover:bg-[#2C231D] text-[#8C7A6D] hover:text-amber-300'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-500 hover:text-amber-700'
              }`}
              title="Copy entry"
              aria-label="Copy entry"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Entry Text */}
        <div className="pl-2 pr-1 py-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${todayEntry.id}_${source}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <p
                className={`text-xs sm:text-sm font-medium leading-relaxed font-sans ${
                  isScripture ? 'italic text-stone-800 dark:text-stone-100' : 'text-stone-900 dark:text-stone-100'
                }`}
              >
                &ldquo;{todayEntry.text}&rdquo;
              </p>

              {/* Verified Attribution / Source */}
              <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-bold pt-0.5">
                <span className={isScripture ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
                  — {todayEntry.referenceOrTheme}
                </span>
                <span className="opacity-40 font-normal">•</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7665]'
                }`}>
                  {isScripture ? 'Holy Scripture' : 'Gentle Encouragement'}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle Footer Note */}
      <div
        className={`mt-3 pl-2 pt-2 border-t flex items-center justify-between text-[10px] ${
          isDarkMode ? 'border-[#2C241E] text-[#8A796B]' : 'border-amber-100 text-[#8C7665]'
        }`}
      >
        <span>Changes automatically each calendar day • Works offline without AI</span>
        {copied && <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied to clipboard!</span>}
      </div>
    </div>
  );
};
