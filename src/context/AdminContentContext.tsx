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
  AlumniRecord,
  AnnouncementItem,
} from '../types';

import {
  persistSiteContent,
  purgeObsoleteLocalStorage,
  saveToIndexedDB,
  safeLocalStorageSet,
  safeLocalStorageRemove,
  getInitialSiteContentSync,
  getFullSiteContentAsync,
} from '../utils/storage';
import { sortNewsByPublishedDate } from '../utils/dateUtils';
import faizLeaderPhoto from '../assets/images/mohamad_faiz_azizan_leader.webp';
import { INITIAL_BEST_PRACTICES, INITIAL_ANNOUNCEMENTS } from '../data/portalMockData';
import { INITIAL_DEMO_ALUMNI } from '../data/alumniMockData';

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
  writeBatch,
} from '../firebase';
import { sanitizeForFirestore } from '../services/firebaseConfig';
import { StorageManagementService } from '../services/StorageManagementService';
import {
  runSchoolDiagnostic,
  repairSchoolIntegrity,
  type DiagnosticReport,
} from '../utils/schoolDiagnostic';
import { compressDataUrl } from '../utils/imageCompressor';

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
  alumni?: AlumniRecord[];
  announcements?: AnnouncementItem[];
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
  isLoading: boolean;
  error: string | null;
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
  reorderPrograms: (reordered: ProgramEvent[]) => Promise<void>;
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
  // Alumni PGB Management
  addAlumniRecord: (item: Omit<AlumniRecord, 'id' | 'submittedAt'> | AlumniRecord) => Promise<string>;
  updateAlumniRecord: (id: string, item: Partial<AlumniRecord>) => Promise<void>;
  deleteAlumniRecord: (id: string) => Promise<void>;
  approveAlumniRecord: (id: string, verifiedBy?: string) => Promise<void>;
  rejectAlumniRecord: (id: string, reason: string, verifiedBy?: string) => Promise<void>;
  toggleFeatureAlumniRecord: (id: string) => Promise<void>;
  purgeMockData: () => void;
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

const DEFAULT_NETWORK_STATS: NetworkStats = {
  schoolsCount: 250,
  statesCount: 14,
  principalsCount: 1500,
  studentsBenefited: '120,000+',
  isPlaceholder: false,
};

export const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'news-01',
    title: 'Konvensyen Kebangsaan Pengetua & Guru Besar Sekolah Islam Malaysia 2026 Dirasmikan',
    slug: 'konvensyen-kebangsaan-pgb-2026',
    summary: 'Lebih 1,500 pemimpin sekolah Islam seluruh negara berkumpul bagi membincangkan Rangka Tindakan Strategik MPGBSIM 2025–2030 dan integrasi AI dalam pengurusan sekolah.',
    content: `KUALA LUMPUR — Konvensyen Kebangsaan Pengetua & Guru Besar Sekolah Islam Malaysia (KPSI) 2026 telah dirasmikan dengan jayanya di Dewan Persidangan Utama Kompleks Pendidikan Islam Kebangsaan.

Konvensyen yang menghimpunkan lebih 1,500 Pengetua, Guru Besar serta Pemimpin Kanan Sekolah (SLT) dari SMKA, SABK, Sekolah Islam Swasta dan Maahad Tahfiz seluruh negara ini berfokuskan kepada memperkasakan tadbir urus Rabbani dan pemanfaatan teknologi AI secara beretika.

Dalam ucapan perasmian, Pengerusi MPGBSIM, Mohamad Faiz Azizan, menekankan bahawa pemerkasaan kepimpinan instruksional dan keteguhan sahsiah guru merupakan teras utama dalam melahirkan generasi Rabbani yang berdaya saing global.`,
    category: 'Kenyataan Media',
    date: '2026-09-24',
    author: 'Urus Setia Kebangsaan MPGBSIM',
    readTime: '4 minit bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    featured: true,
    status: 'published',
  },
  {
    id: 'news-02',
    title: 'Sekolah Rendah Islam I Musleh Rintis Program Sekolah Pintar Rabbani Berorientasikan AI',
    slug: 'sri-musleh-rintis-sekolah-pintar-ai',
    summary: 'Anugerah Inovasi Digital MPGBSIM 2026 diberikan kepada SRI I Musleh atas kejayaan mengintegrasikan modul pengecaman hafazan Al-Quran berasaskan AI.',
    content: `MELAKA — Sekolah Rendah Islam I Musleh melakar sejarah apabila menjadi sekolah pertama yang melaksanakan Sistem Pemantauan Hafazan & Murajaah berasaskan Kecerdasan Buatan (AI) bagi murid rendah.

Program ini membolehkan guru dan ibu bapa memantau kelancaran hafazan murid secara masa nyata di samping memastikan penerapan adab dan akhlak Islamiah teratur.`,
    category: 'Kejayaan Sekolah',
    date: '2026-09-20',
    author: 'Ustaz Abdul Qayyum bin Yaakop',
    readTime: '3 minit bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200',
    featured: false,
    status: 'published',
    schoolName: 'Sekolah Rendah Islam I Musleh',
    schoolCode: 'MJAC011',
    state: 'Melaka',
    isSchoolAchievement: true,
    achievementLevel: 'Kebangsaan',
  },
  {
    id: 'news-03',
    title: 'SMKA Putrajaya Menjuarai Pertandingan Debat Bahasa Arab & English Antarabangsa',
    slug: 'smka-putrajaya-juara-debat-antarabangsa',
    summary: 'Pasukan murid SMKA Putrajaya membawa pulang Anugerah Emas dalam International Islamic Schools Debate Championship 2026.',
    content: `PUTRAJAYA — Pasukan debater SMKA Putrajaya sekali lagi mengharumkan nama negara selepas merangkul Anugerah Emas dan Pembahas Terbaik dalam Kejohanan Debat Sekolah Islam Antarabangsa.`,
    category: 'Kejayaan Sekolah',
    date: '2026-09-18',
    author: 'Ustaz Zamri bin Abdul Razak',
    readTime: '3 minit bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    featured: false,
    status: 'published',
    schoolName: 'SMKA Putrajaya',
    schoolCode: 'ABA2004',
    state: 'Wilayah Persekutuan',
    isSchoolAchievement: true,
    achievementLevel: 'Antarabangsa',
  },
  {
    id: 'news-04',
    title: 'Pelancaran Rangka Tindakan Strategik Kepimpinan Sekolah Islam Malaysia (2025–2030)',
    slug: 'pelancaran-rangka-tindakan-strategik-2025-2030',
    summary: 'MPGBSIM memperkenalkan 5 Teras Utama pemerkasaan institusi pendidikan Islam berasaskan pengurusan profesional dan kelestarian dana wakaf.',
    content: `BANGI — Rangka Tindakan Strategik Kepimpinan Sekolah Islam Malaysia (2025–2030) dilancarkan secara rasmi bagi memberikan panduan holistik kepada Pengetua dan Guru Besar dalam mengemudi cabaran persekolahan abad ke-21.`,
    category: 'Pendidikan',
    date: '2026-09-12',
    author: 'Biro Strategik & Dasar MPGBSIM',
    readTime: '5 minit bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
    featured: false,
    status: 'published',
  },
  {
    id: 'news-05',
    title: 'Penyelarasan Standard Kurikulum Diniyah & Tahfiz Bersama Kementerian Pendidikan Malaysia',
    slug: 'penyelarasan-standard-kurikulum-diniyah-kpm',
    summary: 'Sesi wacana khas antara kepimpinan MPGBSIM dan Bahagian Pendidikan Islam KPM bagi memantapkan kualiti pendidikan Dini.',
    content: `PUTRAJAYA — Mesyuarat meja bulat penyelarasan kurikulum telah memutuskan beberapa garis panduan baru bagi menyelaraskan sukatan Diniyah dan Tahfiz swasta dengan standard pentaksiran kebangsaan.`,
    category: 'Pengurusan',
    date: '2026-09-05',
    author: 'Biro Kurikulum & Latihan MPGBSIM',
    readTime: '4 minit bacaan',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    featured: false,
    status: 'published',
  },
];

