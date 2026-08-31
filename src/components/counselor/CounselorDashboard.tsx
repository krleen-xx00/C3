import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  RotateCcw,
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  Lock,
  Filter,
  Check,
  Clock,
  Sparkles,
  Info,
  LogOut,
  UserCheck,
  Building2,
  FileBadge
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { CounselorUser } from '../../types';
import {
  getActiveCounselorSession,
  setActiveCounselorSession,
  DEFAULT_COUNSELORS
} from '../../data/counselorData';
import { CounselorAuthView } from './CounselorAuthView';
import { CounselorProfileModal } from './CounselorProfileModal';

export interface CounselorAlert {
  id: string;
  studentName: string;
  gradeSection: string;
  timestamp: string;
  timeAgo: string;
  type: 'high_priority' | 'student_requested';
  flagReason: string;
  status: 'active' | 'contacted' | 'resolved';
  resolvedAt?: string;
  handledBy?: string;
  resolvedBy?: string;
}

const INITIAL_COUNSELOR_ALERTS: CounselorAlert[] = [
  {
    id: 'alt_001',
    studentName: 'Angelo D. Bautista',
    gradeSection: 'Grade 12 - STEM A',
    timestamp: '2026-08-27T13:52:00Z',
    timeAgo: '15 mins ago',
    type: 'high_priority',
    flagReason: 'High-risk emotional distress indicators detected during companion check-in (repeated hopelessness expressions and severe burnout).',
    status: 'active'
  },
  {
    id: 'alt_002',
    studentName: 'Samantha Nicole Cruz',
    gradeSection: 'Grade 11 - HUMSS B',
    timestamp: '2026-08-27T13:20:00Z',
    timeAgo: '48 mins ago',
    type: 'high_priority',
    flagReason: 'Acute crisis language identified during Casti chat session; high distress threshold reached with acute overwhelm.',
    status: 'active'
  },
  {
    id: 'alt_003',
    studentName: 'Princess Mae Del Rosario',
    gradeSection: 'Grade 11 - TVL ICT',
    timestamp: '2026-08-27T11:30:00Z',
    timeAgo: '2.5 hrs ago',
    type: 'student_requested',
    flagReason: 'Student clicked "Request Guidance Counselor Talk" after checking in as Heavy, noting academic stress with research defense.',
    status: 'active'
  },
  {
    id: 'alt_004',
    studentName: 'Christian Joshua Ramos',
    gradeSection: 'Grade 12 - ABM A',
    timestamp: '2026-08-27T09:15:00Z',
    timeAgo: '5 hrs ago',
    type: 'high_priority',
    flagReason: 'Tier 3 distress escalation triggered: persistent low energy logs across 4 consecutive days with isolation keywords.',
    status: 'active'
  },
  {
    id: 'alt_005',
    studentName: 'Mark Kenneth Garcia',
    gradeSection: 'Grade 12 - HUMSS A',
    timestamp: '2026-08-27T08:40:00Z',
    timeAgo: '6 hrs ago',
    type: 'student_requested',
    flagReason: 'Student submitted a direct request for a 1-on-1 counseling slot regarding family expectations and career anxiety.',
    status: 'active'
  },
  {
    id: 'alt_006',
    studentName: 'Hannah Beatrice Tolentino',
    gradeSection: 'Grade 11 - STEM B',
    timestamp: '2026-08-26T16:15:00Z',
    timeAgo: 'Yesterday at 4:15 PM',
    type: 'high_priority',
    flagReason: 'Companion safety protocol flagged abrupt mood decline paired with negative self-appraisal during exam week.',
    status: 'active'
  },
  {
    id: 'alt_007',
    studentName: 'John David Manalo',
    gradeSection: 'Grade 12 - GAS',
    timestamp: '2026-08-26T13:10:00Z',
    timeAgo: 'Yesterday at 1:10 PM',
    type: 'student_requested',
    flagReason: 'Student requested guidance consultation regarding peer dynamics and group project conflict.',
    status: 'active'
  }
];

