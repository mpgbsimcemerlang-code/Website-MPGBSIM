import { ExamCalendarItem } from '../types';

export type ExamLiveStatus = 'upcoming' | 'ongoing' | 'completed' | 'draft' | 'archived';

export interface ExamCountdownInfo {
  liveStatus: ExamLiveStatus;
  statusBadgeText: string;
  countdownDays: number;
  countdownLabel: string;
  formattedRange: string;
  isToday: boolean;
  isOngoing: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
  urgencyLevel: 'urgent' | 'near' | 'normal' | 'completed';
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Kuala_Lumpur timezone.
 */
export function getMalaysiaTodayDateString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Parses YYYY-MM-DD into a UTC midnight timestamp for clean integer day difference calculation.
 */
function toUtcMidnight(dateStr: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.trim().split('-');
  if (parts.length < 3) return new Date(dateStr).getTime();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return Date.UTC(year, month, day);
}

const MONTH_NAMES_MS = [
  'Januari',
  'Februari',
  'Mac',
  'April',
  'Mei',
  'Jun',
  'Julai',
  'Ogos',
  'September',
  'Oktober',
  'November',
  'Disember',
];

/**
 * Formats YYYY-MM-DD into "26 Oktober 2026"
 */
export function formatMalayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('-');
  if (parts.length < 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = MONTH_NAMES_MS[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

/**
 * Formats date range: e.g. "26 - 29 Oktober 2026" or "23 November 2026"
 */
export function formatMalayDateRange(startStr: string, endStr: string): string {
  if (!startStr) return '';
  if (!endStr || startStr === endStr) return formatMalayDate(startStr);

  const startParts = startStr.trim().split('-');
  const endParts = endStr.trim().split('-');

  if (startParts.length === 3 && endParts.length === 3) {
    const sYear = startParts[0];
    const sMonth = parseInt(startParts[1], 10) - 1;
    const sDay = parseInt(startParts[2], 10);

    const eYear = endParts[0];
    const eMonth = parseInt(endParts[1], 10) - 1;
    const eDay = parseInt(endParts[2], 10);

    if (sYear === eYear && sMonth === eMonth) {
      return `${sDay} – ${eDay} ${MONTH_NAMES_MS[sMonth]} ${sYear}`;
    }
    if (sYear === eYear) {
      return `${sDay} ${MONTH_NAMES_MS[sMonth]} – ${eDay} ${MONTH_NAMES_MS[eMonth]} ${sYear}`;
    }
  }

  return `${formatMalayDate(startStr)} – ${formatMalayDate(endStr)}`;
}

/**
 * Computes exact countdown and live state according to Malaysian Calendar rules.
 */
export function getExamCountdownInfo(
  exam: ExamCalendarItem,
  customTodayStr?: string
): ExamCountdownInfo {
  const todayStr = customTodayStr || getMalaysiaTodayDateString();
  const todayMs = toUtcMidnight(todayStr);
  const startMs = toUtcMidnight(exam.startDate);
  const endMs = toUtcMidnight(exam.endDate || exam.startDate);

  const oneDayMs = 24 * 60 * 60 * 1000;
  const formattedRange = formatMalayDateRange(exam.startDate, exam.endDate);

  // If status is draft or archived, preserve status
  if (exam.status === 'draft') {
    return {
      liveStatus: 'draft',
      statusBadgeText: 'Draf',
      countdownDays: 0,
      countdownLabel: 'Draf Pentadbir',
      formattedRange,
      isToday: false,
      isOngoing: false,
      isCompleted: false,
      isUpcoming: false,
      urgencyLevel: 'normal',
    };
  }

  if (exam.status === 'archived') {
    return {
      liveStatus: 'archived',
      statusBadgeText: 'Diarkibkan',
      countdownDays: 0,
      countdownLabel: 'Arkib Rekod',
      formattedRange,
      isToday: false,
      isOngoing: false,
      isCompleted: true,
      isUpcoming: false,
      urgencyLevel: 'completed',
    };
  }

  // 1. Before Start Date -> Upcoming
  if (todayMs < startMs) {
    const diffDays = Math.max(0, Math.round((startMs - todayMs) / oneDayMs));
    let label = `${diffDays} hari lagi`;
    let isToday = false;

    if (diffDays === 0) {
      label = 'Hari ini bermula';
      isToday = true;
    } else if (diffDays === 1) {
      label = 'Esok bermula';
    }

    let urgencyLevel: 'urgent' | 'near' | 'normal' | 'completed' = 'normal';
    if (diffDays <= 7) urgencyLevel = 'urgent';
    else if (diffDays <= 21) urgencyLevel = 'near';

    return {
      liveStatus: 'upcoming',
      statusBadgeText: 'Akan Bermula',
      countdownDays: diffDays,
      countdownLabel: label,
      formattedRange,
      isToday,
      isOngoing: false,
      isCompleted: false,
      isUpcoming: true,
      urgencyLevel,
    };
  }

  // 2. Between Start Date and End Date -> Ongoing
  if (todayMs >= startMs && todayMs <= endMs) {
    const remainingDays = Math.max(0, Math.round((endMs - todayMs) / oneDayMs));
    let label = 'Sedang berlangsung';
    if (remainingDays === 0) {
      label = 'Hari terakhir peperiksaan';
    } else if (remainingDays === 1) {
      label = '1 hari lagi tamat';
    } else {
      label = `${remainingDays} hari berbaki`;
    }

    return {
      liveStatus: 'ongoing',
      statusBadgeText: 'Sedang Berlangsung',
      countdownDays: remainingDays,
      countdownLabel: label,
      formattedRange,
      isToday: todayMs === startMs,
      isOngoing: true,
      isCompleted: false,
      isUpcoming: false,
      urgencyLevel: 'urgent',
    };
  }

  // 3. After End Date -> Completed
  return {
    liveStatus: 'completed',
    statusBadgeText: exam.initialStatusNotice || 'Telah Selesai',
    countdownDays: 0,
    countdownLabel: exam.initialStatusNotice || 'Telah selesai',
    formattedRange,
    isToday: false,
    isOngoing: false,
    isCompleted: true,
    isUpcoming: false,
    urgencyLevel: 'completed',
  };
}

/**
 * Returns distinct categories from list of exams
 */
export function getDistinctCategories(exams: ExamCalendarItem[]): string[] {
  const baseCategories = ['SPM', 'UPKK/KAFA', 'SPPIM'];
  const fromExams = exams.map((e) => e.category).filter(Boolean);
  return Array.from(new Set([...baseCategories, ...fromExams]));
}

/**
 * Category styling badges
 */
export function getCategoryBadgeStyle(category: string): {
  bg: string;
  text: string;
  border: string;
  indicator: string;
} {
  const cat = (category || '').toUpperCase();
  if (cat.includes('SPM')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      indicator: 'bg-emerald-500',
    };
  }
  if (cat.includes('UPKK') || cat.includes('KAFA')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      indicator: 'bg-amber-500',
    };
  }
  if (cat.includes('SPPIM') || cat.includes('MUSLEH')) {
    return {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      indicator: 'bg-blue-500',
    };
  }
  return {
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
    indicator: 'bg-purple-500',
  };
}

export interface LiveDigitalCountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  statusBadge: string;
  isToday: boolean;
  progressPercent: number;
}

