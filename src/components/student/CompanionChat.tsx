import React, { useState, useEffect, useRef } from 'react';
import { User, Companion, CompanionId, ChatMessage, MoodLog } from '../../types';
import { COMPANIONS } from '../../data/mockData';
import { Send, Sparkles, RefreshCw, AlertTriangle, ShieldCheck, Heart, Info, Bot, User as UserIcon } from 'lucide-react';

interface CompanionChatProps {
  currentUser: User;
  latestMoodLog?: MoodLog;
  onCrisisTriggered: () => void;
  selectedCompanionId: CompanionId;
  onSelectCompanion: (id: CompanionId) => void;
}

export const CompanionChat: React.FC<CompanionChatProps> = ({
  currentUser,
  latestMoodLog,
  onCrisisTriggered,
  selectedCompanionId,
  onSelectCompanion
}) => {
  const [messages, setMessages] = useState<Record<CompanionId, ChatMessage[]>>({
    casti: [],
    cedi: [],
    cali: []
  });
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCompanion = COMPANIONS.find(c => c.id === selectedCompanionId) || COMPANIONS[0];

  // Initialize companion initial greetings if message list is empty
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

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedCompanionId, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      studentId: currentUser.id,
      companionId: selectedCompanionId,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    // Update local state immediately with user message
    const companionHistory = messages[selectedCompanionId] || [];
    setMessages(prev => ({
      ...prev,
      [selectedCompanionId]: [...(prev[selectedCompanionId] || []), userMsg]
    }));
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId: selectedCompanionId,
          message: text,
          studentId: currentUser.id,
          studentName: currentUser.name,
          gradeSection: currentUser.gradeSection,
          history: companionHistory
        })
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        studentId: currentUser.id,
        companionId: selectedCompanionId,
        sender: 'bot',
        text: data.text || "I am right here with you.",
        timestamp: data.timestamp || new Date().toISOString(),
        isCrisisTriggered: data.isCrisisTriggered
      };

      setMessages(prev => ({
        ...prev,
        [selectedCompanionId]: [...(prev[selectedCompanionId] || []), botMsg]
      }));

      if (data.isCrisisTriggered) {
        onCrisisTriggered();
      }
    } catch (err) {
      console.error("Chat error:", err);
      // Fallback bot message
      const fallbackMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        studentId: currentUser.id,
        companionId: selectedCompanionId,
        sender: 'bot',
        text: `I'm here for you! (${activeCompanion.name} is listening). Remember, Cabiao SHS guidance office is also available anytime!`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [selectedCompanionId]: [...(prev[selectedCompanionId] || []), fallbackMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages(prev => ({
      ...prev,
      [selectedCompanionId]: [
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

  // Helper to suggest companion based on mood
  const getRecommendedCompanionId = (): CompanionId => {
    if (!latestMoodLog) return 'casti';
    if (latestMoodLog.moodType === 'anxious' || latestMoodLog.moodType === 'tired') return 'casti';
    if (latestMoodLog.moodType === 'sad' || latestMoodLog.moodScore <= 4) return 'cedi';
    return 'cali';
  };

  const recommendedId = getRecommendedCompanionId();
  const activeMessages = messages[selectedCompanionId] || [];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[550px] max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Companion Selection Bar */}
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        
        {/* Mood recommendation tip if applicable */}
        {latestMoodLog && (
          <div className="mb-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                Based on your recent mood check-in (<strong>{latestMoodLog.moodType}</strong>), we recommend chatting with <strong>{COMPANIONS.find(c => c.id === recommendedId)?.name}</strong>!
              </span>
            </div>
            {selectedCompanionId !== recommendedId && (
              <button
                type="button"
                onClick={() => onSelectCompanion(recommendedId)}
                className="px-2.5 py-1 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors text-[10px]"
              >
                Switch
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {COMPANIONS.map(comp => {
            const isSelected = comp.id === selectedCompanionId;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => onSelectCompanion(comp.id)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
                  isSelected
                    ? `bg-gradient-to-br ${comp.bgGradient} ${comp.borderColor} shadow-md ring-2 ring-emerald-500/30`
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl sm:text-2xl">{comp.avatar}</span>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white leading-none">
                      {comp.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5 max-w-[100px] sm:max-w-none">
                      {comp.title}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {comp.bestFor.split(',')[0]}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Companion Details Header */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
            {activeCompanion.avatar}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {activeCompanion.name} — {activeCompanion.title}
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                AI Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeCompanion.tagline} • Best for: {activeCompanion.bestFor}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Demo Trigger Button for Evaluators */}
          <button
            type="button"
            onClick={() => handleSendMessage("I am feeling really hopeless and I want to give up on everything...")}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 rounded-xl text-[11px] font-bold border border-rose-200 dark:border-rose-800 transition-colors"
            title="Click to test real-time crisis escalation simulation"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Test Crisis Escalation</span>
          </button>

          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Chat History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        
        {/* Safety & Ethics Banner */}
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-start space-x-3 text-xs text-teal-800 dark:text-teal-300">
          <ShieldCheck className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Confidential & Supportive Environment:</span>
            <span className="ml-1 opacity-90">
              Your conversations with {activeCompanion.name} are private. If severe distress is detected, our Cabiao SHS guidance team will be quietly alerted to offer help.
            </span>
          </div>
        </div>

        {activeMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm flex-shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : activeCompanion.avatar}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                
                <div className={`mt-1.5 flex items-center justify-end space-x-1 text-[10px] ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm shadow-sm">
              {activeCompanion.avatar}
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeCompanion.name} is typing</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Bar */}
      <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center space-x-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Suggestions:</span>
        </span>
        {activeCompanion.samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors flex-shrink-0 shadow-2xs"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
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
            placeholder={`Message ${activeCompanion.name}... (${activeCompanion.title})`}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl disabled:opacity-50 transition-all shadow-md shadow-emerald-500/20 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
