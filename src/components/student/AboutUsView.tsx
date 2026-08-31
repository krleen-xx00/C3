import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HeartHandshake,
  ShieldAlert,
  Brain,
  Wind,
  Smile,
  MessageSquareHeart,
  Users,
  GraduationCap,
  School,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CabiaoLogo } from '../CabiaoLogo';

interface AboutUsViewProps {
  isDarkMode?: boolean;
  onBackToDashboard: () => void;
}

const TABS = [
  { id: 'overview', number: '01', title: 'Overview', label: '01. Overview' },
  { id: 'problem-purpose', number: '02', title: 'Problem & Purpose', label: '02. Problem & Purpose' },
  { id: 'core-features', number: '03', title: 'Core Features', label: '03. Core Features' },
  { id: 'how-it-works', number: '04', title: 'How It Works', label: '04. How It Works' },
  { id: 'target-users-goal', number: '05', title: 'Target Users & Goal', label: '05. Target Users & Goal' },
  { id: 'proponents-notice', number: '06', title: 'Proponents & Notice', label: '06. Proponents & Notice' },
];

const PROPONENTS = [
  {
    id: 1,
    name: 'Castor, Ashley L.',
    initials: 'AC',
    role: 'Lead Proponent & Researcher',
    accentColor: 'text-[#7D5EAA] dark:text-[#CDB4EC]',
    bgGlow: 'bg-[#F4EDFA] dark:bg-[#251C33]/60 border-[#E4D5F3] dark:border-[#3F2F57]',
    avatarRing: 'bg-white dark:bg-[#322447] text-[#7D5EAA] dark:text-[#D4BFF2] ring-[#E4D5F3] dark:ring-[#483463]',
  },
  {
    id: 2,
    name: 'Munsayac, Josh Caleb B.',
    initials: 'JM',
    role: 'System Architect & Proponent',
    accentColor: 'text-[#B5783A] dark:text-[#F2C9A3]',
    bgGlow: 'bg-[#FDF3E7] dark:bg-[#2D2117]/60 border-[#F5DCBC] dark:border-[#4D3622]',
    avatarRing: 'bg-white dark:bg-[#3D291B] text-[#B5783A] dark:text-[#F7D2AB] ring-[#F5DCBC] dark:ring-[#5C3F27]',
  },
  {
    id: 3,
    name: 'Hipolito, Jhon Cedrick M.',
    initials: 'JH',
    role: 'UI/UX & Co-Proponent',
    accentColor: 'text-[#3E7D50] dark:text-[#A4DCB0]',
    bgGlow: 'bg-[#EBF7EF] dark:bg-[#1C281F]/60 border-[#D2EBD9] dark:border-[#2E4A35]',
    avatarRing: 'bg-white dark:bg-[#233527] text-[#3E7D50] dark:text-[#B1E7BD] ring-[#D2EBD9] dark:ring-[#375A41]',
  },
];

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  isDarkMode = false,
  onBackToDashboard,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentTab = TABS[activeTabIndex];

  const handleTabChange = (newIndex: number) => {
    if (newIndex === activeTabIndex) return;
    setDirection(newIndex > activeTabIndex ? 1 : -1);
    setActiveTabIndex(newIndex);
  };

  const handleNext = useCallback(() => {
    if (activeTabIndex < TABS.length - 1) {
      setDirection(1);
      setActiveTabIndex(prev => prev + 1);
    }
  }, [activeTabIndex]);

  const handlePrev = useCallback(() => {
    if (activeTabIndex > 0) {
      setDirection(-1);
      setActiveTabIndex(prev => prev - 1);
    }
  }, [activeTabIndex]);

  // Keyboard navigation support for presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (e.key === ' ') e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key >= '1' && e.key <= '6') {
        const index = parseInt(e.key, 10) - 1;
        if (index >= 0 && index < TABS.length) {
          handleTabChange(index);
        }
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onBackToDashboard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen, onBackToDashboard]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 32 },
        opacity: { duration: 0.22 },
        scale: { duration: 0.22 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 32 },
        opacity: { duration: 0.18 },
        scale: { duration: 0.18 },
      },
    }),
  };

  return (
    <div
      id="presentation-container"
      className={`relative w-full min-h-screen md:h-screen flex flex-col justify-between overflow-x-hidden md:overflow-hidden select-none transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#151210] text-[#EDE5DB]'
          : 'bg-[#FAF7F2] text-[#3D2C2C]'
      }`}
    >
      {/* 1. TOP PRESENTATION DECK HEADER */}
      <header
        id="presentation-header"
        className={`w-full z-30 px-3 sm:px-6 pt-14 sm:pt-16 md:pt-3 pb-2.5 sm:py-3 border-b backdrop-blur-md transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#1A1613]/85 border-[#2E2621]'
            : 'bg-white/80 border-[#EFE5D8]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 md:pr-72 lg:pr-80">
          {/* Left: Project Branding & Return Button with Official School Logo */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              id="back-to-dashboard-btn"
              type="button"
              onClick={onBackToDashboard}
              title="Return to Student Dashboard (Esc)"
              className={`group inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer border shadow-2xs ${
                isDarkMode
                  ? 'text-[#D0C0B0] bg-[#221C18] border-[#3D332B] hover:bg-[#2C241F] hover:text-white'
                  : 'text-[#6D5A50] bg-white border-[#E9DFD2] hover:bg-[#F8F3ED] hover:text-[#3D2C2C]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Back to Student</span>
            </button>

            <div className="flex items-center space-x-2.5 pl-2 border-l border-neutral-300 dark:border-neutral-700">
              <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 bg-white dark:bg-[#251E1A] shadow-xs border border-emerald-800/30 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt="Cabiao National Senior High School Seal"
                  className="w-full h-full object-contain rounded-full"
                  draggable={false}
                />
              </div>
              <div className="leading-tight">
                <span className="text-[11px] font-bold tracking-wide uppercase text-emerald-800 dark:text-emerald-400">
                  Project Presentation
                </span>
                <span className={`block text-[11px] font-semibold ${isDarkMode ? 'text-[#C7B7A7]' : 'text-[#5C483C]'}`}>
                  Cabiao National Senior High School
                </span>
              </div>
            </div>
          </div>

          {/* Right: Slide Counter & Presentation Controls */}
          <div className="flex items-center space-x-2">
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                isDarkMode
                  ? 'bg-[#221C18] text-[#F3C592] border-[#443628]'
                  : 'bg-[#FFF8EE] text-[#B8772E] border-[#F2DECA]'
              }`}
            >
              Slide {activeTabIndex + 1} of {TABS.length}
            </div>

            <button
              id="toggle-fullscreen-btn"
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-[#221C18] border-[#3D332B] text-[#B09F8F] hover:text-white'
                  : 'bg-white border-[#E9DFD2] text-[#7D665B] hover:text-[#3D2C2C]'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* TOP TAB NAVIGATION BAR */}
        <div className="max-w-7xl mx-auto mt-2.5">
          <nav
            id="presentation-tabs-nav"
            className={`flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl overflow-x-auto scrollbar-none border ${
              isDarkMode
                ? 'bg-[#15110F] border-[#2B231D]'
                : 'bg-[#F2ECE3] border-[#E8DFC0]/60'
            }`}
            aria-label="Presentation Navigation Tabs"
          >
            {TABS.map((tab, idx) => {
              const isActive = activeTabIndex === idx;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  type="button"
                  onClick={() => handleTabChange(idx)}
                  className={`relative flex-1 min-w-[130px] sm:min-w-0 py-1.5 sm:py-2 px-2.5 rounded-lg text-xs font-bold tracking-tight transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? isDarkMode
                        ? 'bg-[#31251D] text-[#FEDCB2] shadow-sm border border-[#523F30]'
                        : 'bg-white text-[#4A3222] shadow-xs border border-[#E3D6C5]'
                      : isDarkMode
                        ? 'text-[#9A897A] hover:text-[#EDE5DB] hover:bg-[#201A16]'
                        : 'text-[#857264] hover:text-[#3D2C2C] hover:bg-[#EAE2D7]'
                  }`}
                >
                  <span
                    className={`inline-block font-mono text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? isDarkMode
                          ? 'bg-[#483525] text-[#FFD79D]'
                          : 'bg-[#F9EDE0] text-[#B8772E]'
                        : isDarkMode
                          ? 'bg-[#231C18] text-[#7C6E61]'
                          : 'bg-[#E3D8CC] text-[#7C695A]'
                    }`}
                  >
                    {tab.number}
                  </span>
                  <span className="truncate">{tab.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 2. MAIN SLIDE PRESENTATION STAGE */}
      <main
        id="presentation-stage"
        className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col justify-center relative overflow-hidden"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentTab.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full flex flex-col justify-center"
          >
            {/* ========================================================= */}
            {/* TAB 01: OVERVIEW */}
            {/* ========================================================= */}
            {currentTab.id === 'overview' && (
              <div className="w-full max-w-5xl mx-auto flex flex-col justify-center space-y-4 sm:space-y-6">
                {/* Header Card with Real School Seal */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-lg backdrop-blur-md text-center transition-all ${
                    isDarkMode
                      ? 'bg-gradient-to-b from-[#241C16] to-[#1C1612] border-[#3D3025] shadow-black/40'
                      : 'bg-gradient-to-b from-white to-[#FDF8F2] border-[#EFE3D5] shadow-[#E8DACB]/50'
                  }`}
                >
                  {/* School Seal & Badge Header */}
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-white dark:bg-[#2B231D] shadow-md border-2 border-emerald-700/40 dark:border-emerald-500/40 flex items-center justify-center shrink-0">
                      <img
src="/logo.png"
                        alt="Cabiao National Senior High School Seal"
                        className="w-full h-full object-contain rounded-full select-none"
                        draggable={false}
                      />
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <Sparkles className="w-3 h-3" />
                        <span>Senior High School Research Project</span>
                      </div>
                      <div className={`text-xs font-semibold mt-0.5 ${isDarkMode ? 'text-[#D0C0B0]' : 'text-[#634E41]'}`}>
                        Cabiao National Senior High School
                      </div>
                    </div>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2">
                    About C3 – AI Companion
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-amber-700 dark:text-amber-400 tracking-tight mb-5">
                    Your Digital Companion for Student Well-Being
                  </p>

                  <div className="max-w-3xl mx-auto space-y-4 text-base sm:text-lg leading-relaxed font-normal text-left sm:text-center">
                    <p className={`p-4 rounded-2xl border ${
                      isDarkMode ? 'bg-[#181310]/80 border-[#332820] text-[#E0D4C5]' : 'bg-[#FAF5EF] border-[#EBE0D2] text-[#4A3931]'
                    }`}>
                      <span className="font-semibold text-amber-700 dark:text-amber-400">&ldquo;C3 – AI Companion&rdquo;</span> is a web-based student support system designed to help students pause, reflect on their emotions, and access supportive AI companions in a private and approachable digital space.
                    </p>
                    <p className={`p-4 rounded-2xl border ${
                      isDarkMode ? 'bg-[#181310]/80 border-[#332820] text-[#D4C6B7]' : 'bg-[#FAF5EF] border-[#EBE0D2] text-[#554238]'
                    }`}>
                      Developed as a research project for Cabiao Senior High School, C3 explores how an AI companion can support students&apos; emotional well-being while complementing the school&apos;s existing guidance services.
                    </p>
                  </div>
                </div>

                {/* Quick Highlights Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 rounded-2xl border flex items-center space-x-3 ${
                    isDarkMode ? 'bg-[#1E1814]/70 border-[#332921]' : 'bg-white/90 border-[#EFE3D5]'
                  }`}>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                      <MessageSquareHeart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Empathetic AI</div>
                      <div className={`text-xs ${isDarkMode ? 'text-[#A8988A]' : 'text-[#7D6B5E]'}`}>3 Distinct Personalities</div>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border flex items-center space-x-3 ${
                    isDarkMode ? 'bg-[#1E1814]/70 border-[#332921]' : 'bg-white/90 border-[#EFE3D5]'
                  }`}>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">School-Grounded</div>
                      <div className={`text-xs ${isDarkMode ? 'text-[#A8988A]' : 'text-[#7D6B5E]'}`}>Cabiao SHS Guidance Synergy</div>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border flex items-center space-x-3 ${
                    isDarkMode ? 'bg-[#1E1814]/70 border-[#332921]' : 'bg-white/90 border-[#EFE3D5]'
                  }`}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Always-On Care</div>
                      <div className={`text-xs ${isDarkMode ? 'text-[#A8988A]' : 'text-[#7D6B5E]'}`}>Crisis Protocol Integration</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 02: PROBLEM & PURPOSE */}
            {/* ========================================================= */}
            {currentTab.id === 'problem-purpose' && (
              <div className="w-full max-w-5xl mx-auto space-y-4">
                <div className="text-center mb-1">
                  <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1.5">
                    Background & Motivation
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                    Why C3 Was Created
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left: The Challenge / Problem */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border shadow-md flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-gradient-to-b from-[#2A1B1A] to-[#1E1413] border-[#4A2E2C]'
                        : 'bg-gradient-to-b from-white to-[#FDF2F0] border-[#F5D5CF]'
                    }`}
                  >
                    <div>
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4 bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>The Student Reality</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-rose-800 dark:text-rose-300">
                        Challenges Faced by Students
                      </h3>
                      <p className="text-base sm:text-lg leading-relaxed">
                        Students may experience academic pressure, personal challenges, and social pressures that can affect their emotional well-being. Some students may also feel uncomfortable seeking face-to-face support when they need someone to talk to.
                      </p>
                    </div>

                    <div className={`mt-6 pt-4 border-t flex items-center space-x-3 ${isDarkMode ? 'border-[#3D2523] text-[#A88E8B]' : 'border-[#F2CBC4] text-[#8C6D68]'}`}>
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 font-bold">
                        !
                      </div>
                      <span className="text-xs font-medium">Overcoming barriers to mental wellness accessibility.</span>
                    </div>
                  </div>

                  {/* Right: The Purpose / Digital Safe Space */}
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border shadow-md flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-gradient-to-b from-[#1C261E] to-[#141C16] border-[#2D4533]'
                        : 'bg-gradient-to-b from-white to-[#F0F8F3] border-[#CDE5D5]'
                    }`}
                  >
                    <div>
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>The Purpose of C3</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-emerald-800 dark:text-emerald-300">
                        A Private, Safe Space for Reflection
                      </h3>
                      <p className="text-base sm:text-lg leading-relaxed">
                        C3 provides an additional digital space where students can check in with their emotions, express their thoughts, reflect, and access supportive guidance.
                      </p>
                    </div>

                    <div className={`mt-6 pt-4 border-t flex items-center space-x-3 ${isDarkMode ? 'border-[#233829] text-[#8BA892]' : 'border-[#C2E0CC] text-[#5D8067]'}`}>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓
                      </div>
                      <span className="text-xs font-medium">Private, non-judgmental, and always within reach.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 03: CORE FEATURES */}
            {/* ========================================================= */}
            {currentTab.id === 'core-features' && (
              <div className="w-full max-w-6xl mx-auto flex flex-col justify-center space-y-3 sm:space-y-4">
                <div className="text-center">
                  <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1">
                    System Architecture
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    What Can C3 Do?
                  </h2>
                </div>

                {/* 3 AI Companions Showcase Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
                  {/* Casti */}
                  <div
                    className={`p-4 sm:p-4.5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-[#251C33]/60 border-[#3F2F57]'
                        : 'bg-gradient-to-b from-white to-[#F4EDFA] border-[#E4D5F3]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          AI Companion 1
                        </span>
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                          CA
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-200 mb-1.5">
                        Casti – Gentle Peer Supporter
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-[#D0C2E0]' : 'text-[#5C4573]'}`}>
                        Provides a calm and comforting space where students can share their thoughts and feelings.
                      </p>
                    </div>
                  </div>

                  {/* Cedi */}
                  <div
                    className={`p-4 sm:p-4.5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-[#2D2117]/60 border-[#4D3622]'
                        : 'bg-gradient-to-b from-white to-[#FDF3E7] border-[#F5DCBC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          AI Companion 2
                        </span>
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                          CE
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200 mb-1.5">
                        Cedi – Reflection & Creative Companion
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-[#E3D3C1]' : 'text-[#735235]'}`}>
                        Helps students reflect on their thoughts, express ideas, and explore different perspectives.
                      </p>
                    </div>
                  </div>

                  {/* Cali */}
                  <div
                    className={`p-4 sm:p-4.5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-[#1C281F]/60 border-[#2E4A35]'
                        : 'bg-gradient-to-b from-white to-[#EBF7EF] border-[#D2EBD9]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          AI Companion 3
                        </span>
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          CL
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-200 mb-1.5">
                        Cali – Academic & Action Guide
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-[#C5DCBF]' : 'text-[#3E6347]'}`}>
                        Helps students manage academic concerns and turn pressure, tasks, and deadlines into more manageable actions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Core Modalities 4-Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Emotional Check-In */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#1E1814]/80 border-[#332820]' : 'bg-white border-[#EAE0D3]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                        <Smile className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm leading-tight">Emotional Check-In</h4>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#B8A89A]' : 'text-[#6E5A4E]'}`}>
                      C3 allows students to reflect on how they currently feel by selecting an emotional state such as Heavy, Restless, Quiet, Warm, or Joyful.
                    </p>
                  </div>

                  {/* Daily Affirmations */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#1E1814]/80 border-[#332820]' : 'bg-white border-[#EAE0D3]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm leading-tight">Daily Affirmations</h4>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#B8A89A]' : 'text-[#6E5A4E]'}`}>
                      C3 provides daily affirmations and reflection prompts that encourage students to pause, reflect, and practice positive self-awareness.
                    </p>
                  </div>

                  {/* Breathing & Quiet Moments */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#1E1814]/80 border-[#332820]' : 'bg-white border-[#EAE0D3]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <Wind className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm leading-tight">Breathing & Quiet Moments</h4>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#B8A89A]' : 'text-[#6E5A4E]'}`}>
                      C3 provides simple calming activities, including breathing exercises, that students can use when they need a short moment to pause and reset.
                    </p>
                  </div>

                  {/* Crisis Support */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#1E1814]/80 border-[#332820]' : 'bg-white border-[#EAE0D3]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm leading-tight text-rose-700 dark:text-rose-400">Crisis Support</h4>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#B8A89A]' : 'text-[#6E5A4E]'}`}>
                      C3 provides access to crisis-support information for situations that may require additional assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 04: HOW IT WORKS */}
            {/* ========================================================= */}
            {currentTab.id === 'how-it-works' && (
              <div className="w-full max-w-5xl mx-auto flex flex-col justify-center space-y-5 sm:space-y-7">
                <div className="text-center">
                  <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1.5">
                    User Journey
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                    How C3 Works
                  </h2>
                </div>

                {/* 4-Step Horizontal Pipeline / Flowchart Graphic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative">
                  {/* Step 1 */}
                  <div
                    className={`relative p-5 rounded-3xl border shadow-md flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-gradient-to-b from-[#241C16] to-[#1C1612] border-[#3D3025]'
                        : 'bg-gradient-to-b from-white to-[#FDF8F2] border-[#EFE3D5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          1
                        </span>
                        <Smile className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-amber-800 dark:text-amber-300">
                        1. Check In
                      </h3>
                      <p className="text-sm leading-relaxed">
                        Select how you currently feel.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-amber-500/15 text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center space-x-1">
                      <span>Step 1: Mood Selection</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`relative p-5 rounded-3xl border shadow-md flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-gradient-to-b from-[#241C16] to-[#1C1612] border-[#3D3025]'
                        : 'bg-gradient-to-b from-white to-[#FDF8F2] border-[#EFE3D5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          2
                        </span>
                        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-purple-800 dark:text-purple-300">
                        2. Choose a Companion
                      </h3>
                      <p className="text-sm leading-relaxed">
                        Choose Casti, Cedi, or Cali depending on the type of support you need.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-purple-500/15 text-[11px] font-semibold text-purple-700 dark:text-purple-400 flex items-center space-x-1">
                      <span>Step 2: AI Companion</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`relative p-5 rounded-3xl border shadow-md flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-gradient-to-b from-[#241C16] to-[#1C1612] border-[#3D3025]'
                        : 'bg-gradient-to-b from-white to-[#FDF8F2] border-[#EFE3D5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-8 h-8 rounded-full bg-cyan-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          3
                        </span>
                        <MessageSquareHeart className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-cyan-800 dark:text-cyan-300">
                        3. Reflect & Interact
                      </h3>
                      <p className="text-sm leading-relaxed">
                        Talk with your chosen AI companion, express your thoughts, or use available reflection and calming activities.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-cyan-500/15 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 flex items-center space-x-1">
                      <span>Step 3: Dialogue & Calm</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div
                    className={`relative p-5 rounded-3xl border shadow-md flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-gradient-to-b from-[#241C16] to-[#1C1612] border-[#3D3025]'
                        : 'bg-gradient-to-b from-white to-[#FDF8F2] border-[#EFE3D5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          4
                        </span>
                        <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-emerald-800 dark:text-emerald-300">
                        4. Access Support
                      </h3>
                      <p className="text-sm leading-relaxed">
                        Explore available support resources or crisis-support options when additional assistance is needed.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-500/15 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                      <span>Step 4: Resources & Safety</span>
                      <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 05: TARGET USERS & GOAL */}
            {/* ========================================================= */}
            {currentTab.id === 'target-users-goal' && (
              <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-5">
                <div className="text-center">
                  <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1.5">
                    Beneficiaries & Project Mission
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                    Who Is C3 For? & Our Goal
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Students Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#1E1814]/80 border-[#332820]' : 'bg-white border-[#EAE0D3]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Students</h3>
                      </div>
                      <p className="text-base leading-relaxed">
                        C3 is primarily designed for students of Cabiao Senior High School, providing an accessible digital space for emotional reflection and support.
                      </p>
                    </div>
                  </div>

                  {/* Guidance Personnel Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                      isDarkMode ? 'bg-[#1E1814]/80 border-[#332820]' : 'bg-white border-[#EAE0D3]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Guidance Personnel</h3>
                      </div>
                      <p className="text-base leading-relaxed">
                        C3 is intended to complement the school&apos;s existing guidance services by providing an additional digital support channel.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Our Goal Big Focus Card */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl border shadow-lg relative overflow-hidden ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#2B2017] via-[#241A12] to-[#1D150E] border-[#4A3728]'
                      : 'bg-gradient-to-r from-[#FFF8EE] via-[#FAF2E6] to-[#F5ECE0] border-[#E8D4C0]'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 font-black text-xl">
                      🎯
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-300">
                        Our Goal
                      </h3>
                      <p className="text-base sm:text-lg leading-relaxed font-medium">
                        Our goal is to develop and evaluate an AI Companion System that helps students monitor their emotional well-being and access supportive resources while complementing the existing guidance services of Cabiao Senior High School.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 06: PROPONENTS & NOTICE */}
            {/* ========================================================= */}
            {currentTab.id === 'proponents-notice' && (
              <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-5">
                <div className="text-center">
                  <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1.5">
                    Cabiao Senior High School Research Team
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                    Project Proponents
                  </h2>
                </div>

                {/* 3 Proponent Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                  {PROPONENTS.map((member) => (
                    <div
                      key={member.id}
                      className={`p-5 rounded-3xl border shadow-sm flex flex-col items-center text-center space-y-3 transition-all ${member.bgGlow}`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-base font-black tracking-wide ring-4 ${member.avatarRing} shadow-sm`}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base tracking-tight leading-snug">
                          {member.name}
                        </h3>
                        <p className={`text-xs mt-0.5 font-medium ${member.accentColor}`}>
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Important Notice Callout */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border shadow-md ${
                    isDarkMode
                      ? 'bg-[#1C1615] border-[#422B29] text-[#E0D0CE]'
                      : 'bg-[#FFF5F5] border-[#F5D2CF] text-[#4A2D2A]'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-300">
                        Important Notice:
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed">
                        C3 – AI Companion is a student support and reflection tool. It does not replace professional counselors, psychologists, or other qualified mental-health professionals.
                      </p>
                      <p className="text-xs sm:text-sm leading-relaxed">
                        AI-generated responses are intended for general, non-clinical support and reflection. Students who need additional or urgent assistance should seek help from a trusted adult, school guidance personnel, or appropriate professional services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. BOTTOM SLIDE CONTROL BAR */}
      <footer
        id="presentation-footer"
        className={`w-full z-30 px-3 sm:px-6 py-2.5 sm:py-3 border-t backdrop-blur-md transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#1A1613]/85 border-[#2E2621]'
            : 'bg-white/80 border-[#EFE5D8]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            id="prev-slide-btn"
            type="button"
            onClick={handlePrev}
            disabled={activeTabIndex === 0}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer border ${
              activeTabIndex === 0
                ? 'opacity-30 cursor-not-allowed border-transparent'
                : isDarkMode
                  ? 'bg-[#251E19] text-[#EDE5DB] border-[#3D332B] hover:bg-[#322822]'
                  : 'bg-white text-[#3D2C2C] border-[#E8DFC0] hover:bg-[#FAF5EF]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Progress Indicator Dots */}
          <div className="flex items-center space-x-2">
            {TABS.map((tab, idx) => (
              <button
                key={tab.id}
                id={`dot-btn-${tab.id}`}
                type="button"
                onClick={() => handleTabChange(idx)}
                aria-label={`Go to slide ${tab.number}: ${tab.title}`}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                  activeTabIndex === idx
                    ? isDarkMode
                      ? 'w-7 bg-amber-400'
                      : 'w-7 bg-amber-600'
                    : isDarkMode
                      ? 'w-2 bg-[#44382E] hover:bg-[#635243]'
                      : 'w-2 bg-[#D8C7B5] hover:bg-[#B5A08C]'
                }`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <button
            id="next-slide-btn"
            type="button"
            onClick={handleNext}
            disabled={activeTabIndex === TABS.length - 1}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer border shadow-xs ${
              activeTabIndex === TABS.length - 1
                ? 'opacity-30 cursor-not-allowed border-transparent'
                : isDarkMode
                  ? 'bg-[#3D2E22] text-[#FDEBD2] border-[#5A4535] hover:bg-[#4E3B2C]'
                  : 'bg-[#B8772E] text-white border-[#9E6423] hover:bg-[#A36622]'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
