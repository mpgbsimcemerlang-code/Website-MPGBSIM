import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Building2,
  MapPin,
  ShieldCheck,
  Award,
  FileText,
  CreditCard,
  LogIn,
  Sparkles,
  Eye,
  X,
  AlertCircle,
  BarChart3,
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Trash2,
  MessageSquare,
  Key,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { AuditLogItem, ActivityLogCategory, MemberSchool, UserProfile } from '../../types';
import { db, collection, getDocs, isFirestoreQuotaExceeded } from '../../firebase';
import { repairSchoolIntegrity } from '../../utils/schoolDiagnostic';

export interface ActivePortalUserSummary {
  key: string;
  rank: number;
  pgbName: string;
  position: string;
  email: string;
  phone: string;
  membershipNo: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  schoolType: string;
  state: string;
  joinYear: number;
  hasLoggedIn: boolean;
  isOnlineOrToday: boolean;
  isRecent7Days: boolean;
  lastLoginTimestamp: string;
  lastLoginIso: string;
  lastLoginMethod: string;
  lastActivityAction: string;
  lastActivityContent: string;
  lastActivityTimestamp: string;
  lastActivityIso: string;
  loginCount: number;
  certDownloadCount: number;
  profileUpdateCount: number;
  docDownloadCount: number;
  feeActivityCount: number;
  newsShareCount: number;
  bestPracticeCount: number;
  programRegCount: number;
  chatActivityCount: number;
  otherActivityCount: number;
  totalActivityCount: number;
  activityScore: number;
  activityTier: 'PENERAJU_AKTIF' | 'SANGAT_AKTIF' | 'AKTIF' | 'BELUM_LOG_MASUK';
  logs: AuditLogItem[];
}

const CATEGORY_META: Record<
  ActivityLogCategory,
  { label: string; badgeBg: string; badgeText: string; border: string }
