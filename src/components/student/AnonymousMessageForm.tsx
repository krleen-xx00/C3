import React, { useState } from 'react';
import { User, AnonymousMessage } from '../../types';
import { Shield, Send, CheckCircle2, Lock, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

interface AnonymousMessageFormProps {
  currentUser: User;
  anonymousMessages: AnonymousMessage[];
  onSendAnonymousMessage: (data: { category: AnonymousMessage['category']; subject: string; content: string; priority: 'normal' | 'urgent' }) => void;
}

const CATEGORIES: AnonymousMessage['category'][] = [
  'Academic Stress',
  'Personal & Family',
  'Bullying & Peer Issues',
  'Emotional Support',
  'General Inquiry'
];

export const AnonymousMessageForm: React.FC<AnonymousMessageFormProps> = ({
  currentUser,
  anonymousMessages,
  onSendAnonymousMessage
}) => {
  const [category, setCategory] = useState<AnonymousMessage['category']>('Academic Stress');
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSendAnonymousMessage({
      category,
      subject: subject || `${category} Inquiry`,
      content,
      priority
    });

    const mockCode = `ANON-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedCode(mockCode);
    setSubject('');
    setContent('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Privacy Guarantee Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-500 rounded-3xl text-white shadow-lg shadow-indigo-600/15">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
              Cabiao SHS Guidance Office • 100% Confidential
            </span>
            <h2 className="text-2xl font-black">Anonymous Counselor Desk</h2>
          </div>
        </div>
        <p className="text-xs text-indigo-50 max-w-2xl leading-relaxed">
          Need guidance or help with something heavy, but prefer not to reveal your name? Send an encrypted, identity-shielded message directly to Cabiao Senior High School guidance counselors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Form Box */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          
          <h3 className="text-base font-black text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Compose Anonymous Message</span>
          </h3>

          {generatedCode && (
            <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center space-x-2 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Message Delivered Safely to Counselor Inbox!</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Your Tracking Code is: <strong className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-emerald-600">{generatedCode}</strong>
              </p>
              <p className="text-[10px] text-slate-500">
                Counselors will review and reply anonymously. Check your inbox list on the right.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category / Topic
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                      category === cat
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject Title
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief title of your concern..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Urgency */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Urgency Level</p>
                <p className="text-[10px] text-slate-400">Mark as urgent if time-sensitive</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    priority === 'normal' ? 'bg-slate-200 text-slate-800' : 'text-slate-400'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    priority === 'urgent' ? 'bg-rose-500 text-white' : 'text-slate-400'
                  }`}
                >
                  Urgent
                </button>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Message Content
              </label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your situation or question freely. Your name and grade section will NOT be attached to this message."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message Anonymously</span>
            </button>

          </form>

        </div>

        {/* Anonymous Inbox & Status History */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Counselor Anonymous Inbox</span>
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {anonymousMessages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No anonymous messages sent yet.
                </p>
              ) : (
                anonymousMessages.map(msg => (
                  <div
                    key={msg.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded">
                        {msg.trackingCode}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        msg.status === 'replied'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {msg.status === 'replied' ? 'Replied by Counselor' : 'Pending Review'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {msg.subject}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      {msg.content}
                    </p>

                    {msg.counselorReply && (
                      <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/80 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                          💬 Guidance Counselor Response:
                        </span>
                        "{msg.counselorReply}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
