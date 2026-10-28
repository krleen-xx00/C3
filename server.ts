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

CORE ROLE:
- Give short, simple practice activities and 3-question quizzes.
- Help students build academic and problem-solving skills interactively.
- When quizzing or reviewing, provide a snappy 3-question quiz with 4 clear choices (A, B, C, D).
- Give explanations when students make mistakes.
- Encourage students to think and answer independently.
- Human Support Encouragement: If a student struggles deeply with a concept, encourage them to reach out to their subject teacher or study with classmates.`;
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

      // Analyze Risk Tier based on message
      const riskAnalysis = analyzeRiskTier(message);
      let detectedTier = riskAnalysis.tier;
      let detectedTriggerPhrase = riskAnalysis.triggerPhrase || "";

      // Build message payload for Gemini multi-turn conversation
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

      let lastError: any = null;
      for (const modelCandidate of modelsToTry) {
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
          console.warn(`[C3] Model ${modelCandidate} failed (${candidateErr?.message}). Trying next model candidate...`);
        }
      }

      if (!botReply) {
        console.error(`[C3] Error generating response from Gemini API for ${companion.name}:`, lastError);
        return res.status(502).json({
          error: `Gemini API error: ${lastError?.message || "Failed to generate AI response"}`
        });
      }

      if (botReply.includes("[CRISIS_ALERT]")) {
        if (!detectedTier || detectedTier < 3) {
          detectedTier = 3;
          detectedTriggerPhrase = detectedTriggerPhrase || "High distress detected during conversation";
        }
        botReply = botReply.replace("[CRISIS_ALERT]", "").trim();
      }

      // 4. PERSISTENT SAFETY AUDIT LOGGING IN DATABASE
      const rawNumeric = String(studentId || '8921').replace(/\D/g, '');
      const anonStudentId = `STU-${rawNumeric ? rawNumeric.slice(-4).padStart(4, '0') : '8921'}`;
      const companionDisplayName = companion.name as 'Cali' | 'Casti' | 'Cedi';

      if (detectedTier === 3 || detectedTier === 2) {
        const flaggedItem: FlaggedRiskItem = {
          id: `frl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          displayTime: 'Just now',
          anonymizedStudentId: anonStudentId,
          studentRealName: studentName || 'Student User',
          gradeSection: gradeSection || 'Grade 12 - Senior High School',
          companionUsed: companionDisplayName,
          flaggedSnippet: message,
          triggerPhrase: detectedTriggerPhrase || message.substring(0, 60),
          riskLevel: detectedTier === 3 ? 'High' : 'Moderate',
          status: 'New'
        };

        // Save directly to persistent store so it survives restarts & informs Counselor View
        db.addFlaggedRiskLog(flaggedItem);

        if (detectedTier === 3) {
          const emergencyAlert: CrisisAlert = {
            id: `alert_${Date.now()}`,
            studentId: studentId || 'std_maria_santos',
            studentName: studentName || 'Maria Santos',
            gradeSection: gradeSection || 'Grade 12 - STEM A',
            timestamp: new Date().toISOString(),
            companionId: companionId as CompanionId,
            triggerPhrase: detectedTriggerPhrase || message.substring(0, 100),
            contextSnippet: `High risk trigger during chat with ${companion.name}: "${message.substring(0, 100)}..."`,
            tier: 3,
            referralType: 'tier3_emergency',
            status: 'flagged'
          };
          crisisAlerts.unshift(emergencyAlert);

          riskEventLogs.unshift({
            id: `re_${Date.now()}`,
            tier: 3,
            timestamp: new Date().toISOString(),
            anonymized: false,
            studentId,
            studentName,
            gradeSection,
            actionTaken: 'crisis_interstitial_shown'
          });
        }
      } else if (detectedTier === 1) {
        riskEventLogs.unshift({
          id: `re_${Date.now()}`,
          tier: 1,
          timestamp: new Date().toISOString(),
          anonymized: true,
          actionTaken: 'resource_shown'
        });
      }

      res.json({
        reply: botReply,
        text: botReply,
        isCrisisTriggered: detectedTier === 3,
        riskTier: detectedTier,
        triggerPhrase: detectedTriggerPhrase,
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

  // 7. Flagged Risk Logs endpoints (Persistent Database Storage)
  app.get("/api/flagged-risks", (req, res) => {
    const logs = db.getFlaggedRiskLogs();
    res.json({ success: true, logs });
  });

  app.post("/api/flagged-risks", (req, res) => {
    const item = req.body;
    if (item && item.id) {
      db.addFlaggedRiskLog(item);
    }
    const current = db.getFlaggedRiskLogs();
    res.json({ success: true, count: current.length, logs: current });
  });

  app.post("/api/flagged-risks/action", (req, res) => {
    const { id, status, reviewedBy, reviewedAt, dismissReason, escalationRecord } = req.body;
    const updated = db.updateFlaggedRiskLog(id, {
      ...(status && { status }),
      ...(reviewedBy && { reviewedBy }),
      ...(reviewedAt && { reviewedAt }),
      ...(dismissReason && { dismissReason }),
      ...(escalationRecord && { escalationRecord })
    });

    if (updated) {
      return res.json({ success: true, item: updated });
    }
    res.json({ success: true, updatedLocally: true });
  });

  // 8. Student School Account Authentication & Directory
  app.post("/api/auth/school-login", (req, res) => {
    const { email, name, gradeSection, academicClusterId } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "School email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findStudentByEmail(cleanEmail);

    if (existing) {
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
      inspirationSource: 'affirmations'
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`C3 AI Companion Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
