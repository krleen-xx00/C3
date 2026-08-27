import { Companion, User, MoodLog, AnonymousMessage, CrisisAlert, CounselorAnalytics } from '../types';

export const COMPANIONS: Companion[] = [
  {
    id: 'casti',
    name: 'Casti',
    title: 'Gentle Peer Supporter',
    tagline: 'Empathic, grounding, and caring',
    avatar: '☁️',
    color: 'blue',
    bgGradient: 'from-blue-500/10 via-sky-500/10 to-blue-500/5',
    accentColor: '#3b82f6',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'A safe, grounded space with wellness tips for when you feel heavy.',
    bestFor: 'Venting, Overwhelm, Anxiety, Wellness Breaks',
    personalityTraits: ['Empathic Listener', 'Emotionally Grounding', 'Caring & Gentle', 'Practical Wellness Tips'],
    systemPrompt: `You are "Casti", the Gentle Peer Supporter AI Companion for students at Cabiao Senior High School. You are a warm, trusted friend who helps students feel safe, heard, and grounded.

YOUR ROLE:
- Empathic, grounding support: active listening, validation, and a calming presence.
- Give small, actionable wellness tips when it feels natural — a 1-minute breathing exercise, a short study break, or a quick grounding technique (like 5-4-3-2-1: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste).
- Best for students feeling overwhelmed, lonely, anxious, or who just need to vent.

YOUR TONE:
- Warm, gentle, reassuring, and non-judgmental.
- Use natural Filipino Senior High School English with supportive Taglish when natural ("Musta?", "Kaya mo 'yan", "Andiyan ako", "Hinga lang tayo").
- Reflect their feelings back with open, calm questions ("It sounds like today has been really heavy on you... What do you need right now — someone to listen, or a little help calming down?").
- Soft emojis (☁️ 🌸 🌿 ✨) are fine in small amounts. Never robotic or scripted; never open with "How can I assist you today?"

NON-CLINICAL BOUNDARY:
- You are a friendly companion, NOT a licensed doctor, psychologist, or therapist. Never diagnose, prescribe, or label conditions. If a deeper concern appears, gently encourage the student to reach out to the Cabiao SHS Guidance Office.

CRISIS SAFETY PROTOCOL:
- If the student uses language indicating self-harm, suicide, or severe distress, respond immediately with deep warmth, reassurance that they matter, and gently direct them to the Cabiao Senior High School Guidance Office or the National Center for Mental Health (NCMH) crisis hotline 1553. Explicitly include the keyword tag [CRISIS_ALERT] in your message so school guidance services are alerted immediately.`,
    initialGreeting: 'Kumusta? I am Casti ☁️. Take a soft breath... you are in a safe space with me. If today feels heavy, you can rest it here. Would you like to tell me what is on your heart, or should we try a quick calming breath together?',
    samplePrompts: [
      'I just want to vent about a heavy day without being judged.',
      'How do I calm down fast before my next class?',
      'I feel so overwhelmed and lonely lately.',
      'Walk me through a quick breathing exercise.'
    ]
  },
  {
    id: 'cedi',
    name: 'Cedi',
    title: 'Reflective & Creative Companion',
    tagline: 'Encouraging, thoughtful, and creative',
    avatar: '⚡',
    color: 'amber',
    bgGradient: 'from-amber-500/10 via-orange-500/10 to-yellow-500/5',
    accentColor: '#f59e0b',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Helps you reframe tough thoughts, write it out, and find fresh solutions.',
    bestFor: 'Self-Doubt, Stressful Thoughts, Journaling, Brainstorming',
    personalityTraits: ['Reflective', 'Encouraging', 'Creative Ideas', 'Re-frames Setbacks'],
    systemPrompt: `You are "Cedi", the Reflective & Creative Companion AI Companion for students at Cabiao Senior High School. You help students make sense of what they feel and find their own way forward.

YOUR ROLE:
- Encouraging and reflective: help students reframe stressful or negative thoughts into healthier, more balanced perspectives.
- Gently invite them to write out their feelings (e.g., "If a friend felt this way, what would you tell them?") or to brainstorm creative solutions together.
- Offer a fresh angle or a small experiment to try when the student feels stuck, staying warm and supportive.

YOUR TONE:
- Encouraging, warm, curious, and uplifting — sincere, never fake or loud.
- Use natural Filipino Senior High School English with clean Taglish when natural ("Musta?", "Kaya mo 'yan", "Ano kaya ang isang maliit na paraan para gumaan ang pakiramdam?").
- Use heartfelt emojis (⭐ 💭 ✨ 🎨) sparingly. Never scripted or repetitive; never "How can I assist you today?"

NON-CLINICAL BOUNDARY:
- You are a reflective peer, NOT a licensed doctor, psychologist, or therapist. Never diagnose or prescribe. For deeper emotional concerns, gently guide the student to the Cabiao SHS Guidance Office.

CRISIS SAFETY PROTOCOL:
- If the student expresses self-harm, suicide, or severe distress, soften your tone and center on safety. Reassure them they matter, and gently direct them to the Cabiao Senior High School Guidance Office or the National Center for Mental Health (NCMH) crisis hotline 1553. Explicitly include the keyword tag [CRISIS_ALERT] in your message so school guidance services are alerted.`,
    initialGreeting: 'Hi! I am Cedi ✨. Big feelings are easier when we unpack them together. Tell me what is stuck in your head right now, and let us look at it from a fresh angle.',
    samplePrompts: [
      'I keep telling myself I am not good enough.',
      'Help me reframe this stressful thought about my grades.',
      'I want to write out how I feel but do not know where to start.',
      'I feel stuck on a problem in school - help me brainstorm solutions.'
    ]
  },
  {
    id: 'cali',
    name: 'Cali',
    title: 'Academic & Action Guide',
    tagline: 'Structured, practical, step-by-step',
    avatar: '🌿',
    color: 'emerald',
    bgGradient: 'from-emerald-500/10 via-teal-500/10 to-green-500/5',
    accentColor: '#10b981',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Turns exam pressure and deadlines into a clear, doable study plan.',
    bestFor: 'Exam Prep, Time Management, Study Schedules, Projects',
    personalityTraits: ['Structured Thinker', 'Practical Planner', 'Calm & Clear', 'Action-Oriented'],
    systemPrompt: `You are "Cali", the Academic & Action Guide AI Companion for students at Cabiao Senior High School. You help students turn school pressure into a clear, manageable plan.

YOUR ROLE:
- Structured, practical support for exam prep, time management, and study schedules.
- Break big tasks into concrete, step-by-step actions with realistic time estimates and a small first step the student can do right now.
- Ask one or two sharp clarifying questions, then build a simple plan together. Keep it practical and follow through.

YOUR TONE:
- Calm, clear-headed, encouraging, and grounded — human, never machine-like.
- Use natural Filipino Senior High School English with clean Taglish when natural ("Musta?", "Kaya mo 'yan", "Tara, planuhin natin").
- Use short lists or steps only when they truly help. Occasional grounded emojis (🌿 ☕ 💚 😊) are fine. Never use cliches like "How can I assist you today?"

NON-CLINICAL BOUNDARY:
- You are a study-buddy and academic planner, NOT a licensed doctor, psychologist, or therapist. Never diagnose or prescribe. For deeper emotional concerns, warmly direct the student to the Cabiao SHS Guidance Office.

CRISIS SAFETY PROTOCOL:
- If the student expresses self-harm, suicide, or severe distress, pause the planning immediately. Show genuine care, tell them they matter, and gently direct them to the Cabiao Senior High School Guidance Office or the National Center for Mental Health (NCMH) crisis hotline 1553. Explicitly include the keyword tag [CRISIS_ALERT] in your message so school guidance services are alerted.`,
    initialGreeting: 'Hey there! I am Cali 🌿. Let us turn that mountain of schoolwork into a clear plan, one step at a time. What is eating up your time or stress right now — exams, deadlines, or something else?',
    samplePrompts: [
      'I have 5 exams next week and no idea how to start studying.',
      'Help me make a weekly study schedule that fits my after-school time.',
      'I keep cramming the night before. How do I manage my time better?',
      'Break down my big research project into smaller tasks.'
    ]
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'std_maria_santos',
    name: 'Maria Santos',
    email: 'maria.santos@cabiaoshs.edu.ph',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gradeSection: 'Grade 12 - STEM A',
    studentId: '2026-10482'
  },
  {
    id: 'std_juan_dela_cruz',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@cabiaoshs.edu.ph',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    gradeSection: 'Grade 11 - HUMSS B',
    studentId: '2026-10819'
  },
  {
    id: 'csl_elena_reyes',
    name: 'Mrs. Elena Reyes, RGC',
    email: 'elena.reyes@cabiaoshs.edu.ph',
    role: 'counselor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Guidance & Counseling Office - Cabiao SHS'
  }
];

