# Implementation Plan: Dedicated Full-Page Student Sign-Up & Login Gate

## 1. Privacy & Ethical Analysis: Balancing Privacy with Safety

### Should We Ask for That Much Info?
Students are sensitive to surveillance, especially when opening up about emotional struggles. Over-collecting data deters students from seeking support.

**Recommended Balanced Data Model:**
1. **Full Name & Grade/Section**: Essential so school counselors know which student and classroom to visit in an emergency.
2. **DepEd School Email**: Standard single sign-on identifier (`@cabiaoshs.edu.ph`) to verify enrollment and enable account recovery.
3. **Optional Learner Reference Number (LRN)**: 12-digit DepEd identifier—made optional so students without their LRN on hand are never blocked from accessing wellness help.
4. **Confidential Parent/Guardian Emergency Contact Number**:
   - **Crucial Ethical Guardrail**: The AI will **NEVER automatically message or call parents**. Automated alerts to parents can backfire or cause distress.
   - **Purpose**: This number is stored confidentially and is **only accessible by Licensed Guidance Counselors** in the Counselor Portal if a verified Tier 3 (High Risk / Self-Harm) emergency protocol requires counselor-mediated parent notification under DepEd Child Protection protocols.
   - **Explicit Privacy Guarantee on Form**: "Your emergency contact is kept in strict clinical confidentiality. AI companions never message your parents. Only licensed guidance counselors can access this number during high-risk safety emergencies."
5. **Chat Anonymity Masking**:
   - While the school holds the verified record, the companion room displays an anonymized badge (`STU-8921` or preferred first name) so students feel unburdened by perceived judgment.

---

## 2. Proposed Architecture & User Flow

```
Visitor opens Student Portal (/student or default view)
                     │
          Is Student Signed In?
         ├─── No  ──► Full-Page Student Auth Gate (Sign In / Sign Up)
         │               ├── Tab 1: Sign In (School Email + Password/PIN)
         │               └── Tab 2: Sign Up (Name, Grade/Section, School Email, Track, Emergency Contact)
         │
         └─── Yes ──► Student Dashboard & AI Companion Rooms
                         ├── Header displays student profile & Logout option
                         └── Flagged risk events link to counselor file with emergency contact
```

---

## 3. Detailed Proposed Changes

### A. New Full-Page Component: `StudentAuthView.tsx`
- Replace initial direct dashboard entry with a dedicated, full-screen authentication view matching the polished aesthetic of `CounselorAuthView.tsx`.
- **Sign In Tab**:
  - School Email address
  - Password or 4-digit Student PIN
  - Quick demo pre-fill buttons for thesis defense testing (e.g. "Load Demo Student")
- **Sign Up Tab**:
  - Full Name (e.g., Maria Santos)
  - DepEd School Email (`@cabiaoshs.edu.ph`)
  - Grade & Section (e.g., Grade 12 - STEM A)
  - Senior High School Track / Career Cluster (select dropdown with DepEd academic & technical clusters)
  - Emergency Parent/Guardian Contact Number (with clear non-automated counselor-only privacy disclaimer)
  - Password / PIN creation
- **Trust & Compliance Elements**:
  - DepEd Cabiao Senior High School official badge
  - Student Data Privacy & Republic Act 10173 compliance disclosure
  - Reassurance that daily chatting is supportive, non-punitive, and confidential

### B. Backend API Routes (`server.ts`)
- `POST /api/auth/student-register`:
  - Validates email format, checks for duplicates, creates persistent student profile with anonymized student ID (`STU-XXXX`), emergency parent contact, and secure credentials.
- `POST /api/auth/student-login`:
  - Authenticates school email and credentials; returns student profile and existing mood/chat session history.
- `GET /api/auth/student-session`:
  - Validates existing active student session token/ID.

### C. Counselor Portal Escalation Sync (`CounselorDashboard.tsx` & `server.ts`)
- When a Tier 3 (Self-Harm / Crisis) event is flagged:
  - The alert in the Counselor Dashboard displays the emergency parent contact number alongside the student details for the counselor's immediate phone outreach.
  - Maintains strict record that parental notification is human-led by the guidance office, never triggered by automated AI bots.

### D. Navigation & Session Controls (`TopNavbar.tsx` & `App.tsx`)
- Display student profile pill in top navigation with a clean "Sign Out" action.
- When logged out, redirection returns immediately to the Student Auth Gate.
- In Defense/All-in-One Prototype mode, evaluators can freely toggle between Student and Counselor views while observing persistent state.

---

## 4. Verification & Testing Plan
1. **Sign-Up Flow**: Register a new student with name, grade/section, email, track, and emergency contact. Verify student record creation and automatic generation of `STU-XXXX` anonymized identifier.
2. **Sign-In Flow**: Sign out and sign back in using the created credentials; verify that mood logs and chat history persist.
3. **Safety / Parent Contact Gate**: Trigger a high-risk phrase in chat and verify in the Counselor Portal that the emergency parent contact is present in the counselor's confidential alert card, and that no automated SMS/email was sent.
4. **TypeScript & Build Verification**: Run `lint_applet` and `compile_applet` to confirm error-free execution.
