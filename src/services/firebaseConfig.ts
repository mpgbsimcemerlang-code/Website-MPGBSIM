/**
 * Integrasi Sebenar Firebase & Firestore untuk Portal MPGBSIM
 */
import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from '../firebase';
import { checkAndRecordRateLimit } from '../utils/rateLimiter';

export interface FirebaseSchemaOverview {
  collections: {
    news: 'Koleksi Berita & Pengumuman Rasmi';
    events: 'Koleksi Program & Acara Kepimpinan';
    bestPractices: 'Koleksi Amalan Terbaik Pendidikan Islam';
    schools: 'Direktori Sekolah-Sekolah Ahli MPGBSIM';
    media: 'Galeri Gambar dan Video';
    siteSettings: 'Tetapan Laman Web & Maklumat Organisasi';
    submissions: 'Borang Maklum Balas dan Pertanyaan Awam';
    admins: 'Rekod Pentadbir Berautoriti';
  };
}

export const isFirebaseConfigured = (): boolean => {
  return true;
};

export interface MemberRegistrationForm {
  fullName: string;
  icNumber?: string;
  email: string; // Email Rasmi PGB
  phoneNumber?: string; // No. Telefon PGB
  phone?: string;
  pgbEmail?: string;
  pgbPhone?: string;
  designation?: 'Pengetua' | 'Guru Besar' | 'Pemangku Pengetua' | 'Penolong Kanan Pentadbiran' | string;
  position?: string;
  serviceStartYear?: number;
  pgbStartYear?: number;
  joinYear?: number;
  schoolJoinYear?: number;
  schoolName: string;
  schoolCode?: string;
  schoolType: string;
  membershipType?: 'Ahli Biasa' | 'Ahli Bersekutu';
  state: string;
  district?: string;
  schoolEmail?: string; // Email Rasmi Sekolah
  schoolPhone?: string; // No Telefon Sekolah
  website?: string;
  studentCount: number; // Jumlah Murid
  teacherCount: number; // Jumlah Guru
  logoUrl?: string;
  pgbPhotoUrl?: string; // Upload Gambar PGB
  schoolPhotoUrl?: string; // Sekeping Foto Institusi
  schoolDescription?: string;
  address?: string;
  notes?: string;
}

export interface ContactInquiry {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: 'Keahlian' | 'Program & Acara' | 'Amalan Terbaik' | 'Kerjasama Strategik' | 'Umum';
  message: string;
}

export const sanitizeForFirestore = <T extends Record<string, any>>(obj: T): T => {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Timestamp)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

const STORAGE_KEYS = {
  REGISTRATIONS: 'mpgbsim_pending_registrations',
  INQUIRIES: 'mpgbsim_inquiries',
  SAVED_ITEMS: 'mpgbsim_saved_practices',
};

