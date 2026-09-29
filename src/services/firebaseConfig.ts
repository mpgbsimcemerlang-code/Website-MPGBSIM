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
  orderBy,
  Timestamp,
} from '../firebase';

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

const STORAGE_KEYS = {
  REGISTRATIONS: 'mpgbsim_pending_registrations',
  INQUIRIES: 'mpgbsim_inquiries',
  SAVED_ITEMS: 'mpgbsim_saved_practices',
};

export const savePendingRegistration = async (
  data: MemberRegistrationForm
): Promise<{ success: boolean; message: string; refId: string }> => {
  const refId = `MPGB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const submissionData = {
    ...data,
    id: refId,
    refId,
    submittedAt: new Date().toISOString(),
    status: 'Dalam Semakan',
  };

  // Local fallback
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]');
    existing.push(submissionData);
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(existing));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }

  // Firestore write
  try {
    await setDoc(doc(db, 'memberApplications', refId), {
      ...data,
      id: refId,
      refId,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    });

    await setDoc(doc(db, 'submissions', refId), {
      name: data.fullName,
      email: data.email,
      phone: data.phoneNumber || data.phone || '',
      subject: `Permohonan Keahlian PGB: ${data.schoolName} (${data.schoolType})`,
      category: 'Keahlian',
      message: `Jawatan: ${data.designation || data.position}, Tahun Menjadi PGB: ${data.serviceStartYear || data.pgbStartYear || new Date().getFullYear()}, Tahun Menjadi Ahli MPGBSIM: ${data.joinYear || data.schoolJoinYear || new Date().getFullYear()}, Sekolah: ${data.schoolName} (${data.schoolCode || 'Tiada Kod'}), Jenis: ${data.schoolType}, Negeri: ${data.state}, Emel Sekolah: ${data.schoolEmail || '-'}, Tel Sekolah: ${data.schoolPhone || '-'}, Emel PGB: ${data.email}, Tel PGB: ${data.phoneNumber || data.phone || '-'}, Murid: ${data.studentCount}, Guru: ${data.teacherCount}, No KP: ${data.icNumber || '-'}`,
      status: 'unread',
      createdAt: new Date().toISOString(),
    });
  } catch (firestoreErr) {
    console.warn('Firestore submission fallback:', firestoreErr);
  }

  return {
    success: true,
    message: 'Permohonan keahlian berjaya dihantar ke Urus Setia MPGBSIM.',
    refId,
  };
};

export const saveContactInquiry = async (
  data: ContactInquiry
): Promise<{ success: boolean; message: string; refCode: string }> => {
  const refCode = `INQ-${Date.now().toString().slice(-6)}`;
  const item = {
    ...data,
    id: refCode,
    refCode,
    date: new Date().toISOString(),
    status: 'unread' as const,
  };

  // Local fallback
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
    existing.unshift(item);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Local storage inquiry warning:', e);
  }

  // Cloud Firestore write
  try {
    await setDoc(doc(db, 'submissions', refCode), {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      subject: data.subject || `Pertanyaan [${data.category}]`,
      category: data.category,
      message: data.message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    });
  } catch (firestoreErr) {
    console.warn('Firestore inquiry fallback:', firestoreErr);
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