export const DEFAULT_STRATEGIC_FOCUS: StrategicFocus[] = [
  {
    id: 1,
    code: 'FS-01',
    title: 'Pembangunan Kepimpinan & Governan',
    shortDesc: 'Memantapkan kompetensi manajerial, kepimpinan instruksional dan tata kelola berwibawa bagi PGB.',
    fullDesc: 'Fokus ini bertujuan memperkukuhkan kapasiti kepimpinan Pengetua dan Guru Besar melalui siri latihan berterusan, pentauliahan profesionalisme, dan pematuhan standard pentadbiran berwibawa.',
    iconName: 'Award',
    initiatives: [
      'Modul Kepimpinan Holistik PGB (MKH-PGB)',
      'Program Mentoring Pentadbir Baharu (PMPB)',
      'Audit Kendiri Standard Kualiti Sekolah Islam (SKSI)'
    ],
    kpi: '100% PGB sekolah ahli menamatkan sekurang-kurangnya 24 jam latihan kepimpinan setahun.',
    status: 'Fokus Utama',
  },
  {
    id: 2,
    code: 'FS-02',
    title: 'Integrasi Kurikulum & Ekosistem Rabbani',
    shortDesc: 'Mengharmonikan sukatan Diniyah, Tahfiz dan akademik KPM berasaskan nilai ketuhanan.',
    fullDesc: 'Menyelaras dan memperkasakan kualiti pengajaran dan pembelajaran (PdP) agar ilmu naqli dan aqli diintegrasikan secara holistik demi melahirkan generasi Rabbani.',
    iconName: 'BookOpen',
    initiatives: [
      'Penyelarasan Standard Pentaksiran Dini & Tahfiz Kebangsaan',
      'Modul Pembinaan Sahsiah & Adab Murid Asrama',
      'Bengkel Pedagogi Abad Ke-21 Guru Dini'
    ],
    kpi: 'Peningkatan 15% gred pencapaian SPM & STAM di sekolah-sekolah ahli.',
    status: 'Sedang Berjalan',
  },
  {
    id: 3,
    code: 'FS-03',
    title: 'Transformasi Digital & Pemerkasaan AI',
    shortDesc: 'Memacu pembudayaan teknologi AI, papan pemuka analitik data dan portal pentadbiran bersepadu.',
    fullDesc: 'Menyediakan prasarana dan kemahiran digital untuk pentadbir dan guru dalam menggunakan kecerdasan buatan (AI) bagi automasi pengurusan dan PdP interaktif.',
    iconName: 'Cpu',
    initiatives: [
      'Pusat Rujukan AI & Generatif Prompt Library MPGBSIM',
      'Sistem Portal Keahlian & Pangkalan Data Bersepadu Awam',
      'Bengkel Pengurusan Sekolah Berorientasikan Analitik Data'
    ],
    kpi: '80% sekolah ahli menggunakan portal dan alat AI dalam pentadbiran harian.',
    status: 'Fokus Utama',
  },
  {
    id: 4,
    code: 'FS-04',
    title: 'Jalinan Strategik & Wakaf Pendidikan',
    shortDesc: 'Membangunkan kemandirian kewangan sekolah melalui model wakaf produktif dan tajaan korporat.',
    fullDesc: 'Memperluaskan jaringan kerjasama dengan agensi awam, korporat, institusi pengajian tinggi dan alumni bagi menjana dana kebajikan serta biasiswa pendidikan.',
    iconName: 'Users',
    initiatives: [
      'Tabung Wakaf Pendidikan Sekolah Islam Kebangsaan',
      'Program Pertukaran Kepimpinan & Kajian Lapangan Antarabangsa',
      'Kemitraan Strategik Universiti Awam & Swasta'
    ],
    kpi: 'RM2.5 Juta dana wakaf dan tajaan disalurkan kepada sekolah terkesan.',
    status: 'Perancangan 2026',
  },
  {
    id: 5,
    code: 'FS-05',
    title: 'Kebajikan & Advokasi Hak PGB',
    shortDesc: 'Memelihara kebajikan, sokongan guaman, serta suarakan aspirasi sekolah Islam di peringkat dasar.',
    fullDesc: 'Bertindak sebagai ejen perantara rasmi dalam menyuarakan keperluan sekolah-sekolah Islam kepada kementerian, agensi agama negeri dan pihak berkuasa berkaitan.',
    iconName: 'ShieldCheck',
    initiatives: [
      'Bilik Gerakan Bencana & Bantuan Kecemasan PGB',
      'Unit Advokasi Dasar & Kebajikan Ahli Kebangsaan',
      'Anugerah Tokoh Kepimpinan & Legasi PGB'
    ],
    kpi: 'Maklum balas sokongan dan kebajikan diselesaikan dalam tempoh 48 jam.',
    status: 'Fokus Utama',
  },
];

export const DEFAULT_MEMBER_SCHOOLS: MemberSchool[] = [
  {
    id: 'sch-musleh-1',
    name: 'Sekolah Rendah Islam I Musleh',
    code: 'MJAC011',
    type: 'Rakan Musleh',
    state: 'Melaka',
    district: 'Melaka Tengah',
    principal: 'Ustaz Abdul Qayyum bin Yaakop',
    principalPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    studentCount: 450,
    teacherCount: 38,
    joinYear: 2026,
    serviceStartYear: 2018,
    pgbStartYear: 2020,
    logoUrl: '/mpgbsim-official-logo.png',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
    website: 'https://imuslehmelaka.edu.my',
    description: 'Sekolah Rendah Islam swasta bertaraf Rakan Musleh yang menawarkan pendidikan holistik bersepadu mengintegrasikan akademik KPM dan kurikulum Musleh.',
    address: 'Batu 4 1/2, Jalan Peringgit, 75400 Melaka, Melaka Bandaraya Bersejarah.',
    phone: '+60 6-335 1290',
    email: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
    schoolPhone: '+60 6-335 1290',
    schoolEmail: 'admin@imuslehmelaka.edu.my',
    pgbPhone: '+60 19-665 4321',
    pgbEmail: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
  },
  {
    id: 'sch-2',
    name: 'Sekolah Menengah Kebangsaan Agama (SMKA) Putrajaya',
    code: 'ABA2004',
    type: 'Sekolah Menengah',
    state: 'Wilayah Persekutuan',
    district: 'Putrajaya',
    principal: 'Ustaz Zamri bin Abdul Razak',
    principalPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    studentCount: 820,
    teacherCount: 65,
    joinYear: 2018,
    serviceStartYear: 2010,
    pgbStartYear: 2015,
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80',
    website: 'https://smkaputrajaya.edu.my',
    description: 'Sekolah Menengah Kebangsaan Agama terkemuka yang melahirkan murid cemerlang akademik, Bahasa Arab dan sahsiah kepimpinan Rabbani.',
    address: 'Presint 11, 62300 Wilayah Persekutuan Putrajaya.',
    phone: '+60 3-8888 1234',
    email: 'zamri.razak@smkaputrajaya.edu.my',
    schoolPhone: '+60 3-8888 1234',
    schoolEmail: 'pengetua@smkaputrajaya.edu.my',
    pgbPhone: '+60 12-345 6789',
    pgbEmail: 'zamri.razak@smkaputrajaya.edu.my',
  },
  {
    id: 'sch-3',
    name: 'Sekolah Rendah Islam Integrasi As-Syakirin',
    code: 'BEA4002',
    type: 'Sekolah Rendah',
    state: 'Selangor',
    district: 'Petaling',
    principal: 'Ustazah Dr. Hajah Aminah binti Zakaria',
    principalPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    studentCount: 650,
    teacherCount: 48,
    joinYear: 2019,
    serviceStartYear: 2012,
    pgbStartYear: 2018,
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    website: 'https://sriintegrasias-syakirin.edu.my',
    description: 'Sekolah rendah Islam pilihan utama di Selangor dengan penekanan kurikulum akademik bersepadu dan pembangunan sahsiah murid.',
    address: 'Jalan Bunga Raya, Section 13, 40100 Shah Alam, Selangor.',
    phone: '+60 3-5510 4321',
    email: 'aminah.zakaria@srikreatif.edu.my',
    schoolPhone: '+60 3-5510 4321',
    schoolEmail: 'admin@srikreatif.edu.my',
    pgbPhone: '+60 12-441 8902',
    pgbEmail: 'aminah.zakaria@srikreatif.edu.my',
  },
  {
    id: 'sch-4',
    name: 'Maahad Tahfiz Sains Integrasi Tanah Merah',
    code: 'DEA1021',
    type: 'Maahad Tahfiz',
    state: 'Kelantan',
    district: 'Tanah Merah',
    principal: 'Ustaz Wan Muhammad Naim bin Hassan',
    principalPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    studentCount: 380,
    teacherCount: 32,
    joinYear: 2020,
    serviceStartYear: 2014,
    pgbStartYear: 2019,
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80',
    website: 'https://mtsi-tanahmerah.edu.my',
    description: 'Institusi Maahad Tahfiz Sains terkemuka Kelantan yang melahirkan huffaz profesional dalam bidang kejuruteraan dan perubatan.',
    address: 'Bandar Baru Tanah Merah, 17500 Tanah Merah, Kelantan.',
    phone: '+60 9-955 8765',
    email: 'naim.hassan@mtsi.edu.my',
    schoolPhone: '+60 9-955 8765',
    schoolEmail: 'admin@mtsi.edu.my',
    pgbPhone: '+60 13-987 6543',
    pgbEmail: 'naim.hassan@mtsi.edu.my',
  },
  {
    id: 'sch-5',
    name: 'SMA Darul Aman Al-Islamiah Alor Setar',
    code: 'KEA7001',
    type: 'Sekolah Menengah',
    state: 'Kedah',
    district: 'Kota Setar',
    principal: 'Ustaz Dr. Abdul Rahman bin Hashim',
    principalPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    studentCount: 710,
    teacherCount: 55,
    joinYear: 2017,
    serviceStartYear: 2008,
    pgbStartYear: 2012,
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1000&q=80',
    website: 'https://smadarulaman.edu.my',
    description: 'Sekolah Agama Bantuan Kerajaan (SABK) berprestasi tinggi di Kedah dengan kebitaraan Bahasa Arab dan Tahfiz.',
    address: 'Jalan Langgar, 05000 Alor Setar, Kedah Darul Aman.',
    phone: '+60 4-733 9988',
    email: 'rahman.hashim@smadarulaman.edu.my',
    schoolPhone: '+60 4-733 9988',
    schoolEmail: 'admin@smadarulaman.edu.my',
    pgbPhone: '+60 13-991 3344',
    pgbEmail: 'rahman.hashim@smadarulaman.edu.my',
  },
];

