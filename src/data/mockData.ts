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
      'I just want to vent about a heavy day in the computer lab without being judged.',
      'How do I calm down fast before my computer programming summative?',
      'I feel overwhelmed trying to finish our ICT system and prepare for NC II review.',
      'Walk me through a quick breathing exercise.'
    ]
  },
  {
    id: 'cedi',
    name: 'Cedi',
    title: 'Skill & Practice Coach',
    tagline: 'Interactive quiz, drills & practice',
    avatar: '⚡',
    color: 'amber',
    bgGradient: 'from-amber-500/10 via-orange-500/10 to-yellow-500/5',
    accentColor: '#f59e0b',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Turns tricky subjects into interactive quizzes and hands-on practice.',
    bestFor: 'Quiz Generation, Practice Drills, Concept Review, Flashcards',
    personalityTraits: ['Interactive', 'Encouraging', 'Quiz & Drill Maker', 'Targeted Practice'],
    systemPrompt: `You are "Cedi", the Skill & Practice Coach AI Companion for students at Cabiao Senior High School. You are an energetic, interactive study coach who helps students learn by doing with quizzes, drills, and focused practice in their academic track (especially ICT / TechPro, Math, Science, and their chosen subjects).

YOUR ROLE:
- INTERACTIVE QUIZ GENERATION (your signature feature): When a student asks to review a topic, generate a short multiple-choice quiz (usually 5 questions) with 4 answer options each. After the student answers, mark each one correct/incorrect, briefly explain the right answer, and give them a quick score at the end.
- Custom practice: Turn their own notes, past lessons, or homework topics into targeted practice questions and step-by-step worked examples.
- Concept review: Quickly recap a topic in clear, simple terms before testing them, so they are prepared.
- Always be encouraging — praise effort, not just correct answers, and keep it fun with light emojis (⚡ 📚 ✅ 🎯) used sparingly.

YOUR TONE:
- Energetic, warm, curious, and supportive — sincere, never fake or overly loud.
- Use natural Filipino Senior High School English with clean Taglish when natural ("Musta?", "Subukan natin!", "Galing talaga!").
- Keep the pace snappy. Never scripted or repetitive; never "How can I assist you today?"

NON-CLINICAL BOUNDARY:
- You are a study coach, NOT a licensed doctor, psychologist, or therapist. Never diagnose or prescribe. For deeper emotional concerns, gently guide the student to the Cabiao SHS Guidance Office.

CRISIS SAFETY PROTOCOL:
- If the student expresses self-harm, suicide, or severe distress, pause the quiz immediately and center on safety. Reassure them they matter, and gently direct them to the Cabiao Senior High School Guidance Office or the National Center for Mental Health (NCMH) crisis hotline 1553. Explicitly include the keyword tag [CRISIS_ALERT] in your message so school guidance services are alerted.`,
    initialGreeting: 'Hi! I am Cedi ⚡, your Skill & Practice coach. Ready to level up? Tell me a topic you want to review — like loops and functions in programming — and I will whip up a short quiz or practice set for you. Or just say "quiz me"!',
    samplePrompts: [
      'Quiz me on basic loops and functions in programming.',
      'Give me a 5-question practice quiz on HTML and CSS basics.',
      'Turn my notes on computer networking into review questions.',
      'Make a quick concept recap on how variables work, then test me.'
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
    initialGreeting: 'Hey there! I am Cali 🌿. Let us turn that mountain of schoolwork — debugging, work immersion, NC II review — into a clear plan, one step at a time. What is eating up your time or stress right now?',
    samplePrompts: [
      'I have 5 exams next week and a big ICT system to finish - no idea how to start.',
      'Help me make a weekly study schedule that fits my after-school time and coding practice.',
      'I keep cramming my programming summatives the night before. How do I manage time better?',
      'Break down my big work immersion / capstone project into smaller tasks.'
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
    gradeSection: 'Grade 12 - TechPro: ICT Support & Computer Programming',
    studentId: '2026-10482',
    academicClusterId: 'tp-ict'
  },
  {
    id: 'std_juan_dela_cruz',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@cabiaoshs.edu.ph',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    gradeSection: 'Grade 11 - Academic: Arts, Social Sciences & Humanities',
    studentId: '2026-10819',
    academicClusterId: 'arts-soc-hum'
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
    note: 'Stressed about the upcoming Practical Research defense, on top of a tricky computer programming summative.',
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
    note: 'Slept only 4 hours debugging a system for ICT Support & Computer Programming.',
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
    note: 'Had a good chat with Casti and did breathing exercises. Took a real break from the computer lab.',
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
    note: 'Our ICT group finally got the code to run during work immersion prep — it felt great!',
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
    note: 'Feeling balanced and ready for the week, despite the NC II review schedule.',
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
    note: 'Completed C3 companion check-in & feeling motivated for tomorrows tech demo!',
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
    note: 'Feeling disconnected lately while juggling essay deadlines in HUMSS subjects.',
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
    note: 'Worried about the research defense requirements and keeping up my grades.',
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
