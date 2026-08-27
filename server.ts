import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { COMPANIONS, INITIAL_MOOD_LOGS, INITIAL_ANONYMOUS_MESSAGES, INITIAL_CRISIS_ALERTS, INITIAL_ANALYTICS, MOCK_USERS } from "./src/data/mockData.js";
import { MoodLog, AnonymousMessage, CrisisAlert, CompanionId } from "./src/types.js";

// Load Gemini configuration with a hard guarantee that the API key is a valid
// non-empty string. If the key were left undefined, the @google/genai SDK would
// silently fall back to Google Application Default Credentials (ADC) and crash
// with "Could not load the default credentials" on machines without ADC.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
if (!GEMINI_API_KEY) {
  console.error("[C3] GEMINI_API_KEY is missing or empty in the environment (.env). Gemini chat is disabled.");
  throw new Error("GEMINI_API_KEY is required to run the C3 AI Companion server. See .env.example.");
}
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
const GEMINI_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE ?? 0.7);

console.log(`[C3] Gemini client ready (model: ${GEMINI_MODEL}, temperature: ${GEMINI_TEMPERATURE})`);

// Initialize Gemini Client server-side with explicit API key pass-through so the
// SDK never attempts Google Application Default Credentials fallback.
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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
  const PORT = 3000;

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
  app.post("/api/chat", async (req, res) => {
    try {
      const { companionId, message, studentId, studentName, gradeSection, history } = req.body;

      const companion = COMPANIONS.find(c => c.id === companionId);
      if (!companion) {
        return res.status(400).json({ error: "Invalid companion ID" });
      }

      // Analyze Risk Tier based on message
      const riskAnalysis = analyzeRiskTier(message);
      let detectedTier = riskAnalysis.tier;
      let detectedTriggerPhrase = riskAnalysis.triggerPhrase || "";

      // Build message payload for Gemini
      const formattedContents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach((h: any) => {
          formattedContents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        });
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      let botReply = "";

      // Extract generated text from a Gemini response, handling both the SDK's
      // `response.text` convenience getter and the raw candidates structure.
      const extractGeminiText = (resp: any): string | null => {
        try {
          if (typeof resp?.text === 'string' && resp.text.trim()) {
            return resp.text;
          }
        } catch { /* fall through to candidates */ }
        const parts: string[] = resp?.candidates?.[0]?.content?.parts || [];
        const joined = parts
          .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
          .filter(Boolean)
          .join('')
          .trim();
        if (joined) return joined;
        return null;
      };

      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: formattedContents,
          config: {
            systemInstruction: companion.systemPrompt,
            temperature: GEMINI_TEMPERATURE,
          }
        });

        const modelText = extractGeminiText(response);
        if (modelText) {
          botReply = modelText;
        } else {
          // A valid API response arrived but contained no usable text. Log it
          // (with filtering info when present) and reply with a soft,
          // companion-specific line rather than the generic error template.
          console.warn(`[C3] Empty model output for ${companion.name} (${companion.id}). promptFeedback:`, JSON.stringify(response?.promptFeedback ?? null));
          botReply = `${companion.name} took a quiet pause and wants you to know you are not alone. Cabiao SHS guidance counselors are always here for you too — would you like to try again with a few more words?`;
        }

        if (botReply.includes("[CRISIS_ALERT]")) {
          if (!detectedTier || detectedTier < 3) {
            detectedTier = 3;
            detectedTriggerPhrase = detectedTriggerPhrase || "High distress detected by AI companion";
          }
          botReply = botReply.replace("[CRISIS_ALERT]", "").trim();
        }
      } catch (geminiError: any) {
        const errInfo: any = {
          name: geminiError?.name,
          message: geminiError?.message,
          status: geminiError?.status,
          code: geminiError?.code,
          details: geminiError?.details,
          httpStatus: geminiError?.sdkHttpResponse?.status,
          model: GEMINI_MODEL,
          companionId: companion.id,
        };
        if (geminiError?.stack) errInfo.stack = String(geminiError.stack).split('\n').slice(0, 3).join(' | ');
        console.error("[C3] Gemini API Error:", JSON.stringify(errInfo, null, 2));
        console.error("[C3] Gemini API raw error object:", geminiError);

        if (geminiError?.message) {
          try {
            const parsed = JSON.parse(geminiError.message);
            if (parsed?.error) {
              console.error("[C3] Gemini API error payload:", JSON.stringify(parsed.error, null, 2));
            }
          } catch { /* plain message already logged */ }
        }

        botReply = `[${companion.name}] I hear how important this is to you. I am always listening, and please remember our Cabiao SHS guidance counselors are also here for you.`;
      }

      // Data Rules Execution per Tier:
      // TIER 3 (High): Always create high-priority alert with student identity attached.
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
      } else if (detectedTier === 1) {
        // TIER 1 (Mild): Log anonymized event only. No counselor alert created.
        riskEventLogs.unshift({
          id: `re_${Date.now()}`,
          tier: 1,
          timestamp: new Date().toISOString(),
          anonymized: true,
          actionTaken: 'resource_shown'
        });
      }

      res.json({
        text: botReply,
        isCrisisTriggered: detectedTier === 3,
        riskTier: detectedTier,
        triggerPhrase: detectedTriggerPhrase,
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