export const DEFAULT_PROGRAMS: ProgramEvent[] = [
  {
    id: 'prog-01',
    title: 'Konvensyen Pemimpin Sekolah Islam Malaysia (KPSI) 2026',
    theme: 'Menerajui Kepimpinan Rabbani & AI Generatif Dalam Pentadbiran Sekolah',
    date: '2026-11-14',
    time: '8:30 Pagi - 5:00 Petang',
    startTime: '08:30',
    endTime: '17:00',
    venue: 'Dewan Persidangan Utama Kompleks Pendidikan Islam Antarabangsa, Bangi',
    mode: 'Hibrid',
    targetAudience: 'Pengetua, Guru Besar, Penolong Kanan & SLT Sekolah Islam',
    description: 'Himpunan tahunan kepimpinan tertinggi sekolah Islam Malaysia menampilkan pembentangan ucaptama, wacana panel pakar AI, serta majlis penganugerahan Sekolah Cemerlang MPGBSIM.',
    spotsTotal: 500,
    spotsFilled: 342,
    registrationOpen: true,
    closingDate: '2026-11-05',
    fees: 'Percuma Bagi Ahli Berdaftar (RM150 Bukan Ahli)',
    posterUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    organiser: 'Urus Setia Kebangsaan MPGBSIM',
    status: 'Upcoming',
    order: 0,
  },
  {
    id: 'prog-02',
    title: 'Mesyuarat Agung Tahunan (AGM) MPGBSIM Kali Ke-11 Sesi 2026',
    theme: 'Memperkasa Organisasi, Mendaulatkan Kepimpinan Pendidikan Islam',
    date: '2026-10-24',
    time: '8:30 Pagi - 1:00 Tengah Hari',
    startTime: '08:30',
    endTime: '13:00',
    venue: 'Dewan Seri Melati, Putrajaya & Siaran Langsung Portal Ahli',
    mode: 'Fizikal',
    targetAudience: 'Semua Ahli Pengetua & Guru Besar Berdaftar',
    description: 'Mesyuarat rasmi dwi-tahunan mengesahkan penyata kewangan beraudit, laporan aktiviti dan pembentangan usul transformasi digital sekolah ahli.',
    spotsTotal: 300,
    spotsFilled: 210,
    registrationOpen: true,
    closingDate: '2026-10-15',
    fees: 'Percuma (Eksklusif Ahli MPGBSIM)',
    posterUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200',
    organiser: 'Setiausaha Agung MPGBSIM',
    status: 'Upcoming',
    order: 1,
  },
  {
    id: 'prog-03',
    title: 'Bengkel Pemantapan AI Generatif & Pengurusan Data Sekolah Bagi PGB',
    theme: 'Aplikasi Practical Prompt Engineering Bagi Pengetua & Guru Besar',
    date: '2026-12-05',
    time: '9:00 Pagi - 12:30 Tengah Hari',
    startTime: '09:00',
    endTime: '12:30',
    venue: 'Aplikasi Zoom / Portal Ahli MPGBSIM',
    mode: 'Dalam Talian',
    targetAudience: 'Pentadbir Sekolah, Guru Kanan & Urus Setia Data',
    description: 'Bengkel praktikal menggunakan Google Gemini, NotebookLM dan Canva AI untuk automasi borang, analisis pencapaian murid dan draf kertas kerja.',
    spotsTotal: 1000,
    spotsFilled: 680,
    registrationOpen: true,
    closingDate: '2026-12-01',
    fees: 'Percuma Bagi Ahli',
    posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    organiser: 'Biro Transformasi Digital MPGBSIM',
    status: 'Upcoming',
    order: 2,
  },
];

export const DEFAULT_LEADERSHIP: LeaderProfile[] = [
  {
    id: 'lead-1',
    name: 'Mohamad Faiz Azizan',
    role: 'Pengerusi Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    subRole: 'Pengerusi Kebangsaan MPGBSIM',
    institution: 'Ibu Pejabat Sekretariat MPGBSIM',
    state: 'Selangor',
    qualification: 'Sarjana Pengurusan Pendidikan & Syariah',
    avatarUrl: faizLeaderPhoto,
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    order: 0,
  },
  {
    id: 'lead-2',
    name: 'Ustaz Zamri bin Abdul Razak',
    role: 'Timbalan Pengerusi Kebangsaan',
    subRole: 'Pengetua SMKA Putrajaya',
    institution: 'SMKA Putrajaya',
    state: 'Wilayah Persekutuan',
    qualification: 'Ijazah Sarjana Muda Pendidikan Islam (UM)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    order: 1,
  },
  {
    id: 'lead-3',
    name: 'Ustazah Dr. Hajah Aminah binti Zakaria',
    role: 'Setiausaha Agung Kebangsaan',
    subRole: 'Guru Besar SRI Integrasi As-Syakirin',
    institution: 'SRI Integrasi As-Syakirin',
    state: 'Selangor',
    qualification: 'Doktor Falsafah (PhD) Pengurusan Pendidikan (UKM)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    term: 'Penggal 2026–2028',
    category: 'Kepimpinan Utama',
    order: 2,
  },
  {
    id: 'lead-4',
    name: 'Ustaz Abdul Qayyum bin Yaakop',
    role: 'Pengerusi Biro Sekolah Rendah & Rakan Musleh',
    subRole: 'Guru Besar SRI I Musleh',
    institution: 'Sekolah Rendah Islam I Musleh',
    state: 'Melaka',
    qualification: 'Ijazah Sarjana Muda Pengajian Islam & Bahasa Arab',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600',
    term: 'Penggal 2026–2028',
    category: 'Pengerusi Biro',
    order: 3,
  },
  {
    id: 'lead-5',
    name: 'Ustaz Dr. Abdul Rahman bin Hashim',
    role: 'Pengerusi Biro Akademik & Kurikulum',
    subRole: 'Pengetua SMA Darul Aman',
    institution: 'SMA Darul Aman Al-Islamiah',
    state: 'Kedah',
    qualification: 'PhD Syariah Islamiah (Al-Azhar)',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600',
    term: 'Penggal 2026–2028',
    category: 'Pengerusi Biro',
    order: 4,
  },
];

