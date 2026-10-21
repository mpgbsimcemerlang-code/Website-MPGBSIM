import {
  BirthdayMemberOverride,
  BirthdaySettingsConfig,
  MemberApplication,
  MemberSchool,
  ContactSubmission,
} from '../types';

export const KUALA_LUMPUR_TIMEZONE = 'Asia/Kuala_Lumpur';

export const MALAY_MONTH_NAMES: Record<number, string> = {
  1: 'Januari',
  2: 'Februari',
  3: 'Mac',
  4: 'April',
  5: 'Mei',
  6: 'Jun',
  7: 'Julai',
  8: 'Ogos',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Disember',
};

export const DEFAULT_BIRTHDAY_TEMPLATES: string[] = [
  'Selamat Hari Lahir kepada [Nama Ahli]. Semoga dikurniakan kesihatan yang baik, dipermudahkan segala urusan, dilimpahi keberkatan dan terus diberi kekuatan untuk memimpin serta memartabatkan pendidikan Islam. Ikhlas daripada MPGBSIM.',
  'Sanah Helwah dan Selamat Hari Lahir diucapkan kepada [Nama Ahli], [Jawatan] [Sekolah]. Semoga Allah SWT merahmati usia, melapangkan rezeki serta mengurniakan hikmah berterusan dalam menerajui kecemerlangan institusi pendidikan Islam. Ikhlas daripada MPGBSIM.',
  'Selamat menyambut ulang tahun kelahiran buat [Nama Ahli]. Semoga sentiasa berada dalam lindungan dan rahmat Ilahi, dikurniakan kesihatan yang afiat serta terus istiqamah melahirkan generasi Rabbani di [Sekolah]. Ikhlas daripada Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM).',
  'Ucapan setulus penghargaan dan Selamat Hari Lahir kepada [Nama Ahli]. Semoga setiap langkah kepimpinan di [Sekolah] diberkati Allah SWT, dipermudahkan segala urusan pentadbiran dan terus cemerlang memartabatkan pendidikan Islam tanah air. Ikhlas daripada MPGBSIM.',
  'Selamat Hari Lahir kepada [Nama Ahli] ([Jawatan]). Doa kami agar dikurniakan kesejahteraan berpanjangan, kekuatan jiwa serta ilham kepimpinan yang segar dalam membangunkan modal insan berteraskan nilai Islam. Salam takzim daripada MPGBSIM.',
];

export const DEFAULT_BIRTHDAY_SETTINGS: BirthdaySettingsConfig = {
  enabled: true,
  showOnPublicWebsite: true,
  showOnMemberPortal: true,
  upcomingDaysWindow: 7,
  showMemberName: true,
  showSchoolName: true,
  showPosition: true,
  showState: true,
  showPhoto: true,
  sectionTitlePublic: 'Sambutan Hari Lahir Ahli MPGBSIM',
  sectionSubtitlePublic:
    'Merai dan mendoakan kesejahteraan barisan Pengetua serta Guru Besar Sekolah-Sekolah Islam Malaysia yang menyambut ulang tahun kelahiran.',
  emptyTodayMessagePublic:
    'Tiada sambutan hari lahir ahli Pengetua atau Guru Besar yang direkodkan pada hari ini. Seluruh warga MPGBSIM sentiasa mendoakan kesihatan, keberkatan usia dan kecemerlangan berterusan buat semua pimpinan sekolah ahli.',
  greetingTemplates: DEFAULT_BIRTHDAY_TEMPLATES,
  memberOverrides: {},
};

export interface KualaLumpurDateParts {
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
  isoDate: string; // YYYY-MM-DD
}

/**
 * Mendapatkan tarikh semasa mengikut zon waktu rasmi Asia/Kuala_Lumpur.
 */
