import React, { useState, useEffect } from 'react';
import { User, CompanionId, MoodLog, InspirationSource, RiskTier, AcademicClusterId, UserStressLevel } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Settings, UserPlus } from 'lucide-react';
import { DailyInspirationCard } from './DailyInspirationCard';
import { InspirationSettingsModal } from './InspirationSettingsModal';
import { PersonalizationPanel } from './PersonalizationPanel';
import { MobileTabBar, MobileTabId } from './MobileTabBar';
import { TieredResourceCard } from './TieredResourceCard';
import { classifyRisk } from '../../utils/riskClassifier';
import { SECULAR_AFFIRMATIONS, SECULAR_DAILY_WISDOM } from '../../data/affirmationsData';
import { getClusterById } from '../../data/academicTracks';

interface StudentDashboardProps {
  currentUser: User;
  moodLogs: MoodLog[];
  isDarkMode?: boolean;
  onAddMoodLog: (log: Omit<MoodLog, 'id' | 'timestamp'>) => void;
  onOpenCompanionRoom: (id: CompanionId) => void;
  onOpenAbout?: () => void;
  onCrisisTriggered?: (isTier3?: boolean) => void;
  preferredName: string;
  onChangePreferredName: (name: string) => void;
  academicClusterId: AcademicClusterId;
  onChangeAcademicCluster: (id: AcademicClusterId) => void;
  stressLevel: UserStressLevel;
  onChangeStressLevel: (level: UserStressLevel) => void;
}