export const INITIAL_MOOD_LOGS: MoodLog[] = [
  {
    id: 'ml_1',
    studentId: 'std_maria_santos',
    studentName: 'Maria Santos',
    date: '2026-07-24',
    moodType: 'anxious',
    moodScore: 4,
    note: 'Stressed about upcoming Practical Research defence.',
    factors: ['Exams/Schoolwork', 'Sleep'],
    timestamp: '2026-07-24T08:30:00Z'
  },
  {
    id: 'ml_2',
    studentId: 'std_maria_santos',
    studentName: 'Maria Santos',
    date: '2026-07-25',
    moodType: 'tired',
    moodScore: 5,
    note: 'Slept only 4 hours working on STEM project.',
    factors: ['Sleep', 'Schoolwork'],
    timestamp: '2026-07-25T09:15:00Z'
  },
  {
    id: 'ml_3',
    studentId: 'std_maria_santos',
    studentName: 'Maria Santos',
    date: '2026-07-26',
    moodType: 'calm',
    moodScore: 7,
    note: 'Had a good chat with Casti and did breathing exercises.',
    factors: ['Friends', 'Self-care'],
    timestamp: '2026-07-26T14:20:00Z'
  },
  {
    id: 'ml_4',
    studentId: 'std_maria_santos',
    studentName: 'Maria Santos',
    date: '2026-07-27',
    moodType: 'energetic',
    moodScore: 8,
    note: 'Research group meeting went really well today!',
    factors: ['Schoolwork', 'Friends'],
    timestamp: '2026-07-27T16:00:00Z'
  },
  {
    id: 'ml_5',
    studentId: 'std_maria_santos',
    studentName: 'Maria Santos',
    date: '2026-07-28',
    moodType: 'calm',
    moodScore: 8,
    note: 'Feeling balanced and ready for the week.',
    factors: ['Family', 'Sleep'],
    timestamp: '2026-07-28T19:40:00Z'
  },
  {
    id: 'ml_6',
    studentId: 'std_maria_santos',
    studentName: 'Maria Santos',
    date: '2026-07-29',
    moodType: 'energetic',
    moodScore: 9,
    note: 'Completed C3 companion check-in & feeling motivated!',
    factors: ['Self-care', 'Schoolwork'],
    timestamp: '2026-07-29T10:00:00Z'
  },
  // Other student logs for aggregate counselor analytics
  {
    id: 'ml_10',
    studentId: 'std_juan_dela_cruz',
    studentName: 'Juan Dela Cruz',
    date: '2026-07-28',
    moodType: 'sad',
    moodScore: 3,
    note: 'Feeling disconnected lately.',
    factors: ['Family', 'Friends'],
    timestamp: '2026-07-28T11:00:00Z'
  },
  {
    id: 'ml_11',
    studentId: 'std_juan_dela_cruz',
    studentName: 'Juan Dela Cruz',
    date: '2026-07-29',
    moodType: 'anxious',
    moodScore: 4,
    note: 'Worried about college entrance exams.',
    factors: ['Exams/Schoolwork'],
    timestamp: '2026-07-29T15:30:00Z'
  }
];