export function getKualaLumpurDateParts(referenceDate: Date = new Date()): KualaLumpurDateParts {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: KUALA_LUMPUR_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(referenceDate);
    const year = parseInt(parts.find((p) => p.type === 'year')?.value || '', 10);
    const month = parseInt(parts.find((p) => p.type === 'month')?.value || '', 10);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '', 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return {
        year,
        month,
        day,
        isoDate: `${year}-${mm}-${dd}`,
      };
    }
  } catch {
    // Fallback jika Intl timezone tidak disokong
  }

  // Fallback pengiraan manual UTC+8 (Asia/Kuala_Lumpur)
  const utcMs = referenceDate.getTime() + referenceDate.getTimezoneOffset() * 60000;
  const klDate = new Date(utcMs + 8 * 3600000);
  const year = klDate.getFullYear();
  const month = klDate.getMonth() + 1;
  const day = klDate.getDate();
  return {
    year,
    month,
    day,
    isoDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

/**
 * Semak sama ada tahun tersebut ialah tahun lompat (Leap Year).
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Dapatkan bilangan hari maksimum yang sah bagi bulan dan tahun tertentu.
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0;
  const daysPerMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysPerMonth[month - 1];
}

/**
 * Sahkan sama ada kombinasi tahun, bulan dan hari ialah tarikh kalendar yang wujud.
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  const maxDays = getDaysInMonth(year, month);
  return day >= 1 && day <= maxDays;
}

export type CenturyConfidence = 'verified' | 'high' | 'medium' | 'low';

export interface ParsedBirthDateResult {
  isValid: boolean;
  birthYear?: number;
  birthMonth?: number; // 1 - 12
  birthDay?: number; // 1 - 31
  isoBirthDate?: string; // YYYY-MM-DD
  monthDayKey?: string; // MM-DD
  formattedDayMonth?: string; // cth: "22 Jun"
  formattedFullDate?: string; // cth: "22 Jun 1987" (Hanya untuk semakan dalaman Admin CMS, BUKAN paparan awam)
  centuryConfidence?: CenturyConfidence;
  needsCenturyConfirmation?: boolean;
  source?: 'VERIFIED_DATE' | 'IC_NUMBER' | 'CACHED_MONTH_DAY' | 'NONE';
  errorReason?: string;
}

/**
 * Tentukan abad kelahiran (1900 vs 2000) secara jelas dan konsisten
 * berdasarkan julat umur munasabah populasi ahli Pengetua / Guru Besar (PGB).
 *
 * Peraturan:
 * - Jika Admin telah menetapkan centuryOverride (1900 atau 2000), gunakan nilai tersebut.
 * - Populasi PGB yang munasabah adalah berumur sekurang-kurangnya 22 tahun hingga 86 tahun.
 * - Bagi YY >= 40 (cth: 40..99 -> 1940..1999): Abad 1900 dengan keyakinan tinggi ('high').
 * - Bagi YY di mana 2000 + YY <= currentYear - 22 (cth: 00..04 pada 2026 -> 2000..2004, umur 22-26):
 *   Abad 2000 dipilih tetapi ditandakan `needsCenturyConfirmation: true` supaya Admin CMS boleh mengesahkan.
 * - Bagi YY di mana 2000 + YY > currentYear - 22 dan YY < 40 (cth: 05..39 pada 2026):
 *   Tahun 2005..2039 adalah bawah umur (<22 tahun) atau masa hadapan, maka abad ditetapkan kepada 1900 (1905..1939)
 *   dan ditandakan `needsCenturyConfirmation: true` untuk semakan Admin CMS.
 */
export function resolveBirthCentury(
  yy: number,
  currentYear: number = getKualaLumpurDateParts().year,
  centuryOverride?: 1900 | 2000
): { fullYear: number; confidence: CenturyConfidence; needsConfirmation: boolean } {
  if (centuryOverride === 1900 || centuryOverride === 2000) {
    return {
      fullYear: centuryOverride + yy,
      confidence: 'verified',
      needsConfirmation: false,
    };
  }

  const minAdultBirthYear = currentYear - 22; // Cth: 2026 - 22 = 2004
  const candidate2000 = 2000 + yy;
  const candidate1900 = 1900 + yy;

  if (yy >= 40 && yy <= 99) {
    return {
      fullYear: candidate1900,
      confidence: 'high',
      needsConfirmation: false,
    };
  }

  if (candidate2000 <= minAdultBirthYear) {
    // Contoh: YY = 00..04 pada tahun 2026 (Lahir 2000..2004, umur 22..26 tahun)
    return {
      fullYear: candidate2000,
      confidence: 'medium',
      needsConfirmation: true,
    };
  }

  // Bagi YY = 05..39, 20YY menghasilkan umur < 22 atau tarikh masa hadapan, jadi mestilah 19YY
  return {
    fullYear: candidate1900,
    confidence: 'low',
    needsConfirmation: true,
  };
}

/**
 * Format hari dan bulan kepada Bahasa Melayu yang mesra pembaca (tanpa tahun kelahiran).
 * Contoh: (6, 22) -> "22 Jun"
 */
export function formatReadableDayMonth(month: number, day: number): string {
  const monthName = MALAY_MONTH_NAMES[month];
  if (!monthName || day < 1 || day > 31) return '-';
  return `${day} ${monthName}`;
}

/**
 * Membaca enam digit pertama (YYMMDD) daripada nombor kad pengenalan Malaysia (`icNumber`).
 *
 * Peraturan:
 * 1. Mengesahkan format nombor kad pengenalan terlebih dahulu (12 digit angka standard Malaysia,
 *    atau 6 digit tarikh YYMMDD apabila diuji secara langsung).
 * 2. Mengambil 6 digit pertama sahaja (YYMMDD).
 * 3. Menentukan abad dengan `resolveBirthCentury`.
 * 4. Mengesahkan bulan (01-12) dan hari mengikut kalendar sebenar (termasuk tahun lompat 29 Feb).
 * 5. Tidak sesekali mengubah nilai asal `icNumber` atau mereka tarikh lahir jika tidak sah.
 */
export function parseBirthDateFromIc(
  rawIc?: string | null,
  options?: {
    currentYear?: number;
    centuryOverride?: 1900 | 2000;
    allowSixDigitPrefix?: boolean;
  }
): ParsedBirthDateResult {
  if (!rawIc || typeof rawIc !== 'string') {
    return { isValid: false, source: 'NONE', errorReason: 'Tiada nombor kad pengenalan' };
  }

  const trimmed = rawIc.trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'tiada') {
    return { isValid: false, source: 'NONE', errorReason: 'Nombor kad pengenalan kosong' };
  }

  // Pastikan hanya digit, sengkang (-), atau ruang dibenarkan sebelum pembersihan
  if (!/^[0-9\s-]+$/.test(trimmed)) {
    return {
      isValid: false,
      source: 'NONE',
      errorReason: 'Format nombor kad pengenalan mengandungi aksara tidak sah',
    };
  }

  const cleanDigits = trimmed.replace(/[\s-]/g, '');

  // Format KP Malaysia mestilah 12 digit (atau 6 digit YYMMDD jika dibenarkan untuk ujian spesifikasi)
  const allowSix = options?.allowSixDigitPrefix ?? true;
  if (cleanDigits.length !== 12 && !(allowSix && cleanDigits.length === 6)) {
    return {
      isValid: false,
      source: 'NONE',
      errorReason: 'Panjang nombor kad pengenalan tidak sah',
    };
  }

  // Tolak nombor semua sifar atau dummy seperti 000000000000 / 123456121234 (bulan 34 dsb akan ditolak di bawah)
  if (/^0+$/.test(cleanDigits)) {
    return {
      isValid: false,
      source: 'NONE',
      errorReason: 'Nombor kad pengenalan tidak sah',
    };
  }

  // Jika 12 digit, semak kod negeri/tempat lahir (digit ke-7 dan ke-8 tidak boleh '00' atau '99' jika kesemuanya palsu)
  if (cleanDigits.length === 12) {
    const pbCode = cleanDigits.slice(6, 8);
    if (pbCode === '00') {
      return {
        isValid: false,
        source: 'NONE',
        errorReason: 'Kod tempat lahir kad pengenalan tidak sah',
      };
    }
  }

  // Ambil 6 digit pertama sahaja (YYMMDD)
  const sixDigits = cleanDigits.slice(0, 6);
  const yy = parseInt(sixDigits.slice(0, 2), 10);
  const mm = parseInt(sixDigits.slice(2, 4), 10);
  const dd = parseInt(sixDigits.slice(4, 6), 10);

  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) {
    return {
      isValid: false,
      source: 'NONE',
      errorReason: '6 digit pertama kad pengenalan bukan angka yang sah',
    };
  }

  // Sahkan bulan terlebih dahulu (1 - 12)
  if (mm < 1 || mm > 12) {
    return {
      isValid: false,
      source: 'NONE',
      errorReason: `Bulan kelahiran tidak sah (${String(mm).padStart(2, '0')})`,
    };
  }

  const currentYear = options?.currentYear ?? getKualaLumpurDateParts().year;
  const { fullYear, confidence, needsConfirmation } = resolveBirthCentury(
    yy,
    currentYear,
    options?.centuryOverride
  );

  // Sahkan tarikh kalendar sebenar (termasuk semakan 29 Februari pada tahun lompat)
  if (!isValidCalendarDate(fullYear, mm, dd)) {
    return {
      isValid: false,
      source: 'NONE',
      errorReason: `Tarikh kalendar tidak wujud (${dd}/${mm}/${fullYear})`,
    };
  }

  const mmStr = String(mm).padStart(2, '0');
  const ddStr = String(dd).padStart(2, '0');
  const formattedDayMonth = formatReadableDayMonth(mm, dd);

  return {
    isValid: true,
    birthYear: fullYear,
    birthMonth: mm,
    birthDay: dd,
    isoBirthDate: `${fullYear}-${mmStr}-${ddStr}`,
    monthDayKey: `${mmStr}-${ddStr}`,
    formattedDayMonth,
    formattedFullDate: `${ formattedDayMonth } ${fullYear}`,
    centuryConfidence: confidence,
    needsCenturyConfirmation: needsConfirmation,
    source: 'IC_NUMBER',
  };
}

