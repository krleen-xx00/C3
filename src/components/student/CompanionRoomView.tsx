import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, CompanionId, ChatMessage, MoodLog, RiskTier, AcademicClusterId, UserStressLevel } from '../../types';
import { COMPANIONS } from '../../data/mockData';
import { getClusterById } from '../../data/academicTracks';
import { Send, ArrowLeft, GraduationCap, Heart, Target, RefreshCw, Sparkles, BookOpen, Zap, Coffee, ShieldAlert, Clock } from 'lucide-react';
import { TieredResourceCard } from './TieredResourceCard';
import { classifyRisk } from '../../utils/riskClassifier';
import { DependencyBreakModal } from './DependencyBreakModal';
import { addFlaggedRiskAlert } from '../../data/flaggedRiskData';
import { OfflineToolsModal } from './OfflineToolsModal';

interface CompanionRoomViewProps {
  currentUser: User;
  companionId: CompanionId;
  isDarkMode?: boolean;
  deploymentMode?: 'all' | 'student' | 'counselor';
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
  deploymentMode,
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
  const [streamingText, setStreamingText] = useState<string>('');
  const [activeInlineRiskTier, setActiveInlineRiskTier] = useState<{ tier: RiskTier; context: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Dependency Engine: continuous student message counter (max 40 per active session)
  // Persists across browser reloads within the same session. Reset only after 24-hour cooldown expires.
  const MAX_SESSION_STUDENT_MESSAGES = 40;
  const LOCKOUT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24-hour mandatory rest cooldown

  const effectiveDeploymentMode = deploymentMode || (() => {
    try {
      return (localStorage.getItem('c3-deployment-mode') as 'all' | 'student' | 'counselor') || 'all';
    } catch {
      return 'all';
    }
  })();

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
      const count = saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
      const lockoutTimestamp = localStorage.getItem('c3-lockout-timestamp');

      if (lockoutTimestamp && count >= MAX_SESSION_STUDENT_MESSAGES) {
        const elapsed = Date.now() - parseInt(lockoutTimestamp, 10);
        if (elapsed >= LOCKOUT_COOLDOWN_MS) {
          // 24 hours have passed! Cooldown completed, automatically reset counter for a healthy new day
          localStorage.removeItem('c3-lockout-timestamp');
          localStorage.setItem('c3-consecutive-messages', '0');
          return 0;
        }
      }
      return count;
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
  const [isSafetyDisclosureOpen, setIsSafetyDisclosureOpen] = useState<boolean>(false);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('c3-chat-messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Persist consecutive student message counter in localStorage & enforce 24h lockout
  useEffect(() => {
    try {
      localStorage.setItem('c3-consecutive-messages', String(consecutiveMessages));
    } catch {}
    if (consecutiveMessages >= MAX_SESSION_STUDENT_MESSAGES) {
      if (!localStorage.getItem('c3-lockout-timestamp')) {
        localStorage.setItem('c3-lockout-timestamp', String(Date.now()));
      }
      if (!hasShownDependencyModal) {
        setIsDependencyBreakModalOpen(true);
        setHasShownDependencyModal(true);
      }
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

  // Scroll to bottom when messages update or text streams in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeCompanionId, isLoading, streamingText, activeInlineRiskTier]);

  const handleSelectTab = (tab: ChatTabDef) => {
    if (tab.id === activeTab) return;
    setActiveTab(tab.id);
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
        parentEmergencyPhone: currentUser.parentEmergencyPhone,
        lrn: currentUser.lrn,
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
          messageCount: nextMsgCount,
          stream: true
        })
      });

      const contentType = response.headers.get('content-type') || '';
      let replyText = '';
      let serverTier: RiskTier | undefined = localRiskCheck?.tier;
      let triggerPhrase: string | undefined = localRiskCheck?.triggerPhrase;
      let isCrisisTriggered = false;
      let isSessionEnded = false;
      let timestamp = new Date().toISOString();
      let safetyNotice: string | undefined = undefined;
      let screeningResult: any = undefined;

      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const ev of events) {
            const line = ev.trim();
            if (line.startsWith('data: ')) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.error) {
                  throw new Error(payload.error);
                }
                if (payload.chunk) {
                  replyText += payload.chunk;
                  setStreamingText(replyText);
                }
                if (payload.done) {
                  if (payload.reply) replyText = payload.reply;
                  if (payload.riskTier !== undefined) serverTier = payload.riskTier;
                  if (payload.triggerPhrase) triggerPhrase = payload.triggerPhrase;
                  if (payload.isCrisisTriggered) isCrisisTriggered = payload.isCrisisTriggered;
                  if (payload.isSessionEnded) isSessionEnded = payload.isSessionEnded;
                  if (payload.timestamp) timestamp = payload.timestamp;
                  if (payload.safetyNotice) safetyNotice = payload.safetyNotice;
                  if (payload.screeningResult) {
                    screeningResult = payload.screeningResult;
                    if (payload.screeningResult.priority === 'URGENT_REVIEW') {
                      isCrisisTriggered = true;
                    }
                  }
                }
              } catch (parseErr: any) {
                if (parseErr.message && parseErr.message.includes('Gemini API error')) {
                  throw parseErr;
                }
              }
            }
          }
        }
      } else if (contentType.includes('application/json')) {
        let data: any = null;
        try {
          data = await response.json();
        } catch (jsonErr: any) {
          throw new Error(`Invalid JSON received from server: ${jsonErr.message}`);
        }
        if (!response.ok) {
          throw new Error(data?.error || data?.message || `Server returned error (${response.status})`);
        }
        replyText = data.reply || data.text || "No response received from companion.";
        serverTier = data.riskTier || localRiskCheck?.tier;
        triggerPhrase = data.triggerPhrase;
        isCrisisTriggered = !!data.isCrisisTriggered;
        isSessionEnded = !!data.isSessionEnded;
        timestamp = data.timestamp || new Date().toISOString();
        safetyNotice = data.safetyNotice || data.screeningResult?.safetyNotice;
        screeningResult = data.screeningResult;
        if (data.screeningResult?.priority === 'URGENT_REVIEW') {
          isCrisisTriggered = true;
        }
      } else {
        const rawText = await response.text();
        const snippet = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
        throw new Error(
          `Server returned HTTP ${response.status} (${response.statusText || 'Non-JSON response'})${snippet ? `: "${snippet}"` : ''}.`
        );
      }

      if (!response.ok && !replyText) {
        throw new Error(`Server returned error (${response.status})`);
      }

      // If server detected risk tier 2 or 3 and it wasn't caught locally, log it
      if ((serverTier === 3 || serverTier === 2) && (!localRiskCheck || localRiskCheck.tier === 1)) {
        const companionName = activeCompanionId === 'cali' ? 'Cali' : activeCompanionId === 'cedi' ? 'Cedi' : 'Casti';
        const anonId = `STU-${(currentUser.studentId || currentUser.id).replace(/\D/g, '').slice(-4) || '8921'}`;
        addFlaggedRiskAlert({
          anonymizedStudentId: anonId,
          studentRealName: currentUser.name,
          gradeSection: currentUser.gradeSection || 'Grade 12 - Senior High School',
          parentEmergencyPhone: currentUser.parentEmergencyPhone,
          lrn: currentUser.lrn,
          companionUsed: companionName,
          flaggedSnippet: text,
          triggerPhrase: triggerPhrase || text.substring(0, 50),
          riskLevel: serverTier === 3 ? 'High' : 'Moderate'
        });
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        studentId: currentUser.id,
        companionId: activeCompanionId,
        sender: 'bot',
        text: replyText || "No response received from companion.",
        timestamp: timestamp,
        isCrisisTriggered: isCrisisTriggered,
        riskTier: serverTier,
        riskTriggerPhrase: triggerPhrase,
        safetyNotice: safetyNotice,
        screeningResult: screeningResult
      };

      setMessages(prev => ({
        ...prev,
        [activeCompanionId]: [...(prev[activeCompanionId] || []), botMsg]
      }));

      if (serverTier === 3 || isCrisisTriggered) {
        onCrisisTriggered(true);
      } else if (serverTier === 2 || serverTier === 1) {
        setActiveInlineRiskTier({ tier: serverTier, context: text });
      }

      if (isSessionEnded || nextMsgCount >= MAX_SESSION_STUDENT_MESSAGES) {
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
      setStreamingText('');
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
      localStorage.removeItem('c3-lockout-timestamp');
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
      avatarBg: isDarkMode ? 'bg-[#2D2440] text-[#D8C7F0] ring-2 ring-[#3D3057]' : 'bg-[#F4EDFA] text-[#6E5496] ring-2 ring-[#EADBFA]',
      indicatorDot: isDarkMode ? 'bg-[#CDB4EC]' : 'bg-[#7D5EAA]'
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
      avatarBg: isDarkMode ? 'bg-[#3D281C] text-[#F5C79E] ring-2 ring-[#573926]' : 'bg-[#FDF3E7] text-[#B5783A] ring-2 ring-[#FCE5CF]',
      indicatorDot: isDarkMode ? 'bg-[#F2C9A3]' : 'bg-[#BF7B36]'
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
      avatarBg: isDarkMode ? 'bg-[#233527] text-[#A6DCB1] ring-2 ring-[#314D37]' : 'bg-[#EBF7EF] text-[#4A855A] ring-2 ring-[#D8EDE0]',
      indicatorDot: isDarkMode ? 'bg-[#A4DCB0]' : 'bg-[#3E7D50]'
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

          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {/* Discreet Message Counter */}
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                isDependencyDeescalation
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  : isDarkMode
                  ? 'bg-[#1D1714] text-[#A8988A] border-[#332A24]'
                  : 'bg-white text-[#786455] border-[#EFE3D5]'
              }`}
              title="Continuous student messages in this active session (40 maximum)"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-500" />
              <span>{consecutiveMessages} / {MAX_SESSION_STUDENT_MESSAGES} msgs</span>
            </span>

            {/* Safety & Privacy Disclosures */}
            <button
              type="button"
              onClick={() => setIsSafetyDisclosureOpen(true)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                isDarkMode
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/35'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title="Learn how message safety screening works and who reviews flagged concerns"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safety &amp; Review Policy</span>
            </button>

            {/* Offline Tools Access */}
            <button
              type="button"
              onClick={() => setIsOfflineToolsOpen(true)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                isDarkMode
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/35'
                  : 'bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 border-amber-300'
              }`}
              title="Open offline self-help tools (Guided Reflection, Problem-Solving Guide)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Offline Tools</span>
            </button>

            {/* Start New Session */}
            <button
              type="button"
              onClick={handleStartNewSession}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                isDarkMode
                  ? 'bg-[#221C18] hover:bg-[#2C241F] text-[#D0C0B0] border-[#3D332B]'
                  : 'bg-white hover:bg-[#F8F3ED] text-[#6D5A50] border-[#E9DFD2]'
              }`}
              title="Start a fresh session and reset message counter"
            >
              <RefreshCw className="w-3 h-3 text-emerald-500" />
              <span>Start New Session</span>
            </button>
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

                {/* Message Bubble & Safety Notice */}
                <div className="flex flex-col max-w-[85%] sm:max-w-[78%]">
                  <div
                    className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? `${themeStyles.userBubble} rounded-tr-xs`
                        : `${themeStyles.botBubble} rounded-tl-xs`
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Calm, Direct, Honest Student Safety Notice Card */}
                  {msg.safetyNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 p-3 sm:p-3.5 rounded-2xl border text-xs space-y-2 shadow-xs ${
                        isDarkMode
                          ? 'bg-[#241A16] border-[#4A3425] text-[#F0DFD0]'
                          : 'bg-[#FFF9F2] border-[#ECD5B8] text-[#5C3D24]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-bold text-amber-600 dark:text-amber-400">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Student Guidance Safeguard Notice</span>
                      </div>
                      <p className="leading-relaxed font-medium">
                        {msg.screeningResult?.savedToDb !== false
                          ? 'Your message has been noted for our guidance counselor to review during school hours.'
                          : 'We could not log this to the counselor dashboard right now. Please reach out to a counselor or trusted adult directly.'}
                      </p>
                      <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-[#C4B2A2]' : 'text-[#7D6B5E]'}`}>
                        C3 is not monitored 24/7 and is not an emergency service. Guidance counselor reviews take place during regular school hours (Monday–Friday, 8 AM – 5 PM).
                      </p>
                      <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSafetyDisclosureOpen(true)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 border border-amber-500/30 cursor-pointer"
                        >
                          View 24/7 Hotlines &amp; Protocols
                        </button>
                        <span className="text-[10px] opacity-70">
                          Non-punitive • Wellbeing Support
                        </span>
                      </div>
                    </motion.div>
                  )}
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

          {/* Thinking indicator and Streaming Response */}
          {isLoading && !streamingText && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-2.5"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-2xs shrink-0 ${themeStyles.avatarBg}`}>
                {activeCompanion.avatar}
              </div>
              <div
                className={`p-3 sm:p-3.5 rounded-2xl rounded-tl-xs text-xs sm:text-sm flex items-center space-x-2 shadow-2xs border ${
                  isDarkMode
                    ? 'bg-[#221A16] border-[#382D25] text-[#D8C7B8]'
                    : 'bg-white border-[#EFE6DC] text-[#695555]'
                }`}
              >
                <span className={`font-semibold ${themeStyles.accentColor}`}>
                  {activeCompanion.name} is thinking...
                </span>
                <span className="inline-flex items-center space-x-1 pl-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${themeStyles.indicatorDot} animate-bounce`} style={{ animationDelay: '0ms' }} />
                  <span className={`w-1.5 h-1.5 rounded-full ${themeStyles.indicatorDot} animate-bounce`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-1.5 h-1.5 rounded-full ${themeStyles.indicatorDot} animate-bounce`} style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </motion.div>
          )}

          {isLoading && streamingText && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-2.5"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-2xs shrink-0 ${themeStyles.avatarBg}`}>
                {activeCompanion.avatar}
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[78%] p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${themeStyles.botBubble} rounded-tl-xs`}
              >
                <span>{streamingText}</span>
                <span className={`inline-block w-1.5 h-3.5 ml-1 align-middle ${themeStyles.accentColor} animate-pulse`}>▍</span>
              </div>
            </motion.div>
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

            {/* 24-Hour Mandatory Digital Wellbeing Cooldown Notice */}
            <div className={`p-3 rounded-2xl max-w-md mx-auto text-xs border ${
              isDarkMode ? 'bg-[#15100E] border-[#382B21] text-[#A8988B]' : 'bg-[#FFF7ED] border-[#FED7AA] text-[#7C2D12]'
            }`}>
              <div className="font-bold flex items-center justify-center space-x-1.5 text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>24-Hour Digital Wellbeing Cooldown in Effect</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed">
                To prevent digital dependency and encourage real-world balance, AI companion chats are paused for 24 hours. Your offline self-reflection and guidance tools remain available below.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 flex-wrap pt-1">
              {/* [Start New Session] button */}
              <button
                type="button"
                onClick={handleStartNewSession}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Start New Session</span>
              </button>

              {/* [Self-Help & Offline Tools] button */}
              <button
                type="button"
                onClick={() => setIsOfflineToolsOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Offline Tools (No AI)</span>
              </button>

              {/* Option to return to Home Hub */}
              <button
                type="button"
                onClick={onBackToDashboard}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  isDarkMode ? 'border-[#3D332B] text-[#D0C0B0] hover:bg-[#2C241F]' : 'border-[#E9DFD2] text-[#6D5A50] hover:bg-[#F8F3ED]'
                }`}
              >
                <span>Return to Home Hub</span>
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
                disabled={isLoading}
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

      {/* AI Dependency Engine: Grounding & Wellbeing Break Modal */}
      <DependencyBreakModal
        isOpen={isDependencyBreakModalOpen}
        onClose={() => setIsDependencyBreakModalOpen(false)}
        onBackToHomeHub={() => {
          setIsDependencyBreakModalOpen(false);
          onBackToDashboard();
        }}
        onOpenOfflineTools={() => {
          setIsDependencyBreakModalOpen(false);
          setIsOfflineToolsOpen(true);
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

      {/* Student Safety, Privacy & Human Review Disclosure Modal */}
      <AnimatePresence>
        {isSafetyDisclosureOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 space-y-4 ${
                isDarkMode ? 'bg-[#1E1714] border-[#3D322B] text-[#EDE5DB]' : 'bg-white border-[#E8DDD0] text-[#3D2C2C]'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isDarkMode ? '#382E27' : '#E8DDD0' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Student Safety &amp; Human Review Policy</h3>
                    <p className={`text-[11px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                      Cabiao Senior High School • Guidance Safeguard Protocol
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSafetyDisclosureOpen(false)}
                  className="p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Core Disclosures */}
              <div className="space-y-3 text-xs leading-relaxed">
                <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isDarkMode ? 'bg-[#221A16] border-[#382D25]' : 'bg-[#FAF6F0] border-[#E8DDD0]'
                }`}>
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                    <span>1. What Gets Flagged &amp; Who Reviews It</span>
                  </h4>
                  <p>
                    Messages containing disclosures of potential self-harm, emotional distress, or personal safety risks are flagged for human review. These records are <strong>only accessible to authorized Cabiao Senior High School guidance counselors</strong> through an authenticated workspace. Your classmates and teachers cannot see your flags.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isDarkMode ? 'bg-[#221A16] border-[#382D25]' : 'bg-[#FAF6F0] border-[#E8DDD0]'
                }`}>
                  <h4 className="font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                    <span>2. Strictly Non-Disciplinary &amp; Caring Support</span>
                  </h4>
                  <p>
                    Safety screening exists exclusively to protect student wellbeing. It is <strong>never used for disciplinary records, punishment, or academic penalties</strong>. The purpose is to ensure that students experiencing hardship have access to caring human guidance.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
                  isDarkMode ? 'bg-[#221A16] border-[#382D25]' : 'bg-[#FAF6F0] border-[#E8DDD0]'
                }`}>
                  <h4 className="font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-1.5">
                    <span>3. Review Hours &amp; System Limitations</span>
                  </h4>
                  <p>
                    C3 is an <strong>academic research prototype</strong>. The AI does <em>not</em> make clinical diagnoses or provide medical treatment. Counselor reviews occur <strong>during regular school hours (Monday–Friday, 8:00 AM – 5:00 PM)</strong>. C3 is <strong>not monitored 24/7</strong> and is not an emergency dispatch service.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border space-y-2 ${
                  isDarkMode ? 'bg-[#2B1B1B] border-[#522929] text-[#FCDADA]' : 'bg-[#FFF5F5] border-[#FED7D7] text-[#742A2A]'
                }`}>
                  <h4 className="font-bold flex items-center space-x-1.5 text-rose-600 dark:text-rose-400">
                    <span>4. Immediate 24/7 Crisis Hotlines</span>
                  </h4>
                  <p className="text-[11px]">
                    If you or someone you know is in immediate danger, please reach out directly to 24/7 crisis specialists:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li><strong>NCMH Crisis Hotline:</strong> 1553 (toll-free nationwide), 0917-899-8727, 0966-351-4518</li>
                    <li><strong>In Touch Community Services:</strong> (02) 8893-7603, 0917-800-1123</li>
                    <li><strong>Hopeline Philippines:</strong> (02) 8804-4673, 0917-558-4673</li>
                    <li><strong>Cabiao SHS Guidance Office:</strong> Guidance Triage Unit, Cabiao, Nueva Ecija</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsSafetyDisclosureOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4A373] text-[#1E1712] hover:bg-[#C28F5E] cursor-pointer"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