> = {
  LOG_MASUK: {
    label: 'Log Masuk & Sesi',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  SIJIL_KAD: {
    label: 'Muat Turun Sijil & Kad',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    border: 'border-amber-200',
  },
  PROFIL: {
    label: 'Kemas Kini Profil',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-900',
    border: 'border-teal-200',
  },
  DOKUMEN: {
    label: 'Muat Turun Dokumen',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    border: 'border-blue-200',
  },
  YURAN: {
    label: 'Pembayaran Yuran',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    border: 'border-purple-200',
  },
  PROGRAM_AMALAN: {
    label: 'Program & Amalan Terbaik',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  KESELAMATAN: {
    label: 'Keselamatan Akaun',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    border: 'border-rose-200',
  },
  LAIN_LAIN: {
    label: 'Aktiviti Portal Lain',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    border: 'border-slate-200',
  },
};

function inferCategory(log: AuditLogItem): ActivityLogCategory {
  if (log.category && CATEGORY_META[log.category]) return log.category;
  const act = (log.action || '').toLowerCase();
  const cnt = (log.content || '').toLowerCase();
  if (act.includes('log masuk') || act.includes('log keluar') || act.includes('daftar masuk')) {
    return 'LOG_MASUK';
  }
  if (
    act.includes('sijil') ||
    act.includes('kad keahlian') ||
    act.includes('kad digital') ||
    cnt.includes('sijil perakuan')
  ) {
    return 'SIJIL_KAD';
  }
  if (act.includes('profil') || act.includes('rekod rasmi')) {
    return 'PROFIL';
  }
  if (act.includes('dokumen') || act.includes('muat naik') || act.includes('pekeliling')) {
    return 'DOKUMEN';
  }
  if (act.includes('yuran') || act.includes('herepay') || act.includes('resit')) {
    return 'YURAN';
  }
  if (act.includes('program') || act.includes('amalan') || act.includes('berita') || act.includes('submisi')) {
    return 'PROGRAM_AMALAN';
  }
  if (act.includes('kata laluan') || act.includes('keselamatan')) {
    return 'KESELAMATAN';
  }
  return 'LAIN_LAIN';
}

export function normalizeDirectorySchoolCode(raw?: string): string {
  const upper = (raw || '')
    .toUpperCase()
    .replace(/^MPGB-\d{4}-/i, '')
    .trim();
  if (upper === 'MIA1009' || upper.includes('JAIM/SAS')) {
    return 'JAIMSASM130';
  }
  return upper.replace(/[^A-Z0-9]/g, '').trim();
}

function cleanPersonNameForMatch(name?: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\b(pengetua|guru besar|ustaz|ustazah|haji|hajah|dr|dato|datuk|tuan|puan|cikgu|pgb)\b/gi, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseLogTimeMs(log: AuditLogItem): number {
  if (log.isoTimestamp) {
    const t = new Date(log.isoTimestamp).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (log.timestamp) {
    // Parse Malay format DD/MM/YYYY, HH:MM:SS PG/PTG
    const malayMatch = log.timestamp.match(
      /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(PG|PTG|AM|PM)?)?/i
    );
    if (malayMatch) {
      const day = parseInt(malayMatch[1], 10);
      const month = parseInt(malayMatch[2], 10) - 1;
      const year = parseInt(malayMatch[3], 10);
      let hour = malayMatch[4] ? parseInt(malayMatch[4], 10) : 8;
      const minute = malayMatch[5] ? parseInt(malayMatch[5], 10) : 0;
      const second = malayMatch[6] ? parseInt(malayMatch[6], 10) : 0;
      const meridiem = (malayMatch[7] || '').toUpperCase();
      if ((meridiem === 'PTG' || meridiem === 'PM') && hour < 12) hour += 12;
      if ((meridiem === 'PG' || meridiem === 'AM') && hour === 12) hour = 0;
      const constructed = new Date(year, month, day, hour, minute, second).getTime();
      if (!isNaN(constructed) && constructed > 0) return constructed;
    }

    const direct = new Date(log.timestamp).getTime();
    if (!isNaN(direct) && direct > 0) return direct;
  }
  return 0;
}

function formatRelativeTime(isoOrDateStr: string): string {
  if (!isoOrDateStr || isoOrDateStr === '-') return 'Tiada Rekod';
  const timeMs = new Date(isoOrDateStr).getTime();
  if (isNaN(timeMs) || timeMs <= 0) return 'Telah Log Masuk';
  const diffMs = Date.now() - timeMs;
  if (diffMs < 0) return 'Hari ini';
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 2) return 'Baru sahaja';
  if (diffMins < 60) return `${diffMins} minit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Semalam';
  if (diffDays <= 30) return `${diffDays} hari lalu`;
  return new Date(timeMs).toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const AdminActivePortalUsersDashboard: React.FC = () => {
  const { auditLogs, registeredSchools, currentUser, resetAllPgbActivityLogs, adminLoginAsSchoolWithoutPassword } = useMemberPortal();
  const { siteData, resetPgbPassword, setIsCMSOpen } = useAdminContent();

  const handleAdminLoginAsSchoolFromSummary = async (u: ActivePortalUserSummary) => {
    const targetSchool = directorySchools.find(
      (s) =>
        (u.schoolId && s.id === u.schoolId) ||
        (u.schoolCode && s.code && s.code.toUpperCase() === u.schoolCode.toUpperCase()) ||
        (u.schoolName && s.name && s.name.toLowerCase().trim() === u.schoolName.toLowerCase().trim())
    ) || ({
      id: u.schoolId || `sch-${u.schoolCode}`,
      name: u.schoolName,
      code: u.schoolCode,
      principal: u.pgbName,
      state: u.state,
      email: u.email !== '-' ? u.email : '',
      phone: u.phone !== '-' ? u.phone : '',
      type: u.schoolType as any,
    } as MemberSchool);

    try {
      if (setIsCMSOpen) {
        setIsCMSOpen(false);
      }
      await adminLoginAsSchoolWithoutPassword(targetSchool);
    } catch (err: any) {
      alert('Ralat log masuk portal: ' + (err?.message || 'Sila cuba lagi.'));
    }
  };

  const [remoteLogs, setRemoteLogs] = useState<AuditLogItem[]>([]);
  const [remoteProfiles, setRemoteProfiles] = useState<UserProfile[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [userToResetPass, setUserToResetPass] = useState<ActivePortalUserSummary | null>(null);
  const [isResettingUserPass, setIsResettingUserPass] = useState(false);
  const [userPassResetDone, setUserPassResetDone] = useState<{
    pgbName: string;
    schoolName: string;
    schoolCode: string;
    tempPassword: string;
  } | null>(null);
  const [copiedUserTempPass, setCopiedUserTempPass] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() =>
    new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Active sub-view tab
  const [activeView, setActiveView] = useState<'ranking' | 'users' | 'stream' | 'analytics'>('ranking');

  // Ranking controls
  const [rankingCriteria, setRankingCriteria] = useState<'OVERALL_SCORE' | 'MOST_LOGINS' | 'MOST_ACTIVITIES'>('OVERALL_SCORE');
  const [rankingScope, setRankingScope] = useState<'ACTIVE_ONLY' | 'ALL_53'>('ACTIVE_ONLY');

  // Filters for Users & Ranking view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE_LOGGED_IN' | 'RECENT_7D' | 'NEVER_LOGGED_IN'>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('SEMUA');
  const [sortBy, setSortBy] = useState<'RANK_SCORE' | 'RECENT_LOGIN' | 'MOST_LOGINS' | 'SCHOOL_NAME'>('RANK_SCORE');

  // Filters for Live Stream view
  const [streamCategoryFilter, setStreamCategoryFilter] = useState<'ALL' | ActivityLogCategory>('ALL');

  // Selected user for full modal history
  const [selectedUserDetail, setSelectedUserDetail] = useState<ActivePortalUserSummary | null>(null);

  // Fetch live auditLogs and memberProfiles from Firestore for accurate cross-device admin monitoring
  const fetchLivePortalActivity = async () => {
    setIsRefreshing(true);
    try {
      if (!isFirestoreQuotaExceeded()) {
        const [logsSnap, profilesSnap] = await Promise.all([
          getDocs(collection(db, 'auditLogs')).catch(() => null),
          getDocs(collection(db, 'memberProfiles')).catch(() => null),
        ]);

        if (logsSnap && !logsSnap.empty) {
          const fetchedLogs: AuditLogItem[] = [];
          logsSnap.forEach((d) => {
            const data = d.data() as AuditLogItem;
            if (data && data.action) {
              fetchedLogs.push({
                ...data,
                id: data.id || d.id,
                category: data.category || inferCategory(data),
              });
            }
          });
          setRemoteLogs(fetchedLogs);
        }

        if (profilesSnap && !profilesSnap.empty) {
          const fetchedProfiles: UserProfile[] = [];
          profilesSnap.forEach((d) => {
            const data = d.data() as UserProfile;
            if (data && (data.school || data.email || data.fullName)) {
              fetchedProfiles.push({
                ...data,
                uid: data.uid || d.id,
              });
            }
          });
          setRemoteProfiles(fetchedProfiles);
        }
      }
      setLastRefreshedAt(
        new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (e) {
      console.warn('Admin live portal activity fetch fallback:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLivePortalActivity();
  }, []);

  // Official Registered Member Schools (Strictly synced & deduplicated with Direktori Ahli = 53 schools)
  const directorySchools = useMemo<MemberSchool[]>(() => {
    const rawSource =
      registeredSchools && registeredSchools.length > 0
        ? registeredSchools
        : siteData.memberSchools || [];
    try {
      const { repairedSchools } = repairSchoolIntegrity(rawSource, currentUser);
      return repairedSchools;
    } catch {
      return rawSource;
    }
  }, [registeredSchools, siteData.memberSchools, currentUser]);

  // Merge local + remote audit logs and filter out non-directory mock/admin-only noise
  const allMergedLogs = useMemo(() => {
    const map = new Map<string, AuditLogItem>();
    const addClean = (l: AuditLogItem) => {
      if (!l || !l.action) return;
      const codeUpper = (l.schoolCode || '').toUpperCase().trim();
      const schoolLower = (l.schoolName || '').toLowerCase().trim();
      // Exclude legacy non-directory mock schools (like MPGB-0042 As-Syakirin or HQ-001 Admin)
      if (
        codeUpper === 'MPGB-0042' ||
        codeUpper === 'HQ-001' ||
        codeUpper === 'HQ' ||
        codeUpper === 'ADMIN-HQ' ||
        schoolLower.includes('as-syakirin') ||
        schoolLower.includes('ibu pejabat sekretariat')
      ) {
        return;
      }
      const normalizedLog: AuditLogItem =
        codeUpper === 'MIA1009'
          ? {
              ...l,
              schoolCode: 'JAIM/SAS(M)130',
              membershipNo: 'MPGB-2026-JAIM/SAS(M)130',
              category: inferCategory(l),
            }
          : { ...l, category: inferCategory(l) };
      map.set(normalizedLog.id, normalizedLog);
    };

    (auditLogs || []).forEach(addClean);
    (remoteLogs || []).forEach(addClean);

    return Array.from(map.values()).sort((a, b) => {
      const tA = parseLogTimeMs(a);
      const tB = parseLogTimeMs(b);
      if (tA && tB) return tB - tA;
      return b.id.localeCompare(a.id);
    });
  }, [auditLogs, remoteLogs]);

  // Build strict per-school / per-PGB summaries strictly for the 53 registered directory schools
  const { userSummaries, matchedSchoolLogs } = useMemo(() => {
    const summaryMap = new Map<string, ActivePortalUserSummary>();
    const nowMs = Date.now();

    // 1. Seed ONLY from the 53 official registered schools in Direktori Ahli
    directorySchools.forEach((sch: MemberSchool) => {
      const cleanCode = normalizeDirectorySchoolCode(sch.code) || sch.id;
      const isMenengah =
        (sch.type || '').toLowerCase().includes('menengah') ||
        (sch.name || '').toLowerCase().includes('menengah') ||
        (sch.name || '').toLowerCase().includes('sm ') ||
        (sch.name || '').toLowerCase().includes('maahad');
      const defaultPos = sch.designation || (isMenengah ? 'Pengetua' : 'Guru Besar');

      summaryMap.set(cleanCode, {
        key: cleanCode,
        rank: 0,
        pgbName: sch.principal || `${defaultPos} ${sch.name}`,
        position: defaultPos,
        email: sch.pgbEmail || sch.email || '-',
        phone: sch.pgbPhone || sch.phone || '-',
        membershipNo: sch.code ? `MPGB-2026-${sch.code}` : `MPGB-2026-${sch.id.slice(-6).toUpperCase()}`,
        schoolId: sch.id,
        schoolName: sch.name,
        schoolCode: sch.code || '-',
        schoolType: sch.type || (isMenengah ? 'Sekolah Menengah' : 'Sekolah Rendah'),
        state: sch.state || 'Malaysia',
        joinYear: sch.joinYear ? Number(sch.joinYear) : 2020,
        hasLoggedIn: false,
        isOnlineOrToday: false,
        isRecent7Days: false,
        lastLoginTimestamp: '-',
        lastLoginIso: '',
        lastLoginMethod: '-',
        lastActivityAction: 'Tiada aktiviti direkodkan',
        lastActivityContent: '-',
        lastActivityTimestamp: '-',
        lastActivityIso: '',
        loginCount: 0,
        certDownloadCount: 0,
        profileUpdateCount: 0,
        docDownloadCount: 0,
        feeActivityCount: 0,
        newsShareCount: 0,
        bestPracticeCount: 0,
        programRegCount: 0,
        chatActivityCount: 0,
        otherActivityCount: 0,
        totalActivityCount: 0,
        activityScore: 0,
        activityTier: 'BELUM_LOG_MASUK',
        logs: [],
      });
    });

    // 2. Enrich metadata from remoteProfiles (Firestore memberProfiles) ONLY for matching directory schools
    remoteProfiles.forEach((prof) => {
      const codeFromMem = prof.membershipNo ? prof.membershipNo.replace(/^MPGB-\d{4}-/i, '') : '';
      const rawCode = prof.schoolCode || codeFromMem;
      const cleanCode = normalizeDirectorySchoolCode(rawCode);

      let matchedEntry: ActivePortalUserSummary | undefined = cleanCode
        ? summaryMap.get(cleanCode)
        : undefined;

      if (!matchedEntry && prof.school) {
        const targetSchoolName = prof.school.toLowerCase().trim();
        for (const entry of summaryMap.values()) {
          if (entry.schoolName.toLowerCase().trim() === targetSchoolName) {
            matchedEntry = entry;
            break;
          }
        }
      }

      if (matchedEntry) {
        if (prof.fullName) matchedEntry.pgbName = prof.fullName;
        if (prof.position) matchedEntry.position = prof.position;
        if (prof.email && prof.email !== 'mpgbsim.cemerlang@gmail.com') matchedEntry.email = prof.email;
        if (prof.phone) matchedEntry.phone = prof.phone;
        if (prof.membershipNo) matchedEntry.membershipNo = prof.membershipNo;
        if (prof.joinYear) matchedEntry.joinYear = Number(prof.joinYear);
      }
    });

    // 3. Match auditLogs strictly to one of the 53 registered directory schools
    const validLogs: AuditLogItem[] = [];

    allMergedLogs.forEach((log) => {
      const logCodeRaw =
        log.schoolCode ||
        (log.membershipNo ? log.membershipNo.replace(/^MPGB-\d{4}-/i, '') : '');
      const cleanCode = normalizeDirectorySchoolCode(logCodeRaw);

      let entry: ActivePortalUserSummary | undefined = cleanCode
        ? summaryMap.get(cleanCode)
        : undefined;

      if (!entry) {
        const logSchoolLower = (log.schoolName || '').toLowerCase().trim();
        const logEmailLower = (log.email || '').toLowerCase().trim();
        const cleanLogUser = cleanPersonNameForMatch(log.user);

        for (const item of summaryMap.values()) {
          const itemSchoolLower = item.schoolName.toLowerCase().trim();
          const itemEmailLower = item.email.toLowerCase().trim();
          const cleanItemPgb = cleanPersonNameForMatch(item.pgbName);

          const isExactSchoolMatch =
            Boolean(logSchoolLower && logSchoolLower.length >= 8 && itemSchoolLower === logSchoolLower) ||
            Boolean(
              logSchoolLower.includes('rendah islam i musleh') &&
                item.schoolCode.toUpperCase() === 'MJAC011'
            ) ||
            Boolean(
              logSchoolLower.includes('menengah agama i-musleh') &&
                item.schoolCode.toUpperCase().includes('JAIM/SAS')
            );

          const isExactEmailMatch = Boolean(
            logEmailLower &&
              logEmailLower !== '-' &&
              logEmailLower !== 'mpgbsim.cemerlang@gmail.com' &&
              logEmailLower !== 'ahli@mpgbsim.org' &&
              itemEmailLower === logEmailLower
          );

          const isExactPersonMatch = Boolean(
            cleanLogUser.length >= 8 &&
              cleanItemPgb.length >= 8 &&
              (cleanItemPgb === cleanLogUser ||
                cleanItemPgb.includes(cleanLogUser) ||
                cleanLogUser.includes(cleanItemPgb))
          );

          if (isExactSchoolMatch || isExactEmailMatch || isExactPersonMatch) {
            entry = item;
            break;
          }
        }
      }

      // IMPORTANT: Never create phantom non-directory entries outside the 53 registered schools!
      if (!entry) return;

      validLogs.push(log);

      if (log.user && cleanPersonNameForMatch(log.user).length >= 5) {
        if (
          entry.pgbName.startsWith('Pengetua ') ||
          entry.pgbName.startsWith('Guru Besar ') ||
          entry.pgbName === 'Pengetua / Guru Besar'
        ) {
          entry.pgbName = log.user;
        }
      }

      const cat = inferCategory(log);
      const logTimeMs = parseLogTimeMs(log);

      entry.logs.push(log);
      entry.totalActivityCount += 1;
      entry.hasLoggedIn = true;

      if (logTimeMs > 0) {
        const diffHours = (nowMs - logTimeMs) / (1000 * 60 * 60);
        if (diffHours >= -1 && diffHours <= 24) entry.isOnlineOrToday = true;
        if (diffHours >= -1 && diffHours <= 24 * 7) entry.isRecent7Days = true;
      }

      // Track latest overall activity
      const curLastActMs = entry.lastActivityIso ? new Date(entry.lastActivityIso).getTime() : 0;
      if (
        !entry.lastActivityTimestamp ||
        entry.lastActivityTimestamp === '-' ||
        (logTimeMs > 0 && logTimeMs >= curLastActMs)
      ) {
        entry.lastActivityAction = log.action;
        entry.lastActivityContent = log.content;
        entry.lastActivityTimestamp = log.timestamp;
        if (logTimeMs > 0) {
          entry.lastActivityIso = new Date(logTimeMs).toISOString();
        }
      }

      // Category-specific counters
      if (cat === 'LOG_MASUK') {
        entry.loginCount += 1;
        const curLastLoginMs = entry.lastLoginIso ? new Date(entry.lastLoginIso).getTime() : 0;
        if (
          !entry.lastLoginTimestamp ||
          entry.lastLoginTimestamp === '-' ||
          (logTimeMs > 0 && logTimeMs >= curLastLoginMs)
        ) {
          entry.lastLoginTimestamp = log.timestamp;
          if (logTimeMs > 0) {
            entry.lastLoginIso = new Date(logTimeMs).toISOString();
          }
          if (
            (log.action || '').toLowerCase().includes('google') ||
            (log.content || '').toLowerCase().includes('google')
          ) {
            entry.lastLoginMethod = 'Google OAuth';
          } else {
            entry.lastLoginMethod = 'Kod Sekolah / Emel';
          }
        }
      } else if (cat === 'SIJIL_KAD') {
        entry.certDownloadCount += 1;
      } else if (cat === 'PROFIL') {
        entry.profileUpdateCount += 1;
      } else if (cat === 'DOKUMEN') {
        entry.docDownloadCount += 1;
      } else if (cat === 'YURAN') {
        entry.feeActivityCount += 1;
      } else {
        const actLower = (log.action || '').toLowerCase();
        const cntLower = (log.content || '').toLowerCase();
        if (
          actLower.includes('berita') ||
          actLower.includes('kejayaan') ||
          cntLower.includes('berita kejayaan') ||
          cntLower.includes('menerbitkan berita')
        ) {
          entry.newsShareCount += 1;
        } else if (
          actLower.includes('amalan') ||
          actLower.includes('submisi bahan') ||
          cntLower.includes('amalan terbaik')
        ) {
          entry.bestPracticeCount += 1;
        } else if (
          actLower.includes('program') ||
          cntLower.includes('mendaftar untuk program') ||
          cntLower.includes('pendaftaran program')
        ) {
          entry.programRegCount += 1;
        } else if (
          actLower.includes('sembang') ||
          actLower.includes('chat') ||
          cntLower.includes('ruang sembang') ||
          cntLower.includes('saluran sembang')
        ) {
          entry.chatActivityCount += 1;
        } else {
          entry.otherActivityCount += 1;
        }
      }
    });

    // If currently logged-in user in this browser belongs to one of the 53 directory schools, ensure their active session is reflected
    // NOTE: Only reflect if validLogs has entries so that when admin resets all logs, all 54 PGB points evaluate strictly to 0!
    if (currentUser && currentUser.role !== 'ADMIN' && validLogs.length > 0) {
      const curCode = normalizeDirectorySchoolCode(
        currentUser.schoolCode ||
          (currentUser.membershipNo ? currentUser.membershipNo.replace(/^MPGB-\d{4}-/i, '') : '')
      );
      const curEntry = curCode ? summaryMap.get(curCode) : undefined;
      if (curEntry) {
        curEntry.hasLoggedIn = true;
        curEntry.isOnlineOrToday = true;
        curEntry.isRecent7Days = true;
        if (curEntry.loginCount === 0) curEntry.loginCount = 1;
        if (curEntry.totalActivityCount === 0) curEntry.totalActivityCount = 1;
        if (curEntry.lastLoginTimestamp === '-') {
          curEntry.lastLoginTimestamp = 'Sesi Semasa Aktif';
          curEntry.lastLoginIso = new Date().toISOString();
          curEntry.lastLoginMethod = 'Sesi Semasa';
        }
      }
    }

    // Finalize loginCount & compute Activity Score + Tier for every school
    for (const item of summaryMap.values()) {
      if (item.hasLoggedIn) {
        if (item.loginCount === 0) item.loginCount = 1;
        if (item.lastLoginTimestamp === '-' && item.lastActivityTimestamp !== '-') {
          item.lastLoginTimestamp = item.lastActivityTimestamp;
          item.lastLoginIso = item.lastActivityIso;
          item.lastLoginMethod = 'Sesi Portal Aktif';
        }
        // Weighted Activity Score for Ranking:
        // Log Masuk = 5 pts, Kemas Kini Profil = 10 pts, Muat Turun Sijil/Kad = 10 pts, Yuran = 10 pts, Dokumen = 8 pts,
        // Kongsi Kejayaan Sekolah / Berita = 25 pts, Submisi Amalan Terbaik = 20 pts, Pendaftaran Program = 15 pts, Aktif Ruang Sembang = 5 pts, Lain = 5 pts
        item.activityScore =
          item.loginCount * 5 +
          item.profileUpdateCount * 10 +
          item.certDownloadCount * 10 +
          item.feeActivityCount * 10 +
          item.docDownloadCount * 8 +
          item.newsShareCount * 25 +
          item.bestPracticeCount * 20 +
          item.programRegCount * 15 +
          item.chatActivityCount * 5 +
          item.otherActivityCount * 5;

        if (item.totalActivityCount >= 5 || item.activityScore >= 30) {
          item.activityTier = 'PENERAJU_AKTIF';
        } else if (item.totalActivityCount >= 2 || item.activityScore >= 15) {
          item.activityTier = 'SANGAT_AKTIF';
        } else {
          item.activityTier = 'AKTIF';
        }
      } else {
        item.activityScore = 0;
        item.activityTier = 'BELUM_LOG_MASUK';
      }
    }

    // Sort to assign official Ranking (#1, #2, #3...)
    const sortedByRank = Array.from(summaryMap.values()).sort((a, b) => {
      if (a.hasLoggedIn !== b.hasLoggedIn) return a.hasLoggedIn ? -1 : 1;
      if (b.activityScore !== a.activityScore) return b.activityScore - a.activityScore;
      if (b.totalActivityCount !== a.totalActivityCount) {
        return b.totalActivityCount - a.totalActivityCount;
      }
      if (b.loginCount !== a.loginCount) return b.loginCount - a.loginCount;
      const tA = a.lastLoginIso ? new Date(a.lastLoginIso).getTime() : 0;
      const tB = b.lastLoginIso ? new Date(b.lastLoginIso).getTime() : 0;
      if (tA !== tB) return tB - tA;
      return a.schoolName.localeCompare(b.schoolName);
    });

    sortedByRank.forEach((item, index) => {
      item.rank = index + 1;
    });

    return {
      userSummaries: sortedByRank,
      matchedSchoolLogs: validLogs,
    };
  }, [directorySchools, remoteProfiles, allMergedLogs, currentUser]);

  // Global KPI stats — strictly anchored to the 53 registered directory schools
  const kpiStats = useMemo(() => {
    const totalRegistered = directorySchools.length; // 53 schools in Direktori Ahli
    const activeUsers = userSummaries.filter((u) => u.hasLoggedIn);
    const activeToday = userSummaries.filter((u) => u.isOnlineOrToday);
    const active7Days = userSummaries.filter((u) => u.isRecent7Days);
    const neverLoggedIn = userSummaries.filter((u) => !u.hasLoggedIn);

    const totalLogins = userSummaries.reduce((sum, u) => sum + u.loginCount, 0);
    const totalCertDownloads = userSummaries.reduce((sum, u) => sum + u.certDownloadCount, 0);
    const totalProfileUpdates = userSummaries.reduce((sum, u) => sum + u.profileUpdateCount, 0);
    const totalActivities = userSummaries.reduce((sum, u) => sum + u.totalActivityCount, 0);

    const adoptionRate =
      totalRegistered > 0 ? Math.min(100, Math.round((activeUsers.length / totalRegistered) * 100)) : 0;

    return {
      totalRegistered,
      activeUsersCount: activeUsers.length,
      activeTodayCount: activeToday.length,
      active7DaysCount: active7Days.length,
      neverLoggedInCount: neverLoggedIn.length,
      adoptionRate,
      totalLogins,
      totalCertDownloads,
      totalProfileUpdates,
      totalActivities,
    };
  }, [userSummaries, directorySchools.length]);

  // Ranked PGB list according to Admin's selected Ranking Criteria & Scope
  const rankedUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const base = userSummaries.filter((u) => {
      if (rankingScope === 'ACTIVE_ONLY' && !u.hasLoggedIn) return false;
      if (stateFilter !== 'SEMUA' && u.state !== stateFilter) return false;
      if (!q) return true;
      return (
        u.pgbName.toLowerCase().includes(q) ||
        u.schoolName.toLowerCase().includes(q) ||
        u.schoolCode.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q)
      );
    });

    const sorted = [...base].sort((a, b) => {
      if (a.hasLoggedIn !== b.hasLoggedIn) return a.hasLoggedIn ? -1 : 1;
      if (rankingCriteria === 'MOST_LOGINS') {
        if (b.loginCount !== a.loginCount) return b.loginCount - a.loginCount;
        if (b.totalActivityCount !== a.totalActivityCount) return b.totalActivityCount - a.totalActivityCount;
      } else if (rankingCriteria === 'MOST_ACTIVITIES') {
        if (b.totalActivityCount !== a.totalActivityCount) return b.totalActivityCount - a.totalActivityCount;
        if (b.loginCount !== a.loginCount) return b.loginCount - a.loginCount;
      } else {
        if (b.activityScore !== a.activityScore) return b.activityScore - a.activityScore;
        if (b.totalActivityCount !== a.totalActivityCount) return b.totalActivityCount - a.totalActivityCount;
        if (b.loginCount !== a.loginCount) return b.loginCount - a.loginCount;
      }
      const tA = a.lastLoginIso ? new Date(a.lastLoginIso).getTime() : 0;
      const tB = b.lastLoginIso ? new Date(b.lastLoginIso).getTime() : 0;
      if (tA !== tB) return tB - tA;
      return a.schoolName.localeCompare(b.schoolName);
    });

    return sorted.map((item, idx) => ({
      ...item,
      displayRank: idx + 1,
    }));
  }, [userSummaries, rankingCriteria, rankingScope, stateFilter, searchQuery]);

  // Top 3 Podium PGBs (from active PGBs)
  const topThreePgb = useMemo(() => {
    return rankedUsers.filter((u) => u.hasLoggedIn).slice(0, 3);
  }, [rankedUsers]);

  // Max score for visual bar scaling
  const maxActivityScore = useMemo(() => {
    const max = Math.max(...userSummaries.map((u) => u.activityScore), 10);
    return max;
  }, [userSummaries]);

  // Available states for filtering
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    userSummaries.forEach((u) => {
      if (u.state && u.state !== 'Malaysia') set.add(u.state);
    });
    return ['SEMUA', ...Array.from(set).sort()];
  }, [userSummaries]);

  // Filtered & sorted user summaries for Directory Table view
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = userSummaries.filter((u) => {
      if (statusFilter === 'ACTIVE_LOGGED_IN' && !u.hasLoggedIn) return false;
      if (statusFilter === 'RECENT_7D' && !u.isRecent7Days) return false;
      if (statusFilter === 'NEVER_LOGGED_IN' && u.hasLoggedIn) return false;
      if (stateFilter !== 'SEMUA' && u.state !== stateFilter) return false;

      if (!q) return true;
      return (
        u.pgbName.toLowerCase().includes(q) ||
        u.schoolName.toLowerCase().includes(q) ||
        u.schoolCode.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.membershipNo.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q)
      );
    });

    return list.sort((a, b) => {
      if (sortBy === 'RANK_SCORE') {
        if (a.hasLoggedIn !== b.hasLoggedIn) return a.hasLoggedIn ? -1 : 1;
        if (b.activityScore !== a.activityScore) return b.activityScore - a.activityScore;
        return b.totalActivityCount - a.totalActivityCount;
      }
      if (sortBy === 'MOST_LOGINS') {
        if (b.loginCount !== a.loginCount) return b.loginCount - a.loginCount;
        return b.totalActivityCount - a.totalActivityCount;
      }
      if (sortBy === 'SCHOOL_NAME') {
        return a.schoolName.localeCompare(b.schoolName);
      }
      // RECENT_LOGIN
      if (a.hasLoggedIn !== b.hasLoggedIn) return a.hasLoggedIn ? -1 : 1;
      const tA = a.lastLoginIso
        ? new Date(a.lastLoginIso).getTime()
        : a.lastActivityIso
        ? new Date(a.lastActivityIso).getTime()
        : 0;
      const tB = b.lastLoginIso
        ? new Date(b.lastLoginIso).getTime()
        : b.lastActivityIso
        ? new Date(b.lastActivityIso).getTime()
        : 0;
      if (tA !== tB) return tB - tA;
      return b.totalActivityCount - a.totalActivityCount;
    });
  }, [userSummaries, searchQuery, statusFilter, stateFilter, sortBy]);

  // Filtered live stream logs
  const filteredStreamLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return matchedSchoolLogs.filter((l) => {
      const cat = inferCategory(l);
      if (streamCategoryFilter !== 'ALL' && cat !== streamCategoryFilter) return false;
      if (!q) return true;
      return (
        (l.user || '').toLowerCase().includes(q) ||
        (l.schoolName || '').toLowerCase().includes(q) ||
        (l.schoolCode || '').toLowerCase().includes(q) ||
        (l.action || '').toLowerCase().includes(q) ||
        (l.content || '').toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q)
      );
    });
  }, [matchedSchoolLogs, streamCategoryFilter, searchQuery]);

  // State breakdown analytics
  const stateAnalytics = useMemo(() => {
    const map = new Map<string, { state: string; total: number; active: number; logins: number }>();
    userSummaries.forEach((u) => {
      const st = u.state || 'Lain-lain';
      const cur = map.get(st) || { state: st, total: 0, active: 0, logins: 0 };
      cur.total += 1;
      if (u.hasLoggedIn) cur.active += 1;
      cur.logins += u.loginCount;
      map.set(st, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.active - a.active || b.total - a.total);
  }, [userSummaries]);

  // Export CSV handler for Admin (includes Ranking position & Score)
  const handleExportCSV = () => {
    const headers = [
      'Ranking Keaktifan',
      'Status Log Masuk',
      'Skor Keaktifan (Mata)',
      'Nama Pengetua / Guru Besar (PGB)',
      'Jawatan',
      'Nama Sekolah',
      'Kod Sekolah',
      'Negeri',
      'Emel Rasmi',
      'No. Keahlian',
      'Tarikh & Masa Log Masuk Terakhir',
      'Kaedah Log Masuk',
      'Jumlah Sesi Log Masuk',
      'Muat Turun Sijil & Kad',
      'Kemas Kini Profil',
      'Jumlah Keseluruhan Aktiviti',
      'Aktiviti Terakhir Dilakukan',
    ];

    const sourceList = activeView === 'ranking' ? rankedUsers : filteredUsers;

    const rows = sourceList.map((u, idx) => [
      `#${idx + 1}`,
      u.hasLoggedIn ? (u.isOnlineOrToday ? 'Aktif (Hari Ini)' : 'Telah Log Masuk') : 'Belum Log Masuk',
      String(u.activityScore),
      `"${(u.pgbName || '').replace(/"/g, '""')}"`,
      `"${(u.position || '').replace(/"/g, '""')}"`,
      `"${(u.schoolName || '').replace(/"/g, '""')}"`,
      `"${(u.schoolCode || '').replace(/"/g, '""')}"`,
      `"${(u.state || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.membershipNo || '').replace(/"/g, '""')}"`,
      `"${(u.lastLoginTimestamp || '-').replace(/"/g, '""')}"`,
      `"${(u.lastLoginMethod || '-').replace(/"/g, '""')}"`,
      String(u.loginCount),
      String(u.certDownloadCount),
      String(u.profileUpdateCount),
      String(u.totalActivityCount),
      `"${(u.lastActivityAction || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Laporan_Ranking_Keaktifan_PGB_MPGBSIM_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetLogs = async () => {
    setIsResetting(true);
    try {
      const res = await resetAllPgbActivityLogs();
      setRemoteLogs([]);
      setShowResetModal(false);
      setResetSuccessMessage(
        `Semua rekod log aktiviti PGB telah berjaya dipadam (${res.count} rekod di Firestore dibersihkan). Semua mata/poin PGB kini telah dikosongkan (0 mata).`
      );
      setTimeout(() => setResetSuccessMessage(null), 8000);
    } catch (e: any) {
      alert('Ralat memadam log: ' + (e?.message || 'Sila cuba lagi.'));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reset Success Notice */}
      {resetSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
            <span>{resetSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setResetSuccessMessage(null)}
            className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Executive Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pemantauan Langsung & Ranking Keaktifan PGB ({kpiStats.totalRegistered} Sekolah Berdaftar)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dashboard Pengguna Aktif & Ranking Keaktifan PGB Dalam Portal
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Data diselaraskan tepat mengikut <strong>{kpiStats.totalRegistered} Sekolah Ahli Berdaftar</strong> dalam Direktori Ahli. Pantau kedudukan (ranking) Pengetua & Guru Besar yang paling kerap log masuk dan beraktiviti (kemas kini profil, muat turun sijil/kad, kongsi berita kejayaan, hantar amalan terbaik, aktif sembang live & daftar program).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchLivePortalActivity}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-teal-100 border border-teal-600/50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Menyegerak...' : `Segar Semula (${lastRefreshedAt})`}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-900/40 border border-rose-400/40 transition cursor-pointer"
              title="Padam semua rekod log PGB supaya mata semua PGB kembali ke 0"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-200" />
              <span>Padam Log PGB (Reset Poin 0)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-teal-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-teal-200/90">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>
              Pengesahan Integriti Direktori: <strong>{kpiStats.totalRegistered} Sekolah Ahli Berdaftar</strong> ({kpiStats.activeUsersCount} PGB Telah Log Masuk • {kpiStats.neverLoggedInCount} Sekolah Belum Log Masuk)
            </span>
          </div>
          <span className="text-amber-300 font-bold">
            Sistem Skor: Log Masuk (+5m) • Profil (+10m) • Sijil/Kad (+10m) • Yuran (+10m) • Dokumen (+8m) • Kongsi Berita Kejayaan (+25m) • Amalan Terbaik (+20m) • Daftar Program (+15m) • Sembang Live (+5m)
          </span>
        </div>
      </div>

      {/* 6 Executive KPI Cards — Strictly Showing X / 53 Registered Schools */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => {
            setActiveView('users');
            setStatusFilter('ACTIVE_LOGGED_IN');
          }}
          className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Ahli PGB Aktif
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpiStats.activeUsersCount}
          </div>
          <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
            {kpiStats.activeUsersCount} / {kpiStats.totalRegistered} ({kpiStats.adoptionRate}% Aktif)
          </div>
        </div>

        <div
          onClick={() => {
            setActiveView('users');
            setStatusFilter('RECENT_7D');
          }}
          className="p-4 rounded-2xl bg-white border border-teal-200 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Aktif Hari Ini (24 Jam)
            </div>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpiStats.activeTodayCount}</div>
          <div className="text-[10px] text-teal-700 font-semibold mt-1">
            Log masuk dalam tempoh 24 jam
          </div>
        </div>

        <div
          onClick={() => {
            setActiveView('users');
            setStatusFilter('RECENT_7D');
          }}
          className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Aktiviti 7 Hari Terkini
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpiStats.active7DaysCount}</div>
          <div className="text-[10px] text-blue-700 font-semibold mt-1">
            PGB aktif minggu ini
          </div>
        </div>

        <div
          onClick={() => {
            setActiveView('users');
            setStatusFilter('NEVER_LOGGED_IN');
          }}
          className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Belum Log Masuk
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpiStats.neverLoggedInCount}</div>
          <div className="text-[10px] text-amber-800 font-semibold mt-1">
            {kpiStats.neverLoggedInCount} sekolah daripada {kpiStats.totalRegistered} berdaftar
          </div>
        </div>

        <div
          onClick={() => {
            setActiveView('stream');
            setStreamCategoryFilter('LOG_MASUK');
          }}
          className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Jumlah Sesi Log Masuk
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpiStats.totalLogins}</div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-1">
            Jumlah keseluruhan sesi log masuk
          </div>
        </div>

        <div
          onClick={() => {
            setActiveView('stream');
            setStreamCategoryFilter('ALL');
          }}
          className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Sijil & Profil Dikemas Kini
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpiStats.totalCertDownloads + kpiStats.totalProfileUpdates}
          </div>
          <div className="text-[10px] text-purple-700 font-semibold mt-1">
            {kpiStats.totalCertDownloads} Sijil/Kad • {kpiStats.totalProfileUpdates} Profil
          </div>
        </div>
      </div>

      {/* Sub-navigation Mode Selector + Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView('ranking')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeView === 'ranking'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranking PGB Kerap Log Masuk & Beraktiviti</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('users')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeView === 'users'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Direktori Status Log Masuk ({kpiStats.totalRegistered} Sekolah)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('stream')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeView === 'stream'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Garis Masa Log Masuk & Aktiviti ({matchedSchoolLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('analytics')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeView === 'analytics'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analitik Negeri & Belum Log Masuk ({kpiStats.neverLoggedInCount})</span>
          </button>
        </div>

        {/* Global Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama PGB, sekolah, kod sekolah (cth: MJAC011), negeri..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* VIEW 0: RANKING PGB KERAP LOG MASUK & BERAKTIVITI DALAM PORTAL */}
      {activeView === 'ranking' && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          {topThreePgb.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-6 border border-teal-800/60 shadow-lg text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>Podium Ranking PGB Paling Aktif Log Masuk & Beraktiviti</span>
                    </h3>
                    <p className="text-xs text-teal-200/90">
                      Pengetua & Guru Besar sekolah ahli yang mencatatkan kekerapan sesi log masuk, kemas kini profil rasmi, dan muat turun sijil tertinggi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{kpiStats.activeUsersCount} daripada {kpiStats.totalRegistered} Sekolah Aktif</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThreePgb.map((pgb, idx) => {
                  const isFirst = idx === 0;
                  const isSecond = idx === 1;
                  const rankStyles = isFirst
                    ? {
                        card: 'bg-gradient-to-br from-amber-500/20 via-slate-900/95 to-slate-900 border-amber-400/60 ring-1 ring-amber-400/30',
                        badge: 'bg-amber-400 text-slate-950',
                        title: 'TEMPAT PERTAMA (#1)',
                        medalColor: 'text-amber-400',
                      }
                    : isSecond
                    ? {
                        card: 'bg-gradient-to-br from-slate-300/15 via-slate-900/95 to-slate-900 border-slate-400/50',
                        badge: 'bg-slate-200 text-slate-900',
                        title: 'TEMPAT KEDUA (#2)',
                        medalColor: 'text-slate-300',
                      }
                    : {
                        card: 'bg-gradient-to-br from-orange-500/15 via-slate-900/95 to-slate-900 border-orange-400/40',
                        badge: 'bg-orange-400 text-slate-950',
                        title: 'TEMPAT KETIGA (#3)',
                        medalColor: 'text-orange-400',
                      };

                  return (
                    <div
                      key={pgb.key}
                      className={`p-5 rounded-2xl border ${rankStyles.card} flex flex-col justify-between gap-4 relative overflow-hidden`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${rankStyles.badge}`}
                          >
                            <Medal className="w-3.5 h-3.5" />
                            {rankStyles.title}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs">
                            {pgb.activityScore} Mata
                          </span>
                        </div>

                        <div className="font-black text-white text-sm sm:text-base leading-snug">
                          {pgb.pgbName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-200 border border-teal-500/30">
                            {pgb.position}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {pgb.schoolCode}
                          </span>
                          <span className="text-[10px] text-slate-300 font-semibold">
                            • {pgb.state}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-teal-100 mt-2 line-clamp-2">
                          {pgb.schoolName}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/10">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-sm font-black text-emerald-400">{pgb.loginCount}</div>
                            <div className="text-[9px] uppercase font-bold text-slate-300">Log Masuk</div>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-sm font-black text-amber-300">
                              {pgb.profileUpdateCount + pgb.certDownloadCount}
                            </div>
                            <div className="text-[9px] uppercase font-bold text-slate-300">Profil & Sijil</div>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="text-sm font-black text-white">{pgb.totalActivityCount}</div>
                            <div className="text-[9px] uppercase font-bold text-slate-300">Jum. Aktiviti</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-slate-300 truncate">
                            Sesi Terakhir: <strong className="text-white font-mono">{pgb.lastLoginTimestamp}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedUserDetail(pgb)}
                            className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-[10px] shrink-0 transition cursor-pointer"
                          >
                            Jejak Penuh
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Jadual Penuh Ranking Keaktifan PGB Dalam Portal Ahli</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kedudukan PGB disusun mengikut kekerapan sesi log masuk dan jumlah aktiviti utama yang direkodkan di dalam portal
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Scope Toggle */}
                <div className="inline-flex rounded-xl bg-slate-200/80 p-1">
                  <button
                    type="button"
                    onClick={() => setRankingScope('ACTIVE_ONLY')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      rankingScope === 'ACTIVE_ONLY'
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PGB Aktif ({kpiStats.activeUsersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingScope('ALL_53')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      rankingScope === 'ALL_53'
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua {kpiStats.totalRegistered} Sekolah Direktori
                  </button>
                </div>

                {/* Criteria Selector */}
                <select
                  value={rankingCriteria}
                  onChange={(e) => setRankingCriteria(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="OVERALL_SCORE">Kriteria: Skor Keaktifan Keseluruhan</option>
                  <option value="MOST_LOGINS">Kriteria: Paling Kerap Log Masuk (Sesi)</option>
                  <option value="MOST_ACTIVITIES">Kriteria: Jumlah Aktiviti Tertinggi</option>
                </select>

                {/* State Filter */}
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  {availableStates.map((st) => (
                    <option key={st} value={st}>
                      {st === 'SEMUA' ? 'Semua Negeri' : st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Ranking</th>
                    <th className="py-3.5 px-4">Pengetua / Guru Besar (PGB)</th>
                    <th className="py-3.5 px-4">Sekolah & Kod (Direktori {kpiStats.totalRegistered})</th>
                    <th className="py-3.5 px-4">Kekerapan Log Masuk</th>
                    <th className="py-3.5 px-4">Pecahan Aktiviti Portal</th>
                    <th className="py-3.5 px-4">Skor & Tahap Keaktifan</th>
                    <th className="py-3.5 px-4">Log Masuk Terakhir</th>
                    <th className="py-3.5 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Tiada rekod PGB yang sepadan dengan carian atau tapisan semasa.
                      </td>
                    </tr>
                  ) : (
                    rankedUsers.map((u) => {
                      const pctBar = u.hasLoggedIn
                        ? Math.max(12, Math.min(100, Math.round((u.activityScore / maxActivityScore) * 100)))
                        : 0;

                      return (
                        <tr
                          key={u.key}
                          className={`hover:bg-slate-50/90 transition ${
                            u.displayRank <= 3 && u.hasLoggedIn ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {/* Ranking Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {u.hasLoggedIn && u.displayRank === 1 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                                <Crown className="w-3.5 h-3.5" />
                                #1
                              </span>
                            ) : u.hasLoggedIn && u.displayRank === 2 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-200 text-slate-900 font-black text-xs border border-slate-300">
                                <Medal className="w-3.5 h-3.5 text-slate-600" />
                                #2
                              </span>
                            ) : u.hasLoggedIn && u.displayRank === 3 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900 font-black text-xs border border-orange-300">
                                <Medal className="w-3.5 h-3.5 text-orange-600" />
                                #3
                              </span>
                            ) : u.hasLoggedIn ? (
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-teal-50 text-teal-900 font-black text-xs border border-teal-200">
                                #{u.displayRank}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 font-bold text-[11px]">
                                #{u.displayRank}
                              </span>
                            )}
                          </td>

                          {/* PGB Name & Position */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900">{u.pgbName}</div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                                {u.position}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {u.membershipNo}
                              </span>
                            </div>
                          </td>

                          {/* School & State */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 max-w-[240px] leading-snug">
                              {u.schoolName}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                                {u.schoolCode}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                • {u.state}
                              </span>
                              <span className="text-[10px] text-teal-700 font-semibold">
                                • Ahli {u.joinYear}
                              </span>
                            </div>
                          </td>

                          {/* Login Frequency */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {u.hasLoggedIn ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center border border-emerald-200">
                                  {u.loginCount}x
                                </div>
                                <div>
                                  <div className="font-extrabold text-emerald-900 text-xs">
                                    {u.loginCount} Sesi Log Masuk
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {u.isOnlineOrToday ? 'Aktif Hari Ini' : 'Telah Log Masuk'}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">0 Sesi</span>
                            )}
                          </td>

                          {/* Breakdown of Portal Activities */}
                          <td className="py-3.5 px-4">
                            {u.hasLoggedIn ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-[10px] font-bold">
                                  {u.profileUpdateCount} Profil
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                                  {u.certDownloadCount} Sijil/Kad
                                </span>
                                {u.newsShareCount > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-[10px] font-bold">
                                    {u.newsShareCount} Berita (+{u.newsShareCount * 25}m)
                                  </span>
                                )}
                                {u.bestPracticeCount > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] font-bold">
                                    {u.bestPracticeCount} Amalan (+{u.bestPracticeCount * 20}m)
                                  </span>
                                )}
                                {u.programRegCount > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold">
                                    {u.programRegCount} Program (+{u.programRegCount * 15}m)
                                  </span>
                                )}
                                {u.chatActivityCount > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-900 border border-cyan-200 text-[10px] font-bold">
                                    {u.chatActivityCount} Sembang (+{u.chatActivityCount * 5}m)
                                  </span>
                                )}
                                {(u.feeActivityCount > 0 || u.docDownloadCount > 0 || u.otherActivityCount > 0) && (
                                  <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold">
                                    {u.feeActivityCount + u.docDownloadCount + u.otherActivityCount} Lain
                                  </span>
                                )}
                                <span className="text-[10px] font-extrabold text-slate-700 ml-1">
                                  = {u.totalActivityCount} Aktiviti
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">Tiada aktiviti (0 mata)</span>
                            )}
                          </td>

                          {/* Activity Score & Bar */}
                          <td className="py-3.5 px-4 min-w-[170px]">
                            {u.hasLoggedIn ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <strong className="font-black text-slate-900">
                                    {u.activityScore} Mata
                                  </strong>
                                  <span
                                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                      u.activityTier === 'PENERAJU_AKTIF'
                                        ? 'bg-amber-100 text-amber-900'
                                        : u.activityTier === 'SANGAT_AKTIF'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-teal-50 text-teal-800'
                                    }`}
                                  >
                                    {u.activityTier === 'PENERAJU_AKTIF'
                                      ? 'Sangat Kerap'
                                      : u.activityTier === 'SANGAT_AKTIF'
                                      ? 'Aktif Konsisten'
                                      : 'Aktif'}
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-teal-700 via-emerald-500 to-amber-500"
                                    style={{ width: `${pctBar}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-semibold">
                                0 Mata (Belum Aktif)
                              </span>
                            )}
                          </td>

                          {/* Last Login */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {u.hasLoggedIn ? (
                              <div>
                                <div className="font-mono font-bold text-slate-900 text-[11px]">
                                  {u.lastLoginTimestamp}
                                </div>
                                <div className="text-[10px] font-bold text-emerald-700">
                                  {formatRelativeTime(u.lastLoginIso || u.lastActivityIso)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Belum log masuk</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAdminLoginAsSchoolFromSummary(u)}
                                title="Log masuk terus ke Portal PGB sekolah ini tanpa memerlukan kata laluan"
                                className="px-2.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white border border-teal-950 text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                              >
                                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                                <span>Akses Portal</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserPassResetDone(null);
                                  setCopiedUserTempPass(false);
                                  setUserToResetPass(u);
                                }}
                                title="Reset Kata Laluan Portal PGB ke MPGBSIM2026"
                                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white border border-amber-200 text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Reset Password</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedUserDetail(u)}
                                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-900 text-teal-900 hover:text-white border border-teal-200 text-[11px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Jejak Penuh</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: SENARAI 53 SEKOLAH DIREKTORI & STATUS LOG MASUK PGB */}
      {activeView === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: `Semua Sekolah Direktori (${kpiStats.totalRegistered})` },
                { id: 'ACTIVE_LOGGED_IN', label: `Telah Log Masuk (${kpiStats.activeUsersCount})` },
                { id: 'RECENT_7D', label: `Aktif 7 Hari (${kpiStats.active7DaysCount})` },
                { id: 'NEVER_LOGGED_IN', label: `Belum Log Masuk (${kpiStats.neverLoggedInCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  {availableStates.map((st) => (
                    <option key={st} value={st}>
                      {st === 'SEMUA' ? 'Semua Negeri' : st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="RANK_SCORE">Susun: Ranking Keaktifan Tertinggi</option>
                  <option value="RECENT_LOGIN">Susun: Log Masuk Terkini</option>
                  <option value="MOST_LOGINS">Susun: Paling Kerap Log Masuk</option>
                  <option value="SCHOOL_NAME">Susun: Nama Sekolah (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Users */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Ranking & Status</th>
                  <th className="py-3.5 px-4">Pengetua / Guru Besar (PGB)</th>
                  <th className="py-3.5 px-4">Sekolah & Negeri</th>
                  <th className="py-3.5 px-4">Log Masuk Terakhir</th>
                  <th className="py-3.5 px-4">Statistik Aktiviti Portal</th>
                  <th className="py-3.5 px-4">Aktiviti Terakhir Dilakukan</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tiada rekod pengguna atau sekolah yang sepadan dengan tapisan anda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.key}
                      className={`hover:bg-slate-50/90 transition ${
                        u.isOnlineOrToday ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Status Semasa */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-black text-[10px] border border-slate-200">
                            #{u.rank}
                          </span>
                          {u.isOnlineOrToday ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Aktif Hari Ini
                            </span>
                          ) : u.isRecent7Days ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-200 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                              Aktif (7 Hari)
                            </span>
                          ) : u.hasLoggedIn ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Telah Log Masuk
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-semibold">
                              Belum Log Masuk
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pengetua / Guru Besar */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{u.pgbName}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                            {u.position}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {u.membershipNo}
                          </span>
                        </div>
                        {u.email && u.email !== '-' && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[210px]">
                            {u.email}
                          </div>
                        )}
                      </td>

                      {/* Sekolah & Negeri */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 max-w-[250px] leading-snug">
                          {u.schoolName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                            {u.schoolCode}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            • {u.state}
                          </span>
                          <span className="text-[10px] text-teal-700 font-semibold">
                            • Ahli {u.joinYear}
                          </span>
                        </div>
                      </td>

                      {/* Tarikh & Masa Log Masuk Terakhir */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.hasLoggedIn ? (
                          <div>
                            <div className="font-mono font-bold text-slate-900 text-[11px]">
                              {u.lastLoginTimestamp}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-emerald-700">
                                {formatRelativeTime(u.lastLoginIso || u.lastActivityIso)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({u.lastLoginMethod})
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Tiada rekod log masuk
                          </span>
                        )}
                      </td>

                      {/* Statistik Aktiviti Portal */}
                      <td className="py-3.5 px-4">
                        {u.hasLoggedIn ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              title="Jumlah Sesi Log Masuk"
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                            >
                              {u.loginCount} Log Masuk
                            </span>
                            {u.certDownloadCount > 0 && (
                              <span
                                title="Jumlah Muat Turun / Cetak Sijil & Kad"
                                className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold"
                              >
                                {u.certDownloadCount} Sijil/Kad
                              </span>
                            )}
                            {u.profileUpdateCount > 0 && (
                              <span
                                title="Jumlah Kemas Kini Profil"
                                className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-[10px] font-bold"
                              >
                                {u.profileUpdateCount} Profil
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-bold">
                              Jumlah: {u.totalActivityCount} ({u.activityScore}m)
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">0 aktiviti</span>
                        )}
                      </td>

                      {/* Aktiviti Terakhir Dilakukan */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        {u.hasLoggedIn ? (
                          <div>
                            <div className="font-bold text-slate-800 truncate">
                              {u.lastActivityAction}
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {u.lastActivityContent}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>

                      {/* Tindakan Admin */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdminLoginAsSchoolFromSummary(u)}
                            title="Log masuk terus ke Portal PGB sekolah ini tanpa memerlukan kata laluan"
                            className="px-2.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white border border-teal-950 text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                          >
                            <LogIn className="w-3.5 h-3.5 text-amber-300" />
                            <span>Akses Portal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserPassResetDone(null);
                              setCopiedUserTempPass(false);
                              setUserToResetPass(u);
                            }}
                            title="Reset Kata Laluan Portal PGB ke MPGBSIM2026"
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white border border-amber-200 text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Reset Password</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedUserDetail(u)}
                            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-900 text-teal-900 hover:text-white border border-teal-200 text-[11px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Jejak Penuh</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: GARIS MASA LOG MASUK & AKTIVITI LANGSUNG */}
      {activeView === 'stream' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'Semua Aktiviti Sekolah Ahli' },
                { id: 'LOG_MASUK', label: 'Log Masuk & Sesi' },
                { id: 'SIJIL_KAD', label: 'Muat Turun Sijil & Kad' },
                { id: 'PROFIL', label: 'Kemas Kini Profil' },
                { id: 'DOKUMEN', label: 'Muat Turun Dokumen' },
                { id: 'YURAN', label: 'Pembayaran Yuran' },
                { id: 'PROGRAM_AMALAN', label: 'Program & Amalan' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStreamCategoryFilter(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    streamCategoryFilter === cat.id
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-500">
              Memaparkan {filteredStreamLogs.length} rekod aktiviti sekolah berdaftar
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStreamLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Tiada rekod aktiviti ditemui untuk kategori ini.
              </div>
            ) : (
              filteredStreamLogs.map((log) => {
                const cat = inferCategory(log);
                const meta = CATEGORY_META[cat];
                return (
                  <div
                    key={log.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${meta.badgeBg} ${meta.badgeText} ${meta.border}`}
                        >
                          {meta.label}
                        </span>
                        <strong className="text-xs sm:text-sm font-black text-slate-900">
                          {log.action}
                        </strong>
                        {log.schoolCode && (
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                            {log.schoolCode}
                          </span>
                        )}
                        {log.state && (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {log.state}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{log.content}</p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span>
                          Pelaku: <strong className="text-slate-800">{log.user}</strong>
                          {log.position ? ` (${log.position})` : ''}
                        </span>
                        {log.schoolName && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-teal-900">{log.schoolName}</span>
                          </>
                        )}
                        {log.email && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px]">{log.email}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-slate-800">
                        {log.timestamp}
                      </div>
                      {log.isoTimestamp && (
                        <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                          {formatRelativeTime(log.isoTimestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: ANALITIK KEAKTIFAN NEGERI & SENARAI SEKOLAH BELUM LOG MASUK */}
      {activeView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* State Adoption Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Kadar Keaktifan Log Masuk Mengikut Negeri ({kpiStats.totalRegistered} Sekolah)
                </h3>
                <p className="text-xs text-slate-500">
                  Perbandingan sekolah ahli yang telah log masuk berbanding jumlah berdaftar dalam Direktori Ahli
                </p>
              </div>
              <MapPin className="w-5 h-5 text-teal-700" />
            </div>

            <div className="space-y-3">
              {stateAnalytics.map((st) => {
                const pct = st.total > 0 ? Math.round((st.active / st.total) * 100) : 0;
                return (
                  <div key={st.state} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{st.state}</span>
                      <span className="text-slate-600 font-semibold">
                        <strong className="text-teal-900">{st.active}</strong> / {st.total} Sekolah ({pct}%) •{' '}
                        <span className="text-[10px] text-slate-400">{st.logins} sesi</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(pct, st.active > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schools Not Yet Logged In (Follow-Up List for Admin) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Senarai Sekolah Belum Log Masuk ({kpiStats.neverLoggedInCount} / {kpiStats.totalRegistered} Sekolah)
                </h3>
                <p className="text-xs text-slate-500">
                  Senarai PGB sekolah berdaftar dalam Direktori Ahli yang belum mempunyai rekod log masuk
                </p>
              </div>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 pr-1">
              {userSummaries.filter((u) => !u.hasLoggedIn).length === 0 ? (
                <div className="py-10 text-center text-emerald-700 font-bold text-xs">
                  Tahniah! Semua {kpiStats.totalRegistered} sekolah berdaftar telah mempunyai rekod log masuk aktif.
                </div>
              ) : (
                userSummaries
                  .filter((u) => !u.hasLoggedIn)
                  .map((u) => (
                    <div key={u.key} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{u.schoolName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          PGB: <strong>{u.pgbName}</strong> • Kod:{' '}
                          <span className="font-mono font-bold text-teal-900">{u.schoolCode}</span> • {u.state}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAdminLoginAsSchoolFromSummary(u)}
                          className="px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-xs border border-teal-950"
                          title="Log masuk terus ke Portal PGB sekolah ini tanpa memerlukan kata laluan"
                        >
                          <LogIn className="w-3 h-3 text-amber-300" />
                          <span>Akses Portal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserPassResetDone(null);
                            setCopiedUserTempPass(false);
                            setUserToResetPass(u);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white border border-amber-200 text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                          title="Reset kata laluan PGB ke MPGBSIM2026"
                        >
                          <Key className="w-3 h-3" />
                          <span>Reset Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUserDetail(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-900 hover:text-white text-slate-700 text-[10px] font-bold shrink-0 transition cursor-pointer"
                        >
                          Lihat Info
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: JEJAK PENUH LOG MASUK & AKTIVITI PGB */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                  <span>Kedudukan Ranking #{selectedUserDetail.rank}</span>
                  <span>•</span>
                  <span className="font-mono text-amber-300">{selectedUserDetail.schoolCode}</span>
                  <span>•</span>
                  <span className="text-emerald-300">{selectedUserDetail.activityScore} Mata Keaktifan</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {selectedUserDetail.pgbName}
                </h3>
                <p className="text-xs text-teal-200 font-semibold">
                  {selectedUserDetail.position} — {selectedUserDetail.schoolName} ({selectedUserDetail.state})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const u = selectedUserDetail;
                    setSelectedUserDetail(null);
                    handleAdminLoginAsSchoolFromSummary(u);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white border border-teal-600 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  title="Log masuk terus ke Portal PGB sekolah ini tanpa kata laluan"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>Log Masuk Portal (Tanpa Password)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserDetail(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Summary Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Jumlah Log Masuk
                  </span>
                  <strong className="text-xl font-black text-emerald-950 mt-0.5 block">
                    {selectedUserDetail.loginCount} Sesi
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">
                    Sijil & Kad Ahli
                  </span>
                  <strong className="text-xl font-black text-amber-950 mt-0.5 block">
                    {selectedUserDetail.certDownloadCount} Kali
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200">
                  <span className="text-[10px] font-bold uppercase text-teal-800 block">
                    Kemas Kini Profil
                  </span>
                  <strong className="text-xl font-black text-teal-950 mt-0.5 block">
                    {selectedUserDetail.profileUpdateCount} Kali
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Log Masuk Terakhir
                  </span>
                  <strong className="text-xs font-mono font-black text-slate-900 mt-1 block">
                    {selectedUserDetail.lastLoginTimestamp}
                  </strong>
                </div>
              </div>

              {/* Secondary Scoring Activities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <span className="text-[10px] font-bold uppercase text-rose-800 block">
                    Kongsi Kejayaan (+25m)
                  </span>
                  <strong className="text-lg font-black text-rose-950 mt-0.5 block">
                    {selectedUserDetail.newsShareCount} Berita
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <span className="text-[10px] font-bold uppercase text-indigo-800 block">
                    Amalan Terbaik (+20m)
                  </span>
                  <strong className="text-lg font-black text-indigo-950 mt-0.5 block">
                    {selectedUserDetail.bestPracticeCount} Submisi
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Daftar Program (+15m)
                  </span>
                  <strong className="text-lg font-black text-emerald-950 mt-0.5 block">
                    {selectedUserDetail.programRegCount} Acara
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-200">
                  <span className="text-[10px] font-bold uppercase text-cyan-800 block">
                    Sembang Live (+5m)
                  </span>
                  <strong className="text-lg font-black text-cyan-950 mt-0.5 block">
                    {selectedUserDetail.chatActivityCount} Mesej
                  </strong>
                </div>
              </div>

              {/* Metadata Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">No. Keahlian & Tahun</span>
                  <strong className="font-mono text-slate-900">{selectedUserDetail.membershipNo}</strong>
                  <span className="text-teal-800 font-semibold block text-[11px]">
                    Tahun Menjadi Ahli: {selectedUserDetail.joinYear}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Emel Rasmi</span>
                  <strong className="text-slate-800 break-all">{selectedUserDetail.email}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">No. Telefon & Kaedah Log Masuk</span>
                  <strong className="text-slate-800">{selectedUserDetail.phone}</strong>
                  <span className="text-slate-500 block text-[11px]">
                    Kaedah: {selectedUserDetail.lastLoginMethod}
                  </span>
                </div>
              </div>

              {/* Individual Activity Log History */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-700" />
                  <span>Sejarah Penuh Log Masuk & Aktiviti ({selectedUserDetail.logs.length} Rekod)</span>
                </h4>

                {selectedUserDetail.logs.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Tiada rekod aktiviti portal direkodkan bagi sekolah ini setakat ini.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    {selectedUserDetail.logs.map((log) => {
                      const cat = inferCategory(log);
                      const meta = CATEGORY_META[cat];
                      return (
                        <div key={log.id} className="p-3.5 bg-white hover:bg-slate-50 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeBg} ${meta.badgeText} ${meta.border}`}
                              >
                                {meta.label}
                              </span>
                              <strong className="text-slate-900">{log.action}</strong>
                            </div>
                            <p className="text-slate-600 text-[11px]">{log.content}</p>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 shrink-0">
                            {log.timestamp}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedUserDetail;
                  setSelectedUserDetail(null);
                  setUserPassResetDone(null);
                  setCopiedUserTempPass(false);
                  setUserToResetPass(target);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Reset Kata Laluan Portal PGB (MPGBSIM2026)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Tutup Paparan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGESAHAN RESET KATA LALUAN PORTAL PGB KE MPGBSIM2026 */}
      {userToResetPass && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900">
                    Reset Kata Laluan Portal PGB
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Tetapkan semula ke kata laluan sementara rasmi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserToResetPass(null);
                  setUserPassResetDone(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!userPassResetDone ? (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-black text-slate-900 text-sm">
                    {userToResetPass.schoolName}
                  </div>
                  <div className="text-slate-600">
                    PGB: <strong className="text-slate-900">{userToResetPass.pgbName}</strong>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                      Kod: {userToResetPass.schoolCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                      {userToResetPass.state}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2 text-xs text-amber-950">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Kata Laluan Sementara Rasmi:</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono text-sm font-black text-center tracking-wider text-slate-900 select-all">
                    MPGBSIM2026
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Sekiranya PGB terlupa kata laluan peribadi mereka, tindakan ini akan mereset semula kata laluan log masuk Portal PGB kepada <strong>MPGBSIM2026</strong> serta-merta.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isResettingUserPass}
                    onClick={() => setUserToResetPass(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isResettingUserPass}
                    onClick={async () => {
                      setIsResettingUserPass(true);
                      const targetKey = userToResetPass.schoolId || userToResetPass.schoolCode;
                      const res = await resetPgbPassword(targetKey);
                      setIsResettingUserPass(false);
                      if (res.success) {
                        setUserPassResetDone({
                          pgbName: userToResetPass.pgbName,
                          schoolName: userToResetPass.schoolName,
                          schoolCode: userToResetPass.schoolCode,
                          tempPassword: res.tempPassword,
                        });
                        setResetSuccessMessage(res.message);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-900/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isResettingUserPass ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mereset Kata Laluan...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Sahkan Reset ke MPGBSIM2026</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                  <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Kata Laluan Berjaya Direset!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Kata laluan Portal PGB bagi <strong>{userPassResetDone.pgbName}</strong> ({userPassResetDone.schoolName}) telah dikembalikan kepada kata laluan sementara rasmi:
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-emerald-300 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Kod Sekolah: {userPassResetDone.schoolCode}
                      </span>
                      <span className="font-mono text-base font-black text-slate-900 tracking-wider select-all">
                        {userPassResetDone.tempPassword}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const textToCopy = `Makluman Reset Kata Laluan Portal Rasmi PGB MPGBSIM\nSekolah: ${userPassResetDone.schoolName}\nKod Sekolah: ${userPassResetDone.schoolCode}\nKata Laluan Sementara: ${userPassResetDone.tempPassword}\n\nSila log masuk dan tukar kata laluan baharu anda di menu Profil Ahli.`;
                        navigator.clipboard?.writeText(textToCopy);
                        setCopiedUserTempPass(true);
                        setTimeout(() => setCopiedUserTempPass(false), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition cursor-pointer shrink-0"
                    >
                      {copiedUserTempPass ? 'Disalin!' : 'Salin Info'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setUserToResetPass(null);
                      setUserPassResetDone(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PENGESAHAN: RESET / PADAM SEMUA LOG PGB (POIN KOSONG) */}
      {showResetModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                Padam Semua Rekod Log & Kosongkan Poin PGB?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tindakan ini akan <strong>memadam semua rekod audit log keaktifan PGB</strong> di Firestore dan cache setempat secara kekal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs text-amber-900">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-950">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Kesan Tindakan Ini:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-900 leading-normal">
                <li>Semua skor / mata PGB akan <strong>kembali ke 0 (Kosong)</strong> serta-merta.</li>
                <li>Status ranking PGB akan diset semula ke tahap awal (Belum Log Masuk).</li>
                <li>PGB akan mula mengumpul mata baharu secara adil apabila berkongsi berita kejayaan (+25m), menghantar amalan terbaik (+20m), mendaftar program (+15m), aktif ruang sembang (+5m), dan log masuk (+5m).</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetLogs}
                disabled={isResetting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-950/20 transition cursor-pointer disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memadam Rekod...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Padam Semua Log Sekarang (Reset ke 0 Poin)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
