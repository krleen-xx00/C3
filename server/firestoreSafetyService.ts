import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  Firestore
} from 'firebase/firestore';

export type ScreeningPriority = 'NO_FLAG' | 'REVIEW_REQUIRED' | 'URGENT_REVIEW';

export type SafetyFlagStatus =
  | 'Pending'
  | 'Acknowledged'
  | 'Under Review'
  | 'Follow-up Recorded'
  | 'Closed';

export interface ActionHistoryEntry {
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  notes?: string;
}

export interface SafetyFlagRecord {
  id: string;
  createdAt: string; // ISO timestamp
  studentRef: string; // Anonymized handle, e.g. STU-8921
  studentName: string; // Student name for authorized counselor view
  gradeSection: string;
  companion: 'Cali' | 'Casti' | 'Cedi';
  priority: ScreeningPriority;
  category: string; // e.g. 'emotional_distress', 'self_harm_risk', 'personal_safety', 'danger_to_others'
  contextSnippet: string; // Minimum necessary message excerpt for counselor review
  triggerPhrase?: string;
  status: SafetyFlagStatus;
  assignedCounselorId?: string | null;
  assignedCounselorName?: string | null;
  actionHistory: ActionHistoryEntry[];
  followUpNotes?: string | null;
  isDemoRecord: boolean; // Cleanly separates fictional demonstration records from real student flags
}

export interface CounselorAuditEntry {
  id: string;
  timestamp: string;
  counselorId: string;
  counselorName: string;
  action: 'LOGIN' | 'VIEW_FLAGS' | 'ACKNOWLEDGE_FLAG' | 'UPDATE_STATUS' | 'RECORD_FOLLOW_UP' | 'CLOSE_FLAG' | 'CREATE_MANUAL_FLAG';
  flagId?: string;
  details: string;
}

// Global Firestore handle for backend service
let firestoreDb: Firestore | null = null;
let isConfigured = false;
let configError: string | null = null;

function initFirestoreService(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      configError = 'firebase-applet-config.json is missing on the server.';
      console.warn('[FirestoreSafetyService]', configError);
      return null;
    }

    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);

    if (!config.projectId || !config.apiKey) {
      configError = 'Invalid Firebase configuration: missing projectId or apiKey.';
      console.warn('[FirestoreSafetyService]', configError);
      return null;
    }

    const app = getApps().length === 0
      ? initializeApp({
          apiKey: config.apiKey,
          projectId: config.projectId,
          appId: config.appId,
          authDomain: config.authDomain,
          storageBucket: config.storageBucket
        })
      : getApp();

    const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId.trim()
      ? config.firestoreDatabaseId.trim()
      : '(default)';

    firestoreDb = initializeFirestore(app, {}, dbId);
    isConfigured = true;
    console.log(`[FirestoreSafetyService] Connected to Firestore database: "${dbId}" in project "${config.projectId}"`);
    return firestoreDb;
  } catch (err: any) {
    configError = err?.message || 'Failed to initialize Firestore SDK';
    console.error('[FirestoreSafetyService] Initialization failed:', err);
    return null;
  }
}

// Initialize on module load
initFirestoreService();

