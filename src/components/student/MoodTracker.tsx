import React, { useState } from 'react';
import { User, MoodLog, MoodType } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Smile, Frown, Meh, Sparkles, Calendar, PlusCircle, CheckCircle, TrendingUp, Heart } from 'lucide-react';

interface MoodTrackerProps {
  currentUser: User;
  moodLogs: MoodLog[];
  onAddMoodLog: (log: Omit<MoodLog, 'id' | 'timestamp'>) => void;
}

const MOOD_OPTIONS: { type: MoodType; label: string; emoji: string; color: string; bg: string }[] = [
  { type: 'energetic', label: 'Energetic & Happy', emoji: '🤩', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300' },
  { type: 'calm', label: 'Calm & Peaceful', emoji: '😌', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300' },
  { type: 'anxious', label: 'Anxious / Stressed', emoji: '😰', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-950/60 border-purple-300' },
  { type: 'sad', label: 'Sad / Low Mood', emoji: '😔', color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-950/60 border-sky-300' },
  { type: 'tired', label: 'Tired / Burned Out', emoji: '😫', color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300' },
];

const FACTOR_TAGS = ['Exams/Schoolwork', 'Friends/Peers', 'Family', 'Sleep Quality', 'Physical Health', 'Self-care'];

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  currentUser,
  moodLogs,
  onAddMoodLog
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>('calm');
  const [moodScore, setMoodScore] = useState<number>(7);
  const [note, setNote] = useState<string>('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>(['Exams/Schoolwork']);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Filter logs for current student
  const studentLogs = moodLogs.filter(l => l.studentId === currentUser.id);

  // Prepare chart data sorted by date
  const chartData = [...studentLogs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14)
    .map(log => ({
      date: new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: log.moodScore,
      mood: log.moodType
    }));

  const handleFactorToggle = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter(f => f !== factor));
    } else {
      setSelectedFactors([...selectedFactors, factor]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMoodLog({
      studentId: currentUser.id,
      studentName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      moodType: selectedMood,
      moodScore,
      note,
      factors: selectedFactors
    });
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 rounded-3xl text-white shadow-lg shadow-emerald-500/15">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Daily Well-Being Check-In
            </span>
            <h2 className="text-2xl font-black">How is your heart and mind feeling today?</h2>
          </div>
        </div>
        <p className="text-xs text-emerald-50 max-w-2xl leading-relaxed">
          Log your daily mood in under 30 seconds. Tracking your emotions helps you understand patterns, reflect on school stress, and receive personalized support from C3 AI companions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Check-In Form Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-emerald-500" />
              <span>Today's Check-In</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {isSubmitted && (
            <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Awesome! Your check-in has been logged successfully.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Mood Emoji Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                1. Select primary feeling:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_OPTIONS.map(m => {
                  const isSelected = selectedMood === m.type;
                  return (
                    <button
                      key={m.type}
                      type="button"
                      onClick={() => setSelectedMood(m.type)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? `${m.bg} ring-2 ring-emerald-500 shadow-sm font-bold scale-105`
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className="text-2xl block">{m.emoji}</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block truncate mt-1">
                        {m.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intensity Gauge Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Overall Mood Level (1 - 10):
                </label>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {moodScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
                <span>Low / Down (1)</span>
                <span>Neutral (5)</span>
                <span>Great / Flourishing (10)</span>
              </div>
            </div>

            {/* Factor Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                3. Key influences on your mood today:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FACTOR_TAGS.map(factor => {
                  const active = selectedFactors.includes(factor);
                  return (
                    <button
                      key={factor}
                      type="button"
                      onClick={() => handleFactorToggle(factor)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}{factor}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                4. Optional Reflection / Note:
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a brief note about your day..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            >
              Save Today's Check-In
            </button>
          </form>
        </div>

        {/* Visual Trend Graph & History Card */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>Your Mood Trend (Recent Days)</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                14-Day View
              </span>
            </div>

            <div className="h-48 w-full mt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis domain={[1, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No check-ins logged yet. Complete your first check-in above!
                </div>
              )}
            </div>
          </div>

          {/* Recent History Feed */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-3">
              Recent Logged Entries
            </h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {studentLogs.slice(0, 5).map(log => {
                const opt = MOOD_OPTIONS.find(m => m.type === log.moodType) || MOOD_OPTIONS[1];
                return (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{opt.emoji}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-white capitalize">
                            {log.moodType}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                            Score: {log.moodScore}/10
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 line-clamp-1">
                            "{log.note}"
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {log.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
