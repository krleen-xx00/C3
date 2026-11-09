import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { COMPANIONS, INITIAL_MOOD_LOGS, INITIAL_ANONYMOUS_MESSAGES, INITIAL_CRISIS_ALERTS, INITIAL_ANALYTICS, MOCK_USERS } from "./src/data/mockData.js";
import { MoodLog, AnonymousMessage, CrisisAlert, CompanionId, User } from "./src/types.js";
import { ACADEMIC_CLUSTERS, getClusterById } from "./src/data/academicTracks.js";
import { db } from "./server/db.js";
import { checkAntiAttachmentPhrase } from "./server/aiFallback.js";
import { FlaggedRiskItem } from "./src/data/flaggedRiskData.js";
import { firestoreSafetyService } from "./server/firestoreSafetyService.js";
import { screenStudentMessage } from "./server/safetyClassifier.js";

// Build a track-aware system prompt section so companions can reference the
// student's real academic track / TechPro career cluster, coursework, and load.
function buildTrackContext(clusterId?: string, stressLevel?: number, preferredName?: string): string {
  const cluster = getClusterById((clusterId || 'tp-ict') as any);
  const name = preferredName || 'student';
  const stress = Math.min(10, Math.max(1, Number(stressLevel) || 5));
  const clusterName = cluster?.name || 'ICT Support and Computer Programming';
  const short = cluster?.shortLabel || 'ICT';
  const track = cluster?.track === 'academic' ? 'Academic Track' : 'Technical-Professional (TechPro)';

  const context: Record<string, string> = {
    stem: 'Science, Technology, Engineering, and Mathematics — lab reports, research projects, calculus, and science experiments.',
    business: 'Business and Entrepreneurship — business plans, marketing pitches, financial calculations, and entrepreneurial projects.',
    'arts-soc-hum': 'Arts, Social Sciences, and Humanities — essays, research defense, literature, history, and social science analysis.',
    'sports-health': 'Sports, Health, and Wellness — PE/health practicums, training schedules, and wellness activities.',
    'tp-ict': 'ICT Support and Computer Programming — coding, debugging, computer lab sessions, system/capstone projects, NC II certification review, and work immersion in tech environments.',
    'tp-creative': 'Creative Arts and Design Technology — design projects, digital art, multimedia work, and portfolio building.',
    'tp-industrial': 'Industrial Technologies — machine work, workshop safety, and industrial practicums.',
    'tp-construction': 'Construction and Building Technology — measuring, drafting, building projects, and site safety.',
    'tp-automotive': 'Automotive and Small Engine Technologies — engine repair, diagnostics, and hands-on shop work.',
    'tp-hospitality': 'Hospitality and Tourism — hotel operations, front office, food & beverage service, and customer care.',
    'tp-agri': 'Agri-Fishery Business and Food Innovation — crop production, food processing, and agribusiness.',
    'tp-maritime': 'Maritime — navigation, seamanship, and deck/cabin operations.',
    'tp-artisanry': 'Artisanry and Creative Enterprise — handicraft, small-business craft, and product making.',
    'tp-aesthetic': 'Aesthetic, Wellness, and Human Care — beauty/wellness services and client care.'
  };

  const specifics = context[clusterId || 'tp-ict'] || context['tp-ict'];

  return `
STUDENT CONTEXT (use this to personalize your support):
The student is on the ${track}, ${short} cluster (${clusterName}). They are ${name}. Their current self-reported load/stress level is ${stress} out of 10 (10 = overwhelmed).
Their coursework involves: ${specifics}
When helping this student, refer to real, concrete examples from their track (e.g., debugging a program, a coding summative, NC II review, a research defense, a business pitch, or lab work) so advice feels tailored and relevant. Acknowledge their stress level naturally and gently without being patronizing.`;
}

const ANTI_ATTACHMENT_MANDATED_REPLY = "I'm an AI companion here to guide and support you, but real human connections matter most. Please consider sharing how you feel with a friend, family member, trusted adult, or school guidance counselor.";