interface MoodTrendPoint {
  label: string;
  Heavy: number;
  Restless: number;
  Quiet: number;
  Warm: number;
  Joyful: number;
}

// 4-week sample data representing school-wide anonymized mood distribution
const SCHOOL_MOOD_TRENDS_DATA: MoodTrendPoint[] = [
  {
    label: 'Week 1 (Aug 1-7)',
    Heavy: 42,
    Restless: 68,
    Quiet: 110,
    Warm: 185,
    Joyful: 145
  },
  {
    label: 'Week 2 (Aug 8-14)',
    Heavy: 58,
    Restless: 94,
    Quiet: 125,
    Warm: 160,
    Joyful: 132
  },
  {
    label: 'Week 3 (Aug 15-21 - Exams)',
    Heavy: 89,
    Restless: 142,
    Quiet: 118,
    Warm: 135,
    Joyful: 98
  },
  {
    label: 'Week 4 (Aug 22-27 - Current)',
    Heavy: 45,
    Restless: 76,
    Quiet: 130,
    Warm: 198,
    Joyful: 164
  }
];

const DAILY_MOOD_TRENDS_DATA: MoodTrendPoint[] = [
  { label: 'Mon', Heavy: 14, Restless: 22, Quiet: 31, Warm: 48, Joyful: 38 },
  { label: 'Tue', Heavy: 11, Restless: 18, Quiet: 34, Warm: 52, Joyful: 44 },
  { label: 'Wed', Heavy: 16, Restless: 24, Quiet: 29, Warm: 46, Joyful: 40 },
  { label: 'Thu', Heavy: 9, Restless: 15, Quiet: 32, Warm: 55, Joyful: 49 },
  { label: 'Fri', Heavy: 6, Restless: 12, Quiet: 26, Warm: 62, Joyful: 65 },
  { label: 'Sat', Heavy: 4, Restless: 7, Quiet: 18, Warm: 45, Joyful: 48 },
  { label: 'Sun', Heavy: 5, Restless: 9, Quiet: 22, Warm: 42, Joyful: 42 }
];