export const DEFAULT_RESOURCES: ResourceDocument[] = [
  {
    id: 'res-01',
    title: 'Perlembagaan Rasmi MPGBSIM (Pindaan 2024)',
    category: 'Dokumen MPGBSIM',
    publishedDate: '2026-01-15',
    fileSize: '2.4 MB',
    fileFormat: 'PDF',
    downloads: 342,
    description: 'Dokumen asas perlembagaan, tatacara mesyuarat, peranan kepimpinan dan klausa keahlian kebangsaan.',
    version: 'v2.4',
    visibility: 'MEMBER',
  },
  {
    id: 'res-02',
    title: 'Modul Kepimpinan Holistik Pengetua Sekolah Islam (MKH-PGB)',
    category: 'Modul Kepimpinan',
    publishedDate: '2026-05-10',
    fileSize: '8.7 MB',
    fileFormat: 'PDF',
    downloads: 620,
    description: 'Panduan kompetensi kepimpinan Rabbani, pengurusan bakat guru, kewangan wakaf dan kurikulum bersepadu.',
    version: 'v3.1',
    visibility: 'MEMBER',
  },
  {
    id: 'res-03',
    title: 'Garis Panduan Pelaksanaan AI Generatif Dalam Pentadbiran Sekolah',
    category: 'Garis Panduan',
    publishedDate: '2026-09-18',
    fileSize: '3.1 MB',
    fileFormat: 'PDF',
    downloads: 415,
    description: 'SOP penggunaan ChatGPT, Gemini dan automasi borang bagi memelihara privasi data murid dan institusi.',
    version: 'v1.0',
    visibility: 'MEMBER',
  },
  {
    id: 'res-04',
    title: 'Template Kertas Kerja Rasmi Cadangan Program & Sumbangan',
    category: 'Template',
    publishedDate: '2026-02-01',
    fileSize: '450 KB',
    fileFormat: 'DOCX',
    downloads: 890,
    description: 'Templat standard format Word untuk permohonan kelulusan program sekolah dan permohonan tajaan.',
    version: 'v2026',
    visibility: 'MEMBER',
  },
];

export const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'med-01',
    title: 'Perasmian Konvensyen Pemimpin Sekolah Islam Malaysia 2026',
    type: 'photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-24',
    location: 'Cyberjaya',
    caption: 'Majlis perasmian penuh gilang-gemilang yang dihadiri oleh lebih 1,500 pentadbir sekolah Islam.',
    category: 'Konvensyen',
  },
  {
    id: 'med-02',
    title: 'Pelancaran Modul Kepimpinan Rabbani & AI Sekolah Islam',
    type: 'photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    date: '2026-09-12',
    location: 'Putrajaya',
    caption: 'Sesi penyampaian modul pengurusan kepada wakil pengerusi biro negeri.',
    category: 'Program',
  },
  {
    id: 'med-03',
    title: 'Mesyuarat Agung Tahunan & Sesi Pertukaran MoU Sekolah Ahli',
    type: 'photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800',
    date: '2026-08-20',
    location: 'Bangi',
    caption: 'Penandatanganan kerjasama pintar antara MPGBSIM dan agensi pendidikan Islam.',
    category: 'Mesyuarat',
  },
];

const sanitizeMemberSchoolsList = (schools: MemberSchool[] = []): MemberSchool[] => {
  try {
    if (!schools || schools.length === 0) return DEFAULT_MEMBER_SCHOOLS;

    const schoolMap = new Map<string, MemberSchool>();
    schools.forEach((s) => {
      if (!s || (!s.id && !s.code)) return;
      const key = s.id || s.code;
      schoolMap.set(key, s);
    });

    const portalUserRaw = typeof window !== 'undefined' ? localStorage.getItem('mpgbsim_portal_user_v1') : null;
    const portalUser = portalUserRaw ? JSON.parse(portalUserRaw) : null;
    const list = Array.from(schoolMap.values());
    const { repairedSchools } = repairSchoolIntegrity(list, portalUser);

    return repairedSchools.length > 0 ? repairedSchools : list;
  } catch (e) {
    console.warn('sanitizeMemberSchoolsList notice:', e);
    return schools.length > 0 ? schools : DEFAULT_MEMBER_SCHOOLS;
  }
};

const getPendingRegistrationsFromStorage = (): MemberApplication[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('mpgbsim_pending_registrations') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          id: item.id || item.refId || `MPGB-${Date.now()}`,
          refId: item.refId || item.id || `MPGB-${Date.now()}`,
          fullName: item.fullName || item.name || 'Pemohon',
          icNumber: item.icNumber || '',
          email: item.email || item.pgbEmail || '',
          phoneNumber: item.phoneNumber || item.phone || item.pgbPhone || '',
          pgbEmail: item.pgbEmail || item.email || '',
          pgbPhone: item.pgbPhone || item.phone || item.phoneNumber || '',
          schoolEmail: item.schoolEmail || '',
          schoolPhone: item.schoolPhone || '',
          designation: item.designation || item.position || 'Pengetua',
          serviceStartYear: Number(item.serviceStartYear || item.pgbStartYear) || 2026,
          pgbStartYear: Number(item.pgbStartYear || item.serviceStartYear) || 2026,
          joinYear: Number(item.joinYear || item.schoolJoinYear) || new Date().getFullYear(),
          schoolJoinYear: Number(item.schoolJoinYear || item.joinYear) || new Date().getFullYear(),
          schoolName: item.schoolName || '',
          schoolCode: item.schoolCode || '',
          schoolType: item.schoolType || 'Sekolah Menengah',
          state: item.state || 'Selangor',
          district: item.district || '',
          website: item.website || '',
          studentCount: Number(item.studentCount) || 0,
          teacherCount: Number(item.teacherCount) || 0,
          logoUrl: item.logoUrl || '',
          schoolPhotoUrl: item.schoolPhotoUrl || '',
          pgbPhotoUrl: item.pgbPhotoUrl || '',
          schoolDescription: item.schoolDescription || '',
          address: item.address || '',
          status: (item.status === 'approved' || item.status === 'Lulus') ? 'approved' : (item.status === 'rejected' || item.status === 'Ditolak') ? 'rejected' : 'pending',
          submittedAt: item.submittedAt || new Date().toISOString(),
        }));
      }
    }
  } catch (e) {
    console.warn('getPendingRegistrationsFromStorage notice:', e);
  }
  return [];
};

