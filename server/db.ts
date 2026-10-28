import fs from 'fs';
import path from 'path';
import { INITIAL_FLAGGED_RISK_LOG, FlaggedRiskItem } from '../src/data/flaggedRiskData.js';
import { MOCK_USERS } from '../src/data/mockData.js';
import { User } from '../src/types.js';

interface DatabaseSchema {
  flaggedRiskLogs: FlaggedRiskItem[];
  students: User[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'c3_store.json');

const DEFAULT_DB: DatabaseSchema = {
  flaggedRiskLogs: [...INITIAL_FLAGGED_RISK_LOG],
  students: [...MOCK_USERS.filter(u => u.role === 'student')]
};

class PersistentStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_DB,
          ...parsed,
          flaggedRiskLogs: Array.isArray(parsed.flaggedRiskLogs) && parsed.flaggedRiskLogs.length > 0
            ? parsed.flaggedRiskLogs
            : DEFAULT_DB.flaggedRiskLogs
        };
      } else {
        this.saveData(DEFAULT_DB);
        return DEFAULT_DB;
      }
    } catch (err) {
      console.error('[PersistentStore] Error loading DB:', err);
      return DEFAULT_DB;
    }
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[PersistentStore] Error writing DB:', err);
    }
  }

  // --- Flagged Risk Logs ---
  public getFlaggedRiskLogs(): FlaggedRiskItem[] {
    return [...this.data.flaggedRiskLogs];
  }

  public addFlaggedRiskLog(item: FlaggedRiskItem): FlaggedRiskItem {
    this.data.flaggedRiskLogs.unshift(item);
    this.saveData(this.data);
    return item;
  }

  public updateFlaggedRiskLog(
    id: string,
    updates: Partial<FlaggedRiskItem>
  ): FlaggedRiskItem | null {
    const index = this.data.flaggedRiskLogs.findIndex(log => log.id === id);
    if (index === -1) return null;

    this.data.flaggedRiskLogs[index] = {
      ...this.data.flaggedRiskLogs[index],
      ...updates
    };
    this.saveData(this.data);
    return this.data.flaggedRiskLogs[index];
  }

  // --- Students & Authentication ---
  public getStudents(): User[] {
    return [...this.data.students];
  }

  public findStudentByEmail(email: string): User | undefined {
    return this.data.students.find(s => s.email.toLowerCase() === email.toLowerCase());
  }

  public findStudentById(id: string): User | undefined {
    return this.data.students.find(s => s.id === id);
  }

  public upsertStudent(student: User): User {
    const index = this.data.students.findIndex(
      s => s.email.toLowerCase() === student.email.toLowerCase() || s.id === student.id
    );

    if (index !== -1) {
      this.data.students[index] = { ...this.data.students[index], ...student };
    } else {
      this.data.students.unshift(student);
    }
    this.saveData(this.data);
    return student;
  }
}

export const db = new PersistentStore();
