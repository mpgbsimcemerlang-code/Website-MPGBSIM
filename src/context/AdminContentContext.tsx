import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  NewsItem,
  StrategicFocus,
  BestPracticeItem,
  ProgramEvent,
  NetworkStats,
  LeaderProfile,
  MediaItem,
  ResourceDocument,
  MemberSchool,
  ContactSubmission,
  MemberApplication,
  DashboardConfig,
  EventRegistration,
} from '../types';
import {
  LATEST_NEWS_LIST,
  STRATEGIC_FOCUS_LIST,
  BEST_PRACTICES_LIST,
  UPCOMING_PROGRAMS_LIST,
  INITIAL_NETWORK_STATS,
  LEADERSHIP_TEAM,
  MEDIA_GALLERY_LIST,
  RESOURCE_DOCS,
  SAMPLE_MEMBER_SCHOOLS,
  SAMPLE_MEMBER_APPLICATIONS,
  DEFAULT_EVENT_REGISTRATIONS,
} from '../data/mockData';

import {
  persistSiteContent,
  getInitialSiteContentSync,
  getFullSiteContentAsync,
  purgeObsoleteLocalStorage,
  saveToIndexedDB,
  safeLocalStorageSet,
  safeLocalStorageRemove,
} from '../utils/storage';
import { sortNewsByPublishedDate } from '../utils/dateUtils';
import faizLeaderPhoto from '../assets/images/mohamad_faiz_azizan_leader.webp';

import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  isAuthorizedAdminEmail,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  handleFirestoreError,
  OperationType,
  ensureFirebaseAuth,
} from '../firebase';
import {
  runSchoolDiagnostic,
  repairSchoolIntegrity,
  type DiagnosticReport,
} from '../utils/schoolDiagnostic';

export interface BrandingData {
  logoUrl: string;
  orgName: string;
  shortName: string;
  motto: string;
  subMotto: string;
  secondaryContext: string;
  establishedYear: string;
  registrationNumber?: string;
}

export interface HeroTrustPillar {
  title: string;
  value: string;
  desc: string;
}

export interface HeroData {
  badge: string;
  btnKenaliText: string;
  btnProgramText: string;
  btnPortalText: string;
  trustPillars: HeroTrustPillar[];
}

export interface VisionMissionData {
  strategicPlanTitle: string;
  vision: string;
  visionSub: string;
  missions: string[];
  introParagraph1: string;
  introParagraph2: string;
  introParagraph3: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
}

export interface QuoteData {
  quoteText: string;
  authorName: string;
  authorRole: string;
  badge: string;
  authorPhotoUrl?: string;
}

export interface CtaData {
  badge: string;
  title: string;
  description: string;
  btnPrimaryText: string;
  btnSecondaryText: string;
  footerNotes: string;
}

export interface ContactInfoData {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  operatingHours: string;
  socialFacebook?: string;
  socialYoutube?: string;
  socialTelegram?: string;
  socialInstagram?: string;
}

export interface SiteContentState {
  branding: BrandingData;
  hero: HeroData;
  visionMission: VisionMissionData;
  strategicFocus: StrategicFocus[];
  stats: NetworkStats;
  memberSchools: MemberSchool[];
  news: NewsItem[];
  programs: ProgramEvent[];
  practices: BestPracticeItem[];
  leadership: LeaderProfile[];
  media: MediaItem[];
  quote: QuoteData;
  resources: ResourceDocument[];
  cta: CtaData;
  contactInfo: ContactInfoData;
  submissions: ContactSubmission[];
  memberApplications: MemberApplication[];
  dashboardConfig?: DashboardConfig;
  eventRegistrations?: EventRegistration[];
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
  loginTime: string;
  photoUrl?: string;
}

