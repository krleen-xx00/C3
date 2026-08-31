import { CounselorUser } from '../types';

export interface RegisteredCounselor extends CounselorUser {
  password?: string;
}

export const DEFAULT_COUNSELORS: RegisteredCounselor[] = [
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
    joinedDate: 'June 2021',
    status: 'on_duty',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
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
    joinedDate: 'August 2022',
    status: 'on_duty',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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
    joinedDate: 'January 2023',
    status: 'on_duty',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  }
];

const LOCAL_STORAGE_COUNSELORS_KEY = 'c3-registered-counselors';
const LOCAL_STORAGE_ACTIVE_COUNSELOR_KEY = 'c3-active-counselor-session';

export function getRegisteredCounselors(): RegisteredCounselor[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COUNSELORS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_COUNSELORS_KEY, JSON.stringify(DEFAULT_COUNSELORS));
      return DEFAULT_COUNSELORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_COUNSELORS;
  } catch (e) {
    console.error('Failed to load registered counselors:', e);
    return DEFAULT_COUNSELORS;
  }
}

export function saveRegisteredCounselors(counselors: RegisteredCounselor[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_COUNSELORS_KEY, JSON.stringify(counselors));
  } catch (e) {
    console.error('Failed to save registered counselors:', e);
  }
}

export function getActiveCounselorSession(): CounselorUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_COUNSELOR_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveCounselorSession(counselor: CounselorUser | null) {
  try {
    if (counselor) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_COUNSELOR_KEY, JSON.stringify(counselor));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_COUNSELOR_KEY);
    }
  } catch (e) {
    console.error('Failed to update active counselor session:', e);
  }
}
