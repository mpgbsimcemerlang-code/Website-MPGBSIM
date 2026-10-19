import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  AnnouncementItem,
  PortalDocument,
  BestPracticeItem,
  MemberSubmission,
  PortalResource,
  PortalNotification,
  AuditLogItem,
  ProgramEvent,
  MemberSchool,
  NewsItem,
  FeePaymentRecord,
  FeeCategory,
} from '../types';
import {
  sortNewsByPublishedDate,
  formatToMalayDate,
} from '../utils/dateUtils';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_BEST_PRACTICES,
  INITIAL_SUBMISSIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/portalMockData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  where,
  ensureFirebaseAuth,
  isAuthorizedAdminEmail,
  updatePassword,
  handleFirestoreError,
  OperationType,
  isQuotaExceededError,
  isFirestoreQuotaExceeded,
  markFirestoreQuotaExceeded,
} from '../firebase';
import { useAdminContent } from './AdminContentContext';
import { repairSchoolIntegrity } from '../utils/schoolDiagnostic';
import { compressDataUrl } from '../utils/imageCompressor';
import {
  safeLocalStorageSet,
  safeLocalStorageGet,
  safeLocalStorageRemove,
  saveToIndexedDB,
  loadFromIndexedDB,
} from '../utils/storage';

export type PortalTab =
  | 'dashboard'
  | 'sembang-live'
  | 'yuran'
  | 'pengumuman'
  | 'peperiksaan'
  | 'program'
  | 'direktori'
  | 'dokumen'
  | 'best-practice'
  | 'ai-hub'
  | 'sumber'
  | 'kongsi-amalan'
  | 'kejayaan-sekolah'
  | 'profil'
  | 'admin-hub'
  | 'ajk-admin';

export const INITIAL_FEE_PAYMENTS: FeePaymentRecord[] = [
  {
    id: 'pay-2026-blad001',
    schoolId: 'school-1791789043737-cace',
    schoolCode: 'BLAD001',
    schoolName: 'SEKOLAH MENENGAH SRI AL-AMIN BANGI',
    payerName: 'NOOR ASYIKIN BINTI AHMAT (Pengetua)',
    payerEmail: 'srialaminbangi@gmail.com',
    payerPhone: '019-3543665',
    category: 'YURAN_AHLI_ATAS_301',
    categoryLabel: 'Yuran Ahli Biasa (> 3 Tahun • ≥ 301 Murid) — Fasal 6(1)',
    amount: 600.0,
    paymentMethod: 'HerePay (FPX)',
    transactionRef: 'HP-MPGB-2026-98124',
    paymentDate: '2026-02-15',
    status: 'BERJAYA',
    academicSession: '2026/2027',
    gateway: 'HerePay',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    verifiedBy: 'Bendahari MPGBSIM',
    verifiedAt: '2026-02-15T10:30:00Z',
    notes: 'Yuran Ahli Biasa Fasal 6(1) (> 3 tahun, enrolmen 301 murid ke atas) Sesi 2026/2027.',
    createdAt: '2026-02-15T10:28:00Z',
  },
  {
    id: 'pay-2026-mjac011',
    schoolId: 'sch-musleh-1',
    schoolCode: 'MJAC011',
    schoolName: 'SEKOLAH RENDAH ISLAM I MUSLEH',
    payerName: 'Ustaz Abdul Qayyum bin Yaakop (Guru Besar)',
    payerEmail: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
    payerPhone: '+60 6-335 1290',
    category: 'YURAN_AHLI_ATAS_301',
    categoryLabel: 'Yuran Ahli Biasa (> 3 Tahun • ≥ 301 Murid) — Fasal 6(1)',
    amount: 600.0,
    paymentMethod: 'HerePay (FPX)',
    transactionRef: 'HP-MPGB-2026-87112',
    paymentDate: '2026-01-20',
    status: 'BERJAYA',
    academicSession: '2026/2027',
    gateway: 'HerePay',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    verifiedBy: 'Bendahari MPGBSIM',
    verifiedAt: '2026-01-20T14:15:00Z',
    notes: 'Yuran Ahli Biasa Fasal 6(1) (> 3 tahun, enrolmen 428 murid).',
    createdAt: '2026-01-20T14:10:00Z',
  },
  {
    id: 'pay-2026-kja3002',
    schoolId: 'school-1791963595619-k4xh',
    schoolCode: 'KJA3002',
    schoolName: 'SEKOLAH RENDAH AL-AZHAR',
    payerName: 'MOHD RAZMAN BIN RAMZAN (Guru Besar)',
    payerEmail: 'razman2015@gmail.com',
    payerPhone: '013-4365669',
    category: 'YURAN_AHLI_BAWAH_300',
    categoryLabel: 'Yuran Ahli Biasa (> 3 Tahun • ≤ 300 Murid) — Fasal 6(1)',
    amount: 300.0,
    paymentMethod: 'HerePay (DuitNow QR)',
    transactionRef: 'HP-MPGB-2026-76431',
    paymentDate: '2026-03-01',
    status: 'BERJAYA',
    academicSession: '2026/2027',
    gateway: 'HerePay',
    gatewayUrl: 'https://app.herepay.org/mpgbsim',
    verifiedBy: 'Bendahari MPGBSIM',
    verifiedAt: '2026-03-01T09:45:00Z',
    notes: 'Yuran Ahli Biasa Fasal 6(1) (> 3 tahun, enrolmen 300 murid ke bawah).',
    createdAt: '2026-03-01T09:40:00Z',
  },
];

interface MemberPortalContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole;
  viewMode: 'public' | 'portal';
  setViewMode: (mode: 'public' | 'portal') => void;
  portalTab: PortalTab;
  setPortalTab: (tab: PortalTab) => void;
  portalSubTab: string;
  setPortalSubTab: (sub: string) => void;

  // Data Collections
  announcements: AnnouncementItem[];
  documents: PortalDocument[];
  bestPractices: BestPracticeItem[];
  submissions: MemberSubmission[];
  notifications: PortalNotification[];
  auditLogs: AuditLogItem[];
  registeredProgramIds: string[];
  registeredSchools: MemberSchool[];
  schools: MemberSchool[];
  getLatestRegisteredSchools: () => Promise<MemberSchool[]>;
  schoolNews: NewsItem[];
  feePayments: FeePaymentRecord[];

  // Quick Notification metrics
  unreadNotificationsCount: number;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;

  // Fee Payment Actions
  recordFeePayment: (
    payment: Omit<FeePaymentRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<FeePaymentRecord>;
  updateFeePaymentStatus: (
    id: string,
    status: 'BERJAYA' | 'DALAM_SEMAKAN' | 'DIBATALKAN'
  ) => Promise<void>;
  deleteFeePayment: (id: string) => Promise<void>;

  // Auth & Role Actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  loginAsMemberSchool: (school: MemberSchool) => void;
  logoutPortal: () => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changeUserPassword: (
    newPassword: string,
    oldPassword?: string
  ) => Promise<{ success: boolean; message: string }>;

  // Portal Management Actions
  createAnnouncement: (announcement: Omit<AnnouncementItem, 'id'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<AnnouncementItem>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  registerForProgram: (programId: string) => void;
  submitBestPractice: (practice: Omit<BestPracticeItem, 'id'>) => Promise<void>;
  submitMemberForm: (submission: Omit<MemberSubmission, 'id'>) => Promise<void>;
  reviewBestPractice: (id: string, status: BestPracticeItem['status'], reason?: string) => Promise<void>;
  reviewSubmission: (id: string, status: MemberSubmission['status'], reason?: string) => Promise<void>;
  addDocument: (document: Omit<PortalDocument, 'id'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markAllNotificationsAsRead: () => void;
  recordAuditLog: (action: string, content: string) => void;

  // PGB School Achievement News Management (Live directly to MPGBSIM Website)
  submitSchoolNews: (newsInput: {
    title: string;
    summary: string;
    content: string;
    category?: string;
    achievementLevel?: string;
    imageUrl?: string;
    featured?: boolean;
    status?: 'published' | 'draft';
    schoolName?: string;
    schoolCode?: string;
    state?: string;
    date?: string;
  }) => Promise<NewsItem>;
  updateSchoolNews: (id: string, updates: Partial<NewsItem>) => Promise<void>;
  deleteSchoolNews: (id: string) => Promise<void>;

  // Global Search modal trigger
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const MemberPortalContext = createContext<MemberPortalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'mpgbsim_portal_user_v1',
  VIEW_MODE: 'mpgbsim_view_mode_v1',
  REGISTERED_PROGRAMS: 'mpgbsim_registered_programs_v1',
  ANNOUNCEMENTS: 'mpgbsim_announcements_v1',
  DOCUMENTS: 'mpgbsim_documents_v1',
  BEST_PRACTICES: 'mpgbsim_best_practices_v1',
  SUBMISSIONS: 'mpgbsim_submissions_v1',
  NOTIFICATIONS: 'mpgbsim_notifications_v1',
  AUDIT_LOGS: 'mpgbsim_audit_logs_v1',
};

// Helper to reliably load latest registered schools directly from the Firestore 'schools' collection used by Admin CMS
export const getLatestRegisteredSchools = async (): Promise<MemberSchool[]> => {
  const schoolsMap = new Map<string, MemberSchool>();

  // 1. Fetch directly from the same Firestore collection used by Admin CMS ('schools') if quota allows
  if (!isFirestoreQuotaExceeded()) {
    try {
      const snap = await getDocs(collection(db, 'schools'));
      if (!snap.empty) {
        snap.forEach((d) => {
          const sch = { id: d.id, ...(d.data() as any) } as MemberSchool;
          if (sch.id) {
            const existing =
              schoolsMap.get(sch.id) ||
              (sch.code ? schoolsMap.get(`code:${sch.code.toUpperCase()}`) : undefined);
            const merged = existing
              ? {
                  ...existing,
                  ...sch,
                  icNumber: sch.icNumber || existing.icNumber,
                  schoolPhotoUrl: sch.schoolPhotoUrl || existing.schoolPhotoUrl,
                  logoUrl: sch.logoUrl || existing.logoUrl,
                  principalPhotoUrl: sch.principalPhotoUrl || existing.principalPhotoUrl,
                }
              : sch;
            schoolsMap.set(sch.id, merged);
            if (sch.code) schoolsMap.set(`code:${sch.code.toUpperCase()}`, merged);
          }
        });
      }
    } catch (e: any) {
      if (isQuotaExceededError(e)) {
        markFirestoreQuotaExceeded('getLatestRegisteredSchools');
      } else {
        console.warn('Firestore schools fetch notice in MemberPortalContext:', e);
      }
    }
  }

  // 3. Overlay local CMS content if it contains newer local modifications (never overwrite non-empty photos with empty strings)
  try {
    const saved = localStorage.getItem('mpgbsim_cms_content_v3') || localStorage.getItem('mpgbsim_cms_content');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.memberSchools && Array.isArray(parsed.memberSchools)) {
          parsed.memberSchools.forEach((sch: MemberSchool) => {
            if (sch.id) {
              const existing =
                schoolsMap.get(sch.id) ||
                (sch.code ? schoolsMap.get(`code:${sch.code.toUpperCase()}`) : undefined);
              if (existing) {
                const localTime = sch.updatedAt ? new Date(sch.updatedAt).getTime() : 0;
                const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
                if (localTime >= existingTime) {
                  const merged: MemberSchool = {
                    ...existing,
                    ...sch,
                    icNumber: sch.icNumber || existing.icNumber,
                    schoolPhotoUrl: sch.schoolPhotoUrl || existing.schoolPhotoUrl,
                    logoUrl: sch.logoUrl || existing.logoUrl,
                    principalPhotoUrl: sch.principalPhotoUrl || existing.principalPhotoUrl,
                  };
                  schoolsMap.set(existing.id, merged);
                  if (existing.code) schoolsMap.set(`code:${existing.code.toUpperCase()}`, merged);
                }
              } else {
                schoolsMap.set(sch.id, sch);
                if (sch.code) schoolsMap.set(`code:${sch.code.toUpperCase()}`, sch);
              }
            }
          });
      }
    }
  } catch (e) {}

  const rawList: MemberSchool[] = [];
  const seen = new Set<string>();
  schoolsMap.forEach((s) => {
    if (s.id && !seen.has(s.id)) {
      seen.add(s.id);
      rawList.push(s);
    }
  });

  // Run integrity repair / normalization to ensure uniqueness of codes and linkage
  try {
    const portalUserRaw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CURRENT_USER) : null;
    const portalUser = portalUserRaw ? JSON.parse(portalUserRaw) : null;
    const { repairedSchools } = repairSchoolIntegrity(rawList, portalUser);
    return repairedSchools;
  } catch (e) {
    return rawList;
  }
};

