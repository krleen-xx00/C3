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
  defaultTab?: 'breathing' | 'journaling' | 'problem-solving' | 'study-reflection' | 'stress-reset';
}

type OfflineTab = 'breathing' | 'journaling' | 'problem-solving' | 'study-reflection' | 'stress-reset';

export const OfflineToolsModal: React.FC<OfflineToolsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
  defaultTab = 'breathing'
}) => {
  const [activeTab, setActiveTab] = useState<OfflineTab>(defaultTab);

  // 1-Minute Guided Breathing Exercise State
  const [breathingSeconds, setBreathingSeconds] = useState<number>(60);
  const [breathingState, setBreathingState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseSeconds, setPhaseSeconds] = useState<number>(0);

  // Breathing timer countdown and 4s-4s-4s box rhythm
  useEffect(() => {
    if (breathingState !== 'running') return;

    const interval = setInterval(() => {
      setBreathingSeconds(prev => {
        if (prev <= 1) {
          setBreathingState('finished');
          return 0;
        }
        return prev - 1;
      });

      setPhaseSeconds(prev => {
        const next = (prev + 1) % 12;
        if (next < 4) setBreathingPhase('inhale');
        else if (next < 8) setBreathingPhase('hold');
        else setBreathingPhase('exhale');
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingState]);

  const handleStartBreathing = () => {
    setBreathingSeconds(60);
    setPhaseSeconds(0);
    setBreathingPhase('inhale');
    setBreathingState('running');
  };

  const handlePauseBreathing = () => {
    setBreathingState('paused');
  };

  const handleResumeBreathing = () => {
    setBreathingState('running');
  };

  const handleFinishBreathing = () => {
    setBreathingState('idle');
    setBreathingSeconds(60);
    setPhaseSeconds(0);
    setBreathingPhase('inhale');
  };

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
              onClick={() => setActiveTab('breathing')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeTab === 'breathing'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'text-[#A8988B] hover:text-[#EDE5DB] hover:bg-[#241C17]'
                  : 'text-[#6E5A4E] hover:text-[#34241E] hover:bg-[#F3E9DD]'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>1-Min Breathing</span>
            </button>

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
            {/* 0. 1-MINUTE GUIDED BREATHING TAB */}
            {activeTab === 'breathing' && (
              <div className="space-y-5 text-center py-2">
                {/* Header note */}
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed max-w-lg mx-auto ${
                  isDarkMode ? 'bg-[#211A15] border-[#382B21] text-[#B8A696]' : 'bg-[#FAF4ED] border-[#EADAC8] text-[#6E594B]'
                }`}>
                  A gentle 60-second guided rhythm (4s Inhale • 4s Soft Hold • 4s Exhale) to steady your nervous system whenever you need a mindful reset.
                </div>

                {/* Progress bar */}
                <div className="max-w-md mx-auto space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold px-1">
                    <span className={breathingState === 'running' ? 'text-purple-600 dark:text-purple-400' : 'opacity-70'}>
                      {breathingState === 'running' ? '● Exercise in progress' : breathingState === 'paused' ? '⏸ Paused' : breathingState === 'finished' ? '✓ Completed' : 'Ready'}
                    </span>
                    <span className="text-stone-700 dark:text-stone-300 font-bold">
                      {breathingSeconds}s left
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${((60 - breathingSeconds) / 60) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Pulsing Visual Breathing Orb */}
                <div className="py-4 flex flex-col items-center justify-center relative min-h-[190px]">
                  <motion.div
                    animate={{
                      scale:
                        breathingState === 'running'
                          ? breathingPhase === 'inhale'
                            ? 1.35
                            : breathingPhase === 'hold'
                            ? 1.35
                            : 0.85
                          : 1,
                      boxShadow:
                        breathingState === 'running'
                          ? breathingPhase === 'inhale'
                            ? '0 0 45px rgba(168, 85, 247, 0.45)'
                            : '0 0 15px rgba(168, 85, 247, 0.15)'
                          : '0 0 10px rgba(168, 85, 247, 0.1)'
                    }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 text-white font-black text-sm sm:text-base flex flex-col items-center justify-center shadow-lg uppercase tracking-wider select-none"
                  >
                    {breathingState === 'running' ? (
                      <>
                        <span className="text-base sm:text-lg">{breathingPhase}</span>
                        <span className="text-[10px] font-normal lowercase opacity-85 mt-0.5">
                          {breathingPhase === 'inhale' && 'slowly in'}
                          {breathingPhase === 'hold' && 'relax shoulders'}
                          {breathingPhase === 'exhale' && 'softly out'}
                        </span>
                      </>
                    ) : breathingState === 'finished' ? (
                      <span className="text-sm">✓ Complete</span>
                    ) : (
                      <>
                        <Wind className="w-7 h-7 mb-1 opacity-90" />
                        <span className="text-xs">1-Minute</span>
                      </>
                    )}
                  </motion.div>
                </div>

                {/* Instruction Guidance Text */}
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
                    {breathingState === 'running'
                      ? breathingPhase === 'inhale'
                        ? 'Breathe in slowly and gently through your nose...'
                        : breathingPhase === 'hold'
                        ? 'Hold softly. Keep your shoulders loose and comfortable...'
                        : 'Release the breath slowly out through your mouth...'
                      : breathingState === 'paused'
                      ? 'Exercise is paused. Resume whenever you feel ready.'
                      : breathingState === 'finished'
                      ? 'Great job! You completed your 1-minute grounding breath.'
                      : 'Click Start to begin 60 seconds of gentle, unhurried breathing.'}
                  </p>
                  <p className={`text-[11px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                    Box breathing rhythm (4s in • 4s hold • 4s out)
                  </p>
                </div>

                {/* Interactive Controls (Start, Pause/Resume, Finish) */}
                <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
                  {breathingState === 'idle' && (
                    <button
                      type="button"
                      onClick={handleStartBreathing}
                      className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center space-x-2 cursor-pointer shadow-md"
                    >
                      <Wind className="w-4 h-4" />
                      <span>Start 1-Minute Exercise</span>
                    </button>
                  )}

                  {breathingState === 'running' && (
                    <>
                      <button
                        type="button"
                        onClick={handlePauseBreathing}
                        className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                      >
                        <span>⏸ Pause</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFinishBreathing}
                        className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          isDarkMode ? 'border-[#3D322B] text-[#D0C0B0] hover:bg-[#2C241F]' : 'border-[#E9DFD2] text-[#6D5A50] hover:bg-[#F8F3ED]'
                        }`}
                      >
                        <span>⏹ Finish / Reset</span>
                      </button>
                    </>
                  )}

                  {breathingState === 'paused' && (
                    <>
                      <button
                        type="button"
                        onClick={handleResumeBreathing}
                        className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                      >
                        <span>▶ Resume</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFinishBreathing}
                        className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          isDarkMode ? 'border-[#3D322B] text-[#D0C0B0] hover:bg-[#2C241F]' : 'border-[#E9DFD2] text-[#6D5A50] hover:bg-[#F8F3ED]'
                        }`}
                      >
                        <span>⏹ Finish / Reset</span>
                      </button>
                    </>
                  )}

                  {breathingState === 'finished' && (
                    <button
                      type="button"
                      onClick={handleStartBreathing}
                      className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center space-x-2 cursor-pointer shadow-md"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Start Again (60s)</span>
                    </button>
                  )}
                </div>

                {/* Non-clinical Disclaimer */}
                <p className={`text-[10px] leading-relaxed max-w-md mx-auto pt-1 opacity-70 ${
                  isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7665]'
                }`}>
                  Note: This grounding exercise is optional and self-paced. It is intended for everyday relaxation and does not diagnose, treat, or replace professional mental-health care.
                </p>
              </div>
            )}

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