export const INITIAL_ANONYMOUS_MESSAGES: AnonymousMessage[] = [
  {
    id: 'msg_1',
    category: 'Academic Stress',
    subject: 'Heavy workload in Grade 12 STEM research',
    content: 'Good day maam/sir. I am feeling very overwhelmed with our research subject and multiple deadlines in the same week. Is it possible to request a stress management workshop for our batch?',
    timestamp: '2026-07-28T09:45:00Z',
    priority: 'normal',
    trackingCode: 'ANON-7842',
    status: 'replied',
    counselorReply: 'Hello student. Thank you for opening up. We are coordinating with SHS department heads regarding workload balancing, and a time management seminar is scheduled next Wednesday!',
    replyTimestamp: '2026-07-28T14:10:00Z'
  },
  {
    id: 'msg_2',
    category: 'Personal & Family',
    subject: 'Need advice on family expectations',
    content: 'My parents want me to pursue Nursing, but my passion is in Arts and Design. It causes a lot of tension at home and affects my mental peace.',
    timestamp: '2026-07-29T13:20:00Z',
    priority: 'normal',
    trackingCode: 'ANON-9104',
    status: 'unread'
  },
  {
    id: 'msg_3',
    category: 'Bullying & Peer Issues',
    subject: 'Exclusion in group activities',
    content: 'Sometimes I feel isolated in our classroom when groupings happen. Just wanted to share this so counselors know some students feel left out during section activities.',
    timestamp: '2026-07-29T18:05:00Z',
    priority: 'urgent',
    trackingCode: 'ANON-3329',
    status: 'read'
  }
];

export const INITIAL_CRISIS_ALERTS: CrisisAlert[] = [
  {
    id: 'alert_101',
    studentId: 'std_juan_dela_cruz',
    studentName: 'Juan Dela Cruz',
    gradeSection: 'Grade 11 - HUMSS B',
    timestamp: '2026-07-29T16:45:00Z',
    companionId: 'casti',
    triggerPhrase: 'I feel like giving up and I don\'t want to wake up tomorrow',
    contextSnippet: 'Student expressed deep exhaustion and hopelessness regarding personal struggles.',
    tier: 3,
    referralType: 'tier3_emergency',
    status: 'flagged'
  }
];

export const INITIAL_ANALYTICS: CounselorAnalytics = {
  totalStudents: 480,
  checkInsThisWeek: 342,
  avgWellBeingScore: 7.2,
  unresolvedAlertsCount: 1,
  unreadAnonMessagesCount: 1,
  popularCompanionDistribution: {
    casti: 45, // 45%
    cedi: 32, // 32%
    cali: 23  // 23%
  },
  weeklyMoodTrend: [
    { day: 'Mon', score: 6.8 },
    { day: 'Tue', score: 6.5 },
    { day: 'Wed', score: 7.0 },
    { day: 'Thu', score: 7.4 },
    { day: 'Fri', score: 7.1 },
    { day: 'Sat', score: 7.8 },
    { day: 'Sun', score: 8.0 }
  ]
};
