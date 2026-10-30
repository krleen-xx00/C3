export type DailyEntryType = 'affirmation' | 'scripture';

export interface DailyInspirationEntry {
  id: string;
  type: DailyEntryType;
  text: string;
  referenceOrTheme: string;
  category: string;
}

// Curated daily affirmations and verified public domain scripture verses
export const DAILY_AFFIRMATIONS: DailyInspirationEntry[] = [
  {
    id: 'aff_01',
    type: 'affirmation',
    text: 'You are allowed to take things one moment at a time. Rest is productive, and you do not have to carry everything alone.',
    referenceOrTheme: 'Patience & Self-Compassion',
    category: 'Rest & Renewal'
  },
  {
    id: 'aff_02',
    type: 'affirmation',
    text: 'Small steps repeated with consistency every day lead to steady achievements over time.',
    referenceOrTheme: 'Consistent Growth',
    category: 'Focus & Growth'
  },
  {
    id: 'aff_03',
    type: 'affirmation',
    text: 'Be patient with yourself today. Gentle effort and quiet breaths are more than enough.',
    referenceOrTheme: 'Gentle Progress',
    category: 'Peace & Rest'
  },
  {
    id: 'aff_04',
    type: 'affirmation',
    text: 'You do not have to control every thought; pause, breathe, and focus on what is within your reach.',
    referenceOrTheme: 'Mindful Grounding',
    category: 'Wisdom & Calm'
  },
  {
    id: 'aff_05',
    type: 'affirmation',
    text: 'Quiet moments bring clarity and renewal. Trust the steady, calm rhythm of your learning journey.',
    referenceOrTheme: 'Inner Clarity',
    category: 'Peace & Rest'
  },
  {
    id: 'aff_06',
    type: 'affirmation',
    text: 'Acknowledge your progress and celebrate the small, meaningful milestones in your school day.',
    referenceOrTheme: 'Gratitude & Encouragement',
    category: 'Hope & Renewal'
  },
  {
    id: 'aff_07',
    type: 'affirmation',
    text: 'Your worth is not measured by perfection, but by your willingness to learn and grow with kindness.',
    referenceOrTheme: 'Self-Worth',
    category: 'Strength & Courage'
  },
  {
    id: 'aff_08',
    type: 'affirmation',
    text: 'Take pride in how far you have already come, and meet today with quiet confidence.',
    referenceOrTheme: 'Quiet Resilience',
    category: 'Strength & Courage'
  },
  {
    id: 'aff_09',
    type: 'affirmation',
    text: 'Breathe in peace, exhale tension. You are capable of handling today’s tasks step by step.',
    referenceOrTheme: 'Calm Steadiness',
    category: 'Wisdom & Calm'
  },
  {
    id: 'aff_10',
    type: 'affirmation',
    text: 'Stillness is not wasted time; it is where your mind gathers the energy to begin anew.',
    referenceOrTheme: 'Restful Renewal',
    category: 'Rest & Renewal'
  },
  {
    id: 'aff_11',
    type: 'affirmation',
    text: 'Give yourself credit for the effort you put in, even when results take time to show.',
    referenceOrTheme: 'Perseverance',
    category: 'Focus & Growth'
  },
  {
    id: 'aff_12',
    type: 'affirmation',
    text: 'You have navigated difficult days before, and you carry the quiet strength to handle today as well.',
    referenceOrTheme: 'Inner Strength',
    category: 'Strength & Courage'
  },
  {
    id: 'aff_13',
    type: 'affirmation',
    text: 'Kindness toward yourself creates the best foundation for kindness toward your classmates and teachers.',
    referenceOrTheme: 'Compassion',
    category: 'Hope & Renewal'
  },
  {
    id: 'aff_14',
    type: 'affirmation',
    text: 'Focus on today’s single step. The rest of the staircase will become clear as you move forward.',
    referenceOrTheme: 'Present Focus',
    category: 'Focus & Growth'
  }
];

