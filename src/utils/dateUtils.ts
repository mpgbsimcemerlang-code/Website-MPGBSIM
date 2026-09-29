/**
 * Utility functions for parsing, formatting, and sorting dates,
 * with full support for Bahasa Melayu date formats, ISO dates, and standard date pickers.
 */

const MALAY_MONTHS: Record<string, number> = {
  januari: 0,
  jan: 0,
  februari: 1,
  feb: 1,
  mac: 2,
  april: 3,
  apr: 3,
  mei: 4,
  may: 4,
  jun: 5,
  june: 5,
  julai: 6,
  jul: 6,
  july: 6,
  ogos: 7,
  ogo: 7,
  aug: 7,
  august: 7,
  september: 8,
  sep: 8,
  sept: 8,
  oktober: 9,
  okt: 9,
  oct: 9,
  october: 9,
  november: 10,
  nov: 10,
  disember: 11,
  dis: 11,
  dec: 11,
  december: 11,
};

const MALAY_MONTH_NAMES = [
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
 * Parses any date string (Malay text "14 September 2026", ISO "2026-09-14", DD/MM/YYYY, etc.)
 * into a valid JavaScript Date object. Returns null if invalid.
 */
export function parseMalayDateToDate(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // 1. Try standard ISO format YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Try DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }

  // 3. Try Malay text: "14 September 2026" or "14 Sep 2026"
  const textMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthKey = textMatch[2].toLowerCase();
    const year = parseInt(textMatch[3], 10);
    if (monthKey in MALAY_MONTHS) {
      const month = MALAY_MONTHS[monthKey];
      const d = new Date(year, month, day, 12, 0, 0);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 4. Try standard new Date(trimmed)
  const directDate = new Date(trimmed);
  if (!isNaN(directDate.getTime())) {
    return directDate;
  }

  return null;
}

/**
 * Returns a millisecond timestamp representing the published date for a news item,
 * with fallbacks to createdAt or scheduleDate.
 */
export function parseNewsDateToTimestamp(
  item: { date?: string; createdAt?: string; scheduleDate?: string } | string | undefined | null
): number {
  if (!item) return 0;
  if (typeof item === 'string') {
    const d = parseMalayDateToDate(item);
    return d ? d.getTime() : 0;
  }

  if (item.date) {
    const d = parseMalayDateToDate(item.date);
    if (d) return d.getTime();
  }

  if (item.createdAt) {
    const d = new Date(item.createdAt);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  if (item.scheduleDate) {
    const d = new Date(item.scheduleDate);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  return 0;
}

/**
 * Sorts news items in descending order of published date (latest published date first).
 * Optionally keeps featured news item prioritized at the very top.
 */
export function sortNewsByPublishedDate<T extends Record<string, any>>(
  newsList: T[],
  options?: { prioritizeFeatured?: boolean }
): T[] {
  if (!Array.isArray(newsList)) return [];

  return [...newsList].sort((a, b) => {
    if (options?.prioritizeFeatured) {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
    }

    const timeA = parseNewsDateToTimestamp(a);
    const timeB = parseNewsDateToTimestamp(b);

    if (timeB !== timeA) {
      return timeB - timeA; // Most recent date first
    }

    // Secondary fallback: createdAt
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createdB - createdA;
  });
}

/**
 * Converts any date representation into HTML input format "YYYY-MM-DD"
 */
export function toInputDateFormat(dateStr?: string | null): string {
  if (!dateStr) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const parsed = parseMalayDateToDate(dateStr);
  if (!parsed) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converts "YYYY-MM-DD" or Date object into standard Malay format like "25 September 2026"
 */
export function formatToMalayDate(dateVal?: string | Date | null): string {
  if (!dateVal) return '';

  let dateObj: Date | null = null;
  if (dateVal instanceof Date) {
    dateObj = dateVal;
  } else {
    dateObj = parseMalayDateToDate(dateVal);
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return typeof dateVal === 'string' ? dateVal : '';
  }

  const day = dateObj.getDate();
  const monthName = MALAY_MONTH_NAMES[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${monthName} ${year}`;
}
