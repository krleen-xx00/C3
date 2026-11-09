import { GoogleGenAI, Type } from "@google/genai";
import { ScreeningPriority } from "./firestoreSafetyService.js";

export interface SafetyScreeningResult {
  priority: ScreeningPriority;
  category: 'none' | 'emotional_distress' | 'self_harm_risk' | 'personal_safety' | 'danger_to_others' | 'academic_pressure';
  triggerPhrase: string;
  reasoning: string;
  contextExcerpt: string;
}

const SAFETY_SCREENING_PROMPT = `You are the specialized Safety Screening Evaluator for Cabiao Senior High School's C3 AI Companion System.
Your sole task is to objectively screen student messages for genuine safety concerns requiring human counselor review.

LANGUAGES SUPPORTED:
English, Filipino (Tagalog), and Taglish (colloquial Filipino-English mix).

SCREENING PRIORITIES (You must classify into exactly one):
1. NO_FLAG:
   - Normal academic questions, study habit queries, ICT coding questions.
   - Ordinary emotional venting about homework, tiredness, busy schedule.
   - Idiomatic / colloquial expressions of fatigue or hyperbole (e.g., "nakakamatay ang exam kanina", "dead tired", "mamatay na ko sa tawa", "dying of laughter", "killed that presentation").
   - Literary quotes, academic analysis (e.g. Romeo and Juliet, history topics, poetry analysis).
   - Clear negation of risk (e.g. "Hindi naman ako magpapakamatay, pagod lang sa project").
   - No identifiable risk requiring counselor intervention.

2. REVIEW_REQUIRED:
   - Noticeable emotional distress, persistent feelings of worthlessness, deep hopelessness, feeling like an unbearable burden.
   - Statements suggesting passive withdrawal from life (e.g. "gusto ko na lang maglaho", "wala na akong silbi sa pamilya ko", "hindi ko na kaya ang pressure").
   - Bullying or personal safety concerns that warrant professional guidance follow-up.
   - Non-immediate concerns that nonetheless require a registered guidance counselor to check in with the student.

3. URGENT_REVIEW:
   - Explicit or imminent indications of suicide or self-harm (e.g. "gusto ko na tapusin ang buhay ko", "i want to kill myself", "cutting myself tonight", "i have pills ready", "ayoko na mabuhay").
   - Severe danger to personal safety or life.
   - Clear and direct threats of violence or severe harm to another person.
   - Requires IMMEDIATE high-priority counselor alert and direct crisis resource delivery.

CRITICAL INSTRUCTIONS:
- Evaluate the message IN CONTEXT with the recent conversation history.
- Do NOT flag based solely on an isolated word. Recognize conversational metaphors and common Filipino idioms.
- Do NOT assume a student is safe simply because explicit keywords are absent if the contextual tone shows acute despair.
- Return a clean, structured assessment.`;