interface CounselorDashboardProps {
  isDarkMode: boolean;
}

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({ isDarkMode }) => {
  // Counselor Authentication State
  const [activeCounselor, setActiveCounselor] = useState<CounselorUser | null>(() => {
    return getActiveCounselorSession();
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const [activeViewTab, setActiveViewTab] = useState<'alerts' | 'trends'>('alerts');
  const [alertsSubTab, setAlertsSubTab] = useState<'active' | 'resolved'>('active');
  const [alerts, setAlerts] = useState<CounselorAlert[]>(INITIAL_COUNSELOR_ALERTS);
  const [selectedChartRange, setSelectedChartRange] = useState<'weekly' | 'daily'>('weekly');

  const handleLoginSuccess = (counselor: CounselorUser) => {
    setActiveCounselor(counselor);
    setActiveCounselorSession(counselor);
  };

  const handleSignOut = () => {
    setActiveCounselor(null);
    setActiveCounselorSession(null);
  };

  const handleMarkAsContacted = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          const nextStatus = a.status === 'contacted' ? 'active' : 'contacted';
          return {
            ...a,
            status: nextStatus,
            handledBy: nextStatus === 'contacted' ? (activeCounselor?.name || 'Assigned Counselor') : undefined
          };
        }
        return a;
      })
    );
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          return {
            ...a,
            status: 'resolved',
            resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resolvedBy: activeCounselor?.name || 'Guidance Counselor'
          };
        }
        return a;
      })
    );
  };

  const handleReopenAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          return { ...a, status: 'active', resolvedAt: undefined, resolvedBy: undefined };
        }
        return a;
      })
    );
  };

  // If counselor is not logged in, show the Login & Sign Up page
  if (!activeCounselor) {
    return (
      <CounselorAuthView
        isDarkMode={isDarkMode}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Active alerts: sort by urgency first (high_priority before student_requested), then by recency
  const activeAlerts = alerts
    .filter(a => a.status === 'active' || a.status === 'contacted')
    .sort((a, b) => {
      if (a.type === 'high_priority' && b.type !== 'high_priority') return -1;
      if (a.type !== 'high_priority' && b.type === 'high_priority') return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const resolvedAlerts = alerts
    .filter(a => a.status === 'resolved')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const highPriorityCount = activeAlerts.filter(a => a.type === 'high_priority').length;
  const studentRequestedCount = activeAlerts.filter(a => a.type === 'student_requested').length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 space-y-6">
      
      {/* Counselor View Header Bar with Active Logged-in Counselor Details */}
      <div
        id="counselor-header-bar"
        className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 shadow-sm ${
          isDarkMode
            ? 'bg-[#221C18] border-[#382E27] text-[#EDE5DB]'
            : 'bg-white border-[#E8DDD0] text-[#3D2C2C]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-white ring-1 ring-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src="/logo.png"
                alt="School Seal"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span
                  className={`text-sm sm:text-base font-black tracking-tight ${
                    isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'
                  }`}
                >
                  Cabiao National Senior High School
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                    isDarkMode
                      ? 'bg-[#362719] text-[#E0A868] border-[#593E25]'
                      : 'bg-[#FFF6EC] text-[#9E632B] border-[#F2DAC4]'
                  }`}
                >
                  Guidance Counselor Portal
                </span>
              </div>
              <p className={`text-[11px] font-medium ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                {activeCounselor.department} • 📍 {activeCounselor.assignedCluster || 'All Clusters'}
              </p>
            </div>
          </div>

          {/* Right: Active Counselor Card with Profile & Sign Out Actions */}
          <div className="flex items-center space-x-2 self-start lg:self-center flex-wrap gap-y-2">
            
            {/* Clickable Counselor Badge */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className={`p-1.5 pr-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center space-x-2.5 text-left group ${
                isDarkMode
                  ? 'bg-[#2B231D] hover:bg-[#352B23] border-[#44362B] text-[#EDE5DB]'
                  : 'bg-[#FAF6F0] hover:bg-[#F3EBE0] border-[#EAE0D2] text-[#3D2C2C]'
              }`}
              title="Click to view counselor credentials and license information"
            >
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                    isDarkMode
                      ? 'bg-[#3E2E21] text-[#F3D5B5] ring-1 ring-[#5C4533]'
                      : 'bg-[#EBDCCB] text-[#5C3B20] ring-1 ring-[#D8C2AA]'
                  }`}
                >
                  {activeCounselor.initials}
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-[#2B231D]"
                  title="On Duty"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs sm:text-[13px] font-extrabold truncate group-hover:text-amber-700 dark:group-hover:text-amber-300">
                    {activeCounselor.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <p className={`text-[10px] truncate ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                  {activeCounselor.title} • {activeCounselor.licenseNo || 'RGC Verified'}
                </p>
              </div>
            </button>

            {/* Profile modal toggle */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#2B231D] hover:bg-[#352B23] border-[#44362B] text-[#C9BAAB]'
                  : 'bg-white hover:bg-[#FAF4EB] border-[#D8C6B2] text-[#5E4747]'
              }`}
              title="Counselor Profile & Credentials"
            >
              <UserCheck className="w-4 h-4" />
            </button>

            {/* Switch / Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                isDarkMode
                  ? 'bg-[#2A1D1B] hover:bg-[#382320] border-[#4A2621] text-[#FCA5A5]'
                  : 'bg-[#FFF5F5] hover:bg-[#FEE2E2] border-[#FBD5D5] text-[#DC2626]'
              }`}
              title="Sign out or switch counselor"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher: Flagged Alerts Queue vs School-Wide Mood Trends */}
      <div className="flex items-center justify-between border-b pb-3 gap-2 flex-wrap" style={{ borderColor: isDarkMode ? '#382E27' : '#E8DDD0' }}>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="tab-flagged-alerts"
            onClick={() => setActiveViewTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'alerts'
                ? isDarkMode
                  ? 'bg-[#D4A373] text-[#1E1712] shadow-sm font-bold'
                  : 'bg-[#8F5B34] text-white shadow-sm font-bold'
                : isDarkMode
                ? 'bg-[#241E1A] text-[#B8A796] hover:text-[#EDE5DB] border border-[#3A3028]'
                : 'bg-white text-[#6E5959] hover:text-[#3D2C2C] border border-[#E8DDD0]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Flagged Alerts Queue</span>
            {activeAlerts.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeViewTab === 'alerts'
                    ? isDarkMode
                      ? 'bg-[#1E1712] text-[#D4A373]'
                      : 'bg-white text-[#8F5B34]'
                    : isDarkMode
                    ? 'bg-[#3D251C] text-[#F87171]'
                    : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}
              >
                {activeAlerts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-mood-trends"
            onClick={() => setActiveViewTab('trends')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'trends'
                ? isDarkMode
                  ? 'bg-[#D4A373] text-[#1E1712] shadow-sm font-bold'
                  : 'bg-[#8F5B34] text-white shadow-sm font-bold'
                : isDarkMode
                ? 'bg-[#241E1A] text-[#B8A796] hover:text-[#EDE5DB] border border-[#3A3028]'
                : 'bg-white text-[#6E5959] hover:text-[#3D2C2C] border border-[#E8DDD0]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>School-Wide Mood Trends</span>
          </button>
        </div>

        {/* Quiet ethics indicator */}
        <div
          className={`flex items-center space-x-1.5 text-[11px] font-medium ${
            isDarkMode ? 'text-[#968677]' : 'text-[#8C7575]'
          }`}
        >
          <Lock className="w-3.5 h-3.5 opacity-80" />
          <span>Confidential Triage &amp; Anonymized Aggregates</span>
        </div>
      </div>

      {/* VIEW 1: FLAGGED ALERTS QUEUE */}
      {activeViewTab === 'alerts' && (
        <div className="space-y-4">
          
          {/* Sub-tab counter bar: Active Alerts (X) and Resolved (X) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                id="subtab-active-alerts"
                onClick={() => setAlertsSubTab('active')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  alertsSubTab === 'active'
                    ? isDarkMode
                      ? 'bg-[#382E27] text-[#EDE5DB] border border-[#52443A]'
                      : 'bg-[#EAE0D2] text-[#3D2C2C] border border-[#D5C6B3]'
                    : isDarkMode
                    ? 'text-[#A8988A] hover:text-[#EDE5DB]'
                    : 'text-[#7D6666] hover:text-[#3D2C2C]'
                }`}
              >
                Active Alerts ({activeAlerts.length})
              </button>

              <button
                type="button"
                id="subtab-resolved-alerts"
                onClick={() => setAlertsSubTab('resolved')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  alertsSubTab === 'resolved'
                    ? isDarkMode
                      ? 'bg-[#382E27] text-[#EDE5DB] border border-[#52443A]'
                      : 'bg-[#EAE0D2] text-[#3D2C2C] border border-[#D5C6B3]'
                    : isDarkMode
                    ? 'text-[#A8988A] hover:text-[#EDE5DB]'
                    : 'text-[#7D6666] hover:text-[#3D2C2C]'
                }`}
              >
                Resolved ({resolvedAlerts.length})
              </button>
            </div>

            {/* Quick tally breakdown */}
            {alertsSubTab === 'active' && (
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span className={isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}>
                    High Priority: <strong>{highPriorityCount}</strong>
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span className={isDarkMode ? 'text-[#C9BAAB]' : 'text-[#5E4747]'}>
                    Student Requested: <strong>{studentRequestedCount}</strong>
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* ACTIVE ALERTS LIST */}
          {alertsSubTab === 'active' && (
            <div className="space-y-3">
              {activeAlerts.length === 0 ? (
                <div
                  className={`p-10 rounded-2xl border text-center space-y-2 ${
                    isDarkMode
                      ? 'bg-[#221C18] border-[#382E27] text-[#EDE5DB]'
                      : 'bg-white border-[#E8DDD0] text-[#3D2C2C]'
                  }`}
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold">All active alerts are resolved</p>
                  <p className={`text-xs ${isDarkMode ? 'text-[#968677]' : 'text-[#8C7575]'}`}>
                    Great job! You can review past interventions in the Resolved tab.
                  </p>
                </div>
              ) : (
                activeAlerts.map(alert => {
                  const isHighPriority = alert.type === 'high_priority';
                  const isContacted = alert.status === 'contacted';

                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isDarkMode
                          ? isHighPriority
                            ? 'bg-[#251A18] border-[#4A2621] hover:border-[#63322B]'
                            : 'bg-[#241F1B] border-[#423321] hover:border-[#57442D]'
                          : isHighPriority
                          ? 'bg-[#FFF7F7] border-[#FBD5D5] hover:border-[#F8B4B4]'
                          : 'bg-[#FFFBF5] border-[#FDE8CC] hover:border-[#FCD39B]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        
                        {/* Left: Type badge + student info + flag reason */}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                            {/* Distinct visual badge */}
                            {isHighPriority ? (
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span>High Priority</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Student Requested</span>
                              </span>
                            )}

                            <span
                              className={`text-sm sm:text-[15px] font-bold ${
                                isDarkMode ? 'text-[#EDE5DB]' : 'text-[#2D1F1F]'
                              }`}
                            >
                              {alert.studentName}
                            </span>

                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                isDarkMode ? 'bg-[#382E27] text-[#C9BAAB]' : 'bg-[#EFE5D8] text-[#5E4747]'
                              }`}
                            >
                              {alert.gradeSection}
                            </span>

                            <span
                              className={`text-xs flex items-center space-x-1 ${
                                isDarkMode ? 'text-[#968677]' : 'text-[#8C7575]'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{alert.timeAgo}</span>
                            </span>

                            {isContacted && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center space-x-1">
                                <PhoneCall className="w-3 h-3" />
                                <span>Contacted {alert.handledBy ? `by ${alert.handledBy}` : ''}</span>
                              </span>
                            )}
                          </div>

                          {/* Short flag reason description */}
                          <p
                            className={`text-xs sm:text-[13px] font-normal leading-relaxed ${
                              isDarkMode ? 'text-[#C9BAAB]' : 'text-[#4A3737]'
                            }`}
                          >
                            {alert.flagReason}
                          </p>
                        </div>

                        {/* Right: Action buttons */}
                        <div className="flex items-center space-x-2 self-start md:self-center flex-shrink-0 pt-2 md:pt-0">
                          <button
                            type="button"
                            onClick={() => handleMarkAsContacted(alert.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                              isContacted
                                ? isDarkMode
                                  ? 'bg-[#1F2B38] border-[#324861] text-[#93C5FD]'
                                  : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
                                : isDarkMode
                                ? 'bg-[#2C241F] hover:bg-[#382E27] border-[#44362B] text-[#D8C7B5]'
                                : 'bg-white hover:bg-[#FAF4EB] border-[#D8C6B2] text-[#4A3737]'
                            }`}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{isContacted ? 'Contacted ✓' : 'Mark as Contacted'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResolveAlert(alert.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                              isDarkMode
                                ? 'bg-[#2E3B2D] hover:bg-[#3B4D3A] text-[#A7F3D0] border border-[#435C41]'
                                : 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* RESOLVED ALERTS LIST */}
          {alertsSubTab === 'resolved' && (
            <div className="space-y-3">
              {resolvedAlerts.length === 0 ? (
                <div
                  className={`p-10 rounded-2xl border text-center space-y-2 ${
                    isDarkMode
                      ? 'bg-[#221C18] border-[#382E27] text-[#EDE5DB]'
                      : 'bg-white border-[#E8DDD0] text-[#3D2C2C]'
                  }`}
                >
                  <Info className="w-8 h-8 opacity-40 mx-auto" />
                  <p className="text-sm font-semibold">No resolved alerts yet</p>
                  <p className={`text-xs ${isDarkMode ? 'text-[#968677]' : 'text-[#8C7575]'}`}>
                    Resolved alerts will appear here as you close cases.
                  </p>
                </div>
              ) : (
                resolvedAlerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDarkMode
                        ? 'bg-[#1E1916]/80 border-[#332A24] text-[#A8988A]'
                        : 'bg-[#F9F6F0]/80 border-[#E8DFD3] text-[#6E5959]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Resolved
                          </span>
                          <span className="text-sm font-bold line-through opacity-85">
                            {alert.studentName}
                          </span>
                          <span className="text-xs opacity-75">
                            {alert.gradeSection}
                          </span>
                          {alert.resolvedAt && (
                            <span className="text-[11px] opacity-75">
                              (Resolved at {alert.resolvedAt} {alert.resolvedBy ? `by ${alert.resolvedBy}` : ''})
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-80 leading-normal">
                          {alert.flagReason}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReopenAlert(alert.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer self-start sm:self-center flex items-center space-x-1 ${
                          isDarkMode
                            ? 'bg-[#29221D] hover:bg-[#362C25] border-[#44362B] text-[#D8C7B5]'
                            : 'bg-white hover:bg-[#FAF4EB] border-[#D8C6B2] text-[#5E4747]'
                        }`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: SCHOOL-WIDE MOOD TRENDS */}
      {activeViewTab === 'trends' && (
        <div className="space-y-6">
          
          {/* Header info banner: Strictly Anonymized */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDarkMode
                ? 'bg-[#221C18] border-[#382E27] text-[#EDE5DB]'
                : 'bg-white border-[#E8DDD0] text-[#3D2C2C]'
            }`}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-[#D4A373]" />
                <span>School-Wide Mood Check-In Distribution</span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#A8988A]' : 'text-[#7D6666]'}`}>
                Strictly anonymized, population-level telemetry across Cabiao SHS Grade 11 &amp; Grade 12 cohorts.
              </p>
            </div>

            {/* Time period range selector */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setSelectedChartRange('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedChartRange === 'weekly'
                    ? isDarkMode
                      ? 'bg-[#3D3229] text-[#EDE5DB] border border-[#59483C]'
                      : 'bg-[#EDE2D4] text-[#3D2C2C] border border-[#D8C6B2]'
                    : isDarkMode
                    ? 'text-[#8A796B] hover:text-[#EDE5DB]'
                    : 'text-[#8C7575] hover:text-[#3D2C2C]'
                }`}
              >
                4-Week Overview
              </button>
              <button
                type="button"
                onClick={() => setSelectedChartRange('daily')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedChartRange === 'daily'
                    ? isDarkMode
                      ? 'bg-[#3D3229] text-[#EDE5DB] border border-[#59483C]'
                      : 'bg-[#EDE2D4] text-[#3D2C2C] border border-[#D8C6B2]'
                    : isDarkMode
                    ? 'text-[#8A796B] hover:text-[#EDE5DB]'
                    : 'text-[#8C7575] hover:text-[#3D2C2C]'
                }`}
              >
                Past 7 Days
              </button>
            </div>
          </div>

          {/* Aggregate Top Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-[#221C18] border-[#382E27]' : 'bg-white border-[#E8DDD0]'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                Total Check-Ins (Aug)
              </span>
              <p className={`text-xl sm:text-2xl font-black mt-1 ${isDarkMode ? 'text-[#EDE5DB]' : 'text-[#2D1F1F]'}`}>
                2,314
              </p>
              <span className="text-[10px] text-emerald-500 font-semibold">+18% vs July baseline</span>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-[#221C18] border-[#382E27]' : 'bg-white border-[#E8DDD0]'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                Warm &amp; Joyful Ratio
              </span>
              <p className={`text-xl sm:text-2xl font-black mt-1 text-emerald-500`}>
                64.2%
              </p>
              <span className={`text-[10px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>Positive or flourishing</span>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-[#221C18] border-[#382E27]' : 'bg-white border-[#E8DDD0]'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                Heavy / Crisis Load
              </span>
              <p className={`text-xl sm:text-2xl font-black mt-1 text-rose-500`}>
                8.6%
              </p>
              <span className={`text-[10px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>Prioritized for triage</span>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-[#221C18] border-[#382E27]' : 'bg-white border-[#E8DDD0]'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                Peak Stress Window
              </span>
              <p className={`text-base sm:text-lg font-bold mt-1.5 ${isDarkMode ? 'text-[#E0A868]' : 'text-[#A8642A]'}`}>
                Week 3 Exams
              </p>
              <span className={`text-[10px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>Midterm exam period</span>
            </div>
          </div>

          {/* Interactive Stacked Bar Chart for Mood Categories */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
              isDarkMode
                ? 'bg-[#221C18] border-[#382E27] text-[#EDE5DB]'
                : 'bg-white border-[#E8DDD0] text-[#3D2C2C]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                {selectedChartRange === 'weekly' ? 'Weekly Volume by Mood Type' : 'Daily Check-In Breakdown (This Week)'}
              </h4>
              
              {/* Custom Legend */}
              <div className="flex items-center space-x-3 text-xs flex-wrap gap-y-1">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#E57373]" />
                  <span>Heavy</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#FFB74D]" />
                  <span>Restless</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#90CAF9]" />
                  <span>Quiet</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#A5D6A7]" />
                  <span>Warm</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#81C784]" />
                  <span>Joyful</span>
                </span>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedChartRange === 'weekly' ? SCHOOL_MOOD_TRENDS_DATA : DAILY_MOOD_TRENDS_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#332922' : '#EFE4D6'} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: isDarkMode ? '#9E8D7F' : '#7D6666', fontSize: 11 }}
                    axisLine={{ stroke: isDarkMode ? '#3D3229' : '#E8DDD0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: isDarkMode ? '#9E8D7F' : '#7D6666', fontSize: 11 }}
                    axisLine={{ stroke: isDarkMode ? '#3D3229' : '#E8DDD0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1E1712' : '#FFFFFF',
                      borderColor: isDarkMode ? '#3D3229' : '#E8DDD0',
                      borderRadius: '12px',
                      color: isDarkMode ? '#EDE5DB' : '#2D1F1F',
                      fontSize: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="Heavy" stackId="a" fill="#E57373" />
                  <Bar dataKey="Restless" stackId="a" fill="#FFB74D" />
                  <Bar dataKey="Quiet" stackId="a" fill="#90CAF9" />
                  <Bar dataKey="Warm" stackId="a" fill="#A5D6A7" />
                  <Bar dataKey="Joyful" stackId="a" fill="#81C784" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className={`text-[11px] text-center pt-2 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
              * Data is strictly aggregated and computed automatically from student daily check-in pulses to guide school guidance proactive interventions.
            </p>
          </div>

        </div>
      )}

      {/* Counselor Profile Details Modal */}
      <CounselorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        counselor={activeCounselor}
        isDarkMode={isDarkMode}
        onSignOut={handleSignOut}
      />

    </div>
  );
};
