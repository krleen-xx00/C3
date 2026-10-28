import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  HelpCircle,
  Brain,
  Sparkles,
  CheckCircle2,
  X,
  Droplets,
  Wind,
  Smile,
  Users,
  EyeOff,
  Copy,
  RotateCcw,
  Check,
  Heart
} from 'lucide-react';

interface OfflineToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  defaultTab?: 'journaling' | 'problem-solving' | 'study-reflection' | 'stress-reset';
}

type OfflineTab = 'journaling' | 'problem-solving' | 'study-reflection' | 'stress-reset';

export const OfflineToolsModal: React.FC<OfflineToolsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
  defaultTab = 'journaling'
}) => {
  const [activeTab, setActiveTab] = useState<OfflineTab>(defaultTab);

  // Journaling State
  const [journalAnswers, setJournalAnswers] = useState({
    feeling: '',
    cause: '',
    control: '',
    nextSmallThing: ''
  });
  const [journalSaved, setJournalSaved] = useState(false);

  // Problem Solving State
  const [problemAnswers, setProblemAnswers] = useState({
    problem: '',
    solutions: '',
    smallAction: ''
  });
  const [problemSaved, setProblemSaved] = useState(false);

  // Study Reflection State
  const [studyAnswers, setStudyAnswers] = useState({
    understood: '',
    confused: '',
    reviewNext: ''
  });
  const [studySaved, setStudySaved] = useState(false);

  // Stress Reset Checklist State
  const [resetChecks, setResetChecks] = useState<Record<string, boolean>>({
    break: false,
    water: false,
    breaths: false,
    screen: false,
    talk: false
  });

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  // Load any previously saved private journal answers from local storage
  useEffect(() => {
    try {
      const savedJournal = localStorage.getItem('c3_offline_journal');
      if (savedJournal) {
        setJournalAnswers(JSON.parse(savedJournal));
      }
      const savedProblem = localStorage.getItem('c3_offline_problem');
      if (savedProblem) {
        setProblemAnswers(JSON.parse(savedProblem));
      }
      const savedStudy = localStorage.getItem('c3_offline_study');
      if (savedStudy) {
        setStudyAnswers(JSON.parse(savedStudy));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleSaveJournal = () => {
    try {
      localStorage.setItem('c3_offline_journal', JSON.stringify(journalAnswers));
      setJournalSaved(true);
      setTimeout(() => setJournalSaved(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveProblem = () => {
    try {
      localStorage.setItem('c3_offline_problem', JSON.stringify(problemAnswers));
      setProblemSaved(true);
      setTimeout(() => setProblemSaved(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveStudy = () => {
    try {
      localStorage.setItem('c3_offline_study', JSON.stringify(studyAnswers));
      setStudySaved(true);
      setTimeout(() => setStudySaved(false), 2500);
    } catch {
      // ignore
    }
  };

  const toggleResetCheck = (key: string) => {
    setResetChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetAllChecks = () => {
    setResetChecks({
      break: false,
      water: false,
      breaths: false,
      screen: false,
      talk: false
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-md bg-black/75">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] ${
            isDarkMode
              ? 'bg-[#181310] border-[#3D3025] text-[#EDE5DB]'
              : 'bg-white border-[#E5D7C5] text-[#34241E]'
          }`}
        >
          {/* Top Gold Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-amber-500/15 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">
                    Self-Help &amp; Offline Tools
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    No AI Needed
                  </span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-[#9A8778]' : 'text-[#7D6B5E]'}`}>
                  Short, practical offline exercises to reflect, reset, and recharge.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-[#2A201B] text-[#8C7A6D]' : 'hover:bg-[#F3E8DB] text-[#8C7575]'
              }`}
              title="Close tools"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="px-5 pt-3 border-b border-amber-500/10 flex space-x-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('journaling')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeTab === 'journaling'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : isDarkMode
                  ? 'text-[#A8988B] hover:text-[#EDE5DB] hover:bg-[#241C17]'
                  : 'text-[#6E5A4E] hover:text-[#34241E] hover:bg-[#F3E9DD]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journaling</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('problem-solving')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeTab === 'problem-solving'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : isDarkMode
                  ? 'text-[#A8988B] hover:text-[#EDE5DB] hover:bg-[#241C17]'
                  : 'text-[#6E5A4E] hover:text-[#34241E] hover:bg-[#F3E9DD]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Problem-Solving</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('study-reflection')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeTab === 'study-reflection'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : isDarkMode
                  ? 'text-[#A8988B] hover:text-[#EDE5DB] hover:bg-[#241C17]'
                  : 'text-[#6E5A4E] hover:text-[#34241E] hover:bg-[#F3E9DD]'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Study Reflection</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stress-reset')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeTab === 'stress-reset'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : isDarkMode
                  ? 'text-[#A8988B] hover:text-[#EDE5DB] hover:bg-[#241C17]'
                  : 'text-[#6E5A4E] hover:text-[#34241E] hover:bg-[#F3E9DD]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Stress Reset</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {/* 1. JOURNALING TAB */}
            {activeTab === 'journaling' && (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isDarkMode ? 'bg-[#211A15] border-[#382B21] text-[#B8A696]' : 'bg-[#FAF4ED] border-[#EADAC8] text-[#6E594B]'
                }`}>
                  Take a quiet breath and answer these 4 guiding prompts. Your notes stay strictly private on this device.
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>1.</span>
                      <span>What am I feeling right now?</span>
                    </label>
                    <textarea
                      value={journalAnswers.feeling}
                      onChange={e => setJournalAnswers(prev => ({ ...prev, feeling: e.target.value }))}
                      rows={2}
                      placeholder="e.g., A little overwhelmed about our upcoming programming defense and tired..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>2.</span>
                      <span>What caused me to feel this way?</span>
                    </label>
                    <textarea
                      value={journalAnswers.cause}
                      onChange={e => setJournalAnswers(prev => ({ ...prev, cause: e.target.value }))}
                      rows={2}
                      placeholder="e.g., Three assignments piled up at the same time and I haven't slept well..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>3.</span>
                      <span>What is one thing I can control?</span>
                    </label>
                    <textarea
                      value={journalAnswers.control}
                      onChange={e => setJournalAnswers(prev => ({ ...prev, control: e.target.value }))}
                      rows={2}
                      placeholder="e.g., I can control my schedule for the next hour and work on just one task at a time..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>4.</span>
                      <span>What is one small thing I can do next?</span>
                    </label>
                    <textarea
                      value={journalAnswers.nextSmallThing}
                      onChange={e => setJournalAnswers(prev => ({ ...prev, nextSmallThing: e.target.value }))}
                      rows={2}
                      placeholder="e.g., Drink a glass of water, outline slide 1 of my presentation, or message my groupmate..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className={`text-[11px] flex items-center space-x-1 ${
                    isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7665]'
                  }`}>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Private to this browser</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveJournal}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    {journalSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved Privately!</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Save Entry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 2. SIMPLE PROBLEM-SOLVING TAB */}
            {activeTab === 'problem-solving' && (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isDarkMode ? 'bg-[#211A15] border-[#382B21] text-[#B8A696]' : 'bg-[#FAF4ED] border-[#EADAC8] text-[#6E594B]'
                }`}>
                  Break complex overwhelm into 3 clear steps: isolate the problem, identify 2 possible solutions, and pick 1 micro-action.
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>Step 1.</span>
                      <span>What is the problem?</span>
                    </label>
                    <textarea
                      value={problemAnswers.problem}
                      onChange={e => setProblemAnswers(prev => ({ ...prev, problem: e.target.value }))}
                      rows={2}
                      placeholder="State the problem clearly in one sentence..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>Step 2.</span>
                      <span>What are two possible solutions?</span>
                    </label>
                    <textarea
                      value={problemAnswers.solutions}
                      onChange={e => setProblemAnswers(prev => ({ ...prev, solutions: e.target.value }))}
                      rows={3}
                      placeholder="Solution A: ...&#10;Solution B: ..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>Step 3.</span>
                      <span>What is one small action I can take right now?</span>
                    </label>
                    <textarea
                      value={problemAnswers.smallAction}
                      onChange={e => setProblemAnswers(prev => ({ ...prev, smallAction: e.target.value }))}
                      rows={2}
                      placeholder="A tiny, 5-minute action to begin moving forward..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className={`text-[11px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7665]'}`}>
                    Simplicity brings clarity when thoughts feel crowded.
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveProblem}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    {problemSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Action Saved!</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Save Action Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 3. STUDY REFLECTION TAB */}
            {activeTab === 'study-reflection' && (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isDarkMode ? 'bg-[#211A15] border-[#382B21] text-[#B8A696]' : 'bg-[#FAF4ED] border-[#EADAC8] text-[#6E594B]'
                }`}>
                  Take 2 minutes to summarize your learning after studying or practicing. Active reflection cements memory without stress.
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                      <span>1.</span>
                      <span>What did I understand?</span>
                    </label>
                    <textarea
                      value={studyAnswers.understood}
                      onChange={e => setStudyAnswers(prev => ({ ...prev, understood: e.target.value }))}
                      rows={2}
                      placeholder="e.g., I understood how the for-loop increments and controls array bounds..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-emerald-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-emerald-600 text-[#34241E]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>2.</span>
                      <span>What confused me?</span>
                    </label>
                    <textarea
                      value={studyAnswers.confused}
                      onChange={e => setStudyAnswers(prev => ({ ...prev, confused: e.target.value }))}
                      rows={2}
                      placeholder="e.g., How objects pass by reference in functions still feels a bit blurry..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-sky-600 dark:text-sky-400">
                      <span>3.</span>
                      <span>What should I review next?</span>
                    </label>
                    <textarea
                      value={studyAnswers.reviewNext}
                      onChange={e => setStudyAnswers(prev => ({ ...prev, reviewNext: e.target.value }))}
                      rows={2}
                      placeholder="e.g., Re-read module 3 page 14 or ask my teacher/classmate tomorrow in class..."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-sky-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-sky-600 text-[#34241E]'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className={`text-[11px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7665]'}`}>
                    Knowing what confused you is half the battle won!
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveStudy}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    {studySaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-3.5 h-3.5" />
                        <span>Save Reflection</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 4. STRESS RESET TAB */}
            {activeTab === 'stress-reset' && (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isDarkMode ? 'bg-[#211A15] border-[#382B21] text-[#B8A696]' : 'bg-[#FAF4ED] border-[#EADAC8] text-[#6E594B]'
                }`}>
                  A 5-point physical reset you can complete right now to regulate your nervous system:
                </div>

                <div className="space-y-2.5">
                  {/* Step 1: Short break */}
                  <div
                    onClick={() => toggleResetCheck('break')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3.5 ${
                      resetChecks.break
                        ? isDarkMode ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isDarkMode ? 'bg-[#201813] border-[#34261E] hover:border-amber-500/40' : 'bg-white border-[#E5D7C5] hover:border-amber-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      resetChecks.break ? 'bg-emerald-500 border-emerald-500 text-stone-950' : 'border-stone-500/40'
                    }`}>
                      {resetChecks.break && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold flex items-center space-x-2">
                        <span>Take a short break</span>
                        <span className="text-[10px] opacity-75 font-normal">(5 to 10 minutes)</span>
                      </div>
                      <p className="text-[11px] opacity-80">Pause your screen tasks and let your brain stand down.</p>
                    </div>
                  </div>

                  {/* Step 2: Drink water */}
                  <div
                    onClick={() => toggleResetCheck('water')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3.5 ${
                      resetChecks.water
                        ? isDarkMode ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isDarkMode ? 'bg-[#201813] border-[#34261E] hover:border-amber-500/40' : 'bg-white border-[#E5D7C5] hover:border-amber-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      resetChecks.water ? 'bg-emerald-500 border-emerald-500 text-stone-950' : 'border-stone-500/40'
                    }`}>
                      {resetChecks.water && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold flex items-center space-x-2">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        <span>Drink water</span>
                      </div>
                      <p className="text-[11px] opacity-80">Hydration immediately lowers physiological stress cortisol.</p>
                    </div>
                  </div>

                  {/* Step 3: Slow breaths */}
                  <div
                    onClick={() => toggleResetCheck('breaths')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3.5 ${
                      resetChecks.breaths
                        ? isDarkMode ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isDarkMode ? 'bg-[#201813] border-[#34261E] hover:border-amber-500/40' : 'bg-white border-[#E5D7C5] hover:border-amber-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      resetChecks.breaths ? 'bg-emerald-500 border-emerald-500 text-stone-950' : 'border-stone-500/40'
                    }`}>
                      {resetChecks.breaths && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold flex items-center space-x-2">
                        <Wind className="w-3.5 h-3.5 text-purple-400" />
                        <span>Take a few slow breaths</span>
                      </div>
                      <p className="text-[11px] opacity-80">Inhale for 4 seconds, hold gently for 4, exhale slowly for 4.</p>
                    </div>
                  </div>

                  {/* Step 4: Step away from screen */}
                  <div
                    onClick={() => toggleResetCheck('screen')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3.5 ${
                      resetChecks.screen
                        ? isDarkMode ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isDarkMode ? 'bg-[#201813] border-[#34261E] hover:border-amber-500/40' : 'bg-white border-[#E5D7C5] hover:border-amber-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      resetChecks.screen ? 'bg-emerald-500 border-emerald-500 text-stone-950' : 'border-stone-500/40'
                    }`}>
                      {resetChecks.screen && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold flex items-center space-x-2">
                        <span>Step away from the screen</span>
                      </div>
                      <p className="text-[11px] opacity-80">Look at a far tree, window, or hallway for 20 seconds.</p>
                    </div>
                  </div>

                  {/* Step 5: Talk to someone you trust */}
                  <div
                    onClick={() => toggleResetCheck('talk')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3.5 ${
                      resetChecks.talk
                        ? isDarkMode ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isDarkMode ? 'bg-[#201813] border-[#34261E] hover:border-amber-500/40' : 'bg-white border-[#E5D7C5] hover:border-amber-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      resetChecks.talk ? 'bg-emerald-500 border-emerald-500 text-stone-950' : 'border-stone-500/40'
                    }`}>
                      {resetChecks.talk && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold flex items-center space-x-2">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Talk to someone you trust</span>
                      </div>
                      <p className="text-[11px] opacity-80">Say hello to a friend, family member, teacher, or counselor in person.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetAllChecks}
                    className={`text-xs flex items-center space-x-1 underline cursor-pointer ${
                      isDarkMode ? 'text-[#8A796B] hover:text-[#EDE5DB]' : 'text-[#8C7665] hover:text-[#34241E]'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset checklist</span>
                  </button>

                  {Object.values(resetChecks).every(Boolean) && (
                    <span className="text-xs font-bold text-emerald-500 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All 5 Reset Steps Completed! Great job!</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-amber-500/10 flex items-center justify-between">
            <span className={`text-[11px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7665]'}`}>
              C3 Wellbeing Protocol • Cabiao Senior High School
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Done / Return to App
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
