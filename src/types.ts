export type UserRole = 'PUBLIC' | 'MEMBER' | 'MEDIA_AJK' | 'ADMIN';

export type AlumniVerificationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface LeadershipHistoryRecord {
  id?: string;
  schoolName: string;
  position: 'Pengetua' | 'Guru Besar' | 'Penolong Kanan' | 'Pengarah' | string;
  startYear: number;
  endYear: number;
  state?: string;
  district?: string;
  highlights?: string;
}

export interface AlumniConsent {
  allowPublicDisplay: boolean;
  allowSchoolHistory: boolean;
  allowExpertise: boolean;
  allowQuote: boolean;
  allowContact: boolean;
}

export interface AlumniRecord {
  id: string;
  fullName: string;
  title?: string; // Tan Sri, Datuk, Dr., Ustaz, Hj, Hjh, Cikgu
  photo?: string;
  gender: 'Lelaki' | 'Perempuan';
  email: string;
  phone: string;
  state: string;
  lastPosition: string;
  lastSchool: string;
  careerStartYear: number;
  retirementYear: number;
  leadershipHistory: LeadershipHistoryRecord[];
  expertise: string[];
  biography?: string;
  currentOrganisation?: string;
  awards?: string[];
  achievements?: string[];
  projects?: string[];
  innovations?: string[];
  contributions?: string;
  mpgbsimRole?: string;
  mpgbsimStartYear?: number;
  mpgbsimEndYear?: number;
  mpgbsimContribution?: string;
  legacyQuote: string;
  consent: AlumniConsent;
  verificationStatus: AlumniVerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  featured?: boolean;
  archived?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  position?: string;
  icNumber?: string;
  school?: string;
  schoolCode?: string;
  schoolType?: string;
  state?: string;
  district?: string;
  address?: string;
  phone?: string;
  pgbEmail?: string;
  pgbPhone?: string;
  schoolEmail?: string;
  schoolPhone?: string;
  studentCount?: number;
  teacherCount?: number;
  website?: string;
  photoURL?: string;
  schoolPhotoUrl?: string;
  logoUrl?: string;
  expertise?: string[];
  interests?: string[];
  membershipNo?: string;
  joinYear?: number;
  serviceStartYear?: number;
  pgbStartYear?: number;
  status: 'active' | 'pending' | 'inactive';
  hidePhone?: boolean;
  portalPassword?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: 'Kenyataan Media' | 'Pendidikan' | 'Pengurusan' | 'Aktiviti' | 'Kejayaan Sekolah' | string;
  date: string;
  author: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  status?: 'published' | 'draft' | 'scheduled';
  scheduleDate?: string;
  schoolName?: string;
  schoolCode?: string;
  state?: string;
  submittedBy?: string;
  isSchoolAchievement?: boolean;
  achievementLevel?: 'Antarabangsa' | 'Kebangsaan' | 'Negeri' | 'Daerah' | 'Sekolah' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StrategicFocus {
  id: number;
  code: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  initiatives: string[];
  kpi: string;
  status: 'Sedang Berjalan' | 'Perancangan 2026' | 'Fokus Utama';
}

export interface BestPracticeItem {
  id: string;
  title: string;
  schoolName?: string;
  school?: string;
  state?: string;
  category: 'Kepimpinan' | 'Kurikulum' | 'HEM' | 'Kokurikulum' | 'Tarbiah' | 'AI' | 'Digital' | 'HR' | 'Kewangan' | 'Pengurusan' | 'Inovasi' | string;
  impactSummary?: string;
  description?: string;
  keyOutcomes?: string[];
  leadPerson?: string;
  author?: string;
  authorId?: string;
  year?: string;
  badge?: string;
  challenge?: string;
  approach?: string;
  implementation?: string;
  outcome?: string;
  lessonLearned?: string;
  images?: string[];
  supportingDocs?: string;
  driveUrl?: string;
  documentUrl?: string;
  status?: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Published' | 'Rejected' | 'published' | 'draft';
  rejectionReason?: string;
  submittedDate?: string;
}

export interface ProgramEvent {
  id: string;
  title: string;
  theme?: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  venue: string;
  mode: 'Fizikal' | 'Dalam Talian' | 'Hibrid';
  targetAudience?: string;
  description: string;
  spotsTotal?: number;
  spotsFilled?: number;
  registrationOpen?: boolean;
  closingDate?: string;
  fees?: string;
  posterUrl?: string;
  organiser?: string;
  registrationLink?: string;
  status?: 'Upcoming' | 'Ongoing' | 'Completed' | 'upcoming' | 'past' | 'cancelled';
  registeredUserIds?: string[];
  order?: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  participantName: string;
  participantEmail: string;
  participantPhone?: string;
  schoolName: string;
  position?: string;
  state?: string;
  registeredAt: string;
  status: 'confirmed' | 'attended' | 'cancelled';
  attendanceCode?: string;
  notes?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Rasmi' | 'Mesyuarat' | 'Program' | 'Kebajikan' | 'Peluang' | 'Penting';
  author: string;
  authorRole?: string;
  date: string;
  status: 'published' | 'draft' | 'archived';
  pinned?: boolean;
  imageUrl?: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface PortalDocument {
  id: string;
  title: string;
  description: string;
  category: 'Mesyuarat' | 'Pentadbiran' | 'Program' | 'Sumber PGB' | 'AI & Digital' | 'Modul' | 'Template' | 'Dokumen MPGBSIM';
  fileSize: string;
  version: string;
  uploadDate: string;
  uploader: string;
  visibility: 'PUBLIC' | 'MEMBER' | 'ADMIN';
  downloadUrl?: string;
  fileFormat?: string;
  downloads?: number;
}

export interface MemberSubmission {
  id: string;
  submitter: string;
  submitterId?: string;
  submitterEmail: string;
  school: string;
  type: 'Best Practice' | 'Cadangan program' | 'Cadangan penambahbaikan' | 'Kisah kejayaan' | 'Berita sekolah' | 'Sumber perkongsian';
  title: string;
  content: string;
  attachment?: string;
  attachmentName?: string;
  date: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Published';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PortalResource {
  id: string;
  title: string;
  type: 'artikel' | 'modul' | 'template' | 'video' | 'webinar' | 'presentation' | 'external';
  category: string;
  description: string;
  url?: string;
  author: string;
  date: string;
  fileSize?: string;
  tags?: string[];
}

export interface PortalNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'program' | 'dokumen' | 'pengumuman' | 'submission' | 'info';
  date: string;
  time?: string;
  read: boolean;
  linkTab?: string;
}

export interface AuditLogItem {
  id: string;
  user: string;
  email: string;
  action: string;
  content: string;
  timestamp: string;
}

export interface AIPromptItem {
  id: string;
  title: string;
  category: 'Kepimpinan' | 'Pentadbiran' | 'Kurikulum' | 'HEM' | 'Data & Analisis' | 'Tarbiah & Sahsiah';
  description: string;
  prompt: string;
  usageInstructions: string;
  tags: string[];
}

export interface AIToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  badge: string;
  bestFor: string;
}

