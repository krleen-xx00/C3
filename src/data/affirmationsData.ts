export interface Affirmation {
  id: string;
  moodCategory: 'heavy' | 'restless' | 'quiet' | 'warm' | 'joyful';
  text: string;
  theme: string;
}

export const SECULAR_AFFIRMATIONS: Record<'heavy' | 'restless' | 'quiet' | 'warm' | 'joyful', Affirmation[]> = {
  heavy: [
    {
      id: 'aff_h_1',
      moodCategory: 'heavy',
      text: 'You are allowed to take things one moment at a time. Rest is productive, and you do not have to carry everything alone.',
      theme: 'Patience & Compassion'
    },
    {
      id: 'aff_h_2',
      moodCategory: 'heavy',
      text: 'Even on the heaviest days, your presence has value. Give yourself permission to pause and breathe gently.',
      theme: 'Self-Worth'
    },
    {
      id: 'aff_h_3',
      moodCategory: 'heavy',
      text: 'Be patient with yourself today. Small steps and quiet breaths are more than enough.',
      theme: 'Gentle Progress'
    },
    {
      id: 'aff_h_4',
      moodCategory: 'heavy',
      text: 'You have navigated through difficult storms before, and you have the quiet strength to weather this one with care.',
      theme: 'Inner Resilience'
    }
  ],
  restless: [
    {
      id: 'aff_r_1',
      moodCategory: 'restless',
      text: 'You are safe in this present moment. Let go of what you cannot control right now and focus on your breath.',
      theme: 'Grounding & Calm'
    },
    {
      id: 'aff_r_2',
      moodCategory: 'restless',
      text: 'Slow down and ground your feet. One calm thought at a time will bring you back to steady ground.',
      theme: 'Steadiness'
    },
    {
      id: 'aff_r_3',
      moodCategory: 'restless',
      text: 'Your mind may be racing, but you don\'t have to keep up with every thought. Allow stillness to find you.',
      theme: 'Mental Space'
    },
    {
      id: 'aff_r_4',
      moodCategory: 'restless',
      text: 'Breathe in peace, exhale tension. You are capable of navigating whatever comes your way.',
      theme: 'Release & Ease'
    }
  ],
  quiet: [
    {
      id: 'aff_q_1',
      moodCategory: 'quiet',
      text: 'Peace is a quiet sanctuary within you. Cherish this stillness and let your mind recharge.',
      theme: 'Mindful Rest'
    },
    {
      id: 'aff_q_2',
      moodCategory: 'quiet',
      text: 'Quiet moments bring clarity and renewal. Trust the calm rhythm of your day.',
      theme: 'Inner Clarity'
    },
    {
      id: 'aff_q_3',
      moodCategory: 'quiet',
      text: 'There is quiet strength in simply being present without pressure or rush.',
      theme: 'Present Awareness'
    },
    {
      id: 'aff_q_4',
      moodCategory: 'quiet',
      text: 'Let this steady serenity nourish your heart and give you clarity for the path ahead.',
      theme: 'Gentle Harmony'
    }
  ],
  warm: [
    {
      id: 'aff_w_1',
      moodCategory: 'warm',
      text: 'Your positive energy is a gentle light for yourself and the people around you.',
      theme: 'Kindness & Warmth'
    },
    {
      id: 'aff_w_2',
      moodCategory: 'warm',
      text: 'Acknowledge your progress and celebrate the small, meaningful moments in your day.',
      theme: 'Gratitude'
    },
    {
      id: 'aff_w_3',
      moodCategory: 'warm',
      text: 'Carry this warmth with kindness. You have so much good to offer the world.',
      theme: 'Positive Impact'
    },
    {
      id: 'aff_w_4',
      moodCategory: 'warm',
      text: 'Trust in your unique abilities and let your steady confidence guide your actions.',
      theme: 'Quiet Confidence'
    }
  ],
  joyful: [
    {
      id: 'aff_j_1',
      moodCategory: 'joyful',
      text: 'Celebrate this bright spark in your spirit. Gratitude magnifies every joyful moment.',
      theme: 'Bright Energy'
    },
    {
      id: 'aff_j_2',
      moodCategory: 'joyful',
      text: 'Your joy is authentic and meaningful. Savor this light and let it inspire your path forward.',
      theme: 'Celebration'
    },
    {
      id: 'aff_j_3',
      moodCategory: 'joyful',
      text: 'Hold onto this vibrant feeling and remember that brighter days are always within reach.',
      theme: 'Optimism'
    },
    {
      id: 'aff_j_4',
      moodCategory: 'joyful',
      text: 'You deserve this happiness and fulfillment. Let your radiant optimism shine.',
      theme: 'Fulfillment'
    }
  ]
};

export interface DailyWisdomQuote {
  quote: string;
  source: string;
  theme: string;
}

export const SECULAR_DAILY_WISDOM: DailyWisdomQuote[] = [
  {
    quote: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    source: "Mindful Focus Note",
    theme: "Growth & Focus"
  },
  {
    quote: "You don't have to control your thoughts; you just have to stop letting them control you.",
    source: "Mindfulness Practice",
    theme: "Peace of Mind"
  },
  {
    quote: "Courage does not always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
    source: "Gentle Resilience Note",
    theme: "Perseverance"
  },
  {
    quote: "Taking time to rest, breathe, and reflect is not giving up—it is preparing to rise with clearer eyes.",
    source: "Cabiao SHS Guidance Reflection",
    theme: "Rest & Renewal"
  }
];