interface AdminContentContextType {
  siteData: SiteContentState;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  isFirebaseConnected: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: string | null;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{
    success: boolean;
    message: string;
    isUnauthorizedDomain?: boolean;
    domain?: string;
  }>;
  logoutAdmin: () => Promise<void>;
  syncAllToFirestore: () => Promise<{ success: boolean; message: string }>;
  // Modals controls
  isCMSOpen: boolean;
  setIsCMSOpen: (open: boolean) => void;
  isLogoModalOpen: boolean;
  setIsLogoModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  // Update functions
  updateLogo: (newLogoUrl: string) => void;
  resetLogoToDefault: () => void;
  updateBranding: (data: Partial<BrandingData>) => void;
  updateHero: (data: Partial<HeroData>) => void;
  updateVisionMission: (data: Partial<VisionMissionData>) => void;
  updateQuote: (data: Partial<QuoteData>) => void;
  updateCta: (data: Partial<CtaData>) => void;
  updateStats: (data: NetworkStats) => void;
  // Content items CRUD
  addNews: (item: NewsItem) => Promise<void>;
  updateNews: (id: string, item: Partial<NewsItem>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  addProgram: (item: ProgramEvent) => Promise<void>;
  updateProgram: (id: string, item: Partial<ProgramEvent>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  addPractice: (item: BestPracticeItem) => Promise<void>;
  updatePractice: (id: string, item: Partial<BestPracticeItem>) => Promise<void>;
  deletePractice: (id: string) => Promise<void>;
  // Leadership CRUD
  addLeader: (item: LeaderProfile) => Promise<void>;
  updateLeader: (id: string, item: Partial<LeaderProfile>) => Promise<void>;
  deleteLeader: (id: string) => Promise<void>;
  reorderLeaders: (reordered: LeaderProfile[]) => Promise<void>;
  // Strategic Focus CRUD
  addStrategicFocus: (item: StrategicFocus) => void;
  updateStrategicFocus: (id: number, item: Partial<StrategicFocus>) => void;
  deleteStrategicFocus: (id: number) => void;
  // Media CRUD
  addMedia: (item: MediaItem) => Promise<void>;
  updateMedia: (id: string, item: Partial<MediaItem>) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  // Resources CRUD
  addResource: (item: ResourceDocument) => void;
  updateResource: (id: string, item: Partial<ResourceDocument>) => void;
  deleteResource: (id: string) => void;
  // Member Schools CRUD & Diagnostics
  addMemberSchool: (item: MemberSchool) => Promise<void>;
  updateMemberSchool: (id: string, item: Partial<MemberSchool>) => Promise<void>;
  deleteMemberSchool: (id: string) => Promise<void>;
  runSchoolDiagnostics: () => DiagnosticReport;
  autoRepairSchoolIntegrity: () => {
    repairedSchools: MemberSchool[];
    actionsTaken: string[];
  };
  // Member Applications Management
  addMemberApplication: (item: MemberApplication) => Promise<void>;
  approveMemberApplication: (id: string) => Promise<{ success: boolean; message: string }>;
  rejectMemberApplication: (id: string, reason?: string) => Promise<void>;
  deleteMemberApplication: (id: string) => Promise<void>;
  // Dashboard Elements Config
  updateDashboardConfig: (data: Partial<DashboardConfig>) => Promise<void>;
  // Contact Info
  updateContactInfo: (data: Partial<ContactInfoData>) => Promise<void>;
  // Submissions CRUD
  addSubmission: (item: Omit<ContactSubmission, 'id' | 'date' | 'status'>) => Promise<void>;
  updateSubmissionStatus: (id: string, status: 'unread' | 'read' | 'replied') => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  // Event Registrations (Pendaftaran Program & Kapasiti)
  eventRegistrations: EventRegistration[];
  registerForEvent: (
    eventId: string,
    participantData: Omit<EventRegistration, 'id' | 'eventId' | 'eventTitle' | 'registeredAt' | 'status'>
  ) => Promise<{ success: boolean; message: string; registrationId?: string }>;
  updateEventRegistrationStatus: (regId: string, status: 'confirmed' | 'attended' | 'cancelled') => Promise<void>;
  deleteEventRegistration: (regId: string, eventId: string) => Promise<void>;
  resetAllContent: () => void;
}

const DEFAULT_BRANDING: BrandingData = {
  logoUrl: '/mpgbsim-official-logo.png',
  orgName: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
  shortName: 'MPGBSIM',
  motto: 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani',
  subMotto: 'Jaringan kepimpinan Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia.',
  secondaryContext:
    'Menyatukan aspirasi kepimpinan SMKA, SABK, Sekolah Islam Swasta dan Institusi Tahfiz ke arah kecemerlangan modal insan bersepadu.',
  establishedYear: '1988',
};

const DEFAULT_HERO: HeroData = {
  badge: 'Badan Kepimpinan Pengetua & Guru Besar Sekolah Islam Kebangsaan',
  btnKenaliText: 'Kenali MPGBSIM',
  btnProgramText: 'Lihat Program',
  btnPortalText: 'Portal Ahli PGB',
  trustPillars: [
    {
      title: 'Jaringan Nasional',
      value: '14 Negeri & Wilayah',
      desc: 'Merangkumi seluruh Malaysia',
    },
    {
      title: 'Sekolah Ahli',
      value: '250+ Institusi',
      desc: 'SMKA, SABK, Swasta & Tahfiz',
    },
    {
      title: 'Pemimpin Pendidikan',
      value: '1,500+ PGB & SLT',
      desc: 'Pengetua & Guru Besar',
    },
    {
      title: 'Generasi Pelajar',
      value: '120,000+ Murid',
      desc: 'Menerima impak kurikulum holistik',
    },
  ],
};

const DEFAULT_VISION_MISSION: VisionMissionData = {
  strategicPlanTitle: 'Rangka Tindakan Strategik Kepimpinan Sekolah Islam Malaysia (2025–2030)',
  vision: 'Peneraju Kecemerlangan Kepimpinan Pendidikan Islam Bertaraf Antarabangsa',
  visionSub:
    'Menjadikan institusi pendidikan Islam sebagai model pembinaan modal insan unggul yang mengintegrasikan ilmu naqli dan aqli berteraskan nilai ketuhanan.',
  missions: [
    'Membangunkan kapasiti kepimpinan berprestasi tinggi dalam kalangan Pengetua dan Guru Besar secara berterusan.',
    'Menyelaras dan memperkasakan standard kurikulum akademik, tahfiz, dan pembinaan sahsiah bertaraf kebangsaan serta global.',
    'Memperkukuhkan jaringan strategik, perkongsian pintar, dan penyelidikan amalan terbaik antara institusi pendidikan Islam.',
    'Mendaulatkan kebajikan, profesionalisme, serta hak institusi sekolah Islam melalui advokasi dasar yang berkesan.',
  ],
  introParagraph1:
    'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) merupakan badan penaung dan kepimpinan tertinggi yang menghimpunkan para pentadbir sekolah Islam dari seluruh pelusuk tanah air.',
  introParagraph2:
    'Didorong oleh iltizam melahirkan generasi Rabbani yang teguh aqidah dan cemerlang intelek, MPGBSIM bertindak sebagai jambatan strategik antara institusi sekolah, kementerian, agensi agama negeri, serta komuniti masyarakat.',
  introParagraph3:
    'Dengan pendekatan kepimpinan transformasional, kami komited memastikan setiap sekolah ahli dipacu dengan tata kelola profesional, kurikulum futuristik, dan pengurusan wakaf pendidikan yang mampan.',
  pillar1Title: 'Pembangunan Kepimpinan & Governan',
  pillar1Desc:
    'Memantapkan kompetensi manajerial, kepimpinan instruksional, dan pematuhan tadbir urus berwibawa bagi semua pentadbir sekolah ahli.',
  pillar2Title: 'Integrasi Kurikulum & Ekosistem Rabbani',
  pillar2Desc:
    'Mengharmonikan sukatan KPM dengan kurikulum diniyah serta pengajian tahfiz berpiawaian tinggi bagi membentuk sahsiah terpuji.',
};

const DEFAULT_QUOTE: QuoteData = {
  quoteText: '“Bersama PGB, kita membina sekolah Islam yang lebih unggul.”',
  authorName: 'Mohamad Faiz Azizan',
  authorRole: 'Pengerusi Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
  badge: 'Amanat Pengerusi Kebangsaan',
  authorPhotoUrl: faizLeaderPhoto,
};

const DEFAULT_CTA: CtaData = {
  badge: 'Jaringan Kepimpinan Kebangsaan',
  title: 'Bersama Memperkasa Institusi Pendidikan Islam Negara',
  description:
    'Sertai lebih 250 buah sekolah Islam di seluruh Malaysia. Nikmati akses kepada program latihan berimpak tinggi, perkongsian amalan terbaik, geran penyelidikan, dan rangkaian perpaduan kepimpinan.',
  btnPrimaryText: 'Daftar Sekolah Ahli',
  btnSecondaryText: 'Muat Turun Brosur MPGBSIM',
  footerNotes:
    'Pendaftaran terbuka kepada semua SMKA, SABK, Sekolah Menengah/Rendah Islam Swasta dan Maahad Tahfiz berdaftar.',
};

const DEFAULT_CONTACT_INFO: ContactInfoData = {
  email: 'mpgbsim.cemerlang@gmail.com',
  phone: '+60 3-8925 7890',
  whatsapp: '+60 19-345 6789',
  address: 'Kompleks Pendidikan Islam Antarabangsa, Jalan Universiti, 43600 Bangi, Selangor Darul Ehsan.',
  operatingHours: 'Isnin – Jumaat: 8:30 Pagi – 5:00 Petang (Kecuali Cuti Umum)',
};

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  welcomeBadge: 'Pusat Kawalan Pentadbir Rasmi MPGBSIM',
  welcomeGreeting: 'Selamat Datang, Pegawai Pentadbir',
  welcomeDesc: 'Portal kini beroperasi menggunakan Firebase Authentication dan pangkalan data Cloud Firestore. Semua penulisan dan kemas kini disegerakkan secara masa nyata.',
  backendStatusLabel: 'Status Backend',
  backendStatusValue: 'Firestore Aktif',
  syncBtnLabel: 'Segerak ke Cloud Firestore',
  showAnnouncement: true,
  announcementType: 'info',
  announcementTitle: 'Makluman Operasi Dashboard Pentadbir',
  announcementText: 'Semua rekod pendaftaran keahlian PGB, berita dan takwim program diselaraskan secara automatik ke pangkalan data awan.',
  cardNewsTitle: 'Jumlah Berita & Pengumuman',
  cardNewsSub: 'Kandungan siaran media rasmi & pekeliling',
  cardEventsTitle: 'Jumlah Acara & Program',
  cardEventsSub: 'Takwim program, konvensyen & bengkel kepimpinan',
  cardPracticesTitle: 'Amalan Terbaik Pendidikan',
  cardPracticesSub: 'Kajian kes, inovasi kurikulum & kepimpinan Rabbani',
  cardSchoolsTitle: 'Sekolah Ahli Berdaftar',
  cardSchoolsSub: 'Jaringan institusi pendidikan Islam kebangsaan',
  cardActionText: 'Urus',
  membershipTitle: 'Permohonan Keahlian Baharu (Portal Ahli MPGBSIM)',
  membershipDesc: 'Luluskan permohonan PGB secara terus. Data sekolah, PGB, bilangan murid, guru, dan logo akan didaftarkan secara automatik ke dalam Direktori Sekolah Ahli.',
  membershipBtnText: 'Buka Semua Permohonan',
  membershipEmptyTitle: 'Tiada permohonan keahlian yang menunggu kelulusan pada masa ini.',
  membershipEmptyDesc: 'Semua permohonan yang dihantar melalui Portal Ahli MPGBSIM telah diproses.',
  submissionsTitle: 'Peti Masuk Pertanyaan & Submisi',
  submissionsDesc: 'Mesej daripada borang hubungi laman web dan pendaftaran keahlian yang disimpan ke Cloud Firestore.',
  submissionsEmptyDesc: 'Tiada submisi mesej baharu pada masa ini.',
  adminMemo: 'Tugasan Utama: 1) Kemas kini takwim Konvensyen Nasional 2026. 2) Semak pendaftaran Sekolah Rendah Islam I Musleh & rakan Musleh.',
  adminMemoAuthor: 'Urus Setia Kebangsaan',
  adminMemoDate: '23 September 2026',
};

const DUMMY_MOCK_SCHOOL_IDS = new Set(['sch-1', 'sch-2', 'sch-3', 'sch-4', 'sch-5', 'sch-6', 'sch-7', 'sch-8']);
const DUMMY_MOCK_SCHOOL_CODES = new Set(['WRA0001', 'ABA2004', 'BEA4002', 'BIA3012', 'DEA1021', 'JIA5019', 'CIA6008', 'KEA7001']);

const sanitizeMemberSchoolsList = (schools: MemberSchool[] = []): MemberSchool[] => {
  try {
    // Strictly restrict directory to official Sekolah Rendah Islam I Musleh
    const muslehSchools = (schools || []).filter((s) => {
      return (
        s.id === 'sch-musleh-1' ||
        s.code?.toUpperCase() === 'MJAC011' ||
        s.code?.toUpperCase() === 'MIA1009' ||
        s.name.toLowerCase().includes('musleh') ||
        (s.email && s.email.toLowerCase().includes('imusleh'))
      );
    });

    const portalUserRaw = typeof window !== 'undefined' ? localStorage.getItem('mpgbsim_portal_user_v1') : null;
    const portalUser = portalUserRaw ? JSON.parse(portalUserRaw) : null;
    const { repairedSchools } = repairSchoolIntegrity(
      muslehSchools.length > 0 ? muslehSchools : SAMPLE_MEMBER_SCHOOLS,
      portalUser
    );
    const finalClean = repairedSchools.filter(
      (s) =>
        s.id === 'sch-musleh-1' ||
        s.code?.toUpperCase() === 'MJAC011' ||
        s.name.toLowerCase().includes('musleh')
    );
    return finalClean.length > 0 ? finalClean : SAMPLE_MEMBER_SCHOOLS;
  } catch (e) {
    console.warn('sanitizeMemberSchoolsList notice:', e);
    return SAMPLE_MEMBER_SCHOOLS;
  }
};

const sanitizeMemberApplicationsList = (apps: MemberApplication[] = []): MemberApplication[] => {
  return apps.filter((app) => {
    // Exclude Sekolah Rendah Islam I Musleh because it is already an official registered member school in the directory
    const isAlreadyRegisteredMusleh =
      app.id === 'app-musleh-01' ||
      app.schoolCode === 'MJAC011' ||
      app.schoolCode === 'MIA1009' ||
      app.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      (app.schoolName && app.schoolName.toLowerCase().includes('musleh'));
    return !isAlreadyRegisteredMusleh;
  });
};

const sanitizeLeadershipList = (list: LeaderProfile[] = []): LeaderProfile[] => {
  const baseList = !list || list.length === 0 ? LEADERSHIP_TEAM : list;
  const mapped = baseList.map((l, index) => {
    const isFaiz = l.id === 'lead-1' || l.name?.toLowerCase().includes('faiz');
    const avatar = isFaiz
      ? (l.avatarUrl && !l.avatarUrl.includes('photo-1507003211169') ? l.avatarUrl : faizLeaderPhoto)
      : (l.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600');
    // Mohamad Faiz Azizan is authoritative #1 (order: 0) if order not yet defined
    const effectiveOrder = l.order !== undefined ? Number(l.order) : (isFaiz ? 0 : index + 1);
    return {
      ...l,
      name: isFaiz ? (l.name || 'Mohamad Faiz Azizan') : l.name,
      role: isFaiz ? (l.role || 'Pengerusi Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia') : l.role,
      term: l.term || 'Penggal 2026–2028',
      category: l.category || 'Kepimpinan Utama',
      avatarUrl: avatar,
      order: effectiveOrder,
    };
  });

  return mapped.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
};

const INITIAL_SUBMISSIONS: ContactSubmission[] = [
  {
    id: 'INQ-882101',
    name: 'Ustaz Fairuz bin Ariffin',
    email: 'fairuz@sri-hidayah.edu.my',
    phone: '+60 12-987 6543',
    subject: 'Permohonan Pendaftaran Sekolah Ahli Baharu',
    message: 'Salam hormat Urus Setia MPGBSIM. Pihak kami ingin mendaftarkan SRI Al-Hidayah sebagai ahli bersekutu bagi sesi 2026. Mohon pencerahan prosedur dokumentasi.',
    date: '2026-09-20T10:15:00Z',
    status: 'unread',
  },
  {
    id: 'INQ-881944',
    name: 'Dr. Noraini binti Sulaiman',
    email: 'noraini.s@sabk-melaka.edu.my',
    phone: '+60 13-445 2211',
    subject: 'Cadangan Kolaborasi Modul Tahfiz Huffaz Cemerlang',
    message: 'Tahniah atas penganjuran kolokium baru-baru ini. Sekolah kami berminat berkongsi modul amalan terbaik tahfiz sains untuk diterbitkan dalam portal.',
    date: '2026-09-18T14:30:00Z',
    status: 'read',
  },
];

const STORAGE_KEYS = {
  ADMIN_SESSION: 'mpgbsim_admin_session_v3',
  SITE_CONTENT: 'mpgbsim_cms_content_v3',
};

const AdminContentContext = createContext<AdminContentContextType | undefined>(undefined);

const sanitizeBranding = (b?: Partial<BrandingData> | null): BrandingData => {
  return {
    logoUrl: b?.logoUrl || DEFAULT_BRANDING.logoUrl,
    orgName: b?.orgName || DEFAULT_BRANDING.orgName,
    shortName: b?.shortName || DEFAULT_BRANDING.shortName,
    motto: b?.motto || DEFAULT_BRANDING.motto,
    subMotto: b?.subMotto || DEFAULT_BRANDING.subMotto,
    secondaryContext: b?.secondaryContext ?? DEFAULT_BRANDING.secondaryContext,
    establishedYear: b?.establishedYear || DEFAULT_BRANDING.establishedYear,
    registrationNumber: b?.registrationNumber || DEFAULT_BRANDING.registrationNumber,
  };
};

const sanitizeHero = (h?: Partial<HeroData> | null): HeroData => {
  return {
    badge: h?.badge || DEFAULT_HERO.badge,
    btnKenaliText: h?.btnKenaliText || DEFAULT_HERO.btnKenaliText,
    btnProgramText: h?.btnProgramText || DEFAULT_HERO.btnProgramText,
    btnPortalText: h?.btnPortalText || DEFAULT_HERO.btnPortalText,
    trustPillars: h?.trustPillars?.length ? h.trustPillars : DEFAULT_HERO.trustPillars,
  };
};

const sanitizeVisionMission = (vm?: Partial<VisionMissionData> | null): VisionMissionData => {
  return {
    strategicPlanTitle: vm?.strategicPlanTitle || DEFAULT_VISION_MISSION.strategicPlanTitle,
    vision: vm?.vision || DEFAULT_VISION_MISSION.vision,
    visionSub: vm?.visionSub || DEFAULT_VISION_MISSION.visionSub,
    missions: vm?.missions?.length ? vm.missions : DEFAULT_VISION_MISSION.missions,
    introParagraph1: vm?.introParagraph1 || DEFAULT_VISION_MISSION.introParagraph1,
    introParagraph2: vm?.introParagraph2 || DEFAULT_VISION_MISSION.introParagraph2,
    introParagraph3: vm?.introParagraph3 || DEFAULT_VISION_MISSION.introParagraph3,
    pillar1Title: vm?.pillar1Title || DEFAULT_VISION_MISSION.pillar1Title,
    pillar1Desc: vm?.pillar1Desc || DEFAULT_VISION_MISSION.pillar1Desc,
    pillar2Title: vm?.pillar2Title || DEFAULT_VISION_MISSION.pillar2Title,
    pillar2Desc: vm?.pillar2Desc || DEFAULT_VISION_MISSION.pillar2Desc,
  };
};

const sanitizeContactInfo = (c?: Partial<ContactInfoData> | null): ContactInfoData => {
  return {
    address: c?.address || DEFAULT_CONTACT_INFO.address,
    email: c?.email || DEFAULT_CONTACT_INFO.email,
    phone: c?.phone || DEFAULT_CONTACT_INFO.phone,
    whatsapp: c?.whatsapp || DEFAULT_CONTACT_INFO.whatsapp,
    operatingHours: c?.operatingHours || DEFAULT_CONTACT_INFO.operatingHours,
    socialFacebook: c?.socialFacebook || DEFAULT_CONTACT_INFO.socialFacebook,
    socialYoutube: c?.socialYoutube || DEFAULT_CONTACT_INFO.socialYoutube,
    socialTelegram: c?.socialTelegram || DEFAULT_CONTACT_INFO.socialTelegram,
    socialInstagram: c?.socialInstagram || DEFAULT_CONTACT_INFO.socialInstagram,
  };
};

export const AdminContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteData, setSiteData] = useState<SiteContentState>(() => {
    try {
      const saved = getInitialSiteContentSync();
      if (saved) {
        return {
          branding: sanitizeBranding(saved.branding),
          hero: sanitizeHero(saved.hero),
          visionMission: sanitizeVisionMission(saved.visionMission),
          strategicFocus: saved.strategicFocus?.length ? saved.strategicFocus : STRATEGIC_FOCUS_LIST,
          stats: saved.stats || INITIAL_NETWORK_STATS,
          memberSchools: sanitizeMemberSchoolsList(saved.memberSchools?.length ? saved.memberSchools : SAMPLE_MEMBER_SCHOOLS),
          news: saved.news?.length ? saved.news : LATEST_NEWS_LIST,
          programs: saved.programs?.length ? saved.programs : UPCOMING_PROGRAMS_LIST,
          practices: saved.practices?.length ? saved.practices : BEST_PRACTICES_LIST,
          leadership: sanitizeLeadershipList(saved.leadership?.length ? saved.leadership : LEADERSHIP_TEAM),
          media: saved.media?.length ? saved.media : MEDIA_GALLERY_LIST,
          quote: { ...DEFAULT_QUOTE, ...saved.quote },
          resources: saved.resources?.length ? saved.resources : RESOURCE_DOCS,
          cta: { ...DEFAULT_CTA, ...saved.cta },
          contactInfo: sanitizeContactInfo(saved.contactInfo),
          submissions: saved.submissions?.length ? saved.submissions : INITIAL_SUBMISSIONS,
          memberApplications: sanitizeMemberApplicationsList(saved.memberApplications?.length ? saved.memberApplications : SAMPLE_MEMBER_APPLICATIONS),
          dashboardConfig: { ...DEFAULT_DASHBOARD_CONFIG, ...(saved.dashboardConfig || {}) },
        };
      }
    } catch (e) {
      console.warn('Gagal memuatkan data simpanan tempatan:', e);
    }
    return {
      branding: DEFAULT_BRANDING,
      hero: DEFAULT_HERO,
      visionMission: DEFAULT_VISION_MISSION,
      strategicFocus: STRATEGIC_FOCUS_LIST,
      stats: INITIAL_NETWORK_STATS,
      memberSchools: sanitizeMemberSchoolsList(SAMPLE_MEMBER_SCHOOLS),
      news: LATEST_NEWS_LIST,
      programs: UPCOMING_PROGRAMS_LIST,
      practices: BEST_PRACTICES_LIST,
      leadership: sanitizeLeadershipList(LEADERSHIP_TEAM),
      media: MEDIA_GALLERY_LIST,
      quote: DEFAULT_QUOTE,
      resources: RESOURCE_DOCS,
      cta: DEFAULT_CTA,
      contactInfo: DEFAULT_CONTACT_INFO,
      submissions: INITIAL_SUBMISSIONS,
      memberApplications: sanitizeMemberApplicationsList(SAMPLE_MEMBER_APPLICATIONS),
      dashboardConfig: DEFAULT_DASHBOARD_CONFIG,
    };
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Helper to persist any CMS content section to Firestore in real-time across devices
  const saveCmsContentToFirestore = async (patch: Partial<SiteContentState>) => {
    try {
      setSyncStatus('syncing');
      await ensureFirebaseAuth().catch(() => null);
      await setDoc(
        doc(db, 'siteSettings', 'cmsContent'),
        {
          ...patch,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Ralat menyimpan tetapan CMS ke Firestore:', err);
      setSyncStatus('error');
    }
  };

  // Hydrate full content from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    getFullSiteContentAsync().then((idbData) => {
      if (isMounted && idbData) {
        setSiteData((prev) => ({
          branding: sanitizeBranding(idbData.branding ? { ...prev.branding, ...idbData.branding } : prev.branding),
          hero: sanitizeHero(idbData.hero ? { ...prev.hero, ...idbData.hero } : prev.hero),
          visionMission: sanitizeVisionMission(idbData.visionMission ? { ...prev.visionMission, ...idbData.visionMission } : prev.visionMission),
          strategicFocus: idbData.strategicFocus?.length ? idbData.strategicFocus : prev.strategicFocus,
          stats: idbData.stats || prev.stats,
          memberSchools: sanitizeMemberSchoolsList(idbData.memberSchools?.length ? idbData.memberSchools : prev.memberSchools),
          news: idbData.news?.length ? idbData.news : prev.news,
          programs: idbData.programs?.length ? idbData.programs : prev.programs,
          practices: idbData.practices?.length ? idbData.practices : prev.practices,
          leadership: sanitizeLeadershipList(idbData.leadership?.length ? idbData.leadership : prev.leadership),
          media: idbData.media?.length ? idbData.media : prev.media,
          quote: { ...prev.quote, ...(idbData.quote || {}) },
          resources: idbData.resources?.length ? idbData.resources : prev.resources,
          cta: { ...prev.cta, ...(idbData.cta || {}) },
          contactInfo: sanitizeContactInfo(idbData.contactInfo ? { ...prev.contactInfo, ...idbData.contactInfo } : prev.contactInfo),
          submissions: idbData.submissions?.length ? idbData.submissions : prev.submissions,
          memberApplications: sanitizeMemberApplicationsList(idbData.memberApplications?.length ? idbData.memberApplications : prev.memberApplications),
        }));
      }
    }).catch((err) => {
      console.warn('Pemuatan simpanan tempatan notis:', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for portal profile updates or external storage synchronization
  useEffect(() => {
    const handleContentUpdated = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SITE_CONTENT);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.memberSchools && parsed.memberSchools.length > 0) {
            setSiteData((prev) => ({
              ...prev,
              memberSchools: sanitizeMemberSchoolsList(parsed.memberSchools),
            }));
          }
        }
      } catch (e) {
        console.warn('Error handling content update event:', e);
      }
    };

    window.addEventListener('mpgbsim_content_updated', handleContentUpdated);
    window.addEventListener('storage', handleContentUpdated);
    return () => {
      window.removeEventListener('mpgbsim_content_updated', handleContentUpdated);
      window.removeEventListener('storage', handleContentUpdated);
    };
  }, []);

