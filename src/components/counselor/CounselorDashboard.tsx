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
  FileBadge,
  AlertTriangle,
  X,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  MessageSquare
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
import {
  FlaggedRiskItem,
  getFlaggedRiskLogs,
  saveFlaggedRiskLogs,
  markRiskLogReviewed,
  dismissRiskLog,
  escalateRiskLog,
  ManualEscalationRecord
} from '../../data/flaggedRiskData';
import { CounselorAuthView } from './CounselorAuthView';
import { CounselorProfileModal } from './CounselorProfileModal';
import { ManualEscalationModal } from './ManualEscalationModal';

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

const SCHOOL_MOOD_TRENDS_DATA: MoodTrendPoint[] = [
  {
    label: 'Week 1 (Oct 1-7)',
    Heavy: 42,
    Restless: 68,
    Quiet: 110,
    Warm: 185,
    Joyful: 145
  },
  {
    label: 'Week 2 (Oct 8-14)',
    Heavy: 58,
    Restless: 94,
    Quiet: 125,
    Warm: 160,
    Joyful: 132
  },
  {
    label: 'Week 3 (Oct 15-21 - Exams)',
    Heavy: 89,
    Restless: 142,
    Quiet: 118,
    Warm: 135,
    Joyful: 98
  },
  {
    label: 'Week 4 (Current Week)',
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

  // Tab State: 'risk-log' (Flagged Risk Log), 'queue' (Referral Queue), 'trends' (Mood Analytics)
  const [activeViewTab, setActiveViewTab] = useState<'risk-log' | 'queue' | 'trends'>('risk-log');

  // Flagged Risk Log State
  const [flaggedRiskLogs, setFlaggedRiskLogs] = useState<FlaggedRiskItem[]>(() => getFlaggedRiskLogs());
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'New' | 'Reviewed' | 'Escalated' | 'Dismissed'>('ALL');
  const [riskSearchQuery, setRiskSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Escalation Modal State
  const [escalationTargetItem, setEscalationTargetItem] = useState<FlaggedRiskItem | null>(null);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState<boolean>(false);

  // Dismiss Modal State
  const [dismissTargetItem, setDismissTargetItem] = useState<FlaggedRiskItem | null>(null);
  const [dismissReasonInput, setDismissReasonInput] = useState<string>('');
  const [isDismissModalOpen, setIsDismissModalOpen] = useState<boolean>(false);

  // Referral alerts state
  const [alertsSubTab, setAlertsSubTab] = useState<'active' | 'resolved'>('active');
  const [alerts, setAlerts] = useState<CounselorAlert[]>(INITIAL_COUNSELOR_ALERTS);
  const [selectedChartRange, setSelectedChartRange] = useState<'weekly' | 'daily'>('weekly');

  // Sync flagged risks on mount, on cross-tab storage, and on internal app updates
  useEffect(() => {
    const handleSync = () => {
      setFlaggedRiskLogs(getFlaggedRiskLogs());
    };

    // Immediate sync on component mount / view switch
    handleSync();

    // Cross-tab storage updates
    window.addEventListener('storage', handleSync);
    // Same-tab student mode flagging updates
    window.addEventListener('c3-flagged-risk-updated', handleSync);
    // Focus event when switching back into the tab/view
    window.addEventListener('focus', handleSync);

    // Also attempt fetching from server API to merge any persisted logs
    fetch('/api/flagged-risks')
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data.logs) && data.logs.length > 0) {
          const local = getFlaggedRiskLogs();
          const localIds = new Set(local.map(l => l.id));
          const toAdd = data.logs.filter((l: any) => !localIds.has(l.id));
          if (toAdd.length > 0) {
            const merged = [...toAdd, ...local];
            saveFlaggedRiskLogs(merged);
            setFlaggedRiskLogs(merged);
          }
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('c3-flagged-risk-updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const handleLoginSuccess = (counselor: CounselorUser) => {
    setActiveCounselor(counselor);
    setActiveCounselorSession(counselor);
  };

  const handleSignOut = () => {
    setActiveCounselor(null);
    setActiveCounselorSession(null);
  };

  // Flagged Risk Log Actions
  const handleMarkAsReviewed = (id: string) => {
    if (!activeCounselor) return;
    const updated = markRiskLogReviewed(id, activeCounselor.name);
    setFlaggedRiskLogs(updated);
  };

  const handleOpenDismissModal = (item: FlaggedRiskItem) => {
    setDismissTargetItem(item);
    setDismissReasonInput('False Alarm / Conversational expression without clinical intent. Reviewed by counselor.');
    setIsDismissModalOpen(true);
  };

  const handleConfirmDismiss = () => {
    if (!dismissTargetItem || !activeCounselor) return;
    const updated = dismissRiskLog(dismissTargetItem.id, dismissReasonInput, activeCounselor.name);
    setFlaggedRiskLogs(updated);
    setIsDismissModalOpen(false);
    setDismissTargetItem(null);
  };

  const handleOpenEscalationModal = (item: FlaggedRiskItem) => {
    setEscalationTargetItem(item);
    setIsEscalationModalOpen(true);
  };

  const handleConfirmEscalation = (id: string, record: ManualEscalationRecord) => {
    const updated = escalateRiskLog(id, record);
    setFlaggedRiskLogs(updated);
  };

  // Referral Queue actions
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

  // If counselor is not logged in, show the secure counselor login & sign-up portal
  if (!activeCounselor) {
    return (
      <CounselorAuthView
        isDarkMode={isDarkMode}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Filtered Flagged Risk Logs
  const filteredRiskLogs = flaggedRiskLogs.filter(item => {
    const matchesFilter = selectedRiskFilter === 'ALL' || item.status === selectedRiskFilter;
    const query = riskSearchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      item.anonymizedStudentId.toLowerCase().includes(query) ||
      item.companionUsed.toLowerCase().includes(query) ||
      item.flaggedSnippet.toLowerCase().includes(query) ||
      item.gradeSection.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const newRiskCount = flaggedRiskLogs.filter(item => item.status === 'New').length;
  const highRiskCount = flaggedRiskLogs.filter(item => item.riskLevel === 'High' && item.status !== 'Dismissed').length;

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

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 space-y-6">
      
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
                alt="Cabiao SHS Seal"
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
                  Guidance Counselor Workspace
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

      {/* PROMINENT SAFETY DISCLAIMER BANNER (MANDATORY HUMAN-IN-THE-LOOP SAFETY PROTOCOL) */}
      <div
        id="safety-disclaimer-banner"
        className={`p-4 sm:p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#291E15] via-[#241A14] to-[#1F1712] border-[#4D3724] text-[#F5DEBE]'
            : 'bg-gradient-to-r from-[#FFF8EE] via-[#FFF3E2] to-[#FAF0DE] border-[#ECD5B8] text-[#69421A]'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>PRIVACY &amp; HUMAN ESCALATION PROTOCOL</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 border border-amber-500/25">
                Human-in-the-Loop Safeguard
              </span>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed font-medium">
              Automated alerts are sent strictly to the Guidance Counselor Dashboard. No automated messages are ever sent directly to parents. Any parent notification must be conducted manually and personally by a guidance counselor after human review.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher: Flagged Risk Log vs Active Queue vs School-Wide Mood Trends */}
      <div className="flex items-center justify-between border-b pb-3 gap-2 flex-wrap" style={{ borderColor: isDarkMode ? '#382E27' : '#E8DDD0' }}>
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* TAB 1: FLAGGED RISK LOG */}
          <button
            type="button"
            id="tab-flagged-risk-log"
            onClick={() => setActiveViewTab('risk-log')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'risk-log'
                ? isDarkMode
                  ? 'bg-[#D4A373] text-[#1E1712] shadow-sm font-black'
                  : 'bg-[#8F5B34] text-white shadow-sm font-black'
                : isDarkMode
                ? 'bg-[#241E1A] text-[#B8A796] hover:text-[#EDE5DB] border border-[#3A3028]'
                : 'bg-white text-[#6E5959] hover:text-[#3D2C2C] border border-[#E8DDD0]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Flagged Risk Log</span>
            {newRiskCount > 0 && (
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                  activeViewTab === 'risk-log'
                    ? isDarkMode
                      ? 'bg-[#1E1712] text-[#D4A373]'
                      : 'bg-white text-[#8F5B34]'
                    : isDarkMode
                    ? 'bg-[#4A2621] text-[#FCA5A5]'
                    : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}
              >
                {newRiskCount} New
              </span>
            )}
          </button>

          {/* TAB 2: REFERRAL QUEUE */}
          <button
            type="button"
            id="tab-guidance-queue"
            onClick={() => setActiveViewTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'queue'
                ? isDarkMode
                  ? 'bg-[#D4A373] text-[#1E1712] shadow-sm font-black'
                  : 'bg-[#8F5B34] text-white shadow-sm font-black'
                : isDarkMode
                ? 'bg-[#241E1A] text-[#B8A796] hover:text-[#EDE5DB] border border-[#3A3028]'
                : 'bg-white text-[#6E5959] hover:text-[#3D2C2C] border border-[#E8DDD0]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direct Referral Queue</span>
            {activeAlerts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* TAB 3: MOOD TRENDS */}
          <button
            type="button"
            id="tab-mood-trends"
            onClick={() => setActiveViewTab('trends')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'trends'
                ? isDarkMode
                  ? 'bg-[#D4A373] text-[#1E1712] shadow-sm font-black'
                  : 'bg-[#8F5B34] text-white shadow-sm font-black'
                : isDarkMode
                ? 'bg-[#241E1A] text-[#B8A796] hover:text-[#EDE5DB] border border-[#3A3028]'
                : 'bg-white text-[#6E5959] hover:text-[#3D2C2C] border border-[#E8DDD0]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>School-Wide Mood Trends</span>
          </button>
        </div>

        {/* Quiet confidentiality badge */}
        <div
          className={`flex items-center space-x-1.5 text-[11px] font-medium ${
            isDarkMode ? 'text-[#968677]' : 'text-[#8C7575]'
          }`}
        >
          <Lock className="w-3.5 h-3.5 opacity-80" />
          <span>R.A. 9258 Guidance Triage • Anonymized Identifiers</span>
        </div>
      </div>

      {/* VIEW 1: FLAGGED RISK LOG TABLE (CORE REQUIREMENT) */}
      {activeViewTab === 'risk-log' && (
        <div className="space-y-4">
          
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1.5">
              {(['ALL', 'New', 'Reviewed', 'Escalated', 'Dismissed'] as const).map(filterKey => {
                const count = filterKey === 'ALL'
                  ? flaggedRiskLogs.length
                  : flaggedRiskLogs.filter(i => i.status === filterKey).length;

                return (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setSelectedRiskFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      selectedRiskFilter === filterKey
                        ? isDarkMode
                          ? 'bg-[#3D2E22] text-[#F9E6CD] border border-[#5C4533] shadow-xs'
                          : 'bg-[#EAE0D2] text-[#3D2C2C] border border-[#D5C6B3] shadow-xs'
                        : isDarkMode
                        ? 'text-[#A8988A] hover:text-[#EDE5DB] hover:bg-[#251E19]'
                        : 'text-[#7D6666] hover:text-[#3D2C2C] hover:bg-[#FAF4EB]'
                    }`}
                  >
                    <span>{filterKey === 'ALL' ? 'All Alerts' : filterKey}</span>
                    <span className="text-[10px] font-black opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#9C8888]'}`} />
              <input
                type="text"
                value={riskSearchQuery}
                onChange={(e) => setRiskSearchQuery(e.target.value)}
                placeholder="Filter by STU ID, snippet, companion..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-[#181310] border-[#382E27] text-[#EDE5DB] placeholder-[#66574D] focus:ring-1 focus:ring-amber-500'
                    : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C] placeholder-[#B5A4A4] focus:ring-1 focus:ring-amber-500'
                }`}
              />
              {riskSearchQuery && (
                <button
                  type="button"
                  onClick={() => setRiskSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* FLAGGED RISK LOG TABLE */}
          <div
            className={`rounded-3xl border shadow-md overflow-hidden ${
              isDarkMode ? 'bg-[#1D1714] border-[#382E27]' : 'bg-white border-[#E8DDD0]'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                {/* Table Header */}
                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isDarkMode
                        ? 'bg-[#251D19] border-[#382E27] text-[#C9BAAB]'
                        : 'bg-[#FAF4EB] border-[#E8DDD0] text-[#7A6152]'
                    }`}
                  >
                    <th className="py-3.5 px-4 font-bold">Timestamp</th>
                    <th className="py-3.5 px-3 font-bold">Student ID (Anonymized)</th>
                    <th className="py-3.5 px-3 font-bold">Companion</th>
                    <th className="py-3.5 px-4 font-bold min-w-[260px]">Flagged Snippet</th>
                    <th className="py-3.5 px-3 font-bold">Risk Level</th>
                    <th className="py-3.5 px-3 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Counselor Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className={`divide-y ${isDarkMode ? 'divide-[#2E241E]' : 'divide-[#F2EAE0]'}`}>
                  {filteredRiskLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-sm font-bold">No flagged risk alerts match your current filter</p>
                        <p className={`text-xs ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                          All student companion conversations are within calm parameters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRiskLogs.map((logItem) => {
                      const isHigh = logItem.riskLevel === 'High';
                      const isNew = logItem.status === 'New';
                      const isReviewed = logItem.status === 'Reviewed';
                      const isEscalated = logItem.status === 'Escalated';
                      const isDismissed = logItem.status === 'Dismissed';
                      const isExpanded = expandedLogId === logItem.id;

                      const companionAvatar = logItem.companionUsed === 'Cali'
                        ? '🌿'
                        : logItem.companionUsed === 'Cedi'
                        ? '⚡'
                        : '💜';

                      return (
                        <React.Fragment key={logItem.id}>
                          <tr
                            className={`transition-colors group ${
                              isNew
                                ? isDarkMode
                                  ? 'bg-[#261B18]/60 hover:bg-[#2C1E1B]'
                                  : 'bg-[#FFF9F9]/80 hover:bg-[#FFF2F2]'
                                : isDarkMode
                                ? 'hover:bg-[#241E1A]'
                                : 'hover:bg-[#FCF9F5]'
                            }`}
                          >
                            {/* 1. Timestamp */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-bold">{logItem.displayTime}</span>
                                <span className={`text-[10px] ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                                  {new Date(logItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </td>

                            {/* 2. Student ID (Anonymized) */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex items-center space-x-1.5">
                                <span className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs border ${
                                  isDarkMode
                                    ? 'bg-[#291F18] border-[#443324] text-[#E8CDAC]'
                                    : 'bg-[#FFF4E8] border-[#F2DAC4] text-[#8F5B34]'
                                }`}>
                                  {logItem.anonymizedStudentId}
                                </span>
                              </div>
                              <span className={`text-[10px] block mt-0.5 ${isDarkMode ? 'text-[#8A796B]' : 'text-[#8C7575]'}`}>
                                {logItem.gradeSection}
                              </span>
                            </td>

                            {/* 3. Companion Used */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                logItem.companionUsed === 'Cali'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                                  : logItem.companionUsed === 'Cedi'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25'
                                  : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25'
                              }`}>
                                <span>{companionAvatar}</span>
                                <span>{logItem.companionUsed}</span>
                              </span>
                            </td>

                            {/* 4. Flagged Snippet */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                                  &ldquo;{logItem.flaggedSnippet}&rdquo;
                                </p>
                                {logItem.triggerPhrase && (
                                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isHigh
                                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                  }`}>
                                    Trigger: {logItem.triggerPhrase}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 5. Risk Level */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {isHigh ? (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  <span>High</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span>Moderate</span>
                                </span>
                              )}
                            </td>

                            {/* 6. Status */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {isNew && (
                                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                                  ● New Alert
                                </span>
                              )}
                              {isReviewed && (
                                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                                  ✓ Reviewed
                                </span>
                              )}
                              {isEscalated && (
                                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25">
                                  ▲ Escalated
                                </span>
                              )}
                              {isDismissed && (
                                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/25">
                                  Dismissed
                                </span>
                              )}
                            </td>

                            {/* 7. Counselor Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* Action 1: Mark Reviewed */}
                                {isNew && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsReviewed(logItem.id)}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1 shadow-2xs ${
                                      isDarkMode
                                        ? 'bg-[#2B3527] hover:bg-[#374532] text-[#A7F3D0] border-[#435C41]'
                                        : 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
                                    }`}
                                    title="Mark as reviewed by counselor"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Mark Reviewed</span>
                                  </button>
                                )}

                                {/* Action 2: Dismiss / False Alarm */}
                                {!isDismissed && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDismissModal(logItem)}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1 ${
                                      isDarkMode
                                        ? 'bg-[#241E1A] hover:bg-[#2F2621] border-[#3D332B] text-[#C0B0A0]'
                                        : 'bg-white hover:bg-[#FAF4EB] border-[#D8C6B2] text-[#5E4747]'
                                    }`}
                                    title="Dismiss as false alarm or non-clinical expression"
                                  >
                                    <X className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Dismiss / False Alarm</span>
                                  </button>
                                )}

                                {/* Action 3: Manual Escalation Log */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEscalationModal(logItem)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 shadow-2xs ${
                                    isEscalated
                                      ? isDarkMode
                                        ? 'bg-[#3A244A] text-[#EADCF7] border border-[#5E3D80]'
                                        : 'bg-[#EDE5F8] text-[#5C348A] border border-[#D8C7F0]'
                                      : isDarkMode
                                      ? 'bg-[#D4A373] hover:bg-[#C28F5E] text-[#1E1712]'
                                      : 'bg-[#8F5B34] hover:bg-[#784823] text-white'
                                  }`}
                                  title="Log official human-in-the-loop counselor escalation"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{isEscalated ? 'View Escalation' : 'Manual Escalation Log'}</span>
                                </button>

                                {/* Quick Details Toggle */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedLogId(isExpanded ? null : logItem.id)}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    isDarkMode ? 'hover:bg-[#2C241F] text-[#8A796B]' : 'hover:bg-[#EFE5D8] text-[#8C7575]'
                                  }`}
                                  title="Expand full log details"
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* EXPANDED AUDIT ROW */}
                          {isExpanded && (
                            <tr className={isDarkMode ? 'bg-[#181310]/90' : 'bg-[#FAF6F0]'}>
                              <td colSpan={7} className="p-4 sm:p-5 border-t border-b border-amber-500/20">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                                    <div className="flex items-center space-x-2">
                                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                      <span className="font-bold">
                                        Audit Record: {logItem.id} • Anonymized Student ID: {logItem.anonymizedStudentId}
                                      </span>
                                    </div>
                                    {logItem.reviewedBy && (
                                      <span className={`text-[11px] ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                                        Audited by: <strong>{logItem.reviewedBy}</strong> ({logItem.reviewedAt})
                                      </span>
                                    )}
                                  </div>

                                  {/* Escalation Notes if any */}
                                  {logItem.escalationRecord && (
                                    <div
                                      className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                                        isDarkMode ? 'bg-[#241724] border-[#4E2B52]' : 'bg-[#FAF4FF] border-[#E9D8FD]'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between font-bold text-purple-700 dark:text-purple-300">
                                        <span>ESCALATION ACTION: {logItem.escalationRecord.actionTitle}</span>
                                        <span>{logItem.escalationRecord.escalatedAt}</span>
                                      </div>
                                      <p className="leading-relaxed">
                                        <strong>Case Notes:</strong> {logItem.escalationRecord.counselorNotes}
                                      </p>
                                      {logItem.escalationRecord.parentContactedManually && (
                                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                          <strong>Manual Parent Notification Conducted:</strong> {logItem.escalationRecord.parentContactDetails || 'Counselor personally spoke with parent/guardian.'}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Dismissal Reason if any */}
                                  {logItem.dismissReason && (
                                    <div
                                      className={`p-3 rounded-2xl border text-xs space-y-1 ${
                                        isDarkMode ? 'bg-[#201C1A] border-[#382E27]' : 'bg-[#F4EFEA] border-[#E8DFD5]'
                                      }`}
                                    >
                                      <span className="font-bold text-amber-600 dark:text-amber-400 block">
                                        DISMISSAL / FALSE ALARM JUSTIFICATION:
                                      </span>
                                      <p className="opacity-90">{logItem.dismissReason}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div
              className={`p-3.5 px-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                isDarkMode ? 'bg-[#181310] border-[#332A24] text-[#8A796B]' : 'bg-[#FAF5EE] border-[#EAE0D2] text-[#8C7575]'
              }`}
            >
              <span>Showing {filteredRiskLogs.length} of {flaggedRiskLogs.length} flagged keyword trigger alerts</span>
              <span className="font-medium">
                Active Counselor: <strong>{activeCounselor.name}</strong> • Licensed Protocol R.A. 9258
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DIRECT REFERRAL QUEUE (CARDS) */}
      {activeViewTab === 'queue' && (
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
                Active Referrals ({activeAlerts.length})
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
                  <p className="text-sm font-semibold">All active referrals are resolved</p>
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
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
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

                          <p
                            className={`text-xs sm:text-[13px] font-normal leading-relaxed ${
                              isDarkMode ? 'text-[#C9BAAB]' : 'text-[#4A3737]'
                            }`}
                          >
                            {alert.flagReason}
                          </p>
                        </div>

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

      {/* VIEW 3: SCHOOL-WIDE MOOD TRENDS */}
      {activeViewTab === 'trends' && (
        <div className="space-y-5">
          {/* Header Row with range toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-[#EDE5DB]' : 'text-[#3D2C2C]'}`}>
                School-Wide Mental Health Aggregates
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-[#A09080]' : 'text-[#7D6B5E]'}`}>
                Anonymized check-in distribution across all SHS Tracks &amp; Career Clusters.
              </p>
            </div>

            <div
              className={`inline-flex p-1 rounded-xl border self-start sm:self-center ${
                isDarkMode ? 'bg-[#181310] border-[#382E27]' : 'bg-[#EAE0D2] border-[#DFD3C4]'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedChartRange('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedChartRange === 'weekly'
                    ? isDarkMode
                      ? 'bg-[#D4A373] text-[#1E1712]'
                      : 'bg-[#8F5B34] text-white'
                    : isDarkMode
                    ? 'text-[#A09080] hover:text-[#EDE5DB]'
                    : 'text-[#7D6B5E] hover:text-[#3D2C2C]'
                }`}
              >
                4-Week Aggregates
              </button>
              <button
                type="button"
                onClick={() => setSelectedChartRange('daily')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedChartRange === 'daily'
                    ? isDarkMode
                      ? 'bg-[#D4A373] text-[#1E1712]'
                      : 'bg-[#8F5B34] text-white'
                    : isDarkMode
                    ? 'text-[#A09080] hover:text-[#EDE5DB]'
                    : 'text-[#7D6B5E] hover:text-[#3D2C2C]'
                }`}
              >
                Current Week (Daily)
              </button>
            </div>
          </div>

          {/* Chart Card */}
          <div
            className={`p-5 rounded-3xl border shadow-sm ${
              isDarkMode
                ? 'bg-[#221C18] border-[#382E27]'
                : 'bg-white border-[#E8DDD0]'
            }`}
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={selectedChartRange === 'weekly' ? SCHOOL_MOOD_TRENDS_DATA : DAILY_MOOD_TRENDS_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHeavy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorRestless" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorWarm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={isDarkMode ? 0.15 : 0.4} />
                  <XAxis dataKey="label" stroke={isDarkMode ? '#8A796B' : '#9E8D8D'} fontSize={11} />
                  <YAxis stroke={isDarkMode ? '#8A796B' : '#9E8D8D'} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1E1714' : '#FFFFFF',
                      borderColor: isDarkMode ? '#3D322B' : '#E8DDD0',
                      borderRadius: '16px',
                      fontSize: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Heavy" stroke="#EF4444" fillOpacity={1} fill="url(#colorHeavy)" />
                  <Area type="monotone" dataKey="Restless" stroke="#F59E0B" fillOpacity={1} fill="url(#colorRestless)" />
                  <Area type="monotone" dataKey="Warm" stroke="#10B981" fillOpacity={1} fill="url(#colorWarm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Counselor Profile Modal */}
      <CounselorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        counselor={activeCounselor}
        isDarkMode={isDarkMode}
      />

      {/* Manual Counselor Escalation Modal */}
      <ManualEscalationModal
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        item={escalationTargetItem}
        currentCounselor={activeCounselor}
        onConfirmEscalation={handleConfirmEscalation}
        isDarkMode={isDarkMode}
      />

      {/* Dismiss / False Alarm Justification Modal */}
      <AnimatePresence>
        {isDismissModalOpen && dismissTargetItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 ${
                isDarkMode ? 'bg-[#1E1714] border-[#3D322B] text-[#EDE5DB]' : 'bg-white border-[#E8DDD0] text-[#3D2C2C]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Dismiss Flagged Alert (False Alarm Verification)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDismissModalOpen(false)}
                  className="p-1 rounded-lg opacity-60 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p>
                  Student: <strong>{dismissTargetItem.anonymizedStudentId}</strong> ({dismissTargetItem.gradeSection})
                </p>
                <p className="italic font-serif opacity-90">
                  &ldquo;{dismissTargetItem.flaggedSnippet}&rdquo;
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider">
                  Counselor False Alarm Justification Note:
                </label>
                <textarea
                  rows={3}
                  value={dismissReasonInput}
                  onChange={(e) => setDismissReasonInput(e.target.value)}
                  placeholder="Explain why this keyword trigger is a false alarm (e.g. conversational hyperbole, academic sarcasm, or resolved in follow-up)..."
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none ${
                    isDarkMode
                      ? 'bg-[#14100E] border-[#382E27] text-[#EDE5DB]'
                      : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#3D2C2C]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDismissModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDismiss}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm"
                >
                  Confirm Dismissal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