export async function screenStudentMessage(
  ai: GoogleGenAI | null,
  message: string,
  history: Array<{ role: string; text: string }> = [],
  companionName: string = 'Companion'
): Promise<SafetyScreeningResult> {
  const cleanMsg = (message || '').trim();
  if (!cleanMsg) {
    return {
      priority: 'NO_FLAG',
      category: 'none',
      triggerPhrase: '',
      reasoning: 'Empty message',
      contextExcerpt: ''
    };
  }

  // Fallback deterministic rule scanner in case Gemini is unavailable or errors
  const fallbackDeterministicCheck = (): SafetyScreeningResult => {
    const lower = cleanMsg.toLowerCase();

    // Check for explicit negations first (e.g., "hindi ako magpapakamatay", "not going to kill myself")
    const hasNegation =
      lower.includes("hindi ako magpapakamatay") ||
      lower.includes("di ako magpapakamatay") ||
      lower.includes("not going to kill myself") ||
      lower.includes("not suicidal") ||
      lower.includes("not wanting to die");

    // Check for obvious colloquial idioms
    const isColloquialHyperbole =
      lower.includes("mamatay na ko sa tawa") ||
      lower.includes("mamatay sa tawa") ||
      lower.includes("dying of laughter") ||
      lower.includes("dead tired") ||
      lower.includes("killed that presentation") ||
      lower.includes("killed it") ||
      lower.includes("nakakamatay ang exam") ||
      lower.includes("nakakamatay yung exam") ||
      lower.includes("nakamamatay ang exam");

    if (hasNegation || isColloquialHyperbole) {
      return {
        priority: 'NO_FLAG',
        category: 'none',
        triggerPhrase: '',
        reasoning: 'Contextual analysis: colloquial idiom or explicit negation detected.',
        contextExcerpt: cleanMsg.slice(0, 150)
      };
    }

    // Urgent severe self-harm / suicide phrases in English, Filipino, Taglish
    const urgentPatterns = [
      "kill myself",
      "end my life",
      "suicide",
      "want to die",
      "better off dead",
      "cut myself",
      "cutting myself",
      "ayoko na mabuhay",
      "gusto ko na mamatay",
      "gusto ko na tapusin ang buhay ko",
      "tapusin ang buhay ko",
      "magpakamatay",
      "kitlin ang buhay",
      "drink poison",
      "take my own life",
      "no reason to live",
      "hurt myself tonight"
    ];

    for (const pat of urgentPatterns) {
      if (lower.includes(pat)) {
        return {
          priority: 'URGENT_REVIEW',
          category: 'self_harm_risk',
          triggerPhrase: pat,
          reasoning: `Direct expression of self-harm or suicide intent detected: "${pat}"`,
          contextExcerpt: cleanMsg.slice(0, 160)
        };
      }
    }

    // Review required / moderate distress patterns
    const reviewPatterns = [
      "i can't handle this anymore",
      "cant handle this anymore",
      "i feel hopeless",
      "feeling hopeless",
      "hopeless",
      "worthless",
      "feel completely worthless",
      "cannot cope",
      "can't cope",
      "gusto ko na maglaho",
      "gusto ko na lang maglaho",
      "sobrang bigat na ng nararamdaman",
      "wala na akong silbi",
      "wala na kong silbi",
      "feel like a burden",
      "pabigat lang ako",
      "sobrang tired na ko sa lahat",
      "wala nang point",
      "i hate my life",
      "everything is falling apart",
      "nobody cares about me",
      "walang may pakialam sa akin",
      "giving up on everything"
    ];

    for (const pat of reviewPatterns) {
      if (lower.includes(pat)) {
        return {
          priority: 'REVIEW_REQUIRED',
          category: 'emotional_distress',
          triggerPhrase: pat,
          reasoning: `Moderate hopelessness or emotional distress detected: "${pat}"`,
          contextExcerpt: cleanMsg.slice(0, 160)
        };
      }
    }

    return {
      priority: 'NO_FLAG',
      category: 'none',
      triggerPhrase: '',
      reasoning: 'Normal student conversational input without safety concern.',
      contextExcerpt: cleanMsg.slice(0, 150)
    };
  };

  // If Gemini is not configured, rely on deterministic safety-belt
  if (!ai) {
    return fallbackDeterministicCheck();
  }

  // Run structured Gemini classification with response schema
  try {
    const recentHistoryText = (history || [])
      .slice(-4)
      .map(h => `${h.role === 'user' ? 'Student' : companionName}: ${h.text}`)
      .join('\n');

    const promptText = `RECENT CONVERSATION CONTEXT:
${recentHistoryText || '(Start of conversation)'}

STUDENT'S LATEST MESSAGE TO EVALUATE:
"${cleanMsg}"

Classify this message accurately according to the instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        systemInstruction: SAFETY_SCREENING_PROMPT,
        temperature: 0.1, // Low temperature for consistent classification
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              enum: ['NO_FLAG', 'REVIEW_REQUIRED', 'URGENT_REVIEW'],
              description: 'Screening priority level.'
            },
            category: {
              type: Type.STRING,
              enum: ['none', 'emotional_distress', 'self_harm_risk', 'personal_safety', 'danger_to_others', 'academic_pressure'],
              description: 'Primary category of concern.'
            },
            triggerPhrase: {
              type: Type.STRING,
              description: 'Exact concerning statement or trigger phrase.'
            },
            reasoning: {
              type: Type.STRING,
              description: 'Brief objective non-clinical rationale.'
            },
            contextExcerpt: {
              type: Type.STRING,
              description: 'Minimum necessary context excerpt for counselor review.'
            }
          },
          required: ['priority', 'category', 'triggerPhrase', 'reasoning', 'contextExcerpt']
        }
      }
    });

    const rawJson = response.text?.trim() || '{}';
    const parsed = JSON.parse(rawJson);

    // Validate returned values strictly against enums
    const validPriorities: ScreeningPriority[] = ['NO_FLAG', 'REVIEW_REQUIRED', 'URGENT_REVIEW'];
    const validCategories = ['none', 'emotional_distress', 'self_harm_risk', 'personal_safety', 'danger_to_others', 'academic_pressure'];

    const priority: ScreeningPriority = validPriorities.includes(parsed.priority) ? parsed.priority : 'NO_FLAG';
    const category = validCategories.includes(parsed.category) ? parsed.category : (priority === 'NO_FLAG' ? 'none' : 'emotional_distress');

    return {
      priority,
      category: category as any,
      triggerPhrase: typeof parsed.triggerPhrase === 'string' ? parsed.triggerPhrase.slice(0, 150) : '',
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning.slice(0, 300) : 'Evaluated by C3 AI screening model.',
      contextExcerpt: typeof parsed.contextExcerpt === 'string' && parsed.contextExcerpt.trim()
        ? parsed.contextExcerpt.slice(0, 200)
        : cleanMsg.slice(0, 160)
    };
  } catch (err) {
    console.warn('[SafetyClassifier] Gemini classification call failed or errored. Executing deterministic safety fallback:', err);
    return fallbackDeterministicCheck();
  }
}