interface MoodOption {
  type: MoodLog['moodType'];
  score: number;
  emoji: string;
  label: string;
  category: 'heavy' | 'restless' | 'quiet' | 'warm' | 'joyful';
  verse: string;
  verseRef: string;
  affirmation: string;
  gentleTone: string;
  dayCircleBg: string;
  dayActiveBg: string;
  dayGlow: string;
  nightCircleBg: string;
  nightActiveBg: string;
  nightGlow: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    type: 'tired',
    score: 3,
    emoji: '🌧️',
    label: 'Heavy',
    category: 'heavy',
    verse: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    verseRef: 'Matthew 11:28',
    affirmation: 'It is okay to rest when things feel heavy. I do not have to carry everything all at once.',
    gentleTone: 'It is okay to pause and be gentle with yourself. You are not meant to carry everything alone.',
    dayCircleBg: 'bg-[#EAE4E0]',
    dayActiveBg: 'bg-[#F2ECE8] text-[#3D2C2C] ring-2 ring-[#C9B9AF] shadow-[0_4px_16px_rgba(180,155,140,0.25)]',
    dayGlow: 'hover:bg-[#F2ECE8] hover:shadow-[0_4px_14px_rgba(180,155,140,0.2)]',
    nightCircleBg: 'bg-[#332A24]',
    nightActiveBg: 'bg-[#42352D] text-[#EDE5DB] ring-2 ring-[#7F6759] shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
    nightGlow: 'hover:bg-[#3D3028]'
  },
  {
    type: 'anxious',
    score: 4,
    emoji: '🍃',
    label: 'Restless',
    category: 'restless',
    verse: 'Cast all your anxiety on him because he cares for you.',
    verseRef: '1 Peter 5:7',
    affirmation: 'I release the racing thoughts. Right now, in this breath, I am grounded and safe.',
    gentleTone: 'Take a soft, quiet breath. You are deeply cared for, and peace is always near.',
    dayCircleBg: 'bg-[#EAE3F5]',
    dayActiveBg: 'bg-[#F1ECF9] text-[#3D2C2C] ring-2 ring-[#C1B2DE] shadow-[0_4px_16px_rgba(160,140,210,0.25)]',
    dayGlow: 'hover:bg-[#F1ECF9] hover:shadow-[0_4px_14px_rgba(160,140,210,0.2)]',
    nightCircleBg: 'bg-[#2E243A]',
    nightActiveBg: 'bg-[#3B2E4D] text-[#EDE5DB] ring-2 ring-[#765C99] shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
    nightGlow: 'hover:bg-[#382B49]'
  },
  {
    type: 'calm',
    score: 6,
    emoji: '☁️',
    label: 'Quiet',
    category: 'quiet',
    verse: 'He leads me beside quiet waters, he refreshes my soul.',
    verseRef: 'Psalm 23:2–3',
    affirmation: 'I appreciate the calm moments that give my mind space to rest and renew.',
    gentleTone: 'Embrace this calm and peaceful stillness. Let your heart and spirit be gently refreshed.',
    dayCircleBg: 'bg-[#E3EDF5]',
    dayActiveBg: 'bg-[#EDF4F9] text-[#3D2C2C] ring-2 ring-[#AFC7DB] shadow-[0_4px_16px_rgba(140,175,205,0.25)]',
    dayGlow: 'hover:bg-[#EDF4F9] hover:shadow-[0_4px_14px_rgba(140,175,205,0.2)]',
    nightCircleBg: 'bg-[#212C38]',
    nightActiveBg: 'bg-[#2A3747] text-[#EDE5DB] ring-2 ring-[#526D8C] shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
    nightGlow: 'hover:bg-[#273444]'
  },
  {
    type: 'energetic',
    score: 8,
    emoji: '☀️',
    label: 'Warm',
    category: 'warm',
    verse: 'The Lord make his face shine on you and be gracious to you; the Lord turn his face toward you and give you peace.',
    verseRef: 'Numbers 6:25–26',
    affirmation: 'I carry quiet confidence and gratitude into my day, spreading warmth to those around me.',
    gentleTone: 'May this uplifting warmth carry through your day and brighten everyone around you.',
    dayCircleBg: 'bg-[#FAE8D4]',
    dayActiveBg: 'bg-[#FCF0E2] text-[#3D2C2C] ring-2 ring-[#DFC0A0] shadow-[0_4px_16px_rgba(220,165,110,0.25)]',
    dayGlow: 'hover:bg-[#FCF0E2] hover:shadow-[0_4px_14px_rgba(220,165,110,0.2)]',
    nightCircleBg: 'bg-[#382A1B]',
    nightActiveBg: 'bg-[#473420] text-[#EDE5DB] ring-2 ring-[#916B3E] shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
    nightGlow: 'hover:bg-[#402F1D]'
  },
  {
    type: 'energetic',
    score: 10,
    emoji: '✨',
    label: 'Joyful',
    category: 'joyful',
    verse: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope.',
    verseRef: 'Romans 15:13',
    affirmation: 'I celebrate the joy in my heart today and cherish this positive energy.',
    gentleTone: 'Hold onto this radiant joy and let your heart overflow with light and gratitude.',
    dayCircleBg: 'bg-[#F8E3E3]',
    dayActiveBg: 'bg-[#FAECEC] text-[#3D2C2C] ring-2 ring-[#DEAEAE] shadow-[0_4px_16px_rgba(220,140,140,0.25)]',
    dayGlow: 'hover:bg-[#FAECEC] hover:shadow-[0_4px_14px_rgba(220,140,140,0.2)]',
    nightCircleBg: 'bg-[#3A2222]',
    nightActiveBg: 'bg-[#4B2929] text-[#EDE5DB] ring-2 ring-[#964C4C] shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
    nightGlow: 'hover:bg-[#432525]'
  }
];