export const firestoreSafetyService = {
  isAvailable(): boolean {
    return isConfigured && firestoreDb !== null;
  },

  getStatus(): { available: boolean; error: string | null } {
    return {
      available: isConfigured && firestoreDb !== null,
      error: configError
    };
  },

  /**
   * Persists a student safety screening flag in Firestore.
   */
  async createSafetyFlag(record: Omit<SafetyFlagRecord, 'id' | 'createdAt' | 'status' | 'actionHistory'> & { id?: string }): Promise<SafetyFlagRecord> {
    const db = initFirestoreService();
    if (!db) {
      throw new Error(`Firestore database is not available on server: ${configError || 'Not configured'}`);
    }

    const now = new Date().toISOString();
    const flagId = record.id || `flag_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const initialAction: ActionHistoryEntry = {
      action: 'SYSTEM_FLAG_CREATED',
      performedBy: 'c3_safety_screening_ai',
      performedByName: `C3 AI Safety Screener (${record.companion})`,
      timestamp: now,
      notes: `Screening Priority: ${record.priority} | Category: ${record.category}`
    };

    const newRecord: SafetyFlagRecord = {
      id: flagId,
      createdAt: now,
      studentRef: record.studentRef || 'STU-UNKNOWN',
      studentName: record.studentName || 'Student User',
      gradeSection: record.gradeSection || 'Grade 12 - Senior High School',
      companion: record.companion,
      priority: record.priority,
      category: record.category,
      contextSnippet: record.contextSnippet.slice(0, 500), // Enforce minimum necessary excerpt length
      triggerPhrase: record.triggerPhrase ? record.triggerPhrase.slice(0, 150) : undefined,
      status: 'Pending',
      assignedCounselorId: null,
      assignedCounselorName: null,
      actionHistory: [initialAction],
      followUpNotes: null,
      isDemoRecord: Boolean(record.isDemoRecord)
    };

    const docRef = doc(db, 'safety_flags', flagId);
    await setDoc(docRef, newRecord);
    return newRecord;
  },

  /**
   * Retrieves all safety flags from Firestore.
   * Allows filtering demonstration records vs actual records.
   */
  async getSafetyFlags(options?: { includeDemo?: boolean }): Promise<SafetyFlagRecord[]> {
    const db = initFirestoreService();
    if (!db) {
      throw new Error(`Firestore database is not available: ${configError || 'Not configured'}`);
    }

    const colRef = collection(db, 'safety_flags');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    const results: SafetyFlagRecord[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as SafetyFlagRecord;
      if (options?.includeDemo === false && data.isDemoRecord) {
        return; // Exclude demonstration flags when viewing live confidential queue
      }
      results.push(data);
    });

    return results;
  },

  /**
   * Updates flag review status and records counselor actions in audit history.
   */
  async updateSafetyFlagStatus(
    flagId: string,
    params: {
      status: SafetyFlagStatus;
      counselorId: string;
      counselorName: string;
      notes?: string;
      assignedCounselorId?: string;
      assignedCounselorName?: string;
    }
  ): Promise<SafetyFlagRecord | null> {
    const db = initFirestoreService();
    if (!db) {
      throw new Error(`Firestore database is not available: ${configError || 'Not configured'}`);
    }

    const docRef = doc(db, 'safety_flags', flagId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }

    const existing = snap.data() as SafetyFlagRecord;
    const now = new Date().toISOString();

    const actionEntry: ActionHistoryEntry = {
      action: `STATUS_CHANGED_TO_${params.status.toUpperCase().replace(/\s+/g, '_')}`,
      performedBy: params.counselorId,
      performedByName: params.counselorName,
      timestamp: now,
      notes: params.notes || `Status transitioned to ${params.status}`
    };

    const updatedHistory = [...(existing.actionHistory || []), actionEntry];

    const updates: Partial<SafetyFlagRecord> = {
      status: params.status,
      actionHistory: updatedHistory,
      assignedCounselorId: params.assignedCounselorId || existing.assignedCounselorId || params.counselorId,
      assignedCounselorName: params.assignedCounselorName || existing.assignedCounselorName || params.counselorName,
      ...(params.notes && { followUpNotes: params.notes })
    };

    await updateDoc(docRef, updates);

    // Record in global counselor audit log collection
    await this.recordCounselorAudit({
      id: `audit_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now,
      counselorId: params.counselorId,
      counselorName: params.counselorName,
      action: params.status === 'Closed' ? 'CLOSE_FLAG' : params.status === 'Follow-up Recorded' ? 'RECORD_FOLLOW_UP' : 'UPDATE_STATUS',
      flagId,
      details: `Flag ${flagId} status updated to "${params.status}". Notes: ${params.notes || 'None'}`
    });

    return {
      ...existing,
      ...updates
    };
  },

  /**
   * Writes an immutable audit entry to counselor_audit_logs collection.
   */
  async recordCounselorAudit(entry: CounselorAuditEntry): Promise<void> {
    const db = initFirestoreService();
    if (!db) return;

    try {
      const docRef = doc(db, 'counselor_audit_logs', entry.id);
      await setDoc(docRef, entry);
    } catch (err) {
      console.error('[FirestoreSafetyService] Failed to record audit log:', err);
    }
  },

  /**
   * Fetches recent counselor audit logs.
   */
  async getCounselorAuditLogs(limitCount: number = 50): Promise<CounselorAuditEntry[]> {
    const db = initFirestoreService();
    if (!db) return [];

    try {
      const colRef = collection(db, 'counselor_audit_logs');
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      const results: CounselorAuditEntry[] = [];
      snapshot.forEach(docSnap => {
        results.push(docSnap.data() as CounselorAuditEntry);
      });
      return results;
    } catch (err) {
      console.error('[FirestoreSafetyService] Failed to fetch audit logs:', err);
      return [];
    }
  },

  /**
   * Seeds initial demonstration flags for Defense Demo Mode if collection is empty.
   */
  async seedDemoFlagsIfEmpty(): Promise<void> {
    const db = initFirestoreService();
    if (!db) return;
    try {
      const flags = await this.getSafetyFlags({ includeDemo: true });
      if (flags.length === 0) {
        console.log('[FirestoreSafetyService] Seeding initial demonstration safety flags for Defense Demo Mode...');
        await this.createSafetyFlag({
          id: 'demo_flag_001',
          studentRef: 'STU-8921',
          studentName: 'Angelo D. Bautista (Demo)',
          gradeSection: 'Grade 12 - STEM A',
          companion: 'Casti',
          priority: 'URGENT_REVIEW',
          category: 'self_harm_risk',
          contextSnippet: 'Demo case: "I feel completely hopeless and like giving up on living, nothing matters anymore..."',
          triggerPhrase: 'giving up on living',
          isDemoRecord: true
        });
        await this.createSafetyFlag({
          id: 'demo_flag_002',
          studentRef: 'STU-4412',
          studentName: 'Samantha Nicole Cruz (Demo)',
          gradeSection: 'Grade 11 - HUMSS B',
          companion: 'Casti',
          priority: 'REVIEW_REQUIRED',
          category: 'emotional_distress',
          contextSnippet: 'Demo case: "I cannot handle this defense pressure anymore, hands are shaking and feeling hopeless..."',
          triggerPhrase: 'cannot handle this defense pressure',
          isDemoRecord: true
        });
        console.log('[FirestoreSafetyService] Demo flags seeded successfully in Firestore.');
      }
    } catch (err) {
      console.warn('[FirestoreSafetyService] Could not seed demo flags:', err);
    }
  }
};
