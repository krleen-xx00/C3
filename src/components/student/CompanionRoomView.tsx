import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, CompanionId, ChatMessage, MoodLog, RiskTier, AcademicClusterId, UserStressLevel } from '../../types';
import { COMPANIONS } from '../../data/mockData';
import { getClusterById } from '../../data/academicTracks';
import { Send, ArrowLeft, GraduationCap, Heart, Target, RefreshCw, Sparkles, BookOpen, Zap, Wind, Coffee, ShieldAlert } from 'lucide-react';
import { TieredResourceCard } from './TieredResourceCard';
import { classifyRisk } from '../../utils/riskClassifier';
import { DependencyBreakModal } from './DependencyBreakModal';
import { addFlaggedRiskAlert } from '../../data/flaggedRiskData';
import { OfflineToolsModal } from './OfflineToolsModal';

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
    role: 'Wellness Listener',
    icon: <Heart className="w-4 h-4" />,
    description: 'Wellness listener • Safe space for everyday stress, emotions & pressure',
    tagColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20'
  },
  {
    id: 'skill',
    companionId: 'cedi',
    label: 'Cedi',
    shortLabel: 'Cedi',
    role: 'Skill Builder',
    icon: <Target className="w-4 h-4" />,
    description: 'Skill builder • Interactive practice drills & 3-question quizzes',
    tagColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20'
  },
  {
    id: 'academic',
    companionId: 'cali',
    label: 'Cali',
    shortLabel: 'Cali',
    role: 'Academic Helper',
    icon: <GraduationCap className="w-4 h-4" />,
    description: 'Academic helper • Study habits, lessons & concept guidance',
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
  const [messages, setMessages] = useState<Record<CompanionId, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('c3-chat-messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      casti: [],
      cedi: [],
      cali: []
    };
  });
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBreathingTool, setShowBreathingTool] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [activeInlineRiskTier, setActiveInlineRiskTier] = useState<{ tier: RiskTier; context: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Dependency Engine: continuous student message counter (max 40 per active session)
  // Persists across browser reloads within the same session. Reset only when a new session starts.
  const MAX_SESSION_STUDENT_MESSAGES = 40;

  const [sessionId, setSessionId] = useState<string>(() => {
    try {
      let currentSession = localStorage.getItem('c3-active-session-id');
      if (!currentSession) {
        currentSession = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem('c3-active-session-id', currentSession);
      }
      return currentSession;
    } catch {
      return `sess_${Date.now()}`;
    }
  });

  const [consecutiveMessages, setConsecutiveMessages] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('c3-consecutive-messages');
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [activeMinutes, setActiveMinutes] = useState<number>(0);
  const [isDependencyBreakModalOpen, setIsDependencyBreakModalOpen] = useState<boolean>(false);
  const [hasShownDependencyModal, setHasShownDependencyModal] = useState<boolean>(false);
  const [isDependencyDeescalation, setIsDependencyDeescalation] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('c3-consecutive-messages');
      const count = saved ? parseInt(saved, 10) || 0 : 0;
      return count >= 21;
    } catch {
      return false;
    }
  });
  const [isOfflineToolsOpen, setIsOfflineToolsOpen] = useState<boolean>(false);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('c3-chat-messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Persist consecutive student message counter in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('c3-consecutive-messages', String(consecutiveMessages));
    } catch {}
    if (consecutiveMessages >= MAX_SESSION_STUDENT_MESSAGES && !hasShownDependencyModal) {
      setIsDependencyBreakModalOpen(true);
      setHasShownDependencyModal(true);
      setIsDependencyDeescalation(true);
    } else if (consecutiveMessages >= 21) {
      setIsDependencyDeescalation(true);
    }
  }, [consecutiveMessages, hasShownDependencyModal]);

  // Continuous chat timer (checks every 15s)
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
      setActiveMinutes(elapsedMinutes);

      // Trigger condition: 15+ continuous minutes of chatting
      if (elapsedMinutes >= 15 && !hasShownDependencyModal) {
        setIsDependencyDeescalation(true);
        setIsDependencyBreakModalOpen(true);
        setHasShownDependencyModal(true);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [sessionStartTime, hasShownDependencyModal]);

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

    // Hard Stop Check: If already reached 40 messages, prompt to take a breather
    if (consecutiveMessages >= MAX_SESSION_STUDENT_MESSAGES) {
      setIsDependencyBreakModalOpen(true);
      return;
    }

    // Increment consecutive message counter for AI Dependency Engine (student messages only)
    const nextMsgCount = consecutiveMessages + 1;
    setConsecutiveMessages(nextMsgCount);
    try {
      localStorage.setItem('c3-consecutive-messages', String(nextMsgCount));
    } catch {}

    // AI Dependency Safeguard Tiers for 40-Message Session Limit:
    // Messages 21-35: Progressive conciseness & de-escalation
    // Messages 36-39: Final wind-down
    // Message 40+: Hard pause modal
    const isWindDown = nextMsgCount >= 21 || activeMinutes >= 15;
    const isHardStop = nextMsgCount >= MAX_SESSION_STUDENT_MESSAGES;

    if (isWindDown) {
      setIsDependencyDeescalation(true);
    }
    if (isHardStop) {
      setIsDependencyBreakModalOpen(true);
      setHasShownDependencyModal(true);
    }

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

    // If local check detects Tier 2 (Moderate) or Tier 3 (High), immediately log into Counselor Flagged Risk Log
    if (localRiskCheck?.tier === 3 || localRiskCheck?.tier === 2) {
      const companionName = activeCompanionId === 'cali' ? 'Cali' : activeCompanionId === 'cedi' ? 'Cedi' : 'Casti';
      const anonId = `STU-${(currentUser.studentId || currentUser.id).replace(/\D/g, '').slice(-4) || '8921'}`;
      
      addFlaggedRiskAlert({
        anonymizedStudentId: anonId,
        studentRealName: currentUser.name,
        gradeSection: currentUser.gradeSection || 'Grade 12 - Senior High School',
        companionUsed: companionName,
        flaggedSnippet: text,
        triggerPhrase: localRiskCheck.triggerPhrase || text.substring(0, 50),
        riskLevel: localRiskCheck.tier === 3 ? 'High' : 'Moderate'
      });
    }

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
          history: companionHistory,
          isDependencyDeescalation: isWindDown || isDependencyDeescalation,
          messageCount: nextMsgCount
        })
      });

      // Inspect response Content-Type and HTTP status before attempting to parse JSON!
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonErr: any) {
          throw new Error(`Invalid JSON received from server: ${jsonErr.message}`);
        }
      } else {
        const rawText = await response.text();
        const snippet = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
        throw new Error(
          `Server returned HTTP ${response.status} (${response.statusText || 'Non-JSON response'})${snippet ? `: "${snippet}"` : ''}.`
        );
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Server returned error (${response.status})`);
      }

      const serverTier: RiskTier | undefined = data.riskTier || localRiskCheck?.tier;

      // If server detected risk tier 2 or 3 and it wasn't caught locally, log it
      if ((serverTier === 3 || serverTier === 2) && (!localRiskCheck || localRiskCheck.tier === 1)) {
        const companionName = activeCompanionId === 'cali' ? 'Cali' : activeCompanionId === 'cedi' ? 'Cedi' : 'Casti';
        const anonId = `STU-${(currentUser.studentId || currentUser.id).replace(/\D/g, '').slice(-4) || '8921'}`;
        addFlaggedRiskAlert({
          anonymizedStudentId: anonId,
          studentRealName: currentUser.name,
          gradeSection: currentUser.gradeSection || 'Grade 12 - Senior High School',
          companionUsed: companionName,
          flaggedSnippet: text,
          triggerPhrase: data.triggerPhrase || text.substring(0, 50),
          riskLevel: serverTier === 3 ? 'High' : 'Moderate'
        });
      }

      const replyText = data.reply || data.text || "No response received from companion.";

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        studentId: currentUser.id,
        companionId: activeCompanionId,
        sender: 'bot',
        text: replyText,
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

      if (data.isSessionEnded || nextMsgCount >= MAX_SESSION_STUDENT_MESSAGES) {
        setIsDependencyBreakModalOpen(true);
        setHasShownDependencyModal(true);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        studentId: currentUser.id,
        companionId: activeCompanionId,
        sender: 'bot',
        text: `⚠️ AI Response Error: ${err?.message || 'Unable to connect to Gemini API. Please try again.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [activeCompanionId]: [...(prev[activeCompanionId] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewSession = () => {
    const newSession = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSession);
    setConsecutiveMessages(0);
    setIsDependencyDeescalation(false);
    setHasShownDependencyModal(false);
    setIsDependencyBreakModalOpen(false);
    setActiveInlineRiskTier(null);
    try {
      localStorage.setItem('c3-active-session-id', newSession);
      localStorage.setItem('c3-consecutive-messages', '0');
    } catch {}
  };

  const handleClearHistory = () => {
    handleStartNewSession();
    setMessages(prev => {
      const updated = {
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
      };
      try {
        localStorage.setItem('c3-chat-messages', JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
      className={`relative w-full max-w-6xl mx-auto pt-18 sm:pt-20 px-3 sm:px-6 h-[calc(100dvh-1rem)] md:h-screen flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 ${
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

          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1">
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isDarkMode ? 'bg-[#221B17] text-[#E8CDAC] border-[#3D332B]' : 'bg-white text-amber-800 border-[#ECDCC6]'
            }`}>
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{getClusterById(academicClusterId)?.shortLabel || 'SHS Student'} • Stress: {stressLevel}/10</span>
            </span>

            {/* Continuous Session Counter & AI Dependency Indicator */}
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                isDependencyDeescalation
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30 animate-pulse'
                  : isDarkMode
                  ? 'bg-[#1D1714] text-[#A8988A] border-[#332A24]'
                  : 'bg-white text-[#786455] border-[#EFE3D5]'
              }`}
              title="Continuous message and active time counter for student wellbeing"
            >
              <Coffee className="w-3 h-3 text-amber-500" />
              <span>
                {consecutiveMessages} msgs • {activeMinutes}m active
              </span>
              {isDependencyDeescalation && <span className="font-bold text-[10px] ml-0.5">(Break Recommended)</span>}
            </span>

            {/* Self-Help Offline Tools Button */}
            <button
              type="button"
              onClick={() => setIsOfflineToolsOpen(true)}
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-xs ${
                isDarkMode
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/35'
                  : 'bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 border-amber-300'
              }`}
              title="Open offline self-help tools (Journaling, Problem-Solving, Study Reflection, Stress Reset)"
            >
              <BookOpen className="w-3 h-3 text-amber-500" />
              <span>Offline Tools (No AI)</span>
            </button>

            {/* Quick Demo Limit Triggers & Session Controls */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => {
                  setConsecutiveMessages(21);
                  setIsDependencyDeescalation(true);
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#241A14] hover:bg-[#32231A] text-[#DE9B52] border-[#443021]'
                    : 'bg-[#FFF6E9] hover:bg-[#FDE7C7] text-[#8F5B34] border-[#F2DAC0]'
                }`}
                title="Preview wind-down mode (Messages 21-39)"
              >
                Test Msg 21
              </button>

              <button
                type="button"
                onClick={() => {
                  setConsecutiveMessages(MAX_SESSION_STUDENT_MESSAGES);
                  setIsDependencyDeescalation(true);
                  setIsDependencyBreakModalOpen(true);
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#311818] hover:bg-[#422020] text-[#F87171] border-[#5E2B2B]'
                    : 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-red-700 border-red-300'
                }`}
                title="Preview hard stop lockout (Message 40+)"
              >
                Test Msg 40+
              </button>

              <button
                type="button"
                onClick={handleStartNewSession}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#18231C] hover:bg-[#203126] text-[#6FCF97] border-[#2C4837]'
                    : 'bg-[#EDF8F1] hover:bg-[#DBF1E2] text-[#27AE60] border-[#B7E4C7]'
                }`}
                title="Start a new session and reset counter"
              >
                New Session
              </button>
            </div>
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

        {/* 21-39 Progressive Wind-Down Banner */}
        {consecutiveMessages >= 21 && consecutiveMessages < MAX_SESSION_STUDENT_MESSAGES && (
          <div className={`px-3.5 py-1.5 border-t text-xs flex items-center justify-between flex-shrink-0 ${
            consecutiveMessages >= 36
              ? isDarkMode ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' : 'bg-amber-100/80 border-amber-300 text-amber-950'
              : isDarkMode ? 'bg-amber-950/20 border-amber-500/25 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <span className="flex items-center space-x-1.5 font-medium text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                {consecutiveMessages >= 36
                  ? `Approaching session limit (Msg ${consecutiveMessages}/40): Final wind-down; wrap up your questions.`
                  : `Wind-down phase (Msg ${consecutiveMessages}/40): Companion responses are concise to promote healthy offline balance.`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setIsOfflineToolsOpen(true)}
              className="underline font-bold text-[11px] cursor-pointer hover:opacity-85 shrink-0 ml-2"
            >
              Offline Tools
            </button>
          </div>
        )}

        {/* Suggested Prompts Pills (Only visible when session is active) */}
        {consecutiveMessages < MAX_SESSION_STUDENT_MESSAGES && (
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
        )}

        {/* Input Bar or 40+ Session Lockout Card */}
        {consecutiveMessages >= MAX_SESSION_STUDENT_MESSAGES ? (
          <div
            className={`p-4 sm:p-5 border-t text-center space-y-3.5 flex-shrink-0 ${
              isDarkMode ? 'bg-[#191310] border-amber-500/35' : 'bg-[#FFF9F2] border-amber-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Coffee className="w-4 h-4" />
              <span>Active Chat Session Ended (40 Student Messages Reached)</span>
            </div>

            {/* EXACT MANDATED MESSAGE */}
            <p className="text-sm sm:text-base font-bold max-w-lg mx-auto text-stone-900 dark:text-stone-100">
              &ldquo;Take a Breather! You&apos;ve reached the 40-message session limit. Remember to rest, hydrate, or talk to someone offline.&rdquo;
            </p>

            <div className="flex items-center justify-center gap-2.5 flex-wrap pt-1">
              {/* [Start New Session] button */}
              <button
                type="button"
                onClick={handleStartNewSession}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start New Session</span>
              </button>

              {/* [1-Minute Breathing Exercise] button */}
              <button
                type="button"
                onClick={() => setIsDependencyBreakModalOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <Wind className="w-4 h-4" />
                <span>1-Minute Breathing Exercise</span>
              </button>

              {/* [Self-Help & Offline Tools] button */}
              <button
                type="button"
                onClick={() => setIsOfflineToolsOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Offline Tools</span>
              </button>

              {/* Option to return later */}
              <button
                type="button"
                onClick={onBackToDashboard}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  isDarkMode ? 'border-[#3D332B] text-[#D0C0B0] hover:bg-[#2C241F]' : 'border-[#E9DFD2] text-[#6D5A50] hover:bg-[#F8F3ED]'
                }`}
              >
                <span>Return Later / Back to Home Hub</span>
              </button>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* AI Dependency Engine: Grounding & Breathing Break Modal */}
      <DependencyBreakModal
        isOpen={isDependencyBreakModalOpen}
        onClose={() => setIsDependencyBreakModalOpen(false)}
        onBackToHomeHub={() => {
          setIsDependencyBreakModalOpen(false);
          onBackToDashboard();
        }}
        messageCount={consecutiveMessages}
        activeMinutes={activeMinutes}
        isDarkMode={isDarkMode}
      />

      {/* Standalone Self-Help & Offline Reflection Tools (No AI) */}
      <OfflineToolsModal
        isOpen={isOfflineToolsOpen}
        onClose={() => setIsOfflineToolsOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
