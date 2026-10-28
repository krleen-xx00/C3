# Implementation Plan: School Account Login, Persistent Database, n8n AI Chatbots & Counselor Safety View

## 1. Confirmed User Decisions & System Scope
Based on your latest response:
- **Authentication**: **Student login with school accounts** (Google Workspace / institutional school email domain validation, e.g. `@school.edu.ph` / student ID authentication).
- **Database Verdict**: **YES, a persistent database is required.** A production school mental health platform cannot rely on in-memory storage because:
  1. **Legal & Duty of Care**: Crisis alerts (Tier 3 suicidal ideation or self-harm keywords) must be permanently logged for guidance counselors and never lost due to server reboots.
  2. **Student Identity Linkage**: Securely maps anonymous student session IDs to their verified school accounts for authorized counselor escalation only.
  3. **Real-time Counselor Alerts**: Counselors need immediate alerts when a student reaches moderate or high risk thresholds.
  4. **Chat Continuity**: Students can resume supportive conversations across school devices without losing their progress.

---

## 2. System Architecture & Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STUDENT APPLICATION                             │
│   • School Account Login (Google / School Domain Auth)                 │
│   • 3 AI Companions: Cali (Empathy), Casti (TechPro), Cedi (Calm)     │
│   • Dependency Engine: Tracks consecutive msgs (12+) / time (15m+)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS BACKEND RELAY                           │
│   • /api/auth/school-login                                             │
│   • /api/chat (Safety & Keyword Scanner -> n8n Relay -> Fallback)     │
│   • /api/counselor/* (Protected endpoints for risk triage)             │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │                                        │
                ▼                                        ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│     DATABASE (FIRESTORE)      │        │       n8n AI WORKFLOW         │
│ • students (school email, ID) │        │ • Webhook URL endpoint        │
│ • chat_sessions & messages    │◄───────┤ • Companion routing logic     │
│ • flagged_risk_logs           │        │ • Returns AI empathic reply   │
│ • counselor_escalation_notes  │        │ • Offline graceful fallback   │
└───────────────┬───────────────┘        └───────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     COUNSELOR DASHBOARD VIEW                           │
│ • Protected Counselor Workspace (PIN / School Counselor Auth)          │
│ • Mandatory Privacy & Human Escalation Protocol Disclaimer             │
│ • Real-time Flagged Risk Log Table with Action Buttons:                │
│   [Mark Reviewed]  [Dismiss / False Alarm]  [Manual Escalation Log]    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phased Implementation Steps

### Phase 1: Authentication & School Account Verification
- Provide a clean, supportive **School Account Sign-In** modal / button:
  - Supports Google Workspace / School Account login with mock/live verification.
  - Generates an anonymized Student Handle (`std_anon_xxxx`) displayed during chat for student comfort, while securely storing the actual school identity in the database accessible only by authorized counselors during critical escalation.
  - Tracks student academic track (e.g., TechPro ICT, TVL, STEM, etc.) to tailor companion guidance.

### Phase 2: Database Persistence & Safety Schema
- Implement Firebase Firestore (or server-side persistent store with client synchronization):
  - **`students`**: `{ id, email, fullName, gradeSection, track, createdAt }`
  - **`chat_sessions`**: `{ id, studentId, companionId, messageCount, startedAt, updatedAt }`
  - **`flagged_risk_logs`**:
    - `id`: Unique alert ID
    - `timestamp`: Date and time of trigger
    - `studentId`: Anonymized identifier (`std_anon_xxxx`)
    - `studentRef`: Link to student profile (accessible only by counselor)
    - `companionUsed`: "Cali", "Casti", or "Cedi"
    - `flaggedSnippet`: Exact sentence or context triggering the alert
    - `riskLevel`: `"Moderate"` | `"High"` | `"Critical"`
    - `status`: `"Pending Review"` | `"Reviewed"` | `"Dismissed"` | `"Escalated"`
    - `counselorNotes`: Manual notes entered during human review

### Phase 3: n8n AI Chatbot Bridge & 3 Companion Workflows
- **Enable n8n integration**:
  - Add backend proxy endpoint `POST /api/chat` that accepts messages for Cali, Casti, and Cedi.
  - Forward payload to user's `N8N_WEBHOOK_URL` (configurable in settings or `.env`).
  - Request payload structure:
    ```json
    {
      "companion": "cali",
      "studentId": "std_anon_4910",
      "studentName": "Alex",
      "track": "Technical-Professional (TechPro)",
      "message": "I'm feeling very overwhelmed with my finals...",
      "history": [...],
      "sessionMeta": { "consecutiveCount": 3, "durationMinutes": 4 }
    }
    ```
  - **Resilient Fallback**: If n8n webhook is not yet configured or temporarily offline, the server provides a built-in compassionate AI response (via Gemini or built-in empathic rules engine) so the 3 AI companions **work immediately out of the box**.

### Phase 4: Counselor View Implementation
- **Top Navigation Integration**: Clicking "Counselor View" opens the secure Counselor Workspace:
  - Counselor Access Gate (PIN code or Counselor School Account).
  - **Mandatory Safety Disclaimer Banner**:
    > *"PRIVACY & HUMAN ESCALATION PROTOCOL: Automated alerts are sent strictly to the Guidance Counselor Dashboard. No automated messages are ever sent directly to parents. Any parent notification must be conducted manually and personally by a guidance counselor after human review."*
  - **Flagged Risk Log Table**:
    - Columns: Timestamp, Student ID (Anonymized), Companion Used, Flagged Snippet, Risk Level, Status.
    - Actions:
      - `[Mark Reviewed]`: Changes status to "Reviewed", logs timestamp.
      - `[Dismiss / False Alarm]`: Marks entry as false positive with a brief reason tag.
      - `[Manual Escalation Log]`: Opens a modal for counselors to log a physical check-in or personal phone call with parents.
  - Styled strictly in the established dark theme, gold accent highlights, and rounded cards.

### Phase 5: AI Dependency Engine
- Continuous message and session timer integrated into Cali, Casti, and Cedi chats:
  - If a student reaches **12+ consecutive messages** or chats for **15+ continuous minutes**:
    1. **System Prompt Shift**: AI Companion switches tone to gentle de-escalation, praising the student for reaching out and suggesting an offline breather.
    2. **Grounding Modal Overlay**:
       > *"You've been sharing with us for a while! Remember to take a break, grab some water, or talk to someone you trust offline."*
    3. Action Buttons:
       - `[1-Min Breathing Exercise]` (opens interactive breathing visualization)
       - `[Back to Home Hub]` (returns safely to dashboard)

---

## 4. Verification & Testing Checklist
- [ ] Student can sign in with school account and select a companion (Cali, Casti, Cedi).
- [ ] AI companions respond without error (n8n webhook relay with automatic fallback).
- [ ] High-stress keywords trigger instant entry in `flagged_risk_logs`.
- [ ] Counselor View requires access check, displays mandatory disclaimer banner, and displays live triage table.
- [ ] Counselor action buttons (`Mark Reviewed`, `Dismiss`, `Manual Escalation`) update log states.
- [ ] 12-message or 15-minute threshold displays the grounding modal and 1-minute breathing exercise.
- [ ] Dark theme with gold accent highlights is consistently preserved across all components.