/**
 * Returns UTC timestamp for a given date in Asia/Kuala_Lumpur (UTC+8)
 */
export function getMalaysiaTargetTimestamp(dateStr: string, hour = 8, minute = 0, second = 0): number {
  if (!dateStr) return 0;
  const parts = dateStr.trim().split('-');
  if (parts.length < 3) return new Date(dateStr).getTime();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  // Asia/Kuala_Lumpur is UTC+8: subtract 8 hours from UTC to match local 08:00
  return Date.UTC(year, month, day, hour - 8, minute, second);
}

/**
 * Calculates live ticking countdown for an exam down to the exact second.
 */
export function calculateLiveDigitalCountdown(
  startDateStr: string,
  endDateStr?: string,
  nowMs: number = Date.now()
): LiveDigitalCountdownResult {
  const startMs = getMalaysiaTargetTimestamp(startDateStr, 8, 0, 0); // 8:00 AM on start date
  const endMs = getMalaysiaTargetTimestamp(endDateStr || startDateStr, 17, 0, 0); // 5:00 PM on end date

  // 1. Upcoming
  if (nowMs < startMs) {
    const diffMs = Math.max(0, startMs - nowMs);
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      status: 'upcoming',
      statusBadge: days === 0 ? 'Bermula Hari Ini' : `${days} Hari Lagi`,
      isToday: days === 0,
      progressPercent: 0,
    };
  }

  // 2. Ongoing
  if (nowMs >= startMs && nowMs <= endMs) {
    const diffMs = Math.max(0, endMs - nowMs);
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const totalDuration = Math.max(1, endMs - startMs);
    const elapsed = nowMs - startMs;
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      status: 'ongoing',
      statusBadge: 'Sedang Berlangsung',
      isToday: false,
      progressPercent,
    };
  }

  // 3. Completed
  return {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    status: 'completed',
    statusBadge: 'Telah Selesai',
    isToday: false,
    progressPercent: 100,
  };
}
