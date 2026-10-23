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
  ExamCalendarItem,
  BirthdaySettingsConfig,
  ProgramCertificateConfig,
  MembershipCertificateConfig,
} from '../types';
import { DEFAULT_BIRTHDAY_SETTINGS } from '../utils/birthdayUtils';

import {
  persistSiteContent,
  purgeObsoleteLocalStorage,
  saveToIndexedDB,
  safeLocalStorageSet,
  safeLocalStorageGet,
  safeLocalStorageRemove,
  stripLargeBase64,
  getInitialSiteContentSync,
  getFullSiteContentAsync,
} from '../utils/storage';
import { sortNewsByPublishedDate } from '../utils/dateUtils';
import faizLeaderPhoto from '../assets/images/mohamad_faiz_azizan_leader.webp';
import { INITIAL_BEST_PRACTICES, INITIAL_ANNOUNCEMENTS } from '../data/portalMockData';
import { INITIAL_DEMO_ALUMNI } from '../data/alumniMockData';
import { DEFAULT_EXAM_CALENDAR } from '../data/defaultExamCalendar';

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
  isQuotaExceededError,
  isFirestoreQuotaExceeded,
  markFirestoreQuotaExceeded,
  clearFirestoreQuotaBreaker,
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
  examCalendar?: ExamCalendarItem[];
  birthdaySettings?: BirthdaySettingsConfig;
  programCertificateConfig?: ProgramCertificateConfig;
  membershipCertificateConfig?: MembershipCertificateConfig;
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
  isReadOnlyMode: boolean;
  isLoading: boolean;
  error: string | null;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'read-only' | 'error';
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
  // Birthday Greetings Config
  updateBirthdaySettings: (data: Partial<BirthdaySettingsConfig>) => Promise<void>;
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
  // Program Attendance & Certificate Issuance (PGB & CMS)
  updateProgramCertificateConfig: (data: Partial<ProgramCertificateConfig>) => Promise<void>;
  updateMembershipCertificateConfig: (data: Partial<MembershipCertificateConfig>) => Promise<void>;
  recordPgbProgramAttendance: (
    eventId: string,
    school: MemberSchool,
    attended: boolean,
    autoIssueCert?: boolean
  ) => Promise<void>;
  bulkRecordPgbProgramAttendance: (
    eventId: string,
    schools: MemberSchool[],
    attended: boolean,
    autoIssueCert?: boolean
  ) => Promise<void>;
  toggleProgramCertificateIssued: (
    regId: string,
    issued: boolean,
    certificateTitleOverride?: string
  ) => Promise<void>;
  bulkIssueProgramCertificates: (
    eventId: string,
    certificateTitleOverride?: string
  ) => Promise<number>;
  updateEventRegistrationDetails: (
    regId: string,
    patch: Partial<EventRegistration>
  ) => Promise<void>;
  // Alumni PGB Management
  addAlumniRecord: (item: Omit<AlumniRecord, 'id' | 'submittedAt'> | AlumniRecord) => Promise<string>;
  updateAlumniRecord: (id: string, item: Partial<AlumniRecord>) => Promise<void>;
  deleteAlumniRecord: (id: string) => Promise<void>;
  approveAlumniRecord: (id: string, verifiedBy?: string) => Promise<void>;
  rejectAlumniRecord: (id: string, reason: string, verifiedBy?: string) => Promise<void>;
  toggleFeatureAlumniRecord: (id: string) => Promise<void>;
  // Exam Calendar Management
  addExamItem: (item: Omit<ExamCalendarItem, 'id' | 'createdAt' | 'updatedAt'> | ExamCalendarItem) => Promise<string>;
  updateExamItem: (id: string, item: Partial<ExamCalendarItem>) => Promise<void>;
  deleteExamItem: (id: string) => Promise<void>;
  resetExamCalendarToDefault: () => Promise<void>;
  purgeMockData: () => void;
  resetAllContent: () => void;
}

const DEFAULT_BRANDING: BrandingData = {
  logoUrl: '/mpgbsim-official-logo.png',
  orgName: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
  shortName: 'MPGBSIM',
  motto: 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani',
  subMotto: 'Wadah musyawarah kepimpinan Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia.',
  secondaryContext:
    'Pertubuhan kebangsaan berdaftar (No. Pendaftaran ROS: PPM-002-10-23041996) di bawah Akta Pertubuhan 1966 yang menyatukan Pengetua dan Guru Besar institusi pendidikan Islam seluruh Malaysia.',
  establishedYear: '1996',
  registrationNumber: 'PPM-002-10-23041996',
};

const DEFAULT_HERO: HeroData = {
  badge: 'Badan Kepimpinan Pengetua & Guru Besar Sekolah Islam Kebangsaan (PPM-002-10-23041996)',
  btnKenaliText: 'Kenali Perlembagaan MPGBSIM',
  btnProgramText: 'Lihat Program & Takwim',
  btnPortalText: 'Portal Ahli PGB',
  trustPillars: [
    {
      title: 'Pendaftaran Rasmi',
      value: 'PPM-002-10-23041996',
      desc: 'Berdaftar di bawah Akta Pertubuhan 1966',
    },
    {
      title: 'Keahlian Perlembagaan',
      value: 'Fasal 4 (Biasa & Bersekutu)',
      desc: 'SRI, SMI, SABK, SMKA, SMAN & Tahfiz',
    },
    {
      title: 'Pemimpin Pendidikan',
      value: '1,500+ PGB & SLT',
      desc: 'Pengetua, Guru Besar & Mudir',
    },
    {
      title: 'Liputan Kebangsaan',
      value: '14 Negeri & Wilayah',
      desc: 'Penyelarasan kurikulum & kepimpinan',
    },
  ],
};

