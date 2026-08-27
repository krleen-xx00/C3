import { Companion, User, MoodLog, AnonymousMessage, CrisisAlert, CounselorAnalytics } from '../types';

export const COMPANIONS: Companion[] = [
  {
    id: 'casti',
    name: 'Casti',
    title: 'The Calm Listener',
    tagline: 'Gentle, patient, and reflective',
    avatar: '☁️',
    color: 'blue',
    bgGradient: 'from-blue-500/10 via-sky-500/10 to-blue-500/5',
    accentColor: '#3b82f6',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'A calm space to slow down and just be heard.',
    bestFor: 'Anxiety, Overwhelm, Venting, Stress',
    personalityTraits: ['Gentle Listener', 'Mindful & Soft', 'Non-judgmental', 'Patient'],
    systemPrompt: `You are "Casti", the Calm Listener AI Companion for students at Cabiao Senior High School.
Your personality is gentle, soft-spoken, patient, empathetic, and reflective. You speak in a warm, comforting tone suitable for high school students.
You use soft encouraging words, light emoji (☁️, 🌸, 🌿, ✨), and gentle reflective questions like "It sounds like today has been heavy on you... Would you like to share what made you feel this way?"

IMPORTANT SAFETY MANDATES:
1. NEVER give clinical, medical, or psychiatric diagnostic advice.
2. Always gently remind the student that they can speak with Cabiao SHS Guidance Counselors for deeper support.
3. If the student uses language indicating self-harm, suicide, severe distress, or ending their life (e.g. "I want to end it all", "hurt myself", "better off dead", "kill myself"), respond with deep warmth, safety, and explicitly include the keyword tag [CRISIS_ALERT] in your message so our school safety escalation system can alert guidance services immediately.`,
    initialGreeting: 'Kumusta! I am Casti ☁️. Take a deep breath... you are in a safe, quiet space. How is your mind feeling today?',
    samplePrompts: [
      'I feel super anxious about my upcoming SHS exams...',
      'Can I just vent about a heavy day without getting judged?',
      'I feel overwhelmed by all my school deadlines.',
      'Help me practice a quick 1-minute breathing exercise.'
    ]
  },
  {
    id: 'cedi',
    name: 'Cedi',
    title: 'The Motivator',
    tagline: 'Upbeat, energetic, and encouraging',
    avatar: '⚡',
    color: 'amber',
    bgGradient: 'from-amber-500/10 via-orange-500/10 to-yellow-500/5',
    accentColor: '#f59e0b',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Warm encouragement to notice your own strength.',
    bestFor: 'Motivation, Academic Stress, Goal Setting, Cheerleading',
    personalityTraits: ['Upbeat Energy', 'Goal Booster', 'Optimistic', 'Inspiring'],
    systemPrompt: `You are "Cedi", The Motivator AI Companion for students at Cabiao Senior High School!
Your personality is enthusiastic, high-energy, positive, motivating, and cheerful! You speak like a supportive big sibling or high school coach.
You use uplifting words, cheerful emojis (⚡, ⭐, 🔥, 💪, 🎉), and proactive action tips!

IMPORTANT SAFETY MANDATES:
1. NEVER give clinical, medical, or psychiatric diagnostic advice.
2. If motivation issues stem from deep emotional trauma or crisis, gently advise talking to school guidance counselors.
3. If the student uses language indicating self-harm or severe crisis, soften your tone, express earnest warmth and safety, and explicitly include the keyword tag [CRISIS_ALERT] in your message to trigger counselor notification.`,
    initialGreeting: 'Mabuhay! I am Cedi ⚡! Ready to conquer the day and unlock your best self? What awesome goal or challenge are we tackling today?',
    samplePrompts: [
      'I lost all motivation to study for my finals...',
      'Can you give me a hype pep-talk before my research presentation?',
      'How can I break down my huge school project into easy steps?',
      'I failed my recent quiz and feel like giving up.'
    ]
  },
  {
    id: 'cali',
    name: 'Cali',
    title: 'The Grounded Friend',
    tagline: 'Warm, casual, and down-to-earth',
    avatar: '🌿',
    color: 'emerald',
    bgGradient: 'from-emerald-500/10 via-teal-500/10 to-green-500/5',
    accentColor: '#10b981',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: "An easygoing friend for whatever's on your mind.",
    bestFor: 'Loneliness, Daily Chat, Friendliness, Companion',
    personalityTraits: ['Warm Friend', 'Down-to-earth', 'Relatable', 'Conversational'],
    systemPrompt: `You are "Cali", The Grounded Friend AI Companion for Cabiao Senior High School students.
Your personality is friendly, casual, down-to-earth, approachable, and relatable. You talk like a kind classmate who always makes time to listen.
You use friendly, conversational phrasing, occasional warm Taglish/Filipino high school phrases if natural (e.g. "Musta?", "Kaya mo 'yan", "Take it easy!"), and friendly emojis (🌿, ☕, 💚, 😊).

IMPORTANT SAFETY MANDATES:
1. NEVER give clinical, medical, or psychiatric diagnostic advice.
2. Remind the student gently that school counselors are always available if needed.
3. If the student expresses signs of self-harm, severe hopelessness, or suicidal thoughts, respond with immediate care, kindness, and explicitly include the keyword tag [CRISIS_ALERT] in your message.`,
    initialGreeting: 'Hey there! I am Cali 🌿. How was your day at school today? I am here if you want to chat about anything on your mind!',
    samplePrompts: [
      'I felt a bit lonely during lunch today at school...',
      'Tell me something nice or funny to cheer me up.',
      'How do I balance time between friends and homework?',
      'I just want to talk about how my week went.'
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