  // Admin authentication state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const savedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      if (savedAdmin) {
        return JSON.parse(savedAdmin);
      }
    } catch (e) {
      console.warn('Gagal memuatkan sesi admin:', e);
    }
    return null;
  });

  // Modal display states
  const [isCMSOpen, setIsCMSOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Event Registrations state (Pendaftaran Acara & Rekod Kehadiran)
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(DEFAULT_EVENT_REGISTRATIONS);

  // Sync to IndexedDB + safe localStorage whenever siteData changes
  useEffect(() => {
    persistSiteContent(siteData).catch((err) => {
      console.warn('Ralat latar belakang ketika menyimpan tapak:', err);
    });
  }, [siteData]);

  // Sync admin session
  useEffect(() => {
    if (adminUser) {
      safeLocalStorageSet(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminUser));
    } else {
      safeLocalStorageRemove(STORAGE_KEYS.ADMIN_SESSION);
    }
  }, [adminUser]);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isAuthorizedAdminEmail(user.email)) {
          setAdminUser({
            email: user.email!,
            name: user.displayName || 'Pegawai Pentadbir MPGBSIM',
            role: 'admin',
            loginTime: new Date().toISOString(),
            photoUrl: user.photoURL || undefined,
          });

          // Ensure admin record in Firestore exists
          try {
            await setDoc(
              doc(db, 'admins', user.uid),
              {
                email: user.email,
                name: user.displayName || 'Pegawai Pentadbir MPGBSIM',
                role: 'admin',
                lastLogin: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (e) {
            console.warn('Admin record sync notice:', e);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Cloud Firestore Listeners
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // 0. Unified CMS Content listener (Hero, Vision/Mission, Strategic Focus, Stats, Quote, CTA, Leadership, Resources, Branding)
    try {
      const unsubCmsContent = onSnapshot(
        doc(db, 'siteSettings', 'cmsContent'),
        (docSnap) => {
          if (docSnap.exists()) {
            const d = docSnap.data();
            setSiteData((prev) => ({
              ...prev,
              branding: d.branding ? { ...prev.branding, ...d.branding } : prev.branding,
              hero: d.hero ? { ...prev.hero, ...d.hero } : prev.hero,
              visionMission: d.visionMission ? { ...prev.visionMission, ...d.visionMission } : prev.visionMission,
              strategicFocus: d.strategicFocus && d.strategicFocus.length ? d.strategicFocus : prev.strategicFocus,
              stats: d.stats ? { ...prev.stats, ...d.stats } : prev.stats,
              quote: d.quote ? { ...prev.quote, ...d.quote } : prev.quote,
              cta: d.cta ? { ...prev.cta, ...d.cta } : prev.cta,
              contactInfo: d.contactInfo ? { ...prev.contactInfo, ...d.contactInfo } : prev.contactInfo,
              leadership: sanitizeLeadershipList(d.leadership && d.leadership.length ? d.leadership : prev.leadership),
              resources: d.resources && d.resources.length ? d.resources : prev.resources,
              dashboardConfig: d.dashboardConfig ? { ...prev.dashboardConfig, ...d.dashboardConfig } : prev.dashboardConfig,
            }));
            setSyncStatus('synced');
            setLastSyncedAt(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }));
          }
        },
        (err) => {
          console.warn('Firestore CMS Content listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubCmsContent);
    } catch (e) {
      console.warn('CMS Content listener setup error:', e);
    }

    // 1. News listener
    try {
      const unsubNews = onSnapshot(
        collection(db, 'news'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: NewsItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setSiteData((prev) => ({ ...prev, news: sortNewsByPublishedDate(list) }));
          }
        },
        (err) => {
          console.warn('Firestore News listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubNews);
    } catch (e) {
      console.warn('News listener setup:', e);
    }

    // 2. Events listener
    try {
      const unsubEvents = onSnapshot(
        collection(db, 'events'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ProgramEvent[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setSiteData((prev) => ({ ...prev, programs: list }));
          }
        },
        (err) => {
          console.warn('Firestore Events listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubEvents);
    } catch (e) {
      console.warn('Events listener setup:', e);
    }

    // 2b. Event Registrations listener (Real-time participant tracking)
    try {
      const unsubEventRegs = onSnapshot(
        collection(db, 'eventRegistrations'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: EventRegistration[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            list.sort(
              (a, b) =>
                new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime()
            );
            setEventRegistrations(list);
          } else {
            setEventRegistrations(DEFAULT_EVENT_REGISTRATIONS);
          }
        },
        (err) => {
          console.warn('Firestore eventRegistrations listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubEventRegs);
    } catch (e) {
      console.warn('eventRegistrations listener setup:', e);
    }

    // 3. Best Practices listener
    try {
      const unsubPractices = onSnapshot(
        collection(db, 'bestPractices'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: BestPracticeItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setSiteData((prev) => ({ ...prev, practices: list }));
          }
        },
        (err) => {
          console.warn('Firestore Practices listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubPractices);
    } catch (e) {
      console.warn('Practices listener setup:', e);
    }

    // 4. Schools listener
    try {
      const unsubSchools = onSnapshot(
        collection(db, 'schools'),
        (snapshot) => {
          if (!snapshot.empty) {
            const rawList: MemberSchool[] = [];
            snapshot.forEach((docSnap) => {
              rawList.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            const list = sanitizeMemberSchoolsList(rawList);
            setSiteData((prev) => ({
              ...prev,
              memberSchools: list,
            }));
            setSyncStatus('synced');
          }
        },
        (err) => {
          console.warn('Firestore Schools listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubSchools);
    } catch (e) {
      console.warn('Schools listener setup:', e);
    }

    // 5. Media listener
    try {
      const unsubMedia = onSnapshot(
        collection(db, 'media'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: MediaItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setSiteData((prev) => ({ ...prev, media: list }));
          }
        },
        (err) => {
          console.warn('Firestore Media listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubMedia);
    } catch (e) {
      console.warn('Media listener setup:', e);
    }

    // 5b. Resources listener
    try {
      const unsubResources = onSnapshot(
        collection(db, 'resources'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ResourceDocument[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setSiteData((prev) => ({ ...prev, resources: list }));
          }
        },
        (err) => {
          console.warn('Firestore Resources listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubResources);
    } catch (e) {
      console.warn('Resources listener setup:', e);
    }

    // 5c. Leadership listener (Barisan Kepimpinan PGB Kebangsaan)
    try {
      const unsubLeadership = onSnapshot(
        collection(db, 'leadership'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: LeaderProfile[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setSiteData((prev) => ({ ...prev, leadership: sanitizeLeadershipList(list) }));
          }
        },
        (err) => {
          console.warn('Firestore Leadership listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubLeadership);
    } catch (e) {
      console.warn('Leadership listener setup:', e);
    }

    // 6. Site Settings listener
    try {
      const unsubSettings = onSnapshot(
        doc(db, 'siteSettings', 'general'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSiteData((prev) => ({
              ...prev,
              branding: { ...prev.branding, ...(data.branding || {}) },
              contactInfo: { ...prev.contactInfo, ...(data.contactInfo || {}) },
            }));
          }
        },
        (err) => {
          console.warn('Firestore Settings listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubSettings);
    } catch (e) {
      console.warn('Settings listener setup:', e);
    }

    // 6b. Dashboard Config listener
    try {
      const unsubDashboard = onSnapshot(
        doc(db, 'siteSettings', 'dashboard'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSiteData((prev) => ({
              ...prev,
              dashboardConfig: {
                ...DEFAULT_DASHBOARD_CONFIG,
                ...(data as any),
              },
            }));
          }
        },
        (err) => {
          console.warn('Firestore Dashboard Settings listener notification:', err.message);
        }
      );
      unsubscribes.push(unsubDashboard);
    } catch (e) {
      console.warn('Dashboard Settings listener setup:', e);
    }

    // 7. Submissions listener (Admin only)
    if (adminUser) {
      try {
        const unsubSubmissions = onSnapshot(
          collection(db, 'submissions'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: ContactSubmission[] = [];
              snapshot.forEach((docSnap) => {
                const d = docSnap.data();
                list.push({
                  id: docSnap.id,
                  name: d.name || 'Pengirim',
                  email: d.email || '',
                  phone: d.phone || '',
                  subject: d.subject || 'Pertanyaan Umum',
                  message: d.message || '',
                  date: d.createdAt || new Date().toISOString(),
                  status: d.status || 'unread',
                });
              });
              setSiteData((prev) => ({ ...prev, submissions: list }));
            }
          },
          (err) => {
            console.warn('Firestore Submissions listener notification:', err.message);
          }
        );
        unsubscribes.push(unsubSubmissions);
      } catch (e) {
        console.warn('Submissions listener setup:', e);
      }

      // 8. Member Applications listener (Admin only)
      try {
        const unsubApplications = onSnapshot(
          collection(db, 'memberApplications'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list: MemberApplication[] = [];
              snapshot.forEach((docSnap) => {
                const d = docSnap.data();
                // If it is Musleh, it is already a registered member school, clean it up from applications
                if (
                  docSnap.id === 'app-musleh-01' ||
                  d.schoolCode === 'MJAC011' ||
                  d.schoolCode === 'MIA1009' ||
                  d.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
                  (d.schoolName && d.schoolName.toLowerCase().includes('musleh'))
                ) {
                  deleteDoc(doc(db, 'memberApplications', docSnap.id)).catch(() => {});
                  return;
                }
                list.push({
                  id: docSnap.id,
                  refId: d.refId || docSnap.id,
                  fullName: d.fullName || 'Pemohon',
                  icNumber: d.icNumber || '',
                  email: d.email || '',
                  phoneNumber: d.phoneNumber || '',
                  designation: d.designation || 'Pengetua',
                  serviceStartYear: Number(d.serviceStartYear) || 2026,
                  schoolName: d.schoolName || '',
                  schoolCode: d.schoolCode || '',
                  schoolType: d.schoolType || 'Maahad Tahfiz',
                  state: d.state || '',
                  district: d.district || '',
                  website: d.website || '',
                  studentCount: Number(d.studentCount) || 0,
                  teacherCount: Number(d.teacherCount) || 0,
                  logoUrl: d.logoUrl || '',
                  schoolDescription: d.schoolDescription || '',
                  address: d.address || '',
                  status: d.status || 'pending',
                  submittedAt: d.submittedAt || new Date().toISOString(),
                  approvedAt: d.approvedAt,
                  approvedBy: d.approvedBy,
                });
              });
              setSiteData((prev) => ({ ...prev, memberApplications: sanitizeMemberApplicationsList(list) }));
            }
          },
          (err) => {
            console.warn('Firestore MemberApplications listener notification:', err.message);
          }
        );
        unsubscribes.push(unsubApplications);
      } catch (e) {
        console.warn('MemberApplications listener setup:', e);
      }
    }

    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
  }, [adminUser]);

  // Google Sign-In with unauthorized-domain detection and detailed guidance
  const loginWithGoogle = async (): Promise<{
    success: boolean;
    message: string;
    isUnauthorizedDomain?: boolean;
    domain?: string;
  }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (isAuthorizedAdminEmail(user.email)) {
        const newAdmin: AdminUser = {
          email: user.email || 'mpgbsim.cemerlang@gmail.com',
          name: user.displayName || 'Pegawai Pentadbir MPGBSIM',
          role: 'admin',
          loginTime: new Date().toISOString(),
          photoUrl: user.photoURL || undefined,
        };
        setAdminUser(newAdmin);
        safeLocalStorageSet(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(newAdmin));

        try {
          await setDoc(
            doc(db, 'admins', user.uid),
            {
              email: user.email,
              name: user.displayName || 'Pegawai Pentadbir MPGBSIM',
              role: 'admin',
              lastLogin: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn('Admin record sync:', e);
        }

        return {
          success: true,
          message: `Log masuk Google berjaya sebagai ${user.email}. Selamat kembali ke Pusat Kawalan MPGBSIM.`,
        };
      } else {
        await signOut(auth);
        return {
          success: false,
          message: `Akses ditolak: Akaun Google (${user.email}) bukan pentadbir berdaftar MPGBSIM. Sila gunakan akaun mpgbsim.cemerlang@gmail.com.`,
        };
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const isUnauthorizedDomain =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain') ||
        String(err).includes('unauthorized-domain');

      if (isUnauthorizedDomain) {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
        return {
          success: false,
          isUnauthorizedDomain: true,
          domain: currentDomain,
          message: `Domain '${currentDomain}' belum didaftarkan dalam 'Authorized domains' Firebase Console. Sila gunakan Log Masuk Pantas Pentadbir di bawah atau daftarkan domain di Firebase Console.`,
        };
      }

      return {
        success: false,
        message: err?.message || 'Ralat semasa log masuk dengan Google.',
      };
    }
  };

  // Email/Password login with authorized master passcode fallback
  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Verify official MPGBSIM administrator email
    if (!isAuthorizedAdminEmail(cleanEmail)) {
      return {
        success: false,
        message: `Emel "${cleanEmail}" bukan emel pentadbir bertauliah MPGBSIM. Sila gunakan akaun mpgbsim.cemerlang@gmail.com.`,
      };
    }

    // 2. Master passcodes for MPGBSIM official administrators
    const validMasterPasscodes = [
      'MPGB@Admin2026',
      'Admin@2026',
      'MPGBSIM2026',
      'mpgbsim2026',
      'AdminMPGB2026',
    ];

    if (validMasterPasscodes.includes(cleanPass)) {
      const newAdmin: AdminUser = {
        email: cleanEmail,
        name: 'Pegawai Pentadbir MPGBSIM (Akses Rasmi)',
        role: 'admin',
        loginTime: new Date().toISOString(),
      };
      setAdminUser(newAdmin);
      safeLocalStorageSet(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(newAdmin));
      return {
        success: true,
        message: 'Log masuk Pentadbir Rasmi berjaya! Pusat Kawalan Kandungan CMS telah diaktifkan.',
      };
    }

    // 3. Try Firebase Email Auth if configured
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (isAuthorizedAdminEmail(cred.user.email)) {
        const newAdmin: AdminUser = {
          email: cred.user.email || 'mpgbsim.cemerlang@gmail.com',
          name: cred.user.displayName || 'Pegawai Pentadbir MPGBSIM',
          role: 'admin',
          loginTime: new Date().toISOString(),
        };
        setAdminUser(newAdmin);
        safeLocalStorageSet(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(newAdmin));
        return {
          success: true,
          message: 'Log masuk Firebase berjaya. Pusat kawalan kandungan telah diaktifkan.',
        };
      }
    } catch (firebaseAuthErr: any) {
      console.warn('Admin Firebase Auth notice:', firebaseAuthErr?.message || firebaseAuthErr);
    }

    return {
      success: false,
      message: 'Kata laluan tidak tepat. Sila gunakan kata laluan pentadbir rasmi (MPGB@Admin2026) atau Log Masuk Google rasmi.',
    };
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch {}
    setAdminUser(null);
    setIsCMSOpen(false);
    setIsLogoModalOpen(false);
  };

  // One-click Firestore Initial Seeder / Full Sync across all devices
  const syncAllToFirestore = async (): Promise<{ success: boolean; message: string }> => {
    setSyncStatus('syncing');
    try {
      await ensureFirebaseAuth();
      await persistSiteContent(siteData).catch(() => {});

      let count = 0;

      // 1. Sync Central CMS Content Document (Hero, Vision/Mission, Strategic Focus, Stats, Quote, CTA, Leadership, Resources, Branding, Contact Info)
      await setDoc(
        doc(db, 'siteSettings', 'cmsContent'),
        {
          branding: siteData.branding,
          hero: siteData.hero,
          visionMission: siteData.visionMission,
          strategicFocus: siteData.strategicFocus,
          stats: siteData.stats,
          quote: siteData.quote,
          cta: siteData.cta,
          contactInfo: siteData.contactInfo,
          leadership: siteData.leadership,
          resources: siteData.resources,
          dashboardConfig: siteData.dashboardConfig,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      count++;

      // 2. Sync News
      for (const item of siteData.news) {
        await setDoc(
          doc(db, 'news', item.id),
          {
            ...item,
            status: item.status || 'published',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      // 3. Sync Events
      for (const item of siteData.programs) {
        await setDoc(
          doc(db, 'events', item.id),
          {
            ...item,
            status: item.status || 'upcoming',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      // 4. Sync Practices
      for (const item of siteData.practices) {
        await setDoc(
          doc(db, 'bestPractices', item.id),
          {
            ...item,
            status: item.status || 'published',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      // 5. Sync Schools
      for (const item of siteData.memberSchools) {
        await setDoc(
          doc(db, 'schools', item.id),
          {
            ...item,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      // 6. Sync Media
      for (const item of siteData.media) {
        await setDoc(
          doc(db, 'media', item.id),
          {
            ...item,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      // 7. Sync Resources
      for (const item of siteData.resources) {
        await setDoc(
          doc(db, 'resources', item.id),
          {
            ...item,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      // 8. Sync General Settings
      await setDoc(
        doc(db, 'siteSettings', 'general'),
        {
          branding: siteData.branding,
          contactInfo: siteData.contactInfo,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      count++;

      // 9. Sync Dashboard Config
      await setDoc(
        doc(db, 'siteSettings', 'dashboard'),
        {
          ...(siteData.dashboardConfig || DEFAULT_DASHBOARD_CONFIG),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      count++;

      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }));

      return {
        success: true,
        message: `Penyelarasan berjaya: Semua ${count} bahagian kandungan telah dimuat naik ke Cloud Firestore! Kini terselaras pada semua peranti (PC & Android).`,
      };
    } catch (err: any) {
      setSyncStatus('error');
      console.warn('Firestore sync notice:', err?.message || err);
      return {
        success: false,
        message: `Ralat penyelarasan: ${err?.message || 'Gagal menyegerak ke Firestore.'}`,
      };
    }
  };

  // Logo update method
  const updateLogo = (newLogoUrl: string) => {
    const updatedBranding = { ...siteData.branding, logoUrl: newLogoUrl };
    setSiteData((prev) => ({
      ...prev,
      branding: updatedBranding,
    }));
    saveCmsContentToFirestore({ branding: updatedBranding });
    setDoc(
      doc(db, 'siteSettings', 'general'),
      {
        branding: updatedBranding,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  };

  const resetLogoToDefault = () => {
    const defaultLogo = '/mpgbsim-official-logo.png';
    const updatedBranding = { ...siteData.branding, logoUrl: defaultLogo };
    setSiteData((prev) => ({
      ...prev,
      branding: updatedBranding,
    }));
    saveCmsContentToFirestore({ branding: updatedBranding });
    setDoc(
      doc(db, 'siteSettings', 'general'),
      {
        branding: updatedBranding,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  };

  const updateBranding = (data: Partial<BrandingData>) => {
    const updated = { ...siteData.branding, ...data };
    setSiteData((prev) => ({
      ...prev,
      branding: updated,
    }));
    saveCmsContentToFirestore({ branding: updated });
    setDoc(
      doc(db, 'siteSettings', 'general'),
      {
        branding: updated,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  };

  const updateVisionMission = (data: Partial<VisionMissionData>) => {
    const updated = { ...siteData.visionMission, ...data };
    setSiteData((prev) => ({
      ...prev,
      visionMission: updated,
    }));
    saveCmsContentToFirestore({ visionMission: updated });
  };

  const updateStats = (data: NetworkStats) => {
    setSiteData((prev) => ({
      ...prev,
      stats: data,
    }));
    saveCmsContentToFirestore({ stats: data });
  };

  // 1. News CRUD
  const addNews = async (item: NewsItem) => {
    setSiteData((prev) => ({
      ...prev,
      news: sortNewsByPublishedDate([item, ...prev.news]),
    }));
    try {
      await setDoc(doc(db, 'news', item.id), {
        ...item,
        status: item.status || 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore write news notice:', e);
    }
  };

  const updateNews = async (id: string, updated: Partial<NewsItem>) => {
    setSiteData((prev) => ({
      ...prev,
      news: sortNewsByPublishedDate(prev.news.map((item) => (item.id === id ? { ...item, ...updated } : item))),
    }));
    try {
      await updateDoc(doc(db, 'news', id), {
        ...updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore update news notice:', e);
    }
  };

  const deleteNews = async (id: string) => {
    setSiteData((prev) => {
      const updatedNews = prev.news.filter((item) => item.id !== id);
      const updatedSiteData = { ...prev, news: updatedNews };
      persistSiteContent(updatedSiteData).catch(() => {});
      return updatedSiteData;
    });

    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (e) {
      console.warn('Firestore delete news notice:', e);
    }

    try {
      window.dispatchEvent(
        new CustomEvent('mpgbsim_content_updated', {
          detail: { type: 'news_deleted', deletedNewsId: id },
        })
      );
    } catch (e) {}
  };

  // 2. Events CRUD
  const addProgram = async (item: ProgramEvent) => {
    setSiteData((prev) => ({
      ...prev,
      programs: [item, ...prev.programs],
    }));
    try {
      await setDoc(doc(db, 'events', item.id), {
        ...item,
        status: item.status || 'upcoming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore write event notice:', e);
    }
  };

  const updateProgram = async (id: string, updated: Partial<ProgramEvent>) => {
    setSiteData((prev) => ({
      ...prev,
      programs: prev.programs.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
    try {
      await updateDoc(doc(db, 'events', id), {
        ...updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore update event notice:', e);
    }
  };

  const deleteProgram = async (id: string) => {
    setSiteData((prev) => ({
      ...prev,
      programs: prev.programs.filter((p) => p.id !== id),
    }));
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (e) {
      console.warn('Firestore delete event notice:', e);
    }
  };

  // Event Registration & Live Capacity Management
  const registerForEvent = async (
    eventId: string,
    participantData: Omit<EventRegistration, 'id' | 'eventId' | 'eventTitle' | 'registeredAt' | 'status'>
  ): Promise<{ success: boolean; message: string; registrationId?: string }> => {
    const targetEvent = siteData.programs?.find((p) => p.id === eventId);
    const eventTitle = targetEvent?.title || 'Program MPGBSIM';
    const eventDate = targetEvent?.date || new Date().toISOString().split('T')[0];

    const spotsTotal = targetEvent?.spotsTotal || 100;
    const currentSpotsFilled = targetEvent?.spotsFilled || 0;

    if (currentSpotsFilled >= spotsTotal) {
      return {
        success: false,
        message: `Maaf, kapasiti bagi program "${eventTitle}" telah penuh (${spotsTotal}/${spotsTotal} peserta). Pendaftaran telah ditutup.`,
      };
    }

    const newSpotsFilled = currentSpotsFilled + 1;
    const isNowFull = newSpotsFilled >= spotsTotal;
    const registrationId = `reg-${Date.now()}`;

    const newRegistration: EventRegistration = {
      id: registrationId,
      eventId,
      eventTitle,
      eventDate,
      participantName: participantData.participantName.trim(),
      participantEmail: participantData.participantEmail.trim().toLowerCase(),
      participantPhone: participantData.participantPhone?.trim() || '',
      schoolName: participantData.schoolName.trim(),
      position: participantData.position?.trim() || 'Peserta',
      state: participantData.state?.trim() || 'Selangor',
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      attendanceCode: `MPGB-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: participantData.notes?.trim() || '',
    };

    // Update local registrations list immediately
    setEventRegistrations((prev) => [newRegistration, ...prev.filter((r) => r.id !== registrationId)]);

    // Update local program capacity state in real time
    setSiteData((prev) => ({
      ...prev,
      programs: (prev.programs || []).map((prog) =>
        prog.id === eventId
          ? {
              ...prog,
              spotsFilled: newSpotsFilled,
              registrationOpen: !isNowFull,
            }
          : prog
      ),
    }));

    // 1. Save participant registration document to Firestore collection 'eventRegistrations'
    setDoc(doc(db, 'eventRegistrations', registrationId), newRegistration, { merge: true }).catch((err) => {
      console.warn('Ralat menyimpan pendaftaran ke Firestore:', err);
    });

    // 2. Increment program spotsFilled in Firestore collection 'events'
    setDoc(
      doc(db, 'events', eventId),
      {
        ...(targetEvent || {}),
        id: eventId,
        title: eventTitle,
        spotsFilled: newSpotsFilled,
        registrationOpen: !isNowFull,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch((err) => {
      console.warn('Ralat mengemaskini kapasiti acara ke Firestore:', err);
    });

    // 3. Mirror to submissions for unified administrative visibility
    setDoc(
      doc(db, 'submissions', registrationId),
      {
        id: registrationId,
        submitter: newRegistration.participantName,
        submitterEmail: newRegistration.participantEmail,
        school: newRegistration.schoolName,
        type: 'Pendaftaran Program',
        title: `Pendaftaran: ${eventTitle}`,
        content: `Nama: ${newRegistration.participantName} (${newRegistration.position}), Sekolah: ${newRegistration.schoolName}, Telefon: ${newRegistration.participantPhone}, Program: ${eventTitle}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Submitted',
      },
      { merge: true }
    ).catch(() => {});

    return {
      success: true,
      message: `Pendaftaran bagi "${eventTitle}" berjaya! No. Rujukan: ${newRegistration.attendanceCode}. Baki tempat: ${spotsTotal - newSpotsFilled}.`,
      registrationId,
    };
  };

  const updateEventRegistrationStatus = async (
    regId: string,
    status: 'confirmed' | 'attended' | 'cancelled'
  ): Promise<void> => {
    const existing = eventRegistrations.find((r) => r.id === regId);
    setEventRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, status } : r))
    );

    // Dynamic capacity adjustment if status changes to/from 'cancelled'
    if (existing && existing.eventId) {
      const wasCancelled = existing.status === 'cancelled';
      const isNowCancelled = status === 'cancelled';
      if (!wasCancelled && isNowCancelled) {
        // Decrement spots
        const targetEvent = siteData.programs?.find((p) => p.id === existing.eventId);
        if (targetEvent) {
          const newSpotsFilled = Math.max((targetEvent.spotsFilled || 0) - 1, 0);
          setSiteData((prev) => ({
            ...prev,
            programs: (prev.programs || []).map((prog) =>
              prog.id === existing.eventId
                ? { ...prog, spotsFilled: newSpotsFilled, registrationOpen: true }
                : prog
            ),
          }));
          setDoc(
            doc(db, 'events', existing.eventId),
            { spotsFilled: newSpotsFilled, registrationOpen: true, updatedAt: new Date().toISOString() },
            { merge: true }
          ).catch(() => {});
        }
      } else if (wasCancelled && !isNowCancelled) {
        // Re-increment spots
        const targetEvent = siteData.programs?.find((p) => p.id === existing.eventId);
        if (targetEvent) {
          const newSpotsFilled = (targetEvent.spotsFilled || 0) + 1;
          const isFull = newSpotsFilled >= (targetEvent.spotsTotal || 100);
          setSiteData((prev) => ({
            ...prev,
            programs: (prev.programs || []).map((prog) =>
              prog.id === existing.eventId
                ? { ...prog, spotsFilled: newSpotsFilled, registrationOpen: !isFull }
                : prog
            ),
          }));
          setDoc(
            doc(db, 'events', existing.eventId),
            { spotsFilled: newSpotsFilled, registrationOpen: !isFull, updatedAt: new Date().toISOString() },
            { merge: true }
          ).catch(() => {});
        }
      }
    }

    try {
      await setDoc(
        doc(db, 'eventRegistrations', regId),
        { status, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (e) {
      console.warn('Ralat mengemaskini status pendaftaran:', e);
    }
  };

  const deleteEventRegistration = async (regId: string, eventId: string): Promise<void> => {
    const reg = eventRegistrations.find((r) => r.id === regId);
    setEventRegistrations((prev) => prev.filter((r) => r.id !== regId));
    try {
      await deleteDoc(doc(db, 'eventRegistrations', regId));
    } catch (e) {
      console.warn('Ralat memadam rekod pendaftaran:', e);
    }

    // Decrement spotsFilled on the event if registration was active
    if (reg && reg.status !== 'cancelled') {
      const targetEvent = siteData.programs?.find((p) => p.id === eventId);
      if (targetEvent) {
        const newSpotsFilled = Math.max((targetEvent.spotsFilled || 0) - 1, 0);
        setSiteData((prev) => ({
          ...prev,
          programs: (prev.programs || []).map((prog) =>
            prog.id === eventId
              ? { ...prog, spotsFilled: newSpotsFilled, registrationOpen: true }
              : prog
          ),
        }));
        setDoc(
          doc(db, 'events', eventId),
          { spotsFilled: newSpotsFilled, registrationOpen: true, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
      }
    }
  };

  // 3. Best Practices CRUD
  const addPractice = async (item: BestPracticeItem) => {
    setSiteData((prev) => ({
      ...prev,
      practices: [item, ...prev.practices],
    }));
    try {
      await setDoc(doc(db, 'bestPractices', item.id), {
        ...item,
        status: item.status || 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'practices', item.id), {
        ...item,
        status: item.status || 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore write practice notice:', e);
    }
  };

  const updatePractice = async (id: string, updated: Partial<BestPracticeItem>) => {
    setSiteData((prev) => ({
      ...prev,
      practices: prev.practices.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
    try {
      await updateDoc(doc(db, 'bestPractices', id), {
        ...updated,
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'practices', id), {
        ...updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore update practice notice:', e);
    }
  };

  const deletePractice = async (id: string) => {
    setSiteData((prev) => ({
      ...prev,
      practices: prev.practices.filter((p) => p.id !== id),
    }));
    try {
      await deleteDoc(doc(db, 'bestPractices', id));
      await deleteDoc(doc(db, 'practices', id));
    } catch (e) {
      console.warn('Firestore delete practice notice:', e);
    }
  };

  // 4. Member Schools CRUD
  const addMemberSchool = async (item: MemberSchool) => {
    setSiteData((prev) => ({
      ...prev,
      memberSchools: [item, ...prev.memberSchools],
    }));
    try {
      await setDoc(doc(db, 'schools', item.id), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore write school notice:', e);
    }
  };

  const updateMemberSchool = async (id: string, updated: Partial<MemberSchool>) => {
    let finalUpdatedSchools: MemberSchool[] = [];
    let updatedSchoolObj: MemberSchool | null = null;

    setSiteData((prev) => {
      finalUpdatedSchools = prev.memberSchools.map((s) => {
        const isMatch =
          s.id === id ||
          (updated.code && s.code && s.code.toLowerCase().trim() === updated.code.toLowerCase().trim()) ||
          (id === 'sch-musleh-1' && (s.code === 'MJAC011' || s.code === 'MIA1009' || s.id === 'sch-musleh-1')) ||
          (updated.name && s.name && s.name.toLowerCase().trim() === updated.name.toLowerCase().trim());

        if (isMatch) {
          const merged: MemberSchool = {
            ...s,
            ...updated,
            updatedAt: new Date().toISOString(),
          };
          updatedSchoolObj = merged;
          return merged;
        }
        return s;
      });

      const nextState = {
        ...prev,
        memberSchools: finalUpdatedSchools,
      };

      // Directly persist to IndexedDB and localStorage without waiting
      persistSiteContent(nextState).catch(() => {});

      return nextState;
    });

    // 1. Persist to Firestore with setDoc merge: true
    try {
      await ensureFirebaseAuth();
      await setDoc(
        doc(db, 'schools', id),
        {
          ...updated,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      if (id === 'sch-musleh-1' || updated.code === 'MJAC011') {
        await setDoc(
          doc(db, 'schools', 'sch-musleh-1'),
          { ...updated, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
      }
    } catch (e) {
      console.warn('Firestore update school notice:', e);
    }

    // 2. Persist to localStorage directly (both v3 and legacy)
    try {
      ['mpgbsim_cms_content_v3', 'mpgbsim_cms_content'].forEach((key) => {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.memberSchools && Array.isArray(parsed.memberSchools)) {
            parsed.memberSchools = parsed.memberSchools.map((s: MemberSchool) => {
              const isMatch =
                s.id === id ||
                (updated.code && s.code && s.code.toLowerCase().trim() === updated.code.toLowerCase().trim()) ||
                (id === 'sch-musleh-1' && (s.code === 'MJAC011' || s.code === 'MIA1009' || s.id === 'sch-musleh-1')) ||
                (updated.name && s.name && s.name.toLowerCase().trim() === updated.name.toLowerCase().trim());
              return isMatch ? { ...s, ...updated, updatedAt: new Date().toISOString() } : s;
            });
            safeLocalStorageSet(key, JSON.stringify(parsed));
          }
        }
      });
    } catch (e) {}

    // 3. INTEGRATE WITH MEMBER PORTAL:
    // If the currently logged-in portal user belongs to this school, synchronize the user profile immediately
    try {
      const portalUserRaw = localStorage.getItem('mpgbsim_portal_user_v1');
      if (portalUserRaw) {
        const portalUser = JSON.parse(portalUserRaw);
        const matchMusleh =
          (id === 'sch-musleh-1' || updated.code === 'MJAC011') &&
          (portalUser.email?.includes('imusleh') ||
            portalUser.school?.toLowerCase().includes('musleh') ||
            portalUser.membershipNo?.includes('MJAC011') ||
            portalUser.membershipNo?.includes('MIA1009'));
        const matchId =
          portalUser.uid === `sch-user-${id}` ||
          portalUser.uid?.includes(id);
        const matchCode =
          (portalUser.membershipNo && updated.code && portalUser.membershipNo.includes(updated.code)) ||
          (portalUser.membershipNo && updatedSchoolObj && (updatedSchoolObj as MemberSchool).code && portalUser.membershipNo.includes((updatedSchoolObj as MemberSchool).code!));
        const matchEmail =
          (portalUser.email && updated.email && portalUser.email.toLowerCase() === updated.email.toLowerCase()) ||
          (portalUser.email && updatedSchoolObj && (updatedSchoolObj as MemberSchool).email && portalUser.email.toLowerCase() === (updatedSchoolObj as MemberSchool).email?.toLowerCase());
        const matchSchoolName =
          (portalUser.school && updated.name && portalUser.school.toLowerCase().trim() === updated.name.toLowerCase().trim()) ||
          (portalUser.school && updatedSchoolObj && (updatedSchoolObj as MemberSchool).name && portalUser.school.toLowerCase().trim() === (updatedSchoolObj as MemberSchool).name.toLowerCase().trim());

        if (matchMusleh || matchId || matchCode || matchEmail || matchSchoolName) {
          if (updated.principal) {
            portalUser.fullName = updated.principal;
          }
          if (updated.name) {
            portalUser.school = updated.name;
          }
          if (updated.state) {
            portalUser.state = updated.state;
          }
          if (updated.phone) {
            portalUser.phone = updated.phone;
          }
          if (updated.principalPhotoUrl) {
            portalUser.photoURL = updated.principalPhotoUrl;
          }
          if (updated.schoolPhotoUrl) {
            portalUser.schoolPhotoUrl = updated.schoolPhotoUrl;
          }
          if (updated.logoUrl) {
            portalUser.logoUrl = updated.logoUrl;
          }
          if (updated.serviceStartYear) {
            portalUser.serviceStartYear = updated.serviceStartYear;
            portalUser.pgbStartYear = updated.serviceStartYear;
          }
          portalUser.updatedAt = new Date().toISOString();
          safeLocalStorageSet('mpgbsim_portal_user_v1', JSON.stringify(portalUser));

          if (portalUser.uid) {
            setDoc(doc(db, 'users', portalUser.uid), portalUser, { merge: true }).catch(() => {});
          }
        }
      }
    } catch (e) {}

    // 4. Broadcast events so both Portal and Website update immediately
    window.dispatchEvent(new CustomEvent('mpgbsim_school_updated', {
      detail: {
        id,
        updated,
        school: updatedSchoolObj || updated,
      }
    }));
    window.dispatchEvent(new Event('mpgbsim_content_updated'));
  };

  const deleteMemberSchool = async (id: string) => {
    setSiteData((prev) => ({
      ...prev,
      memberSchools: prev.memberSchools.filter((s) => s.id !== id),
    }));
    try {
      await deleteDoc(doc(db, 'schools', id));
    } catch (e) {
      console.warn('Firestore delete school notice:', e);
    }
  };

  // 4c. School Diagnostic & Integrity Repair
  const runSchoolDiagnostics = (): DiagnosticReport => {
    const portalUserRaw = typeof window !== 'undefined' ? localStorage.getItem('mpgbsim_portal_user_v1') : null;
    const portalUser = portalUserRaw ? JSON.parse(portalUserRaw) : null;
    return runSchoolDiagnostic(siteData.memberSchools || [], portalUser);
  };

  const autoRepairSchoolIntegrity = () => {
    const portalUserRaw = typeof window !== 'undefined' ? localStorage.getItem('mpgbsim_portal_user_v1') : null;
    const portalUser = portalUserRaw ? JSON.parse(portalUserRaw) : null;
    const { repairedSchools, repairedUser, actionsTaken } = repairSchoolIntegrity(
      siteData.memberSchools || [],
      portalUser
    );

    setSiteData((prev) => {
      const nextState = {
        ...prev,
        memberSchools: repairedSchools,
      };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });

    // 1. Persist to local storage
    try {
      ['mpgbsim_cms_content_v3', 'mpgbsim_cms_content'].forEach((key) => {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.memberSchools = repairedSchools;
          safeLocalStorageSet(key, JSON.stringify(parsed));
        }
      });
      if (repairedUser) {
        safeLocalStorageSet('mpgbsim_portal_user_v1', JSON.stringify(repairedUser));
      }
    } catch (e) {}

    // 2. Persist to Firestore
    repairedSchools.forEach((sch) => {
      setDoc(doc(db, 'schools', sch.id), sch, { merge: true }).catch(() => {});
    });
    if (repairedUser?.uid) {
      setDoc(doc(db, 'users', repairedUser.uid), repairedUser, { merge: true }).catch(() => {});
    }

    // 3. Broadcast events
    window.dispatchEvent(new Event('mpgbsim_school_updated'));
    window.dispatchEvent(new Event('mpgbsim_content_updated'));

    return { repairedSchools, actionsTaken };
  };

  // 4b. Member Applications Management
  const addMemberApplication = async (item: MemberApplication) => {
    setSiteData((prev) => ({
      ...prev,
      memberApplications: [item, ...(prev.memberApplications || [])],
    }));
    try {
      await setDoc(doc(db, 'memberApplications', item.id), {
        ...item,
        submittedAt: item.submittedAt || new Date().toISOString(),
        status: item.status || 'pending',
      });
    } catch (e) {
      console.warn('Firestore write memberApplication notice:', e);
    }
  };

  const approveMemberApplication = async (id: string): Promise<{ success: boolean; message: string }> => {
    const app = siteData.memberApplications?.find((a) => a.id === id);
    if (!app) {
      return { success: false, message: 'Permohonan keahlian tidak dijumpai.' };
    }

    // 1. Create directory school record
    const newSchool: MemberSchool = {
      id: `school-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: app.schoolName,
      code: app.schoolCode || `SCH-${Date.now().toString().slice(-4)}`,
      type: app.schoolType || 'Maahad Tahfiz',
      state: app.state,
      district: app.district,
      principal: `${app.fullName} (${app.designation})`,
      principalPhotoUrl: app.pgbPhotoUrl || '',
      studentCount: Number(app.studentCount) || 0,
      teacherCount: Number(app.teacherCount) || 0,
      joinYear: app.joinYear || app.schoolJoinYear || new Date().getFullYear(),
      serviceStartYear: app.serviceStartYear,
      pgbStartYear: app.serviceStartYear,
      website: app.website || '',
      logoUrl: app.logoUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
      schoolPhotoUrl: app.schoolPhotoUrl || '',
      description: app.schoolDescription || `Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan ${app.fullName} (${app.designation}).`,
      phone: app.schoolPhone || app.phoneNumber,
      email: app.schoolEmail || app.email,
      pgbPhone: app.phoneNumber || app.pgbPhone || '',
      pgbEmail: app.email || app.pgbEmail || '',
      address: app.address || `${app.district}, ${app.state}`,
    };

    // Add to member schools (both in state and Firestore)
    await addMemberSchool(newSchool);

    // 2. Mark application as approved
    const approvedAt = new Date().toISOString();
    const approvedBy = adminUser?.email || 'admin@mpgbsim.gov.my';

    setSiteData((prev) => ({
      ...prev,
      memberApplications: (prev.memberApplications || []).map((a) =>
        a.id === id ? { ...a, status: 'approved' as const, approvedAt, approvedBy } : a
      ),
    }));

    try {
      await updateDoc(doc(db, 'memberApplications', id), {
        status: 'approved',
        approvedAt,
        approvedBy,
      });
    } catch (e) {
      console.warn('Firestore approve application error:', e);
    }

    return {
      success: true,
      message: `Permohonan ${app.schoolName} telah DILULUSKAN! Data institusi telah didaftarkan secara automatik ke dalam Direktori Sekolah Ahli Berdaftar MPGBSIM.`,
    };
  };

  const rejectMemberApplication = async (id: string, reason?: string) => {
    setSiteData((prev) => ({
      ...prev,
      memberApplications: (prev.memberApplications || []).map((a) =>
        a.id === id ? { ...a, status: 'rejected' as const } : a
      ),
    }));
    try {
      await updateDoc(doc(db, 'memberApplications', id), {
        status: 'rejected',
        rejectedReason: reason || 'Dokumen atau kriteria permohonan belum lengkap.',
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore reject application notice:', e);
    }
  };

  const deleteMemberApplication = async (id: string) => {
    setSiteData((prev) => ({
      ...prev,
      memberApplications: (prev.memberApplications || []).filter((a) => a.id !== id),
    }));
    try {
      await deleteDoc(doc(db, 'memberApplications', id));
    } catch (e) {
      console.warn('Firestore delete application notice:', e);
    }
  };

  // 5. Media CRUD
  const addMedia = async (item: MediaItem) => {
    setSiteData((prev) => ({
      ...prev,
      media: [item, ...prev.media],
    }));
    try {
      await setDoc(doc(db, 'media', item.id), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore write media notice:', e);
    }
  };

  const updateMedia = async (id: string, updated: Partial<MediaItem>) => {
    setSiteData((prev) => ({
      ...prev,
      media: prev.media.map((m) => (m.id === id ? { ...m, ...updated } : m)),
    }));
    try {
      await updateDoc(doc(db, 'media', id), {
        ...updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore update media notice:', e);
    }
  };

  const deleteMedia = async (id: string) => {
    setSiteData((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m.id !== id),
    }));
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (e) {
      console.warn('Firestore delete media notice:', e);
    }
  };

  // 6. Contact Info & Settings
  const updateContactInfo = async (data: Partial<ContactInfoData>) => {
    const updated = { ...siteData.contactInfo, ...data };
    setSiteData((prev) => ({
      ...prev,
      contactInfo: updated,
    }));
    try {
      await setDoc(
        doc(db, 'siteSettings', 'general'),
        {
          contactInfo: updated,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore update contact notice:', e);
    }
  };

  // 7. Submissions CRUD
  const addSubmission = async (sub: Omit<ContactSubmission, 'id' | 'date' | 'status'>) => {
    const id = `INQ-${Date.now().toString().slice(-6)}`;
    const newItem: ContactSubmission = {
      ...sub,
      id,
      date: new Date().toISOString(),
      status: 'unread',
    };
    setSiteData((prev) => ({
      ...prev,
      submissions: [newItem, ...prev.submissions],
    }));
    try {
      await setDoc(doc(db, 'submissions', id), {
        ...newItem,
        createdAt: newItem.date,
      });
    } catch (e) {
      console.warn('Firestore write submission notice:', e);
    }
  };

  const updateSubmissionStatus = async (id: string, status: 'unread' | 'read' | 'replied') => {
    setSiteData((prev) => ({
      ...prev,
      submissions: prev.submissions.map((s) => (s.id === id ? { ...s, status } : s)),
    }));
    try {
      await updateDoc(doc(db, 'submissions', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore update submission status notice:', e);
    }
  };

  const deleteSubmission = async (id: string) => {
    setSiteData((prev) => ({
      ...prev,
      submissions: prev.submissions.filter((s) => s.id !== id),
    }));
    try {
      await deleteDoc(doc(db, 'submissions', id));
    } catch (e) {
      console.warn('Firestore delete submission notice:', e);
    }
  };

  // Leadership & Focus
  const addLeader = async (item: LeaderProfile): Promise<void> => {
    let nextList: LeaderProfile[] = [];
    setSiteData((prev) => {
      const currentList = Array.isArray(prev.leadership) && prev.leadership.length > 0 ? prev.leadership : LEADERSHIP_TEAM;
      const leaderWithOrder = { ...item, order: item.order !== undefined ? item.order : currentList.length };
      nextList = sanitizeLeadershipList([...currentList, leaderWithOrder]);
      const nextState = { ...prev, leadership: nextList };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });
    setDoc(doc(db, 'leadership', item.id), item, { merge: true }).catch(() => {});
    await saveCmsContentToFirestore({ leadership: nextList });
  };

  const updateLeader = async (id: string, updatedLeader: Partial<LeaderProfile>): Promise<void> => {
    let nextList: LeaderProfile[] = [];
    setSiteData((prev) => {
      const currentList = Array.isArray(prev.leadership) && prev.leadership.length > 0 ? prev.leadership : LEADERSHIP_TEAM;
      nextList = sanitizeLeadershipList(currentList.map((l) => (l.id === id ? { ...l, ...updatedLeader } : l)));
      const nextState = { ...prev, leadership: nextList };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });
    setDoc(doc(db, 'leadership', id), updatedLeader, { merge: true }).catch(() => {});
    await saveCmsContentToFirestore({ leadership: nextList });
  };

  const deleteLeader = async (id: string): Promise<void> => {
    let nextList: LeaderProfile[] = [];
    setSiteData((prev) => {
      const currentList = Array.isArray(prev.leadership) && prev.leadership.length > 0 ? prev.leadership : LEADERSHIP_TEAM;
      const filtered = currentList.filter((l) => l.id !== id);
      nextList = sanitizeLeadershipList(filtered.map((l, idx) => ({ ...l, order: idx })));
      const nextState = { ...prev, leadership: nextList };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });
    deleteDoc(doc(db, 'leadership', id)).catch(() => {});
    await saveCmsContentToFirestore({ leadership: nextList });
  };

  const reorderLeaders = async (reordered: LeaderProfile[]): Promise<void> => {
    // 1. Assign strict index order (0 = teratas)
    const withOrder = reordered.map((l, idx) => ({
      ...l,
      order: idx,
    }));
    const sanitized = sanitizeLeadershipList(withOrder);

    // 2. Update local state & storage immediately
    setSiteData((prev) => {
      const nextState = { ...prev, leadership: sanitized };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });

    // 3. Save authoritative ordered array to siteSettings/cmsContent
    await saveCmsContentToFirestore({ leadership: sanitized });

    // 4. Update order on individual leadership documents
    await Promise.all(
      sanitized.map((l) =>
        setDoc(doc(db, 'leadership', l.id), l, { merge: true }).catch((err) => {
          console.warn('Sync individual leader document:', err);
        })
      )
    );
  };

  const updateHero = (data: Partial<HeroData>) => {
    const updated = { ...siteData.hero, ...data };
    setSiteData((prev) => ({
      ...prev,
      hero: updated,
    }));
    saveCmsContentToFirestore({ hero: updated });
  };

  const updateQuote = (data: Partial<QuoteData>) => {
    const updated = { ...siteData.quote, ...data };
    setSiteData((prev) => ({
      ...prev,
      quote: updated,
    }));
    saveCmsContentToFirestore({ quote: updated });
  };

  const updateCta = (data: Partial<CtaData>) => {
    const updated = { ...siteData.cta, ...data };
    setSiteData((prev) => ({
      ...prev,
      cta: updated,
    }));
    saveCmsContentToFirestore({ cta: updated });
  };

  const addStrategicFocus = (item: StrategicFocus) => {
    const updated = [...siteData.strategicFocus, item];
    setSiteData((prev) => ({
      ...prev,
      strategicFocus: updated,
    }));
    saveCmsContentToFirestore({ strategicFocus: updated });
  };

  const updateStrategicFocus = (id: number, updated: Partial<StrategicFocus>) => {
    const updatedList = siteData.strategicFocus.map((f) => (f.id === id ? { ...f, ...updated } : f));
    setSiteData((prev) => ({
      ...prev,
      strategicFocus: updatedList,
    }));
    saveCmsContentToFirestore({ strategicFocus: updatedList });
  };

  const deleteStrategicFocus = (id: number) => {
    const updated = siteData.strategicFocus.filter((f) => f.id !== id);
    setSiteData((prev) => ({
      ...prev,
      strategicFocus: updated,
    }));
    saveCmsContentToFirestore({ strategicFocus: updated });
  };

  const addResource = (item: ResourceDocument) => {
    const updated = [item, ...siteData.resources];
    setSiteData((prev) => ({
      ...prev,
      resources: updated,
    }));
    saveCmsContentToFirestore({ resources: updated });
    setDoc(doc(db, 'resources', item.id), {
      ...item,
      updatedAt: new Date().toISOString(),
    }, { merge: true }).catch(() => {});
  };

  const updateResource = (id: string, updated: Partial<ResourceDocument>) => {
    const updatedList = siteData.resources.map((r) => (r.id === id ? { ...r, ...updated } : r));
    setSiteData((prev) => ({
      ...prev,
      resources: updatedList,
    }));
    saveCmsContentToFirestore({ resources: updatedList });
    updateDoc(doc(db, 'resources', id), {
      ...updated,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  };

  const deleteResource = (id: string) => {
    const updated = siteData.resources.filter((r) => r.id !== id);
    setSiteData((prev) => ({
      ...prev,
      resources: updated,
    }));
    saveCmsContentToFirestore({ resources: updated });
    deleteDoc(doc(db, 'resources', id)).catch(() => {});
  };

  const updateDashboardConfig = async (data: Partial<DashboardConfig>) => {
    const updated: DashboardConfig = {
      ...(siteData.dashboardConfig || DEFAULT_DASHBOARD_CONFIG),
      ...data,
    };
    setSiteData((prev) => {
      const nextState = {
        ...prev,
        dashboardConfig: updated,
      };
      persistSiteContent(nextState);
      return nextState;
    });
    saveCmsContentToFirestore({ dashboardConfig: updated });
    try {
      await setDoc(
        doc(db, 'siteSettings', 'dashboard'),
        {
          ...updated,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Dashboard config Firestore sync warning:', e);
    }
  };

  const resetAllContent = () => {
    setSiteData({
      branding: DEFAULT_BRANDING,
      hero: DEFAULT_HERO,
      visionMission: DEFAULT_VISION_MISSION,
      strategicFocus: STRATEGIC_FOCUS_LIST,
      stats: INITIAL_NETWORK_STATS,
      memberSchools: SAMPLE_MEMBER_SCHOOLS,
      news: LATEST_NEWS_LIST,
      programs: UPCOMING_PROGRAMS_LIST,
      practices: BEST_PRACTICES_LIST,
      leadership: LEADERSHIP_TEAM,
      media: MEDIA_GALLERY_LIST,
      quote: DEFAULT_QUOTE,
      resources: RESOURCE_DOCS,
      cta: DEFAULT_CTA,
      contactInfo: DEFAULT_CONTACT_INFO,
      submissions: INITIAL_SUBMISSIONS,
      memberApplications: sanitizeMemberApplicationsList(SAMPLE_MEMBER_APPLICATIONS),
    });
    localStorage.removeItem(STORAGE_KEYS.SITE_CONTENT);
    purgeObsoleteLocalStorage();
    saveToIndexedDB('site_content_v3', null).catch(() => {});
  };

  return (
    <AdminContentContext.Provider
      value={{
        siteData,
        isAdmin: !!adminUser,
        adminUser,
        isFirebaseConnected,
        syncStatus,
        lastSyncedAt,
        loginAdmin,
        loginWithGoogle,
        logoutAdmin,
        syncAllToFirestore,
        isCMSOpen,
        setIsCMSOpen,
        isLogoModalOpen,
        setIsLogoModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        updateLogo,
        resetLogoToDefault,
        updateBranding,
        updateHero,
        updateVisionMission,
        updateQuote,
        updateCta,
        updateStats,
        addNews,
        updateNews,
        deleteNews,
        addProgram,
        updateProgram,
        deleteProgram,
        addPractice,
        updatePractice,
        deletePractice,
        addLeader,
        updateLeader,
        deleteLeader,
        reorderLeaders,
        addStrategicFocus,
        updateStrategicFocus,
        deleteStrategicFocus,
        addMedia,
        updateMedia,
        deleteMedia,
        addResource,
        updateResource,
        deleteResource,
        addMemberSchool,
        updateMemberSchool,
        deleteMemberSchool,
        runSchoolDiagnostics,
        autoRepairSchoolIntegrity,
        addMemberApplication,
        approveMemberApplication,
        rejectMemberApplication,
        deleteMemberApplication,
        updateDashboardConfig,
        updateContactInfo,
        addSubmission,
        updateSubmissionStatus,
        deleteSubmission,
        eventRegistrations,
        registerForEvent,
        updateEventRegistrationStatus,
        deleteEventRegistration,
        resetAllContent,
      }}
    >
      {children}
    </AdminContentContext.Provider>
  );
};

export const useAdminContent = () => {
  const context = useContext(AdminContentContext);
  if (!context) {
    throw new Error('useAdminContent mesti digunakan di dalam AdminContentProvider');
  }
  return context;
};
