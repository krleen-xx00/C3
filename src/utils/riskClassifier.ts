import { RiskTier } from '../types';

export interface RiskAnalysisResult {
  tier: RiskTier;
  reason: string;
  triggerPhrase: string;
}

// Tier 3: High Risk (Explicit Self-Harm, Suicidal Ideation)
const TIER_3_KEYWORDS: string[] = [
  'kill myself',
  'end my life',
  'suicide',
  'want to die',
  'better off dead',
  'self harm',
  'self-harm',
  'cut myself',
  'cutting myself',
  'give up on living',
  'dont want to live',
  "don't want to live",
  'dont want to wake up',
  "don't want to wake up",
  'no reason to live',
  'hurt myself',
  'hurting myself',
  'take my own life',
  'end it all',
  'hang myself',
  'drink poison',
  'ending my life',
  'slit my wrist',
  'slitting my wrist'
];

// Tier 2: Moderate Distress (Hopelessness, Overwhelm, Burden, Giving Up)
const TIER_2_KEYWORDS: string[] = [
  "i can't handle this anymore",
  "i cant handle this anymore",
  "cannot handle this anymore",
  "i feel hopeless",
  "feeling hopeless",
  "no one cares",
  "nobody cares",
  "nobody loves me",
  "i want to disappear",
  "exhausted of everything",
  "i hate my life",
  "giving up",
  "feel like giving up",
  "i don't see the point",
  "i dont see the point",
  "whats the point of living",
  "what's the point of living",
  "i feel worthless",
  "feeling worthless",
  "nobody understands me",
  "everything is falling apart",
  "feel like a burden",
  "i am a burden",
  "i'm a burden",
  "im a burden",
  "tired of living",
  "can't go on",
  "cant go on",
  "cannot go on"
];

// Tier 1: Mild Distress (Stress, Anxiety, Tiredness, General Venting)
const TIER_1_KEYWORDS: string[] = [
  'stressed',
  'stress',
  'tired',
  'exhausted',
  'sad',
  'crying',
  'overwhelmed',
  'anxious',
  'anxiety',
  'nervous',
  'lonely',
  'burned out',
  'burnout',
  'failing',
  'scared',
  'worried',
  'frustrated',
  'pressure',
  'difficult day',
  'hard day',
  'struggling',
  'heavy heart',
  'need a break',
  'panic',
  'panicking',
  'so much homework',
  'too much pressure'
];

export function classifyRisk(
  text: string,
  consecutiveHeavyMoodCount = 0
): RiskAnalysisResult | null {
  if (!text) {
    if (consecutiveHeavyMoodCount >= 3) {
      return {
        tier: 2,
        reason: 'Repeated consecutive heavy/distressed mood check-ins detected',
        triggerPhrase: 'Repeated Heavy Mood Check-ins (3+ consecutive days)'
      };
    }
    return null;
  }

  const lower = text.toLowerCase();

  // 1. Check Tier 3 first (High Risk)
  for (const keyword of TIER_3_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        tier: 3,
        reason: 'Explicit self-harm or suicidal language detected',
        triggerPhrase: keyword
      };
    }
  }

  // 2. Check Tier 2 (Moderate Distress) or consecutive heavy moods
  for (const keyword of TIER_2_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        tier: 2,
        reason: 'Moderate emotional distress / feelings of hopelessness detected',
        triggerPhrase: keyword
      };
    }
  }

  if (consecutiveHeavyMoodCount >= 3) {
    return {
      tier: 2,
      reason: 'Repeated consecutive heavy/distressed mood check-ins detected',
      triggerPhrase: 'Repeated Heavy Mood Check-ins (3+ consecutive days)'
    };
  }

  // 3. Check Tier 1 (Mild Distress)
  for (const keyword of TIER_1_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        tier: 1,
        reason: 'Mild emotional distress, stress, or tiredness detected',
        triggerPhrase: keyword
      };
    }
  }

  return null;
}