export const MemberPortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { siteData } = useAdminContent();

  // View mode: 'public' (landing page) or 'portal' (dedicated member portal application)
  const [viewMode, setViewMode] = useState<'public' | 'portal'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      if (saved === 'portal' || saved === 'public') return saved;
    } catch (e) {
      // ignore
    }
    return 'public';
  });

  // Current logged in user profile: strictly null unless a real authenticated user is loaded
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        const user = JSON.parse(saved);
        // Purge any legacy demo user from previous demo versions
        if (
          user?.uid?.startsWith('demo-') ||
          user?.email?.includes('demo') ||
          user?.fullName?.includes('Demonstrasi')
        ) {
          safeLocalStorageRemove(STORAGE_KEYS.CURRENT_USER);
          return null;
        }

        // Auto-heal i-Musleh Melaka Principal profile
        const emailLower = (user?.email || '').toLowerCase().trim();
        const schoolLower = (user?.school || '').toLowerCase().trim();
        const memNo = user?.membershipNo || '';
        const isSecondaryMuslehUser =
          emailLower === 'smimmelaka@gmail.com' ||
          memNo.includes('JAIM/SAS') ||
          memNo.includes('MIA1009') ||
          user?.schoolCode === 'JAIM/SAS(M)130' ||
          user?.schoolCode === 'MIA1009' ||
          (schoolLower.includes('musleh') && (schoolLower.includes('menengah') || schoolLower.includes('sma') || schoolLower.includes('smim')));

        const isPrimaryMuslehUser =
          !isSecondaryMuslehUser &&
          (emailLower === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
            emailLower.includes('imuslehmelaka') ||
            memNo.includes('MJAC011') ||
            (schoolLower.includes('musleh') && (schoolLower.includes('rendah') || schoolLower.includes('sri'))));

        if (isSecondaryMuslehUser) {
          user.fullName = user.fullName || 'Masitah Binti Seikh Omar (Pengetua)';
          user.position = 'Pengetua';
          user.school = 'SEKOLAH MENENGAH AGAMA I-MUSLEH';
          user.schoolType = 'Sekolah Menengah';
          user.state = 'Melaka';
          user.district = 'Ayer Keroh';
          user.role = 'MEMBER';
          user.membershipNo = 'MPGB-2026-JAIM/SAS(M)130';
          user.schoolCode = 'JAIM/SAS(M)130';
          user.phone = user.phone || '013-2695286';
          user.schoolPhone = '06-2349405';
          user.email = user.email || 'smimmelaka@gmail.com';
          user.pgbEmail = 'smimmelaka@gmail.com';
          user.schoolEmail = 'smimmelaka@gmail.com';
          user.joinYear = 2023;
          user.serviceStartYear = 2023;
          user.pgbStartYear = 2023;
          user.photoURL = user.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
          user.schoolPhotoUrl = user.schoolPhotoUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80';
          user.logoUrl = user.logoUrl || '/mpgbsim-official-logo.png';
          safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else if (isPrimaryMuslehUser) {
          user.fullName = user.fullName || 'Ustaz Abdul Qayyum bin Yaakop';
          user.position = user.position || 'Guru Besar';
          user.school = user.school || 'Sekolah Rendah Islam I Musleh';
          user.schoolType = user.schoolType || 'Sekolah Rendah';
          user.state = user.state || 'Melaka';
          user.district = 'Melaka Tengah';
          user.role = 'MEMBER';
          user.membershipNo = 'MPGB-2026-MJAC011';
          user.schoolCode = 'MJAC011';
          user.phone = user.phone || '+60 6-335 1290';
          user.joinYear = 2026;
          // Sanitize any legacy oversized base64 data URLs (>180KB) in cache to prevent QuotaExceededError
          if (typeof user.schoolPhotoUrl === 'string' && user.schoolPhotoUrl.startsWith('data:') && user.schoolPhotoUrl.length > 180 * 1024) {
            user.schoolPhotoUrl = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80';
          }
          if (typeof user.photoURL === 'string' && user.photoURL.startsWith('data:') && user.photoURL.length > 180 * 1024) {
            user.photoURL = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
          }
          if (typeof user.logoUrl === 'string' && user.logoUrl.startsWith('data:') && user.logoUrl.length > 180 * 1024) {
            user.logoUrl = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80';
          }
          user.photoURL = user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
          user.schoolPhotoUrl = user.schoolPhotoUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80';
          safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else if (
          (user?.schoolCode === 'KJA3002' ||
            memNo.includes('KJA3002') ||
            user?.uid === 'sch-user-school-1791963595619-k4xh' ||
            user?.schoolId === 'school-1791963595619-k4xh') &&
          (user?.school?.toLowerCase().includes('menengah') || user?.position === 'Pengetua')
        ) {
          // Auto-heal Sekolah Rendah Al-Azhar if corrupted by shared email
          user.school = 'SEKOLAH RENDAH AL-AZHAR';
          user.schoolId = 'school-1791963595619-k4xh';
          user.schoolCode = 'KJA3002';
          user.schoolType = 'Sekolah Rendah';
          user.position = 'Guru Besar';
          user.fullName = 'MOHD RAZMAN BIN RAMZAN (Guru Besar)';
          user.pgbEmail = 'razman2015@gmail.com';
          user.pgbPhone = '013-4365669';
          user.membershipNo = 'MPGB-2026-KJA3002';
          user.uid = 'sch-user-school-1791963595619-k4xh';
          safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else if (
          (user?.schoolCode === 'BLAD001' ||
            memNo.includes('BLAD001') ||
            user?.schoolId === 'school-1791789043737-cace' ||
            user?.school?.includes('SEKOLAH MENENGAH SRI AL-AMIN BANGI')) &&
          (user?.position === 'Guru Besar' || user?.schoolType?.toLowerCase().includes('rendah'))
        ) {
          // Auto-heal SEKOLAH MENENGAH SRI AL-AMIN BANGI as Secondary School and Pengetua
          user.school = 'SEKOLAH MENENGAH SRI AL-AMIN BANGI';
          user.schoolId = 'school-1791789043737-cace';
          user.schoolCode = 'BLAD001';
          user.schoolType = 'Sekolah Menengah';
          user.position = 'Pengetua';
          user.fullName = user.fullName?.includes('Pengetua') ? user.fullName : 'NOOR ASYIKIN BINTI AHMAT (Pengetua)';
          safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        }

        return user;
      }
    } catch (e) {
      // ignore
    }
    return null;
  });

  const [portalTab, setPortalTab] = useState<PortalTab>('dashboard');
  const [portalSubTab, setPortalSubTab] = useState<string>('pgb');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Registered programs for logged in user
  const [registeredProgramIds, setRegisteredProgramIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_PROGRAMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return ['prog-1'];
  });

  // Data states with local persistence
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (saved) {
        const parsed: AnnouncementItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((a) =>
            a.id === 'ann-1' && (!a.attachmentUrl || a.attachmentUrl === '#')
              ? {
                  ...a,
                  attachmentUrl:
                    'https://drive.google.com/file/d/1PIemR7HOk9-JC--T1gMLMmMx4pwxDZh9/view?usp=sharing',
                }
              : a
          );
        }
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [documents, setDocuments] = useState<PortalDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_DOCUMENTS;
  });

  const [bestPractices, setBestPractices] = useState<BestPracticeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BEST_PRACTICES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_BEST_PRACTICES;
  });

  const [submissions, setSubmissions] = useState<MemberSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_SUBMISSIONS;
  });

  const [notifications, setNotifications] = useState<PortalNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [schoolNews, setSchoolNews] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('mpgbsim_school_news_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [feePayments, setFeePayments] = useState<FeePaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mpgbsim_fee_payments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_FEE_PAYMENTS;
  });

  // Registered Member Schools state directly synced with AdminContentContext 'siteData.memberSchools' (zero duplicate Firestore reads)
  const [registeredSchools, setRegisteredSchools] = useState<MemberSchool[]>(() => siteData.memberSchools || []);

  // Sync to local storage with quota protection
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    // If no currentUser was recovered from localStorage, check IndexedDB backup
    if (!currentUser) {
      loadFromIndexedDB<UserProfile>('portal_user').then((cached) => {
        if (cached && cached.uid && !cached.uid.startsWith('demo-')) {
          setCurrentUser((curr) => curr || cached);
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      saveToIndexedDB('portal_user', currentUser).catch(() => {});
    } else {
      safeLocalStorageRemove(STORAGE_KEYS.CURRENT_USER);
      saveToIndexedDB('portal_user', null).catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.REGISTERED_PROGRAMS, JSON.stringify(registeredProgramIds));
  }, [registeredProgramIds]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.BEST_PRACTICES, JSON.stringify(bestPractices));
  }, [bestPractices]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    safeLocalStorageSet('mpgbsim_school_news_v1', JSON.stringify(schoolNews));
  }, [schoolNews]);

  // Listen for real-time school updates from CMS (Pusat Kawalan CMS -> Pengurusan Direktori Sekolah Ahli)
  useEffect(() => {
    const handleSchoolUpdated = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.updated) return;

      setCurrentUser((prev) => {
        if (!prev) return prev;
        const matchMusleh =
          (detail.id === 'sch-musleh-1' || detail.updated.code === 'MJAC011') &&
          (prev.email?.includes('imusleh') ||
            prev.school?.toLowerCase().includes('musleh') ||
            prev.membershipNo?.includes('MJAC011') ||
            prev.membershipNo?.includes('MIA1009'));
        const matchId =
          (prev.schoolId && prev.schoolId === detail.id) ||
          prev.uid === `sch-user-${detail.id}` ||
          prev.uid === detail.id;
        const matchCode =
          (prev.schoolCode && detail.updated.code && prev.schoolCode.toUpperCase() === detail.updated.code.toUpperCase()) ||
          (prev.membershipNo && detail.updated.code && prev.membershipNo.toUpperCase().includes(detail.updated.code.toUpperCase()));
        const matchSchoolName =
          (prev.school && detail.updated.name && prev.school.toLowerCase().trim() === detail.updated.name.toLowerCase().trim()) ||
          (prev.school && detail.school?.name && prev.school.toLowerCase().trim() === detail.school.name.toLowerCase().trim());
        const matchPgbEmail =
          prev.pgbEmail && detail.updated.pgbEmail && prev.pgbEmail.toLowerCase().trim() === detail.updated.pgbEmail.toLowerCase().trim();

        if (matchMusleh || matchId || matchCode || matchSchoolName || matchPgbEmail) {
          const updated: UserProfile = {
            ...prev,
            ...(detail.updated.principal ? { fullName: detail.updated.principal } : {}),
            ...(detail.updated.name ? { school: detail.updated.name } : {}),
            ...(detail.updated.state ? { state: detail.updated.state } : {}),
            ...(detail.updated.phone ? { phone: detail.updated.phone } : {}),
            ...(detail.updated.icNumber ? { icNumber: detail.updated.icNumber } : {}),
            ...(detail.updated.principalPhotoUrl ? { photoURL: detail.updated.principalPhotoUrl } : {}),
            ...(detail.updated.schoolPhotoUrl ? { schoolPhotoUrl: detail.updated.schoolPhotoUrl } : {}),
            ...(detail.updated.logoUrl ? { logoUrl: detail.updated.logoUrl } : {}),
            updatedAt: new Date().toISOString(),
          };
          safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    };

    window.addEventListener('mpgbsim_school_updated', handleSchoolUpdated);
    return () => {
      window.removeEventListener('mpgbsim_school_updated', handleSchoolUpdated);
    };
  }, []);

  // Firebase Auth sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // If logged in via Firebase
        const isSuperAdmin = isAuthorizedAdminEmail(fbUser.email);
        const userEmail = (fbUser.email || '').toLowerCase().trim();

        // 1. Check if user profile already exists in Firestore
        let savedProfile: Partial<UserProfile> | null = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            savedProfile = userDoc.data() as Partial<UserProfile>;
          }
        } catch (e) {
          console.warn('Firestore user fetch notice:', e);
        }

        // 2. Fetch all registered schools directly from Firestore 'schools' collection used by Admin CMS
        let regSchools: MemberSchool[] = [];
        try {
          regSchools = await getLatestRegisteredSchools();
        } catch (e) {
          console.warn('Could not fetch registered schools in onAuthStateChanged:', e);
        }

        // 3. Detect school if Musleh or registered school
        const isSecondaryMusleh =
          userEmail === 'smimmelaka@gmail.com' ||
          (savedProfile?.membershipNo && (savedProfile.membershipNo.includes('JAIM/SAS') || savedProfile.membershipNo.includes('MIA1009'))) ||
          (savedProfile?.school && (savedProfile.school.toLowerCase().includes('menengah') || savedProfile.school.toLowerCase().includes('sma')) && savedProfile.school.toLowerCase().includes('musleh'));

        const isPrimaryMusleh =
          !isSecondaryMusleh &&
          (userEmail === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
            userEmail.includes('imuslehmelaka') ||
            userEmail.includes('abdulqayyum') ||
            (savedProfile?.school && (savedProfile.school.toLowerCase().includes('rendah islam i musleh') || savedProfile.school.toLowerCase().includes('sri i musleh'))) ||
            (savedProfile?.membershipNo && savedProfile.membershipNo.includes('MJAC011')));

        let matchedSchool = regSchools.find((s) => {
          if (isSecondaryMusleh && (s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.email?.toLowerCase() === 'smimmelaka@gmail.com')) return true;
          if (isPrimaryMusleh && (s.code === 'MJAC011' || s.id === 'sch-musleh-1')) return true;
          if (s.email && s.email.toLowerCase().trim() === userEmail) return true;
          if (savedProfile?.membershipNo && s.code && savedProfile.membershipNo.includes(s.code)) return true;
          if (savedProfile?.school && s.name && savedProfile.school.toLowerCase().trim() === s.name.toLowerCase().trim()) return true;
          return false;
        }) || (isSecondaryMusleh ? regSchools.find((s) => s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.email?.toLowerCase() === 'smimmelaka@gmail.com') : undefined)
          || (isPrimaryMusleh ? regSchools.find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1') : undefined);

        const role: UserRole = isSuperAdmin ? 'ADMIN' : 'MEMBER';

        const pos =
          isSecondaryMusleh
            ? 'Pengetua'
            : matchedSchool?.type?.includes('Rendah') || matchedSchool?.name?.toLowerCase().includes('rendah') || isPrimaryMusleh
            ? 'Guru Besar'
            : matchedSchool?.type === 'SMKA' || matchedSchool?.type === 'SABK' || matchedSchool?.type === 'Sekolah Menengah'
            ? 'Pengetua'
            : savedProfile?.position ||
              currentUser?.position ||
              (isSuperAdmin ? 'Pegawai Pentadbir MPGBSIM' : 'Pengetua / Guru Besar');

        const schoolName =
          matchedSchool?.name ||
          savedProfile?.school ||
          currentUser?.school ||
          (isSecondaryMusleh ? 'SEKOLAH MENENGAH AGAMA I-MUSLEH' : isPrimaryMusleh ? 'Sekolah Rendah Islam I Musleh' : isSuperAdmin ? 'Sekretariat Utama MPGBSIM' : 'Sekolah Islam Ahli MPGBSIM');

        const schoolType =
          matchedSchool?.type ||
          savedProfile?.schoolType ||
          currentUser?.schoolType ||
          (isSecondaryMusleh ? 'Sekolah Menengah' : isPrimaryMusleh ? 'Sekolah Rendah' : 'SMKA');

        const stateName =
          matchedSchool?.state ||
          savedProfile?.state ||
          currentUser?.state ||
          (isSecondaryMusleh || isPrimaryMusleh ? 'Melaka' : 'Wilayah Persekutuan');

        const fullName =
          matchedSchool?.principal ||
          savedProfile?.fullName ||
          currentUser?.fullName ||
          fbUser.displayName ||
          (isSecondaryMusleh ? 'Masitah Binti Seikh Omar (Pengetua)' : isPrimaryMusleh ? 'Ustaz Abdul Qayyum bin Yaakop' : isSuperAdmin ? 'Pentadbir Utama MPGBSIM' : 'Ahli PGB MPGBSIM');

        const membershipNo = isSecondaryMusleh
          ? 'MPGB-2026-JAIM/SAS(M)130'
          : isPrimaryMusleh
          ? 'MPGB-2026-MJAC011'
          : (matchedSchool?.code
            ? `MPGB-2026-${matchedSchool.code}`
            : savedProfile?.membershipNo ||
              currentUser?.membershipNo ||
              `MPGB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          fullName,
          role,
          position: pos,
          icNumber: savedProfile?.icNumber || (matchedSchool as any)?.icNumber || currentUser?.icNumber || '',
          school: schoolName,
          schoolCode: isSecondaryMusleh ? 'JAIM/SAS(M)130' : (matchedSchool?.code || savedProfile?.schoolCode || currentUser?.schoolCode || ''),
          schoolType,
          state: stateName,
          district: matchedSchool?.district || savedProfile?.district || currentUser?.district || '',
          address: matchedSchool?.address || savedProfile?.address || currentUser?.address || '',
          phone: matchedSchool?.phone || savedProfile?.phone || fbUser.phoneNumber || currentUser?.phone || (isSecondaryMusleh ? '06-2349405' : isPrimaryMusleh ? '+60 6-335 1290' : ''),
          pgbEmail: matchedSchool?.pgbEmail || savedProfile?.pgbEmail || currentUser?.pgbEmail || fbUser.email || '',
          pgbPhone: matchedSchool?.pgbPhone || savedProfile?.pgbPhone || currentUser?.pgbPhone || matchedSchool?.phone || '',
          schoolEmail: matchedSchool?.schoolEmail || matchedSchool?.email || savedProfile?.schoolEmail || currentUser?.schoolEmail || '',
          schoolPhone: matchedSchool?.schoolPhone || matchedSchool?.phone || savedProfile?.schoolPhone || currentUser?.schoolPhone || '',
          studentCount: matchedSchool?.studentCount ?? savedProfile?.studentCount ?? currentUser?.studentCount ?? (isSecondaryMusleh ? 79 : isPrimaryMusleh ? 428 : 0),
          teacherCount: matchedSchool?.teacherCount ?? savedProfile?.teacherCount ?? currentUser?.teacherCount ?? (isSecondaryMusleh ? 10 : isPrimaryMusleh ? 32 : 0),
          website: matchedSchool?.website || savedProfile?.website || currentUser?.website || (isSecondaryMusleh ? 'https://i-musleh.com' : isPrimaryMusleh ? 'https://imuslehmelaka.edu.my' : ''),
          photoURL:
            matchedSchool?.principalPhotoUrl ||
            savedProfile?.photoURL ||
            fbUser.photoURL ||
            currentUser?.photoURL ||
            (isSecondaryMusleh
              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
              : isPrimaryMusleh
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              : ''),
          schoolPhotoUrl:
            matchedSchool?.schoolPhotoUrl ||
            savedProfile?.schoolPhotoUrl ||
            (isSecondaryMusleh
              ? 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80'
              : isPrimaryMusleh
              ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80'
              : currentUser?.schoolPhotoUrl),
          logoUrl:
            matchedSchool?.logoUrl ||
            savedProfile?.logoUrl ||
            '/mpgbsim-official-logo.png',
          expertise: savedProfile?.expertise || currentUser?.expertise || (isSecondaryMusleh ? ['Kepimpinan Kurikulum Menengah Agama', 'Tadbir Urus Sekolah Islam'] : ['Kepimpinan Pendidikan Islam', 'Kurikulum Dini Rabbani']),
          interests: savedProfile?.interests || currentUser?.interests || ['Transformasi Digital & AI', 'Pendidikan Bersepadu'],
          membershipNo,
          joinYear: isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2026 : matchedSchool?.joinYear || savedProfile?.joinYear || currentUser?.joinYear || 2026,
          serviceStartYear: savedProfile?.serviceStartYear || savedProfile?.pgbStartYear || (matchedSchool as any)?.serviceStartYear || (matchedSchool as any)?.pgbStartYear || (isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2026 : 2020),
          pgbStartYear: savedProfile?.pgbStartYear || savedProfile?.serviceStartYear || (matchedSchool as any)?.pgbStartYear || (matchedSchool as any)?.serviceStartYear || (isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2026 : 2020),
          status: 'active',
          hidePhone: savedProfile?.hidePhone ?? currentUser?.hidePhone ?? true,
        };

        setCurrentUser(profile);

        // Only create initial user profile document in Firestore if it does NOT exist yet
        if (!savedProfile) {
          try {
            await setDoc(doc(db, 'users', fbUser.uid), profile, { merge: true });
          } catch (e) {
            console.warn('Firestore initial user profile creation notice:', e);
          }
        }
      }
    });

    return () => unsub();
  }, []);

  // Sync shared collections directly from AdminContentContext to avoid duplicate Firestore listeners & read quota waste
  useEffect(() => {
    if (Array.isArray(siteData.announcements) && siteData.announcements.length > 0) {
      setAnnouncements(
        siteData.announcements.map((a) =>
          a.id === 'ann-1' && (!a.attachmentUrl || a.attachmentUrl === '#')
            ? {
                ...a,
                attachmentUrl:
                  'https://drive.google.com/file/d/1PIemR7HOk9-JC--T1gMLMmMx4pwxDZh9/view?usp=sharing',
              }
            : a
        )
      );
    }
  }, [siteData.announcements]);

  useEffect(() => {
    if (Array.isArray(siteData.practices) && siteData.practices.length > 0) {
      setBestPractices(siteData.practices);
    }
  }, [siteData.practices]);

  useEffect(() => {
    if (Array.isArray(siteData.news) && siteData.news.length > 0) {
      setSchoolNews(sortNewsByPublishedDate(siteData.news));
    }
  }, [siteData.news]);

  useEffect(() => {
    if (Array.isArray(siteData.memberSchools) && siteData.memberSchools.length > 0) {
      const portalUserRaw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CURRENT_USER) : null;
      const portalUser = portalUserRaw ? JSON.parse(portalUserRaw) : null;
      const { repairedSchools } = repairSchoolIntegrity(siteData.memberSchools, portalUser);
      setRegisteredSchools(repairedSchools);

      // Synchronize currentUser in real-time if matching school profile was updated in CMS
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const isSecondaryMusleh =
          prev.email === 'smimmelaka@gmail.com' ||
          prev.schoolCode === 'JAIM/SAS(M)130' ||
          prev.schoolCode === 'MIA1009' ||
          (prev.membershipNo && (prev.membershipNo.includes('JAIM/SAS') || prev.membershipNo.includes('MIA1009'))) ||
          (prev.school && (prev.school.toLowerCase().includes('menengah') || prev.school.toLowerCase().includes('sma')) && prev.school.toLowerCase().includes('musleh'));

        const isPrimaryMusleh =
          !isSecondaryMusleh &&
          (prev.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
            (prev.email && prev.email.toLowerCase().includes('imuslehmelaka')) ||
            (prev.school && (prev.school.toLowerCase().includes('rendah islam i musleh') || prev.school.toLowerCase().includes('sri i musleh'))) ||
            (prev.membershipNo && prev.membershipNo.includes('MJAC011')));

        const matched = isSecondaryMusleh
          ? repairedSchools.find((s) => s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.email?.toLowerCase() === 'smimmelaka@gmail.com')
          : isPrimaryMusleh
          ? repairedSchools.find((s) => s.id === 'sch-musleh-1' || s.code === 'MJAC011')
          : (prev.schoolId ? repairedSchools.find((s) => s.id === prev.schoolId) : null) ||
            repairedSchools.find((s) => prev.uid === `sch-user-${s.id}` || prev.uid === s.id) ||
            (prev.schoolCode ? repairedSchools.find((s) => s.code && s.code.toUpperCase() === prev.schoolCode?.toUpperCase()) : null) ||
            (prev.membershipNo ? repairedSchools.find((s) => s.code && prev.membershipNo?.toUpperCase().includes(s.code.toUpperCase())) : null) ||
            (prev.school ? repairedSchools.find((s) => s.name && s.name.toLowerCase().trim() === prev.school?.toLowerCase().trim()) : null) ||
            (prev.pgbEmail ? repairedSchools.find((s) => s.pgbEmail && s.pgbEmail.toLowerCase().trim() === prev.pgbEmail?.toLowerCase().trim()) : null) ||
            (prev.email ? repairedSchools.find((s) => {
              const emailMatches = s.email && s.email.toLowerCase() === prev.email.toLowerCase();
              if (!emailMatches) return false;
              if (prev.schoolType && s.type && prev.schoolType.toLowerCase().trim() === s.type.toLowerCase().trim()) return true;
              if (prev.position === 'Guru Besar' && s.type?.toLowerCase().includes('rendah')) return true;
              if (prev.position === 'Pengetua' && s.type?.toLowerCase().includes('menengah')) return true;
              return false;
            }) : null);

        if (matched) {
          const codeNorm = (matched.code || prev.schoolCode || '').trim().toLowerCase();
          const nameNorm = (matched.name || prev.school || '').trim().toLowerCase();
          const emailNorm = (matched.pgbEmail || matched.email || prev.pgbEmail || prev.email || '').trim().toLowerCase();
          const principalNorm = (matched.principal || prev.fullName || '')
            .replace(/\(.*?\)/g, '')
            .trim()
            .toLowerCase();

          const matchedApp = (siteData.memberApplications || []).find((a) => {
            const aCode = (a.schoolCode || '').trim().toLowerCase();
            const aName = (a.schoolName || '').trim().toLowerCase();
            const aEmail = (a.email || a.pgbEmail || '').trim().toLowerCase();
            const aFullName = (a.fullName || '').trim().toLowerCase();
            return (
              (codeNorm && aCode && aCode === codeNorm) ||
              (nameNorm && aName && aName === nameNorm) ||
              (emailNorm && aEmail && aEmail === emailNorm) ||
              (principalNorm && aFullName && (principalNorm.includes(aFullName) || aFullName.includes(principalNorm)))
            );
          });

          let subIc = '';
          for (const sub of siteData.submissions || []) {
            const msg = sub.message || '';
            const kpMatch = msg.match(/No\s*KP:\s*([0-9A-Za-z-]{6,20})/i);
            if (!kpMatch || !kpMatch[1] || kpMatch[1] === '-') continue;
            const msgLower = msg.toLowerCase();
            const subEmail = (sub.email || '').trim().toLowerCase();
            const subName = (sub.name || '').trim().toLowerCase();
            if (
              (codeNorm && msgLower.includes(`(${codeNorm})`)) ||
              (nameNorm && msgLower.includes(nameNorm)) ||
              (emailNorm && (subEmail === emailNorm || msgLower.includes(emailNorm))) ||
              (principalNorm && subName && (principalNorm.includes(subName) || subName.includes(principalNorm)))
            ) {
              subIc = kpMatch[1].trim();
              break;
            }
          }

          const targetIc =
            matched.icNumber ||
            matchedApp?.icNumber ||
            subIc ||
            prev.icNumber ||
            (isSecondaryMusleh ? '730627-01-5156' : isPrimaryMusleh ? '850312-04-5123' : '');

          const targetCode = isSecondaryMusleh ? 'JAIM/SAS(M)130' : (matched.code || prev.schoolCode);
          const targetMemNo = isSecondaryMusleh ? 'MPGB-2026-JAIM/SAS(M)130' : (prev.membershipNo?.replace('MIA1009', 'JAIM/SAS(M)130') || prev.membershipNo);
          const needsUpdate =
            (targetCode && targetCode !== prev.schoolCode) ||
            (targetMemNo && targetMemNo !== prev.membershipNo) ||
            (targetIc && targetIc !== prev.icNumber) ||
            (matched.principal && matched.principal !== prev.fullName) ||
            (matched.name && matched.name !== prev.school) ||
            (matched.state && matched.state !== prev.state) ||
            (matched.phone && matched.phone !== prev.phone) ||
            (matched.principalPhotoUrl && matched.principalPhotoUrl !== prev.photoURL) ||
            (matched.schoolPhotoUrl && matched.schoolPhotoUrl !== prev.schoolPhotoUrl) ||
            (matched.logoUrl && matched.logoUrl !== prev.logoUrl) ||
            (matched.type && matched.type !== prev.schoolType);

          if (!needsUpdate) return prev;

          const updatedUser: UserProfile = {
            ...prev,
            ...(targetCode ? { schoolCode: targetCode } : {}),
            ...(targetMemNo ? { membershipNo: targetMemNo } : {}),
            ...(targetIc ? { icNumber: targetIc } : {}),
            ...(matched.principal ? { fullName: matched.principal } : {}),
            ...(matched.name ? { school: matched.name } : {}),
            ...(matched.state ? { state: matched.state } : {}),
            ...(matched.phone ? { phone: matched.phone } : {}),
            ...(matched.principalPhotoUrl ? { photoURL: matched.principalPhotoUrl } : {}),
            ...(matched.schoolPhotoUrl ? { schoolPhotoUrl: matched.schoolPhotoUrl } : {}),
            ...(matched.logoUrl ? { logoUrl: matched.logoUrl } : {}),
            ...(matched.type ? { schoolType: matched.type } : {}),
            updatedAt: new Date().toISOString(),
          };
          safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
          return updatedUser;
        }
        return prev;
      });
    }
  }, [siteData.memberSchools, siteData.memberApplications, siteData.submissions]);

  // On-demand Portal-only Firestore Listeners (only attached when user enters Portal mode and quota allows)
  useEffect(() => {
    if (viewMode !== 'portal' || isFirestoreQuotaExceeded()) {
      return;
    }

    const unsubscribes: (() => void)[] = [];
    let isCircuitBroken = false;

    const cleanupPortalListeners = () => {
      while (unsubscribes.length > 0) {
        const unsub = unsubscribes.pop();
        try {
          if (unsub) unsub();
        } catch {}
      }
    };

    const handlePortalListenerError = (label: string, err: any) => {
      if (isQuotaExceededError(err)) {
        if (!isCircuitBroken) {
          isCircuitBroken = true;
          markFirestoreQuotaExceeded(label);
          cleanupPortalListeners();
        }
        return;
      }
      console.warn(`Firestore ${label} listener notification:`, err?.message || err);
    };

    // 1. Documents (Portal-only)
    try {
      const unsubDoc = onSnapshot(
        collection(db, 'documents'),
        (snapshot) => {
          const isSeeded = localStorage.getItem('mpgbsim_documents_seeded') === 'true';

          if (!snapshot.empty) {
            const list: PortalDocument[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            if (!isSeeded) {
              localStorage.setItem('mpgbsim_documents_seeded', 'true');
            }
            setDocuments(list);
          } else if (!isSeeded && INITIAL_DOCUMENTS.length > 0) {
            localStorage.setItem('mpgbsim_documents_seeded', 'true');
            setDocuments(INITIAL_DOCUMENTS);
          } else {
            setDocuments([]);
          }
        },
        (err) => handlePortalListenerError('documents', err)
      );
      unsubscribes.push(unsubDoc);
    } catch (e) {
      console.warn('Documents listener error:', e);
    }

    // 2. Portal Submissions
    try {
      const unsubSub = onSnapshot(
        collection(db, 'submissions'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: MemberSubmission[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setSubmissions(list);
          }
        },
        (err) => handlePortalListenerError('submissions', err)
      );
      unsubscribes.push(unsubSub);
    } catch (e) {
      console.warn('Submissions listener error:', e);
    }

    // 3. Portal Notifications
    try {
      const unsubNotif = onSnapshot(
        collection(db, 'notifications'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: PortalNotification[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setNotifications(list);
          }
        },
        (err) => handlePortalListenerError('notifications', err)
      );
      unsubscribes.push(unsubNotif);
    } catch (e) {
      console.warn('Notifications listener error:', e);
    }

    // 4. Fee Payments
    try {
      const unsubFee = onSnapshot(
        collection(db, 'feePayments'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: FeePaymentRecord[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setFeePayments(list);
            safeLocalStorageSet('mpgbsim_fee_payments', JSON.stringify(list));
          }
        },
        (err) => handlePortalListenerError('feePayments', err)
      );
      unsubscribes.push(unsubFee);
    } catch (e) {
      console.warn('Fee payments listener error:', e);
    }

    return () => {
      cleanupPortalListeners();
    };
  }, [viewMode]);

  const currentRole: UserRole = currentUser?.role || 'PUBLIC';

  const unreadNotificationsCount = notifications.filter(
    (n) => !n.read && (n.userId === 'all' || n.userId === currentUser?.uid)
  ).length;

  const recordAuditLog = (action: string, content: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      user: currentUser?.fullName || 'Pengguna Awam',
      email: currentUser?.email || 'tetamu@mpgbsim.org.my',
      action,
      content,
      timestamp: new Date().toLocaleString('ms-MY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Optional firestore write
    if (currentUser) {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(() => {});
    }
  };

  const switchDemoRole = (_role: UserRole) => {
    // Demo role switching abolished - only real accounts allowed
    console.warn('Peranan pengguna demo telah dimansuhkan. Sila log masuk menggunakan akaun sebenar yang sah.');
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const userEmail = (user.email || '').toLowerCase().trim();
      const isSuper = isAuthorizedAdminEmail(userEmail);

      // 1. Check if user profile already exists in Firestore
      let savedProfile: Partial<UserProfile> | null = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          savedProfile = userDoc.data() as Partial<UserProfile>;
        }
      } catch (e) {
        console.warn('Firestore user doc read notice:', e);
      }

      // 2. Fetch all registered schools merged from CMS state & Firestore
      const registeredSchools = await getLatestRegisteredSchools();

      // 3. Match against registered schools (exact email, domain match, or specific educator email)
      const isSecondaryMusleh =
        userEmail === 'smimmelaka@gmail.com' ||
        (savedProfile?.membershipNo && (savedProfile.membershipNo.includes('JAIM/SAS') || savedProfile.membershipNo.includes('MIA1009'))) ||
        (savedProfile?.school && (savedProfile.school.toLowerCase().includes('menengah') || savedProfile.school.toLowerCase().includes('sma')) && savedProfile.school.toLowerCase().includes('musleh'));

      const isPrimaryMusleh =
        !isSecondaryMusleh &&
        (userEmail === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
          userEmail.includes('imuslehmelaka') ||
          (savedProfile?.membershipNo && savedProfile.membershipNo.includes('MJAC011')) ||
          (savedProfile?.school && (savedProfile.school.toLowerCase().includes('rendah') || savedProfile.school.toLowerCase().includes('sri')) && savedProfile.school.toLowerCase().includes('musleh')));

      let matchedSchool: MemberSchool | undefined = registeredSchools.find((s) => {
        if (isSecondaryMusleh && (s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.email?.toLowerCase() === 'smimmelaka@gmail.com')) return true;
        if (isPrimaryMusleh && (s.code === 'MJAC011' || s.id === 'sch-musleh-1')) return true;
        if (!s.email) return false;
        const schEmail = s.email.toLowerCase().trim();
        if (schEmail === userEmail) return true;
        const userDomain = userEmail.split('@')[1];
        const schDomain = schEmail.split('@')[1];
        if (userDomain && schDomain && userDomain === schDomain) return true;
        return false;
      });

      if (!matchedSchool && isSecondaryMusleh) {
        matchedSchool = registeredSchools.find((s) => s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.email?.toLowerCase() === 'smimmelaka@gmail.com');
      } else if (!matchedSchool && isPrimaryMusleh) {
        matchedSchool = registeredSchools.find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1');
      }

      const role: UserRole = isSuper ? 'ADMIN' : 'MEMBER';

      const isPrimary =
        !matchedSchool?.name?.toLowerCase().includes('menengah') &&
        !matchedSchool?.type?.toLowerCase().includes('menengah') &&
        (matchedSchool?.type?.includes('Rendah') ||
          matchedSchool?.name?.toLowerCase().includes('rendah') ||
          isPrimaryMusleh);

      const pos = isSecondaryMusleh
        ? 'Pengetua'
        : isPrimaryMusleh
        ? 'Guru Besar'
        : isSuper
        ? 'Pegawai Pentadbir MPGBSIM'
        : isPrimary
        ? 'Guru Besar'
        : matchedSchool?.type === 'SMKA' || matchedSchool?.type === 'SABK' || matchedSchool?.type === 'Sekolah Menengah'
        ? 'Pengetua'
        : savedProfile?.position || 'Pengetua / Guru Besar';

      const defaultName =
        savedProfile?.fullName ||
        matchedSchool?.principal ||
        user.displayName ||
        (isSecondaryMusleh ? 'Masitah Binti Seikh Omar (Pengetua)' : isPrimaryMusleh ? 'Ustaz Abdul Qayyum bin Yaakop' : (userEmail.split('@')[0] || 'Ahli PGB MPGBSIM'));

      const defaultSchoolName =
        savedProfile?.school ||
        matchedSchool?.name ||
        (isSecondaryMusleh ? 'SEKOLAH MENENGAH AGAMA I-MUSLEH' : isPrimaryMusleh ? 'Sekolah Rendah Islam I Musleh' : (isSuper ? 'Sekretariat Utama MPGBSIM' : 'Sekolah Ahli Berdaftar MPGBSIM'));

      const defaultState = savedProfile?.state || matchedSchool?.state || (isSecondaryMusleh || isPrimaryMusleh ? 'Melaka' : 'Wilayah Persekutuan');
      const defaultSchoolType = savedProfile?.schoolType || matchedSchool?.type || (isSecondaryMusleh ? 'Sekolah Menengah' : isPrimaryMusleh ? 'Sekolah Rendah' : 'SMKA');
      const defaultMembershipNo = isSecondaryMusleh
        ? 'MPGB-2026-JAIM/SAS(M)130'
        : isPrimaryMusleh
        ? 'MPGB-2026-MJAC011'
        : (savedProfile?.membershipNo ||
          (matchedSchool?.code
            ? `MPGB-2026-${matchedSchool.code}`
            : isSuper
            ? 'MPGB-ADMIN-01'
            : `MPGB-2026-${Math.floor(1000 + Math.random() * 9000)}`));

      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        fullName: defaultName,
        role,
        position: pos,
        icNumber:
          savedProfile?.icNumber ||
          matchedSchool?.icNumber ||
          (isSecondaryMusleh ? '730627-01-5156' : isPrimaryMusleh ? '850312-04-5123' : ''),
        school: defaultSchoolName,
        schoolCode: isSecondaryMusleh ? 'JAIM/SAS(M)130' : (matchedSchool?.code || savedProfile?.schoolCode || ''),
        schoolType: defaultSchoolType,
        state: defaultState,
        phone: savedProfile?.phone || matchedSchool?.phone || user.phoneNumber || (isSecondaryMusleh ? '06-2349405' : isPrimaryMusleh ? '+60 6-335 1290' : ''),
        photoURL:
          savedProfile?.photoURL ||
          matchedSchool?.principalPhotoUrl ||
          user.photoURL ||
          (isSecondaryMusleh
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
            : isPrimaryMusleh
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            : ''),
        schoolPhotoUrl:
          savedProfile?.schoolPhotoUrl ||
          matchedSchool?.schoolPhotoUrl ||
          (isSecondaryMusleh
            ? 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80'
            : isPrimaryMusleh
            ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80'
            : undefined),
        logoUrl:
          savedProfile?.logoUrl ||
          matchedSchool?.logoUrl ||
          '/mpgbsim-official-logo.png',
        status: 'active',
        membershipNo: defaultMembershipNo,
        joinYear: isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2026 : savedProfile?.joinYear || matchedSchool?.joinYear || 2026,
        expertise: savedProfile?.expertise || ['Kepimpinan Pendidikan Islam', 'Kurikulum Dini Rabbani'],
        interests: savedProfile?.interests || ['Transformasi Digital & AI', 'Pendidikan Bersepadu'],
        hidePhone: true,
      };

      setCurrentUser(profile);
      setViewMode('portal');
      setPortalTab('dashboard');

      // Persist profile to Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      } catch (e) {
        console.warn('Firestore profile persist notice:', e);
      }

      recordAuditLog('Log Masuk Google', `Pengguna sah ${user.email} (${profile.fullName}) berjaya log masuk ke Portal Ahli.`);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (emailOrCode: string, pass: string) => {
    const input = (emailOrCode || '').trim();
    const cleanPass = (pass || '').trim();

    if (!input || !cleanPass) {
      throw new Error('Sila masukkan Emel / Kod Sekolah dan Kata Laluan yang sah.');
    }

    // 1. Try Firebase Auth first if it contains '@'
    if (input.includes('@')) {
      try {
        const res = await signInWithEmailAndPassword(auth, input, cleanPass);
        const fbUser = res.user;
        const isSuper = fbUser.email?.toLowerCase() === 'mpgbsim.cemerlang@gmail.com';
        const role: UserRole = isSuper ? 'ADMIN' : 'MEMBER';

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || input,
          fullName: fbUser.displayName || (isSuper ? 'Pentadbir Utama MPGBSIM' : 'Pengetua Sekolah Ahli'),
          role,
          position: isSuper ? 'Pegawai Pentadbir MPGBSIM' : 'Pengetua / Guru Besar',
          school: isSuper ? 'Sekretariat Utama MPGBSIM' : 'Sekolah Ahli Berdaftar',
          schoolType: 'SMKA',
          state: 'Wilayah Persekutuan',
          status: 'active',
          membershipNo: isSuper ? 'MPGB-ADMIN-01' : 'MPGB-2026-MEMBER',
          joinYear: 2026,
          serviceStartYear: 2020,
          pgbStartYear: 2020,
          hidePhone: true,
        };

        setCurrentUser(profile);
        setViewMode('portal');
        setPortalTab('dashboard');
        recordAuditLog('Log Masuk Emel', `Pengguna ${input} berjaya log masuk melalui Firebase Auth.`);
        return;
      } catch (fbErr: any) {
        // Fall through to verify against registered schools in database
      }
    }

    // 2. Validate against real registered schools in database (merged from CMS cache & Firestore)
    const registeredSchools = await getLatestRegisteredSchools();

    const inputClean = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Step 2a: Match by exact School ID or exact School Code
    let matched = registeredSchools.find(
      (s) => s.id === input || (s.code && s.code.toLowerCase().trim() === input.toLowerCase())
    );

    // Step 2b: Match by personal PGB Email (unique to individual headmaster/principal)
    if (!matched) {
      matched = registeredSchools.find(
        (s) => s.pgbEmail && s.pgbEmail.toLowerCase().trim() === input.toLowerCase()
      );
    }

    // Step 2c: Match by exact School Name
    if (!matched) {
      matched = registeredSchools.find(
        (s) => s.name && s.name.toLowerCase().trim() === input.toLowerCase()
      );
    }

    // Step 2d: Match by clean alphanumeric code
    if (!matched && inputClean.length >= 3) {
      matched = registeredSchools.find((s) => {
        const schCodeClean = (s.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return Boolean(schCodeClean && schCodeClean === inputClean);
      });
    }

    // Step 2e: Musleh special handler (differentiating SRI primary and SMA secondary)
    if (!matched) {
      if (
        input.toLowerCase() === 'smimmelaka@gmail.com' ||
        input.toLowerCase() === 'mia1009' ||
        input.toLowerCase() === 'jaim/sas(m)130' ||
        inputClean === 'mia1009' ||
        inputClean === 'jaimsasm130'
      ) {
        matched = registeredSchools.find(
          (s) =>
            s.code === 'MIA1009' ||
            s.email?.toLowerCase() === 'smimmelaka@gmail.com' ||
            s.code?.includes('JAIM/SAS') ||
            (s.name?.toLowerCase().includes('menengah') && s.name?.toLowerCase().includes('musleh'))
        );
      } else if (
        input.toLowerCase() === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
        input.toLowerCase() === 'mjac011' ||
        inputClean === 'mjac011' ||
        input.toLowerCase().includes('imuslehmelaka')
      ) {
        matched = registeredSchools.find(
          (s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1'
        );
      }
    }

    // Step 2f: Match by generic school email (handling shared emails safely)
    if (!matched) {
      const emailMatches = registeredSchools.filter(
        (s) =>
          (s.email && s.email.toLowerCase().trim() === input.toLowerCase()) ||
          (s.schoolEmail && s.schoolEmail.toLowerCase().trim() === input.toLowerCase())
      );

      if (emailMatches.length === 1) {
        matched = emailMatches[0];
      } else if (emailMatches.length > 1) {
        // Disambiguation needed: multiple schools share this office email (e.g. Al-Azhar primary and secondary)
        throw new Error(
          `Alamat emel "${input}" dikongsi oleh ${emailMatches.length} institusi: ${emailMatches.map((s) => `${s.name} [Kod: ${s.code}]`).join(' & ')}. Sila gunakan Kod Sekolah anda (cth: KJA3002 untuk Sekolah Rendah / KO5E103 untuk Sekolah Menengah) atau Emel PGB peribadi anda di ruangan Emel/Kod Sekolah untuk log masuk.`
        );
      }
    }

    if (!matched) {
      throw new Error(
        `Akaun "${input}" tidak ditemui dalam senarai ahli berdaftar MPGBSIM. Hanya akaun sekolah berdaftar yang dibenarkan log masuk.`
      );
    }

    // Verify password for registered school (check matched.password, custom password in Firestore, or defaults)
    const isMuslehSchool =
      matched.id === 'sch-musleh-1' ||
      matched.code === 'MJAC011' ||
      matched.code === 'MIA1009' ||
      (matched.email && matched.email.toLowerCase().includes('imuslehmelaka'));

    let customPasswordSet: string | null = null;

    // 1. Check Firestore 'users' collection for custom password set by user
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach((uDoc) => {
        const uData = uDoc.data();
        const uEmail = (uData.email || '').toLowerCase().trim();
        const uCode = (uData.schoolCode || '').toLowerCase().trim();
        const uMem = (uData.membershipNo || '').toLowerCase().trim();
        const inputLower = input.toLowerCase().trim();

        if (
          uEmail === inputLower ||
          uCode === inputLower ||
          uMem.includes(inputLower) ||
          (matched.email && uEmail === matched.email.toLowerCase().trim()) ||
          (matched.code && uCode === matched.code.toLowerCase().trim()) ||
          (isMuslehSchool && (uCode === 'mjac011' || uCode === 'mia1009' || uEmail.includes('imusleh')))
        ) {
          if (uData.portalPassword && uData.portalPassword.trim().length > 0) {
            customPasswordSet = uData.portalPassword.trim();
          }
        }
      });
    } catch (e) {}

    // 2. Check matched school object in 'schools' collection
    if (!customPasswordSet && matched.password) {
      const defaultFormats = [
        'MPGBSIM2026',
        'mpgbsim2026',
        `PGB#${matched.code?.toUpperCase()}`,
        'PGB#MJAC011',
        'PGB#MIA1009',
        'MPGB2026!',
      ];
      if ((matched as any).passwordUpdatedAt || !defaultFormats.includes(matched.password)) {
        customPasswordSet = matched.password.trim();
      }
    }

    // 3. Perform strict password validation
    let isValidPass = false;

    if (customPasswordSet) {
      // If user has changed their password, ONLY the new custom password is valid! Default formats like MPGBSIM2026 are REJECTED.
      isValidPass = cleanPass === customPasswordSet;
    } else {
      // If no custom password has been set yet, allow official temporary password MPGBSIM2026 or initial formats
      const isTempPassword = cleanPass === 'MPGBSIM2026' || cleanPass.toUpperCase() === 'MPGBSIM2026';
      const expectedPassword = matched.password || 'MPGBSIM2026';
      isValidPass =
        isTempPassword ||
        cleanPass === matched.password ||
        cleanPass === expectedPassword ||
        (isMuslehSchool && (cleanPass === 'PGB#MJAC011' || cleanPass === 'PGB#MIA1009')) ||
        cleanPass === `PGB#${matched.code?.toUpperCase()}` ||
        cleanPass === 'MPGB2026!';
    }

    if (!isValidPass) {
      if (customPasswordSet) {
        throw new Error(
          `Kata laluan tidak tepat. Anda telah menetapkan kata laluan baharu untuk akaun ini — kata laluan sementara (MPGBSIM2026) tidak lagi sah. Sila masukkan kata laluan peribadi yang telah dikemas kini.`
        );
      } else {
        throw new Error(
          `Kata laluan tidak tepat bagi institusi ${matched.name}. Sila gunakan kata laluan sementara rasmi (MPGBSIM2026) atau kata laluan akaun sekolah anda.`
        );
      }
    }

    // Authenticate as registered member school!
    await loginAsMemberSchool(matched);
  };

  const loginAsMemberSchool = async (school: MemberSchool) => {
    // Ensure Firebase session is ready for cloud Firestore writes
    try {
      await ensureFirebaseAuth();
    } catch (e) {
      console.warn('Firebase anonymous auth notice:', e);
    }

    // DIRECT FIRESTORE FETCH: Fetch school data directly from the same Firestore collection 'schools'
    // used by the Admin CMS to ensure any edits made in CMS are immediately reflected upon login.
    let liveSchool: MemberSchool = { ...school };
    try {
      const schoolDoc = await getDoc(doc(db, 'schools', school.id));
      if (schoolDoc.exists()) {
        const docData = schoolDoc.data() as MemberSchool;
        liveSchool = {
          ...school,
          ...docData,
          id: schoolDoc.id,
          icNumber: docData.icNumber || school.icNumber,
          schoolPhotoUrl: docData.schoolPhotoUrl || school.schoolPhotoUrl,
          logoUrl: docData.logoUrl || school.logoUrl,
          principalPhotoUrl: docData.principalPhotoUrl || school.principalPhotoUrl,
        };
      } else if (school.code) {
        const q = query(collection(db, 'schools'), where('code', '==', school.code.toUpperCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data() as MemberSchool;
          liveSchool = {
            ...school,
            ...docData,
            id: snap.docs[0].id,
            icNumber: docData.icNumber || school.icNumber,
            schoolPhotoUrl: docData.schoolPhotoUrl || school.schoolPhotoUrl,
            logoUrl: docData.logoUrl || school.logoUrl,
            principalPhotoUrl: docData.principalPhotoUrl || school.principalPhotoUrl,
          };
        }
      }
    } catch (e) {
      console.warn('Direct Firestore school fetch on login notice:', e);
    }

    // Also check saved user profile in 'users' collection if icNumber or custom fields were saved there
    let savedUserIc = '';
    try {
      const userSnap = await getDoc(doc(db, 'users', `sch-user-${liveSchool.id}`));
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (uData?.icNumber) savedUserIc = uData.icNumber;
      }
    } catch {}

    const isSecondaryMusleh =
      liveSchool.code === 'MIA1009' ||
      liveSchool.code === 'JAIM/SAS(M)130' ||
      liveSchool.email === 'smimmelaka@gmail.com' ||
      liveSchool.id === 'sch-musleh-menengah-1' ||
      (liveSchool.name?.toLowerCase().includes('menengah') && liveSchool.name?.toLowerCase().includes('musleh'));

    const isPrimaryMusleh =
      !isSecondaryMusleh &&
      (liveSchool.id === 'sch-musleh-1' ||
        liveSchool.code === 'MJAC011' ||
        liveSchool.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
        (liveSchool.name?.toLowerCase().includes('rendah') && liveSchool.name?.toLowerCase().includes('musleh')) ||
        liveSchool.email?.toLowerCase().includes('imuslehmelaka'));

    const rawCode = liveSchool.code?.trim().toUpperCase();
    const cleanCode = isSecondaryMusleh
      ? 'JAIM/SAS(M)130'
      : (rawCode && rawCode !== 'MIA1009' ? rawCode : (isPrimaryMusleh ? 'MJAC011' : liveSchool.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()));

    const schoolName = liveSchool.name || (isSecondaryMusleh ? 'SEKOLAH MENENGAH AGAMA I-MUSLEH' : isPrimaryMusleh ? 'Sekolah Rendah Islam I Musleh' : '');
    const principalName = liveSchool.principal || (isSecondaryMusleh ? 'Masitah Binti Seikh Omar (Pengetua)' : isPrimaryMusleh ? 'Ustaz Abdul Qayyum bin Yaakop' : '');
    const email = liveSchool.email || (isSecondaryMusleh ? 'smimmelaka@gmail.com' : isPrimaryMusleh ? 'abdulqayyumyaakop@imuslehmelaka.edu.my' : `${cleanCode.toLowerCase()}@mpgbsim.edu.my`);
    const schoolType = liveSchool.type || (isSecondaryMusleh ? 'Sekolah Menengah' : isPrimaryMusleh ? 'Sekolah Rendah' : 'SMKA');
    const state = liveSchool.state || (isSecondaryMusleh || isPrimaryMusleh ? 'Melaka' : 'Wilayah Persekutuan');
    const phone = liveSchool.phone || (isSecondaryMusleh ? '06-2349405' : isPrimaryMusleh ? '+60 6-335 1290' : '03-8888 2026');

    const isPrimary =
      !liveSchool.type?.toLowerCase().includes('menengah') &&
      !liveSchool.name?.toLowerCase().includes('menengah') &&
      (isPrimaryMusleh ||
        liveSchool.type?.includes('Rendah') ||
        liveSchool.name?.toLowerCase().includes('rendah'));
    const pos = liveSchool.designation || (isPrimary ? 'Guru Besar' : 'Pengetua');

    // Cross-match with memberApplications and submissions if icNumber is not yet on liveSchool
    const codeNorm = cleanCode.trim().toLowerCase();
    const nameNorm = schoolName.trim().toLowerCase();
    const emailNorm = (liveSchool.pgbEmail || email || '').trim().toLowerCase();
    const principalNorm = principalName.replace(/\(.*?\)/g, '').trim().toLowerCase();

    const matchedApp = (siteData.memberApplications || []).find((a) => {
      const aCode = (a.schoolCode || '').trim().toLowerCase();
      const aName = (a.schoolName || '').trim().toLowerCase();
      const aEmail = (a.email || a.pgbEmail || '').trim().toLowerCase();
      const aFullName = (a.fullName || '').trim().toLowerCase();
      return (
        (codeNorm && aCode && aCode === codeNorm) ||
        (nameNorm && aName && aName === nameNorm) ||
        (emailNorm && aEmail && aEmail === emailNorm) ||
        (principalNorm && aFullName && (principalNorm.includes(aFullName) || aFullName.includes(principalNorm)))
      );
    });

    let subIc = '';
    for (const sub of siteData.submissions || []) {
      const msg = sub.message || '';
      const kpMatch = msg.match(/No\s*KP:\s*([0-9A-Za-z-]{6,20})/i);
      if (!kpMatch || !kpMatch[1] || kpMatch[1] === '-') continue;
      const msgLower = msg.toLowerCase();
      const subEmail = (sub.email || '').trim().toLowerCase();
      const subName = (sub.name || '').trim().toLowerCase();
      if (
        (codeNorm && msgLower.includes(`(${codeNorm})`)) ||
        (nameNorm && msgLower.includes(nameNorm)) ||
        (emailNorm && (subEmail === emailNorm || msgLower.includes(emailNorm))) ||
        (principalNorm && subName && (principalNorm.includes(subName) || subName.includes(principalNorm)))
      ) {
        subIc = kpMatch[1].trim();
        break;
      }
    }

    const resolvedIcNumber =
      liveSchool.icNumber ||
      school.icNumber ||
      savedUserIc ||
      matchedApp?.icNumber ||
      subIc ||
      (isSecondaryMusleh ? '730627-01-5156' : isPrimaryMusleh ? '850312-04-5123' : '');

    const profile: UserProfile = {
      uid: `sch-user-${liveSchool.id}`,
      schoolId: liveSchool.id,
      email,
      fullName: principalName || `${pos} ${schoolName}`,
      role: 'MEMBER',
      position: pos,
      icNumber: resolvedIcNumber,
      school: schoolName,
      schoolCode: cleanCode,
      schoolType,
      state,
      district: liveSchool.district || '',
      address: liveSchool.address || '',
      phone,
      pgbEmail: liveSchool.pgbEmail || email,
      pgbPhone: liveSchool.pgbPhone || phone,
      schoolEmail: liveSchool.schoolEmail || liveSchool.email || email,
      schoolPhone: liveSchool.schoolPhone || liveSchool.phone || phone,
      studentCount: liveSchool.studentCount || 0,
      teacherCount: liveSchool.teacherCount || 0,
      website: liveSchool.website || '',
      photoURL:
        liveSchool.principalPhotoUrl ||
        (isSecondaryMusleh ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' : '') ||
        (isPrimaryMusleh ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' : '') ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      schoolPhotoUrl:
        liveSchool.schoolPhotoUrl ||
        (isSecondaryMusleh ? 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80' : '') ||
        (isPrimaryMusleh ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80' : ''),
      logoUrl:
        liveSchool.logoUrl ||
        '/mpgbsim-official-logo.png',
      expertise: ['Kepimpinan Instruksional', 'Pengurusan Sekolah Islam', 'Pendidikan Bersepadu'],
      interests: ['Transformasi Digital & AI', 'Pembangunan Sahsiah Rabbani', 'Inovasi Kokurikulum'],
      membershipNo: `MPGB-2026-${cleanCode}`,
      joinYear: isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2026 : liveSchool.joinYear || 2026,
      serviceStartYear: (liveSchool as any).serviceStartYear || (liveSchool as any).pgbStartYear || (isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2018 : liveSchool.joinYear || 2020),
      pgbStartYear: (liveSchool as any).pgbStartYear || (liveSchool as any).serviceStartYear || (isSecondaryMusleh ? 2023 : isPrimaryMusleh ? 2018 : liveSchool.joinYear || 2020),
      status: 'active',
      hidePhone: true,
    };

    if (currentUser && currentUser.schoolCode && currentUser.schoolCode !== profile.schoolCode) {
      markPgbPresenceOffline(currentUser).catch(() => {});
    }

    setCurrentUser(profile);
    markPgbPresenceOnline(profile).catch(() => {});
    setViewMode('portal');
    setPortalTab('dashboard');
    recordAuditLog(
      'Log Masuk Sekolah Ahli',
      `PGB ${profile.fullName} dari ${liveSchool.name} (${liveSchool.state}) telah log masuk ke Portal Ahli.`
    );
  };

  const getPresenceKeyForUser = (user: UserProfile | null) => {
    if (!user) return { schoolCode: '', presenceKey: '' };
    const schoolCode = (
      user.schoolCode ||
      user.membershipNo?.replace('MPGB-2026-', '') ||
      user.uid ||
      ''
    ).trim();
    const presenceKey = schoolCode.replace(/[^a-zA-Z0-9_-]/g, '_') || user.uid;
    return { schoolCode, presenceKey };
  };

  const markPgbPresenceOnline = async (user: UserProfile) => {
    const { schoolCode, presenceKey } = getPresenceKeyForUser(user);
    if (!schoolCode || !presenceKey) return;

    const payload = {
      id: presenceKey,
      uid: user.uid,
      fullName: user.fullName || 'Ahli PGB MPGBSIM',
      position: user.position || 'Pengetua / Guru Besar',
      school: user.school || 'Sekolah Ahli MPGBSIM',
      schoolCode,
      state: user.state || 'Malaysia',
      avatarUrl: user.photoURL || user.logoUrl || '',
      lastActiveAt: new Date().toISOString(),
      statusText: 'Dalam Talian' as const,
    };

    try {
      const saved = safeLocalStorageGet('mpgbsim_pgb_chat_presence_v1');
      const map = saved ? JSON.parse(saved) : {};
      map[schoolCode] = payload;
      safeLocalStorageSet('mpgbsim_pgb_chat_presence_v1', JSON.stringify(map));
    } catch {}

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mpgbsim_pgb_live_chat');
        bc.postMessage({ type: 'PRESENCE_ONLINE', schoolCode, presenceKey, presence: payload });
        bc.close();
      }
    } catch {}

    if (!isFirestoreQuotaExceeded()) {
      try {
        await setDoc(doc(db, 'pgbChatPresence', presenceKey), payload, { merge: true });
      } catch {}
    }
  };

  const markPgbPresenceOffline = async (user: UserProfile | null) => {
    const { schoolCode, presenceKey } = getPresenceKeyForUser(user);
    if (!schoolCode && !presenceKey) return;

    try {
      const saved = safeLocalStorageGet('mpgbsim_pgb_chat_presence_v1');
      if (saved) {
        const map = JSON.parse(saved);
        delete map[schoolCode];
        delete map[schoolCode.toUpperCase()];
        Object.keys(map).forEach((k) => {
          if (
            k.trim().toUpperCase() === schoolCode.toUpperCase() ||
            map[k]?.id === presenceKey
          ) {
            delete map[k];
          }
        });
        safeLocalStorageSet('mpgbsim_pgb_chat_presence_v1', JSON.stringify(map));
      }
    } catch {}

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('mpgbsim_pgb_live_chat');
        bc.postMessage({ type: 'PRESENCE_OFFLINE', schoolCode, presenceKey });
        bc.close();
      }
    } catch {}

    if (!isFirestoreQuotaExceeded() && presenceKey) {
      try {
        await deleteDoc(doc(db, 'pgbChatPresence', presenceKey));
      } catch {
        try {
          await setDoc(
            doc(db, 'pgbChatPresence', presenceKey),
            {
              id: presenceKey,
              schoolCode,
              statusText: 'Luar Talian',
              lastActiveAt: '1970-01-01T00:00:00.000Z',
            },
            { merge: true }
          );
        } catch {}
      }
    }
  };

  // Keep logged-in PGB presence active in real-time and clean up on tab close / logout
  useEffect(() => {
    if (!currentUser) return;
    markPgbPresenceOnline(currentUser).catch(() => {});
    const timer = window.setInterval(() => {
      markPgbPresenceOnline(currentUser).catch(() => {});
    }, 25000);

    const handleBeforeUnload = () => {
      markPgbPresenceOffline(currentUser).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser?.uid, currentUser?.schoolCode]);

  const logoutPortal = async () => {
    const outgoingUser = currentUser;
    setCurrentUser(null);
    await markPgbPresenceOffline(outgoingUser);
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    recordAuditLog('Log Keluar Portal', `Pengguna ${outgoingUser?.fullName || 'Ahli'} telah log keluar.`);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    let baseUser = currentUser;
    if (!baseUser) {
      baseUser = {
        uid: 'user-' + Date.now(),
        email: updates.email || updates.pgbEmail || 'abdulqayyumyaakop@imuslehmelaka.edu.my',
        fullName: updates.fullName || 'Ustaz Abdul Qayyum bin Yaakop',
        role: 'MEMBER',
        position: updates.position || 'Guru Besar',
        school: updates.school || 'Sekolah Rendah Islam I Musleh',
        schoolType: (updates.schoolType as any) || 'Rakan Musleh',
        state: updates.state || 'Melaka',
        status: 'active',
        membershipNo: 'MPGB-2026-MJAC011',
        joinYear: 2026,
        serviceStartYear: updates.serviceStartYear || 2018,
        pgbStartYear: updates.pgbStartYear || 2018,
      };
    }

    // Safety: Member cannot change their own role or status
    const safeUpdates = { ...updates };
    if (baseUser.role !== 'ADMIN') {
      delete safeUpdates.role;
      delete safeUpdates.status;
      delete safeUpdates.membershipNo;
    }

    // Compress any oversized base64 data URLs to protect Firestore 1MB document limit and localStorage quotas
    if (safeUpdates.schoolPhotoUrl) {
      safeUpdates.schoolPhotoUrl = await compressDataUrl(safeUpdates.schoolPhotoUrl, 800, 500, 0.70);
    }
    if (safeUpdates.photoURL) {
      safeUpdates.photoURL = await compressDataUrl(safeUpdates.photoURL, 360, 360, 0.72);
    }
    if (safeUpdates.logoUrl) {
      safeUpdates.logoUrl = await compressDataUrl(safeUpdates.logoUrl, 260, 260, 0.75);
    }

    const updated: UserProfile = {
      ...baseUser,
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser(updated);
    safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));

    recordAuditLog('Kemas Kini Profil', `Mengemas kini maklumat profil peribadi.`);

    try {
      await updateDoc(doc(db, 'users', updated.uid), safeUpdates);
    } catch (e) {
      // local updated
    }

    // Sync to schools collection in Firestore so website directory reflects updated principal & school data
    try {
      const snap = await getDocs(collection(db, 'schools'));
      snap.forEach((d) => {
        const sch = d.data() as MemberSchool;
        const matchCode = Boolean(
          sch.code &&
            ((currentUser.schoolCode && sch.code.trim().toUpperCase() === currentUser.schoolCode.trim().toUpperCase()) ||
              (currentUser.membershipNo && currentUser.membershipNo.toUpperCase().includes(sch.code.toUpperCase())))
        );
        const isPrimaryUser = Boolean(
          currentUser.membershipNo?.includes('MJAC011') ||
          currentUser.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
          (currentUser.school?.toLowerCase().includes('rendah') && currentUser.school?.toLowerCase().includes('musleh'))
        );
        const isSecondaryUser = Boolean(
          currentUser.membershipNo?.includes('JAIM/SAS') ||
          currentUser.membershipNo?.includes('MIA1009') ||
          currentUser.email === 'smimmelaka@gmail.com' ||
          (currentUser.school?.toLowerCase().includes('menengah') && currentUser.school?.toLowerCase().includes('musleh'))
        );
        const matchMusleh = Boolean(
          (isPrimaryUser && (sch.code === 'MJAC011' || sch.id === 'sch-musleh-1')) ||
          (isSecondaryUser && (sch.code === 'JAIM/SAS(M)130' || sch.code === 'MIA1009' || sch.id === 'sch-musleh-menengah-1' || sch.email === 'smimmelaka@gmail.com'))
        );
        const matchPgbEmail = Boolean(
          sch.pgbEmail && currentUser.email && sch.pgbEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
        );
        const matchExactName = Boolean(
          sch.name && currentUser.school && sch.name.trim().toLowerCase() === currentUser.school.trim().toLowerCase()
        );
        const isMatchedSchool = matchCode || matchMusleh || (matchExactName && (matchPgbEmail || !sch.pgbEmail)) || matchPgbEmail;

        if (isMatchedSchool) {
          updateDoc(doc(db, 'schools', d.id), {
            ...(safeUpdates.fullName ? { principal: safeUpdates.fullName } : {}),
            ...(safeUpdates.position ? { designation: safeUpdates.position } : {}),
            ...(safeUpdates.icNumber !== undefined ? { icNumber: safeUpdates.icNumber } : {}),
            ...(safeUpdates.school ? { name: safeUpdates.school } : {}),
            ...(safeUpdates.schoolCode ? { code: safeUpdates.schoolCode } : {}),
            ...(safeUpdates.schoolType ? { type: safeUpdates.schoolType } : {}),
            ...(safeUpdates.membershipType ? { membershipType: safeUpdates.membershipType } : {}),
            ...(safeUpdates.state ? { state: safeUpdates.state } : {}),
            ...(safeUpdates.district ? { district: safeUpdates.district } : {}),
            ...(safeUpdates.address ? { address: safeUpdates.address } : {}),
            ...(safeUpdates.schoolPhone ? { phone: safeUpdates.schoolPhone } : {}),
            ...(safeUpdates.schoolEmail ? { email: safeUpdates.schoolEmail } : {}),
            ...(safeUpdates.phone ? { pgbPhone: safeUpdates.phone } : {}),
            ...(safeUpdates.pgbEmail ? { pgbEmail: safeUpdates.pgbEmail } : {}),
            ...(safeUpdates.studentCount !== undefined ? { studentCount: safeUpdates.studentCount } : {}),
            ...(safeUpdates.teacherCount !== undefined ? { teacherCount: safeUpdates.teacherCount } : {}),
            ...(safeUpdates.website ? { website: safeUpdates.website } : {}),
            ...(safeUpdates.photoURL ? { principalPhotoUrl: safeUpdates.photoURL } : {}),
            ...(safeUpdates.logoUrl ? { logoUrl: safeUpdates.logoUrl } : {}),
            ...(safeUpdates.schoolPhotoUrl ? { schoolPhotoUrl: safeUpdates.schoolPhotoUrl } : {}),
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        }
      });
    } catch (e) {}

    // Also update local storage CMS cache (v3 only) and trigger website refresh
    try {
      const key = 'mpgbsim_cms_content_v3';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.memberSchools) {
          parsed.memberSchools = parsed.memberSchools.map((s: MemberSchool) => {
            const matchCode = Boolean(
              s.code &&
                ((currentUser.schoolCode && s.code.trim().toUpperCase() === currentUser.schoolCode.trim().toUpperCase()) ||
                  (currentUser.membershipNo && currentUser.membershipNo.toUpperCase().includes(s.code.toUpperCase())))
            );
            const isPrimaryUser = Boolean(
              currentUser.membershipNo?.includes('MJAC011') ||
              currentUser.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
              (currentUser.school?.toLowerCase().includes('rendah') && currentUser.school?.toLowerCase().includes('musleh'))
            );
            const isSecondaryUser = Boolean(
              currentUser.membershipNo?.includes('JAIM/SAS') ||
              currentUser.membershipNo?.includes('MIA1009') ||
              currentUser.email === 'smimmelaka@gmail.com' ||
              (currentUser.school?.toLowerCase().includes('menengah') && currentUser.school?.toLowerCase().includes('musleh'))
            );
            const matchMusleh = Boolean(
              (isPrimaryUser && (s.code === 'MJAC011' || s.id === 'sch-musleh-1')) ||
              (isSecondaryUser && (s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.email === 'smimmelaka@gmail.com'))
            );
            const matchPgbEmail = Boolean(
              s.pgbEmail && currentUser.email && s.pgbEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
            );
            const matchExactName = Boolean(
              s.name && currentUser.school && s.name.trim().toLowerCase() === currentUser.school.trim().toLowerCase()
            );
            const isMatchedSchool = matchCode || matchMusleh || (matchExactName && (matchPgbEmail || !s.pgbEmail)) || matchPgbEmail;

            if (isMatchedSchool) {
              return {
                ...s,
                ...(safeUpdates.fullName ? { principal: safeUpdates.fullName } : {}),
                ...(safeUpdates.position ? { designation: safeUpdates.position } : {}),
                ...(safeUpdates.icNumber !== undefined ? { icNumber: safeUpdates.icNumber } : {}),
                ...(safeUpdates.school ? { name: safeUpdates.school } : {}),
                ...(safeUpdates.schoolCode ? { code: safeUpdates.schoolCode } : {}),
                ...(safeUpdates.schoolType ? { type: safeUpdates.schoolType } : {}),
                ...(safeUpdates.membershipType ? { membershipType: safeUpdates.membershipType } : {}),
                ...(safeUpdates.state ? { state: safeUpdates.state } : {}),
                ...(safeUpdates.district ? { district: safeUpdates.district } : {}),
                ...(safeUpdates.address ? { address: safeUpdates.address } : {}),
                ...(safeUpdates.schoolPhone ? { phone: safeUpdates.schoolPhone } : {}),
                ...(safeUpdates.schoolEmail ? { email: safeUpdates.schoolEmail } : {}),
                ...(safeUpdates.phone ? { pgbPhone: safeUpdates.phone } : {}),
                ...(safeUpdates.pgbEmail ? { pgbEmail: safeUpdates.pgbEmail } : {}),
                ...(safeUpdates.studentCount !== undefined ? { studentCount: safeUpdates.studentCount } : {}),
                ...(safeUpdates.teacherCount !== undefined ? { teacherCount: safeUpdates.teacherCount } : {}),
                ...(safeUpdates.website ? { website: safeUpdates.website } : {}),
                ...(safeUpdates.photoURL ? { principalPhotoUrl: safeUpdates.photoURL } : {}),
                ...(safeUpdates.logoUrl ? { logoUrl: safeUpdates.logoUrl } : {}),
                ...(safeUpdates.schoolPhotoUrl ? { schoolPhotoUrl: safeUpdates.schoolPhotoUrl } : {}),
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          });
          safeLocalStorageSet(key, JSON.stringify(parsed));
        }
      }
      safeLocalStorageRemove('mpgbsim_cms_content');
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}
  };

  const changeUserPassword = async (
    newPassword: string,
    oldPassword?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      throw new Error('Sila log masuk terlebih dahulu untuk menukar kata laluan.');
    }
    const cleanPass = (newPassword || '').trim();
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('Kata laluan baharu mestilah sekurang-kurangnya 6 aksara.');
    }

    // 1. Try Firebase Auth updatePassword if auth.currentUser exists
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, cleanPass);
      } catch (authErr: any) {
        console.warn(
          'Firebase Auth updatePassword notice (continuing with database credentials sync):',
          authErr.message
        );
      }
    }

    // 2. Update user profile document in Firestore
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          portalPassword: cleanPass,
          passwordUpdatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('User document password sync notice:', e);
    }

    // 3. Update school document in Firestore if school matches
    const isPrimaryUser = Boolean(
      currentUser.membershipNo?.includes('MJAC011') ||
      currentUser.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      (currentUser.school?.toLowerCase().includes('rendah') && currentUser.school?.toLowerCase().includes('musleh'))
    );
    const isSecondaryUser = Boolean(
      currentUser.membershipNo?.includes('JAIM/SAS') ||
      currentUser.membershipNo?.includes('MIA1009') ||
      currentUser.email === 'smimmelaka@gmail.com' ||
      (currentUser.school?.toLowerCase().includes('menengah') && currentUser.school?.toLowerCase().includes('musleh'))
    );

    let targetDocId: string | null = null;
    try {
      const snap = await getDocs(collection(db, 'schools'));
      snap.forEach((d) => {
        const sch = d.data() as MemberSchool;
        const matchCode = Boolean(
          sch.code &&
            ((currentUser.schoolCode && sch.code.trim().toUpperCase() === currentUser.schoolCode.trim().toUpperCase()) ||
              (currentUser.membershipNo && currentUser.membershipNo.toUpperCase().includes(sch.code.toUpperCase())))
        );
        const matchExactName = Boolean(
          sch.name && currentUser.school && sch.name.trim().toLowerCase() === currentUser.school.trim().toLowerCase()
        );
        const matchPgbEmail = Boolean(
          sch.pgbEmail && currentUser.email && sch.pgbEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
        );
        const isMuslehMatch = Boolean(
          (isPrimaryUser && (d.id === 'sch-musleh-1' || sch.code === 'MJAC011')) ||
          (isSecondaryUser && (d.id === 'sch-musleh-menengah-1' || sch.code === 'JAIM/SAS(M)130' || sch.code === 'MIA1009' || sch.email === 'smimmelaka@gmail.com'))
        );
        if (matchCode || isMuslehMatch || (matchExactName && (matchPgbEmail || !sch.pgbEmail)) || matchPgbEmail) {
          targetDocId = d.id;
        }
      });

      if (targetDocId) {
        await updateDoc(doc(db, 'schools', targetDocId), {
          password: cleanPass,
          passwordUpdatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Schools collection password sync notice:', e);
    }

    // 4. Update React state currentUser & local storage
    const updatedUser: UserProfile = {
      ...currentUser,
      portalPassword: cleanPass,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));

    // 5. Update registeredSchools in MemberPortalContext React state
    setRegisteredSchools((prev) =>
      prev.map((s) => {
        if (
          targetDocId === s.id ||
          (s.email && s.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
          (s.name && s.name.toLowerCase() === currentUser.school?.toLowerCase()) ||
          (currentUser.membershipNo && s.code && currentUser.membershipNo.includes(s.code))
        ) {
          return { ...s, password: cleanPass };
        }
        return s;
      })
    );

    // 6. Update local storage CMS school list cache (v3 only)
    try {
      const key = 'mpgbsim_cms_content_v3';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.memberSchools) {
          parsed.memberSchools = parsed.memberSchools.map((s: MemberSchool) => {
            if (
              (s.email && s.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
              (s.name && s.name.toLowerCase() === currentUser.school?.toLowerCase()) ||
              (isPrimaryUser && (s.code === 'MJAC011' || s.id === 'sch-musleh-1')) ||
              (isSecondaryUser && (s.code === 'JAIM/SAS(M)130' || s.code === 'MIA1009' || s.id === 'sch-musleh-menengah-1' || s.email === 'smimmelaka@gmail.com'))
            ) {
              return { ...s, password: cleanPass };
            }
            return s;
          });
          safeLocalStorageSet(key, JSON.stringify(parsed));
        }
      }
      safeLocalStorageRemove('mpgbsim_cms_content');
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}

    recordAuditLog(
      'Tukar Kata Laluan',
      `Pengguna ${currentUser.fullName} (${currentUser.email || currentUser.school}) telah berjaya menukar kata laluan log masuk.`
    );

    return {
      success: true,
      message:
        'Kata laluan log masuk anda telah berjaya dikemas kini dan disimpan! Anda boleh log masuk menggunakan kata laluan baharu ini pada bila-bila masa.',
    };
  };

  const createAnnouncement = async (announcementData: Omit<AnnouncementItem, 'id'>) => {
    const id = (announcementData as any).id || `ann-${Date.now()}`;
    const newAnn: AnnouncementItem = {
      ...announcementData,
      id,
      date: announcementData.date || new Date().toISOString().split('T')[0],
      status: announcementData.status || 'published',
    };
    const sanitizedAnn = Object.fromEntries(
      Object.entries(newAnn).filter(([_, v]) => v !== undefined)
    ) as AnnouncementItem;

    setAnnouncements((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      return [sanitizedAnn, ...filtered];
    });
    recordAuditLog('Cipta Pengumuman', `Mencipta pengumuman baharu: "${sanitizedAnn.title}"`);

    try {
      await setDoc(doc(db, 'announcements', id), sanitizedAnn, { merge: true });
      localStorage.setItem('mpgbsim_announcements_seeded', 'true');
    } catch (e) {
      console.warn('Firestore createAnnouncement notice:', e);
    }
    try {
      window.dispatchEvent(new Event('mpgbsim_announcements_updated'));
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}
  };

  const updateAnnouncement = async (id: string, updates: Partial<AnnouncementItem>) => {
    const sanitizedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...sanitizedUpdates } : a)));
    recordAuditLog('Kemas Kini Pengumuman', `Mengemas kini pengumuman ID: ${id}`);

    try {
      await setDoc(doc(db, 'announcements', id), sanitizedUpdates, { merge: true });
      localStorage.setItem('mpgbsim_announcements_seeded', 'true');
    } catch (e) {
      console.warn('Firestore updateAnnouncement notice:', e);
    }
    try {
      window.dispatchEvent(new Event('mpgbsim_announcements_updated'));
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}
  };

  const deleteAnnouncement = async (id: string) => {
    localStorage.setItem('mpgbsim_announcements_seeded', 'true');
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    recordAuditLog('Padam Pengumuman', `Memadam pengumuman ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (e) {
      console.warn('Firestore deleteAnnouncement notice:', e);
    }
    try {
      window.dispatchEvent(new Event('mpgbsim_announcements_updated'));
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}
  };

  const registerForProgram = (programId: string) => {
    if (!registeredProgramIds.includes(programId)) {
      setRegisteredProgramIds((prev) => [...prev, programId]);
      recordAuditLog('Pendaftaran Program', `Mendaftar untuk program ID: ${programId}`);

      // Add positive notification
      const notif: PortalNotification = {
        id: `notif-${Date.now()}`,
        userId: currentUser?.uid || 'all',
        title: 'Pendaftaran Program Berjaya',
        message: 'Pengesahan pendaftaran anda telah disimpan. Sila semak emel atau tab Program untuk butiran lanjut.',
        type: 'program',
        date: new Date().toISOString(),
        read: false,
        linkTab: 'program',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const submitBestPractice = async (practiceData: Omit<BestPracticeItem, 'id'>) => {
    const id = `bp-${Date.now()}`;
    const newPractice: BestPracticeItem = {
      ...practiceData,
      id,
      author: currentUser?.fullName || practiceData.author || 'Ahli PGB',
      authorId: currentUser?.uid,
      submittedDate: new Date().toISOString().split('T')[0],
      status: practiceData.status || 'Submitted',
    };
    setBestPractices((prev) => [newPractice, ...prev]);
    recordAuditLog('Submisi Amalan Terbaik', `Menghantar amalan terbaik: "${newPractice.title}"`);

    // Add submission notification
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.uid || 'all',
      title: 'Amalan Terbaik Dihantar',
      message: `Submisi "${newPractice.title}" telah diterima dan dihantar kepada urus setia untuk semakan.`,
      type: 'submission',
      date: new Date().toISOString(),
      read: false,
      linkTab: 'best-practice',
    };
    setNotifications((prev) => [notif, ...prev]);

    try {
      await setDoc(doc(db, 'bestPractices', id), newPractice);
      await setDoc(doc(db, 'practices', id), newPractice);
    } catch (e) {}
  };

  const submitMemberForm = async (subData: Omit<MemberSubmission, 'id'>) => {
    const id = `sub-${Date.now()}`;
    const newSub: MemberSubmission = {
      ...subData,
      id,
      submitter: currentUser?.fullName || subData.submitter,
      submitterId: currentUser?.uid,
      submitterEmail: currentUser?.email || subData.submitterEmail,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    };
    setSubmissions((prev) => [newSub, ...prev]);
    recordAuditLog('Submisi Bahan Ahli', `Menghantar permohonan/bahan jenis: ${newSub.type} - "${newSub.title}"`);

    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.uid || 'all',
      title: 'Bahan Berjaya Dihantar',
      message: `Bahan jenis "${newSub.type}" bertajuk "${newSub.title}" telah direkodkan.`,
      type: 'submission',
      date: new Date().toISOString(),
      read: false,
      linkTab: 'kongsi-amalan',
    };
    setNotifications((prev) => [notif, ...prev]);

    try {
      await setDoc(doc(db, 'submissions', id), newSub);
    } catch (e) {}
  };

  const reviewBestPractice = async (
    id: string,
    status: BestPracticeItem['status'],
    reason?: string
  ) => {
    setBestPractices((prev) =>
      prev.map((bp) => (bp.id === id ? { ...bp, status, rejectionReason: reason } : bp))
    );
    recordAuditLog('Semakan Amalan Terbaik', `Mengemas kini status amalan terbaik ID ${id} kepada: ${status}`);

    try {
      await updateDoc(doc(db, 'bestPractices', id), { status, rejectionReason: reason || null });
    } catch (e) {}

    try {
      await updateDoc(doc(db, 'practices', id), { status, rejectionReason: reason || null });
    } catch (e) {}
  };

  const reviewSubmission = async (
    id: string,
    status: MemberSubmission['status'],
    reason?: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              rejectionReason: reason,
              reviewedBy: currentUser?.fullName,
              reviewedAt: new Date().toISOString(),
            }
          : s
      )
    );
    recordAuditLog('Semakan Submisi Ahli', `Mengemas kini status submisi ID ${id} kepada: ${status}`);

    try {
      await updateDoc(doc(db, 'submissions', id), {
        status,
        rejectionReason: reason || null,
        reviewedBy: currentUser?.fullName,
        reviewedAt: new Date().toISOString(),
      });
    } catch (e) {}
  };

  const addDocument = async (docData: Omit<PortalDocument, 'id'>) => {
    const id = `doc-${Date.now()}`;
    const newDoc: PortalDocument = { ...docData, id, uploadDate: new Date().toISOString().split('T')[0] };
    setDocuments((prev) => [newDoc, ...prev]);
    recordAuditLog('Muat Naik Dokumen', `Memuat naik dokumen baharu: "${newDoc.title}"`);

    try {
      await setDoc(doc(db, 'documents', id), newDoc);
    } catch (e) {}
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    recordAuditLog('Padam Dokumen', `Memadam dokumen ID: ${id}`);
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (e) {}
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {});
    } catch (e) {}
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const submitSchoolNews = async (newsInput: {
    title: string;
    summary: string;
    content: string;
    category?: string;
    achievementLevel?: string;
    imageUrl?: string;
    featured?: boolean;
    status?: 'published' | 'draft';
    schoolName?: string;
    schoolCode?: string;
    state?: string;
    date?: string;
  }): Promise<NewsItem> => {
    await ensureFirebaseAuth();
    const id = `news-pgb-${Date.now()}`;
    const now = new Date();
    const dateFormatted = newsInput.date?.trim() || formatToMalayDate(now);

    const authorName = currentUser?.fullName || 'Pengetua / Guru Besar';
    const schoolName = newsInput.schoolName || currentUser?.school || 'Sekolah Ahli MPGBSIM';
    const schoolCode = newsInput.schoolCode || currentUser?.membershipNo || '';
    const state = newsInput.state || currentUser?.state || 'Malaysia';
    const readMinutes = Math.max(1, Math.ceil(newsInput.content.split(/\s+/).length / 180));

    const newNewsItem: NewsItem = {
      id,
      title: newsInput.title.trim(),
      slug: newsInput.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      summary: newsInput.summary.trim(),
      content: newsInput.content.trim(),
      category: newsInput.category || 'Kejayaan Sekolah',
      date: dateFormatted,
      author: `${authorName} (${schoolName})`,
      readTime: `${readMinutes} min bacaan`,
      imageUrl:
        newsInput.imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=1200',
      featured: Boolean(newsInput.featured),
      status: newsInput.status || 'published',
      schoolName,
      schoolCode,
      state,
      submittedBy: currentUser?.email || currentUser?.uid || 'pgb-member',
      isSchoolAchievement: true,
      achievementLevel: newsInput.achievementLevel || 'Kebangsaan',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // 1. Direct write to Firestore 'news' collection (which updates the live website immediately)
    try {
      await setDoc(doc(db, 'news', id), newNewsItem, { merge: true });
    } catch (err) {
      console.warn('Firestore direct news write notice:', err);
    }

    // 2. Also register into 'submissions' collection for official institutional records
    try {
      const subId = `sub-news-${Date.now()}`;
      await setDoc(doc(db, 'submissions', subId), {
        id: subId,
        submitter: authorName,
        submitterEmail: currentUser?.email || 'pgb@mpgbsim.edu.my',
        school: schoolName,
        type: 'Berita sekolah',
        title: newNewsItem.title,
        content: newNewsItem.summary,
        date: now.toISOString().split('T')[0],
        status: newNewsItem.status === 'published' ? 'Published' : 'Draft',
        achievementLevel: newNewsItem.achievementLevel,
        newsId: id,
      });
    } catch (e) {
      console.warn('Submissions record notice:', e);
    }

    // 3. Update local state immediately, sorted by published date
    setSchoolNews((prev) => sortNewsByPublishedDate([newNewsItem, ...prev.filter((n) => n.id !== id)]));

    // 4. Log audit and send portal notification
    recordAuditLog(
      'Siaran Berita Kejayaan PGB',
      `PGB ${authorName} (${schoolName}) menerbitkan berita kejayaan "${newNewsItem.title}" secara langsung ke laman web MPGBSIM.`
    );

    const newNotif: PortalNotification = {
      id: `notif-news-${Date.now()}`,
      userId: currentUser?.uid || 'all',
      title: 'Berita Kejayaan Sekolah Diterbitkan!',
      message: `Berita kejayaan "${newNewsItem.title}" kini telah disiarkan secara langsung di laman utama MPGBSIM.`,
      type: 'submission',
      date: 'Hari ini',
      read: false,
      linkTab: 'kejayaan-sekolah',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // 5. Dispatch sync event for cross-component awareness
    window.dispatchEvent(
      new CustomEvent('mpgbsim_content_updated', {
        detail: { type: 'news', newsItem: newNewsItem },
      })
    );

    return newNewsItem;
  };

  const updateSchoolNews = async (id: string, updates: Partial<NewsItem>): Promise<void> => {
    await ensureFirebaseAuth();
    try {
      await updateDoc(doc(db, 'news', id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      setSchoolNews((prev) =>
        sortNewsByPublishedDate(
          prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
        )
      );
      recordAuditLog('Kemas Kini Berita Kejayaan', `Berita #${id} telah dikemas kini.`);
      window.dispatchEvent(new CustomEvent('mpgbsim_content_updated', { detail: { id, updates } }));
    } catch (err) {
      console.warn('Update news error:', err);
      setSchoolNews((prev) =>
        sortNewsByPublishedDate(
          prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
        )
      );
    }
  };

  const deleteSchoolNews = async (id: string): Promise<void> => {
    await ensureFirebaseAuth();
    try {
      await deleteDoc(doc(db, 'news', id));
      setSchoolNews((prev) => prev.filter((n) => n.id !== id));
      recordAuditLog('Padam Berita Kejayaan', `Berita #${id} telah dipadam.`);
      window.dispatchEvent(new CustomEvent('mpgbsim_content_updated', { detail: { deletedNewsId: id } }));
    } catch (err) {
      console.warn('Delete news error:', err);
      setSchoolNews((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const recordFeePayment = async (
    paymentInput: Omit<FeePaymentRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FeePaymentRecord> => {
    await ensureFirebaseAuth();
    const id = `pay-${Date.now()}`;
    const newRecord: FeePaymentRecord = {
      ...paymentInput,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'feePayments', id), newRecord);
    } catch (err) {
      console.warn('Save fee payment to Firestore error:', err);
    }

    setFeePayments((prev) => {
      const updated = [newRecord, ...prev.filter((p) => p.id !== id)];
      safeLocalStorageSet('mpgbsim_fee_payments', JSON.stringify(updated));
      return updated;
    });

    recordAuditLog(
      'Pembayaran Yuran Keahlian',
      `Yuran ${newRecord.categoryLabel} (Ref: ${newRecord.transactionRef}) bernilai RM ${newRecord.amount} direkodkan.`
    );

    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.uid || 'all',
      title: 'Pembayaran Yuran Direkodkan',
      message: `Resit rujukan ${newRecord.transactionRef} bagi ${newRecord.categoryLabel} (RM ${newRecord.amount}) telah disimpan.`,
      type: 'info',
      date: new Date().toISOString(),
      read: false,
      linkTab: 'yuran',
    };
    setNotifications((prev) => [notif, ...prev]);

    window.dispatchEvent(
      new CustomEvent('mpgbsim_content_updated', { detail: { feePayment: newRecord } })
    );

    return newRecord;
  };

  const updateFeePaymentStatus = async (
    id: string,
    status: 'BERJAYA' | 'DALAM_SEMAKAN' | 'DIBATALKAN'
  ): Promise<void> => {
    await ensureFirebaseAuth();
    try {
      await updateDoc(doc(db, 'feePayments', id), {
        status,
        updatedAt: new Date().toISOString(),
        verifiedAt: status === 'BERJAYA' ? new Date().toISOString() : undefined,
        verifiedBy: status === 'BERJAYA' ? (currentUser?.fullName || 'Bendahari Kehormat MPGBSIM') : undefined,
      });
    } catch (err) {
      console.warn('Update fee payment status error:', err);
    }

    setFeePayments((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              updatedAt: new Date().toISOString(),
              verifiedAt: status === 'BERJAYA' ? new Date().toISOString() : p.verifiedAt,
              verifiedBy: status === 'BERJAYA' ? (currentUser?.fullName || 'Bendahari Kehormat MPGBSIM') : p.verifiedBy,
            }
          : p
      );
      safeLocalStorageSet('mpgbsim_fee_payments', JSON.stringify(updated));
      return updated;
    });

    recordAuditLog('Status Yuran Dikemas Kini', `Status bayaran #${id} ditukar kepada ${status}.`);
  };

  const deleteFeePayment = async (id: string): Promise<void> => {
    await ensureFirebaseAuth();
    try {
      await deleteDoc(doc(db, 'feePayments', id));
    } catch (err) {
      console.warn('Delete fee payment error:', err);
    }
    setFeePayments((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      safeLocalStorageSet('mpgbsim_fee_payments', JSON.stringify(updated));
      return updated;
    });
    recordAuditLog('Padam Rekod Yuran', `Rekod pembayaran #${id} dipadam.`);
  };

  return (
    <MemberPortalContext.Provider
      value={{
        currentUser,
        currentRole,
        viewMode,
        setViewMode,
        portalTab,
        setPortalTab,
        portalSubTab,
        setPortalSubTab,
        announcements,
        documents,
        bestPractices,
        submissions,
        notifications,
        auditLogs,
        registeredProgramIds,
        registeredSchools,
        schools: registeredSchools,
        getLatestRegisteredSchools,
        schoolNews,
        unreadNotificationsCount,
        isNotificationOpen,
        setIsNotificationOpen,
        loginWithGoogle,
        loginWithEmail,
        loginWithEmailPassword: loginWithEmail,
        loginAsMemberSchool,
        logoutPortal,
        logout: logoutPortal,
        switchDemoRole,
        updateUserProfile,
        changeUserPassword,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        registerForProgram,
        submitBestPractice,
        submitMemberForm,
        reviewBestPractice,
        reviewSubmission,
        addDocument,
        deleteDocument,
        markNotificationRead,
        markNotificationAsRead: markNotificationRead,
        markAllNotificationsRead,
        markAllNotificationsAsRead: markAllNotificationsRead,
        recordAuditLog,
        submitSchoolNews,
        updateSchoolNews,
        deleteSchoolNews,
        feePayments,
        recordFeePayment,
        updateFeePaymentStatus,
        deleteFeePayment,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </MemberPortalContext.Provider>
  );
};

export const useMemberPortal = () => {
  const context = useContext(MemberPortalContext);
  if (!context) {
    throw new Error('useMemberPortal must be used within a MemberPortalProvider');
  }
  return context;
};