/**
 * Mengesahkan dan menghurai medan tarikh lahir yang telah disahkan (`verifiedBirthDate`, format YYYY-MM-DD).
 */
export function parseVerifiedBirthDate(verifiedDateStr?: string | null): ParsedBirthDateResult {
  if (!verifiedDateStr || typeof verifiedDateStr !== 'string') {
    return { isValid: false, source: 'NONE' };
  }
  const trimmed = verifiedDateStr.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return { isValid: false, source: 'NONE', errorReason: 'Format tarikh lahir mestilah YYYY-MM-DD' };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (!isValidCalendarDate(year, month, day)) {
    return { isValid: false, source: 'NONE', errorReason: 'Tarikh kalendar yang disahkan tidak wujud' };
  }

  const mmStr = String(month).padStart(2, '0');
  const ddStr = String(day).padStart(2, '0');
  const formattedDayMonth = formatReadableDayMonth(month, day);

  return {
    isValid: true,
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    isoBirthDate: `${year}-${mmStr}-${ddStr}`,
    monthDayKey: `${mmStr}-${ddStr}`,
    formattedDayMonth,
    formattedFullDate: `${formattedDayMonth} ${year}`,
    centuryConfidence: 'verified',
    needsCenturyConfirmation: false,
    source: 'VERIFIED_DATE',
  };
}

/**
 * Menghurai bulan dan hari sahaja (`MM-DD`) daripada cache tempatan tanpa IC atau tahun kelahiran.
 */
export function parseCachedMonthDay(monthDayStr?: string | null): ParsedBirthDateResult {
  if (!monthDayStr || typeof monthDayStr !== 'string') {
    return { isValid: false, source: 'NONE' };
  }
  const match = monthDayStr.trim().match(/^(\d{2})-(\d{2})$/);
  if (!match) return { isValid: false, source: 'NONE' };

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  // Gunakan tahun lompat 2024 supaya 02-29 kekal sah
  if (!isValidCalendarDate(2024, month, day)) {
    return { isValid: false, source: 'NONE' };
  }

  const mmStr = String(month).padStart(2, '0');
  const ddStr = String(day).padStart(2, '0');
  return {
    isValid: true,
    birthMonth: month,
    birthDay: day,
    monthDayKey: `${mmStr}-${ddStr}`,
    formattedDayMonth: formatReadableDayMonth(month, day),
    centuryConfidence: 'high',
    needsCenturyConfirmation: false,
    source: 'CACHED_MONTH_DAY',
  };
}

/**
 * Mengutamakan `verifiedBirthDate` jika tersedia, dan menggunakan `icNumber` sebagai sumber sandaran.
 */
export function resolveMemberBirthInfo(params: {
  verifiedBirthDate?: string | null;
  icNumber?: string | null;
  cachedBirthMonthDay?: string | null;
  centuryOverride?: 1900 | 2000;
  currentYear?: number;
}): ParsedBirthDateResult {
  // 1. Utamakan tarikh lahir yang telah disahkan (Admin CMS / Ahli)
  if (params.verifiedBirthDate) {
    const verified = parseVerifiedBirthDate(params.verifiedBirthDate);
    if (verified.isValid) return verified;
  }

  // 2. Sumber sandaran: Nombor Kad Pengenalan (6 digit pertama)
  if (params.icNumber) {
    const fromIc = parseBirthDateFromIc(params.icNumber, {
      currentYear: params.currentYear,
      centuryOverride: params.centuryOverride,
      allowSixDigitPrefix: true,
    });
    if (fromIc.isValid) return fromIc;
  }

  // 3. Sumber sandaran cache tanpa PII (MM-DD sahaja)
  if (params.cachedBirthMonthDay) {
    const fromCache = parseCachedMonthDay(params.cachedBirthMonthDay);
    if (fromCache.isValid) return fromCache;
  }

  return {
    isValid: false,
    source: 'NONE',
    errorReason: 'Tarikh lahir belum dikenal pasti',
  };
}

