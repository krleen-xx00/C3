import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, CompanionId, ChatMessage, MoodLog, RiskTier } from '../../types';
import { COMPANIONS } from '../../data/mockData';
import { Send, ArrowLeft, Wind, RefreshCw, Sparkles } from 'lucide-react';
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
}

export const CompanionRoomView: React.FC<CompanionRoomViewProps> = ({
  currentUser,
  companionId,
  isDarkMode = false,
  latestMoodLog,
  onBackToDashboard,
  onSwitchCompanionRoom,
  onCrisisTriggered
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

  const activeCompanion = COMPANIONS.find(c => c.id === companionId) || COMPANIONS[0];

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

  // Breathing timer cycle for Casti's calm room
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
  }, [messages, companionId, isLoading, activeInlineRiskTier]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Check risk tier locally as first-line analysis
    const localRiskCheck = classifyRisk(text);

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      studentId: currentUser.id,
      companionId: companionId,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      riskTier: localRiskCheck?.tier
    };

    const companionHistory = messages[companionId] || [];
    setMessages(prev => ({
      ...prev,
      [companionId]: [...(prev[companionId] || []), userMsg]
    }));
    setInputText('');
    setIsLoading(true);

    // If local check detects Tier 3, trigger full-screen crisis interstitial immediately
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
          companionId: companionId,
          message: text,
          studentId: currentUser.id,
          studentName: currentUser.name,
          gradeSection: currentUser.gradeSection,
          history: companionHistory
        })
      });

      const data = await response.json();
      const serverTier: RiskTier | undefined = data.riskTier || localRiskCheck?.tier;

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        studentId: currentUser.id,
        companionId: companionId,
        sender: 'bot',
        text: data.text || "I am right here with you.",
        timestamp: data.timestamp || new Date().toISOString(),
        isCrisisTriggered: data.isCrisisTriggered,
        riskTier: serverTier,
        riskTriggerPhrase: data.triggerPhrase
      };

      setMessages(prev => ({
        ...prev,
        [companionId]: [...(prev[companionId] || []), botMsg]
      }));

      // Handle Tier Responses
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
        companionId: companionId,
        sender: 'bot',
        text: `I'm here listening with you. Take all the time you need.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [companionId]: [...(prev[companionId] || []), fallbackMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setActiveInlineRiskTier(null);
    setMessages(prev => ({
      ...prev,
      [companionId]: [
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

  const activeMessages = messages[companionId] || [];

  // Theme styling for Day & Night modes
  const themeStyles = {
    casti: {
      topHeaderBg: isDarkMode
        ? 'bg-gradient-to-r from-[#1F1B2B] to-[#251F33] border-[#382E4F]'
        : 'bg-gradient-to-r from-[#F5F0FA] to-[#EDE5F8] border-[#E4D7F2]',
      accentText: isDarkMode ? 'text-[#BCA3E6]' : 'text-[#7D5EAA]',
      userBubble: isDarkMode ? 'bg-[#6A4D94] text-white' : 'bg-[#8A67B8] text-white shadow-xs',
      botBubble: isDarkMode ? 'bg-[#261E33] text-[#EDE5DB] border border-[#3E3154]' : 'bg-white text-[#3D2C2C] border border-[#EDE4F7] shadow-xs',
      buttonBg: isDarkMode ? 'bg-[#6A4D94] hover:bg-[#5C4182] text-white' : 'bg-[#8A67B8] hover:bg-[#7854A6] text-white',
      promptPill: isDarkMode
        ? 'bg-[#221A2E] hover:bg-[#2E233E] text-[#D8C7F0] border-[#3D2F54]'
        : 'bg-white hover:bg-[#F5F0FA] text-[#6E5496] border-[#E4D7F2] shadow-2xs',
      roomTitle: "Casti's Quiet Corner",
      subTitle: "The Calm Listener • A quiet, soothing space",
      avatarBg: isDarkMode ? 'bg-[#2D2440] text-[#D8C7F0] ring-2 ring-[#3D3057]' : 'bg-white text-[#6E5496] ring-2 ring-[#EADBFA]'
    },
    cedi: {
      topHeaderBg: isDarkMode
        ? 'bg-gradient-to-r from-[#2E2017] to-[#36261B] border-[#4E3524]'
        : 'bg-gradient-to-r from-[#FDF3EB] to-[#FAECE0] border-[#F5DCBE]',
      accentText: isDarkMode ? 'text-[#E8AF7D]' : 'text-[#BF7B36]',
      userBubble: isDarkMode ? 'bg-[#B07238] text-white' : 'bg-[#D68B45] text-white shadow-xs',
      botBubble: isDarkMode ? 'bg-[#302118] text-[#EDE5DB] border border-[#4F3626]' : 'bg-white text-[#3D2C2C] border border-[#F5E6D6] shadow-xs',
      buttonBg: isDarkMode ? 'bg-[#B07238] hover:bg-[#9C622D] text-white' : 'bg-[#D68B45] hover:bg-[#C27832] text-white',
      promptPill: isDarkMode
        ? 'bg-[#281A12] hover:bg-[#382418] text-[#F5C79E] border-[#4E3220]'
        : 'bg-white hover:bg-[#FDF3EB] text-[#A6692E] border-[#F5DCBE] shadow-2xs',
      roomTitle: "Cedi's Warm Space",
      subTitle: "The Gentle Encourager • Uplifting & hopeful",
      avatarBg: isDarkMode ? 'bg-[#3D281C] text-[#F5C79E] ring-2 ring-[#573926]' : 'bg-white text-[#B5783A] ring-2 ring-[#FCE5CF]'
    },
    cali: {
      topHeaderBg: isDarkMode
        ? 'bg-gradient-to-r from-[#1A261D] to-[#1F2F23] border-[#2B4232]'
        : 'bg-gradient-to-r from-[#EFF6F0] to-[#E3EFE5] border-[#D3E7D6]',
      accentText: isDarkMode ? 'text-[#96D1A2]' : 'text-[#4F8C60]',
      userBubble: isDarkMode ? 'bg-[#4B855B] text-white' : 'bg-[#619E72] text-white shadow-xs',
      botBubble: isDarkMode ? 'bg-[#1C2C20] text-[#EDE5DB] border border-[#2F4736]' : 'bg-white text-[#3D2C2C] border border-[#E0EFE3] shadow-xs',
      buttonBg: isDarkMode ? 'bg-[#4B855B] hover:bg-[#3F724D] text-white' : 'bg-[#619E72] hover:bg-[#508B60] text-white',
      promptPill: isDarkMode
        ? 'bg-[#152418] hover:bg-[#1E3323] text-[#A6DCB1] border-[#29422F]'
        : 'bg-white hover:bg-[#EFF6F0] text-[#3E734D] border-[#D3E7D6] shadow-2xs',
      roomTitle: "Cali's Cozy Room",
      subTitle: "The Grounded Friend • Easygoing & down-to-earth",
      avatarBg: isDarkMode ? 'bg-[#233527] text-[#A6DCB1] ring-2 ring-[#314D37]' : 'bg-white text-[#4A855A] ring-2 ring-[#D8EDE0]'
    }
  }[companionId];

  return (
    <div className={`max-w-4xl mx-auto pt-16 sm:pt-20 pb-8 px-4 space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'
    }`}>
      
      {/* Top Header & Navigation Bar */}
      <div className={`p-5 sm:p-6 rounded-[32px] ${themeStyles.topHeaderBg} border shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        
        {/* Back Button & Companion Name */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onBackToDashboard}
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center space-x-1.5 text-xs font-semibold shadow-2xs hover:scale-102 cursor-pointer ${
              isDarkMode
                ? 'bg-[#221B17] hover:bg-[#2D241F] text-[#EDE5DB] border-[#3D332B]'
                : 'bg-white hover:bg-[#FAF7F2] text-[#3D2C2C] border-[#E8DFD3]'
            }`}
          >
            <ArrowLeft className={`w-4 h-4 ${isDarkMode ? 'text-[#A89A8D]' : 'text-[#756262]'}`} />
            <span>Back home</span>
          </button>

          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${themeStyles.avatarBg}`}>
              {activeCompanion.avatar}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                {themeStyles.roomTitle}
              </h1>
              <p className={`text-xs font-medium ${themeStyles.accentText}`}>
                {themeStyles.subTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Switch companion links */}
        <div className={`flex items-center space-x-2 self-start sm:self-auto p-1.5 rounded-2xl border shadow-2xs ${
          isDarkMode ? 'bg-[#1F1916]/90 border-[#382F28]' : 'bg-white/85 border-[#EFE8DF]'
        }`}>
          <span className={`text-[11px] px-2 font-semibold ${isDarkMode ? 'text-[#A89A8D]' : 'text-[#8C7A7A]'}`}>
            Switch:
          </span>
          {COMPANIONS.map((comp) => {
            const isActive = comp.id === companionId;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => onSwitchCompanionRoom(comp.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? isDarkMode
                      ? 'bg-[#382B22] text-[#EDE5DB] shadow-xs font-bold'
                      : 'bg-[#FAF4EC] text-[#3D2C2C] shadow-xs font-bold border border-[#EADBCA]'
                    : isDarkMode
                      ? 'text-[#A89A8D] hover:text-[#EDE5DB]'
                      : 'text-[#756262] hover:text-[#3D2C2C]'
                }`}
              >
                <span>{comp.avatar}</span>
                <span className="ml-1">{comp.name}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Specialty Breathing guide for Casti */}
      {companionId === 'casti' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className={`text-xs flex items-center space-x-1.5 ${isDarkMode ? 'text-[#A89A8D]' : 'text-[#756262]'}`}>
              <Wind className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#BCA3E6]' : 'text-[#7D5EAA]'}`} />
              <span>Need a quiet pause?</span>
            </span>
            <button
              type="button"
              onClick={() => setShowBreathingTool(!showBreathingTool)}
              className={`text-xs hover:underline font-semibold cursor-pointer ${
                isDarkMode ? 'text-[#BCA3E6]' : 'text-[#7D5EAA]'
              }`}
            >
              {showBreathingTool ? 'Close breathing guide' : 'Try 1-minute breathing'}
            </button>
          </div>

          {showBreathingTool && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-[28px] p-6 text-center border shadow-sm space-y-4 ${
                isDarkMode
                  ? 'bg-gradient-to-b from-[#221B2E] to-[#1B1525] border-[#3D2E54]'
                  : 'bg-gradient-to-b from-[#F7F2FC] to-[#EFE7F8] border-[#E4D5F5]'
              }`}
            >
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-[#D8C7F0]' : 'text-[#6E5496]'}`}>
                Gentle Breathing Rhythm
              </p>
              <div className="flex justify-center my-4">
                <motion.div
                  animate={{
                    scale: breathingPhase === 'inhale' ? 1.3 : breathingPhase === 'hold' ? 1.3 : 1,
                    opacity: breathingPhase === 'hold' ? 0.9 : 1
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className={`w-22 h-22 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-md ${
                    isDarkMode
                      ? 'bg-[#2E2240] border-[#533D73] text-[#D8C7F0]'
                      : 'bg-white border-[#CDB3E8] text-[#6E5496]'
                  }`}
                >
                  <span className="capitalize tracking-wide">{breathingPhase}</span>
                </motion.div>
              </div>
              <p className={`text-xs italic font-medium ${isDarkMode ? 'text-[#BCA3E6]' : 'text-[#7D5EAA]'}`}>
                {breathingPhase === 'inhale' && "Breathe in softly through your nose..."}
                {breathingPhase === 'hold' && "Hold gently and relax your shoulders..."}
                {breathingPhase === 'exhale' && "Exhale slowly and let go of tension..."}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Main Chat Container */}
      <div className={`rounded-[36px] border overflow-hidden flex flex-col h-[550px] transition-all duration-300 ${
        isDarkMode
          ? 'bg-[#201A17]/95 backdrop-blur-md border-[#382F28] shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
          : 'bg-[#FFFDF9]/95 backdrop-blur-md border-[#F2E8DC] shadow-[0_8px_32px_rgba(180,140,110,0.07)]'
      }`}>
        
        {/* Chat Header Controls */}
        <div className={`px-6 py-3.5 border-b flex items-center justify-between ${
          isDarkMode ? 'border-[#332A24]' : 'border-[#F2E9DE]'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#74A280] animate-pulse" />
            <p className={`text-xs font-medium ${isDarkMode ? 'text-[#A89A8D]' : 'text-[#857070]'}`}>
              Private & gentle space with {activeCompanion.name}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className={`p-1.5 px-2.5 rounded-xl transition-colors text-xs flex items-center space-x-1.5 cursor-pointer ${
              isDarkMode
                ? 'text-[#8C7E72] hover:text-[#EDE5DB] hover:bg-[#2D231E]'
                : 'text-[#A69797] hover:text-[#5E4747] hover:bg-[#FAF4EC]'
            }`}
            title="Start a fresh conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Clear</span>
          </button>
        </div>

        {/* Messages Feed */}
        <div className={`flex-1 p-5 sm:p-6 overflow-y-auto space-y-4.5 ${
          isDarkMode ? 'bg-[#181310]/50' : 'bg-[#FAF6F0]/50'
        }`}>
          {activeMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0 shadow-2xs ${
                  isUser
                    ? themeStyles.buttonBg
                    : themeStyles.avatarBg
                }`}>
                  {isUser ? '👤' : activeCompanion.avatar}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] sm:max-w-[72%] p-4 sm:p-4.5 rounded-[24px] text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? `${themeStyles.userBubble} rounded-tr-xs`
                    : `${themeStyles.botBubble} rounded-tl-xs`
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            );
          })}

          {/* Inline Tier 1 or Tier 2 Resource Card when triggered */}
          {activeInlineRiskTier && (
            <div className="pt-2">
              <TieredResourceCard
                tier={activeInlineRiskTier.tier}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
                triggerContext={activeInlineRiskTier.context}
                onDismissTier2Prompt={() => {
                  // Keep the calming resources, dismiss prompt
                }}
                onConnectGuidance={() => {
                  // Connection sent
                }}
              />
            </div>
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2.5">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base shadow-2xs ${themeStyles.avatarBg}`}>
                {activeCompanion.avatar}
              </div>
              <div className={`p-4 rounded-[22px] rounded-tl-xs text-xs flex items-center space-x-2 shadow-2xs ${
                isDarkMode
                  ? 'bg-[#29221C] border border-[#3D332B] text-[#A89A8D]'
                  : 'bg-white border border-[#EFE6DC] text-[#8C7A7A]'
              }`}>
                <span>{activeCompanion.name} is thinking with care</span>
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div className={`px-5 py-3 border-t flex items-center space-x-2 overflow-x-auto scrollbar-none ${
          isDarkMode
            ? 'bg-[#1C1613] border-[#332A24]'
            : 'bg-[#FAF5EE] border-[#F2EAE0]'
        }`}>
          <span className={`text-[11px] font-semibold flex-shrink-0 flex items-center space-x-1 ${
            isDarkMode ? 'text-[#9E8F82]' : 'text-[#8C7575]'
          }`}>
            <Sparkles className="w-3 h-3" />
            <span>Ideas:</span>
          </span>
          {activeCompanion.samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className={`px-3.5 py-1.5 text-xs rounded-full border transition-all flex-shrink-0 font-normal hover:scale-102 cursor-pointer ${themeStyles.promptPill}`}
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className={`p-4 border-t ${
          isDarkMode
            ? 'bg-[#201A17] border-[#382F28]'
            : 'bg-white border-[#F2EAE0]'
        }`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Write a quiet thought to ${activeCompanion.name}...`}
              className={`flex-1 px-4.5 py-3.5 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                isDarkMode
                  ? 'bg-[#181310] border-[#3D332B] text-[#EDE5DB] placeholder-[#786D63] focus:ring-1 focus:ring-[#8C7662]'
                  : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#A69797] focus:ring-1 focus:ring-[#C9B39F]'
              }`}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-3.5 ${themeStyles.buttonBg} rounded-2xl disabled:opacity-40 transition-all flex-shrink-0 hover:scale-105 cursor-pointer shadow-xs`}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