const sanitizeMemberApplicationsList = (apps: MemberApplication[] = []): MemberApplication[] => {
  const pendingFromLocal = getPendingRegistrationsFromStorage();
  const combined = [...pendingFromLocal, ...(apps || [])];
  const map = new Map<string, MemberApplication>();

  const normalizeStatus = (st?: string): 'pending' | 'approved' | 'rejected' => {
    if (!st) return 'pending';
    const lower = st.toLowerCase();
    if (lower === 'approved' || lower === 'lulus' || lower === 'disahkan') return 'approved';
    if (lower === 'rejected' || lower === 'ditolak') return 'rejected';
    return 'pending';
  };

  combined.forEach((app) => {
    if (!app || !app.id) return;
    const isAlreadyRegisteredMusleh =
      app.id === 'app-musleh-01' ||
      app.schoolCode === 'MJAC011' ||
      app.schoolCode === 'MIA1009' ||
      app.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
      (app.schoolName && app.schoolName.toLowerCase().includes('musleh'));

    if (isAlreadyRegisteredMusleh) return;

    const existing = map.get(app.id);
    const newStatus = normalizeStatus(app.status);
    if (!existing || (existing.status === 'pending' && newStatus !== 'pending')) {
      map.set(app.id, {
        ...app,
        status: newStatus,
      });
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  );
};

const sanitizeLeadershipList = (list: LeaderProfile[] = []): LeaderProfile[] => {
  const baseList = list || [];
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
    const initialSync = getInitialSiteContentSync();
    return {
      branding: initialSync?.branding || DEFAULT_BRANDING,
      hero: initialSync?.hero || DEFAULT_HERO,
      visionMission: initialSync?.visionMission || DEFAULT_VISION_MISSION,
      strategicFocus: initialSync?.strategicFocus?.length ? initialSync.strategicFocus : DEFAULT_STRATEGIC_FOCUS,
      stats: initialSync?.stats?.schoolsCount ? initialSync.stats : DEFAULT_NETWORK_STATS,
      memberSchools: initialSync?.memberSchools?.length ? sanitizeMemberSchoolsList(initialSync.memberSchools) : DEFAULT_MEMBER_SCHOOLS,
      news: initialSync?.news?.length ? sortNewsByPublishedDate(initialSync.news) : DEFAULT_NEWS,
      programs: initialSync?.programs?.length ? initialSync.programs : DEFAULT_PROGRAMS,
      practices: initialSync?.practices?.length ? initialSync.practices : INITIAL_BEST_PRACTICES,
      leadership: initialSync?.leadership?.length ? sanitizeLeadershipList(initialSync.leadership) : DEFAULT_LEADERSHIP,
      media: initialSync?.media?.length ? initialSync.media : DEFAULT_MEDIA,
      quote: initialSync?.quote || DEFAULT_QUOTE,
      resources: initialSync?.resources?.length ? initialSync.resources : DEFAULT_RESOURCES,
      cta: initialSync?.cta || DEFAULT_CTA,
      contactInfo: initialSync?.contactInfo || DEFAULT_CONTACT_INFO,
      submissions: initialSync?.submissions || [],
      memberApplications: initialSync?.memberApplications ? sanitizeMemberApplicationsList(initialSync.memberApplications) : [],
      dashboardConfig: initialSync?.dashboardConfig || DEFAULT_DASHBOARD_CONFIG,
      alumni: initialSync?.alumni?.length ? initialSync.alumni : INITIAL_DEMO_ALUMNI,
      announcements: initialSync?.announcements?.length ? initialSync.announcements : INITIAL_ANNOUNCEMENTS,
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  // Hydrate full state from IndexedDB on initial mount
  useEffect(() => {
    getFullSiteContentAsync()
      .then((cached) => {
        if (cached) {
          setSiteData((prev) => ({
            ...prev,
            branding: cached.branding || prev.branding,
            hero: cached.hero || prev.hero,
            visionMission: cached.visionMission || prev.visionMission,
            strategicFocus: Array.isArray(cached.strategicFocus) ? cached.strategicFocus : prev.strategicFocus,
            stats: cached.stats || prev.stats,
            memberSchools: Array.isArray(cached.memberSchools) && cached.memberSchools.length > 0
              ? sanitizeMemberSchoolsList(cached.memberSchools)
              : prev.memberSchools,
            news: Array.isArray(cached.news) ? sortNewsByPublishedDate(cached.news) : prev.news,
            programs: Array.isArray(cached.programs) ? cached.programs : prev.programs,
            practices: Array.isArray(cached.practices) ? cached.practices : prev.practices,
            leadership: Array.isArray(cached.leadership) && cached.leadership.length > 0
              ? sanitizeLeadershipList(cached.leadership)
              : prev.leadership,
            media: Array.isArray(cached.media) ? cached.media : prev.media,
            quote: cached.quote || prev.quote,
            resources: Array.isArray(cached.resources) ? cached.resources : prev.resources,
            cta: cached.cta || prev.cta,
            contactInfo: cached.contactInfo || prev.contactInfo,
            submissions: Array.isArray(cached.submissions) ? cached.submissions : prev.submissions,
            memberApplications: Array.isArray(cached.memberApplications)
              ? sanitizeMemberApplicationsList(cached.memberApplications)
              : prev.memberApplications,
            dashboardConfig: cached.dashboardConfig || prev.dashboardConfig,
            alumni: Array.isArray(cached.alumni) ? cached.alumni : prev.alumni,
            announcements: Array.isArray(cached.announcements) ? cached.announcements : prev.announcements,
          }));
        }
      })
      .catch((e) => {
        console.warn('Hydration notice:', e);
      });
  }, []);

  // Listen for portal profile updates or external storage synchronization
  useEffect(() => {
    const handleContentUpdated = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SITE_CONTENT);
        const parsed = saved ? JSON.parse(saved) : {};
        setSiteData((prev) => ({
          ...prev,
          memberSchools: parsed.memberSchools && parsed.memberSchools.length > 0
            ? sanitizeMemberSchoolsList(parsed.memberSchools)
            : prev.memberSchools,
          memberApplications: sanitizeMemberApplicationsList(
            parsed.memberApplications?.length ? parsed.memberApplications : prev.memberApplications
          ),
        }));
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
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);

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

          // Ensure admin record in Firestore exists once per browser session
          try {
            const sessionKey = `mpgbsim_admin_synced_${user.uid}`;
            const alreadySynced = typeof window !== 'undefined' ? sessionStorage.getItem(sessionKey) : null;
            if (!alreadySynced) {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem(sessionKey, 'true');
              }
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
            }
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
              strategicFocus: Array.isArray(d.strategicFocus) && d.strategicFocus.length > 0 ? d.strategicFocus : DEFAULT_STRATEGIC_FOCUS,
              stats: d.stats && d.stats.schoolsCount ? { ...prev.stats, ...d.stats } : DEFAULT_NETWORK_STATS,
              quote: d.quote ? { ...prev.quote, ...d.quote } : prev.quote,
              cta: d.cta ? { ...prev.cta, ...d.cta } : prev.cta,
              contactInfo: d.contactInfo ? { ...prev.contactInfo, ...d.contactInfo } : prev.contactInfo,
              leadership: sanitizeLeadershipList(Array.isArray(d.leadership) && d.leadership.length > 0 ? d.leadership : DEFAULT_LEADERSHIP),
              resources: Array.isArray(d.resources) && d.resources.length > 0 ? d.resources : DEFAULT_RESOURCES,
              dashboardConfig: d.dashboardConfig ? { ...prev.dashboardConfig, ...d.dashboardConfig } : prev.dashboardConfig,
            }));
            setSyncStatus('synced');
            setLastSyncedAt(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }));
          }
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore CMS Content listener notification:', err.message);
          setError(`Gagal menyambung ke Firestore: ${err.message}`);
          setSyncStatus('error');
          setIsLoading(false);
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
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const list: NewsItem[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, news: sortNewsByPublishedDate(list) };
            }
            if (isMockCleared) {
              return { ...prev, news: [] };
            }
            return { ...prev, news: prev.news?.length ? prev.news : DEFAULT_NEWS };
          });
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore News listener notice:', err.message);
          setIsLoading(false);
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
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const list: ProgramEvent[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, programs: list };
            }
            if (isMockCleared) {
              return { ...prev, programs: [] };
            }
            return { ...prev, programs: prev.programs?.length ? prev.programs : DEFAULT_PROGRAMS };
          });
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Events listener notice:', err.message);
          setIsLoading(false);
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
          const list: EventRegistration[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            list.sort(
              (a, b) =>
                new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime()
            );
          }
          setEventRegistrations(list);
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore eventRegistrations listener notice:', err.message);
          setIsLoading(false);
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
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const list: BestPracticeItem[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, practices: list };
            }
            if (isMockCleared) {
              return { ...prev, practices: [] };
            }
            return { ...prev, practices: prev.practices?.length ? prev.practices : INITIAL_BEST_PRACTICES };
          });
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Practices listener notice:', err.message);
          setIsLoading(false);
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
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const rawList: MemberSchool[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              rawList.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
          }
          setSiteData((prev) => {
            if (rawList.length > 0) {
              return { ...prev, memberSchools: sanitizeMemberSchoolsList(rawList) };
            }
            if (isMockCleared) {
              return { ...prev, memberSchools: [] };
            }
            return { ...prev, memberSchools: prev.memberSchools?.length ? prev.memberSchools : DEFAULT_MEMBER_SCHOOLS };
          });
          setSyncStatus('synced');
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Schools listener notice:', err.message);
          setIsLoading(false);
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
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const list: MediaItem[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, media: list };
            }
            if (isMockCleared) {
              return { ...prev, media: [] };
            }
            return { ...prev, media: prev.media?.length ? prev.media : DEFAULT_MEDIA };
          });
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Media listener notice:', err.message);
          setIsLoading(false);
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
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const list: ResourceDocument[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, resources: list };
            }
            if (isMockCleared) {
              return { ...prev, resources: [] };
            }
            return { ...prev, resources: prev.resources?.length ? prev.resources : DEFAULT_RESOURCES };
          });
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Resources listener notice:', err.message);
          setIsLoading(false);
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
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const list: LeaderProfile[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, leadership: sanitizeLeadershipList(list) };
            }
            if (isMockCleared) {
              return { ...prev, leadership: [] };
            }
            return { ...prev, leadership: prev.leadership?.length ? prev.leadership : DEFAULT_LEADERSHIP };
          });
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Leadership listener notice:', err.message);
          setIsLoading(false);
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
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Settings listener notice:', err.message);
          setIsLoading(false);
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
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Dashboard Settings listener notice:', err.message);
          setIsLoading(false);
        }
      );
      unsubscribes.push(unsubDashboard);
    } catch (e) {
      console.warn('Dashboard Settings listener setup:', e);
    }

    // 6c. Alumni listener (Jejak Kepimpinan & Legasi Alumni PGB)
    try {
      const unsubAlumni = onSnapshot(
        collection(db, 'alumni'),
        (snapshot) => {
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const list: AlumniRecord[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            list.sort(
              (a, b) =>
                new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
            );
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, alumni: list };
            }
            if (isMockCleared) {
              return { ...prev, alumni: [] };
            }
            return { ...prev, alumni: prev.alumni?.length ? prev.alumni : INITIAL_DEMO_ALUMNI };
          });
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Alumni listener notice:', err.message);
          setIsLoading(false);
        }
      );
      unsubscribes.push(unsubAlumni);
    } catch (e) {
      console.warn('Alumni listener setup:', e);
    }

    // 6d. Announcements listener
    try {
      const unsubAnnouncements = onSnapshot(
        collection(db, 'announcements'),
        (snapshot) => {
          const isMockCleared = typeof window !== 'undefined' && localStorage.getItem('mpgbsim_mock_cleared') === 'true';
          const list: AnnouncementItem[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            list.sort((a, b) => {
              if (a.pinned && !b.pinned) return -1;
              if (!a.pinned && b.pinned) return 1;
              return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
            });
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, announcements: list };
            }
            if (isMockCleared) {
              return { ...prev, announcements: [] };
            }
            return { ...prev, announcements: prev.announcements?.length ? prev.announcements : INITIAL_ANNOUNCEMENTS };
          });
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Announcements listener notice:', err.message);
          setIsLoading(false);
        }
      );
      unsubscribes.push(unsubAnnouncements);
    } catch (e) {
      console.warn('Announcements listener setup:', e);
    }

    // 7. Submissions listener
    try {
      const unsubSubmissions = onSnapshot(
        collection(db, 'submissions'),
        (snapshot) => {
          const list: ContactSubmission[] = [];
          if (!snapshot.empty) {
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
          }
          setSiteData((prev) => ({ ...prev, submissions: list }));
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore Submissions listener notification:', err.message);
          setError(`Gagal menyambung ke Firestore (Peti Mesej): ${err.message}`);
          setSyncStatus('error');
          setIsLoading(false);
        }
      );
      unsubscribes.push(unsubSubmissions);
    } catch (e) {
      console.warn('Submissions listener setup:', e);
    }

    // 8. Member Applications listener
    try {
      const unsubApplications = onSnapshot(
        collection(db, 'memberApplications'),
        (snapshot) => {
          const list: MemberApplication[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              if (
                docSnap.id === 'app-musleh-01' ||
                d.schoolCode === 'MJAC011' ||
                d.schoolCode === 'MIA1009' ||
                d.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
                (d.schoolName && d.schoolName.toLowerCase().includes('musleh'))
              ) {
                return;
              }
              list.push({
                id: docSnap.id,
                refId: d.refId || docSnap.id,
                fullName: d.fullName || d.name || 'Pemohon',
                icNumber: d.icNumber || '',
                email: d.email || d.pgbEmail || '',
                phoneNumber: d.phoneNumber || d.phone || d.pgbPhone || '',
                pgbEmail: d.pgbEmail || d.email || '',
                pgbPhone: d.pgbPhone || d.phone || d.phoneNumber || '',
                schoolEmail: d.schoolEmail || '',
                schoolPhone: d.schoolPhone || '',
                designation: d.designation || d.position || 'Pengetua',
                serviceStartYear: Number(d.serviceStartYear || d.pgbStartYear) || 2026,
                pgbStartYear: Number(d.pgbStartYear || d.serviceStartYear) || 2026,
                joinYear: Number(d.joinYear || d.schoolJoinYear) || new Date().getFullYear(),
                schoolJoinYear: Number(d.schoolJoinYear || d.joinYear) || new Date().getFullYear(),
                schoolName: d.schoolName || '',
                schoolCode: d.schoolCode || '',
                schoolType: d.schoolType || 'Maahad Tahfiz',
                state: d.state || '',
                district: d.district || '',
                website: d.website || '',
                studentCount: Number(d.studentCount) || 0,
                teacherCount: Number(d.teacherCount) || 0,
                logoUrl: d.logoUrl || '',
                schoolPhotoUrl: d.schoolPhotoUrl || '',
                pgbPhotoUrl: d.pgbPhotoUrl || '',
                schoolDescription: d.schoolDescription || '',
                address: d.address || '',
                status: d.status || 'pending',
                submittedAt: d.submittedAt || new Date().toISOString(),
                approvedAt: d.approvedAt,
                approvedBy: d.approvedBy,
              });
            });
          }
          setSiteData((prev) => ({ ...prev, memberApplications: sanitizeMemberApplicationsList(list) }));
          setIsLoading(false);
        },
        (err) => {
          console.warn('Firestore MemberApplications listener notification:', err.message);
          setError(`Gagal menyambung ke Firestore (Permohonan Ahli): ${err.message}`);
          setSyncStatus('error');
          setIsLoading(false);
        }
      );
      unsubscribes.push(unsubApplications);
    } catch (e) {
      console.warn('MemberApplications listener setup:', e);
    }

    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
  }, []);

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

  const updateBranding = async (data: Partial<BrandingData>) => {
    let nextBranding: BrandingData = { ...siteData.branding, ...data };
    setSiteData((prev) => {
      nextBranding = { ...prev.branding, ...data };
      const nextState = { ...prev, branding: nextBranding };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });
    saveCmsContentToFirestore({ branding: nextBranding });
    try {
      await setDoc(
        doc(db, 'siteSettings', 'general'),
        {
          branding: nextBranding,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore update branding notice:', e);
    }
    try {
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}
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

  const reorderPrograms = async (reordered: ProgramEvent[]) => {
    const orderedList = reordered.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setSiteData((prev) => ({
      ...prev,
      programs: orderedList,
    }));
    for (const item of orderedList) {
      try {
        await updateDoc(doc(db, 'events', item.id), {
          order: item.order,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        // ignore
      }
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
    // Compress any oversized base64 data URLs to protect Firestore 1MB document limit and localStorage quotas
    const safeSchoolPhotoUrl = updated.schoolPhotoUrl
      ? await compressDataUrl(updated.schoolPhotoUrl, 800, 500, 0.70)
      : updated.schoolPhotoUrl;
    const safePrincipalPhotoUrl = updated.principalPhotoUrl
      ? await compressDataUrl(updated.principalPhotoUrl, 360, 360, 0.72)
      : updated.principalPhotoUrl;
    const safeLogoUrl = updated.logoUrl
      ? await compressDataUrl(updated.logoUrl, 260, 260, 0.75)
      : updated.logoUrl;

    const safeUpdated: Partial<MemberSchool> = {
      ...updated,
      ...(safeSchoolPhotoUrl !== undefined ? { schoolPhotoUrl: safeSchoolPhotoUrl } : {}),
      ...(safePrincipalPhotoUrl !== undefined ? { principalPhotoUrl: safePrincipalPhotoUrl } : {}),
      ...(safeLogoUrl !== undefined ? { logoUrl: safeLogoUrl } : {}),
    };

    let finalUpdatedSchools: MemberSchool[] = [];
    let updatedSchoolObj: MemberSchool | null = null;

    setSiteData((prev) => {
      finalUpdatedSchools = prev.memberSchools.map((s) => {
        const isMatch =
          s.id === id ||
          (safeUpdated.code && s.code && s.code.toLowerCase().trim() === safeUpdated.code.toLowerCase().trim()) ||
          (id === 'sch-musleh-1' && (s.code === 'MJAC011' || s.code === 'MIA1009' || s.id === 'sch-musleh-1')) ||
          (safeUpdated.name && s.name && s.name.toLowerCase().trim() === safeUpdated.name.toLowerCase().trim());

        if (isMatch) {
          const merged: MemberSchool = {
            ...s,
            ...safeUpdated,
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
          ...safeUpdated,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      if (id === 'sch-musleh-1' || safeUpdated.code === 'MJAC011') {
        await setDoc(
          doc(db, 'schools', 'sch-musleh-1'),
          { ...safeUpdated, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
      }
    } catch (e) {
      console.warn('Firestore update school notice:', e);
    }

    // 2. Persist to localStorage directly (v3 only, clean up legacy)
    try {
      const key = 'mpgbsim_cms_content_v3';
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
      safeLocalStorageRemove('mpgbsim_cms_content');
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

    // 1. Persist to local storage (v3 only, clean up legacy)
    try {
      const key = 'mpgbsim_cms_content_v3';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.memberSchools = repairedSchools;
        safeLocalStorageSet(key, JSON.stringify(parsed));
      }
      safeLocalStorageRemove('mpgbsim_cms_content');
      if (repairedUser) {
        safeLocalStorageSet('mpgbsim_portal_user_v1', JSON.stringify(repairedUser));
      }
    } catch (e) {}

    // 2. Persist ONLY genuinely modified schools to Firestore (avoid writing all 150 schools)
    const prevSchoolMap = new Map((siteData.memberSchools || []).map((s) => [s.id, s]));
    repairedSchools.forEach((sch) => {
      const prev = prevSchoolMap.get(sch.id);
      const isModified = !prev || JSON.stringify(prev) !== JSON.stringify(sch);
      if (isModified) {
        setDoc(doc(db, 'schools', sch.id), sch, { merge: true }).catch(() => {});
      }
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
    const updatedApps = sanitizeMemberApplicationsList([item, ...(siteData.memberApplications || [])]);
    setSiteData((prev) => {
      const next = {
        ...prev,
        memberApplications: updatedApps,
      };
      persistSiteContent(next).catch(() => {});
      return next;
    });

    try {
      const existingRaw = StorageManagementService.getItem('mpgbsim_pending_registrations');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(item);
      StorageManagementService.setItem(
        'mpgbsim_pending_registrations',
        JSON.stringify(existing.slice(0, 50)),
        { isCritical: false }
      );
    } catch (e) {}

    window.dispatchEvent(new Event('mpgbsim_content_updated'));
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
    let nextContact: ContactInfoData = { ...siteData.contactInfo, ...data };
    setSiteData((prev) => {
      nextContact = { ...prev.contactInfo, ...data };
      const nextState = { ...prev, contactInfo: nextContact };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });
    saveCmsContentToFirestore({ contactInfo: nextContact });
    try {
      await setDoc(
        doc(db, 'siteSettings', 'general'),
        {
          contactInfo: nextContact,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore update contact notice:', e);
    }
    try {
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}
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
      const currentList = Array.isArray(prev.leadership) ? prev.leadership : [];
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
      const currentList = Array.isArray(prev.leadership) ? prev.leadership : [];
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
      const currentList = Array.isArray(prev.leadership) ? prev.leadership : [];
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
    localStorage.setItem('mpgbsim_resources_seeded', 'true');
    const updated = siteData.resources.filter((r) => r.id !== id);
    setSiteData((prev) => {
      const nextState = { ...prev, resources: updated };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });
    saveCmsContentToFirestore({ resources: updated });
    deleteDoc(doc(db, 'resources', id)).catch((err) => {
      console.warn('Ralat memadam dokumen dari Firestore collection resources:', err);
    });
    try {
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}
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

  // Alumni CRUD Implementations
  const addAlumniRecord = async (
    item: Omit<AlumniRecord, 'id' | 'submittedAt'> | AlumniRecord
  ): Promise<string> => {
    const year = new Date().getFullYear();
    const timeSuffix = Date.now().toString(36).toUpperCase().slice(-5);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = (item as AlumniRecord).id || `ALU-${year}-${timeSuffix}-${randomSuffix}`;
    const now = new Date().toISOString();
    const newRecord: AlumniRecord = {
      ...item,
      id,
      submittedAt: (item as AlumniRecord).submittedAt || now,
      createdAt: (item as AlumniRecord).createdAt || now,
      updatedAt: now,
      verificationStatus: (item as AlumniRecord).verificationStatus || 'SUBMITTED',
      consent: item.consent || {
        allowPublicDisplay: true,
        allowSchoolHistory: true,
        allowExpertise: true,
        allowQuote: true,
        allowContact: false,
      },
      leadershipHistory: item.leadershipHistory || [],
      expertise: item.expertise || [],
      legacyQuote: item.legacyQuote || '',
    };

    // Submissions inbox notification for Secretariat
    const notifData = sanitizeForFirestore({
      name: newRecord.fullName || '',
      email: newRecord.email || '',
      phone: newRecord.phone || '',
      subject: `Pendaftaran Alumni PGB: ${newRecord.fullName} (${newRecord.lastSchool || 'Pesara PGB'})`,
      category: 'Alumni',
      message: `Pendaftaran Direktori Alumni MPGBSIM baru diterima. Nama: ${newRecord.fullName}, Gelaran: ${newRecord.title || '-'}, Sekolah Terakhir: ${newRecord.lastSchool || '-'}, Tahun Bersara: ${newRecord.retirementYear || '-'}, Emel: ${newRecord.email}, Telefon: ${newRecord.phone || '-'}. Status Semasa: SUBMITTED (Perlu Pengesahan Urus Setia).`,
      status: 'unread',
      createdAt: now,
    });

    // Atomic write to both 'alumni' collection and 'submissions' notification inbox
    try {
      await ensureFirebaseAuth().catch(() => null);
      const batch = writeBatch(db);
      batch.set(doc(db, 'alumni', id), sanitizeForFirestore(newRecord as any));
      batch.set(doc(db, 'submissions', id), notifData);
      await batch.commit();
    } catch (firestoreErr: any) {
      console.error('Ralat pangkalan data Firestore semasa menghantar pendaftaran alumni:', firestoreErr);
      const code = firestoreErr?.code || '';
      const msg = (firestoreErr?.message || '').toLowerCase();

      if (code === 'resource-exhausted' || msg.includes('resource_exhausted') || msg.includes('quota') || msg.includes('limit')) {
        throw new Error(
          'Had kuota Cloud Firestore telah dicapai buat masa ini (RESOURCE_EXHAUSTED). Pendaftaran alumni tidak dapat diproses sekarang. Sila hubungi Urus Setia MPGBSIM atau cuba semula selepas kuota harian diperbaharui.'
        );
      }
      if (code === 'permission-denied' || msg.includes('permission-denied')) {
        throw new Error(
          'Akses pangkalan data ditolak oleh polisi keselamatan Cloud Firestore (PERMISSION_DENIED). Sila hubungi pentadbir portal.'
        );
      }
      if (code === 'unavailable' || msg.includes('unavailable') || msg.includes('network') || msg.includes('failed to fetch')) {
        throw new Error(
          'Pelayan Cloud Firestore tidak dapat dihubungi buat masa ini. Sila pastikan sambungan internet anda aktif dan cuba lagi.'
        );
      }
      throw new Error(
        `Gagal menyimpan pendaftaran alumni ke Cloud Firestore (${code || 'Ralat Rangkaian'}). Sila semak sambungan internet anda dan cuba lagi.`
      );
    }

    // Only update local state AFTER confirmed successful write
    setSiteData((prev) => {
      const updated = [newRecord, ...(prev.alumni || [])];
      return { ...prev, alumni: updated };
    });

    return id;
  };

  const updateAlumniRecord = async (
    id: string,
    item: Partial<AlumniRecord>
  ): Promise<void> => {
    const now = new Date().toISOString();
    const patch = { ...item, updatedAt: now };

    setSiteData((prev) => {
      const updated = (prev.alumni || []).map((a) => (a.id === id ? { ...a, ...patch } : a));
      return { ...prev, alumni: updated };
    });

    try {
      await ensureFirebaseAuth().catch(() => null);
      await updateDoc(doc(db, 'alumni', id), patch);
    } catch (e) {
      console.warn('Firestore updateAlumniRecord notice:', e);
    }
  };

  const deleteAlumniRecord = async (id: string): Promise<void> => {
    localStorage.setItem('mpgbsim_alumni_seeded', 'true');
    setSiteData((prev) => ({
      ...prev,
      alumni: (prev.alumni || []).filter((a) => a.id !== id),
    }));

    try {
      await ensureFirebaseAuth().catch(() => null);
      await deleteDoc(doc(db, 'alumni', id));
    } catch (e) {
      console.warn('Firestore deleteAlumniRecord notice:', e);
    }

    try {
      window.dispatchEvent(new Event('mpgbsim_alumni_updated'));
    } catch (e) {}
  };

  const approveAlumniRecord = async (
    id: string,
    verifiedBy = 'Pentadbir Rasmi MPGBSIM'
  ): Promise<void> => {
    const now = new Date().toISOString();
    await updateAlumniRecord(id, {
      verificationStatus: 'APPROVED',
      verifiedAt: now,
      verifiedBy,
    });
  };

  const rejectAlumniRecord = async (
    id: string,
    reason: string,
    verifiedBy = 'Pentadbir Rasmi MPGBSIM'
  ): Promise<void> => {
    const now = new Date().toISOString();
    await updateAlumniRecord(id, {
      verificationStatus: 'REJECTED',
      rejectionReason: reason,
      verifiedAt: now,
      verifiedBy,
    });
  };

  const toggleFeatureAlumniRecord = async (id: string): Promise<void> => {
    const target = (siteData.alumni || []).find((a) => a.id === id);
    if (target) {
      await updateAlumniRecord(id, { featured: !target.featured });
    }
  };

  const purgeMockData = () => {
    localStorage.setItem('mpgbsim_mock_cleared', 'true');
    const defaultNewsIds = new Set(DEFAULT_NEWS.map((n) => n.id));
    const defaultProgramIds = new Set(DEFAULT_PROGRAMS.map((p) => p.id));
    const defaultSchoolIds = new Set(DEFAULT_MEMBER_SCHOOLS.map((s) => s.id));
    const defaultPracticeIds = new Set((INITIAL_BEST_PRACTICES || []).map((p) => p.id));
    const defaultAlumniIds = new Set((INITIAL_DEMO_ALUMNI || []).map((a) => a.id));
    const defaultAnnouncementIds = new Set((INITIAL_ANNOUNCEMENTS || []).map((a) => a.id));
    const defaultMediaIds = new Set(DEFAULT_MEDIA.map((m) => m.id));
    const defaultResourceIds = new Set(DEFAULT_RESOURCES.map((r) => r.id));

    setSiteData((prev) => {
      const cleaned: SiteContentState = {
        ...prev,
        news: (prev.news || []).filter((n) => !defaultNewsIds.has(n.id)),
        programs: (prev.programs || []).filter((p) => !defaultProgramIds.has(p.id)),
        memberSchools: (prev.memberSchools || []).filter((s) => !defaultSchoolIds.has(s.id)),
        practices: (prev.practices || []).filter((p) => !defaultPracticeIds.has(p.id)),
        alumni: (prev.alumni || []).filter((a) => !defaultAlumniIds.has(a.id)),
        announcements: (prev.announcements || []).filter((a) => !defaultAnnouncementIds.has(a.id)),
        media: (prev.media || []).filter((m) => !defaultMediaIds.has(m.id)),
        resources: (prev.resources || []).filter((r) => !defaultResourceIds.has(r.id)),
      };
      persistSiteContent(cleaned).catch(() => {});
      return cleaned;
    });

    defaultNewsIds.forEach((id) => deleteDoc(doc(db, 'news', id)).catch(() => {}));
    defaultProgramIds.forEach((id) => deleteDoc(doc(db, 'events', id)).catch(() => {}));
    defaultSchoolIds.forEach((id) => deleteDoc(doc(db, 'schools', id)).catch(() => {}));
    defaultPracticeIds.forEach((id) => deleteDoc(doc(db, 'bestPractices', id)).catch(() => {}));
    defaultAlumniIds.forEach((id) => deleteDoc(doc(db, 'alumni', id)).catch(() => {}));
    defaultAnnouncementIds.forEach((id) => deleteDoc(doc(db, 'announcements', id)).catch(() => {}));
    defaultMediaIds.forEach((id) => deleteDoc(doc(db, 'media', id)).catch(() => {}));
    defaultResourceIds.forEach((id) => deleteDoc(doc(db, 'resources', id)).catch(() => {}));

    try {
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch (e) {}
  };

  const resetAllContent = () => {
    setSiteData({
      branding: DEFAULT_BRANDING,
      hero: DEFAULT_HERO,
      visionMission: DEFAULT_VISION_MISSION,
      strategicFocus: [],
      stats: DEFAULT_NETWORK_STATS,
      memberSchools: [],
      news: [],
      programs: [],
      practices: [],
      leadership: [],
      media: [],
      quote: DEFAULT_QUOTE,
      resources: [],
      cta: DEFAULT_CTA,
      contactInfo: DEFAULT_CONTACT_INFO,
      submissions: [],
      memberApplications: [],
      dashboardConfig: DEFAULT_DASHBOARD_CONFIG,
      alumni: [],
      announcements: [],
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
        isLoading,
        error,
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
        reorderPrograms,
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
        addAlumniRecord,
        updateAlumniRecord,
        deleteAlumniRecord,
        approveAlumniRecord,
        rejectAlumniRecord,
        toggleFeatureAlumniRecord,
        purgeMockData,
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