/**
 * Menentukan tarikh sambutan bagi tahun sasaran.
 * Jika ahli lahir pada 29 Februari:
 * - Pada tahun lompat: disambut pada 29 Februari.
 * - Pada tahun bukan lompat: disambut pada 28 Februari.
 */
export function getCelebrationMonthDayForYear(
  birthMonth: number,
  birthDay: number,
  targetYear: number
): { month: number; day: number; isLeapAdjusted: boolean } {
  if (birthMonth === 2 && birthDay === 29 && !isLeapYear(targetYear)) {
    return { month: 2, day: 28, isLeapAdjusted: true };
  }
  return { month: birthMonth, day: birthDay, isLeapAdjusted: false };
}

export interface BirthdayScheduleEvaluation {
  isBirthdayToday: boolean;
  isUpcoming: boolean;
  hasPassedThisYear: boolean;
  daysUntilBirthday: number; // 0 jika hari ini, 1 jika esok, dsb.
  celebrationMonth: number;
  celebrationDay: number;
  celebrationYear: number;
  isLeapAdjusted: boolean;
  readableCelebrationDate: string; // cth: "22 Jun" atau "29 Februari (Disambut 28 Februari)"
}

/**
 * Mengira status sambutan hari lahir seseorang ahli berbanding tarikh hari ini (Asia/Kuala_Lumpur).
 */
export function evaluateMemberBirthdaySchedule(
  birthMonth: number,
  birthDay: number,
  referenceKlDate: KualaLumpurDateParts = getKualaLumpurDateParts(),
  upcomingWindowDays: number = 7
): BirthdayScheduleEvaluation {
  const { year: todayYear, month: todayMonth, day: todayDay } = referenceKlDate;

  const thisYearCelebration = getCelebrationMonthDayForYear(birthMonth, birthDay, todayYear);

  const todayUtcMs = Date.UTC(todayYear, todayMonth - 1, todayDay);
  const thisYearCelebrationUtcMs = Date.UTC(
    todayYear,
    thisYearCelebration.month - 1,
    thisYearCelebration.day
  );

  if (thisYearCelebrationUtcMs === todayUtcMs) {
    const baseLabel = formatReadableDayMonth(birthMonth, birthDay);
    return {
      isBirthdayToday: true,
      isUpcoming: false,
      hasPassedThisYear: false,
      daysUntilBirthday: 0,
      celebrationMonth: thisYearCelebration.month,
      celebrationDay: thisYearCelebration.day,
      celebrationYear: todayYear,
      isLeapAdjusted: thisYearCelebration.isLeapAdjusted,
      readableCelebrationDate: thisYearCelebration.isLeapAdjusted
        ? `${baseLabel} (Sambutan 28 Februari)`
        : baseLabel,
    };
  }

  let nextCelebrationYear = todayYear;
  let nextCelebration = thisYearCelebration;
  let hasPassedThisYear = false;

  if (thisYearCelebrationUtcMs < todayUtcMs) {
    hasPassedThisYear = true;
    nextCelebrationYear = todayYear + 1;
    nextCelebration = getCelebrationMonthDayForYear(birthMonth, birthDay, nextCelebrationYear);
  }

  const nextUtcMs = Date.UTC(
    nextCelebrationYear,
    nextCelebration.month - 1,
    nextCelebration.day
  );
  const daysUntilBirthday = Math.round((nextUtcMs - todayUtcMs) / 86400000);
  const isUpcoming = daysUntilBirthday >= 1 && daysUntilBirthday <= upcomingWindowDays;
  const baseLabel = formatReadableDayMonth(birthMonth, birthDay);

  return {
    isBirthdayToday: false,
    isUpcoming,
    hasPassedThisYear,
    daysUntilBirthday,
    celebrationMonth: nextCelebration.month,
    celebrationDay: nextCelebration.day,
    celebrationYear: nextCelebrationYear,
    isLeapAdjusted: nextCelebration.isLeapAdjusted,
    readableCelebrationDate: nextCelebration.isLeapAdjusted
      ? `${baseLabel} (Disambut 28 Februari)`
      : baseLabel,
  };
}

/**
 * Bersihkan gelaran jawatan dalam kurungan pada nama ahli supaya tidak berulang
 * Contoh: "Masitah Binti Seikh Omar (Pengetua)" -> "Masitah Binti Seikh Omar"
 */
export function cleanMemberDisplayName(rawName?: string): string {
  if (!rawName) return 'Ahli Kepimpinan MPGBSIM';
  return rawName
    .replace(/\s*\((pengetua|guru besar|pemangku pengetua|pk pentadbiran)\)\s*/gi, '')
    .trim();
}

/**
 * Menjana ucapan hari lahir Bahasa Melayu yang sopan dan profesional daripada senarai templat.
 * Variasi dipilih secara deterministik berdasarkan gabungan ID ahli dan tarikh supaya
 * pelbagai dan konsisten tanpa memanggil AI API.
 */
