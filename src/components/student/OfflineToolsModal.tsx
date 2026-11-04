import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  HelpCircle,
  X,
  CheckCircle2,
  RotateCcw,
  Save,
  Trash2,
  Sparkles
} from 'lucide-react';

interface OfflineToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  defaultTab?: 'reflection' | 'problem-solving';
}

type OfflineTab = 'reflection' | 'problem-solving';

export const OfflineToolsModal: React.FC<OfflineToolsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
  defaultTab = 'reflection'
}) => {
  const [activeTab, setActiveTab] = useState<OfflineTab>(defaultTab);

  // Section A: Consolidated Guided Reflection State (Combines Journaling + Study Session Reflection)
  const [reflectionAnswers, setReflectionAnswers] = useState({
    feeling: '',
    studyContext: '',
    control: '',
    nextSmallThing: ''
  });
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Section B: Problem-Solving Guide State
  const [problemAnswers, setProblemAnswers] = useState({
    problem: '',
    solutions: '',
    smallAction: ''
  });
  const [problemSaved, setProblemSaved] = useState(false);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  // Load any previously saved private reflection answers from local storage
  useEffect(() => {
    try {
      const savedReflection = localStorage.getItem('c3_offline_reflection');
      if (savedReflection) {
        setReflectionAnswers(JSON.parse(savedReflection));
      } else {
        // Migration check from older keys
        const legacyJournal = localStorage.getItem('c3_offline_journal');
        if (legacyJournal) {
          const parsed = JSON.parse(legacyJournal);
          setReflectionAnswers(prev => ({
            ...prev,
            feeling: parsed.feeling || '',
            control: parsed.control || '',
            nextSmallThing: parsed.nextSmallThing || ''
          }));
        }
      }

      const savedProblem = localStorage.getItem('c3_offline_problem');
      if (savedProblem) {
        setProblemAnswers(JSON.parse(savedProblem));
      }
    } catch {}
  }, [isOpen]);

  const handleSaveReflection = () => {
    try {
      localStorage.setItem('c3_offline_reflection', JSON.stringify(reflectionAnswers));
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 2200);
    } catch {}
  };

  const handleClearReflection = () => {
    const empty = { feeling: '', studyContext: '', control: '', nextSmallThing: '' };
    setReflectionAnswers(empty);
    try {
      localStorage.removeItem('c3_offline_reflection');
    } catch {}
  };

  const handleSaveProblem = () => {
    try {
      localStorage.setItem('c3_offline_problem', JSON.stringify(problemAnswers));
      setProblemSaved(true);
      setTimeout(() => setProblemSaved(false), 2200);
    } catch {}
  };

  const handleClearProblem = () => {
    const empty = { problem: '', solutions: '', smallAction: '' };
    setProblemAnswers(empty);
    try {
      localStorage.removeItem('c3_offline_problem');
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-md bg-black/65">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col ${
            isDarkMode
              ? 'bg-[#181310] border-[#382B21] text-[#EDE5DB]'
              : 'bg-white border-[#EADAC8] text-[#34241E]'
          }`}
        >
          {/* Top Warm Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shrink-0" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-2 flex items-center justify-between border-b border-amber-500/10 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight">Offline Self-Help Tools</h3>
                <p className={`text-xs ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7665]'}`}>
                  Private &amp; self-paced • Works without internet connection or AI calls
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-[#2C241F] text-[#8A796B]' : 'hover:bg-[#EFE5D8] text-[#9C8888]'
              }`}
              title="Close tools"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Consolidated Offline Tools Tabs */}
          <div className="px-5 pt-3 border-b border-amber-500/10 flex space-x-2 overflow-x-auto scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('reflection')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeTab === 'reflection'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : isDarkMode
                  ? 'text-[#A8988B] hover:text-[#EDE5DB] hover:bg-[#241C17]'
                  : 'text-[#6E5A4E] hover:text-[#34241E] hover:bg-[#F3E9DD]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Guided Reflection</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('problem-solving')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeTab === 'problem-solving'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : isDarkMode
                  ? 'text-[#A8988B] hover:text-[#EDE5DB] hover:bg-[#241C17]'
                  : 'text-[#6E5A4E] hover:text-[#34241E] hover:bg-[#F3E9DD]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>2. Problem-Solving Guide</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">

            {/* SECTION 2: CONSOLIDATED GUIDED REFLECTION (Combines Journaling & Study Reflection) */}
            {activeTab === 'reflection' && (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isDarkMode ? 'bg-[#211A15] border-[#382B21] text-[#B8A696]' : 'bg-[#FAF4ED] border-[#EADAC8] text-[#6E594B]'
                }`}>
                  A unified offline reflection worksheet combining emotional grounding with lesson reflection. Your notes remain strictly private on this device.
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>1.</span>
                      <span>How am I feeling right now? (Emotional Check-in)</span>
                    </label>
                    <textarea
                      value={reflectionAnswers.feeling}
                      onChange={e => setReflectionAnswers(prev => ({ ...prev, feeling: e.target.value }))}
                      rows={2}
                      placeholder="e.g. A little overwhelmed by upcoming school deadlines, but trying to take things one step at a time..."
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
                      <span>What is on my mind regarding lessons, projects, or study tasks?</span>
                    </label>
                    <textarea
                      value={reflectionAnswers.studyContext}
                      onChange={e => setReflectionAnswers(prev => ({ ...prev, studyContext: e.target.value }))}
                      rows={2}
                      placeholder="e.g. I understood the main concepts in Web Dev, but loops and functions still need more review before defense..."
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
                      <span>What part of this is within my control today?</span>
                    </label>
                    <textarea
                      value={reflectionAnswers.control}
                      onChange={e => setReflectionAnswers(prev => ({ ...prev, control: e.target.value }))}
                      rows={2}
                      placeholder="e.g. I can allocate 20 minutes to practice, ask my teacher for clarification, and make sure I get enough sleep."
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
                      <span>What is one small constructive next step I can take?</span>
                    </label>
                    <input
                      type="text"
                      value={reflectionAnswers.nextSmallThing}
                      onChange={e => setReflectionAnswers(prev => ({ ...prev, nextSmallThing: e.target.value }))}
                      placeholder="e.g. Review 3 practice quiz problems and drink a glass of water."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-500/10">
                  <button
                    type="button"
                    onClick={handleClearReflection}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Reflection</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveReflection}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    {reflectionSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-800" /> : <Save className="w-4 h-4" />}
                    <span>{reflectionSaved ? 'Saved Privately!' : 'Save My Reflection'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 3: PROBLEM-SOLVING GUIDE */}
            {activeTab === 'problem-solving' && (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isDarkMode ? 'bg-[#211A15] border-[#382B21] text-[#B8A696]' : 'bg-[#FAF4ED] border-[#EADAC8] text-[#6E594B]'
                }`}>
                  A 3-step structured offline guide to untangle complex academic or personal challenges into manageable actions.
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>Step 1.</span>
                      <span>Define the challenge in one clear sentence:</span>
                    </label>
                    <textarea
                      value={problemAnswers.problem}
                      onChange={e => setProblemAnswers(prev => ({ ...prev, problem: e.target.value }))}
                      rows={2}
                      placeholder="e.g. I am having trouble finishing my research chapter 3 because the methodology section is confusing."
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
                      <span>Brainstorm 2–3 possible options (without judging them):</span>
                    </label>
                    <textarea
                      value={problemAnswers.solutions}
                      onChange={e => setProblemAnswers(prev => ({ ...prev, solutions: e.target.value }))}
                      rows={3}
                      placeholder="Option A: Ask my research groupmate to review the outline with me&#10;Option B: Consult our research adviser during office hours&#10;Option C: Read 2 sample approved senior high research papers"
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all resize-none font-mono ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                      <span>Step 3.</span>
                      <span>Which single action can I take in the next 15 minutes?</span>
                    </label>
                    <input
                      type="text"
                      value={problemAnswers.smallAction}
                      onChange={e => setProblemAnswers(prev => ({ ...prev, smallAction: e.target.value }))}
                      placeholder="e.g. Send a message to my research teacher asking for a 5-minute consultation."
                      className={`w-full p-2.5 rounded-xl text-xs border outline-none transition-all ${
                        isDarkMode
                          ? 'bg-[#120E0C] border-[#2F241C] focus:border-amber-500/70 text-[#EDE5DB]'
                          : 'bg-white border-[#E0D2C2] focus:border-amber-600 text-[#34241E]'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-500/10">
                  <button
                    type="button"
                    onClick={handleClearProblem}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProblem}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    {problemSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-800" /> : <Save className="w-4 h-4" />}
                    <span>{problemSaved ? 'Saved Privately!' : 'Save Problem Guide'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
