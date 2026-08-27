import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Bookmark, Check, BookOpen, Settings, Heart } from 'lucide-react';
import { InspirationSource } from '../../types';
import { SECULAR_AFFIRMATIONS, SECULAR_DAILY_WISDOM } from '../../data/affirmationsData';

interface Verse {
  reference: string;
  text: string;
  theme: string;
}

const INSPIRATIONAL_VERSES: Record<'heavy' | 'restless' | 'quiet' | 'warm' | 'joyful', Verse[]> = {
  heavy: [
    {
      reference: "Matthew 11:28",
      text: "Come to me, all you who are weary and burdened, and I will give you rest.",
      theme: "Rest & Renewal"
    },
    {
      reference: "Psalm 46:1",
      text: "God is our refuge and strength, an ever-present help in times of trouble.",
      theme: "Safety & Refuge"
    },
    {
      reference: "Isaiah 40:31",
      text: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary.",
      theme: "Hope & Strength"
    }
  ],
  restless: [
    {
      reference: "Philippians 4:6-7",
      text: "Do not be anxious about anything, but in every situation, present your requests to God. And the peace of God will guard your hearts and minds.",
      theme: "Peace & Comfort"
    },
    {
      reference: "Joshua 1:9",
      text: "Be strong and courageous. Do not be afraid or discouraged, for the Lord your God will be with you wherever you go.",
      theme: "Courage & Faith"
    },
    {
      reference: "2 Timothy 1:7",
      text: "For God has not given us a spirit of fear, but of power, love, and a sound mind.",
      theme: "Sound Mind"
    }
  ],
  quiet: [
    {
      reference: "Psalm 23:1-3",
      text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
      theme: "Rest & Guidance"
    },
    {
      reference: "Proverbs 3:5-6",
      text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
      theme: "Wisdom & Trust"
    },
    {
      reference: "Psalm 62:1",
      text: "Truly my soul finds rest in God; my salvation comes from him.",
      theme: "Quiet Rest"
    }
  ],
  warm: [
    {
      reference: "Jeremiah 29:11",
      text: "'For I know the plans I have for you,' declares the Lord, 'plans to give you hope and a future.'",
      theme: "Future & Hope"
    },
    {
      reference: "Numbers 6:24-26",
      text: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
      theme: "Blessing & Peace"
    },
    {
      reference: "Romans 15:13",
      text: "May the God of hope fill you with all joy and peace as you trust in him.",
      theme: "Joy & Hope"
    }
  ],
  joyful: [
    {
      reference: "Psalm 118:24",
      text: "This is the day the Lord has made; let us rejoice and be glad in it.",
      theme: "Joy & Gratitude"
    },
    {
      reference: "Nehemiah 8:10",
      text: "The joy of the Lord is your strength.",
      theme: "Strength & Joy"
    },
    {
      reference: "Psalm 100:1-2",
      text: "Shout for joy to the Lord, all the earth. Worship the Lord with gladness; come before him with joyful songs.",
      theme: "Praise & Joy"
    }
  ]
};

interface DailyInspirationCardProps {
  inspirationSource: InspirationSource;
  currentMood?: 'heavy' | 'restless' | 'quiet' | 'warm' | 'joyful' | string;
  onOpenSettings?: () => void;
  isDarkMode?: boolean;
}

export const DailyInspirationCard: React.FC<DailyInspirationCardProps> = ({
  inspirationSource,
  currentMood = 'quiet',
  onOpenSettings,
  isDarkMode = false
}) => {
  const [index, setIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Normalize mood category
  let moodCategory: 'heavy' | 'restless' | 'quiet' | 'warm' | 'joyful' = 'quiet';
  const m = currentMood.toLowerCase();
  if (m === 'heavy' || m === 'sad' || m === 'tired') moodCategory = 'heavy';
  else if (m === 'restless' || m === 'anxious') moodCategory = 'restless';
  else if (m === 'warm' || m === 'calm') moodCategory = 'warm';
  else if (m === 'joyful' || m === 'energetic') moodCategory = 'joyful';

  const affirmationsList = SECULAR_AFFIRMATIONS[moodCategory] || SECULAR_AFFIRMATIONS.quiet;
  const versesList = INSPIRATIONAL_VERSES[moodCategory] || INSPIRATIONAL_VERSES.quiet;

  const currentAffirmation = affirmationsList[index % affirmationsList.length];
  const currentVerse = versesList[index % versesList.length];

  const handleNext = () => {
    setIndex(prev => prev + 1);
  };

  const handleCopy = () => {
    if (inspirationSource === 'affirmations') {
      navigator.clipboard.writeText(`"${currentAffirmation.text}" — Daily Affirmation`);
    } else {
      navigator.clipboard.writeText(`"${currentVerse.text}" — ${currentVerse.reference}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`rounded-3xl p-5 sm:p-6 border shadow-xs relative overflow-hidden flex flex-col justify-between transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-[#241E1B] via-[#1E1916] to-[#251E1C] border-[#3D342E]'
          : 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 border-amber-200/60'
      }`}
    >
      {/* Decorative Gold Side Accent Line */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 rounded-l-3xl" />

      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3 pl-2">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-xl ${
              isDarkMode ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100 text-amber-700'
            }`}>
              {inspirationSource === 'affirmations' ? <Sparkles className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDarkMode ? 'text-amber-300' : 'text-amber-800'
            }`}>
              {inspirationSource === 'affirmations' ? 'Affirmation for Your Heart' : 'Scripture for Your Heart'}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
              isDarkMode
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                : 'bg-amber-100/80 text-amber-800 border-amber-200/50'
            }`}>
              {inspirationSource === 'affirmations' ? currentAffirmation.theme : currentVerse.theme}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-950/50 transition-colors"
                title="Change Inspiration Source (Affirmations / Scripture)"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-950/50 transition-colors"
              title="Copy"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-950/50 transition-colors"
              title="Next Inspiration"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Animated Content */}
        <div className="pl-2 pr-1">
          <AnimatePresence mode="wait">
            {inspirationSource === 'affirmations' ? (
              <motion.div
                key={`aff_${index}_${moodCategory}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  "{currentAffirmation.text}"
                </p>
                <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center space-x-1">
                  <span>— Secular Mood Reflection</span>
                  <Sparkles className="w-3 h-3 text-amber-500 inline ml-1" />
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`ver_${index}_${moodCategory}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed font-sans">
                  "{currentVerse.text}"
                </p>
                <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center space-x-1">
                  <span>— {currentVerse.reference}</span>
                  <Sparkles className="w-3 h-3 text-amber-500 inline ml-1" />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Hint */}
      <div className={`mt-4 pl-2 pt-2 border-t flex items-center justify-between text-[10px] text-slate-400 ${
        isDarkMode ? 'border-amber-900/30' : 'border-amber-100'
      }`}>
        <div className="flex items-center space-x-1.5">
          <span>{inspirationSource === 'affirmations' ? 'Daily Affirmations' : 'Scripture Verses'}</span>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
          >
            Switch to {inspirationSource === 'affirmations' ? 'Scripture' : 'Affirmations only'}
          </button>
        </div>
        {copied && <span className="text-emerald-600 font-bold">Copied!</span>}
      </div>
    </motion.div>
  );
};
