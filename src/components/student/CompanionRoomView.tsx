import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, CompanionId, ChatMessage, MoodLog, RiskTier, AcademicClusterId, UserStressLevel } from '../../types';
import { COMPANIONS } from '../../data/mockData';
import { getClusterById } from '../../data/academicTracks';
import { Send, ArrowLeft, GraduationCap, Heart, Target, RefreshCw, Sparkles, BookOpen, Zap, Wind } from 'lucide-react';
import { TieredResourceCard } from './TieredResourceCard';
import { classifyRisk } from '../../utils/riskClassifier';

interface CompanionRoomViewProps {
  currentUser: User;
  companionId: CompanionId;
  isDarkMode?: boolean;
  latestMoodLog?: MoodLog;
  onBackToDashboard: () => void;
  onSwitchCompanionRoom: (id: CompanionId) => void;
  onCrisisTriggered: (isTier3?: boolean) => void;
  preferredName?: string;
  academicClusterId?: AcademicClusterId;
  stressLevel?: UserStressLevel;
}

type ChatTabId = 'academic' | 'wellness' | 'skill';

interface ChatTabDef {
  id: ChatTabId;
  companionId: CompanionId;
  label: string;
  shortLabel: string;
  role: string;
  icon: React.ReactNode;
  description: string;
  tagColor: string;
}

const CHAT_TABS: ChatTabDef[] = [
  {
    id: 'wellness',
    companionId: 'casti',
    label: 'Casti',
    shortLabel: 'Casti',
    role: 'Wellness & Support',
    icon: <Heart className="w-4 h-4" />,
    description: 'Gentle peer supporter • Stress relief, reflection & comfort',
    tagColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20'
  },
  {
    id: 'skill',
    companionId: 'cedi',
    label: 'Cedi',
    shortLabel: 'Cedi',
    role: 'Skill & Practice',
    icon: <Target className="w-4 h-4" />,
    description: 'Interactive quiz coach • Drills, concept review & creativity',
    tagColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20'
  },
  {
    id: 'academic',
    companionId: 'cali',
    label: 'Cali',
    shortLabel: 'Cali',
    role: 'Academic & Career',
    icon: <GraduationCap className="w-4 h-4" />,
    description: 'Academic guide • SHS subjects, ICT/TechPro tasks & research',
    tagColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
  }
];

const COMPANION_TO_TAB: Record<CompanionId, ChatTabId> = {
  casti: 'wellness',
  cedi: 'skill',
  cali: 'academic'
};

const SKILL_QUICK_PROMPTS = [
  'Quiz me on programming logic & loops',
  'Give me a 5-question quiz on Web Dev basics',
  'Test me on computer networking fundamentals',
  'Help me structure my research paper'
];