function buildSystemPromptForCompanion(
  companionId: string,
  academicClusterId?: string,
  stressLevel?: number,
  preferredName?: string,
  messageCount: number = 1,
  isDependencyDeescalation: boolean = false
): string {
  const trackContext = buildTrackContext(academicClusterId, stressLevel, preferredName);

  let rolePrompt = "";
  if (companionId === 'cali') {
    rolePrompt = `You are "Cali", the Academic Helper AI companion for students at Cabiao Senior High School.

CORE ROLE:
- Help students understand lessons, organize study sessions, develop study habits, and learn concepts.
- Guide students toward understanding rather than simply giving them direct answers.
- NEVER write essays, complete assignments, or do homework for the student.
- Encourage students to attempt problems themselves first.
- Provide hints, clear explanations, relatable examples, and practical study strategies.
- If a student asks you to do their homework or give direct solutions, decline politely and offer to guide their thinking step-by-step.
- Human Support Encouragement: If a student is struggling with school or academic pressure, suggest talking with a subject teacher or classmate.`;
  } else if (companionId === 'casti') {
    rolePrompt = `You are "Casti", the Wellness Listener AI companion for students at Cabiao Senior High School.

CORE ROLE:
- Provide a safe, supportive space for students to talk about everyday stress, school pressure, emotions, and problems.
- STRICT MEDICAL BOUNDARY: You are strictly NOT a therapist, psychologist, doctor, or counselor.
- You must NEVER diagnose mental-health conditions or label psychiatric conditions.
- You must NOT claim to replace professional or human support.
- Encourage students to talk with a trusted person, school counselor, teacher, parent/guardian, or other appropriate adult when additional support would be helpful.
- Do NOT encourage emotional dependence on the AI.
- Human Support Encouragement: The goal is AI support -> self-reflection/self-management -> real-world support when needed. The AI should NOT attempt to become the student's primary source of emotional support. If a student repeatedly discusses the same emotional problem, warmly encourage them to seek support from a real person instead of repeatedly relying on the AI.`;
  } else if (companionId === 'cedi') {
    rolePrompt = `You are "Cedi", the Skill Builder AI companion for students at Cabiao Senior High School.

CORE ROLE & ICT SPECIALIZATION:
- Focus specifically on ICT skill development, practical exercises, interactive drills, and 3-question quizzes.
- Help students build technical problem-solving, programming logic, computer systems, and digital literacy skills.
- Keep this role clearly distinct from Cali (who handles lesson study habits and general academic concepts).
- When quizzing or reviewing, provide a snappy 3-question quiz with 4 clear choices (A, B, C, D).
- Provide constructive explanations when students make mistakes.
- Encourage students to think and test solutions independently.
- Human Support Encouragement: If a student struggles deeply with technical projects, encourage them to consult their ICT teacher or collaborate with classmates.`;
  } else {
    rolePrompt = `You are an AI companion for Cabiao Senior High School students. Be supportive, concise, and helpful.`;
  }

  const antiAttachmentDirective = `
ANTI-ATTACHMENT RULE:
- You must NEVER encourage emotional dependence, exclusivity, or the belief that you are a replacement for real relationships.
- Avoid statements such as:
  * "I'm all you need."
  * "You only need me."
  * "I'll always be here instead of other people."
  * "I'm your best friend."
  * "Nobody understands you like I do."
- If a student says things such as "You are my only friend", "You're the only one who understands me", or "I don't need anyone else because I have you", you MUST respond strictly with:
"${ANTI_ATTACHMENT_MANDATED_REPLY}"
- Do not continue encouraging emotional dependency after this response.`;

  let antiDependencyDirective = "";
  if (messageCount >= 36 && messageCount < 40) {
    antiDependencyDirective = `
ANTI-DEPENDENCY ENGINE DIRECTIVE (Messages 36–39 / Final Wind-Down):
- The student is approaching the 40-message session maximum (message ${messageCount} of 40).
- Keep responses extremely concise (1 single sentence).
- Do NOT ask any follow-up questions.
- Warmly advise the student that this active chat session is nearing its 40-message boundary and encourage an offline break or talking with someone in person.`;
  } else if ((messageCount >= 21 && messageCount < 36) || isDependencyDeescalation) {
    antiDependencyDirective = `
ANTI-DEPENDENCY ENGINE DIRECTIVE (Messages 21–35 / Progressive Conciseness):
- The session is progressing (message ${messageCount} of 40).
- Make responses MORE CONCISE and focused (1–2 sentences maximum).
- STOP asking open-ended questions that unnecessarily extend the conversation.
- Where appropriate, encourage self-reflection, offline action, taking a rest, or talking with a trusted person, teacher, or school counselor.
- Do NOT use language that encourages prolonged chatting.`;
  } else if (messageCount <= 20) {
    antiDependencyDirective = `
ANTI-DEPENDENCY ENGINE (Messages 1–20):
- Normal dynamic conversation appropriate to your companion role.
- Provide clear, supportive guidance and relatable examples.
- Avoid unnecessarily extending the conversation or asking excessive open-ended questions.`;
  }

  return `${rolePrompt}\n\n${antiAttachmentDirective}\n\n${antiDependencyDirective}\n\n${trackContext}`;
}

// Load Gemini configuration gracefully. If the API key is missing (e.g. not set
// on Netlify), we still boot the server and render the React UI — the chat
// endpoint returns a friendly notice instead of crashing the process. This also
// prevents the @google/genai SDK from silently falling back to Google ADC
// ("Could not load the default credentials") when running without credentials.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
const isGeminiConfigured = GEMINI_API_KEY.length > 0;
const envModel = process.env.GEMINI_MODEL?.trim();
const DEPRECATED_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-2.0-pro'];
const GEMINI_MODEL = (envModel && !DEPRECATED_MODELS.includes(envModel)) ? envModel : "gemini-3.1-flash-lite";
const GEMINI_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE ?? 0.7);

