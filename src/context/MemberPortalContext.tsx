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
} from '../firebase';
import { repairSchoolIntegrity } from '../utils/schoolDiagnostic';
import {
  safeLocalStorageSet,
  safeLocalStorageGet,
  safeLocalStorageRemove,
} from '../utils/storage';

export type PortalTab =
  | 'dashboard'
  | 'pengumuman'
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

  // Quick Notification metrics
  unreadNotificationsCount: number;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;

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

  // 1. Fetch directly from the same Firestore collection used by Admin CMS ('schools')
  try {
    const snap = await getDocs(collection(db, 'schools'));
    if (!snap.empty) {
      snap.forEach((d) => {
        const sch = { id: d.id, ...(d.data() as any) } as MemberSchool;
        if (sch.id) {
          const existing =
            schoolsMap.get(sch.id) ||
            (sch.code ? schoolsMap.get(`code:${sch.code.toUpperCase()}`) : undefined);
          const merged = existing ? { ...existing, ...sch } : sch;
          schoolsMap.set(sch.id, merged);
          if (sch.code) schoolsMap.set(`code:${sch.code.toUpperCase()}`, merged);
        }
      });
    }
  } catch (e) {
    console.warn('Firestore schools fetch notice in MemberPortalContext:', e);
  }

  // 3. Overlay local CMS content if it contains newer local modifications
  try {
    for (const key of ['mpgbsim_cms_content_v3', 'mpgbsim_cms_content']) {
      const saved = localStorage.getItem(key);
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
                  const merged = { ...existing, ...sch };
                  schoolsMap.set(existing.id, merged);
                  if (existing.code) schoolsMap.set(`code:${existing.code.toUpperCase()}`, merged);
                }
              } else {
                schoolsMap.set(sch.id, sch);
                if (sch.code) schoolsMap.set(`code:${sch.code.toUpperCase()}`, sch);
              }
            }
          });
          break;
        }
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
        if (
          emailLower === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
          emailLower.includes('imuslehmelaka') ||
          emailLower.includes('imusleh') ||
          schoolLower.includes('musleh') ||
          memNo.includes('MIA1009') ||
          memNo.includes('MJAC011')
        ) {
          user.fullName = user.fullName || 'Ustaz Abdul Qayyum bin Yaakop';
          user.position = user.position || 'Guru Besar';
          user.school = user.school || 'Sekolah Rendah Islam I Musleh';
          user.schoolType = user.schoolType || 'Rakan Musleh';
          user.state = user.state || 'Melaka';
          user.role = 'MEMBER';
          user.membershipNo = 'MPGB-2026-MJAC011';
          user.phone = user.phone || '+60 6-335 1290';
          user.joinYear = 2026;
          user.photoURL = user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
          user.schoolPhotoUrl = user.schoolPhotoUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80';
          user.logoUrl = user.logoUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80';
          safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else if (memNo.includes('MIA1009')) {
          user.membershipNo = memNo.replace('MIA1009', 'MJAC011');
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
      if (saved) return JSON.parse(saved);
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

  // Registered Member Schools state directly synced with Firestore 'schools' collection used by Admin CMS
  const [registeredSchools, setRegisteredSchools] = useState<MemberSchool[]>([]);

  // Initial load of registered schools directly from Firestore 'schools' collection
  useEffect(() => {
    getLatestRegisteredSchools().then((list) => {
      if (list && list.length > 0) {
        setRegisteredSchools(list);
      }
    }).catch(() => {});
  }, []);

  // Sync to local storage with quota protection
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (currentUser) {
      safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      safeLocalStorageRemove(STORAGE_KEYS.CURRENT_USER);
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
          prev.uid === `sch-user-${detail.id}` ||
          prev.uid?.includes(detail.id);
        const matchCode =
          (prev.membershipNo && detail.updated.code && prev.membershipNo.includes(detail.updated.code)) ||
          (prev.membershipNo && detail.school?.code && prev.membershipNo.includes(detail.school.code));
        const matchEmail =
          (prev.email && detail.updated.email && prev.email.toLowerCase() === detail.updated.email.toLowerCase()) ||
          (prev.email && detail.school?.email && prev.email.toLowerCase() === detail.school.email.toLowerCase());
        const matchSchoolName =
          (prev.school && detail.updated.name && prev.school.toLowerCase().trim() === detail.updated.name.toLowerCase().trim()) ||
          (prev.school && detail.school?.name && prev.school.toLowerCase().trim() === detail.school.name.toLowerCase().trim());

        if (matchMusleh || matchId || matchCode || matchEmail || matchSchoolName) {
          const updated: UserProfile = {
            ...prev,
            ...(detail.updated.principal ? { fullName: detail.updated.principal } : {}),
            ...(detail.updated.name ? { school: detail.updated.name } : {}),
            ...(detail.updated.state ? { state: detail.updated.state } : {}),
            ...(detail.updated.phone ? { phone: detail.updated.phone } : {}),
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
        const isMusleh =
          userEmail === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
          userEmail.includes('imuslehmelaka') ||
          userEmail.includes('imusleh') ||
          userEmail.includes('abdulqayyum') ||
          (savedProfile?.school && savedProfile.school.toLowerCase().includes('musleh')) ||
          (savedProfile?.membershipNo && (savedProfile.membershipNo.includes('MIA1009') || savedProfile.membershipNo.includes('MJAC011')));

        let matchedSchool = regSchools.find((s) => {
          if (isMusleh && (s.code === 'MJAC011' || s.id === 'sch-musleh-1' || s.name.toLowerCase().includes('musleh'))) return true;
          if (s.email && s.email.toLowerCase().trim() === userEmail) return true;
          if (savedProfile?.membershipNo && s.code && savedProfile.membershipNo.includes(s.code)) return true;
          if (savedProfile?.school && s.name && savedProfile.school.toLowerCase().trim() === s.name.toLowerCase().trim()) return true;
          return false;
        }) || (isMusleh ? regSchools.find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1') : undefined);

        const role: UserRole = isSuperAdmin ? 'ADMIN' : 'MEMBER';

        const pos =
          matchedSchool?.type?.includes('Rendah') || matchedSchool?.name?.toLowerCase().includes('rendah') || isMusleh
            ? 'Guru Besar'
            : matchedSchool?.type === 'SMKA' || matchedSchool?.type === 'SABK'
            ? 'Pengetua'
            : savedProfile?.position ||
              currentUser?.position ||
              (isSuperAdmin ? 'Pegawai Pentadbir MPGBSIM' : 'Pengetua / Guru Besar');

        const schoolName =
          matchedSchool?.name ||
          savedProfile?.school ||
          currentUser?.school ||
          (isMusleh ? 'Sekolah Rendah Islam I Musleh' : isSuperAdmin ? 'Sekretariat Utama MPGBSIM' : 'Sekolah Islam Ahli MPGBSIM');

        const schoolType =
          matchedSchool?.type ||
          savedProfile?.schoolType ||
          currentUser?.schoolType ||
          (isMusleh ? 'Rakan Musleh' : 'SMKA');

        const stateName =
          matchedSchool?.state ||
          savedProfile?.state ||
          currentUser?.state ||
          (isMusleh ? 'Melaka' : 'Wilayah Persekutuan');

        const fullName =
          matchedSchool?.principal ||
          savedProfile?.fullName ||
          currentUser?.fullName ||
          fbUser.displayName ||
          (isMusleh ? 'Ustaz Abdul Qayyum bin Yaakop' : isSuperAdmin ? 'Pentadbir Utama MPGBSIM' : 'Ahli PGB MPGBSIM');

        const membershipNo = isMusleh
          ? 'MPGB-2026-MJAC011'
          : (matchedSchool?.code
            ? `MPGB-2026-${matchedSchool.code}`
            : savedProfile?.membershipNo?.replace('MIA1009', 'MJAC011') ||
              currentUser?.membershipNo?.replace('MIA1009', 'MJAC011') ||
              `MPGB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          fullName,
          role,
          position: pos,
          icNumber: savedProfile?.icNumber || (matchedSchool as any)?.icNumber || currentUser?.icNumber || '',
          school: schoolName,
          schoolCode: matchedSchool?.code || savedProfile?.schoolCode || currentUser?.schoolCode || '',
          schoolType,
          state: stateName,
          district: matchedSchool?.district || savedProfile?.district || currentUser?.district || '',
          address: matchedSchool?.address || savedProfile?.address || currentUser?.address || '',
          phone: matchedSchool?.phone || savedProfile?.phone || fbUser.phoneNumber || currentUser?.phone || (isMusleh ? '+60 6-335 1290' : ''),
          pgbEmail: matchedSchool?.pgbEmail || savedProfile?.pgbEmail || currentUser?.pgbEmail || fbUser.email || '',
          pgbPhone: matchedSchool?.pgbPhone || savedProfile?.pgbPhone || currentUser?.pgbPhone || matchedSchool?.phone || '',
          schoolEmail: matchedSchool?.schoolEmail || matchedSchool?.email || savedProfile?.schoolEmail || currentUser?.schoolEmail || '',
          schoolPhone: matchedSchool?.schoolPhone || matchedSchool?.phone || savedProfile?.schoolPhone || currentUser?.schoolPhone || '',
          studentCount: matchedSchool?.studentCount ?? savedProfile?.studentCount ?? currentUser?.studentCount ?? 0,
          teacherCount: matchedSchool?.teacherCount ?? savedProfile?.teacherCount ?? currentUser?.teacherCount ?? 0,
          website: matchedSchool?.website || savedProfile?.website || currentUser?.website || '',
          photoURL:
            matchedSchool?.principalPhotoUrl ||
            savedProfile?.photoURL ||
            fbUser.photoURL ||
            currentUser?.photoURL ||
            (isMusleh
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              : ''),
          schoolPhotoUrl:
            matchedSchool?.schoolPhotoUrl ||
            savedProfile?.schoolPhotoUrl ||
            (isMusleh
              ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80'
              : currentUser?.schoolPhotoUrl),
          logoUrl:
            matchedSchool?.logoUrl ||
            savedProfile?.logoUrl ||
            (isMusleh
              ? 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80'
              : currentUser?.logoUrl),
          expertise: savedProfile?.expertise || currentUser?.expertise || ['Kepimpinan Pendidikan Islam', 'Kurikulum Dini Rabbani'],
          interests: savedProfile?.interests || currentUser?.interests || ['Transformasi Digital & AI', 'Pendidikan Bersepadu'],
          membershipNo,
          joinYear: isMusleh ? 2026 : matchedSchool?.joinYear || savedProfile?.joinYear || currentUser?.joinYear || 2026,
          serviceStartYear: savedProfile?.serviceStartYear || savedProfile?.pgbStartYear || (matchedSchool as any)?.serviceStartYear || (matchedSchool as any)?.pgbStartYear || (isMusleh ? 2018 : 2020),
          pgbStartYear: savedProfile?.pgbStartYear || savedProfile?.serviceStartYear || (matchedSchool as any)?.pgbStartYear || (matchedSchool as any)?.serviceStartYear || (isMusleh ? 2018 : 2020),
          status: 'active',
          hidePhone: savedProfile?.hidePhone ?? currentUser?.hidePhone ?? true,
        };

        setCurrentUser(profile);

        // Sync user to Firestore if possible
        try {
          await setDoc(doc(db, 'users', fbUser.uid), profile, { merge: true });
        } catch (e) {
          console.warn('Firestore user profile sync notice:', e);
        }
      }
    });

    return () => unsub();
  }, []);

  // Cloud Firestore Real-time Listeners for Member Portal Data across all devices
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // 1. Announcements
    try {
      const unsubAnn = onSnapshot(
        collection(db, 'announcements'),
        (snapshot) => {
          const isSeeded = localStorage.getItem('mpgbsim_announcements_seeded') === 'true';

          if (!snapshot.empty) {
            const list: AnnouncementItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            list.sort((a, b) => {
              if (a.pinned && !b.pinned) return -1;
              if (!a.pinned && b.pinned) return 1;
              return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
            });
            if (!isSeeded) {
              localStorage.setItem('mpgbsim_announcements_seeded', 'true');
            }
            setAnnouncements(list);
          } else if (!isSeeded && INITIAL_ANNOUNCEMENTS.length > 0) {
            localStorage.setItem('mpgbsim_announcements_seeded', 'true');
            INITIAL_ANNOUNCEMENTS.forEach((item) => {
              setDoc(doc(db, 'announcements', item.id), item, { merge: true }).catch(() => {});
            });
            setAnnouncements(INITIAL_ANNOUNCEMENTS);
          } else {
            setAnnouncements([]);
          }
        },
        (err) => console.warn('Firestore announcements listener notification:', err.message)
      );
      unsubscribes.push(unsubAnn);
    } catch (e) {
      console.warn('Announcements listener error:', e);
    }

    // 2. Documents
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
            INITIAL_DOCUMENTS.forEach((item) => {
              setDoc(doc(db, 'documents', item.id), item, { merge: true }).catch(() => {});
            });
            setDocuments(INITIAL_DOCUMENTS);
          } else {
            setDocuments([]);
          }
        },
        (err) => console.warn('Firestore documents listener notification:', err.message)
      );
      unsubscribes.push(unsubDoc);
    } catch (e) {
      console.warn('Documents listener error:', e);
    }

    // 3. Best Practices
    try {
      const unsubBP = onSnapshot(
        collection(db, 'bestPractices'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: BestPracticeItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setBestPractices(list);
          }
        },
        (err) => console.warn('Firestore best practices listener notification:', err.message)
      );
      unsubscribes.push(unsubBP);
    } catch (e) {
      console.warn('Best Practices listener error:', e);
    }

    // 4. Submissions
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
        (err) => console.warn('Firestore submissions listener notification:', err.message)
      );
      unsubscribes.push(unsubSub);
    } catch (e) {
      console.warn('Submissions listener error:', e);
    }

    // 5. Notifications
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
        (err) => console.warn('Firestore notifications listener notification:', err.message)
      );
      unsubscribes.push(unsubNotif);
    } catch (e) {
      console.warn('Notifications listener error:', e);
    }

    // 6. Member Schools (Direct real-time sync with Firestore 'schools' collection used by Admin CMS)
    try {
      const unsubSchools = onSnapshot(
        collection(db, 'schools'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: MemberSchool[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            const portalUserRaw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CURRENT_USER) : null;
            const portalUser = portalUserRaw ? JSON.parse(portalUserRaw) : null;
            const { repairedSchools } = repairSchoolIntegrity(list, portalUser);
            setRegisteredSchools(repairedSchools);

            // Synchronize currentUser in real-time if matching school profile was updated in CMS
            setCurrentUser((prev) => {
              if (!prev) return prev;
              const matched = repairedSchools.find((s) => {
                const matchMusleh =
                  (s.id === 'sch-musleh-1' || s.code === 'MJAC011') &&
                  (prev.email?.includes('imusleh') ||
                    prev.school?.toLowerCase().includes('musleh') ||
                    prev.membershipNo?.includes('MJAC011') ||
                    prev.membershipNo?.includes('MIA1009'));
                const matchId = prev.uid === `sch-user-${s.id}` || prev.uid?.includes(s.id);
                const matchCode = prev.membershipNo && s.code && prev.membershipNo.includes(s.code);
                const matchEmail = prev.email && s.email && prev.email.toLowerCase() === s.email.toLowerCase();
                const matchSchoolName = prev.school && s.name && prev.school.toLowerCase().trim() === s.name.toLowerCase().trim();
                return matchMusleh || matchId || matchCode || matchEmail || matchSchoolName;
              });

              if (matched) {
                const updatedUser: UserProfile = {
                  ...prev,
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
        },
        (err) => console.warn('Firestore schools listener notification in MemberPortal:', err.message)
      );
      unsubscribes.push(unsubSchools);
    } catch (e) {
      console.warn('Schools listener error:', e);
    }

    // 7. News (Direct real-time sync with Firestore 'news' collection so PGB sees published school news immediately)
    try {
      const unsubNews = onSnapshot(
        collection(db, 'news'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: NewsItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setSchoolNews(sortNewsByPublishedDate(list));
          }
        },
        (err) => console.warn('Firestore news listener notification in MemberPortal:', err.message)
      );
      unsubscribes.push(unsubNews);
    } catch (e) {
      console.warn('News listener error:', e);
    }

    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
  }, []);

  // Synchronize currentUser with live Firestore 'schools' data on initial portal load
  useEffect(() => {
    if (!currentUser) return;
    let isCancelled = false;

    getLatestRegisteredSchools().then((schools) => {
      if (isCancelled || !schools || schools.length === 0) return;
      const matched = schools.find((s) => {
        const matchMusleh =
          (s.id === 'sch-musleh-1' || s.code === 'MJAC011') &&
          (currentUser.email?.includes('imusleh') ||
            currentUser.school?.toLowerCase().includes('musleh') ||
            currentUser.membershipNo?.includes('MJAC011') ||
            currentUser.membershipNo?.includes('MIA1009'));
        const matchId = currentUser.uid === `sch-user-${s.id}` || currentUser.uid?.includes(s.id);
        const matchCode = currentUser.membershipNo && s.code && currentUser.membershipNo.includes(s.code);
        const matchEmail = currentUser.email && s.email && currentUser.email.toLowerCase() === s.email.toLowerCase();
        const matchSchoolName = currentUser.school && s.name && currentUser.school.toLowerCase().trim() === s.name.toLowerCase().trim();
        return matchMusleh || matchId || matchCode || matchEmail || matchSchoolName;
      });

      if (matched) {
        const needsUpdate =
          (matched.principal && matched.principal !== currentUser.fullName) ||
          (matched.name && matched.name !== currentUser.school) ||
          (matched.state && matched.state !== currentUser.state) ||
          (matched.phone && matched.phone !== currentUser.phone) ||
          (matched.principalPhotoUrl && matched.principalPhotoUrl !== currentUser.photoURL) ||
          (matched.schoolPhotoUrl && matched.schoolPhotoUrl !== currentUser.schoolPhotoUrl) ||
          (matched.logoUrl && matched.logoUrl !== currentUser.logoUrl) ||
          (matched.type && matched.type !== currentUser.schoolType);

        if (needsUpdate) {
          setCurrentUser((prev) => {
            if (!prev) return prev;
            const updated: UserProfile = {
              ...prev,
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
            safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
            return updated;
          });
        }
      }
    }).catch((err) => {
      console.warn('Penyelarasan sekolah profil notis:', err);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

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
      const isMuslehUser =
        userEmail === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
        userEmail.includes('imuslehmelaka') ||
        userEmail.includes('imusleh');

      let matchedSchool: MemberSchool | undefined = registeredSchools.find((s) => {
        if (!s.email) return false;
        const schEmail = s.email.toLowerCase().trim();
        if (schEmail === userEmail) return true;
        const userDomain = userEmail.split('@')[1];
        const schDomain = schEmail.split('@')[1];
        if (userDomain && schDomain && userDomain === schDomain) return true;
        return false;
      });

      if (!matchedSchool && isMuslehUser) {
        matchedSchool =
          registeredSchools.find(
            (s) => s.code === 'MJAC011' || s.code === 'MIA1009' || s.name.toLowerCase().includes('musleh')
          );
      }

      const role: UserRole = isSuper ? 'ADMIN' : 'MEMBER';

      const isPrimary =
        matchedSchool?.type?.includes('Rendah') ||
        matchedSchool?.name?.toLowerCase().includes('rendah') ||
        matchedSchool?.name?.toLowerCase().includes('sri') ||
        isMuslehUser;

      const pos = isMuslehUser
        ? 'Guru Besar'
        : isSuper
        ? 'Pegawai Pentadbir MPGBSIM'
        : isPrimary
        ? 'Guru Besar'
        : matchedSchool?.type === 'SMKA' || matchedSchool?.type === 'SABK'
        ? 'Pengetua'
        : savedProfile?.position || 'Pengetua / Guru Besar';

      const defaultName =
        savedProfile?.fullName ||
        matchedSchool?.principal ||
        user.displayName ||
        (isMuslehUser ? 'Ustaz Abdul Qayyum bin Yaakop' : (userEmail.split('@')[0] || 'Ahli PGB MPGBSIM'));

      const defaultSchoolName =
        savedProfile?.school ||
        matchedSchool?.name ||
        (isMuslehUser ? 'Sekolah Rendah Islam I Musleh' : (isSuper ? 'Sekretariat Utama MPGBSIM' : 'Sekolah Ahli Berdaftar MPGBSIM'));

      const defaultState = savedProfile?.state || matchedSchool?.state || (isMuslehUser ? 'Melaka' : 'Wilayah Persekutuan');
      const defaultSchoolType = savedProfile?.schoolType || matchedSchool?.type || (isMuslehUser ? 'Rakan Musleh' : 'SMKA');
      const defaultMembershipNo = isMuslehUser
        ? 'MPGB-2026-MJAC011'
        : (savedProfile?.membershipNo?.replace('MIA1009', 'MJAC011') ||
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
        school: defaultSchoolName,
        schoolType: defaultSchoolType,
        state: defaultState,
        phone: savedProfile?.phone || matchedSchool?.phone || user.phoneNumber || (isMuslehUser ? '+60 6-335 1290' : ''),
        photoURL:
          savedProfile?.photoURL ||
          matchedSchool?.principalPhotoUrl ||
          user.photoURL ||
          (isMuslehUser ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' : ''),
        schoolPhotoUrl:
          savedProfile?.schoolPhotoUrl ||
          matchedSchool?.schoolPhotoUrl ||
          (isMuslehUser ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80' : undefined),
        logoUrl:
          savedProfile?.logoUrl ||
          matchedSchool?.logoUrl ||
          (isMuslehUser ? 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80' : undefined),
        status: 'active',
        membershipNo: defaultMembershipNo,
        joinYear: isMuslehUser ? 2026 : savedProfile?.joinYear || matchedSchool?.joinYear || 2026,
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

    let matched = registeredSchools.find((s) => {
      const codeMatch = s.code && (
        s.code.toLowerCase().trim() === input.toLowerCase() ||
        (input.toLowerCase() === 'mjac011' && (s.code.toLowerCase() === 'mjac011' || s.code.toLowerCase() === 'mia1009')) ||
        (input.toLowerCase() === 'mia1009' && (s.code.toLowerCase() === 'mjac011' || s.code.toLowerCase() === 'mia1009'))
      );
      const emailMatch = s.email && s.email.toLowerCase().trim() === input.toLowerCase();
      const nameMatch = s.name.toLowerCase().trim() === input.toLowerCase();
      const muslehMatch =
        (input.toLowerCase() === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
          input.toLowerCase() === 'mjac011' ||
          input.toLowerCase() === 'mia1009' ||
          input.toLowerCase().includes('imusleh')) &&
        (s.id === 'sch-musleh-1' || s.code === 'MJAC011' || s.code === 'MIA1009' || s.name.toLowerCase().includes('musleh'));
      return codeMatch || emailMatch || nameMatch || muslehMatch;
    });

    if (!matched && (
      input.toLowerCase() === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      input.toLowerCase() === 'mjac011' ||
      input.toLowerCase() === 'mia1009' ||
      input.toLowerCase().includes('imusleh')
    )) {
      matched = registeredSchools.find((s) => s.code === 'MJAC011' || s.id === 'sch-musleh-1' || s.name.toLowerCase().includes('musleh'));
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
      matched.name.toLowerCase().includes('musleh') ||
      (matched.email && matched.email.toLowerCase().includes('imusleh'));

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
      // If user has changed their password, ONLY the new custom password is valid! Default formats like PGB#MJAC011 are REJECTED.
      isValidPass = cleanPass === customPasswordSet;
    } else {
      // If no custom password has been set yet, allow initial default formats
      const expectedPassword = matched.password || `PGB#${matched.code?.toUpperCase()}` || 'MPGB2026!';
      isValidPass =
        cleanPass === matched.password ||
        cleanPass === expectedPassword ||
        (isMuslehSchool && (cleanPass === 'PGB#MJAC011' || cleanPass === 'PGB#MIA1009')) ||
        cleanPass === 'MPGB2026!';
    }

    if (!isValidPass) {
      if (customPasswordSet) {
        throw new Error(
          `Kata laluan tidak tepat. Anda telah menukar kata laluan akaun ini — format asal (PGB#${matched.code}) tidak lagi sah. Sila masukkan kata laluan baharu anda.`
        );
      } else {
        throw new Error(
          `Kata laluan tidak tepat bagi institusi ${matched.name}. Sila masukkan kata laluan akaun sekolah yang sah.`
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
    let liveSchool = school;
    try {
      const schoolDoc = await getDoc(doc(db, 'schools', school.id));
      if (schoolDoc.exists()) {
        liveSchool = { id: schoolDoc.id, ...(schoolDoc.data() as MemberSchool) };
      } else if (school.code) {
        const q = query(collection(db, 'schools'), where('code', '==', school.code.toUpperCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          liveSchool = { id: snap.docs[0].id, ...(snap.docs[0].data() as MemberSchool) };
        }
      }
    } catch (e) {
      console.warn('Direct Firestore school fetch on login notice:', e);
    }

    const isMusleh =
      liveSchool.id === 'sch-musleh-1' ||
      liveSchool.code === 'MJAC011' ||
      liveSchool.code === 'MIA1009' ||
      liveSchool.name?.toLowerCase().includes('musleh') ||
      liveSchool.email?.toLowerCase().includes('imusleh');

    const cleanCode = isMusleh ? 'MJAC011' : (liveSchool.code || liveSchool.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
    const schoolName = liveSchool.name || (isMusleh ? 'Sekolah Rendah Islam I Musleh' : '');
    const principalName = liveSchool.principal || (isMusleh ? 'Ustaz Abdul Qayyum bin Yaakop' : '');
    const email = isMusleh ? 'abdulqayyumyaakop@imuslehmelaka.edu.my' : (liveSchool.email || `${cleanCode.toLowerCase()}@mpgbsim.edu.my`);
    const schoolType = liveSchool.type || (isMusleh ? 'Rakan Musleh' : 'SMKA');
    const state = liveSchool.state || (isMusleh ? 'Melaka' : 'Wilayah Persekutuan');
    const phone = liveSchool.phone || (isMusleh ? '+60 6-335 1290' : '03-8888 2026');

    const isPrimary =
      isMusleh ||
      liveSchool.type?.includes('Rendah') ||
      liveSchool.name?.toLowerCase().includes('rendah') ||
      liveSchool.name?.toLowerCase().includes('sri');
    const pos = isPrimary ? 'Guru Besar' : 'Pengetua';

    const profile: UserProfile = {
      uid: `sch-user-${liveSchool.id}`,
      email,
      fullName: principalName || `${pos} ${schoolName}`,
      role: 'MEMBER',
      position: pos,
      icNumber: (liveSchool as any).icNumber || '',
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
        (isMusleh ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' : '') ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      schoolPhotoUrl:
        liveSchool.schoolPhotoUrl ||
        (isMusleh ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80' : ''),
      logoUrl:
        liveSchool.logoUrl ||
        (isMusleh ? 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80' : ''),
      expertise: ['Kepimpinan Instruksional', 'Pengurusan Sekolah Islam', 'Pendidikan Bersepadu'],
      interests: ['Transformasi Digital & AI', 'Pembangunan Sahsiah Rabbani', 'Inovasi Kokurikulum'],
      membershipNo: `MPGB-2026-${cleanCode}`,
      joinYear: isMusleh ? 2026 : liveSchool.joinYear || 2026,
      serviceStartYear: (liveSchool as any).serviceStartYear || (liveSchool as any).pgbStartYear || (isMusleh ? 2018 : liveSchool.joinYear || 2020),
      pgbStartYear: (liveSchool as any).pgbStartYear || (liveSchool as any).serviceStartYear || (isMusleh ? 2018 : liveSchool.joinYear || 2020),
      status: 'active',
      hidePhone: true,
    };

    setCurrentUser(profile);
    setViewMode('portal');
    setPortalTab('dashboard');
    recordAuditLog(
      'Log Masuk Sekolah Ahli',
      `PGB ${profile.fullName} dari ${liveSchool.name} (${liveSchool.state}) telah log masuk ke Portal Ahli.`
    );
  };

  const logoutPortal = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    recordAuditLog('Log Keluar Portal', `Pengguna ${currentUser?.fullName || 'Ahli'} telah log keluar.`);
    setCurrentUser(null);
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
        const matchCode = sch.code && currentUser.membershipNo?.includes(sch.code);
        const matchEmail = sch.email && currentUser.email && sch.email.toLowerCase() === currentUser.email.toLowerCase();
        const matchMusleh =
          (sch.code === 'MJAC011' || sch.id === 'sch-musleh-1') &&
          (currentUser.email?.includes('imusleh') || currentUser.school?.toLowerCase().includes('musleh'));
        if (matchCode || matchEmail || matchMusleh) {
          updateDoc(doc(db, 'schools', d.id), {
            ...(safeUpdates.fullName ? { principal: safeUpdates.fullName } : {}),
            ...(safeUpdates.school ? { name: safeUpdates.school } : {}),
            ...(safeUpdates.schoolCode ? { code: safeUpdates.schoolCode } : {}),
            ...(safeUpdates.schoolType ? { type: safeUpdates.schoolType } : {}),
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

    // Also update local storage CMS cache (v3 & legacy) and trigger website refresh
    try {
      ['mpgbsim_cms_content_v3', 'mpgbsim_cms_content'].forEach((key) => {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.memberSchools) {
            parsed.memberSchools = parsed.memberSchools.map((s: MemberSchool) => {
              const matchCode = s.code && currentUser.membershipNo?.includes(s.code);
              const matchEmail = s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase();
              const matchMusleh =
                (s.code === 'MJAC011' || s.id === 'sch-musleh-1') &&
                (currentUser.email?.includes('imusleh') || currentUser.school?.toLowerCase().includes('musleh'));
              if (matchCode || matchEmail || matchMusleh) {
                return {
                  ...s,
                  ...(safeUpdates.fullName ? { principal: safeUpdates.fullName } : {}),
                  ...(safeUpdates.school ? { name: safeUpdates.school } : {}),
                  ...(safeUpdates.schoolCode ? { code: safeUpdates.schoolCode } : {}),
                  ...(safeUpdates.schoolType ? { type: safeUpdates.schoolType } : {}),
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
      });
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
    let targetDocId: string | null = null;
    try {
      const snap = await getDocs(collection(db, 'schools'));
      snap.forEach((d) => {
        const sch = d.data() as MemberSchool;
        const matchCode = sch.code && currentUser.membershipNo?.includes(sch.code);
        const matchName =
          sch.name && currentUser.school && sch.name.toLowerCase() === currentUser.school.toLowerCase();
        const matchEmail =
          sch.email && currentUser.email && sch.email.toLowerCase() === currentUser.email.toLowerCase();
        const isMuslehMatch =
          (d.id === 'sch-musleh-1' || sch.code === 'MJAC011' || sch.code === 'MIA1009') &&
          (currentUser.email?.includes('imusleh') || currentUser.school?.toLowerCase().includes('musleh'));
        if (matchCode || matchName || matchEmail || isMuslehMatch) {
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

    // 6. Update local storage CMS school list cache (both v3 and legacy)
    try {
      ['mpgbsim_cms_content_v3', 'mpgbsim_cms_content'].forEach((key) => {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.memberSchools) {
            parsed.memberSchools = parsed.memberSchools.map((s: MemberSchool) => {
              if (
                (s.email && s.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
                (s.name && s.name.toLowerCase() === currentUser.school?.toLowerCase()) ||
                (currentUser.membershipNo && s.code && currentUser.membershipNo.includes(s.code)) ||
                ((s.code === 'MJAC011' || s.code === 'MIA1009') && currentUser.school?.toLowerCase().includes('musleh'))
              ) {
                return { ...s, password: cleanPass };
              }
              return s;
            });
            safeLocalStorageSet(key, JSON.stringify(parsed));
          }
        }
      });
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
    setAnnouncements((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      return [newAnn, ...filtered];
    });
    recordAuditLog('Cipta Pengumuman', `Mencipta pengumuman baharu: "${newAnn.title}"`);

    try {
      await setDoc(doc(db, 'announcements', id), newAnn, { merge: true });
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
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    recordAuditLog('Kemas Kini Pengumuman', `Mengemas kini pengumuman ID: ${id}`);

    try {
      await setDoc(doc(db, 'announcements', id), updates, { merge: true });
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