export const checkExistingMemberApplication = async (
  email: string,
  schoolCode?: string
): Promise<{ exists: boolean; reason?: string; existingRefId?: string }> => {
  try {
    const appsRef = collection(db, 'memberApplications');
    
    // Check by email
    if (email && email.trim()) {
      const qEmail = query(appsRef, where('email', '==', email.trim().toLowerCase()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const docData = snapEmail.docs[0].data();
        return {
          exists: true,
          reason: `Permohonan dengan emel rasmi ini (${email}) telah wujud dalam sistem dengan status "${docData.status || 'pending'}".`,
          existingRefId: docData.refId || snapEmail.docs[0].id,
        };
      }
    }

    // Check by school code if provided
    if (schoolCode && schoolCode.trim()) {
      const qCode = query(appsRef, where('schoolCode', '==', schoolCode.trim().toUpperCase()));
      const snapCode = await getDocs(qCode);
      if (!snapCode.empty) {
        const docData = snapCode.docs[0].data();
        return {
          exists: true,
          reason: `Permohonan dengan Kod Sekolah (${schoolCode.toUpperCase()}) telah sedia ada dalam sistem dengan status "${docData.status || 'pending'}".`,
          existingRefId: docData.refId || snapCode.docs[0].id,
        };
      }
    }

    return { exists: false };
  } catch (err) {
    // Graceful fallback: do not block registration if Firestore query fails
    console.warn('Periksa permohonan sedia ada dilepaskan kerana ralat carian:', err);
    return { exists: false };
  }
};

export const savePendingRegistration = async (
  data: MemberRegistrationForm
): Promise<{ success: boolean; message: string; refId: string }> => {
  // 1. Client-side rate-limiting check to prevent spamming/quota exhaustion
  const rateLimit = checkAndRecordRateLimit('member_registration');
  if (!rateLimit.allowed) {
    throw new Error(rateLimit.message);
  }

  // 2. Pre-check for duplicate active application
  const dupCheck = await checkExistingMemberApplication(data.email, data.schoolCode);
  if (dupCheck.exists) {
    throw new Error(dupCheck.reason || 'Permohonan keahlian bagi emel atau sekolah ini telah wujud dalam sistem.');
  }

  // 3. Collision-free Reference ID: Year + Base36 Timestamp + Random 4 digits
  const year = new Date().getFullYear();
  const timeSuffix = Date.now().toString(36).toUpperCase().slice(-5);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const refId = `MPGB-${year}-${timeSuffix}-${randomSuffix}`;

  const appData = sanitizeForFirestore({
    ...data,
    membershipType: data.membershipType || 'Ahli Biasa',
    id: refId,
    refId,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  });

  const subData = sanitizeForFirestore({
    name: data.fullName || '',
    email: data.email || '',
    phone: data.phoneNumber || data.phone || '',
    subject: `Permohonan Keahlian PGB [${data.membershipType || 'Ahli Biasa'}]: ${data.schoolName || ''} (${data.schoolType || ''})`,
    category: 'Keahlian',
    message: `Kategori Keahlian: ${data.membershipType || 'Ahli Biasa'}, Jawatan: ${data.designation || data.position || 'PGB'}, Tahun Menjadi PGB: ${data.serviceStartYear || data.pgbStartYear || year}, Tahun Menjadi Ahli MPGBSIM: ${data.joinYear || data.schoolJoinYear || year}, Sekolah: ${data.schoolName || ''} (${data.schoolCode || 'Tiada Kod'}), Jenis: ${data.schoolType || ''}, Negeri: ${data.state || ''}, Emel Sekolah: ${data.schoolEmail || '-'}, Tel Sekolah: ${data.schoolPhone || '-'}, Emel PGB: ${data.email || ''}, Tel PGB: ${data.phoneNumber || data.phone || '-'}, Murid: ${data.studentCount || 0}, Guru: ${data.teacherCount || 0}, No KP: ${data.icNumber || '-'}`,
    status: 'unread',
    createdAt: new Date().toISOString(),
  });

  // 4. Atomic Firestore Batch Write (All-or-Nothing Guarantee)
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'memberApplications', refId), appData);
    batch.set(doc(db, 'submissions', refId), subData);
    await batch.commit();
  } catch (firestoreErr: any) {
    console.error('Ralat pangkalan data Firestore semasa menghantar permohonan keahlian:', firestoreErr);
    const code = firestoreErr?.code || '';
    const message = (firestoreErr?.message || '').toLowerCase();

    // Specific Quota Error detection
    if (code === 'resource-exhausted' || message.includes('resource_exhausted') || message.includes('quota') || message.includes('limit')) {
      throw new Error(
        'Had kuota Cloud Firestore telah dicapai buat masa ini (RESOURCE_EXHAUSTED). Permohonan anda tidak dapat diproses sekarang. Sila hubungi Urus Setia MPGBSIM atau cuba semula selepas kuota harian diperbaharui.'
      );
    }

    // Permission Denied
    if (code === 'permission-denied' || message.includes('permission-denied') || message.includes('missing or insufficient permissions')) {
      throw new Error(
        'Akses pangkalan data ditolak oleh polisi keselamatan Cloud Firestore (PERMISSION_DENIED). Sila hubungi pentadbir portal.'
      );
    }

    // Network / Offline
    if (code === 'unavailable' || message.includes('unavailable') || message.includes('network') || message.includes('failed to fetch')) {
      throw new Error(
        'Pelayan Cloud Firestore tidak dapat dihubungi buat masa ini. Sila pastikan sambungan internet anda aktif dan cuba lagi.'
      );
    }

    // General fallback with code
    throw new Error(
      `Gagal menyimpan permohonan ke Cloud Firestore (${code || 'Ralat Rangkaian'}). Sila pastikan talian internet anda stabil dan cuba lagi.`
    );
  }

  // 5. Dispatch content update event so CMS and Admin Views reload applications in real-time
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mpgbsim_content_updated'));
    }
  } catch (e) {}

  return {
    success: true,
    message: 'Permohonan keahlian berjaya dihantar ke Urus Setia MPGBSIM.',
    refId,
  };
};

export const saveContactInquiry = async (
  data: ContactInquiry
): Promise<{ success: boolean; message: string; refCode: string }> => {
  // Client-side rate-limiting check
  const rateLimit = checkAndRecordRateLimit('general_submission');
  if (!rateLimit.allowed) {
    throw new Error(rateLimit.message);
  }

  const refCode = `INQ-${Date.now().toString().slice(-6)}`;

  const inqData = sanitizeForFirestore({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    subject: data.subject || `Pertanyaan [${data.category || 'Umum'}]`,
    category: data.category || 'Umum',
    message: data.message || '',
    status: 'unread',
    createdAt: new Date().toISOString(),
  });

  // Cloud Firestore write (Authoritative Single Source of Truth)
  try {
    await setDoc(doc(db, 'submissions', refCode), inqData);
  } catch (firestoreErr) {
    console.error('Ralat pangkalan data Firestore semasa menghantar pertanyaan:', firestoreErr);
    throw new Error('Gagal menyimpan pertanyaan ke Cloud Firestore. Sila cuba lagi.');
  }

  return {
    success: true,
    message: 'Pertanyaan anda telah dihantar ke Cloud Firestore & Urus Setia MPGBSIM.',
    refCode,
  };
};

export const getSavedPractices = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS) || '[]');
  } catch {
    return [];
  }
};

export const toggleSavePractice = (practiceId: string): boolean => {
  try {
    const list = getSavedPractices();
    const index = list.indexOf(practiceId);
    let updated: string[];
    let isSavedNow: boolean;

    if (index > -1) {
      updated = list.filter((id) => id !== practiceId);
      isSavedNow = false;
    } else {
      updated = [...list, practiceId];
      isSavedNow = true;
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(updated));
    return isSavedNow;
  } catch {
    return false;
  }
};