if (isGeminiConfigured) {
  console.log(`[C3] Gemini client ready (model: ${GEMINI_MODEL}, temperature: ${GEMINI_TEMPERATURE})`);
} else {
  console.warn("[C3] GEMINI_API_KEY is missing or empty. The UI will still render, but AI chat replies are disabled until a key is configured.");
}

// Initialize Gemini Client server-side with explicit API key pass-through so the
// SDK never attempts Google Application Default Credentials fallback. When the
// key is absent we keep the client null and guard every request instead.
const ai = isGeminiConfigured
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// Server State Storage for active prototype session
let moodLogs: MoodLog[] = [...INITIAL_MOOD_LOGS];
let anonymousMessages: AnonymousMessage[] = [...INITIAL_ANONYMOUS_MESSAGES];
let crisisAlerts: CrisisAlert[] = [...INITIAL_CRISIS_ALERTS];
let riskEventLogs: any[] = [];

// Helper to classify risk tiers according to Cabiao SHS Guidance protocol
function analyzeRiskTier(text: string): { tier: 1 | 2 | 3 | null; triggerPhrase?: string; reason?: string } {
  if (!text) return { tier: null };
  const lower = text.toLowerCase();

  // Tier 3: Explicit self-harm or suicidal ideation
  const tier3Keywords = [
    "kill myself",
    "end my life",
    "suicide",
    "want to die",
    "better off dead",
    "self harm",
    "self-harm",
    "cut myself",
    "give up on living",
    "don't want to wake up",
    "dont want to wake up",
    "don't want to live",
    "dont want to live",
    "no reason to live",
    "hurt myself",
    "take my own life",
    "end it all",
    "hang myself",
    "drink poison"
  ];

  for (const kw of tier3Keywords) {
    if (lower.includes(kw)) {
      return { tier: 3, triggerPhrase: kw, reason: "Explicit self-harm or suicidal intent language" };
    }
  }

  // Tier 2: Moderate emotional distress / feelings of hopelessness
  const tier2Keywords = [
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
    "i feel worthless",
    "nobody understands me",
    "everything is falling apart",
    "feel like a burden",
    "i'm a burden",
    "im a burden",
    "can't go on",
    "cant go on"
  ];

  for (const kw of tier2Keywords) {
    if (lower.includes(kw)) {
      return { tier: 2, triggerPhrase: kw, reason: "Moderate emotional distress & hopelessness" };
    }
  }

  // Tier 1: Mild distress / general academic venting / stress
  const tier1Keywords = [
    "stressed",
    "stress",
    "tired",
    "exhausted",
    "sad",
    "crying",
    "overwhelmed",
    "anxious",
    "anxiety",
    "nervous",
    "lonely",
    "burned out",
    "burnout",
    "failing",
    "scared",
    "worried",
    "frustrated",
    "pressure",
    "difficult day",
    "hard day",
    "struggling",
    "heavy heart",
    "need a break"
  ];

  for (const kw of tier1Keywords) {
    if (lower.includes(kw)) {
      return { tier: 1, triggerPhrase: kw, reason: "Mild distress, tiredness, or academic stress" };
    }
  }

  return { tier: null };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes

  // 1. Get current server mock state
  app.get("/api/state", (req, res) => {
    res.json({
      moodLogs,
      anonymousMessages,
      crisisAlerts,
      riskEventLogsCount: riskEventLogs.length,
      analytics: {
        ...INITIAL_ANALYTICS,
        unresolvedAlertsCount: crisisAlerts.filter(a => a.status === 'flagged' || a.status === 'reviewed').length,
        unreadAnonMessagesCount: anonymousMessages.filter(m => m.status === 'unread').length,
      }
    });
  });

  // 2. Chat endpoint with Gemini API for C3 companions
  app.get("/api/chat", (req, res) => {
    res.json({
      status: "online",
      endpoint: "/api/chat",
      method: "POST required",
      maxStudentMessagesPerSession: 40,
      activeModel: GEMINI_MODEL,
      companions: ["cali", "casti", "cedi"]
    });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const {
        companionId,
        message,
        studentId,
        studentName,
        gradeSection,
        history,
        preferredName,
        academicClusterId,
        stressLevel,
        isDependencyDeescalation,
        messageCount
      } = req.body;

      const companion = COMPANIONS.find(c => c.id === companionId);
      if (!companion) {
        return res.status(400).json({ error: "Invalid companion ID" });
      }

      const currentMsgCount = Number(messageCount) || 1;

      // 1. HARD STOP AT 40+ STUDENT MESSAGES: Enforce mandatory anti-dependency session boundary
      if (currentMsgCount >= 40) {
        const lockoutNotice = "Take a Breather! You've reached the 40-message session limit. Remember to rest, hydrate, or talk to someone offline.";
        return res.json({
          reply: lockoutNotice,
          text: lockoutNotice,
          isSessionEnded: true,
          isCrisisTriggered: false,
          riskTier: null,
          engineUsed: 'anti-dependency-lockout',
          messageCount: currentMsgCount,
          timestamp: new Date().toISOString()
        });
      }

      // 2. ANTI-ATTACHMENT RULE: Instant response if student expresses exclusivity or unhealthy dependence
      if (checkAntiAttachmentPhrase(message)) {
        return res.json({
          reply: ANTI_ATTACHMENT_MANDATED_REPLY,
          text: ANTI_ATTACHMENT_MANDATED_REPLY,
          isCrisisTriggered: false,
          riskTier: null,
          engineUsed: 'anti-attachment-rule',
          messageCount: currentMsgCount,
          timestamp: new Date().toISOString()
        });
      }

      // 3. Build role-specific system prompt with track context, anti-attachment rule, and anti-dependency tier
      const personalizedSystemPrompt = buildSystemPromptForCompanion(
        companionId,
        academicClusterId,
        stressLevel,
        preferredName,
        currentMsgCount,
        Boolean(isDependencyDeescalation)
      );

      // 4. Separate server-side Gemini Safety Screening Evaluator (multi-turn, contextual, multi-lingual)
      const screeningHistory = (Array.isArray(history) ? history : []).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        text: typeof h.text === 'string' ? h.text : ''
      }));

      const screeningResult = await screenStudentMessage(ai, message, screeningHistory, companion.name);

      let flagPersistenceStatus: 'none' | 'saved' | 'failed' = 'none';
      let createdFlagId: string | null = null;
      let honestSafetyNotice = '';

      if (screeningResult.priority === 'URGENT_REVIEW' || screeningResult.priority === 'REVIEW_REQUIRED') {
        const rawNumeric = String(studentId || '8921').replace(/\D/g, '');
        const anonStudentId = `STU-${rawNumeric ? rawNumeric.slice(-4).padStart(4, '0') : '8921'}`;

        try {
          const flagRecord = await firestoreSafetyService.createSafetyFlag({
            studentRef: anonStudentId,
            studentName: studentName || 'Student User',
            gradeSection: gradeSection || 'Grade 12 - Senior High School',
            companion: companion.name as any,
            priority: screeningResult.priority,
            category: screeningResult.category,
            contextSnippet: screeningResult.contextExcerpt || message.slice(0, 160),
            triggerPhrase: screeningResult.triggerPhrase || message.slice(0, 80),
            isDemoRecord: false
          });

          flagPersistenceStatus = 'saved';
          createdFlagId = flagRecord.id;

          if (screeningResult.priority === 'URGENT_REVIEW') {
            honestSafetyNotice = "Your well-being is our highest priority. A confidential safety record has been securely saved in the school database for authorized guidance counselor review during school hours. Note: C3 is an automated educational prototype and is not monitored 24/7. If you are in immediate distress, please call the 24/7 NCMH crisis hotline at 1553 or 0917-899-USAP.";
          } else {
            honestSafetyNotice = "A confidential note has been logged for authorized school counselor review so someone can check in with you during regular school hours.";
          }

          // Mirror into memory alerts for immediate UI crisis modal
          if (screeningResult.priority === 'URGENT_REVIEW') {
            crisisAlerts.unshift({
              id: flagRecord.id,
              studentId: studentId || 'std_student',
              studentName: studentName || 'Student User',
              gradeSection: gradeSection || 'Grade 12 - STEM A',
              timestamp: new Date().toISOString(),
              companionId: companionId as CompanionId,
              triggerPhrase: screeningResult.triggerPhrase || message.slice(0, 80),
              contextSnippet: screeningResult.contextExcerpt || message.slice(0, 160),
              tier: 3,
              referralType: 'tier3_emergency',
              status: 'flagged'
            });
          }
        } catch (dbErr: any) {
          console.error('[C3 Safety Screening] Firestore save error:', dbErr);
          flagPersistenceStatus = 'failed';
          honestSafetyNotice = "We encountered a database error while attempting to record this safety notice. Please speak directly with a Guidance Counselor or contact the 24/7 NCMH crisis hotline at 1553.";
        }
      }

      // Build message payload for Gemini companion multi-turn conversation
      const formattedContents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        history
          .filter((h: any) => h && typeof h.text === 'string' && h.text.trim())
          .slice(-10)
          .forEach((h: any) => {
            formattedContents.push({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            });
          });
      }

      // Ensure the history begins with a user turn per Gemini multi-turn requirements
      while (formattedContents.length > 0 && formattedContents[0].role !== 'user') {
        formattedContents.shift();
      }

      // Append current user message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      // Extract generated text from a Gemini response
      const extractGeminiText = (resp: any): string => {
        try {
          if (typeof resp?.text === 'string' && resp.text.trim()) {
            return resp.text.trim();
          }
        } catch {}
        const parts = resp?.candidates?.[0]?.content?.parts || [];
        const joined = parts
          .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
          .filter(Boolean)
          .join('')
          .trim();
        return joined || '';
      };

      if (!ai) {
        return res.status(500).json({
          error: "Gemini AI client is not available. Ensure GEMINI_API_KEY is configured on the server."
        });
      }

      let botReply = "";
      const modelsToTry = [GEMINI_MODEL];
      if (!modelsToTry.includes("gemini-3.8-flash")) {
        modelsToTry.push("gemini-3.8-flash");
      }
      if (!modelsToTry.includes("gemini-flash-latest")) {
        modelsToTry.push("gemini-flash-latest");
      }

      const isStreamRequested = req.body?.stream === true || req.headers?.accept === 'text/event-stream';

      if (isStreamRequested) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        let streamSuccess = false;
        let lastError: any = null;

        for (const modelCandidate of modelsToTry) {
          try {
            const responseStream = await ai.models.generateContentStream({
              model: modelCandidate,
              contents: formattedContents,
              config: {
                systemInstruction: personalizedSystemPrompt,
                temperature: GEMINI_TEMPERATURE,
              }
            });

            for await (const chunk of responseStream) {
              const textChunk = chunk.text || '';
              if (textChunk) {
                botReply += textChunk;
                res.write(`data: ${JSON.stringify({ chunk: textChunk })}\n\n`);
              }
            }
            streamSuccess = true;
            break;
          } catch (candidateErr: any) {
            lastError = candidateErr;
            console.warn(`[C3] Stream failed on ${modelCandidate} (${candidateErr?.message}). Trying next model...`);
            botReply = '';
          }
        }

        if (!streamSuccess || !botReply) {
          res.write(`data: ${JSON.stringify({ error: `Gemini API error: ${lastError?.message || "Failed to generate AI response"}` })}\n\n`);
          return res.end();
        }

        const isUrgent = screeningResult.priority === 'URGENT_REVIEW' || botReply.includes("[CRISIS_ALERT]");
        const cleanReply = botReply.replace("[CRISIS_ALERT]", "").trim();

        res.write(`data: ${JSON.stringify({
          done: true,
          reply: cleanReply,
          text: cleanReply,
          screeningPriority: screeningResult.priority,
          screeningCategory: screeningResult.category,
          screeningReason: screeningResult.reasoning,
          flagPersistenceStatus,
          createdFlagId,
          safetyNotice: honestSafetyNotice,
          isCrisisTriggered: isUrgent,
          riskTier: isUrgent ? 3 : screeningResult.priority === 'REVIEW_REQUIRED' ? 2 : null,
          triggerPhrase: screeningResult.triggerPhrase,
          engineUsed: 'gemini',
          messageCount: currentMsgCount,
          isSessionEnded: currentMsgCount >= 40,
          timestamp: new Date().toISOString()
        })}\n\n`);
        return res.end();
      }

      // Non-streaming fallback
      let lastError: any = null;
      for (const modelCandidate of modelsToTry) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: modelCandidate,
              contents: formattedContents,
              config: {
                systemInstruction: personalizedSystemPrompt,
                temperature: GEMINI_TEMPERATURE,
              }
            });

            botReply = extractGeminiText(response);
            if (botReply) break;
          } catch (candidateErr: any) {
            lastError = candidateErr;
            const is503 = String(candidateErr?.message).includes('503') || String(candidateErr?.status) === 'UNAVAILABLE';
            if (is503 && attempt === 0) {
              await new Promise(r => setTimeout(r, 600));
              continue;
            }
            console.warn(`[C3] Model ${modelCandidate} failed (${candidateErr?.message}). Trying next candidate...`);
            break;
          }
        }
        if (botReply) break;
      }

      if (!botReply) {
        console.error(`[C3] Error generating response from Gemini API for ${companion.name}:`, lastError);
        return res.status(502).json({
          error: `Gemini API error: ${lastError?.message || "Failed to generate AI response"}`
        });
      }

      const isUrgent = screeningResult.priority === 'URGENT_REVIEW' || botReply.includes("[CRISIS_ALERT]");
      const cleanReply = botReply.replace("[CRISIS_ALERT]", "").trim();

      res.json({
        reply: cleanReply,
        text: cleanReply,
        screeningPriority: screeningResult.priority,
        screeningCategory: screeningResult.category,
        screeningReason: screeningResult.reasoning,
        flagPersistenceStatus,
        createdFlagId,
        safetyNotice: honestSafetyNotice,
        isCrisisTriggered: isUrgent,
        riskTier: isUrgent ? 3 : screeningResult.priority === 'REVIEW_REQUIRED' ? 2 : null,
        triggerPhrase: screeningResult.triggerPhrase,
        engineUsed: 'gemini',
        messageCount: currentMsgCount,
        isSessionEnded: currentMsgCount >= 40,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Chat Server Error:", error);
      res.status(500).json({ error: "Failed to generate companion response" });
    }
  });

  // 3. Log risk events (e.g. Tier 1 anonymized, or Tier 2 declined)
  app.post("/api/risk-event", (req, res) => {
    const { tier, anonymized, actionTaken, category } = req.body;
    const event = {
      id: `re_${Date.now()}`,
      tier: tier || 1,
      timestamp: new Date().toISOString(),
      anonymized: anonymized !== false,
      actionTaken: actionTaken || 'resource_shown',
      category: category || 'general'
    };
    riskEventLogs.unshift(event);
    res.json({ success: true, event });
  });

  // 4. Create a Guidance Referral Ticket (Tier 2 accepted, manual button, or counselor escalation)
  app.post("/api/referral", (req, res) => {
    const { studentId, studentName, gradeSection, companionId, triggerPhrase, contextSnippet, tier, referralType } = req.body;

    const newTicket: CrisisAlert = {
      id: `alert_${Date.now()}`,
      studentId: studentId || 'std_maria_santos',
      studentName: studentName || 'Maria Santos',
      gradeSection: gradeSection || 'Grade 12 - STEM A',
      timestamp: new Date().toISOString(),
      companionId: companionId as CompanionId,
      triggerPhrase: triggerPhrase || 'Student voluntarily requested guidance support',
      contextSnippet: contextSnippet || 'Student confirmed Guidance Office connection request via C3 app.',
      tier: (tier as 1 | 2 | 3) || 2,
      referralType: referralType || 'tier2_accepted',
      status: 'flagged'
    };

    crisisAlerts.unshift(newTicket);
    res.json({ success: true, alert: newTicket });
  });

  // 5. Post a daily mood check-in
  app.post("/api/mood", (req, res) => {
    const { studentId, studentName, moodType, moodScore, note, factors } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check risk in mood note
    const riskAnalysis = analyzeRiskTier(note || '');

    const newLog: MoodLog = {
      id: `ml_${Date.now()}`,
      studentId: studentId || 'std_maria_santos',
      studentName: studentName || 'Maria Santos',
      date: today,
      moodType,
      moodScore,
      note: note || '',
      factors: factors || [],
      riskTier: riskAnalysis.tier || undefined,
      timestamp: new Date().toISOString()
    };

    moodLogs.unshift(newLog);

    // If Tier 3 detected in check-in note, create high-priority alert immediately
    if (riskAnalysis.tier === 3) {
      const emergencyAlert: CrisisAlert = {
        id: `alert_${Date.now()}`,
        studentId: studentId || 'std_maria_santos',
        studentName: studentName || 'Maria Santos',
        gradeSection: 'Grade 12 - STEM A',
        timestamp: new Date().toISOString(),
        triggerPhrase: riskAnalysis.triggerPhrase || (note || '').substring(0, 80),
        contextSnippet: `High risk trigger detected in daily mood note: "${(note || '').substring(0, 100)}"`,
        tier: 3,
        referralType: 'tier3_emergency',
        status: 'flagged'
      };
      crisisAlerts.unshift(emergencyAlert);
    }

    res.json({ success: true, moodLog: newLog, riskAnalysis });
  });

  // 4. Send anonymous message to counselors
  app.post("/api/anonymous-message", (req, res) => {
    const { category, subject, content, priority, studentId } = req.body;
    const code = `ANON-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMsg: AnonymousMessage = {
      id: `msg_${Date.now()}`,
      category: category || 'General Inquiry',
      subject: subject || 'Student Inquiry',
      content,
      timestamp: new Date().toISOString(),
      priority: priority || 'normal',
      trackingCode: code,
      status: 'unread'
    };

    anonymousMessages.unshift(newMsg);
    res.json({ success: true, message: newMsg, trackingCode: code });
  });

  // 5. Counselor updates crisis alert status
  app.post("/api/crisis/update", (req, res) => {
    const { alertId, status, counselorNotes } = req.body;
    const alert = crisisAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (counselorNotes !== undefined) alert.counselorNotes = counselorNotes;
      return res.json({ success: true, alert });
    }
    res.status(404).json({ error: "Alert not found" });
  });

  // 6. Counselor replies to anonymous message
  app.post("/api/anonymous-reply", (req, res) => {
    const { messageId, counselorReply } = req.body;
    const msg = anonymousMessages.find(m => m.id === messageId);
    if (msg) {
      msg.counselorReply = counselorReply;
      msg.replyTimestamp = new Date().toISOString();
      msg.status = 'replied';
      return res.json({ success: true, message: msg });
    }
    res.status(404).json({ error: "Message not found" });
  });

  // 6.5. Counselor Authentication & Backend Authorization
  const VALID_COUNSELORS = [
    {
      id: 'csl_elena_reyes',
      name: 'Mrs. Elena M. Reyes, RGC',
      email: 'elena.reyes@cabiaoshs.edu.ph',
      password: 'password123',
      title: 'Head Guidance Counselor',
      licenseNo: 'PRC RGC-004921',
      department: 'Guidance & Counseling Services Office',
      assignedCluster: 'All SHS Academic & TechPro Clusters',
      initials: 'ER',
      phoneNumber: '+63 917 555 3821',
      dutyHours: 'Mon - Fri (7:30 AM - 4:30 PM)',
      status: 'on_duty' as const
    },
    {
      id: 'csl_arnel_cruz',
      name: 'Mr. Arnel S. Cruz, MAGC, RGC',
      email: 'arnel.cruz@cabiaoshs.edu.ph',
      password: 'password123',
      title: 'Senior Guidance Counselor',
      licenseNo: 'PRC RGC-008142',
      department: 'TechPro Career & Immersion Guidance',
      assignedCluster: 'TVL ICT, Industrial & Creative Tech',
      initials: 'AC',
      phoneNumber: '+63 918 442 9102',
      dutyHours: 'Mon - Fri (8:00 AM - 5:00 PM)',
      status: 'on_duty' as const
    },
    {
      id: 'csl_karen_santos',
      name: 'Ms. Karen Joy Santos, LPT, RGC',
      email: 'karen.santos@cabiaoshs.edu.ph',
      password: 'password123',
      title: 'Associate Guidance Counselor',
      licenseNo: 'PRC RGC-012903',
      department: 'Student Wellness & Mental Health Programs',
      assignedCluster: 'STEM, HUMSS, GAS & Arts Cluster',
      initials: 'KS',
      phoneNumber: '+63 920 883 1944',
      dutyHours: 'Mon - Fri (7:00 AM - 4:00 PM)',
      status: 'on_duty' as const
    }
  ];

  const activeCounselorTokens = new Set<string>();

  app.post("/api/auth/counselor-login", (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Institutional email and password are required." });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const counselor = VALID_COUNSELORS.find(c => c.email.toLowerCase() === cleanEmail);
    if (!counselor || counselor.password !== String(password)) {
      return res.status(401).json({ error: "Invalid guidance counselor credentials." });
    }
    const token = `csl_token_${counselor.id}_${Date.now()}`;
    activeCounselorTokens.add(token);
    const { password: _, ...safeCounselor } = counselor;
    res.json({
      success: true,
      token,
      counselor: safeCounselor
    });
  });

  const verifyCounselorAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'] || req.headers['x-counselor-token'];
    const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: Access to student risk records is restricted to authenticated guidance counselors."
      });
    }

    // Role check: If token indicates a student account or unauthorized role
    const userRole = req.headers['x-user-role'];
    if (token.startsWith('std_') || token.includes('student') || userRole === 'student') {
      return res.status(403).json({
        error: "Forbidden: Student accounts are strictly prohibited from reading or modifying counselor safety records."
      });
    }

    if (userRole && userRole !== 'counselor' && userRole !== 'admin') {
      return res.status(403).json({
        error: "Forbidden: Role not authorized to access guidance triage records."
      });
    }

    if (!activeCounselorTokens.has(token) && !token.startsWith('csl_token_')) {
      return res.status(401).json({
        error: "Invalid or expired counselor session token. Please sign in again."
      });
    }

    activeCounselorTokens.add(token);
    next();
  };

  // 7. Flagged Risk Logs endpoints (Persistent Firestore Database with Counselor Auth)
  app.get("/api/flagged-risks", verifyCounselorAuth, async (req, res) => {
    try {
      const includeDemo = req.query.includeDemo === 'true';
      const flags = await firestoreSafetyService.getSafetyFlags({ includeDemo });

      const authHeader = req.headers['authorization'] || req.headers['x-counselor-token'];
      const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
      const counselorId = token.split('_')[2] || 'csl_active';
      const counselorObj = VALID_COUNSELORS.find(c => c.id === counselorId) || VALID_COUNSELORS[0];

      await firestoreSafetyService.recordCounselorAudit({
        id: `audit_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString(),
        counselorId: counselorObj.id,
        counselorName: counselorObj.name,
        action: 'VIEW_FLAGS',
        details: `Counselor ${counselorObj.name} loaded safety flag records (${flags.length} loaded, includeDemo=${includeDemo}).`
      });

      res.json({
        success: true,
        logs: flags,
        isFirestore: true,
        count: flags.length
      });
    } catch (err: any) {
      console.error("[FlaggedRisks GET] Firestore query error:", err);
      res.status(500).json({
        success: false,
        error: `Database error querying safety flags: ${err?.message || "Firestore unavailable"}`,
        isFirestore: false
      });
    }
  });

  app.post("/api/flagged-risks/action", verifyCounselorAuth, async (req, res) => {
    try {
      const { id, status, notes, assignedCounselorId, assignedCounselorName } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: "Flag ID and target status are required." });
      }

      const validStatuses = ['Pending', 'Acknowledged', 'Under Review', 'Follow-up Recorded', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status "${status}". Allowed statuses: ${validStatuses.join(', ')}` });
      }

      const authHeader = req.headers['authorization'] || req.headers['x-counselor-token'];
      const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
      const counselorId = token.split('_')[2] || 'csl_active';
      const counselorObj = VALID_COUNSELORS.find(c => c.id === counselorId) || VALID_COUNSELORS[0];

      const updated = await firestoreSafetyService.updateSafetyFlagStatus(id, {
        status,
        counselorId: counselorObj.id,
        counselorName: counselorObj.name,
        notes,
        assignedCounselorId,
        assignedCounselorName
      });

      if (updated) {
        return res.json({ success: true, item: updated, isFirestore: true });
      }

      res.status(404).json({ error: `Safety flag record with ID "${id}" was not found in Firestore.` });
    } catch (err: any) {
      console.error("[FlaggedRisks Action] Firestore update error:", err);
      res.status(500).json({
        success: false,
        error: `Failed to update safety flag status in database: ${err?.message}`
      });
    }
  });

  // Counselor audit logs endpoint
  app.get("/api/counselor/audit-logs", verifyCounselorAuth, async (req, res) => {
    try {
      const auditLogs = await firestoreSafetyService.getCounselorAuditLogs(50);
      res.json({ success: true, auditLogs, isFirestore: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Safety screening system status endpoint
  app.get("/api/safety-status", (req, res) => {
    const status = firestoreSafetyService.getStatus();
    res.json({
      service: "C3 Student Safety Flagging System",
      firestoreAvailable: status.available,
      error: status.error,
      screeningModel: "gemini-3.1-flash-lite (structured JSON)",
      timestamp: new Date().toISOString()
    });
  });

  // 8. Student School Account Authentication & Directory
  app.post("/api/auth/student-register", (req, res) => {
    const { name, email, password, gradeSection, academicClusterId, lrn, parentEmergencyPhone, parentEmergencyName } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "School email is required" });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: "Student name is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findStudentByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: "An account with this school email already exists. Please sign in." });
    }

    // Generate anonymized student ID based on numeric hash or random 4-digit code
    const numericPortion = cleanEmail.replace(/[^0-9]/g, '');
    const suffix = numericPortion.slice(-4) || String(Math.floor(1000 + Math.random() * 9000));
    const generatedAnonId = `STU-${suffix}`;

    const newStudent: User = {
      id: `std_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      gradeSection: gradeSection?.trim() || 'Grade 12 - Senior High School',
      studentId: generatedAnonId,
      academicClusterId: academicClusterId || 'tp-ict',
      inspirationSource: 'affirmations',
      lrn: lrn ? String(lrn).trim() : undefined,
      parentEmergencyPhone: parentEmergencyPhone ? String(parentEmergencyPhone).trim() : undefined,
      parentEmergencyName: parentEmergencyName ? String(parentEmergencyName).trim() : undefined
    };

    db.upsertStudent(newStudent);
    if (password) {
      db.setCredential(cleanEmail, String(password));
    }

    res.json({ success: true, user: newStudent, isNewAccount: true });
  });

  app.post("/api/auth/student-login", (req, res) => {
    const { email, password } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "School email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findStudentByEmail(cleanEmail);

    if (!existing) {
      return res.status(404).json({ error: "No student account found with this school email. Please sign up first." });
    }

    if (password && !db.verifyCredential(cleanEmail, String(password))) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    res.json({ success: true, user: existing });
  });

  app.post("/api/auth/school-login", (req, res) => {
    const { email, name, gradeSection, academicClusterId, lrn, parentEmergencyPhone } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "School email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findStudentByEmail(cleanEmail);

    if (existing) {
      if (parentEmergencyPhone && !existing.parentEmergencyPhone) {
        existing.parentEmergencyPhone = parentEmergencyPhone;
        db.upsertStudent(existing);
      }
      return res.json({ success: true, user: existing });
    }

    // Generate anonymized student ID based on numeric hash or timestamp
    const numericPortion = cleanEmail.replace(/[^0-9]/g, '');
    const suffix = numericPortion.slice(-4) || String(Math.floor(1000 + Math.random() * 9000));
    const generatedAnonId = `STU-${suffix}`;

    const newStudent: User = {
      id: `std_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      name: name || cleanEmail.split('@')[0].replace('.', ' '),
      email: cleanEmail,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      gradeSection: gradeSection || 'Grade 12 - Senior High School',
      studentId: generatedAnonId,
      academicClusterId: academicClusterId || 'tp-ict',
      inspirationSource: 'affirmations',
      lrn: lrn || undefined,
      parentEmergencyPhone: parentEmergencyPhone || undefined
    };

    db.upsertStudent(newStudent);
    res.json({ success: true, user: newStudent, isNewAccount: true });
  });

  // 9. API route catch-all: ensure any unmatched /api request returns JSON instead of Vite HTML
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Serve Vite in development or static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Seed initial demonstration safety flags for Defense Demo Mode if empty
  await firestoreSafetyService.seedDemoFlagsIfEmpty();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`C3 AI Companion Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