export const CompanionRoomView: React.FC<CompanionRoomViewProps> = ({
  currentUser,
  companionId,
  isDarkMode = false,
  onBackToDashboard,
  onSwitchCompanionRoom,
  onCrisisTriggered,
  preferredName,
  academicClusterId = 'tp-ict' as AcademicClusterId,
  stressLevel = 5
}) => {
  const [messages, setMessages] = useState<Record<CompanionId, ChatMessage[]>>({
    casti: [],
    cedi: [],
    cali: []
  });
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBreathingTool, setShowBreathingTool] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [activeInlineRiskTier, setActiveInlineRiskTier] = useState<{ tier: RiskTier; context: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Map the incoming companion to a tab immediately
  const [activeTab, setActiveTab] = useState<ChatTabId>(() => COMPANION_TO_TAB[companionId] || 'wellness');

  useEffect(() => {
    if (companionId && COMPANION_TO_TAB[companionId]) {
      setActiveTab(COMPANION_TO_TAB[companionId]);
    }
  }, [companionId]);

  const activeTabDef = CHAT_TABS.find(t => t.id === activeTab) || CHAT_TABS[0];
  const activeCompanionId: CompanionId = activeTabDef.companionId;
  const activeCompanion = COMPANIONS.find(c => c.id === activeCompanionId) || COMPANIONS[0];

  // Initialize companion initial greetings if empty
  useEffect(() => {
    setMessages(prev => {
      const updated = { ...prev };
      COMPANIONS.forEach(comp => {
        if (!updated[comp.id] || updated[comp.id].length === 0) {
          updated[comp.id] = [
            {
              id: `init_${comp.id}`,
              studentId: currentUser.id,
              companionId: comp.id,
              sender: 'bot',
              text: comp.initialGreeting,
              timestamp: new Date().toISOString()
            }
          ];
        }
      });
      return updated;
    });
  }, [currentUser.id]);

  // Breathing timer cycle for Wellness tab's calm room
  useEffect(() => {
    if (!showBreathingTool) return;
    const interval = setInterval(() => {
      setBreathingPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [showBreathingTool]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeCompanionId, isLoading, activeInlineRiskTier]);

  const handleSelectTab = (tab: ChatTabDef) => {
    if (tab.id === activeTab) return;
    setActiveTab(tab.id);
    setShowBreathingTool(false);
    setActiveInlineRiskTier(null);
    onSwitchCompanionRoom(tab.companionId);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Check risk tier locally as first-line analysis
    const localRiskCheck = classifyRisk(text);

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      studentId: currentUser.id,
      companionId: activeCompanionId,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      riskTier: localRiskCheck?.tier
    };

    const companionHistory = messages[activeCompanionId] || [];
    setMessages(prev => ({
      ...prev,
      [activeCompanionId]: [...(prev[activeCompanionId] || []), userMsg]
    }));
    setInputText('');
    setIsLoading(true);

    if (localRiskCheck?.tier === 3) {
      onCrisisTriggered(true);
    } else if (localRiskCheck?.tier === 1 || localRiskCheck?.tier === 2) {
      setActiveInlineRiskTier({ tier: localRiskCheck.tier, context: text });
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId: activeCompanionId,
          message: text,
          studentId: currentUser.id,
          studentName: currentUser.name,
          gradeSection: currentUser.gradeSection,
          preferredName: preferredName || currentUser.name.split(' ')[0],
          academicClusterId: academicClusterId,
          stressLevel: stressLevel,
          history: companionHistory
        })
      });

      const data = await response.json();
      const serverTier: RiskTier | undefined = data.riskTier || localRiskCheck?.tier;

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        studentId: currentUser.id,
        companionId: activeCompanionId,
        sender: 'bot',
        text: data.text || "I am right here with you.",
        timestamp: data.timestamp || new Date().toISOString(),
        isCrisisTriggered: data.isCrisisTriggered,
        riskTier: serverTier,
        riskTriggerPhrase: data.triggerPhrase
      };

      setMessages(prev => ({
        ...prev,
        [activeCompanionId]: [...(prev[activeCompanionId] || []), botMsg]
      }));

      if (serverTier === 3 || data.isCrisisTriggered) {
        onCrisisTriggered(true);
      } else if (serverTier === 2 || serverTier === 1) {
        setActiveInlineRiskTier({ tier: serverTier, context: text });
      }
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        studentId: currentUser.id,
        companionId: activeCompanionId,
        sender: 'bot',
        text: `I'm here listening with you. Take all the time you need.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [activeCompanionId]: [...(prev[activeCompanionId] || []), fallbackMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setActiveInlineRiskTier(null);
    setMessages(prev => ({
      ...prev,
      [activeCompanionId]: [
        {
          id: `init_${activeCompanion.id}_${Date.now()}`,
          studentId: currentUser.id,
          companionId: activeCompanion.id,
          sender: 'bot',
          text: activeCompanion.initialGreeting,
          timestamp: new Date().toISOString()
        }
      ]
    }));
  };

  const activeMessages = messages[activeCompanionId] || [];

  // Theme styling for Day & Night modes
  const themeStyles = {
    casti: {
      accentColor: 'text-[#7D5EAA] dark:text-[#CDB4EC]',
      activeTabBg: isDarkMode
        ? 'bg-[#2D1F3B] text-[#F3E8FF] ring-1 ring-[#5E3D80] shadow-sm'
        : 'bg-[#F4EDFA] text-[#4A2D6E] ring-1 ring-[#D8C7F0] shadow-xs',
      userBubble: isDarkMode ? 'bg-[#6A4D94] text-white' : 'bg-[#8A67B8] text-white shadow-xs',
      botBubble: isDarkMode ? 'bg-[#261E33] text-[#EDE5DB] border border-[#3E3154]' : 'bg-white text-[#3D2C2C] border border-[#EDE4F7] shadow-xs',
      buttonBg: isDarkMode ? 'bg-[#6A4D94] hover:bg-[#5C4182] text-white' : 'bg-[#8A67B8] hover:bg-[#7854A6] text-white',
      promptPill: isDarkMode
        ? 'bg-[#221A2E] hover:bg-[#2E233E] text-[#D8C7F0] border-[#3D2F54]'
        : 'bg-white hover:bg-[#F5F0FA] text-[#6E5496] border-[#E4D7F2] shadow-2xs',
      avatarBg: isDarkMode ? 'bg-[#2D2440] text-[#D8C7F0] ring-2 ring-[#3D3057]' : 'bg-[#F4EDFA] text-[#6E5496] ring-2 ring-[#EADBFA]'
    },
    cedi: {
      accentColor: 'text-[#BF7B36] dark:text-[#F2C9A3]',
      activeTabBg: isDarkMode
        ? 'bg-[#362416] text-[#FDF0E3] ring-1 ring-[#6E4221] shadow-sm'
        : 'bg-[#FDF3E7] text-[#6B4219] ring-1 ring-[#F5DCBC] shadow-xs',
      userBubble: isDarkMode ? 'bg-[#B07238] text-white' : 'bg-[#D68B45] text-white shadow-xs',
      botBubble: isDarkMode ? 'bg-[#302118] text-[#EDE5DB] border border-[#4F3626]' : 'bg-white text-[#3D2C2C] border border-[#F5E6D6] shadow-xs',
      buttonBg: isDarkMode ? 'bg-[#B07238] hover:bg-[#9C622D] text-white' : 'bg-[#D68B45] hover:bg-[#C27832] text-white',
      promptPill: isDarkMode
        ? 'bg-[#281A12] hover:bg-[#382418] text-[#F5C79E] border-[#4E3220]'
        : 'bg-white hover:bg-[#FDF3EB] text-[#A6692E] border-[#F5DCBE] shadow-2xs',
      avatarBg: isDarkMode ? 'bg-[#3D281C] text-[#F5C79E] ring-2 ring-[#573926]' : 'bg-[#FDF3E7] text-[#B5783A] ring-2 ring-[#FCE5CF]'
    },
    cali: {
      accentColor: 'text-[#3E7D50] dark:text-[#A4DCB0]',
      activeTabBg: isDarkMode
        ? 'bg-[#1C2C20] text-[#E5F7E9] ring-1 ring-[#2E5E3C] shadow-sm'
        : 'bg-[#EBF7EF] text-[#20542F] ring-1 ring-[#D2EBD9] shadow-xs',
      userBubble: isDarkMode ? 'bg-[#4B855B] text-white' : 'bg-[#619E72] text-white shadow-xs',
      botBubble: isDarkMode ? 'bg-[#1C2C20] text-[#EDE5DB] border border-[#2F4736]' : 'bg-white text-[#3D2C2C] border border-[#E0EFE3] shadow-xs',
      buttonBg: isDarkMode ? 'bg-[#4B855B] hover:bg-[#3F724D] text-white' : 'bg-[#619E72] hover:bg-[#508B60] text-white',
      promptPill: isDarkMode
        ? 'bg-[#152418] hover:bg-[#1E3323] text-[#A6DCB1] border-[#29422F]'
        : 'bg-white hover:bg-[#EFF6F0] text-[#3E734D] border-[#D3E7D6] shadow-2xs',
      avatarBg: isDarkMode ? 'bg-[#233527] text-[#A6DCB1] ring-2 ring-[#314D37]' : 'bg-[#EBF7EF] text-[#4A855A] ring-2 ring-[#D8EDE0]'
    }
  }[activeCompanionId];

  return (
    <div
      id="companions-hub-view"
      className={`relative w-full max-w-6xl mx-auto pt-16 md:pt-4 px-3 sm:px-6 h-[calc(100dvh-1rem)] md:h-screen flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 ${
        isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'
      }`}
    >
      {/* 1. TOP COMPANION PICKER BAR (Casti, Cedi, Cali) */}
      <div className="flex-shrink-0 space-y-2 mb-2">
        {/* Sub-header row with quick back to dashboard and cluster badge */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer border shadow-2xs ${
              isDarkMode
                ? 'text-[#D0C0B0] bg-[#221C18] border-[#3D332B] hover:bg-[#2C241F] hover:text-white'
                : 'text-[#6D5A50] bg-white border-[#E9DFD2] hover:bg-[#F8F3ED] hover:text-[#3D2C2C]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isDarkMode ? 'bg-[#221B17] text-[#E8CDAC] border-[#3D332B]' : 'bg-white text-amber-800 border-[#ECDCC6]'
            }`}>
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{getClusterById(academicClusterId)?.shortLabel || 'SHS Student'} • Stress: {stressLevel}/10</span>
            </span>
          </div>
        </div>

        {/* 3 Companion Selection Cards (1-Click Switcher) */}
        <div
          role="tablist"
          aria-label="AI Companion Picker"
          className={`grid grid-cols-3 gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl border shadow-xs backdrop-blur-md ${
            isDarkMode
              ? 'bg-[#1C1714]/90 border-[#332A24]'
              : 'bg-white/90 border-[#EFE3D5]'
          }`}
        >
          {CHAT_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            const comp = COMPANIONS.find(c => c.id === tab.companionId) || COMPANIONS[0];
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectTab(tab)}
                className={`relative flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? themeStyles.activeTabBg
                    : isDarkMode
                      ? 'hover:bg-[#251E19] text-[#A8988A]'
                      : 'hover:bg-[#FDF9F4] text-[#786455]'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg flex-shrink-0 shadow-2xs ${
                    tab.id === 'wellness'
                      ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                      : tab.id === 'skill'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  }`}
                >
                  {comp.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-xs sm:text-sm tracking-tight truncate">
                      {tab.label}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-medium leading-tight truncate opacity-85">
                    {tab.role}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CHAT FEED & TOOLS (Viewport-optimized, zero page scrolling) */}
      <div
        className={`flex-1 flex flex-col rounded-3xl border overflow-hidden shadow-lg backdrop-blur-md min-h-0 ${
          isDarkMode
            ? 'bg-[#1F1916]/95 border-[#382E27] shadow-black/30'
            : 'bg-white/95 border-[#EFE3D5] shadow-[#E8DACB]/40'
        }`}
      >
        {/* Chat Companion Sub-Header */}
        <div
          className={`px-4 sm:px-5 py-2.5 border-b flex items-center justify-between flex-shrink-0 ${
            isDarkMode ? 'bg-[#181310]/80 border-[#2E241E]' : 'bg-[#FAF6F0]/80 border-[#EFE5D8]'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-base sm:text-lg">{activeCompanion.avatar}</span>
            <div className="leading-tight">
              <span className={`text-xs sm:text-sm font-extrabold ${themeStyles.accentColor}`}>
                {activeCompanion.name}
              </span>
              <span className={`block text-[10px] sm:text-[11px] ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                {activeTabDef.description}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Wellness Quick Breathing Toggle */}
            {activeCompanionId === 'casti' && (
              <button
                type="button"
                onClick={() => setShowBreathingTool(!showBreathingTool)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                  showBreathingTool
                    ? 'bg-purple-600 text-white shadow-xs'
                    : isDarkMode
                      ? 'bg-[#291F36] text-[#D8C7F0] hover:bg-[#382B4A]'
                      : 'bg-[#F4EDFA] text-[#6E5496] hover:bg-[#EADBFA]'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">1-Min Breath</span>
              </button>
            )}

            {/* Clear conversation */}
            <button
              type="button"
              onClick={handleClearHistory}
              title="Reset conversation"
              className={`p-1.5 px-2.5 rounded-full text-xs flex items-center space-x-1 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-[#9E8F82] hover:text-white hover:bg-[#2A211B]'
                  : 'text-[#8A7569] hover:text-[#3D2C2C] hover:bg-[#EFE5D8]'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Optional Interactive Calm Drawer (Breathing) */}
        <AnimatePresence>
          {showBreathingTool && activeCompanionId === 'casti' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-purple-500/10 p-3 text-center flex-shrink-0"
            >
              <div className="flex items-center justify-center space-x-4">
                <motion.div
                  animate={{
                    scale: breathingPhase === 'inhale' ? 1.25 : breathingPhase === 'hold' ? 1.25 : 0.9,
                  }}
                  transition={{ duration: 4, ease: 'easeInOut' }}
                  className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shadow-md uppercase"
                >
                  {breathingPhase}
                </motion.div>
                <div className="text-left text-xs">
                  <div className="font-bold text-purple-700 dark:text-purple-300">
                    {breathingPhase === 'inhale' && 'Breathe In softly through your nose...'}
                    {breathingPhase === 'hold' && 'Hold gently and relax your shoulders...'}
                    {breathingPhase === 'exhale' && 'Exhale slowly and release all tension...'}
                  </div>
                  <div className="text-[11px] opacity-75">4-4-4 diaphragmatic rhythm</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional Skill Quick Quiz Prompts Drawer */}
        {activeTab === 'skill' && (
          <div
            className={`px-3 py-1.5 border-b flex items-center space-x-2 overflow-x-auto scrollbar-none flex-shrink-0 text-xs ${
              isDarkMode ? 'bg-[#1A1412] border-[#2E241E]' : 'bg-[#FDF7F0] border-[#EFE2D2]'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center space-x-1 shrink-0">
              <Zap className="w-3 h-3" />
              <span>Drill Starters:</span>
            </span>
            {SKILL_QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0 hover:scale-102 transition-all cursor-pointer ${themeStyles.promptPill}`}
              >
                <BookOpen className="w-2.5 h-2.5 inline mr-1" />
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Messages Feed (Scrollable internally) */}
        <div
          className={`flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-3.5 scrollbar-thin ${
            isDarkMode ? 'bg-[#15110E]/60' : 'bg-[#FAF7F2]/60'
          }`}
        >
          {activeMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 shadow-2xs ${
                    isUser ? themeStyles.buttonBg : themeStyles.avatarBg
                  }`}
                >
                  {isUser ? '👤' : activeCompanion.avatar}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? `${themeStyles.userBubble} rounded-tr-xs`
                      : `${themeStyles.botBubble} rounded-tl-xs`
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}

          {/* Inline Risk Response */}
          {activeInlineRiskTier && (
            <div className="pt-2">
              <TieredResourceCard
                tier={activeInlineRiskTier.tier}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
                triggerContext={activeInlineRiskTier.context}
                onDismissTier2Prompt={() => {}}
                onConnectGuidance={() => {}}
              />
            </div>
          )}

          {/* Thinking indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-2xs ${themeStyles.avatarBg}`}>
                {activeCompanion.avatar}
              </div>
              <div
                className={`p-3 rounded-2xl rounded-tl-xs text-xs flex items-center space-x-1.5 shadow-2xs ${
                  isDarkMode
                    ? 'bg-[#29221C] border border-[#3D332B] text-[#A89A8D]'
                    : 'bg-white border border-[#EFE6DC] text-[#8C7A7A]'
                }`}
              >
                <span>{activeCompanion.name} is reflecting</span>
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div
          className={`px-3 sm:px-4 py-2 border-t flex items-center space-x-1.5 overflow-x-auto scrollbar-none flex-shrink-0 ${
            isDarkMode ? 'bg-[#181310] border-[#2E241E]' : 'bg-[#FAF5EE] border-[#EFE2D2]'
          }`}
        >
          <span className={`text-[10px] sm:text-[11px] font-semibold shrink-0 flex items-center space-x-1 ${
            isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'
          }`}>
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Suggestions:</span>
          </span>
          {activeCompanion.samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className={`px-2.5 sm:px-3 py-1 text-[11px] rounded-full border transition-all shrink-0 font-normal hover:scale-102 cursor-pointer ${themeStyles.promptPill}`}
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          className={`p-2.5 sm:p-3 border-t flex-shrink-0 ${
            isDarkMode ? 'bg-[#1C1613] border-[#2E241E]' : 'bg-white border-[#EFE2D2]'
          }`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeTab === 'skill'
                  ? `Ask ${activeCompanion.name} to quiz you on any subject or concept...`
                  : `Message ${activeCompanion.name}...`
              }
              className={`flex-1 px-3.5 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                isDarkMode
                  ? 'bg-[#14100E] border-[#382D24] text-[#EDE5DB] placeholder-[#786D63] focus:ring-1 focus:ring-amber-600'
                  : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#A69797] focus:ring-1 focus:ring-amber-500'
              }`}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2.5 sm:p-3 ${themeStyles.buttonBg} rounded-xl sm:rounded-2xl disabled:opacity-40 transition-all shrink-0 hover:scale-105 cursor-pointer shadow-xs`}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