export interface LeaderProfile {
  id: string;
  name: string;
  role: string;
  subRole?: string;
  institution: string;
  state: string;
  qualification?: string;
  avatarUrl: string;
  term?: string; // e.g. 'Penggal 2026–2028' | '2026–2028'
  category?: 'Kepimpinan Utama' | 'Exco Kebangsaan' | 'Pengerusi Biro' | string;
  order?: number;
}

export interface MemberSchool {
  id: string;
  name: string;
  code: string;
  type: 'Sekolah Rendah' | 'Sekolah Menengah' | 'Maahad Tahfiz' | 'Rakan Musleh' | string;
  state: string;
  district: string;
  principal: string;
  principalPhotoUrl?: string;
  studentCount: number;
  teacherCount?: number;
  joinYear: number;
  serviceStartYear?: number;
  pgbStartYear?: number;
  logoUrl?: string;
  schoolPhotoUrl?: string;
  website?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  pgbPhone?: string;
  pgbEmail?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'photo' | 'video';
  thumbnailUrl: string;
  url?: string;
  videoUrl?: string;
  date: string;
  location?: string;
  caption?: string;
  description?: string;
  category?: string;
  mediaType?: 'image' | 'video' | 'photo';
}

export type GalleryItem = MediaItem;

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
}

export interface MemberApplication {
  id: string;
  refId: string;
  fullName: string;
  icNumber: string;
  email: string; // Email Rasmi PGB
  phoneNumber: string; // No Telefon PGB
  pgbEmail?: string;
  pgbPhone?: string;
  schoolEmail?: string; // Email Rasmi Sekolah
  schoolPhone?: string; // No Telefon Sekolah
  designation: 'Pengetua' | 'Guru Besar' | 'Penolong Kanan Pentadbiran' | string;
  serviceStartYear: number;
  pgbStartYear?: number;
  joinYear?: number;
  schoolJoinYear?: number;
  schoolName: string;
  schoolCode: string;
  schoolType: string;
  state: string;
  district: string;
  website?: string;
  studentCount: number;
  teacherCount: number;
  logoUrl?: string;
  pgbPhotoUrl?: string;
  schoolPhotoUrl?: string;
  schoolDescription?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface SiteSettingsData {
  organisationName: string;
  shortName: string;
  motto: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  address: string;
  socialFacebook: string;
  socialYoutube: string;
  socialTelegram: string;
  socialInstagram?: string;
}

export interface ResourceDocument {
  id: string;
  title: string;
  category: 'Pekeliling' | 'Garis Panduan' | 'Modul Kepimpinan' | 'Kertas Dasar' | 'Mesyuarat' | 'Pentadbiran' | 'Program' | 'Sumber PGB' | 'AI & Digital' | 'Modul' | 'Template' | 'Dokumen MPGBSIM' | string;
  publishedDate: string;
  fileSize: string;
  fileFormat: string;
  downloads: number;
  description: string;
  driveUrl?: string;
  fileUrl?: string;
  downloadUrl?: string;
  uploader?: string;
  visibility?: 'PUBLIC' | 'MEMBER' | 'ADMIN';
  version?: string;
}

export interface NetworkStats {
  schoolsCount: number;
  statesCount: number;
  principalsCount: number;
  studentsBenefited: string;
  isPlaceholder: boolean;
}

export interface DashboardConfig {
  welcomeBadge: string;
  welcomeGreeting: string;
  welcomeDesc: string;
  backendStatusLabel: string;
  backendStatusValue: string;
  syncBtnLabel: string;
  showAnnouncement: boolean;
  announcementType: 'info' | 'warning' | 'success';
  announcementTitle: string;
  announcementText: string;
  cardNewsTitle: string;
  cardNewsSub: string;
  cardEventsTitle: string;
  cardEventsSub: string;
  cardPracticesTitle: string;
  cardPracticesSub: string;
  cardSchoolsTitle: string;
  cardSchoolsSub: string;
  cardActionText: string;
  membershipTitle: string;
  membershipDesc: string;
  membershipBtnText: string;
  membershipEmptyTitle: string;
  membershipEmptyDesc: string;
  submissionsTitle: string;
  submissionsDesc: string;
  submissionsEmptyDesc: string;
  adminMemo: string;
  adminMemoAuthor?: string;
  adminMemoDate?: string;
}