export const DAILY_SCRIPTURES: DailyInspirationEntry[] = [
  {
    id: 'scr_01',
    type: 'scripture',
    text: 'The Lord is my shepherd; I lack nothing. He leads me beside quiet waters, he refreshes my soul.',
    referenceOrTheme: 'Psalm 23:1-3',
    category: 'Peace & Rest'
  },
  {
    id: 'scr_02',
    type: 'scripture',
    text: 'Trust in the Lord with all your heart, and do not lean on your own understanding; in all your ways acknowledge him, and he will make straight your paths.',
    referenceOrTheme: 'Proverbs 3:5-6',
    category: 'Wisdom & Calm'
  },
  {
    id: 'scr_03',
    type: 'scripture',
    text: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    referenceOrTheme: 'Isaiah 40:31',
    category: 'Strength & Courage'
  },
  {
    id: 'scr_04',
    type: 'scripture',
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    referenceOrTheme: 'Jeremiah 29:11',
    category: 'Hope & Renewal'
  },
  {
    id: 'scr_05',
    type: 'scripture',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart.',
    referenceOrTheme: 'Matthew 11:28-29',
    category: 'Rest & Renewal'
  },
  {
    id: 'scr_06',
    type: 'scripture',
    text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God will guard your hearts.',
    referenceOrTheme: 'Philippians 4:6-7',
    category: 'Wisdom & Calm'
  },
  {
    id: 'scr_07',
    type: 'scripture',
    text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    referenceOrTheme: 'Joshua 1:9',
    category: 'Strength & Courage'
  },
  {
    id: 'scr_08',
    type: 'scripture',
    text: 'God is our refuge and strength, an ever-present help in trouble. Therefore we will not fear, though the earth give way.',
    referenceOrTheme: 'Psalm 46:1-2',
    category: 'Strength & Courage'
  },
  {
    id: 'scr_09',
    type: 'scripture',
    text: 'For God has not given us a spirit of fear, but of power, love, and a sound mind.',
    referenceOrTheme: '2 Timothy 1:7',
    category: 'Peace & Rest'
  },
  {
    id: 'scr_10',
    type: 'scripture',
    text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.',
    referenceOrTheme: 'Romans 15:13',
    category: 'Hope & Renewal'
  },
  {
    id: 'scr_11',
    type: 'scripture',
    text: 'This is the day the Lord has made; let us rejoice and be glad in it.',
    referenceOrTheme: 'Psalm 118:24',
    category: 'Hope & Renewal'
  },
  {
    id: 'scr_12',
    type: 'scripture',
    text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    referenceOrTheme: 'Psalm 34:18',
    category: 'Rest & Renewal'
  },
  {
    id: 'scr_13',
    type: 'scripture',
    text: 'Cast all your anxiety on him because he cares for you.',
    referenceOrTheme: '1 Peter 5:7',
    category: 'Wisdom & Calm'
  },
  {
    id: 'scr_14',
    type: 'scripture',
    text: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.',
    referenceOrTheme: 'Lamentations 3:22-23',
    category: 'Hope & Renewal'
  }
];

// Helper to calculate a stable deterministic date index
export function getCalendarDayIndex(targetDate?: Date): number {
  const d = targetDate || new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1 to 12
  const day = d.getDate(); // 1 to 31
  // Simple deterministic integer hashing the calendar date
  return Math.abs((year * 372 + month * 31 + day));
}

// Get deterministic daily affirmation for a given date
export function getDailyAffirmation(targetDate?: Date): DailyInspirationEntry {
  const idx = getCalendarDayIndex(targetDate) % DAILY_AFFIRMATIONS.length;
  return DAILY_AFFIRMATIONS[idx];
}

// Get deterministic daily scripture for a given date
export function getDailyScripture(targetDate?: Date): DailyInspirationEntry {
  const idx = getCalendarDayIndex(targetDate) % DAILY_SCRIPTURES.length;
  return DAILY_SCRIPTURES[idx];
}

// Get active entry according to preferred type (or alternating)
export function getDailyInspiration(
  source: 'affirmations' | 'scripture' | 'bible' = 'affirmations',
  targetDate?: Date
): DailyInspirationEntry {
  return source === 'bible' || source === 'scripture'
    ? getDailyScripture(targetDate)
    : getDailyAffirmation(targetDate);
}