export function generateBirthdayGreeting(params: {
  memberKey: string;
  memberName: string;
  position?: string;
  schoolName?: string;
  state?: string;
  templates?: string[];
  customGreeting?: string;
  dateSeed?: string; // YYYY-MM-DD
  showPosition?: boolean;
  showSchoolName?: boolean;
}): string {
  const cleanName = cleanMemberDisplayName(params.memberName);
  const pos = params.showPosition !== false && params.position ? params.position.trim() : 'Pimpinan Sekolah Islam';
  const school = params.showSchoolName !== false && params.schoolName ? params.schoolName.trim() : 'institusi pendidikan Islam MPGBSIM';
  const state = params.state ? params.state.trim() : 'Malaysia';

  const applyPlaceholders = (tpl: string): string => {
    return tpl
      .replace(/\[Nama Ahli\]/gi, cleanName)
      .replace(/\[Jawatan\]/gi, pos)
      .replace(/\[Sekolah\]/gi, school)
      .replace(/\[Negeri\]/gi, state)
      .replace(/\s+/g, ' ')
      .trim();
  };

  if (params.customGreeting && params.customGreeting.trim().length > 0) {
    return applyPlaceholders(params.customGreeting.trim());
  }

  const validTemplates =
    params.templates && params.templates.filter((t) => t && t.trim().length > 0).length > 0
      ? params.templates.filter((t) => t && t.trim().length > 0)
      : DEFAULT_BIRTHDAY_TEMPLATES;

  const seedStr = `${params.memberKey || cleanName}-${params.dateSeed || getKualaLumpurDateParts().isoDate}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }

  const chosenTemplate = validTemplates[hash % validTemplates.length];
  return applyPlaceholders(chosenTemplate);
}

/**
 * Menutup (masking) nombor kad pengenalan supaya nombor penuh tidak pernah terdedah
 * dalam senarai CMS atau paparan profil.
 * Contoh: "870622-01-5123" -> "••••••-••-5123"
 */
export function maskIcNumber(rawIc?: string | null): string {
  if (!rawIc || typeof rawIc !== 'string') return 'Tidak Dinyatakan';
  const digits = rawIc.replace(/[\s-]/g, '');
  if (digits.length < 4) return '••••••••••••';
  return `••••••-••-${digits.slice(-4)}`;
}

/**
 * Struktur data awam & portal yang selamat (TANPA icNumber penuh dan TANPA tahun kelahiran).
 */
export interface PublicSafeBirthdayMember {
  memberKey: string;
  schoolId: string;
  schoolCode: string;
  memberName: string;
  position: string;
  schoolName: string;
  state: string;
  photoUrl: string;
  birthMonth: number;
  birthDay: number;
  monthDayKey: string; // MM-DD
  formattedDayMonth: string; // cth: "22 Jun"
  readableCelebrationDate: string; // cth: "22 Jun"
  isBirthdayToday: boolean;
  isUpcoming: boolean;
  hasPassedThisYear: boolean;
  daysUntilBirthday: number;
  isLeapAdjusted: boolean;
  greetingText: string;
  source: 'VERIFIED_DATE' | 'IC_NUMBER' | 'CACHED_MONTH_DAY';
  centuryConfidence: CenturyConfidence;
  needsCenturyConfirmation: boolean;
}

/**
 * Membina senarai sambutan hari lahir daripada data ahli sedia ada tanpa menulis semula ke Firestore
 * dan tanpa mendedahkan nombor kad pengenalan atau tahun kelahiran.
 */
export function buildSafeBirthdayRoster(params: {
  schools: MemberSchool[];
  applications?: MemberApplication[];
  submissions?: ContactSubmission[];
  memberProfilesMap?: Record<string, { icNumber?: string; verifiedBirthDate?: string; fullName?: string; photoURL?: string }>;
  settings?: BirthdaySettingsConfig;
  referenceDate?: Date;
}): {
  todayBirthdays: PublicSafeBirthdayMember[];
  upcomingBirthdays: PublicSafeBirthdayMember[];
  allIdentifiedBirthdays: PublicSafeBirthdayMember[];
  unidentifiedCount: number;
  hiddenCount: number;
  needsReviewCount: number;
  referenceKlDate: KualaLumpurDateParts;
} {
  const settings = params.settings || DEFAULT_BIRTHDAY_SETTINGS;
  const klDate = getKualaLumpurDateParts(params.referenceDate);
  const apps = params.applications || [];
  const subs = params.submissions || [];
  const profilesMap = params.memberProfilesMap || {};
  const overrides = settings.memberOverrides || {};

  const todayBirthdays: PublicSafeBirthdayMember[] = [];
  const upcomingBirthdays: PublicSafeBirthdayMember[] = [];
  const allIdentifiedBirthdays: PublicSafeBirthdayMember[] = [];
  let unidentifiedCount = 0;
  let hiddenCount = 0;
  let needsReviewCount = 0;

  for (const sch of params.schools || []) {
    if (!sch || (!sch.id && !sch.code)) continue;
    const memberKey = sch.code || sch.id;
    const override: BirthdayMemberOverride | undefined =
      overrides[memberKey] || overrides[sch.id] || overrides[sch.code];

    if (override?.hiddenFromBirthday) {
      hiddenCount += 1;
      continue;
    }

    const codeNorm = (sch.code || '').trim().toLowerCase();
    const nameNorm = (sch.name || '').trim().toLowerCase();
    const emailNorm = (sch.pgbEmail || sch.email || '').trim().toLowerCase();
    const principalNorm = cleanMemberDisplayName(sch.principal).toLowerCase();

    // Padankan permohonan sekiranya icNumber ada dalam memberApplications
    const matchedApp = apps.find((a) => {
      const aCode = (a.schoolCode || '').trim().toLowerCase();
      const aName = (a.schoolName || '').trim().toLowerCase();
      const aEmail = (a.email || a.pgbEmail || '').trim().toLowerCase();
      const aFullName = cleanMemberDisplayName(a.fullName).toLowerCase();
      return (
        (codeNorm && aCode && aCode === codeNorm) ||
        (nameNorm && aName && aName === nameNorm) ||
        (emailNorm && aEmail && aEmail === emailNorm) ||
        (principalNorm && aFullName && (principalNorm.includes(aFullName) || aFullName.includes(principalNorm)))
      );
    });

    // Padankan profil portal sekiranya ada
    const matchedProfile =
      profilesMap[codeNorm] ||
      profilesMap[sch.id] ||
      (emailNorm ? profilesMap[emailNorm] : undefined);

    // Semak submissions jika ada rekod pendaftaran awal
    let subIc = '';
    if (!sch.icNumber && !matchedApp?.icNumber && !matchedProfile?.icNumber) {
      for (const sub of subs) {
        const msg = sub.message || '';
        const kpMatch = msg.match(/No\s*KP:\s*([0-9A-Za-z-]{6,20})/i);
        if (!kpMatch || !kpMatch[1] || kpMatch[1] === '-') continue;
        const msgLower = msg.toLowerCase();
        if (
          (codeNorm && msgLower.includes(`(${codeNorm})`)) ||
          (nameNorm && msgLower.includes(nameNorm))
        ) {
          subIc = kpMatch[1].trim();
          break;
        }
      }
    }

    const verifiedBirthDate =
      override?.verifiedBirthDate ||
      (sch as any).verifiedBirthDate ||
      matchedProfile?.verifiedBirthDate ||
      undefined;

    const rawIc =
      sch.icNumber ||
      matchedProfile?.icNumber ||
      matchedApp?.icNumber ||
      subIc ||
      undefined;

    const cachedBirthMonthDay = (sch as any).cachedBirthMonthDay || undefined;

    const parsed = resolveMemberBirthInfo({
      verifiedBirthDate,
      icNumber: rawIc,
      cachedBirthMonthDay,
      centuryOverride: override?.centuryOverride,
      currentYear: klDate.year,
    });

    if (!parsed.isValid || !parsed.birthMonth || !parsed.birthDay) {
      unidentifiedCount += 1;
      continue;
    }

    if (parsed.needsCenturyConfirmation) {
      needsReviewCount += 1;
    }

    const schedule = evaluateMemberBirthdaySchedule(
      parsed.birthMonth,
      parsed.birthDay,
      klDate,
      settings.upcomingDaysWindow || 7
    );

    const displayName = cleanMemberDisplayName(
      matchedProfile?.fullName || sch.principal || matchedApp?.fullName || 'Pengetua / Guru Besar'
    );
    const displayPosition =
      sch.designation ||
      matchedApp?.designation ||
      ((sch.type || '').toLowerCase().includes('rendah') ? 'Guru Besar' : 'Pengetua');
    const displayPhoto =
      sch.principalPhotoUrl ||
      matchedProfile?.photoURL ||
      matchedApp?.pgbPhotoUrl ||
      '';

    const greetingText = generateBirthdayGreeting({
      memberKey,
      memberName: displayName,
      position: displayPosition,
      schoolName: sch.name,
      state: sch.state,
      templates: settings.greetingTemplates,
      customGreeting: override?.customGreeting,
      dateSeed: klDate.isoDate,
      showPosition: settings.showPosition,
      showSchoolName: settings.showSchoolName,
    });

    const safeMember: PublicSafeBirthdayMember = {
      memberKey,
      schoolId: sch.id,
      schoolCode: sch.code || '-',
      memberName: displayName,
      position: displayPosition,
      schoolName: sch.name,
      state: sch.state || 'Malaysia',
      photoUrl: displayPhoto,
      birthMonth: parsed.birthMonth,
      birthDay: parsed.birthDay,
      monthDayKey: parsed.monthDayKey || `${String(parsed.birthMonth).padStart(2, '0')}-${String(parsed.birthDay).padStart(2, '0')}`,
      formattedDayMonth: parsed.formattedDayMonth || formatReadableDayMonth(parsed.birthMonth, parsed.birthDay),
      readableCelebrationDate: schedule.readableCelebrationDate,
      isBirthdayToday: schedule.isBirthdayToday,
      isUpcoming: schedule.isUpcoming,
      hasPassedThisYear: schedule.hasPassedThisYear,
      daysUntilBirthday: schedule.daysUntilBirthday,
      isLeapAdjusted: schedule.isLeapAdjusted,
      greetingText,
      source: parsed.source === 'VERIFIED_DATE' ? 'VERIFIED_DATE' : parsed.source === 'CACHED_MONTH_DAY' ? 'CACHED_MONTH_DAY' : 'IC_NUMBER',
      centuryConfidence: parsed.centuryConfidence || 'high',
      needsCenturyConfirmation: Boolean(parsed.needsCenturyConfirmation),
    };

    allIdentifiedBirthdays.push(safeMember);

    if (schedule.isBirthdayToday) {
      todayBirthdays.push(safeMember);
    } else if (schedule.isUpcoming) {
      upcomingBirthdays.push(safeMember);
    }
  }

  // Susun mengikut tarikh hari lahir yang terdekat
  todayBirthdays.sort((a, b) => a.memberName.localeCompare(b.memberName));
  upcomingBirthdays.sort((a, b) => {
    if (a.daysUntilBirthday !== b.daysUntilBirthday) {
      return a.daysUntilBirthday - b.daysUntilBirthday;
    }
    return a.memberName.localeCompare(b.memberName);
  });
  allIdentifiedBirthdays.sort((a, b) => {
    if (a.daysUntilBirthday !== b.daysUntilBirthday) {
      return a.daysUntilBirthday - b.daysUntilBirthday;
    }
    return a.memberName.localeCompare(b.memberName);
  });

  return {
    todayBirthdays,
    upcomingBirthdays,
    allIdentifiedBirthdays,
    unidentifiedCount,
    hiddenCount,
    needsReviewCount,
    referenceKlDate: klDate,
  };
}

export interface AcceptanceTestCaseResult {
  id: number;
  title: string;
  passed: boolean;
  detail: string;
}

/**
 * Menjalankan 9 ujian penerimaan rasmi seperti yang ditetapkan dalam spesifikasi.
 */
export function runBirthdayAcceptanceTests(): {
  allPassed: boolean;
  results: AcceptanceTestCaseResult[];
} {
  const results: AcceptanceTestCaseResult[] = [];

  // Ujian 1: Ahli yang lahir pada 22 Jun (870622) dipaparkan pada 22 Jun
  const parsed870622 = parseBirthDateFromIc('870622-01-5231', { currentYear: 2026 });
  const schedJune22OnJune22 = evaluateMemberBirthdaySchedule(
    parsed870622.birthMonth || 0,
    parsed870622.birthDay || 0,
    { year: 2026, month: 6, day: 22, isoDate: '2026-06-22' },
    7
  );
  const test1Passed =
    parsed870622.isValid &&
    parsed870622.birthYear === 1987 &&
    parsed870622.birthMonth === 6 &&
    parsed870622.birthDay === 22 &&
    parsed870622.formattedDayMonth === '22 Jun' &&
    schedJune22OnJune22.isBirthdayToday === true &&
    schedJune22OnJune22.daysUntilBirthday === 0;
  results.push({
    id: 1,
    title: 'Ahli yang lahir pada 22 Jun (870622) dipaparkan pada 22 Jun',
    passed: test1Passed,
    detail: `Input 870622-01-5231 -> ${parsed870622.formattedFullDate}, pada 2026-06-22: isBirthdayToday=${schedJune22OnJune22.isBirthdayToday}`,
  });

  // Ujian 2: Ahli yang hari lahirnya esok muncul dalam senarai akan datang
  const schedTomorrow = evaluateMemberBirthdaySchedule(
    3,
    15, // 900315 -> 15 Mac
    { year: 2026, month: 3, day: 14, isoDate: '2026-03-14' },
    7
  );
  const test2Passed =
    schedTomorrow.isBirthdayToday === false &&
    schedTomorrow.isUpcoming === true &&
    schedTomorrow.daysUntilBirthday === 1;
  results.push({
    id: 2,
    title: 'Ahli yang hari lahirnya esok muncul dalam senarai akan datang',
    passed: test2Passed,
    detail: `Tarikh lahir 15 Mac disemak pada 14 Mac -> isUpcoming=${schedTomorrow.isUpcoming}, daysUntilBirthday=${schedTomorrow.daysUntilBirthday}`,
  });

  // Ujian 3: Ahli yang hari lahirnya telah berlalu tidak muncul sebagai sambutan hari ini atau 7 hari akan datang
  const schedPassed = evaluateMemberBirthdaySchedule(
    1,
    1, // 820101 -> 1 Januari
    { year: 2026, month: 1, day: 2, isoDate: '2026-01-02' },
    7
  );
  const test3Passed =
    schedPassed.isBirthdayToday === false &&
    schedPassed.isUpcoming === false &&
    schedPassed.hasPassedThisYear === true &&
    schedPassed.daysUntilBirthday === 364;
  results.push({
    id: 3,
    title: 'Ahli yang hari lahirnya telah berlalu tidak muncul sebagai sambutan hari ini',
    passed: test3Passed,
    detail: `Tarikh lahir 1 Januari disemak pada 2 Januari -> isBirthdayToday=${schedPassed.isBirthdayToday}, isUpcoming=${schedPassed.isUpcoming}, hasPassedThisYear=${schedPassed.hasPassedThisYear}`,
  });

  // Ujian 4: Tarikh 29 Februari dikendalikan dengan betul pada tahun lompat (2024) dan bukan tahun lompat (2026)
  const parsedLeap = parseBirthDateFromIc('800229-10-5432', { currentYear: 2026 });
  const schedLeapYear2024 = evaluateMemberBirthdaySchedule(
    2,
    29,
    { year: 2024, month: 2, day: 29, isoDate: '2024-02-29' },
    7
  );
  const schedNonLeapYear2026 = evaluateMemberBirthdaySchedule(
    2,
    29,
    { year: 2026, month: 2, day: 28, isoDate: '2026-02-28' },
    7
  );
  const invalidNonLeapIc = parseBirthDateFromIc('870229-10-5432', { currentYear: 2026 }); // 1987 bukan tahun lompat
  const test4Passed =
    parsedLeap.isValid === true &&
    parsedLeap.birthYear === 1980 &&
    schedLeapYear2024.isBirthdayToday === true &&
    schedLeapYear2024.celebrationDay === 29 &&
    schedNonLeapYear2026.isBirthdayToday === true &&
    schedNonLeapYear2026.celebrationDay === 28 &&
    schedNonLeapYear2026.isLeapAdjusted === true &&
    invalidNonLeapIc.isValid === false;
  results.push({
    id: 4,
    title: 'Tarikh 29 Februari dikendalikan dengan betul pada tahun lompat & bukan tahun lompat',
    passed: test4Passed,
    detail: `800229 sah (1980 lompat), sambutan 2024 pada 29 Feb (${schedLeapYear2024.isBirthdayToday}), sambutan 2026 pada 28 Feb (${schedNonLeapYear2026.isBirthdayToday}), manakala 870229 ditolak (isValid=${invalidNonLeapIc.isValid})`,
  });

  // Ujian 5: Nombor kad pengenalan tidak sah tidak menghasilkan tarikh lahir palsu
  const invalidCases = [
    '',
    '-',
    'ABCDEF-01-1234',
    '991301-01-1234', // Bulan 13
    '850431-01-1234', // 31 April tidak wujud
    '850230-01-1234', // 30 Februari tidak wujud
    '000000-00-0000', // Sifar semua
    '12345', // Pendek
  ];
  const allInvalidRejected = invalidCases.every(
    (ic) => parseBirthDateFromIc(ic, { currentYear: 2026 }).isValid === false
  );
  results.push({
    id: 5,
    title: 'Nombor kad pengenalan tidak sah tidak menghasilkan tarikh lahir palsu',
    passed: allInvalidRejected,
    detail: `${invalidCases.length}/${invalidCases.length} kes input tidak sah ditolak sepenuhnya tanpa menjana tarikh palsu`,
  });

  // Ujian 6: Nombor kad pengenalan penuh tidak terdedah dalam struktur data awam/portal
  const sampleRoster = buildSafeBirthdayRoster({
    schools: [
      {
        id: 'test-sch-1',
        name: 'Sekolah Menengah Islam Contoh',
        code: 'SMIC001',
        type: 'Sekolah Menengah',
        state: 'Selangor',
        district: 'Bangi',
        principal: 'Ustaz Ahmad bin Ali',
        designation: 'Pengetua',
        icNumber: '870622-01-5999',
        studentCount: 300,
        joinYear: 2015,
      },
    ],
    referenceDate: new Date('2026-06-22T04:00:00Z'), // 22 Jun 2026 12:00 MYT
  });
  const serializedPublicItem = JSON.stringify(sampleRoster.todayBirthdays[0] || {});
  const test6Passed =
    sampleRoster.todayBirthdays.length === 1 &&
    !serializedPublicItem.includes('870622-01-5999') &&
    !serializedPublicItem.includes('870622015999') &&
    !serializedPublicItem.includes('5999') &&
    !serializedPublicItem.includes('1987');
  results.push({
    id: 6,
    title: 'Nombor kad pengenalan penuh & tahun lahir tidak terdedah pada objek paparan',
    passed: test6Passed,
    detail: `Objek PublicSafeBirthdayMember bebas daripada no. KP penuh dan tahun kelahiran (hanya memaparkan "${sampleRoster.todayBirthdays[0]?.formattedDayMonth}")`,
  });

  // Ujian 7: Website dan Portal PGB memaparkan maklumat yang konsisten
  const test7Passed =
    sampleRoster.todayBirthdays[0]?.memberName === 'Ustaz Ahmad bin Ali' &&
    sampleRoster.todayBirthdays[0]?.formattedDayMonth === '22 Jun' &&
    sampleRoster.allIdentifiedBirthdays[0]?.formattedDayMonth === '22 Jun';
  results.push({
    id: 7,
    title: 'Website dan Portal PGB memaparkan maklumat yang konsisten daripada enjin tunggal',
    passed: test7Passed,
    detail: 'Kedua-dua komponen membaca hasil buildSafeBirthdayRoster yang sama mengikut zon waktu Asia/Kuala_Lumpur',
  });

  // Ujian 8 & 9: Keutamaan verifiedBirthDate dan kawalan sembunyi ahli (CMS Privacy Control)
  const overrideRoster = buildSafeBirthdayRoster({
    schools: [
      {
        id: 'test-sch-2',
        name: 'SRI Contoh',
        code: 'SRIC002',
        type: 'Sekolah Rendah',
        state: 'Melaka',
        district: 'Ayer Keroh',
        principal: 'Ustazah Siti Aminah',
        designation: 'Guru Besar',
        icNumber: '900315-04-5111',
        studentCount: 250,
        joinYear: 2018,
      },
    ],
    settings: {
      ...DEFAULT_BIRTHDAY_SETTINGS,
      memberOverrides: {
        SRIC002: {
          memberKey: 'SRIC002',
          verifiedBirthDate: '1990-06-22',
        },
      },
    },
    referenceDate: new Date('2026-06-22T04:00:00Z'),
  });
  const test8Passed =
    overrideRoster.todayBirthdays.length === 1 &&
    overrideRoster.todayBirthdays[0].source === 'VERIFIED_DATE' &&
    overrideRoster.todayBirthdays[0].formattedDayMonth === '22 Jun';
  results.push({
    id: 8,
    title: 'Keutamaan medan tarikh lahir yang disahkan (verifiedBirthDate) mengatasi IC sandaran',
    passed: test8Passed,
    detail: `Tarikh disahkan 1990-06-22 diutamakan berbanding IC 900315 (source=${overrideRoster.todayBirthdays[0]?.source})`,
  });

  // Ujian 9: Kawalan Admin CMS (sembunyi ahli & penentuan abad 870622, 900315, 820101)
  const hiddenRoster = buildSafeBirthdayRoster({
    schools: [
      {
        id: 'test-sch-3',
        name: 'SRI Contoh 3',
        code: 'SRIC003',
        type: 'Sekolah Rendah',
        state: 'Johor',
        principal: 'Ustaz Kamal',
        icNumber: '820101-01-5222',
      },
    ],
    settings: {
      ...DEFAULT_BIRTHDAY_SETTINGS,
      memberOverrides: {
        SRIC003: {
          memberKey: 'SRIC003',
          hiddenFromBirthday: true,
        },
      },
    },
    referenceDate: new Date('2026-01-01T04:00:00Z'),
  });
  const c87 = parseBirthDateFromIc('870622-01-5111', { currentYear: 2026 });
  const c90 = parseBirthDateFromIc('900315-01-5111', { currentYear: 2026 });
  const c82 = parseBirthDateFromIc('820101-01-5111', { currentYear: 2026 });
  const test9Passed =
    hiddenRoster.todayBirthdays.length === 0 &&
    hiddenRoster.hiddenCount === 1 &&
    c87.birthYear === 1987 &&
    c90.birthYear === 1990 &&
    c82.birthYear === 1982;
  results.push({
    id: 9,
    title: 'Kawalan privasi Admin CMS & penentuan abad (870622->1987, 900315->1990, 820101->1982)',
    passed: test9Passed,
    detail: `Ahli disembunyikan=tiada dalam senarai awam; 870622->${c87.birthYear}, 900315->${c90.birthYear}, 820101->${c82.birthYear}`,
  });

  return {
    allPassed: results.every((r) => r.passed),
    results,
  };
}

