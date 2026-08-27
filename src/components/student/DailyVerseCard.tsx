import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Bookmark, Check, BookOpen } from 'lucide-react';

interface Verse {
  reference: string;
  text: string;
  theme: string;
}

const INSPIRATIONAL_VERSES: Verse[] = [
  {
    reference: "Philippians 4:6-7",
    text: "Do not be anxious about anything, but in every situation, present your requests to God. And the peace of God will guard your hearts and minds.",
    theme: "Peace & Comfort"
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Do not be afraid or discouraged, for the Lord your God will be with you wherever you go.",
    theme: "Courage & Strength"
  },
  {
    reference: "Isaiah 40:31",
    text: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary.",
    theme: "Hope & Endurance"
  },
  {
    reference: "Psalm 46:1",
    text: "God is our refuge and strength, an ever-present help in times of trouble.",
    theme: "Safety & Refuge"
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    theme: "Guidance & Wisdom"
  },
  {
    reference: "Jeremiah 29:11",
    text: "'For I know the plans I have for you,' declares the Lord, 'plans to give you hope and a future.'",
    theme: "Future & Purpose"
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    theme: "Rest & Renewal"
  },
  {
    reference: "2 Timothy 1:7",
    text: "For God has not given us a spirit of fear, but of power, love, and a sound mind.",
    theme: "Clarity & Confidence"
  }
];

export const DailyVerseCard: React.FC = () => {
  const [verseIndex, setVerseIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const currentVerse = INSPIRATIONAL_VERSES[verseIndex];

  const handleNextVerse = () => {
    setVerseIndex((prev) => (prev + 1) % INSPIRATIONAL_VERSES.length);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${currentVerse.text}" — ${currentVerse.reference}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 rounded-3xl p-5 sm:p-6 border border-amber-200/60 dark:border-amber-900/40 shadow-xs relative overflow-hidden flex flex-col justify-between"
    >
      {/* Decorative Gold Side Accent Line */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 rounded-l-3xl" />

      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3 pl-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-950/80 rounded-xl text-amber-700 dark:text-amber-300">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Verse of the Day
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200/50 dark:border-amber-800/50">
              {currentVerse.theme}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors"
              title="Copy verse"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleNextVerse}
              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors"
              title="Inspirational Verse"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Animated Verse Content */}
        <div className="pl-2 pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={verseIndex}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                "{currentVerse.text}"
              </p>
              <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center space-x-1">
                <span>— {currentVerse.reference}</span>
                <Sparkles className="w-3 h-3 text-amber-500 inline ml-1" />
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-4 pl-2 pt-2 border-t border-amber-100 dark:border-amber-900/30 flex items-center justify-between text-[10px] text-slate-400">
        <span>Daily encouragement for Cabiao SHS students</span>
        {copied && <span className="text-emerald-600 font-bold">Copied to clipboard!</span>}
      </div>
    </motion.div>
  );
};
