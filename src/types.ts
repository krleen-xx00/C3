export type UserRole = 'student' | 'counselor';

export type InspirationSource = 'affirmations' | 'scripture';

export type RiskTier = 1 | 2 | 3;

// New DepEd K-12 curriculum academic tracks & TechPro career clusters.
// Academic Track clusters:
export type AcademicClusterId =
  | 'stem'
  | 'business'
  | 'arts-soc-hum'
  | 'sports-health'
  // TechPro (Technical-Professional) clusters:
  | 'tp-ict'
  | 'tp-creative'
  | 'tp-industrial'
  | 'tp-construction'
  | 'tp-automotive'
  | 'tp-hospitality'
  | 'tp-agri'
  | 'tp-maritime'
  | 'tp-artisanry'
  | 'tp-aesthetic';

// Overall track groups (Academic or Technical-Professional)
export type AcademicTrackId = 'academic' | 'techpro';

export interface AcademicCluster {
  id: AcademicClusterId;
  track: AcademicTrackId;
  name: string;
  shortLabel: string;
} 

export type UserStressLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  gradeSection?: string;
  studentId?: string;
  department?: string;
  inspirationSource?: InspirationSource;
  academicClusterId?: AcademicClusterId;
}

export type CompanionId = 'casti' | 'cedi' | 'cali';

export interface Companion {
  id: CompanionId;
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  color: string; // TailWind color name or hex
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  description: string;
  bestFor: string;
  personalityTraits: string[];
  systemPrompt: string;
  initialGreeting: string;
  samplePrompts: string[];
}

export interface ChatMessage {
  id: string;
  studentId: string;
  companionId: CompanionId;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isCrisisTriggered?: boolean;
  riskTier?: RiskTier;
  riskTriggerPhrase?: string;
}

export type MoodType = 'energetic' | 'calm' | 'anxious' | 'sad' | 'tired';

export interface MoodLog {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  moodType: MoodType;
  moodScore: number; // 1 to 10 scale
  note?: string;
  factors?: string[];
  timestamp: string;
  riskTier?: RiskTier;
}

export interface AnonymousMessage {
  id: string;
  category: 'Academic Stress' | 'Personal & Family' | 'Bullying & Peer Issues' | 'Emotional Support' | 'General Inquiry';
  subject: string;
  content: string;
  timestamp: string;
  priority: 'normal' | 'urgent';
  trackingCode: string;
  status: 'unread' | 'read' | 'replied';
  counselorReply?: string;
  replyTimestamp?: string;
}

export interface CrisisAlert {
  id: string;
  studentId: string;
  studentName: string;
  gradeSection: string;
  timestamp: string;
  companionId?: CompanionId;
  triggerPhrase: string;
  contextSnippet: string;
  tier: RiskTier;
  status: 'flagged' | 'reviewed' | 'contacted' | 'resolved';
  referralType: 'tier2_accepted' | 'tier3_emergency' | 'manual_request';
  anonymized?: boolean;
  counselorNotes?: string;
}

export interface RiskEventLog {
  id: string;
  tier: RiskTier;
  timestamp: string;
  anonymized: boolean;
  studentId?: string;
  studentName?: string;
  gradeSection?: string;
  category?: string;
  actionTaken?: 'resource_shown' | 'referral_declined' | 'referral_accepted' | 'crisis_interstitial_shown';
}

export interface CounselorAnalytics {
  totalStudents: number;
  checkInsThisWeek: number;
  avgWellBeingScore: number;
  unresolvedAlertsCount: number;
  unreadAnonMessagesCount: number;
  popularCompanionDistribution: {
    casti: number;
    cedi: number;
    cali: number;
  };
  weeklyMoodTrend: { day: string; score: number }[];
}