const DEFAULT_VISION_MISSION: VisionMissionData = {
  strategicPlanTitle: 'Pelan Strategik Kepimpinan Pendidikan Islam MPGBSIM (2025–2030)',
  vision: 'Peneraju Kecemerlangan Kepimpinan Pendidikan Islam Bertaraf Antarabangsa',
  visionSub:
    'Menjadikan institusi pendidikan Islam sebagai model pembinaan modal insan unggul yang mengintegrasikan ilmu naqli dan aqli berteraskan nilai ketuhanan.',
  missions: [
    'Menyatukan Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia dalam satu ikatan ukhuwah dan permuafakatan rasmi (Fasal 3(1)).',
    'Meningkatkan mutu pendidikan Islam bersepadu merangkumi akademik, kurikulum diniyah, dan pengajian tahfiz (Fasal 3(2)).',
    'Menganjurkan program latihan kepimpinan ikhtisas, kursus kompetensi PGB, dan konvensyen pendidikan kebangsaan (Fasal 3(3)).',
    'Menyelaras kurikulum, kokurikulum dan pentaksiran bersama institusi sekolah Islam ahli demi kemenjadian murid (Fasal 3(4)).',
    'Memelihara kebajikan ahli dan bertindak sebagai badan advokasi rasmi bersama KPM, JAKIM, dan JAIN/MAIN (Fasal 3(6) & 3(7)).',
  ],
  introParagraph1:
    'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) merupakan pertubuhan rasmi peringkat kebangsaan yang berdaftar di bawah Jabatan Pendaftaran Pertubuhan Malaysia (No. Pendaftaran: PPM-002-10-23041996) pada 23 April 1996 mengikut peruntukan Akta Pertubuhan 1966.',
  introParagraph2:
    'Berpaksikan Fasal 3 Perlembagaan Pertubuhan, MPGBSIM berfungsi sebagai wadah penaung dan musyawarah kepimpinan tertinggi yang menghimpunkan para Pengetua, Guru Besar, dan Mudir dari seluruh pelusuk tanah air untuk memperkasakan profesionalisme pentadbiran, penyelarasan kurikulum bersama, serta kebajikan institusi pendidikan Islam.',
  introParagraph3:
    'Mengikut Fasal 4 Perlembagaan, keahlian terbuka kepada dua kategori utama iaitu Ahli Biasa (Fasal 4(2) bagi institusi rangkaian IKRAM Musleh) dan Ahli Bersekutu (Fasal 4(3) bagi Rakan Musleh, SABK, SMKA, SMAN, SRAI, SAR dan Maahad Tahfiz) dengan moto keramat “Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani”.',
  pillar1Title: 'Tujuan & Matlamat Rasmi (Fasal 3)',
  pillar1Desc:
    'Memantapkan kompetensi instruksional, penyelarasan kurikulum diniyah dan akademik, serta advokasi dasar bersama agensi kerajaan.',
  pillar2Title: 'Keahlian Berpelembagaan (Fasal 4)',
  pillar2Desc:
    'Penyatuan inklusif Ahli Biasa (Fasal 4(2)) dan Ahli Bersekutu (Fasal 4(3)) demi melahirkan generasi Rabbani seimbang.',
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
  phone: '03-4251 6157, 03-4251 6167',
  whatsapp: '03-4251 6157',
  address: 'D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan 43300 Selangor',
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

export const DEFAULT_PROGRAM_CERTIFICATE_CONFIG: ProgramCertificateConfig = {
  defaultTemplateId: 'warisan-zaitun',
  certificateTitle: 'SIJIL PENYERTAAN PROGRAM',
  certificateSubtitle: 'MAJLIS PENGETUA GURU BESAR SEKOLAH-SEKOLAH ISLAM MALAYSIA (MPGBSIM)',
  orgRegistrationTagline: '(MPGBSIM • Pertubuhan Kebangsaan Ditubuhkan Pada 23 April 1996)',
  rosNumberText: 'NO. PENDAFTARAN ROS: PPM-002-10-23041996',
  basmalahText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
  participantCardLabel: 'Perwakilan Kepimpinan Pendidikan Islam',
  introText: 'Dengan sukacitanya diperakui dan disahkan bahawa',
  participationText: 'telah menghadiri dan menyertai dengan jayanya program:',
  recognitionClause:
    'Penyertaan dan komitmen tuan/puan dalam menjayakan program pembangunan profesionalisme kepimpinan pendidikan Islam kebangsaan ini amatlah dihargai dan disanjung tinggi.',
  chairmanName: 'USTAZ MOHAMAD FAIZ BIN AZIZAN',
  chairmanRole: 'Pengerusi Kebangsaan MPGBSIM',
  chairmanOrg: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
  chairmanSignatureImageUrl: '',
  chairmanSignatureText: 'Mohamad Faiz Azizan',
  secondarySignatoryName: 'SETIAUSAHA AGUNG & URUS SETIA',
  secondarySignatoryRole: 'Sekretariat Kebangsaan MPGBSIM',
  secondarySignatureText: 'Urus Setia Pusat',
  secondarySignatureImageUrl: '',
  qrSealLabel: 'SIJIL DIGITAL DISAHKAN',
  footerAddressText:
    'Sekretariat MPGBSIM: D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor • Tel: 03-4251 6157 / 03-4251 6167 • Laman Web Rasmi: https://www.mpgbsim.org/',
  showRosNumber: true,
  showCertNumber: true,
  showLogo: true,
  showBasmalah: true,
  showIslamicMotif: true,
  showOrgHeader: true,
  showParticipantIc: true,
  showParticipantPosition: true,
  showParticipantSchool: true,
  showProgramModeBadge: true,
  showProgramTheme: true,
  showProgramDate: true,
  showProgramVenue: true,
  showRecognitionClause: true,
  showChairmanSign: true,
  showQrSeal: true,
  showSecondarySign: true,
  showIssuedDate: true,
  showFooterAddress: true,
};

export const DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG: MembershipCertificateConfig = {
  templateId: 'warisan-zaitun',
  certificateTitle: 'SIJIL PERAKUAN KEAHLIAN RASMI',
  certificateSubtitle: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
  orgRegistrationTagline: '(MPGBSIM • Pertubuhan Kebangsaan Ditubuhkan Pada 23 April 1996)',
  rosNumberText: 'NO. PENDAFTARAN ROS: PPM-002-10-23041996',
  basmalahText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
  introText:
    'Dengan ini diperakui dan disahkan bahawa institusi pendidikan Islam yang tersebut di bawah adalah merupakan ahli berdaftar yang sah di bawah Perlembagaan Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM):',
  institutionCardLabel: 'Institusi Sekolah Ahli Berdaftar',
  principalBlockLabel: 'Perwakilan Kepimpinan Rasmi (Pengetua / Guru Besar):',
  activeSessionLabel: 'Status Sesi 2026/2027: AKTIF',
  recognitionClause:
    'Institusi ini diiktiraf secara rasmi dalam jaringan kebangsaan MPGBSIM serta layak menikmati semua keistimewaan kepimpinan, pembangunan profesionalisme PGB, penyelarasan kurikulum bersepadu, dan jaringan kerjasama strategik pendidikan Islam seluruh Malaysia.',
  chairmanName: 'USTAZ MOHAMAD FAIZ BIN AZIZAN',
  chairmanRole: 'Pengerusi Kebangsaan MPGBSIM',
  chairmanOrg: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
  chairmanSignatureImageUrl: '',
  chairmanSignatureText: 'Mohamad Faiz Azizan',
  secondarySignatoryName: 'SETIAUSAHA AGUNG & URUS SETIA',
  secondarySignatoryRole: 'Sekretariat Kebangsaan MPGBSIM',
  secondarySignatureText: 'Urus Setia Pusat',
  secondarySignatureImageUrl: '',
  qrSealLabel: 'METERAI DIGITAL DISAHKAN',
  footerAddressText:
    'Sekretariat MPGBSIM: D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor • Tel: 03-4251 6157 / 03-4251 6167 • Laman Web Rasmi: https://www.mpgbsim.org/',
  showRosNumber: true,
  showCertNumber: true,
  showLogo: true,
  showSchoolLogo: true,
  showBasmalah: true,
  showIslamicMotif: true,
  showOrgHeader: true,
  showSchoolAddress: true,
  showFasalClassification: true,
  showPrincipalBlock: true,
  showRecognitionClause: true,
  showChairmanSign: true,
  showQrSeal: true,
  showSecondarySign: true,
  showIssuedDate: true,
  showFooterAddress: true,
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
    name: 'SEKOLAH RENDAH ISLAM I MUSLEH',
    code: 'MJAC011',
    type: 'Sekolah Rendah',
    state: 'Melaka',
    district: 'Melaka Tengah',
    principal: 'Abdul Qayyum bin Yaakop',
    designation: 'Guru Besar',
    principalPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
    logoUrl: '/mpgbsim-official-logo.png',
    studentCount: 428,
    teacherCount: 32,
    joinYear: 2011,
    serviceStartYear: 2026,
    pgbStartYear: 2026,
    website: 'https://imuslehmelaka.edu.my',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Abdul Qayyum bin Yaakop.',
    address: 'No. 25-1, Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
    phone: '+60 6-335 1290',
    email: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
    schoolPhone: '+60 6-335 1290',
    schoolEmail: 'admin@imuslehmelaka.edu.my',
    pgbPhone: '+60 19-665 4321',
    pgbEmail: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
  },
  {
    id: 'school-musleh-menengah-1',
    name: 'SEKOLAH MENENGAH AGAMA I-MUSLEH',
    code: 'JAIM/SAS(M)130',
    type: 'Sekolah Menengah',
    state: 'Melaka',
    district: 'Ayer Keroh',
    principal: 'Masitah Binti Seikh Omar (Pengetua)',
    designation: 'Pengetua',
    studentCount: 79,
    teacherCount: 10,
    joinYear: 2023,
    serviceStartYear: 2023,
    pgbStartYear: 2023,
    website: 'https://i-musleh.com',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Masitah Binti Seikh Omar (Pengetua).',
    address: 'Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
    phone: '06-2349405',
    email: 'smimmelaka@gmail.com',
    schoolPhone: '06-2349405',
    schoolEmail: 'smimmelaka@gmail.com',
    pgbPhone: '013-2695286',
    pgbEmail: 'smimmelaka@gmail.com',
    logoUrl: '/mpgbsim-official-logo.png',
    schoolPhotoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80',
    principalPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'school-1791789043737-cace',
    name: 'SEKOLAH MENENGAH SRI AL-AMIN BANGI',
    code: 'BLAD001',
    type: 'Sekolah Menengah',
    state: 'Selangor',
    district: 'Hulu Langat',
    principal: 'NOOR ASYIKIN BINTI AHMAT (Pengetua)',
    designation: 'Pengetua',
    studentCount: 707,
    teacherCount: 56,
    joinYear: 2011,
    serviceStartYear: 2025,
    pgbStartYear: 2025,
    website: 'https://sriaminbangi.edu.my',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan NOOR ASYIKIN BINTI AHMAT (Pengetua).',
    address: 'SUNGAI TANGKAS, 43000 KAJANG, SELANGOR',
    phone: '03-89273520',
    email: 'srialaminbangi@gmail.com',
    schoolPhone: '03-89273520',
    schoolEmail: 'srialaminbangi@gmail.com',
    pgbPhone: '019-3543665',
    pgbEmail: 'noorasyikinahmat@gmail.com',
  },
  {
    id: 'school-1791789047582-2zji',
    name: 'SEKOLAH RENDAH ISLAM AMAL RINTIS',
    code: 'PYR0003',
    type: 'Sekolah Rendah',
    state: 'Perak',
    district: 'Kelian Intan',
    principal: 'UMAR AL-MUKHTAR BIN ISMAIL (Guru Besar)',
    designation: 'Guru Besar',
    studentCount: 81,
    teacherCount: 11,
    joinYear: 2015,
    serviceStartYear: 2015,
    pgbStartYear: 2015,
    website: 'https://www.facebook.com/sriamalrintis',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan UMAR AL-MUKHTAR BIN ISMAIL (Guru Besar).',
    address: '40, TINGKAT 1, LORONG PERDA SELATAN 2,',
    phone: '04-5404486',
    email: 'sriamalrintis@gmail.com',
    schoolPhone: '04-5404486',
    schoolEmail: 'sriamalrintis@gmail.com',
    pgbPhone: '0195417821',
    pgbEmail: 'batlagenda@gmail.com',
  },
  {
    id: 'school-1791891937952-h03g',
    name: 'Sekolah Menengah Al-Azhar',
    code: 'KO5E103',
    type: 'Sekolah Menengah',
    state: 'Kedah',
    district: 'Kubang Pasu',
    principal: 'Mohd Syahir Bin Ismail (Pengetua)',
    designation: 'Pengetua',
    studentCount: 132,
    teacherCount: 19,
    joinYear: 2008,
    serviceStartYear: 2012,
    pgbStartYear: 2012,
    website: 'https://www.ppaz.info',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Mohd Syahir Bin Ismail (Pengetua).',
    address: 'Mukim Gelung, 06000 Jitra Kedah',
    phone: '049291758',
    email: 'srazsmaz@gmail.com',
    schoolPhone: '049291758',
    schoolEmail: 'srazsmaz@gmail.com',
    pgbPhone: '019-4786105',
    pgbEmail: 'masybur80@yahoo.com',
  },
  {
    id: 'school-1791899020271-9h5s',
    name: 'SEKOLAH RENDAH ISLAM AL AMIN WILAYAH PERSEKUTUAN',
    code: 'WJJ 0005',
    type: 'Sekolah Rendah',
    state: 'Wilayah Persekutuan',
    district: 'SETAPAK',
    principal: 'MOHAMAD FAIZ BIN AZIZAN (Guru Besar)',
    designation: 'Guru Besar',
    studentCount: 650,
    teacherCount: 45,
    joinYear: 2012,
    serviceStartYear: 2016,
    pgbStartYear: 2016,
    website: 'https://www.al-amin.edu.my/sriaawp/',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan MOHAMAD FAIZ BIN AZIZAN (Guru Besar).',
    address: 'LOT 14073, JALAN 14/26, TAMAN SRI RAMPAI, 53500, KUALA LUMPUR',
    phone: '012-2252567',
    email: 'sriaawp@al-amin.edu.my',
    schoolPhone: '012-2252567',
    schoolEmail: 'sriaawp@al-amin.edu.my',
    pgbPhone: '013-6288012',
    pgbEmail: 'faiz@al-amin.edu.my',
  },
  {
    id: 'school-1791963595619-k4xh',
    name: 'SEKOLAH RENDAH AL-AZHAR',
    code: 'KJA3002',
    type: 'Sekolah Rendah',
    state: 'Kedah',
    district: 'KUBANG PASU',
    principal: 'MOHD RAZMAN BIN RAMZAN (Guru Besar)',
    designation: 'Guru Besar',
    studentCount: 510,
    teacherCount: 45,
    joinYear: 1990,
    serviceStartYear: 2019,
    pgbStartYear: 2019,
    website: 'https://ppaz.info',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan MOHD RAZMAN BIN RAMZAN (Guru Besar).',
    address: 'MUKIM GELONG 06000 JITRA',
    phone: '04-9291758',
    email: 'srazsmaz@gmail.com',
    schoolPhone: '04-9291758',
    schoolEmail: 'srazsmaz@gmail.com',
    pgbPhone: '013-4365669',
    pgbEmail: 'razman2015@gmail.com',
  },
  {
    id: 'school-1791964737746-9nv2',
    name: 'SEKOLAH MENENGAH ISLAM AL-AMIN KEMAMAN',
    code: 'TLA2001',
    type: 'Sekolah Menengah',
    state: 'Terengganu',
    district: 'KEMAMAN',
    principal: 'Azman bin Dosan (Pengetua)',
    designation: 'Pengetua',
    studentCount: 237,
    teacherCount: 31,
    joinYear: 2010,
    serviceStartYear: 2021,
    pgbStartYear: 2021,
    website: 'https://alaminkemaman.edu.my',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Azman bin Dosan (Pengetua).',
    address: 'LOT 4363, GELIGA BESAR, 24000 KEMAMAN, TERENGGANU',
    phone: '09-8683776',
    email: 'smialaminkmn@gmail.com',
    schoolPhone: '09-8683776',
    schoolEmail: 'smialaminkmn@gmail.com',
    pgbPhone: '013-9196700',
    pgbEmail: 'me_duse6193@yahoo.com',
  },
  {
    id: 'school-1791967608046-tdt3',
    name: 'SEKOLAH RENDAH AL ISLAH ',
    code: 'KJA3001',
    type: 'Sekolah Rendah',
    state: 'Kedah',
    district: 'SUNGAI PETANI',
    principal: 'Rodiah binti Jusoh (Guru Besar)',
    designation: 'Guru Besar',
    studentCount: 714,
    teacherCount: 51,
    joinYear: 1987,
    serviceStartYear: 2026,
    pgbStartYear: 2026,
    website: 'https://www.islah.edu.my',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Rodiah binti Jusoh (Guru Besar).',
    address: 'LOT 292. KAMPUNG POKOK ASAM ,JALAN PINANG TUNGGAL, 08000 SUNGAI PETANI KEDAH DARUL AMAN',
    phone: '04-4387866',
    email: 'rendah@islah.edu.my',
    schoolPhone: '04-4387866',
    schoolEmail: 'rendah@islah.edu.my',
    pgbPhone: '0195774946',
    pgbEmail: 'rendah@islah.edu.my',
  },
  {
    id: 'school-1792032674842-3w99',
    name: 'SEKOLAH RENDAH ISLAM HIDAYAH PASIRRIS BATU PAHAT',
    code: 'JJAA002',
    type: 'Sekolah Rendah',
    state: 'Johor',
    district: 'Batu Pahat',
    principal: 'Miftakhul Ngulum binti Imam Sholikhin (Guru Besar)',
    designation: 'Guru Besar',
    studentCount: 192,
    teacherCount: 19,
    joinYear: 2018,
    serviceStartYear: 2023,
    pgbStartYear: 2023,
    website: 'https://hidayah.edu.my/srih-bp/',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Miftakhul Ngulum binti Imam Sholikhin (Guru Besar).',
    address: 'No 83, Jalan Shufaat, Kampung Olak Batu, 86400 Parit Raja, Batu Pahat, Johor.',
    phone: '07-4530148',
    email: 'srih.bp@hidayah.edu.my',
    schoolPhone: '07-4530148',
    schoolEmail: 'srih.bp@hidayah.edu.my',
    pgbPhone: '013-6135419',
    pgbEmail: 'miftakhul.ngulum@hidayah.edu.my',
  },
  {
    id: 'school-1792032676371-wcfs',
    name: "MAAHAD TAHFIZ AS-SA'IDIYYAH",
    code: 'NZG4001',
    type: 'Sekolah Menengah',
    state: 'Negeri Sembilan',
    district: 'SEREMBAN',
    principal: 'NORHAYATI BINTI BAHARUM (Pengetua)',
    designation: 'Pengetua',
    studentCount: 197,
    teacherCount: 19,
    joinYear: 2010,
    serviceStartYear: 2019,
    pgbStartYear: 2019,
    website: 'https://ppasb.edu.my',
    description: "Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan NORHAYATI BINTI BAHARUM (Pengetua).",
    address: 'TAMAN RASHIDAH UTAMA JALAN SENAWANG-PAROI 70450 SEREMBAN, NEGERI SEMBILAN ',
    phone: '066773241',
    email: 'mtasns2020@gmail.com',
    schoolPhone: '066773241',
    schoolEmail: 'mtasns2020@gmail.com',
    pgbPhone: '0 11-1436 1968',
    pgbEmail: 'norhayatisrias@gmail.com',
  },
  {
    id: 'school-1792032678683-udnx',
    name: 'SEKOLAH RENDAH SRI AL-AMIN CYBERJAYA',
    code: 'BJJ9029',
    type: 'Sekolah Rendah',
    state: 'Selangor',
    district: 'Sepang',
    principal: 'Muhd Najhan Bin Rani (Guru Besar)',
    designation: 'Guru Besar',
    studentCount: 471,
    teacherCount: 35,
    joinYear: 2020,
    serviceStartYear: 2026,
    pgbStartYear: 2026,
    website: 'https://psaab.edu.my/saac/',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Muhd Najhan Bin Rani (Guru Besar).',
    address: 'No. EG-3, Jalan GC4, Glomac Cyberjaya, Cyber 4, 63200 Cyberjaya, Selangor',
    phone: '03-8322 6060',
    email: 'srialamincyberjaya@gmail.com',
    schoolPhone: '03-8322 6060',
    schoolEmail: 'srialamincyberjaya@gmail.com',
    pgbPhone: '018-2951446',
    pgbEmail: 'najhanr.aac@srialamin.edu.my',
  },
  {
    id: 'school-1792032680560-6vcm',
    name: 'SEKOLAH RENDAH ISLAM AL HIDAYAH IPOH',
    code: 'AYR2001',
    type: 'Sekolah Rendah',
    state: 'Perak',
    district: 'Ipoh',
    principal: 'Suriani binti Suratman (Guru Besar)',
    designation: 'Guru Besar',
    studentCount: 740,
    teacherCount: 51,
    joinYear: 1989,
    serviceStartYear: 2021,
    pgbStartYear: 2021,
    website: 'https://www.alhidayahperak.edu.my',
    description: 'Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan Suriani binti Suratman (Guru Besar).',
    address: 'Lot 20849, Persiaran Sepakat 7, Taman Indah Jaya, 31350 Ipoh, Perak',
    phone: '05-3126095',
    email: 'srahipoh@gmail.com',
    schoolPhone: '05-3126095',
    schoolEmail: 'srahipoh@gmail.com',
    pgbPhone: '019-5595810',
    pgbEmail: 'suriani@alhidayahperak.edu.my',
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

/**
 * Ensures schoolPhotoUrl, logoUrl, and principalPhotoUrl are never lost when merging from stripped caches
 * and cross-hydrates any missing media from existing state or approved memberApplications.
 */
const extractIcFromSubmissions = (
  submissions: ContactSubmission[] | undefined,
  codeNorm: string,
  nameNorm: string,
  emailNorm: string,
  principalNorm: string
): string => {
  if (!submissions || submissions.length === 0) return '';
  for (const sub of submissions) {
    const msg = sub.message || '';
    const kpMatch = msg.match(/No\s*KP:\s*([0-9A-Za-z-]{6,20})/i);
    if (!kpMatch || !kpMatch[1] || kpMatch[1] === '-') continue;
    const msgLower = msg.toLowerCase();
    const subEmailLower = (sub.email || '').trim().toLowerCase();
    const subNameLower = (sub.name || '').trim().toLowerCase();
    const subjLower = (sub.subject || '').toLowerCase();

    const matchesSchool =
      (codeNorm && msgLower.includes(`(${codeNorm})`)) ||
      (nameNorm && (msgLower.includes(nameNorm) || subjLower.includes(nameNorm))) ||
      (emailNorm && (subEmailLower === emailNorm || msgLower.includes(emailNorm))) ||
      (principalNorm && subNameLower && (principalNorm.includes(subNameLower) || subNameLower.includes(principalNorm)));

    if (matchesSchool) {
      return kpMatch[1].trim();
    }
  }
  return '';
};

const mergeSchoolsPreservingMedia = (
  incoming: MemberSchool[],
  fallbackSchools?: MemberSchool[],
  applications?: MemberApplication[],
  submissions?: ContactSubmission[]
): MemberSchool[] => {
  if (!incoming || incoming.length === 0) return fallbackSchools || [];
  const fbList = fallbackSchools || [];
  const appList = applications || [];

  return incoming.map((sch) => {
    const codeNorm = (sch.code || '').trim().toLowerCase();
    const nameNorm = (sch.name || '').trim().toLowerCase();
    const pgbEmailNorm = (sch.pgbEmail || sch.email || '').trim().toLowerCase();
    const principalNorm = (sch.principal || '')
      .replace(/\(.*?\)/g, '')
      .trim()
      .toLowerCase();

    const prevMatch = fbList.find(
      (f) =>
        f.id === sch.id ||
        (codeNorm && (f.code || '').trim().toLowerCase() === codeNorm) ||
        (nameNorm && (f.name || '').trim().toLowerCase() === nameNorm)
    );

    const appMatch = appList.find((a) => {
      const aCode = (a.schoolCode || '').trim().toLowerCase();
      const aName = (a.schoolName || '').trim().toLowerCase();
      const aEmail = (a.email || a.pgbEmail || '').trim().toLowerCase();
      const aFullName = (a.fullName || '').trim().toLowerCase();
      return (
        (codeNorm && aCode && aCode === codeNorm) ||
        (nameNorm && aName && aName === nameNorm) ||
        (pgbEmailNorm && aEmail && aEmail === pgbEmailNorm) ||
        (principalNorm && aFullName && (principalNorm.includes(aFullName) || aFullName.includes(principalNorm))) ||
        (nameNorm.includes('wilayah persekutuan') && aName.includes('wilayah persekutuan'))
      );
    });

    const schoolPhotoUrl =
      sch.schoolPhotoUrl ||
      prevMatch?.schoolPhotoUrl ||
      appMatch?.schoolPhotoUrl ||
      '';
    const logoUrl =
      sch.logoUrl ||
      prevMatch?.logoUrl ||
      appMatch?.logoUrl ||
      '';
    const principalPhotoUrl =
      sch.principalPhotoUrl ||
      prevMatch?.principalPhotoUrl ||
      appMatch?.pgbPhotoUrl ||
      '';
    const icNumber =
      sch.icNumber ||
      prevMatch?.icNumber ||
      appMatch?.icNumber ||
      extractIcFromSubmissions(submissions, codeNorm, nameNorm, pgbEmailNorm, principalNorm) ||
      '';
    const verifiedBirthDate =
      sch.verifiedBirthDate ||
      prevMatch?.verifiedBirthDate ||
      '';
    const cachedBirthMonthDay =
      sch.cachedBirthMonthDay ||
      prevMatch?.cachedBirthMonthDay ||
      '';
    const rawPgbPhone = (sch.pgbPhone || '').trim();
    const officePhone = (sch.schoolPhone || sch.phone || '').trim();
    const isPgbOfficeConflated = rawPgbPhone && officePhone && rawPgbPhone === officePhone;
    const appPersonalPhone = (appMatch?.phoneNumber || appMatch?.pgbPhone || '').trim();

    const pgbPhone =
      (!isPgbOfficeConflated && rawPgbPhone && rawPgbPhone !== '-')
        ? rawPgbPhone
        : appPersonalPhone && appPersonalPhone !== officePhone
        ? appPersonalPhone
        : rawPgbPhone || prevMatch?.pgbPhone || appPersonalPhone || '';
    const pgbEmail =
      sch.pgbEmail ||
      prevMatch?.pgbEmail ||
      appMatch?.pgbEmail ||
      appMatch?.email ||
      '';
    const membershipType =
      sch.membershipType ||
      prevMatch?.membershipType ||
      appMatch?.membershipType ||
      (sch.type === 'Rakan Musleh' || (sch.type || '').toLowerCase().includes('rakan') ? 'Ahli Bersekutu' : 'Ahli Biasa');

    const isSriMusleh =
      sch.id === 'sch-musleh-1' ||
      codeNorm === 'mjac011' ||
      (nameNorm.includes('musleh') && (nameNorm.includes('rendah') || nameNorm.includes('sri')));
    const resolvedJoinYear = isSriMusleh
      ? (sch.joinYear && sch.joinYear !== 2026 ? sch.joinYear : (prevMatch?.joinYear && prevMatch.joinYear !== 2026 ? prevMatch.joinYear : 2011))
      : (sch.joinYear || prevMatch?.joinYear || appMatch?.joinYear);

    return {
      ...sch,
      membershipType,
      ...(resolvedJoinYear ? { joinYear: resolvedJoinYear } : {}),
      ...(schoolPhotoUrl ? { schoolPhotoUrl } : {}),
      ...(logoUrl ? { logoUrl } : {}),
      ...(principalPhotoUrl ? { principalPhotoUrl } : {}),
      ...(icNumber ? { icNumber } : {}),
      ...(verifiedBirthDate ? { verifiedBirthDate } : {}),
      ...(cachedBirthMonthDay ? { cachedBirthMonthDay } : {}),
      ...(pgbEmail ? { pgbEmail } : {}),
      ...(pgbPhone ? { pgbPhone } : {}),
    };
  });
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
          membershipType: item.membershipType || (item.schoolType === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa'),
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

export const DEFAULT_MEMBER_APPLICATIONS: MemberApplication[] = [
  {
    id: 'MPGB-2026-BJROO-6440',
    refId: 'MPGB-2026-BJROO-6440',
    fullName: 'Masitah Binti Seikh Omar',
    icNumber: '730627-01-5156',
    email: 'smimmelaka@gmail.com',
    phoneNumber: '013-2695286',
    pgbEmail: 'smimmelaka@gmail.com',
    pgbPhone: '013-2695286',
    schoolEmail: 'smimmelaka@gmail.com',
    schoolPhone: '06-2349405',
    designation: 'Pengetua',
    serviceStartYear: 2023,
    pgbStartYear: 2023,
    joinYear: 2023,
    schoolJoinYear: 2023,
    schoolName: 'SEKOLAH MENENGAH AGAMA I-MUSLEH',
    schoolCode: 'JAIM/SAS(M)130',
    schoolType: 'Sekolah Menengah',
    state: 'Melaka',
    district: 'Ayer Keroh',
    address: 'Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
    website: 'https://i-musleh.com',
    studentCount: 79,
    teacherCount: 10,
    status: 'approved',
    submittedAt: '2026-10-17T11:34:14.760Z',
    approvedAt: '2026-10-18T07:45:31.198Z',
    approvedBy: 'mpgbsim.cemerlang@gmail.com',
  },
];

const sanitizeMemberApplicationsList = (apps: MemberApplication[] = []): MemberApplication[] => {
  const pendingFromLocal = getPendingRegistrationsFromStorage();
  const combined = [...pendingFromLocal, ...DEFAULT_MEMBER_APPLICATIONS, ...(apps || [])];
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
      (app.schoolCode === 'MJAC011' && app.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my');

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
  let maxExplicitOrder = 0;
  baseList.forEach((l) => {
    if (l.order !== undefined && l.order !== null && !isNaN(Number(l.order))) {
      maxExplicitOrder = Math.max(maxExplicitOrder, Number(l.order));
    }
  });

  // Sort items without explicit order by their timestamp ID (e.g., ldr-1790730350833) so chronological order is preserved
  const preSorted = [...baseList].sort((a, b) => {
    const aHasOrder = a.order !== undefined && a.order !== null && !isNaN(Number(a.order));
    const bHasOrder = b.order !== undefined && b.order !== null && !isNaN(Number(b.order));
    if (aHasOrder && bHasOrder) return Number(a.order) - Number(b.order);
    if (aHasOrder) return -1;
    if (bHasOrder) return 1;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });

  let nextUnassignedOrder = maxExplicitOrder + 1;

  const mapped = preSorted.map((l) => {
    const isFaiz = l.id === 'lead-1' || l.name?.toLowerCase().includes('faiz');
    const avatar = isFaiz
      ? (l.avatarUrl && !l.avatarUrl.includes('photo-1507003211169') ? l.avatarUrl : faizLeaderPhoto)
      : (l.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600');
    const hasExplicitOrder = l.order !== undefined && l.order !== null && !isNaN(Number(l.order));
    const effectiveOrder = hasExplicitOrder
      ? Number(l.order)
      : isFaiz
        ? 0
        : nextUnassignedOrder++;
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
  EVENT_REGISTRATIONS: 'mpgbsim_event_registrations_v1',
  FIRESTORE_CACHE_PREFIX: 'mpgbsim_fs_cache_',
  CACHE_META: 'mpgbsim_fs_cache_meta_v1',
};

/**
 * Cache retrieved Firestore collection/document data into localStorage
 * with base64 compaction and LRU quota protection so 'read-only' mode always has fresh cached data.
 */
function cacheFirestoreCollection<T>(collectionKey: string, data: T): void {
  try {
    const compact = stripLargeBase64(data, 25000);
    safeLocalStorageSet(
      `${STORAGE_KEYS.FIRESTORE_CACHE_PREFIX}${collectionKey}`,
      JSON.stringify(compact)
    );
    const metaRaw = safeLocalStorageGet(STORAGE_KEYS.CACHE_META);
    const meta = metaRaw ? JSON.parse(metaRaw) : {};
    meta[collectionKey] = new Date().toISOString();
    meta.lastUpdated = new Date().toISOString();
    safeLocalStorageSet(STORAGE_KEYS.CACHE_META, JSON.stringify(meta));
  } catch {
    // Non-blocking cache write
  }
}

/**
 * Read cached Firestore collection/document data from localStorage
 */
function getCachedFirestoreCollection<T>(collectionKey: string): T | null {
  try {
    const raw = safeLocalStorageGet(`${STORAGE_KEYS.FIRESTORE_CACHE_PREFIX}${collectionKey}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function mergeNewsPreservingMedia(
  primaryList?: NewsItem[] | null,
  ...fallbackLists: (NewsItem[] | undefined | null)[]
): NewsItem[] {
  const base = Array.isArray(primaryList) ? primaryList : [];
  if (base.length === 0) return [];

  const fallbackMap = new Map<string, NewsItem>();
  for (const list of fallbackLists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || !item.id) continue;
      const existing = fallbackMap.get(item.id);
      if (!existing) {
        fallbackMap.set(item.id, item);
      } else {
        const bestImg =
          existing.imageUrl && existing.imageUrl.trim() !== ''
            ? existing.imageUrl
            : item.imageUrl && item.imageUrl.trim() !== ''
            ? item.imageUrl
            : '';
        fallbackMap.set(item.id, { ...item, ...existing, imageUrl: bestImg });
      }
    }
  }

  return base.map((item) => {
    const fb = fallbackMap.get(item.id);
    if (!fb) return item;
    const hasPrimaryImage = Boolean(item.imageUrl && item.imageUrl.trim() !== '');
    const hasFallbackImage = Boolean(fb.imageUrl && fb.imageUrl.trim() !== '');
    const resolvedImageUrl = hasPrimaryImage
      ? item.imageUrl
      : hasFallbackImage
      ? fb.imageUrl
      : item.imageUrl || '';

    return {
      ...fb,
      ...item,
      imageUrl: resolvedImageUrl,
    };
  });
}

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
  const buildStateFromLocalStorageCache = (prev?: SiteContentState): SiteContentState => {
    const initialSync = getInitialSiteContentSync();
    const cachedCms = getCachedFirestoreCollection<Partial<SiteContentState>>('cmsContent');
    const cachedLeadership = getCachedFirestoreCollection<LeaderProfile[]>('leadership');
    const cachedResources = getCachedFirestoreCollection<ResourceDocument[]>('resources');
    const cachedNews = getCachedFirestoreCollection<NewsItem[]>('news');
    const cachedEvents = getCachedFirestoreCollection<ProgramEvent[]>('events');
    const cachedPractices = getCachedFirestoreCollection<BestPracticeItem[]>('bestPractices');
    const cachedSchools = getCachedFirestoreCollection<MemberSchool[]>('schools');
    const cachedMedia = getCachedFirestoreCollection<MediaItem[]>('media');
    const cachedAlumni = getCachedFirestoreCollection<AlumniRecord[]>('alumni');
    const cachedAnnouncements = getCachedFirestoreCollection<AnnouncementItem[]>('announcements');
    const cachedExams = getCachedFirestoreCollection<ExamCalendarItem[]>('examCalendar');
    const cachedSubmissions = getCachedFirestoreCollection<ContactSubmission[]>('submissions');
    const cachedApplications = getCachedFirestoreCollection<MemberApplication[]>('memberApplications');

    const rawSchools =
      (cachedSchools && cachedSchools.length > 0 ? cachedSchools : null) ||
      (initialSync?.memberSchools?.length ? initialSync.memberSchools : null) ||
      (prev?.memberSchools?.length ? prev.memberSchools : DEFAULT_MEMBER_SCHOOLS);

    const rawNews = mergeNewsPreservingMedia(
      (cachedNews && cachedNews.length > 0 ? cachedNews : null) ||
        (initialSync?.news?.length ? initialSync.news : null) ||
        (prev?.news?.length ? prev.news : DEFAULT_NEWS),
      initialSync?.news,
      prev?.news,
      DEFAULT_NEWS
    );

    const rawPrograms =
      (cachedEvents && cachedEvents.length > 0 ? cachedEvents : null) ||
      (initialSync?.programs?.length ? initialSync.programs : null) ||
      (prev?.programs?.length ? prev.programs : DEFAULT_PROGRAMS);

    const rawPractices =
      (cachedPractices && cachedPractices.length > 0 ? cachedPractices : null) ||
      (initialSync?.practices?.length ? initialSync.practices : null) ||
      (prev?.practices?.length ? prev.practices : INITIAL_BEST_PRACTICES);

    const rawLeadership =
      (cachedLeadership && cachedLeadership.length > 0 ? cachedLeadership : null) ||
      (initialSync?.leadership?.length ? initialSync.leadership : null) ||
      (prev?.leadership?.length ? prev.leadership : null) ||
      (cachedCms?.leadership && cachedCms.leadership.length > 0 ? cachedCms.leadership : DEFAULT_LEADERSHIP);

    const rawMedia =
      (cachedMedia && cachedMedia.length > 0 ? cachedMedia : null) ||
      (initialSync?.media?.length ? initialSync.media : null) ||
      (prev?.media?.length ? prev.media : DEFAULT_MEDIA);

    const rawResources =
      (cachedResources && cachedResources.length > 0 ? cachedResources : null) ||
      (initialSync?.resources?.length ? initialSync.resources : null) ||
      (prev?.resources?.length ? prev.resources : null) ||
      (cachedCms?.resources && cachedCms.resources.length > 0 ? cachedCms.resources : DEFAULT_RESOURCES);

    const rawAlumni =
      (cachedAlumni && cachedAlumni.length > 0 ? cachedAlumni : null) ||
      (initialSync?.alumni?.length ? initialSync.alumni : null) ||
      (prev?.alumni?.length ? prev.alumni : INITIAL_DEMO_ALUMNI);

    const rawAnnouncements =
      (cachedAnnouncements && cachedAnnouncements.length > 0 ? cachedAnnouncements : null) ||
      (initialSync?.announcements?.length ? initialSync.announcements : null) ||
      (prev?.announcements?.length ? prev.announcements : INITIAL_ANNOUNCEMENTS);

    const rawExams =
      (cachedExams && cachedExams.length > 0 ? cachedExams : null) ||
      (initialSync?.examCalendar?.length ? initialSync.examCalendar : null) ||
      (prev?.examCalendar?.length ? prev.examCalendar : DEFAULT_EXAM_CALENDAR);

    const rawSubmissions =
      (cachedSubmissions && cachedSubmissions.length > 0 ? cachedSubmissions : null) ||
      (initialSync?.submissions?.length ? initialSync.submissions : null) ||
      (prev?.submissions?.length ? prev.submissions : []);

    const rawApplications =
      (cachedApplications && cachedApplications.length > 0 ? cachedApplications : null) ||
      (initialSync?.memberApplications?.length ? initialSync.memberApplications : null) ||
      (prev?.memberApplications?.length ? prev.memberApplications : DEFAULT_MEMBER_APPLICATIONS);

    return {
      branding: cachedCms?.branding || initialSync?.branding || prev?.branding || DEFAULT_BRANDING,
      hero: cachedCms?.hero || initialSync?.hero || prev?.hero || DEFAULT_HERO,
      visionMission: cachedCms?.visionMission || initialSync?.visionMission || prev?.visionMission || DEFAULT_VISION_MISSION,
      strategicFocus:
        (cachedCms?.strategicFocus?.length ? cachedCms.strategicFocus : null) ||
        (initialSync?.strategicFocus?.length ? initialSync.strategicFocus : null) ||
        prev?.strategicFocus ||
        DEFAULT_STRATEGIC_FOCUS,
      stats:
        (cachedCms?.stats?.schoolsCount ? cachedCms.stats : null) ||
        (initialSync?.stats?.schoolsCount ? initialSync.stats : null) ||
        prev?.stats ||
        DEFAULT_NETWORK_STATS,
      memberSchools: mergeSchoolsPreservingMedia(
        sanitizeMemberSchoolsList(rawSchools),
        prev?.memberSchools,
        rawApplications
      ),
      news: sortNewsByPublishedDate(rawNews),
      programs: rawPrograms,
      practices: rawPractices,
      leadership: sanitizeLeadershipList(rawLeadership),
      media: rawMedia,
      quote: cachedCms?.quote || initialSync?.quote || prev?.quote || DEFAULT_QUOTE,
      resources: rawResources,
      cta: cachedCms?.cta || initialSync?.cta || prev?.cta || DEFAULT_CTA,
      contactInfo: cachedCms?.contactInfo || initialSync?.contactInfo || prev?.contactInfo || DEFAULT_CONTACT_INFO,
      submissions: rawSubmissions,
      memberApplications: sanitizeMemberApplicationsList(rawApplications),
      dashboardConfig: cachedCms?.dashboardConfig || initialSync?.dashboardConfig || prev?.dashboardConfig || DEFAULT_DASHBOARD_CONFIG,
      alumni: rawAlumni,
      announcements: rawAnnouncements,
      examCalendar: rawExams,
      birthdaySettings:
        cachedCms?.birthdaySettings ||
        initialSync?.birthdaySettings ||
        prev?.birthdaySettings ||
        DEFAULT_BIRTHDAY_SETTINGS,
      programCertificateConfig:
        cachedCms?.programCertificateConfig ||
        initialSync?.programCertificateConfig ||
        prev?.programCertificateConfig ||
        DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
      membershipCertificateConfig:
        cachedCms?.membershipCertificateConfig ||
        initialSync?.membershipCertificateConfig ||
        prev?.membershipCertificateConfig ||
        DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG,
    };
  };

  const [siteData, setSiteData] = useState<SiteContentState>(() => buildStateFromLocalStorageCache());

  const [isReadOnlyMode, setIsReadOnlyMode] = useState<boolean>(() => isFirestoreQuotaExceeded());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(() => !isFirestoreQuotaExceeded());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'read-only' | 'error'>(() =>
    isFirestoreQuotaExceeded() ? 'read-only' : 'synced'
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    try {
      const metaRaw = safeLocalStorageGet(STORAGE_KEYS.CACHE_META);
      if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        if (meta?.lastUpdated) {
          return new Date(meta.lastUpdated).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
        }
      }
    } catch {}
    return null;
  });

  // Event Registrations state initialized from localStorage cache so read-only mode retains registrations
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(() => {
    const cachedRegs = getCachedFirestoreCollection<EventRegistration[]>('eventRegistrations');
    if (cachedRegs && Array.isArray(cachedRegs) && cachedRegs.length > 0) {
      return cachedRegs;
    }
    try {
      const raw = safeLocalStorageGet(STORAGE_KEYS.EVENT_REGISTRATIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  /**
   * Transitions the app gracefully into 'read-only' cache mode when Firestore quota limits are reached.
   * Restores cached content from localStorage and clears blocking errors so the UI continues seamlessly.
   */
  const activateQuotaReadOnlyMode = (source?: string) => {
    markFirestoreQuotaExceeded(source);
    setIsReadOnlyMode(true);
    setIsFirebaseConnected(false);
    setSyncStatus('read-only');
    setError(null);
    setIsLoading(false);
    setSiteData((prev) => buildStateFromLocalStorageCache(prev));
    const cachedRegs = getCachedFirestoreCollection<EventRegistration[]>('eventRegistrations');
    if (cachedRegs && Array.isArray(cachedRegs) && cachedRegs.length > 0) {
      setEventRegistrations((prev) => (prev.length > 0 ? prev : cachedRegs));
    }
  };

  // Helper to persist any CMS content section to Firestore in real-time across devices
  const saveCmsContentToFirestore = async (patch: Partial<SiteContentState>) => {
    if (patch.leadership) {
      cacheFirestoreCollection('leadership', patch.leadership);
    }
    if (patch.resources) {
      cacheFirestoreCollection('resources', patch.resources);
    }
    // Always update the local cmsContent cache first
    const existingCachedCms = getCachedFirestoreCollection<Partial<SiteContentState>>('cmsContent') || {};
    cacheFirestoreCollection('cmsContent', { ...existingCachedCms, ...patch });

    if (isFirestoreQuotaExceeded()) {
      activateQuotaReadOnlyMode('saveCmsContentToFirestore');
      return;
    }

    try {
      setSyncStatus('syncing');
      await ensureFirebaseAuth().catch(() => null);
      // Omit heavy base64 payloads from leadership/resources inside the single cmsContent doc to respect Firestore 1MB limit
      // (Full leadership and resource documents are stored in their dedicated 'leadership' and 'resources' collections)
      const safePatchForCmsDoc: Record<string, any> = { ...patch };
      if (Array.isArray(safePatchForCmsDoc.leadership)) {
        safePatchForCmsDoc.leadership = safePatchForCmsDoc.leadership.map((l: LeaderProfile) => ({
          ...l,
          avatarUrl: l.avatarUrl && l.avatarUrl.startsWith('data:') && l.avatarUrl.length > 15000 ? '' : l.avatarUrl,
        }));
      }
      if (Array.isArray(safePatchForCmsDoc.resources)) {
        safePatchForCmsDoc.resources = safePatchForCmsDoc.resources.map((r: ResourceDocument) => ({
          ...r,
          fileUrl: r.fileUrl && r.fileUrl.startsWith('data:') && r.fileUrl.length > 15000 ? '' : r.fileUrl,
        }));
      }
      await setDoc(
        doc(db, 'siteSettings', 'cmsContent'),
        {
          ...safePatchForCmsDoc,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      clearFirestoreQuotaBreaker();
      setIsReadOnlyMode(false);
      setIsFirebaseConnected(true);
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      if (isQuotaExceededError(err)) {
        activateQuotaReadOnlyMode('saveCmsContentToFirestore');
        return;
      }
      console.warn('Ralat menyimpan tetapan CMS ke Firestore:', err);
      setSyncStatus('offline');
    }
  };

  const hasHydratedIndexedDBRef = React.useRef(false);

  // Hydrate full state from IndexedDB on initial mount (only if live Firestore listeners haven't already populated more complete data)
  useEffect(() => {
    getFullSiteContentAsync()
      .then((cached) => {
        hasHydratedIndexedDBRef.current = true;
        if (cached) {
          setSiteData((prev) => {
            const prevHasRealLeaders =
              Array.isArray(prev.leadership) &&
              (prev.leadership.length > DEFAULT_LEADERSHIP.length ||
                prev.leadership.some((l) => String(l.id).startsWith('ldr-')));
            const cachedHasRealLeaders =
              Array.isArray(cached.leadership) &&
              (cached.leadership.length > DEFAULT_LEADERSHIP.length ||
                cached.leadership.some((l: LeaderProfile) => String(l.id).startsWith('ldr-')));

            const resolvedLeadership = prevHasRealLeaders
              ? prev.leadership
              : cachedHasRealLeaders
                ? sanitizeLeadershipList(cached.leadership)
                : Array.isArray(cached.leadership) && cached.leadership.length > 0
                  ? sanitizeLeadershipList(cached.leadership)
                  : prev.leadership;

            const prevHasRealResources =
              Array.isArray(prev.resources) &&
              prev.resources.some((r) => String(r.id).startsWith('res-1'));
            const resolvedResources = prevHasRealResources
              ? prev.resources
              : Array.isArray(cached.resources) && cached.resources.length > 0
                ? cached.resources
                : prev.resources;

            const resolvedNews =
              prev.news && prev.news.length > 0
                ? mergeNewsPreservingMedia(
                    prev.news,
                    Array.isArray(cached.news) ? cached.news : [],
                    DEFAULT_NEWS
                  )
                : Array.isArray(cached.news) && cached.news.length > 0
                ? mergeNewsPreservingMedia(cached.news, prev.news, DEFAULT_NEWS)
                : prev.news;

            return {
              ...prev,
              branding: cached.branding || prev.branding,
              hero: cached.hero || prev.hero,
              visionMission: cached.visionMission || prev.visionMission,
              strategicFocus: Array.isArray(cached.strategicFocus) ? cached.strategicFocus : prev.strategicFocus,
              stats: cached.stats || prev.stats,
              memberSchools:
                prev.memberSchools && prev.memberSchools.length > 0
                  ? mergeSchoolsPreservingMedia(
                      prev.memberSchools,
                      Array.isArray(cached.memberSchools) ? sanitizeMemberSchoolsList(cached.memberSchools) : [],
                      Array.isArray(cached.memberApplications) ? cached.memberApplications : prev.memberApplications
                    )
                  : Array.isArray(cached.memberSchools) && cached.memberSchools.length > 0
                  ? mergeSchoolsPreservingMedia(
                      sanitizeMemberSchoolsList(cached.memberSchools),
                      prev.memberSchools,
                      Array.isArray(cached.memberApplications) ? cached.memberApplications : prev.memberApplications
                    )
                  : prev.memberSchools,
              news: sortNewsByPublishedDate(resolvedNews),
              programs: Array.isArray(cached.programs) ? cached.programs : prev.programs,
              practices: Array.isArray(cached.practices) ? cached.practices : prev.practices,
              leadership: resolvedLeadership,
              media: Array.isArray(cached.media) ? cached.media : prev.media,
              quote: cached.quote || prev.quote,
              resources: resolvedResources,
              cta: cached.cta || prev.cta,
              contactInfo: cached.contactInfo || prev.contactInfo,
              submissions: Array.isArray(cached.submissions) ? cached.submissions : prev.submissions,
              memberApplications: Array.isArray(cached.memberApplications)
                ? sanitizeMemberApplicationsList(cached.memberApplications)
                : prev.memberApplications,
              dashboardConfig: cached.dashboardConfig || prev.dashboardConfig,
              alumni: Array.isArray(cached.alumni) ? cached.alumni : prev.alumni,
              announcements:
                getCachedFirestoreCollection<AnnouncementItem[]>('announcements') ||
                (prev.announcements && prev.announcements.length > 0
                  ? prev.announcements
                  : Array.isArray(cached.announcements)
                  ? cached.announcements
                  : prev.announcements),
              examCalendar: Array.isArray(cached.examCalendar) ? cached.examCalendar : prev.examCalendar,
              birthdaySettings: cached.birthdaySettings
                ? { ...DEFAULT_BIRTHDAY_SETTINGS, ...cached.birthdaySettings }
                : prev.birthdaySettings || DEFAULT_BIRTHDAY_SETTINGS,
              programCertificateConfig: cached.programCertificateConfig
                ? { ...DEFAULT_PROGRAM_CERTIFICATE_CONFIG, ...cached.programCertificateConfig }
                : prev.programCertificateConfig || DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
            };
          });
        }
      })
      .catch((e) => {
        hasHydratedIndexedDBRef.current = true;
        console.warn('Hydration notice:', e);
      });
  }, []);

  // Listen for portal profile updates or external storage synchronization
  useEffect(() => {
    const handleContentUpdated = (evt?: Event) => {
      try {
        const customDetail = (evt as CustomEvent)?.detail;
        const saved = safeLocalStorageGet(STORAGE_KEYS.SITE_CONTENT);
        const parsed = saved ? JSON.parse(saved) : {};
        setSiteData((prev) => {
          let nextNews = prev.news;
          if (customDetail?.type === 'news' && customDetail?.newsItem) {
            const incoming: NewsItem = customDetail.newsItem;
            nextNews = sortNewsByPublishedDate([
              incoming,
              ...prev.news.filter((n) => n.id !== incoming.id),
            ]);
          } else if (customDetail?.id && customDetail?.updates) {
            nextNews = sortNewsByPublishedDate(
              prev.news.map((n) =>
                n.id === customDetail.id ? { ...n, ...customDetail.updates } : n
              )
            );
          } else if (Array.isArray(parsed.news) && parsed.news.length > 0) {
            nextNews = sortNewsByPublishedDate(
              mergeNewsPreservingMedia(prev.news, parsed.news, DEFAULT_NEWS)
            );
          }

          return {
            ...prev,
            news: nextNews,
            memberSchools: parsed.memberSchools && parsed.memberSchools.length > 0
              ? mergeSchoolsPreservingMedia(
                  sanitizeMemberSchoolsList(parsed.memberSchools),
                  prev.memberSchools,
                  prev.memberApplications
                )
              : prev.memberSchools,
            memberApplications: sanitizeMemberApplicationsList(
              parsed.memberApplications?.length ? parsed.memberApplications : prev.memberApplications
            ),
          };
        });
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
      const savedAdmin = safeLocalStorageGet(STORAGE_KEYS.ADMIN_SESSION);
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

  // Sync to IndexedDB + safe localStorage whenever siteData changes (after initial IndexedDB hydration)
  useEffect(() => {
    if (!hasHydratedIndexedDBRef.current) return;
    persistSiteContent(siteData).catch((err) => {
      console.warn('Ralat latar belakang ketika menyimpan tapak:', err);
    });
  }, [siteData]);

  // Sync eventRegistrations to localStorage whenever updated
  useEffect(() => {
    if (eventRegistrations.length > 0) {
      safeLocalStorageSet(STORAGE_KEYS.EVENT_REGISTRATIONS, JSON.stringify(eventRegistrations));
      cacheFirestoreCollection('eventRegistrations', eventRegistrations);
    }
  }, [eventRegistrations]);

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

          // Ensure admin record in Firestore exists once per browser session if not in read-only mode
          if (!isFirestoreQuotaExceeded()) {
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
            } catch (e: any) {
              if (isQuotaExceededError(e)) {
                activateQuotaReadOnlyMode('adminAuthSync');
              } else {
                console.warn('Admin record sync notice:', e);
              }
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Cloud Firestore Listeners with LocalStorage Caching & Quota Circuit Breaker
  useEffect(() => {
    if (isFirestoreQuotaExceeded()) {
      activateQuotaReadOnlyMode('initialMount');
      return;
    }

    const unsubscribes: (() => void)[] = [];
    let isCircuitBroken = false;

    const cleanupAllListeners = () => {
      while (unsubscribes.length > 0) {
        const unsub = unsubscribes.pop();
        try {
          if (unsub) unsub();
        } catch {}
      }
    };

    const handleListenerError = (label: string, err: any) => {
      if (isQuotaExceededError(err)) {
        if (!isCircuitBroken) {
          isCircuitBroken = true;
          cleanupAllListeners();
          activateQuotaReadOnlyMode(label);
        }
        return;
      }
      console.warn(`Firestore ${label} listener notice:`, err?.message || err);
      // Gracefully fall back to cached content without failing the UI
      setSiteData((prev) => buildStateFromLocalStorageCache(prev));
      setSyncStatus('offline');
      setError(null);
      setIsLoading(false);
    };

    // 0. Unified CMS Content listener (Hero, Vision/Mission, Strategic Focus, Stats, Quote, CTA, Branding, Contact, Dashboard)
    try {
      const unsubCmsContent = onSnapshot(
        doc(db, 'siteSettings', 'cmsContent'),
        (docSnap) => {
          if (docSnap.exists()) {
            const d = docSnap.data();
            cacheFirestoreCollection('cmsContent', d);
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
              // Do not overwrite leadership or resources from cmsContent because authoritative records live in collection(db, 'leadership') & collection(db, 'resources')
              leadership: prev.leadership?.length ? prev.leadership : DEFAULT_LEADERSHIP,
              resources: prev.resources?.length ? prev.resources : DEFAULT_RESOURCES,
              dashboardConfig: d.dashboardConfig ? { ...prev.dashboardConfig, ...d.dashboardConfig } : prev.dashboardConfig,
              birthdaySettings: d.birthdaySettings
                ? { ...DEFAULT_BIRTHDAY_SETTINGS, ...prev.birthdaySettings, ...d.birthdaySettings }
                : prev.birthdaySettings || DEFAULT_BIRTHDAY_SETTINGS,
              programCertificateConfig: d.programCertificateConfig
                ? { ...DEFAULT_PROGRAM_CERTIFICATE_CONFIG, ...prev.programCertificateConfig, ...d.programCertificateConfig }
                : prev.programCertificateConfig || DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
              membershipCertificateConfig: d.membershipCertificateConfig
                ? { ...DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG, ...prev.membershipCertificateConfig, ...d.membershipCertificateConfig }
                : prev.membershipCertificateConfig || DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG,
            }));
            clearFirestoreQuotaBreaker();
            setIsReadOnlyMode(false);
            setIsFirebaseConnected(true);
            setSyncStatus('synced');
            setLastSyncedAt(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }));
          }
          setIsLoading(false);
        },
        (err) => handleListenerError('CMS Content', err)
      );
      unsubscribes.push(unsubCmsContent);
    } catch (e) {
      console.warn('CMS Content listener setup error:', e);
    }

    // 0a. Dedicated Program Certificate Config listener (includes Chairman's Digital Signature)
    try {
      const unsubProgramCert = onSnapshot(
        doc(db, 'siteSettings', 'programCertificate'),
        (docSnap) => {
          if (docSnap.exists()) {
            const d = docSnap.data() as Partial<ProgramCertificateConfig>;
            setSiteData((prev) => ({
              ...prev,
              programCertificateConfig: {
                ...DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
                ...(prev.programCertificateConfig || {}),
                ...d,
              },
            }));
          }
        },
        (err) => handleListenerError('ProgramCertificateConfig', err)
      );
      unsubscribes.push(unsubProgramCert);
    } catch (e) {
      console.warn('ProgramCertificateConfig listener setup error:', e);
    }

    // 0a2. Dedicated Official School Membership Certificate Config listener
    try {
      const unsubMembershipCert = onSnapshot(
        doc(db, 'siteSettings', 'membershipCertificate'),
        (docSnap) => {
          if (docSnap.exists()) {
            const d = docSnap.data() as Partial<MembershipCertificateConfig>;
            setSiteData((prev) => ({
              ...prev,
              membershipCertificateConfig: {
                ...DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG,
                ...(prev.membershipCertificateConfig || {}),
                ...d,
              },
            }));
          }
        },
        (err) => handleListenerError('MembershipCertificateConfig', err)
      );
      unsubscribes.push(unsubMembershipCert);
    } catch (e) {
      console.warn('MembershipCertificateConfig listener setup error:', e);
    }

    // 0b. Leadership listener (Authoritative Barisan Kepimpinan Tertinggi MPGBSIM collection)
    try {
      const unsubLeadership = onSnapshot(
        collection(db, 'leadership'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: LeaderProfile[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            const sanitized = sanitizeLeadershipList(list);
            cacheFirestoreCollection('leadership', sanitized);
            setSiteData((prev) => ({
              ...prev,
              leadership: sanitized,
            }));
            clearFirestoreQuotaBreaker();
            setIsReadOnlyMode(false);
            setIsFirebaseConnected(true);
            setSyncStatus('synced');
          }
          setIsLoading(false);
        },
        (err) => handleListenerError('Leadership', err)
      );
      unsubscribes.push(unsubLeadership);
    } catch (e) {
      console.warn('Leadership listener setup:', e);
    }

    // 0c. Resources listener (Authoritative Dokumen & Sumber Rasmi MPGBSIM collection)
    try {
      const unsubResources = onSnapshot(
        collection(db, 'resources'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ResourceDocument[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            cacheFirestoreCollection('resources', list);
            setSiteData((prev) => ({
              ...prev,
              resources: list,
            }));
          }
          setIsLoading(false);
        },
        (err) => handleListenerError('Resources', err)
      );
      unsubscribes.push(unsubResources);
    } catch (e) {
      console.warn('Resources listener setup:', e);
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
          const sortedNews = list.length > 0 ? sortNewsByPublishedDate(list) : [];
          setSiteData((prev) => {
            if (sortedNews.length > 0) {
              const enrichedNews = sortNewsByPublishedDate(
                mergeNewsPreservingMedia(sortedNews, prev.news, DEFAULT_NEWS)
              );
              cacheFirestoreCollection('news', enrichedNews);
              return { ...prev, news: enrichedNews };
            }
            if (isMockCleared) {
              return { ...prev, news: [] };
            }
            return { ...prev, news: prev.news?.length ? prev.news : DEFAULT_NEWS };
          });
          setIsLoading(false);
        },
        (err) => handleListenerError('News', err)
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
          if (list.length > 0) {
            cacheFirestoreCollection('events', list);
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
        (err) => handleListenerError('Events', err)
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
          if (list.length > 0) {
            cacheFirestoreCollection('eventRegistrations', list);
            safeLocalStorageSet(STORAGE_KEYS.EVENT_REGISTRATIONS, JSON.stringify(list));
          }
          setEventRegistrations((prev) => (list.length > 0 ? list : prev));
          setIsLoading(false);
        },
        (err) => handleListenerError('eventRegistrations', err)
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
          if (list.length > 0) {
            cacheFirestoreCollection('bestPractices', list);
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
        (err) => handleListenerError('Practices', err)
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
              const d = docSnap.data() as any;
              // Auto-heal Sekolah Rendah Islam I Musleh joinYear in Firestore if it was overwritten with 2026
              if (
                (docSnap.id === 'sch-musleh-1' || d?.code === 'MJAC011') &&
                (!d?.joinYear || Number(d.joinYear) === 2026)
              ) {
                d.joinYear = 2011;
                if (!isFirestoreQuotaExceeded()) {
                  setDoc(doc(db, 'schools', docSnap.id), { joinYear: 2011 }, { merge: true }).catch(() => {});
                }
              }
              rawList.push({ id: docSnap.id, ...d });
            });
          }
          const sanitizedSchools = rawList.length > 0 ? sanitizeMemberSchoolsList(rawList) : [];
          if (sanitizedSchools.length > 0) {
            cacheFirestoreCollection('schools', sanitizedSchools);
          }
          setSiteData((prev) => {
            if (sanitizedSchools.length > 0) {
              const enrichedSchools = mergeSchoolsPreservingMedia(
                sanitizedSchools,
                prev.memberSchools,
                prev.memberApplications,
                prev.submissions
              );
              return { ...prev, memberSchools: enrichedSchools };
            }
            if (isMockCleared) {
              return { ...prev, memberSchools: [] };
            }
            return { ...prev, memberSchools: prev.memberSchools?.length ? prev.memberSchools : DEFAULT_MEMBER_SCHOOLS };
          });
          setIsReadOnlyMode(false);
          setIsFirebaseConnected(true);
          setSyncStatus('synced');
          setIsLoading(false);
        },
        (err) => handleListenerError('Schools', err)
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
          if (list.length > 0) {
            cacheFirestoreCollection('media', list);
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
        (err) => handleListenerError('Media', err)
      );
      unsubscribes.push(unsubMedia);
    } catch (e) {
      console.warn('Media listener setup:', e);
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
          if (list.length > 0) {
            cacheFirestoreCollection('alumni', list);
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
        (err) => handleListenerError('Alumni', err)
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
          if (list.length > 0) {
            cacheFirestoreCollection('announcements', list);
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
        (err) => handleListenerError('Announcements', err)
      );
      unsubscribes.push(unsubAnnouncements);
    } catch (e) {
      console.warn('Announcements listener setup:', e);
    }

    // 6e. Exam Calendar listener
    try {
      const unsubExams = onSnapshot(
        collection(db, 'examCalendar'),
        (snapshot) => {
          const list: ExamCalendarItem[] = [];
          if (!snapshot.empty) {
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          }
          if (list.length > 0) {
            cacheFirestoreCollection('examCalendar', list);
          }
          setSiteData((prev) => {
            if (list.length > 0) {
              return { ...prev, examCalendar: list };
            }
            return {
              ...prev,
              examCalendar: prev.examCalendar?.length ? prev.examCalendar : DEFAULT_EXAM_CALENDAR,
            };
          });
          setIsLoading(false);
        },
        (err) => handleListenerError('ExamCalendar', err)
      );
      unsubscribes.push(unsubExams);
    } catch (e) {
      console.warn('Exam calendar listener setup:', e);
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
          if (list.length > 0) {
            cacheFirestoreCollection('submissions', list);
          }
          setSiteData((prev) => {
            const nextSubs = list.length > 0 ? list : prev.submissions;
            const enrichedSchools = mergeSchoolsPreservingMedia(
              prev.memberSchools,
              prev.memberSchools,
              prev.memberApplications,
              nextSubs
            );
            return {
              ...prev,
              submissions: nextSubs,
              memberSchools: enrichedSchools,
            };
          });
          setIsLoading(false);
        },
        (err) => handleListenerError('Submissions', err)
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
                (d.schoolCode === 'MJAC011' && d.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my')
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
          const sanitizedApps = sanitizeMemberApplicationsList(list);
          if (sanitizedApps.length > 0) {
            cacheFirestoreCollection('memberApplications', sanitizedApps);
          }
          setSiteData((prev) => {
            const nextApps = sanitizedApps.length > 0 ? sanitizedApps : prev.memberApplications;
            const enrichedSchools = mergeSchoolsPreservingMedia(
              prev.memberSchools,
              prev.memberSchools,
              nextApps,
              prev.submissions
            );
            return {
              ...prev,
              memberApplications: nextApps,
              memberSchools: enrichedSchools,
            };
          });
          setIsLoading(false);
        },
        (err) => handleListenerError('MemberApplications', err)
      );
      unsubscribes.push(unsubApplications);
    } catch (e) {
      console.warn('MemberApplications listener setup:', e);
    }

    return () => {
      cleanupAllListeners();
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
    await persistSiteContent(siteData).catch(() => {});
    cacheFirestoreCollection('leadership', siteData.leadership);
    cacheFirestoreCollection('resources', siteData.resources);
    cacheFirestoreCollection('cmsContent', {
      branding: siteData.branding,
      hero: siteData.hero,
      visionMission: siteData.visionMission,
      strategicFocus: siteData.strategicFocus,
      stats: siteData.stats,
      quote: siteData.quote,
      cta: siteData.cta,
      contactInfo: siteData.contactInfo,
      dashboardConfig: siteData.dashboardConfig,
      birthdaySettings: siteData.birthdaySettings,
    });
    cacheFirestoreCollection('news', siteData.news);
    cacheFirestoreCollection('events', siteData.programs);
    cacheFirestoreCollection('bestPractices', siteData.practices);
    cacheFirestoreCollection('schools', siteData.memberSchools);
    cacheFirestoreCollection('media', siteData.media);
    cacheFirestoreCollection('alumni', siteData.alumni || []);
    cacheFirestoreCollection('announcements', siteData.announcements || []);
    cacheFirestoreCollection('examCalendar', siteData.examCalendar || []);

    if (isFirestoreQuotaExceeded()) {
      activateQuotaReadOnlyMode('syncAllToFirestore');
      return {
        success: true,
        message:
          'Mod Baca Sahaja (Kuota Harian Firestore Penuh): Semua kandungan telah disimpan dengan selamat ke dalam cache tempatan (localStorage & IndexedDB) dan akan disegerakkan ke awan selepas kuota direset.',
      };
    }

    setSyncStatus('syncing');
    try {
      await ensureFirebaseAuth();

      let count = 0;

      // 1. Sync Central CMS Content Document (without heavy base64 arrays that exceed 1MB doc limit)
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
          dashboardConfig: siteData.dashboardConfig,
          birthdaySettings: siteData.birthdaySettings || DEFAULT_BIRTHDAY_SETTINGS,
          programCertificateConfig: siteData.programCertificateConfig || DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
          membershipCertificateConfig: siteData.membershipCertificateConfig || DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      count++;

      if (siteData.programCertificateConfig) {
        await setDoc(
          doc(db, 'siteSettings', 'programCertificate'),
          {
            ...siteData.programCertificateConfig,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      if (siteData.membershipCertificateConfig) {
        await setDoc(
          doc(db, 'siteSettings', 'membershipCertificate'),
          {
            ...siteData.membershipCertificateConfig,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      // 1b. Sync Individual Leadership Documents to collection(db, 'leadership')
      for (const leader of siteData.leadership) {
        await setDoc(
          doc(db, 'leadership', leader.id),
          {
            ...leader,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }

      // 2. Sync News (never overwrite Firestore imageUrl with empty string from stripped cache)
      for (const item of siteData.news) {
        const safeNewsPayload: Record<string, any> = {
          ...item,
          status: item.status || 'published',
          updatedAt: new Date().toISOString(),
        };
        if (!safeNewsPayload.imageUrl) {
          delete safeNewsPayload.imageUrl;
        }
        await setDoc(doc(db, 'news', item.id), safeNewsPayload, { merge: true });
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

      // 5. Sync Schools (never overwrite Firestore photos with empty strings from stripped cache)
      for (const item of siteData.memberSchools) {
        const safeSchoolPayload: Record<string, any> = {
          ...item,
          updatedAt: new Date().toISOString(),
        };
        if (!safeSchoolPayload.schoolPhotoUrl) delete safeSchoolPayload.schoolPhotoUrl;
        if (!safeSchoolPayload.logoUrl) delete safeSchoolPayload.logoUrl;
        if (!safeSchoolPayload.principalPhotoUrl) delete safeSchoolPayload.principalPhotoUrl;

        await setDoc(
          doc(db, 'schools', item.id),
          safeSchoolPayload,
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

      // 7b. Sync Exam Calendar
      for (const item of siteData.examCalendar || []) {
        await setDoc(
          doc(db, 'examCalendar', item.id),
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

      setIsReadOnlyMode(false);
      setIsFirebaseConnected(true);
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }));

      return {
        success: true,
        message: `Penyelarasan berjaya: Semua ${count} bahagian kandungan telah dimuat naik ke Cloud Firestore! Kini terselaras pada semua peranti (PC & Android).`,
      };
    } catch (err: any) {
      if (isQuotaExceededError(err)) {
        activateQuotaReadOnlyMode('syncAllToFirestore');
        return {
          success: true,
          message:
            'Mod Baca Sahaja (Kuota Harian Firestore Penuh): Kandungan dipaparkan dan disimpan melalui cache tempatan (localStorage) sehingga kuota harian direset.',
        };
      }
      setSyncStatus('offline');
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
    setSiteData((prev) => {
      const nextNews = sortNewsByPublishedDate([item, ...prev.news.filter((n) => n.id !== item.id)]);
      const nextState = { ...prev, news: nextNews };
      cacheFirestoreCollection('news', nextNews);
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });
    try {
      await setDoc(
        doc(db, 'news', item.id),
        {
          ...item,
          status: item.status || 'published',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore write news notice:', e);
    }
  };

  const updateNews = async (id: string, updated: Partial<NewsItem>) => {
    let fullMergedItem: NewsItem | null = null;
    setSiteData((prev) => {
      const nextNews = sortNewsByPublishedDate(
        prev.news.map((item) => {
          if (item.id === id) {
            fullMergedItem = { ...item, ...updated };
            return fullMergedItem;
          }
          return item;
        })
      );
      const nextState = { ...prev, news: nextNews };
      cacheFirestoreCollection('news', nextNews);
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });
    try {
      await setDoc(
        doc(db, 'news', id),
        {
          ...(fullMergedItem || updated),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
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

    try {
      const notifId = `notif-prog-${item.id}`;
      const progNotif = {
        id: notifId,
        userId: 'all',
        title: `Program Baharu: ${item.title}`,
        message: item.description || `Program baharu MPGBSIM telah dibuka untuk pendaftaran (${item.date || 'Sila semak takwim'}).`,
        type: 'program',
        date: new Date().toISOString(),
        read: false,
        linkTab: 'program',
      };
      await setDoc(doc(db, 'notifications', notifId), progNotif, { merge: true });
    } catch (e) {
      console.warn('Firestore program notification notice:', e);
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
      eventVenue: targetEvent?.venue || participantData.eventVenue || '',
      eventMode: targetEvent?.mode || participantData.eventMode || 'Fizikal',
      schoolId: participantData.schoolId || '',
      schoolCode: participantData.schoolCode || '',
      icNumber: participantData.icNumber || '',
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

    // 4. Record audit log for PGB activity score
    try {
      const nowAudit = new Date();
      const auditDocId = `log-reg-${registrationId}`;
      setDoc(
        doc(db, 'auditLogs', auditDocId),
        {
          id: auditDocId,
          user: newRegistration.participantName,
          email: newRegistration.participantEmail,
          action: 'Pendaftaran Program MPGBSIM',
          content: `Peserta/PGB ${newRegistration.participantName} (${newRegistration.schoolName}) mendaftar untuk penyertaan program: "${eventTitle}".`,
          timestamp: nowAudit.toLocaleString('ms-MY', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          isoTimestamp: nowAudit.toISOString(),
          schoolName: newRegistration.schoolName,
          state: newRegistration.state || 'Malaysia',
          position: newRegistration.position || 'Pengetua / Guru Besar',
          category: 'PROGRAM_AMALAN',
        },
        { merge: true }
      ).catch(() => {});
    } catch (e) {}

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

  // Program Certificate & Attendance Management
  const updateProgramCertificateConfig = async (
    data: Partial<ProgramCertificateConfig>
  ): Promise<void> => {
    let safeSigUrl = data.chairmanSignatureImageUrl;
    if (safeSigUrl && safeSigUrl.startsWith('data:') && safeSigUrl.length > 150000) {
      safeSigUrl = await compressDataUrl(safeSigUrl, 600, 260, 0.85);
    }

    const nextConfig: ProgramCertificateConfig = {
      ...(siteData.programCertificateConfig || DEFAULT_PROGRAM_CERTIFICATE_CONFIG),
      ...data,
      ...(safeSigUrl !== undefined ? { chairmanSignatureImageUrl: safeSigUrl } : {}),
      updatedAt: new Date().toISOString(),
    };

    setSiteData((prev) => {
      const nextState = {
        ...prev,
        programCertificateConfig: nextConfig,
      };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });

    await saveCmsContentToFirestore({ programCertificateConfig: nextConfig });
    try {
      await ensureFirebaseAuth().catch(() => null);
      await setDoc(
        doc(db, 'siteSettings', 'programCertificate'),
        nextConfig,
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore updateProgramCertificateConfig notice:', e);
    }

    try {
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch {}
  };

  const updateMembershipCertificateConfig = async (
    data: Partial<MembershipCertificateConfig>
  ): Promise<void> => {
    const nowIso = new Date().toISOString();
    let nextConfig: MembershipCertificateConfig = {
      ...DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG,
      ...(siteData.membershipCertificateConfig || {}),
      ...data,
      updatedAt: nowIso,
    };

    setSiteData((prev) => {
      nextConfig = {
        ...DEFAULT_MEMBERSHIP_CERTIFICATE_CONFIG,
        ...(prev.membershipCertificateConfig || {}),
        ...data,
        updatedAt: nowIso,
      };
      const nextState = {
        ...prev,
        membershipCertificateConfig: nextConfig,
      };
      persistSiteContent(nextState).catch(() => {});
      return nextState;
    });

    await saveCmsContentToFirestore({ membershipCertificateConfig: nextConfig });

    try {
      await ensureFirebaseAuth().catch(() => null);
      await setDoc(
        doc(db, 'siteSettings', 'membershipCertificate'),
        nextConfig,
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore updateMembershipCertificateConfig notice:', e);
    }

    try {
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    } catch {}
  };

  const cleanPrincipalNameFromSchool = (school: MemberSchool): string => {
    const raw = (school.principal || 'Pengetua / Guru Besar').trim();
    return raw.replace(/\s*\((Pengetua|Guru Besar|Mudir)\)\s*$/i, '').trim() || raw;
  };

  const findExistingSchoolRegistration = (
    regs: EventRegistration[],
    eventId: string,
    school: MemberSchool
  ): EventRegistration | undefined => {
    const normCode = (school.code || '').trim().toUpperCase();
    const normName = (school.name || '').trim().toLowerCase();
    const normPgbEmail = (school.pgbEmail || school.email || '').trim().toLowerCase();

    return regs.find((r) => {
      if (r.eventId !== eventId) return false;
      if (r.schoolId && school.id && r.schoolId === school.id) return true;
      if (normCode && r.schoolCode && r.schoolCode.trim().toUpperCase() === normCode) return true;
      if (normName && r.schoolName && r.schoolName.trim().toLowerCase() === normName) return true;
      if (normPgbEmail && r.participantEmail && r.participantEmail.trim().toLowerCase() === normPgbEmail) return true;
      return false;
    });
  };

  const buildCertificateNo = (eventId: string, codeOrRegId: string): string => {
    const cleanCode = (codeOrRegId || 'PGB').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 10) || 'PGB';
    const cleanEvt = (eventId || 'PROG').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(-4) || '2026';
    return `MPGBSIM/SIJIL/2026/${cleanEvt}/${cleanCode}`;
  };

  const recordPgbProgramAttendance = async (
    eventId: string,
    school: MemberSchool,
    attended: boolean,
    autoIssueCert = false
  ): Promise<void> => {
    const targetEvent = siteData.programs?.find((p) => p.id === eventId);
    const eventTitle = targetEvent?.title || 'Program Rasmi MPGBSIM';
    const eventDate = targetEvent?.date || new Date().toISOString().split('T')[0];
    const eventVenue = targetEvent?.venue || 'Kompleks Pendidikan Islam';
    const eventMode = targetEvent?.mode || 'Fizikal';
    const nowIso = new Date().toISOString();

    const pgbName = cleanPrincipalNameFromSchool(school);
    const pgbPosition =
      school.designation ||
      (school.type?.toLowerCase().includes('rendah') ? 'Guru Besar' : 'Pengetua');
    const pgbEmail = (school.pgbEmail || school.email || `${(school.code || 'ahli').toLowerCase()}@mpgbsim.org`).trim().toLowerCase();
    const pgbPhone = (school.pgbPhone || school.phone || '').trim();

    const existing = findExistingSchoolRegistration(eventRegistrations, eventId, school);

    if (existing) {
      const certNo =
        existing.certificateNo ||
        buildCertificateNo(eventId, school.code || existing.attendanceCode || existing.id);
      const nextCertIssued = attended
        ? autoIssueCert
          ? true
          : Boolean(existing.certificateIssued)
        : false;

      const updatedReg: EventRegistration = {
        ...existing,
        eventTitle,
        eventDate,
        eventVenue,
        eventMode,
        schoolId: school.id,
        schoolCode: school.code,
        icNumber: school.icNumber || existing.icNumber || '',
        participantName: pgbName || existing.participantName,
        participantEmail: pgbEmail || existing.participantEmail,
        participantPhone: pgbPhone || existing.participantPhone,
        schoolName: school.name || existing.schoolName,
        position: pgbPosition || existing.position,
        state: school.state || existing.state,
        status: attended ? 'attended' : 'confirmed',
        attendedAt: attended ? existing.attendedAt || nowIso : undefined,
        certificateIssued: nextCertIssued,
        certificateNo: nextCertIssued ? certNo : existing.certificateNo,
        certificateIssuedAt: nextCertIssued ? existing.certificateIssuedAt || nowIso : undefined,
        updatedAt: nowIso,
      };

      setEventRegistrations((prev) =>
        prev.map((r) => (r.id === existing.id ? updatedReg : r))
      );

      try {
        await ensureFirebaseAuth().catch(() => null);
        await setDoc(doc(db, 'eventRegistrations', existing.id), sanitizeForFirestore(updatedReg), {
          merge: true,
        });
      } catch (e) {
        console.warn('Firestore recordPgbProgramAttendance update notice:', e);
      }
      return;
    }

    if (!attended) {
      return;
    }

    const safeCodeSlug = (school.code || school.id || `${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
    const regId = `reg-${eventId}-${safeCodeSlug}`;
    const attCode = `MPGB-${(school.code || 'PGB').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(-6)}`;
    const certNo = buildCertificateNo(eventId, school.code || attCode);

    const newReg: EventRegistration = {
      id: regId,
      eventId,
      eventTitle,
      eventDate,
      eventVenue,
      eventMode,
      schoolId: school.id,
      schoolCode: school.code,
      icNumber: school.icNumber || '',
      participantName: pgbName,
      participantEmail: pgbEmail,
      participantPhone: pgbPhone,
      schoolName: school.name,
      position: pgbPosition,
      state: school.state || 'Malaysia',
      registeredAt: nowIso,
      attendedAt: nowIso,
      status: 'attended',
      attendanceCode: attCode,
      certificateIssued: autoIssueCert,
      certificateNo: certNo,
      certificateIssuedAt: autoIssueCert ? nowIso : undefined,
      notes: 'Rekod kehadiran disahkan oleh Pentadbir CMS MPGBSIM',
      updatedAt: nowIso,
    };

    setEventRegistrations((prev) => [newReg, ...prev.filter((r) => r.id !== regId)]);

    if (targetEvent) {
      const nextFilled = (targetEvent.spotsFilled || 0) + 1;
      setSiteData((prev) => ({
        ...prev,
        programs: (prev.programs || []).map((p) =>
          p.id === eventId ? { ...p, spotsFilled: nextFilled } : p
        ),
      }));
      setDoc(
        doc(db, 'events', eventId),
        { spotsFilled: nextFilled, updatedAt: nowIso },
        { merge: true }
      ).catch(() => {});
    }

    try {
      await ensureFirebaseAuth().catch(() => null);
      await setDoc(doc(db, 'eventRegistrations', regId), sanitizeForFirestore(newReg), {
        merge: true,
      });
    } catch (e) {
      console.warn('Firestore recordPgbProgramAttendance create notice:', e);
    }
  };

  const bulkRecordPgbProgramAttendance = async (
    eventId: string,
    schools: MemberSchool[],
    attended: boolean,
    autoIssueCert = false
  ): Promise<void> => {
    for (const school of schools) {
      await recordPgbProgramAttendance(eventId, school, attended, autoIssueCert);
    }
  };

  const toggleProgramCertificateIssued = async (
    regId: string,
    issued: boolean,
    certificateTitleOverride?: string
  ): Promise<void> => {
    const existing = eventRegistrations.find((r) => r.id === regId);
    if (!existing) return;

    const nowIso = new Date().toISOString();
    const certNo =
      existing.certificateNo ||
      buildCertificateNo(
        existing.eventId,
        existing.schoolCode || existing.attendanceCode || existing.id
      );

    const updatedReg: EventRegistration = {
      ...existing,
      status: issued ? 'attended' : existing.status,
      attendedAt: issued ? existing.attendedAt || nowIso : existing.attendedAt,
      certificateIssued: issued,
      certificateNo: certNo,
      certificateIssuedAt: issued ? nowIso : undefined,
      ...(certificateTitleOverride !== undefined
        ? { certificateTitleOverride }
        : {}),
      updatedAt: nowIso,
    };

    setEventRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? updatedReg : r))
    );

    try {
      await ensureFirebaseAuth().catch(() => null);
      await setDoc(doc(db, 'eventRegistrations', regId), sanitizeForFirestore(updatedReg), {
        merge: true,
      });

      if (issued) {
        const notifId = `notif-cert-${regId}`;
        await setDoc(
          doc(db, 'notifications', notifId),
          {
            id: notifId,
            userId: existing.schoolCode || existing.participantEmail || 'all',
            title: `Sijil Penyertaan Dikeluarkan: ${existing.eventTitle}`,
            message: `Tahniah ${existing.participantName}! Sijil Penyertaan Program bagi "${existing.eventTitle}" telah dikeluarkan dan sedia dimuat turun dalam Portal PGB anda.`,
            type: 'program',
            date: nowIso,
            read: false,
            linkTab: 'program',
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('Firestore toggleProgramCertificateIssued notice:', e);
    }
  };

  const bulkIssueProgramCertificates = async (
    eventId: string,
    certificateTitleOverride?: string
  ): Promise<number> => {
    const targetRegs = eventRegistrations.filter(
      (r) => r.eventId === eventId && r.status === 'attended'
    );
    if (targetRegs.length === 0) return 0;

    const nowIso = new Date().toISOString();
    const updatedMap = new Map<string, EventRegistration>();

    for (const reg of targetRegs) {
      const certNo =
        reg.certificateNo ||
        buildCertificateNo(
          reg.eventId,
          reg.schoolCode || reg.attendanceCode || reg.id
        );
      updatedMap.set(reg.id, {
        ...reg,
        certificateIssued: true,
        certificateNo: certNo,
        certificateIssuedAt: reg.certificateIssuedAt || nowIso,
        ...(certificateTitleOverride !== undefined
          ? { certificateTitleOverride }
          : {}),
        updatedAt: nowIso,
      });
    }

    setEventRegistrations((prev) =>
      prev.map((r) => updatedMap.get(r.id) || r)
    );

    try {
      await ensureFirebaseAuth().catch(() => null);
      for (const updatedReg of updatedMap.values()) {
        await setDoc(
          doc(db, 'eventRegistrations', updatedReg.id),
          sanitizeForFirestore(updatedReg),
          { merge: true }
        );
      }

      const targetEvent = siteData.programs?.find((p) => p.id === eventId);
      const notifId = `notif-cert-bulk-${eventId}`;
      await setDoc(
        doc(db, 'notifications', notifId),
        {
          id: notifId,
          userId: 'all',
          title: `Sijil Penyertaan Dikeluarkan: ${targetEvent?.title || 'Program MPGBSIM'}`,
          message: `Sijil Penyertaan Program bagi "${targetEvent?.title || 'Program MPGBSIM'}" telah dikeluarkan oleh Urus Setia bagi semua PGB yang hadir. Sila muat turun di menu Program Portal PGB.`,
          type: 'program',
          date: nowIso,
          read: false,
          linkTab: 'program',
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore bulkIssueProgramCertificates notice:', e);
    }

    return updatedMap.size;
  };

  const updateEventRegistrationDetails = async (
    regId: string,
    patch: Partial<EventRegistration>
  ): Promise<void> => {
    const nowIso = new Date().toISOString();
    let merged: EventRegistration | null = null;
    setEventRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === regId) {
          merged = { ...r, ...patch, updatedAt: nowIso };
          return merged;
        }
        return r;
      })
    );
    if (merged) {
      try {
        await ensureFirebaseAuth().catch(() => null);
        await setDoc(
          doc(db, 'eventRegistrations', regId),
          sanitizeForFirestore(merged),
          { merge: true }
        );
      } catch (e) {
        console.warn('Firestore updateEventRegistrationDetails notice:', e);
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

    // Resolve phone & email updates explicitly - NEVER equate personal phone with office phone
    const resolvedPgbPhone =
      updated.pgbPhone !== undefined ? updated.pgbPhone.trim() : undefined;

    const resolvedSchoolPhone =
      updated.schoolPhone !== undefined
        ? updated.schoolPhone.trim()
        : updated.phone !== undefined
        ? updated.phone.trim()
        : undefined;

    const resolvedPgbEmail =
      updated.pgbEmail !== undefined ? updated.pgbEmail.trim() : undefined;

    const resolvedSchoolEmail =
      updated.schoolEmail !== undefined
        ? updated.schoolEmail.trim()
        : updated.email !== undefined
        ? updated.email.trim()
        : undefined;

    const safeUpdated: Partial<MemberSchool> = {
      ...updated,
      ...(resolvedPgbPhone !== undefined ? { pgbPhone: resolvedPgbPhone } : {}),
      ...(resolvedSchoolPhone !== undefined
        ? { schoolPhone: resolvedSchoolPhone, phone: resolvedSchoolPhone }
        : {}),
      ...(resolvedPgbEmail !== undefined ? { pgbEmail: resolvedPgbEmail } : {}),
      ...(resolvedSchoolEmail !== undefined
        ? { schoolEmail: resolvedSchoolEmail, email: resolvedSchoolEmail }
        : {}),
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
          (id === 'sch-musleh-1' && (s.code === 'MJAC011' || s.id === 'sch-musleh-1')) ||
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
              (safeUpdated.code && s.code && s.code.toLowerCase().trim() === safeUpdated.code.toLowerCase().trim()) ||
              (id === 'sch-musleh-1' && (s.code === 'MJAC011' || s.id === 'sch-musleh-1')) ||
              (safeUpdated.name && s.name && s.name.toLowerCase().trim() === safeUpdated.name.toLowerCase().trim());
            return isMatch ? { ...s, ...safeUpdated, updatedAt: new Date().toISOString() } : s;
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
        const matchPrimaryMusleh =
          (id === 'sch-musleh-1' || safeUpdated.code === 'MJAC011') &&
          (portalUser.email === 'abdulqayyumyaakop@imuslehmelaka.edu.my' ||
            portalUser.email?.includes('imuslehmelaka') ||
            portalUser.membershipNo?.includes('MJAC011') ||
            (portalUser.school?.toLowerCase().includes('musleh') && (portalUser.school?.toLowerCase().includes('rendah') || portalUser.school?.toLowerCase().includes('sri'))));

        const matchSecondaryMusleh =
          (id === 'school-musleh-menengah-1' || id === 'sch-musleh-menengah-1' || id === 'school-1792309529681-bv4d' || safeUpdated.code === 'JAIM/SAS(M)130' || safeUpdated.code === 'MIA1009') &&
          (portalUser.email === 'smimmelaka@gmail.com' ||
            portalUser.membershipNo?.includes('JAIM/SAS') ||
            portalUser.membershipNo?.includes('MIA1009') ||
            (portalUser.school?.toLowerCase().includes('musleh') && (portalUser.school?.toLowerCase().includes('menengah') || portalUser.school?.toLowerCase().includes('sma'))));

        const matchId =
          (portalUser.schoolId && portalUser.schoolId === id) ||
          portalUser.uid === `sch-user-${id}` ||
          portalUser.uid === id;
        const matchCode =
          (portalUser.schoolCode && safeUpdated.code && portalUser.schoolCode.toUpperCase() === safeUpdated.code.toUpperCase()) ||
          (portalUser.membershipNo && safeUpdated.code && portalUser.membershipNo.toUpperCase().includes(safeUpdated.code.toUpperCase())) ||
          (portalUser.membershipNo && updatedSchoolObj && (updatedSchoolObj as MemberSchool).code && portalUser.membershipNo.toUpperCase().includes((updatedSchoolObj as MemberSchool).code!.toUpperCase()));
        const matchSchoolName =
          (portalUser.school && safeUpdated.name && portalUser.school.toLowerCase().trim() === safeUpdated.name.toLowerCase().trim()) ||
          (portalUser.school && updatedSchoolObj && (updatedSchoolObj as MemberSchool).name && portalUser.school.toLowerCase().trim() === (updatedSchoolObj as MemberSchool).name.toLowerCase().trim());
        const matchPgbEmail =
          (portalUser.pgbEmail && safeUpdated.pgbEmail && portalUser.pgbEmail.toLowerCase().trim() === safeUpdated.pgbEmail.toLowerCase().trim()) ||
          (portalUser.pgbEmail && updatedSchoolObj && (updatedSchoolObj as MemberSchool).pgbEmail && portalUser.pgbEmail.toLowerCase().trim() === (updatedSchoolObj as MemberSchool).pgbEmail?.toLowerCase().trim());

        if (matchPrimaryMusleh || matchSecondaryMusleh || matchId || matchCode || matchSchoolName || matchPgbEmail) {
          if (safeUpdated.principal) {
            portalUser.fullName = safeUpdated.principal;
          }
          if (safeUpdated.name) {
            portalUser.school = safeUpdated.name;
          }
          if (safeUpdated.state) {
            portalUser.state = safeUpdated.state;
          }
          if (resolvedPgbPhone !== undefined) {
            portalUser.phone = resolvedPgbPhone;
            portalUser.pgbPhone = resolvedPgbPhone;
          }
          if (resolvedSchoolPhone !== undefined) {
            portalUser.schoolPhone = resolvedSchoolPhone;
          }
          if (resolvedPgbEmail !== undefined) {
            portalUser.email = resolvedPgbEmail;
            portalUser.pgbEmail = resolvedPgbEmail;
          }
          if (resolvedSchoolEmail !== undefined) {
            portalUser.schoolEmail = resolvedSchoolEmail;
          }
          if (safeUpdated.principalPhotoUrl) {
            portalUser.photoURL = safeUpdated.principalPhotoUrl;
          }
          if (safeUpdated.schoolPhotoUrl) {
            portalUser.schoolPhotoUrl = safeUpdated.schoolPhotoUrl;
          }
          if (safeUpdated.logoUrl) {
            portalUser.logoUrl = safeUpdated.logoUrl;
          }
          if (safeUpdated.joinYear) {
            portalUser.joinYear = Number(safeUpdated.joinYear);
          }
          if (safeUpdated.serviceStartYear) {
            portalUser.serviceStartYear = safeUpdated.serviceStartYear;
            portalUser.pgbStartYear = safeUpdated.serviceStartYear;
          }
          if (safeUpdated.icNumber) {
            portalUser.icNumber = safeUpdated.icNumber;
          }
          if (safeUpdated.membershipType) {
            portalUser.membershipType = safeUpdated.membershipType;
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
        updated: safeUpdated,
        school: updatedSchoolObj || safeUpdated,
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

    // 2. Persist ONLY genuinely modified schools to Firestore (avoid writing all 150 schools and never overwrite photos with empty strings)
    const prevSchoolMap = new Map((siteData.memberSchools || []).map((s) => [s.id, s]));
    repairedSchools.forEach((sch) => {
      const prev = prevSchoolMap.get(sch.id);
      const isModified = !prev || JSON.stringify(prev) !== JSON.stringify(sch);
      if (isModified) {
        const safePayload: Record<string, any> = { ...sch };
        if (!safePayload.schoolPhotoUrl) delete safePayload.schoolPhotoUrl;
        if (!safePayload.logoUrl) delete safePayload.logoUrl;
        if (!safePayload.principalPhotoUrl) delete safePayload.principalPhotoUrl;
        setDoc(doc(db, 'schools', sch.id), safePayload, { merge: true }).catch(() => {});
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
      membershipType: app.membershipType || (app.schoolType === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa'),
      state: app.state,
      district: app.district,
      principal: `${app.fullName} (${app.designation})`,
      designation: app.designation,
      icNumber: app.icNumber || '',
      principalPhotoUrl: app.pgbPhotoUrl || '',
      studentCount: Number(app.studentCount) || 0,
      teacherCount: Number(app.teacherCount) || 0,
      joinYear: app.joinYear || app.schoolJoinYear || new Date().getFullYear(),
      serviceStartYear: app.serviceStartYear,
      pgbStartYear: app.serviceStartYear,
      website: app.website || '',
      logoUrl: app.logoUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
      schoolPhotoUrl: app.schoolPhotoUrl || '',
      phone: app.schoolPhone || '',
      schoolPhone: app.schoolPhone || '',
      email: app.schoolEmail || '',
      schoolEmail: app.schoolEmail || '',
      pgbPhone: app.pgbPhone || app.phoneNumber || '',
      pgbEmail: app.pgbEmail || app.email || '',
      address: app.address || `${app.district}, ${app.state}`,
    };

    // Add to member schools (both in state and Firestore)
    await addMemberSchool(newSchool);

    // 2. Mark application as approved
    const approvedAt = new Date().toISOString();
    const approvedBy = adminUser?.email || 'admin@mpgbsim.org';

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

    if (data.showAnnouncement || data.announcementTitle || data.adminMemo) {
      try {
        const notifId = 'notif-admin-memo';
        const notif = {
          id: notifId,
          userId: 'all',
          title: `Hebahan Pentadbir: ${data.announcementTitle || updated.announcementTitle || 'Pemberitahuan Pimpinan'}`,
          message:
            data.announcementText ||
            data.adminMemo ||
            updated.announcementText ||
            updated.adminMemo ||
            'Pemberitahuan rasmi pimpinan kebangsaan MPGBSIM.',
          type: 'info',
          date: new Date().toISOString(),
          read: false,
          linkTab: 'dashboard',
        };
        await setDoc(doc(db, 'notifications', notifId), notif, { merge: true });
      } catch (e) {}
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
      subject: `Pendaftaran Alumni PGB: ${newRecord.fullName} (${newRecord.lastSchool || 'Pesara PGB'} - ${newRecord.state || ''})`,
      category: 'Alumni',
      message: `Pendaftaran Direktori Alumni MPGBSIM baru diterima. Nama: ${newRecord.fullName}, Gelaran: ${newRecord.title || '-'}, Sekolah Terakhir: ${newRecord.lastSchool || '-'}, Negeri Sekolah Berkhidmat: ${newRecord.state || '-'}, Tahun Bersara: ${newRecord.retirementYear || '-'}, Emel: ${newRecord.email}, Telefon: ${newRecord.phone || '-'}. Status Semasa: SUBMITTED (Perlu Pengesahan Urus Setia).`,
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

  // Exam Calendar CRUD Implementations
  const addExamItem = async (
    item: Omit<ExamCalendarItem, 'id' | 'createdAt' | 'updatedAt'> | ExamCalendarItem
  ): Promise<string> => {
    const timeSuffix = Date.now().toString(36).toLowerCase();
    const id = (item as ExamCalendarItem).id || `exam-${item.category?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'general'}-${timeSuffix}`;
    const now = new Date().toISOString();
    const newRecord: ExamCalendarItem = {
      ...item,
      id,
      category: item.category || 'Umum',
      academicYear: item.academicYear || 2026,
      startDate: item.startDate || new Date().toISOString().split('T')[0],
      endDate: item.endDate || item.startDate || new Date().toISOString().split('T')[0],
      status: item.status || 'published',
      isPublished: item.isPublished !== undefined ? item.isPublished : item.status !== 'draft',
      createdAt: (item as ExamCalendarItem).createdAt || now,
      updatedAt: now,
      createdBy: (item as ExamCalendarItem).createdBy || adminUser?.name || 'Pentadbir Peperiksaan MPGBSIM',
    };

    setSiteData((prev) => {
      const updated = [...(prev.examCalendar || []), newRecord];
      updated.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      cacheFirestoreCollection('examCalendar', updated);
      return { ...prev, examCalendar: updated };
    });

    try {
      if (!isFirestoreQuotaExceeded()) {
        await ensureFirebaseAuth().catch(() => null);
        await setDoc(doc(db, 'examCalendar', id), newRecord, { merge: true });
      }
    } catch (e: any) {
      if (isQuotaExceededError(e)) {
        activateQuotaReadOnlyMode('addExamItem');
      } else {
        console.warn('Firestore addExamItem notice:', e);
      }
    }

    try {
      window.dispatchEvent(new Event('mpgbsim_exam_updated'));
    } catch (e) {}

    return id;
  };

  const updateExamItem = async (
    id: string,
    item: Partial<ExamCalendarItem>
  ): Promise<void> => {
    const now = new Date().toISOString();
    const patch = { ...item, updatedAt: now, updatedBy: adminUser?.name || 'Pentadbir Peperiksaan MPGBSIM' };

    setSiteData((prev) => {
      const updated = (prev.examCalendar || []).map((e) => (e.id === id ? { ...e, ...patch } : e));
      updated.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      cacheFirestoreCollection('examCalendar', updated);
      return { ...prev, examCalendar: updated };
    });

    try {
      if (!isFirestoreQuotaExceeded()) {
        await ensureFirebaseAuth().catch(() => null);
        await updateDoc(doc(db, 'examCalendar', id), patch);
      }
    } catch (e: any) {
      if (isQuotaExceededError(e)) {
        activateQuotaReadOnlyMode('updateExamItem');
      } else {
        console.warn('Firestore updateExamItem notice:', e);
      }
    }

    try {
      window.dispatchEvent(new Event('mpgbsim_exam_updated'));
    } catch (e) {}
  };

  const deleteExamItem = async (id: string): Promise<void> => {
    setSiteData((prev) => {
      const updated = (prev.examCalendar || []).filter((e) => e.id !== id);
      cacheFirestoreCollection('examCalendar', updated);
      return { ...prev, examCalendar: updated };
    });

    try {
      if (!isFirestoreQuotaExceeded()) {
        await ensureFirebaseAuth().catch(() => null);
        await deleteDoc(doc(db, 'examCalendar', id));
      }
    } catch (e: any) {
      if (isQuotaExceededError(e)) {
        activateQuotaReadOnlyMode('deleteExamItem');
      } else {
        console.warn('Firestore deleteExamItem notice:', e);
      }
    }

    try {
      window.dispatchEvent(new Event('mpgbsim_exam_updated'));
    } catch (e) {}
  };

  const resetExamCalendarToDefault = async (): Promise<void> => {
    setSiteData((prev) => {
      cacheFirestoreCollection('examCalendar', DEFAULT_EXAM_CALENDAR);
      return { ...prev, examCalendar: DEFAULT_EXAM_CALENDAR };
    });

    try {
      if (!isFirestoreQuotaExceeded()) {
        await ensureFirebaseAuth().catch(() => null);
        for (const item of DEFAULT_EXAM_CALENDAR) {
          await setDoc(doc(db, 'examCalendar', item.id), item, { merge: true });
        }
      }
    } catch (e: any) {
      if (isQuotaExceededError(e)) {
        activateQuotaReadOnlyMode('resetExamCalendarToDefault');
      } else {
        console.warn('Firestore resetExamCalendarToDefault notice:', e);
      }
    }

    try {
      window.dispatchEvent(new Event('mpgbsim_exam_updated'));
    } catch (e) {}
  };

  const updateBirthdaySettings = async (data: Partial<BirthdaySettingsConfig>): Promise<void> => {
    let nextSettings: BirthdaySettingsConfig = DEFAULT_BIRTHDAY_SETTINGS;
    setSiteData((prev) => {
      nextSettings = {
        ...(prev.birthdaySettings || DEFAULT_BIRTHDAY_SETTINGS),
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        birthdaySettings: nextSettings,
      };
    });
    await saveCmsContentToFirestore({ birthdaySettings: nextSettings });
    try {
      window.dispatchEvent(new Event('mpgbsim_birthday_updated'));
    } catch {}
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
      birthdaySettings: DEFAULT_BIRTHDAY_SETTINGS,
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
        isReadOnlyMode,
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
        updateBirthdaySettings,
        updateContactInfo,
        addSubmission,
        updateSubmissionStatus,
        deleteSubmission,
        eventRegistrations,
        registerForEvent,
        updateEventRegistrationStatus,
        deleteEventRegistration,
        updateProgramCertificateConfig,
        updateMembershipCertificateConfig,
        recordPgbProgramAttendance,
        bulkRecordPgbProgramAttendance,
        toggleProgramCertificateIssued,
        bulkIssueProgramCertificates,
        updateEventRegistrationDetails,
        addAlumniRecord,
        updateAlumniRecord,
        deleteAlumniRecord,
        approveAlumniRecord,
        rejectAlumniRecord,
        toggleFeatureAlumniRecord,
        addExamItem,
        updateExamItem,
        deleteExamItem,
        resetExamCalendarToDefault,
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