const DAILY_BIBLE_VERSES = [
  {
    verse: "Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.",
    ref: "Isaiah 41:10"
  },
  {
    verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    ref: "Psalm 34:18"
  },
  {
    verse: "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.",
    ref: "Jeremiah 29:11"
  },
  {
    verse: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    ref: "John 14:27"
  },
  {
    verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    ref: "Joshua 1:9"
  }
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  moodLogs,
  isDarkMode = false,
  onAddMoodLog,
  onOpenCompanionRoom,
  onOpenAbout,
  onCrisisTriggered,
  preferredName,
  onChangePreferredName,
  academicClusterId,
  onChangeAcademicCluster,
  stressLevel,
  onChangeStressLevel
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const latestTodayLog = moodLogs.find(l => l.studentId === currentUser.id && l.date === todayStr);

  // Mobile tab navigation state (only used on small screens)
  const [activeTab, setActiveTab] = useState<MobileTabId>('overview');

  // Personalization panel state
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState<boolean>(false);

  // Used for greeting personalization
  const displayName = (preferredName || currentUser.name.split(' ')[0]).trim();
  const clusterLabel = getClusterById(academicClusterId)?.shortLabel || '';

  // Student Inspiration Preference: default to 'affirmations' (pre-selected)
  const [inspirationSource, setInspirationSource] = useState<InspirationSource>(() => {
    const saved = localStorage.getItem(`c3-inspiration-${currentUser.id}`) || localStorage.getItem('c3-inspiration-source');
    return (saved as InspirationSource) || 'affirmations';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [checkInRiskTier, setCheckInRiskTier] = useState<RiskTier | null>(null);

  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(() => {
    if (latestTodayLog) {
      const match = MOOD_OPTIONS.find(m => m.type === latestTodayLog.moodType && m.score === latestTodayLog.moodScore);
      return match || MOOD_OPTIONS[2];
    }
    return null;
  });

  const [noteText, setNoteText] = useState<string>(latestTodayLog?.note || '');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);

  const handleUpdateInspirationSource = (source: InspirationSource) => {
    setInspirationSource(source);
    localStorage.setItem(`c3-inspiration-${currentUser.id}`, source);
    localStorage.setItem('c3-inspiration-source', source);
  };

  // Daily encouragement scripture or secular wisdom
  const dailyIndex = new Date().getDate() % DAILY_BIBLE_VERSES.length;
  const currentDailyVerse = DAILY_BIBLE_VERSES[dailyIndex];
  const currentDailyWisdom = SECULAR_DAILY_WISDOM[dailyIndex % SECULAR_DAILY_WISDOM.length];

  // Determine time-of-day greeting
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { text: `Good morning, ${displayName}`, icon: '🌱', badge: 'Morning Calm' };
    }
    if (hour < 18) {
      return { text: `Good afternoon, ${displayName}`, icon: '☀️', badge: 'Afternoon Breath' };
    }
    return { text: `Good evening, ${displayName}`, icon: '🌙', badge: 'Evening Peace' };
  };

  const greeting = getGreetingData();

  const handleSelectMood = (option: MoodOption) => {
    setSelectedMood(option);

    // If heavy, check if there are 3 consecutive heavy logs (Tier 2 trend)
    const recentLogs = moodLogs.filter(l => l.studentId === currentUser.id).slice(-3);
    const isConsecutiveHeavy = option.category === 'heavy' && recentLogs.length >= 2 && recentLogs.every(l => l.moodScore <= 4);

    if (isConsecutiveHeavy) {
      setCheckInRiskTier(2);
    } else if (option.category === 'heavy') {
      setCheckInRiskTier(1);
    } else {
      setCheckInRiskTier(null);
    }

    onAddMoodLog({
      studentId: currentUser.id,
      studentName: currentUser.name,
      date: todayStr,
      moodType: option.type,
      moodScore: option.score,
      note: noteText || (inspirationSource === 'affirmations' ? option.affirmation : option.label),
      factors: ['Daily Reflection', option.verseRef]
    });
  };

  const handleSaveNote = () => {
    if (!selectedMood) return;

    // Check risk tier in note text
    const riskCheck = classifyRisk(noteText);
    if (riskCheck) {
      if (riskCheck.tier === 3) {
        if (onCrisisTriggered) onCrisisTriggered(true);
      } else {
        setCheckInRiskTier(riskCheck.tier);
      }
    }

    onAddMoodLog({
      studentId: currentUser.id,
      studentName: currentUser.name,
      date: todayStr,
      moodType: selectedMood.type,
      moodScore: selectedMood.score,
      note: noteText,
      factors: ['Personal Note', selectedMood.verseRef]
    });
    setShowNoteInput(false);
  };

  const getRecommendedCompanionId = (mood: MoodOption | null): CompanionId | null => {
    if (!mood) return null;
    if (mood.category === 'heavy' || mood.category === 'restless' || mood.label === 'Heavy' || mood.label === 'Restless') {
      return 'casti';
    }
    if (mood.category === 'quiet' || mood.label === 'Quiet') {
      return 'cali';
    }
    if (mood.category === 'warm' || mood.category === 'joyful' || mood.label === 'Warm' || mood.label === 'Joyful') {
      return 'cedi';
    }
    return null;
  };

  const recommendedCompanionId = getRecommendedCompanionId(selectedMood);

  const companionsList = [
    {
      id: 'casti' as CompanionId,
      name: 'Casti',
      role: 'Gentle Peer Supporter',
      icon: '☁️',
      tagline: 'Empathic & Grounding',
      description: 'A safe, grounded space with wellness tips for when you feel heavy.',
      cardBg: isDarkMode
        ? 'bg-gradient-to-b from-[#1F1B2B] to-[#191523] border-[#382E4F] shadow-[0_6px_28px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_38px_rgba(75,55,115,0.35)]'
        : 'bg-gradient-to-b from-[#F5F0FA] to-[#EDE4F7] border-[#E4D7F2] shadow-[0_6px_28px_rgba(160,130,200,0.08)] hover:shadow-[0_16px_38px_rgba(150,120,195,0.18)]',
      avatarRing: isDarkMode ? 'bg-[#2D2440] text-[#D8C7F0] ring-4 ring-[#3D3057]' : 'bg-white text-[#6E5496] ring-4 ring-[#EADBFA]',
      accentColor: isDarkMode ? 'text-[#BCA3E6]' : 'text-[#7D5EAA]',
      buttonColor: isDarkMode
        ? 'bg-[#6A4D94] hover:bg-[#5C4182] text-white shadow-[0_4px_14px_rgba(106,77,148,0.3)]'
        : 'bg-[#8A67B8] hover:bg-[#7854A6] text-white shadow-[0_4px_14px_rgba(138,103,184,0.25)]',
      badgeClass: isDarkMode
        ? 'bg-[#2E2240] text-[#D8C7F0] border-[#533D73]'
        : 'bg-[#F3EBF9] text-[#7D5EAA] border-[#E2D1F3]',
    },
    {
      id: 'cedi' as CompanionId,
      name: 'Cedi',
      role: 'Reflective & Creative Companion',
      icon: '☀️',
      tagline: 'Reframe, Write & Create',
      description: 'Helps you reframe tough thoughts, write it out, and find fresh solutions.',
      cardBg: isDarkMode
        ? 'bg-gradient-to-b from-[#2E2017] to-[#241810] border-[#4E3524] shadow-[0_6px_28px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_38px_rgba(115,75,40,0.35)]'
        : 'bg-gradient-to-b from-[#FDF3EB] to-[#FAECE0] border-[#F5DCBE] shadow-[0_6px_28px_rgba(220,145,85,0.08)] hover:shadow-[0_16px_38px_rgba(215,135,70,0.18)]',
      avatarRing: isDarkMode ? 'bg-[#3D281C] text-[#F5C79E] ring-4 ring-[#573926]' : 'bg-white text-[#B5783A] ring-4 ring-[#FCE5CF]',
      accentColor: isDarkMode ? 'text-[#E8AF7D]' : 'text-[#BF7B36]',
      buttonColor: isDarkMode
        ? 'bg-[#B07238] hover:bg-[#9C622D] text-white shadow-[0_4px_14px_rgba(176,114,56,0.3)]'
        : 'bg-[#D68B45] hover:bg-[#C27832] text-white shadow-[0_4px_14px_rgba(214,139,69,0.25)]',
      badgeClass: isDarkMode
        ? 'bg-[#3B271A] text-[#F5C79E] border-[#5C3C24]'
        : 'bg-[#FDF1E6] text-[#BF7B36] border-[#F8DCBE]',
    },
    {
      id: 'cali' as CompanionId,
      name: 'Cali',
      role: 'Academic & Action Guide',
      icon: '🌿',
      tagline: 'Structured & Practical',
      description: 'Turns exam pressure and deadlines into a clear, doable study plan.',
      cardBg: isDarkMode
        ? 'bg-gradient-to-b from-[#1A261D] to-[#141F17] border-[#2B4232] shadow-[0_6px_28px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_38px_rgba(45,85,55,0.35)]'
        : 'bg-gradient-to-b from-[#EFF6F0] to-[#E3EFE5] border-[#D3E7D6] shadow-[0_6px_28px_rgba(100,170,120,0.08)] hover:shadow-[0_16px_38px_rgba(90,160,110,0.18)]',
      avatarRing: isDarkMode ? 'bg-[#233527] text-[#A6DCB1] ring-4 ring-[#314D37]' : 'bg-white text-[#4A855A] ring-4 ring-[#D8EDE0]',
      accentColor: isDarkMode ? 'text-[#96D1A2]' : 'text-[#4F8C60]',
      buttonColor: isDarkMode
        ? 'bg-[#4B855B] hover:bg-[#3F724D] text-white shadow-[0_4px_14px_rgba(75,133,91,0.3)]'
        : 'bg-[#619E72] hover:bg-[#508B60] text-white shadow-[0_4px_14px_rgba(97,158,114,0.25)]',
      badgeClass: isDarkMode
        ? 'bg-[#1E3022] text-[#A6DCB1] border-[#2F4E36]'
        : 'bg-[#EAF5EC] text-[#4A855A] border-[#D0EADB]',
    }
  ];

  return (
    <div className={`max-w-4xl mx-auto pt-16 sm:pt-20 pb-28 md:pb-12 px-4 space-y-10 sm:space-y-14 transition-colors duration-300 ${
      isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'
    }`}>
      
      {/* 1. Warm, Expressive & Friendly Greeting — shown on Overview tab (mobile) or always (desktop) */}
      <section className={`${activeTab === 'overview' ? '' : 'hidden'} md:block text-center space-y-3 pt-2 relative`}>
        {/* Soft decorative badge with settings shortcut */}
        <div className="inline-flex items-center justify-center flex-wrap gap-x-2 gap-y-1 px-3.5 py-1 rounded-full text-xs font-medium backdrop-blur-xs transition-colors border shadow-2xs">
          <span className="text-xs">{greeting.icon}</span>
          <span className={isDarkMode ? 'text-[#C9BAAB]' : 'text-[#7D665B]'}>
            {greeting.badge}
          </span>
          <span className="text-[10px] opacity-40">•</span>
          <span className={`text-[11px] font-normal ${isDarkMode ? 'text-[#9E8F82]' : 'text-[#8C7A7A]'}`}>
            A safe haven for your mind
          </span>
          {clusterLabel && (
            <>
              <span className="text-[10px] opacity-40">•</span>
              <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-[#E8CDAC]' : 'text-amber-700'}`}>
                {clusterLabel}
              </span>
            </>
          )}
          <span className="text-[10px] opacity-40">•</span>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center space-x-1 text-amber-600 dark:text-amber-300 hover:underline font-semibold"
            title="Inspiration Settings"
          >
            <Settings className="w-3 h-3" />
            <span>{inspirationSource === 'affirmations' ? 'Affirmations' : 'Scripture'}</span>
          </button>
        </div>

        {/* Big expressive greeting heading */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight flex items-center justify-center gap-2 flex-wrap">
          <span>{greeting.text}</span>
          <span className="inline-block transform hover:rotate-12 hover:scale-110 transition-transform duration-300 cursor-default">
            ✨
          </span>
        </h1>

        <p className={`text-sm sm:text-base font-normal max-w-md mx-auto leading-relaxed ${
          isDarkMode ? 'text-[#A89A8D]' : 'text-[#705D5D]'
        }`}>
          Welcome to your quiet space. Take a deep breath, pause for a moment, and be gentle with yourself.
        </p>
      </section>

      {/* 2. Centered Mood Check-In Card (Supports Affirmations vs Scripture) — Overview tab */}
      <section className={`max-w-xl mx-auto space-y-4 ${activeTab === 'overview' ? '' : 'hidden'} md:block`}>
        <div className={`rounded-[36px] p-7 sm:p-10 border transition-all duration-300 text-center space-y-6 hover:-translate-y-1 ${
          isDarkMode
            ? 'bg-[#221D1A]/95 backdrop-blur-md border-[#3B322B] shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.5)]'
            : 'bg-[#FFFDF9]/95 backdrop-blur-md border-[#F2E8DC] shadow-[0_8px_32px_rgba(180,140,110,0.07)] hover:shadow-[0_16px_44px_rgba(180,140,110,0.14)]'
        }`}>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1 text-left">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                How does your heart feel right now?
              </h2>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-[#A39486]' : 'text-[#857070]'}`}>
                There are no wrong answers. Choose whatever feels closest today.
              </p>
            </div>

            {/* Quick Inspiration Source Switcher Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1 hover:scale-105 transition-all text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300 bg-white/50 dark:bg-black/20"
              title="Daily inspiration source settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Emoji Mood Selectors with Soft Colored Circle Backgrounds */}
          <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 py-1">
            {MOOD_OPTIONS.map((opt, idx) => {
              const isSelected = selectedMood?.label === opt.label;
              const activeBg = isDarkMode ? opt.nightActiveBg : opt.dayActiveBg;
              const circleBg = isDarkMode ? opt.nightCircleBg : opt.dayCircleBg;
              const glowClass = isDarkMode ? opt.nightGlow : opt.dayGlow;

              return (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectMood(opt)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ y: isSelected ? -2 : -3, scale: isSelected ? 1.07 : 1.03 }}
                  animate={{
                    scale: isSelected ? 1.06 : 1,
                    y: isSelected ? -2 : 0
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 22,
                    mass: 0.8
                  }}
                  className={`group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl cursor-pointer ${
                    isSelected
                      ? `${activeBg}`
                      : `${glowClass} opacity-85 hover:opacity-100`
                  }`}
                >
                  {/* Soft Colored Circle behind emoji with pop scale animation */}
                  <motion.div
                    animate={{
                      scale: isSelected ? 1.12 : 1
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 480,
                      damping: 18
                    }}
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center mb-1.5 shadow-2xs ${circleBg} ${
                      isSelected ? 'ring-2 ring-current' : 'group-hover:scale-105'
                    }`}
                  >
                    <motion.span
                      animate={{
                        scale: isSelected ? 1.15 : 1,
                        rotate: isSelected ? [0, -6, 6, 0] : 0
                      }}
                      transition={{
                        scale: {
                          type: 'spring',
                          stiffness: 500,
                          damping: 14,
                          mass: 0.7
                        },
                        rotate: {
                          duration: 0.35,
                          ease: 'easeInOut'
                        }
                      }}
                      className="text-2xl sm:text-3xl filter drop-shadow-xs inline-block"
                    >
                      {opt.emoji}
                    </motion.span>
                  </motion.div>

                  <span className="text-[11px] sm:text-xs font-semibold tracking-wide">
                    {opt.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Optional Quiet Reflection Note Input */}
          <AnimatePresence>
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="pt-2"
              >
                {!showNoteInput ? (
                  <button
                    type="button"
                    onClick={() => setShowNoteInput(true)}
                    className={`text-xs font-medium transition-colors underline underline-offset-4 cursor-pointer ${
                      isDarkMode
                        ? 'text-[#B8A796] hover:text-[#EDE5DB] decoration-[#4D4136]'
                        : 'text-[#967777] hover:text-[#5E4040] decoration-[#DECFC5]'
                    }`}
                  >
                    {noteText ? 'Edit quiet reflection note' : '+ Add a quiet reflection note (optional)'}
                  </button>
                ) : (
                  <div className="space-y-2.5 pt-1 max-w-md mx-auto">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="What is on your heart today? (optional)"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-[#1C1815] border-[#3D332F] text-[#EDE5DB] placeholder-[#786D63] focus:ring-1 focus:ring-[#8C7662]'
                          : 'bg-white border-[#E8DDD0] text-[#3D2C2C] placeholder-[#A69797] focus:ring-1 focus:ring-[#C9B39F]'
                      }`}
                    />
                    <div className="flex justify-center space-x-2">
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'bg-[#3D332A] hover:bg-[#4D4035] text-[#EDE5DB]'
                            : 'bg-[#EDE3D6] hover:bg-[#E2D6C7] text-[#3D2C2C]'
                        }`}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNoteInput(false)}
                        className={`px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                          isDarkMode ? 'text-[#A39486] hover:text-[#EDE5DB]' : 'text-[#8C7A7A] hover:text-[#3D2C2C]'
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Inline Tiered Resource Card if Tier 1 or Tier 2 detected from check-in or note */}
        {checkInRiskTier && (
          <div className="pt-2">
            <TieredResourceCard
              tier={checkInRiskTier}
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              triggerContext={noteText || `Mood check-in: ${selectedMood?.label}`}
              onDismissTier2Prompt={() => setCheckInRiskTier(null)}
              onConnectGuidance={() => setCheckInRiskTier(null)}
            />
          </div>
        )}
      </section>

      {/* 3. Daily Inspiration / Scripture Card (Standalone explore widget) — Inspiration tab */}
      <section className={`max-w-xl mx-auto ${activeTab === 'inspiration' ? '' : 'hidden'} md:block`}>
        <DailyInspirationCard
          inspirationSource={inspirationSource}
          currentMood={selectedMood?.category || 'quiet'}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isDarkMode={isDarkMode}
        />
        {/* On mobile, add a hint to set track/stress from here too */}
        <div className="md:hidden mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsPersonalizationOpen(true)}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors border cursor-pointer ${
              isDarkMode
                ? 'bg-[#221B17] text-[#E8CDAC] border-[#3D332B]'
                : 'bg-white text-amber-700 border-[#ECDCC6]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tailor this to my track</span>
          </button>
        </div>
      </section>

      {/* 4. Three Pastel Tinted AI Companion Cards — Companions tab */}
      <section className={`space-y-5 ${activeTab === 'companions' ? '' : 'hidden'} md:block`}>
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Gentle Companions
          </h2>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-[#A39486]' : 'text-[#857070]'}`}>
            Choose a comforting presence to share a quiet moment with
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {companionsList.map((companion) => {
            const isRecommended = recommendedCompanionId === companion.id;
            return (
              <div
                key={companion.id}
                className={`relative group ${companion.cardBg} rounded-[32px] p-7 sm:p-8 border transition-all duration-300 flex flex-col justify-between space-y-6 hover:-translate-y-1.5`}
              >
                {/* Subtle Recommended Badge */}
                <AnimatePresence>
                  {isRecommended && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10"
                    >
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-2xs ${companion.badgeClass}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>Suggested for you</span>
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4 text-center">
                  {/* Centered Character Icon Frame */}
                  <div className="flex justify-center pt-1">
                    <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-[24px] flex items-center justify-center text-3xl sm:text-4xl shadow-md transition-transform duration-300 group-hover:scale-110 ${companion.avatarRing}`}>
                      {companion.icon}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {companion.name}
                    </h3>
                    <p className={`text-xs font-semibold ${companion.accentColor}`}>
                      {companion.role}
                    </p>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed font-normal ${
                    isDarkMode ? 'text-[#B8AA9B]' : 'text-[#695555]'
                  }`}>
                    {companion.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenCompanionRoom(companion.id)}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${companion.buttonColor}`}
                >
                  <span>Spend time with {companion.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Gentle Daily Encouragement Footer (Scripture or Secular Affirmation) — Resources tab */}
      <section className={`${activeTab === 'resources' ? '' : 'hidden'} md:contents space-y-8`}>
        {/* Quick wellness resource chips (mobile Resources tab) */}
        <div className="md:hidden max-w-xl mx-auto space-y-4 pt-2">
          <h2 className="text-xl font-bold tracking-tight text-center">Resources &amp; Support</h2>
          <p className={`text-xs text-center ${isDarkMode ? 'text-[#A39486]' : 'text-[#857070]'}`}>
            A few gentle things to reach for when you need them.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onCrisisTriggered?.(false)}
              className={`p-4 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                isDarkMode ? 'bg-[#2A1D1D] border-rose-900/50' : 'bg-[#FDF3F3] border-rose-200/80'
              }`}
            >
              <span className="text-2xl">🆘</span>
              <p className="text-xs font-bold mt-2">24/7 Crisis Support</p>
              <p className={`text-[11px] mt-0.5 leading-snug ${isDarkMode ? 'text-[#D8B9B4]' : 'text-[#A66363]'}`}>
                Tap for hotlines &amp; guidance
              </p>
            </button>
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#1A261D] border-emerald-900/40' : 'bg-[#EFF6F0] border-emerald-200/70'
            }`}>
              <span className="text-2xl">🌿</span>
              <p className="text-xs font-bold mt-2">5-4-3-2-1 Grounding</p>
              <p className={`text-[11px] mt-0.5 leading-snug ${isDarkMode ? 'text-[#A6C9B0]' : 'text-[#4F8C60]'}`}>
                Notice 5 things you see, 4 you touch...
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCrisisTriggered?.(false)}
              className={`p-4 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                isDarkMode ? 'bg-[#24303c] border-sky-900/40' : 'bg-[#E3EDF5] border-sky-200/70'
              }`}
            >
              <span className="text-2xl">🧘</span>
              <p className="text-xs font-bold mt-2">Calm Breathing</p>
              <p className={`text-[11px] mt-0.5 leading-snug ${isDarkMode ? 'text-[#A9C6DB]' : 'text-[#4A7B99]'}`}>
                A 12-second reset exercise
              </p>
            </button>
            <button
              type="button"
              onClick={() => setIsPersonalizationOpen(true)}
              className={`p-4 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                isDarkMode ? 'bg-[#2E1F16] border-amber-900/40' : 'bg-[#FDF3EB] border-amber-200/70'
              }`}
            >
              <span className="text-2xl">🎯</span>
              <p className="text-xs font-bold mt-2">Personalize</p>
              <p className={`text-[11px] mt-0.5 leading-snug ${isDarkMode ? 'text-[#E5C49E]' : 'text-[#BF7B36]'}`}>
                Set your track &amp; stress level
              </p>
            </button>
          </div>
        </div>

        <footer className={`text-center pt-8 pb-4 border-t ${
          isDarkMode ? 'border-[#332B25]' : 'border-[#EBE2D5]'
        }`}>
        <p className={`text-xs sm:text-sm font-medium max-w-lg mx-auto leading-relaxed ${
          isDarkMode ? 'text-[#B0A294]' : 'text-[#7D6868]'
        }`}>
          "{inspirationSource === 'affirmations' ? currentDailyWisdom.quote : currentDailyVerse.verse}"
        </p>
        <p className={`text-[11px] mt-1.5 font-semibold tracking-wide ${
          isDarkMode ? 'text-[#8C7B6E]' : 'text-[#967C7C]'
        }`}>
          — {inspirationSource === 'affirmations' ? currentDailyWisdom.source : currentDailyVerse.ref}
        </p>

        {onOpenAbout && (
          <button
            type="button"
            onClick={onOpenAbout}
            className={`mt-6 inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer backdrop-blur-xs border shadow-2xs hover:-translate-y-0.5 ${
              isDarkMode
                ? 'text-[#C9BAAB] bg-[#201B17]/60 border-[#3A322B] hover:bg-[#2A231D] hover:border-[#4A4037]'
                : 'text-[#7D665B] bg-white/70 border-[#EFE5D8] hover:bg-white hover:border-[#E0D4C4]'
            }`}
          >
            <span>✦</span>
            <span>About the Research Team</span>
          </button>
        )}
        </footer>
      </section>

      {/* Personalization Panel */}
      <PersonalizationPanel
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        isDarkMode={isDarkMode}
        academicClusterId={academicClusterId}
        onChangeAcademicCluster={onChangeAcademicCluster}
        stressLevel={stressLevel}
        onChangeStressLevel={onChangeStressLevel}
        inspirationSource={inspirationSource}
        onChangeInspirationSource={handleUpdateInspirationSource}
        preferredName={preferredName}
        onChangePreferredName={onChangePreferredName}
      />

      {/* Settings Modal */}
      <InspirationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        inspirationSource={inspirationSource}
        onChangeInspirationSource={handleUpdateInspirationSource}
        isDarkMode={isDarkMode}
      />

      {/* Mobile Bottom Tab Bar (md:hidden) */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDarkMode={isDarkMode}
        onOpenPersonalization={() => setIsPersonalizationOpen(true)}
      />

    </div>
  );
};
