import React, { useState, useMemo } from 'react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { FeePaymentRecord, FeeCategory, MemberSchool } from '../../types';
import {
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  Building2,
  User,
  ShieldCheck,
  Receipt,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  X,
  Sparkles,
  HelpCircle,
  Info,
  DollarSign,
  ChevronRight,
  Scale,
  Landmark,
  Users,
} from 'lucide-react';

const OFFICIAL_HEREPAY_URL = 'https://app.herepay.org/mpgbsim';
const OFFICIAL_MAYBANK_ACC = '562188100141';
const OFFICIAL_MAYBANK_NAME = 'PER MAJLIS GURU BESAR SEK-SEK ISLAM (M)';

interface FeePlan {
  category: FeeCategory;
  name: string;
  clause: string;
  membershipTier: 'AHLI_BIASA' | 'AHLI_BERSEKUTU' | 'PROGRAM_SUMBANGAN';
  establishmentPeriod: string;
  enrolmentTier: string;
  amount: number;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
}

const FEE_PLANS: FeePlan[] = [
  // FASAL 6(1): YURAN AHLI BIASA (Fasal 4 Bil 1 - Berdaftar IKRAM MUSLEH & KPM/JAI)
  {
    category: 'YURAN_AHLI_1_3_TAHUN',
    name: 'Yuran Ahli Biasa (Penubuhan 1–3 Tahun)',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    membershipTier: 'AHLI_BIASA',
    establishmentPeriod: 'Penubuhan 1 hingga 3 Tahun',
    enrolmentTier: 'Semua Enrolmen Murid',
    amount: 100,
    badge: 'Ahli Biasa • 1–3 Tahun',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description:
      'Yuran tahunan bagi Institusi Islam Ahli Biasa (berdaftar dengan IKRAM MUSLEH & KPM/Jabatan Agama Islam) yang berusia penubuhan satu hingga tiga tahun.',
    features: [
      'Kadar khas penubuhan awal sekolah 1 hingga 3 tahun (Fasal 6(1))',
      'Keahlian automatik Guru Besar / Mudir / Pengetua (Fasal 4(2))',
      'Hak mengundi & perbincangan usul dalam Mesyuarat Agung MPGBSIM',
      'Sijil Keahlian Rasmi & akses penuh Portal Ahli PGB',
    ],
  },
  {
    category: 'YURAN_AHLI_BAWAH_300',
    name: 'Yuran Ahli Biasa (> 3 Tahun • ≤ 300 Murid)',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    membershipTier: 'AHLI_BIASA',
    establishmentPeriod: 'Melebihi 3 Tahun',
    enrolmentTier: '300 Orang Murid ke Bawah (≤ 300)',
    amount: 300,
    badge: 'Ahli Biasa • ≤ 300 Murid',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description:
      'Yuran tahunan bagi Institusi Islam Ahli Biasa yang telah ditubuhkan melebihi tiga tahun dengan enrolmen murid 300 orang ke bawah.',
    features: [
      'Mengikut kategori enrolmen ≤ 300 orang murid (Fasal 6(1))',
      'Hak penuh mengundi & membawa usul dalam Mesyuarat Agung Tahunan',
      'Penyertaan program latihan ikhtisas & kompetensi PGB (Fasal 3(3))',
      'Akses penuh Portal Ahli, Kad Digital QR & Direktori Kebangsaan',
    ],
  },
  {
    category: 'YURAN_AHLI_ATAS_301',
    name: 'Yuran Ahli Biasa (> 3 Tahun • ≥ 301 Murid)',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    membershipTier: 'AHLI_BIASA',
    establishmentPeriod: 'Melebihi 3 Tahun',
    enrolmentTier: '301 Orang Murid ke Atas (≥ 301)',
    amount: 600,
    badge: 'Ahli Biasa • ≥ 301 Murid',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description:
      'Yuran tahunan bagi Institusi Islam Ahli Biasa yang telah ditubuhkan melebihi tiga tahun dengan enrolmen murid 301 orang ke atas.',
    features: [
      'Mengikut kategori enrolmen ≥ 301 orang murid (Fasal 6(1))',
      'Hak penuh mengundi & membawa usul dalam Mesyuarat Agung Tahunan',
      'Penyertaan program latihan ikhtisas, kurikulum & kokurikulum (Fasal 3)',
      'Akses penuh Portal Ahli, Kad Digital QR & Direktori Kebangsaan',
    ],
  },

  // FASAL 6(2): YURAN AHLI BERSEKUTU (Fasal 4 Bil 7 - Tidak berdaftar IKRAM MUSLEH tetapi berdaftar KPM/JAI)
  {
    category: 'YURAN_BERSEKUTU_1_3_TAHUN',
    name: 'Yuran Ahli Bersekutu (Penubuhan 1–3 Tahun)',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    membershipTier: 'AHLI_BERSEKUTU',
    establishmentPeriod: 'Penubuhan 1 hingga 3 Tahun',
    enrolmentTier: 'Semua Enrolmen Murid',
    amount: 200,
    badge: 'Ahli Bersekutu • 1–3 Tahun',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description:
      'Yuran tahunan bagi Institusi Pendidikan Ahli Bersekutu (berdaftar dengan KPM/Jabatan Agama, bukan rangkaian IKRAM MUSLEH) yang berusia penubuhan 1–3 tahun.',
    features: [
      'Kadar penubuhan sekolah 1 hingga 3 tahun bagi Ahli Bersekutu (Fasal 6(2))',
      'Melibatkan diri dalam perbincangan mesyuarat berkala MPGBSIM (Fasal 4(7))',
      'Hadir sebagai pemerhati rasmi dalam Mesyuarat Agung MPGBSIM',
      'Akses jaringan kepimpinan PGB & program latihan profesional',
    ],
  },
  {
    category: 'YURAN_BERSEKUTU_BAWAH_300',
    name: 'Yuran Ahli Bersekutu (> 3 Tahun • ≤ 300 Murid)',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    membershipTier: 'AHLI_BERSEKUTU',
    establishmentPeriod: 'Melebihi 3 Tahun',
    enrolmentTier: '300 Orang Murid ke Bawah (≤ 300)',
    amount: 400,
    badge: 'Ahli Bersekutu • ≤ 300 Murid',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    description:
      'Yuran tahunan bagi Institusi Pendidikan Ahli Bersekutu yang melebihi tiga tahun penubuhan dengan enrolmen murid 300 orang ke bawah.',
    features: [
      'Mengikut kategori enrolmen ≤ 300 orang murid bagi Ahli Bersekutu (Fasal 6(2))',
      'Penglibatan dalam mesyuarat berkala, seminar & kursus pendidikan Islam',
      'Pemerhati rasmi dalam Mesyuarat Agung Tahunan MPGBSIM (Fasal 4(7))',
      'Akses Portal Ahli PGB, sumber dokumen & direktori sekolah',
    ],
  },
  {
    category: 'YURAN_BERSEKUTU_ATAS_301',
    name: 'Yuran Ahli Bersekutu (> 3 Tahun • ≥ 301 Murid)',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    membershipTier: 'AHLI_BERSEKUTU',
    establishmentPeriod: 'Melebihi 3 Tahun',
    enrolmentTier: '301 Orang Murid ke Atas (≥ 301)',
    amount: 700,
    badge: 'Ahli Bersekutu • ≥ 301 Murid',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description:
      'Yuran tahunan bagi Institusi Pendidikan Ahli Bersekutu yang melebihi tiga tahun penubuhan dengan enrolmen murid 301 orang ke atas.',
    features: [
      'Mengikut kategori enrolmen ≥ 301 orang murid bagi Ahli Bersekutu (Fasal 6(2))',
      'Penglibatan dalam mesyuarat berkala, seminar & kursus pendidikan Islam',
      'Pemerhati rasmi dalam Mesyuarat Agung Tahunan MPGBSIM (Fasal 4(7))',
      'Akses Portal Ahli PGB, sumber dokumen & direktori sekolah',
    ],
  },

  // FASAL 6(4) & FASAL 3(5)-(6): YURAN MESYUARAT / PROGRAM & SUMBANGAN
  {
    category: 'YURAN_MESYUARAT_PROGRAM',
    name: 'Yuran Mesyuarat / Program / Aktiviti',
    clause: 'Fasal 6(4)',
    membershipTier: 'PROGRAM_SUMBANGAN',
    establishmentPeriod: 'Mengikut Kelulusan Pejabat Pengerusi',
    enrolmentTier: 'Setiap Peserta / Institusi',
    amount: 150,
    badge: 'Fasal 6(4) • Program & Mesyuarat',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description:
      'Yuran Mesyuarat, yuran program, konvensyen atau aktiviti lain yang dikenakan bergantung pada pertimbangan dan kelulusan Pejabat Pengerusi MPGBSIM.',
    features: [
      'Tertakluk pada pertimbangan & kelulusan Pejabat Pengerusi (Fasal 6(4))',
      'Merangkumi Yuran Mesyuarat, Konvensyen (KPSI), seminar & kursus',
      'Kit persidangan, modul latihan ikhtisas & sijil penyertaan rasmi',
      'Amaun boleh dilaraskan mengikut kadar program semasa merekod resit',
    ],
  },
  {
    category: 'SUMBANGAN_DANA_WAKAF',
    name: 'Derma & Dana Kebajikan Ahli MPGBSIM',
    clause: 'Fasal 3(5) & Fasal 3(6)',
    membershipTier: 'PROGRAM_SUMBANGAN',
    establishmentPeriod: 'Sumbangan Sukarela',
    enrolmentTier: 'Terbuka',
    amount: 100,
    badge: 'Fasal 3(5)-(6) • Dana Kebajikan',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description:
      'Derma, bantuan kewangan dan pengumpulan dana bagi tujuan kebajikan ahli-ahli serta pelaksanaan aktiviti pertubuhan mengikut Fasal 3(5) dan Fasal 3(6).',
    features: [
      'Dana tujuan kebajikan ahli-ahli & pelaksanaan aktiviti (Fasal 3(6))',
      'Memperkasa latihan ikhtisas, penerbitan & wacana pendidikan Islam',
      'Dilaporkan dalam penyata kewangan tahunan Bendahari (Fasal 10(5))',
      'Resit pengesahan rasmi sumbangan dikeluarkan secara digital',
    ],
  },
];

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // If not an image, fall back to standard reader
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const PortalFeePayment: React.FC = () => {
  const { currentUser, feePayments, recordFeePayment, currentRole, registeredSchools } = useMemberPortal();
  const { siteData } = useAdminContent();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedPayer, setCopiedPayer] = useState(false);
  const [tierFilter, setTierFilter] = useState<'ALL' | 'AHLI_BIASA' | 'AHLI_BERSEKUTU' | 'PROGRAM_SUMBANGAN'>('ALL');

  // Interactive Calculator / Selector based on Fasal 6
  const matchedSchool: MemberSchool | undefined = useMemo(() => {
    const list = registeredSchools?.length ? registeredSchools : siteData.memberSchools || [];
    if (!currentUser) return undefined;
    return (
      list.find((s) => currentUser.schoolId && s.id === currentUser.schoolId) ||
      list.find((s) => currentUser.schoolCode && s.code?.toUpperCase() === currentUser.schoolCode.toUpperCase()) ||
      list.find((s) => currentUser.school && s.name?.toLowerCase().trim() === currentUser.school.toLowerCase().trim())
    );
  }, [currentUser, registeredSchools, siteData.memberSchools]);

  const schoolStudentCount = Number(currentUser?.studentCount ?? matchedSchool?.studentCount ?? 350);
  const defaultIsAssociate = Boolean(
    currentUser?.schoolType?.toLowerCase().includes('rakan musleh') ||
      currentUser?.schoolType?.toLowerCase().includes('bersekutu') ||
      matchedSchool?.type?.toLowerCase().includes('rakan musleh')
  );

  const [calcMembershipType, setCalcMembershipType] = useState<'AHLI_BIASA' | 'AHLI_BERSEKUTU'>(
    defaultIsAssociate ? 'AHLI_BERSEKUTU' : 'AHLI_BIASA'
  );
  const [calcSchoolAge, setCalcSchoolAge] = useState<'1_3_TAHUN' | 'LEBIH_3_TAHUN'>('LEBIH_3_TAHUN');
  const [calcEnrolment, setCalcEnrolment] = useState<'BAWAH_300' | 'ATAS_301'>(
    schoolStudentCount > 0 && schoolStudentCount <= 300 ? 'BAWAH_300' : 'ATAS_301'
  );

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BERJAYA' | 'DALAM_SEMAKAN'>('ALL');

  // Record Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptToView, setReceiptToView] = useState<FeePaymentRecord | null>(null);

  // Recommended Plan based on Fasal 6
  const recommendedCategory: FeeCategory = useMemo(() => {
    if (calcMembershipType === 'AHLI_BIASA') {
      if (calcSchoolAge === '1_3_TAHUN') return 'YURAN_AHLI_1_3_TAHUN';
      return calcEnrolment === 'BAWAH_300' ? 'YURAN_AHLI_BAWAH_300' : 'YURAN_AHLI_ATAS_301';
    } else {
      if (calcSchoolAge === '1_3_TAHUN') return 'YURAN_BERSEKUTU_1_3_TAHUN';
      return calcEnrolment === 'BAWAH_300' ? 'YURAN_BERSEKUTU_BAWAH_300' : 'YURAN_BERSEKUTU_ATAS_301';
    }
  }, [calcMembershipType, calcSchoolAge, calcEnrolment]);

  const recommendedPlan = useMemo(
    () => FEE_PLANS.find((p) => p.category === recommendedCategory) || FEE_PLANS[1],
    [recommendedCategory]
  );

  // Form Fields
  const [formCategory, setFormCategory] = useState<FeeCategory>(recommendedPlan.category);
  const [formAmount, setFormAmount] = useState<number>(recommendedPlan.amount);
  const [formRef, setFormRef] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<string>('HerePay (FPX)');
  const [formNotes, setFormNotes] = useState<string>('');
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');

  // Dynamic fee categories from Admin CMS
  const customFeeCategories = useMemo(() => {
    return (siteData?.feeCategories || []).filter(
      (c) => c.isActive !== false && !FEE_PLANS.some((p) => p.category === c.code)
    );
  }, [siteData?.feeCategories]);

  // Copy helpers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(OFFICIAL_HEREPAY_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText(OFFICIAL_MAYBANK_ACC);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const payerDetailsText = `NAMA: ${currentUser?.fullName || 'Pengetua / Guru Besar'}
EMEL: ${currentUser?.email || currentUser?.pgbEmail || 'pgb@sekolah.edu.my'}
NO. TEL: ${currentUser?.phone || currentUser?.pgbPhone || '012-3456789'}
INSTITUSI: ${currentUser?.school || 'Sekolah Ahli MPGBSIM'}
KOD SEKOLAH: ${currentUser?.schoolCode || currentUser?.membershipNo || 'BLAD001'}
ENROLMEN MURID: ${schoolStudentCount} orang
KATEGORI YURAN (FASAL 6): ${recommendedPlan.name} (RM ${recommendedPlan.amount})
LAMAN RASMI: https://www.mpgbsim.org/`;

  const handleCopyPayerDetails = () => {
    navigator.clipboard.writeText(payerDetailsText);
    setCopiedPayer(true);
    setTimeout(() => setCopiedPayer(false), 2500);
  };

  const handleOpenHerePay = (plan?: FeePlan) => {
    const target = plan || recommendedPlan;
    setFormCategory(target.category);
    setFormAmount(target.amount);
    window.open(OFFICIAL_HEREPAY_URL, '_blank', 'noopener,noreferrer');
  };

  const handleOpenRecordModal = (plan?: FeePlan) => {
    const target = plan || recommendedPlan;
    setFormCategory(target.category);
    setFormAmount(target.amount);
    setFormNotes(`Pembayaran ${target.name} [${target.clause}] bagi Sesi 2026/2027`);
    setFormRef(`HP-MPGB-${Math.floor(100000 + Math.random() * 900000)}`);
    setReceiptPreview('');
    setProofFileName('');
    setSubmitSuccess(null);
    setIsRecordModalOpen(true);
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
      try {
        const compressed = await compressImageFile(file);
        setReceiptPreview(compressed);
      } catch (err) {
        console.error('Error reading/compressing proof file:', err);
      }
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.trim()) {
      return;
    }
    setIsSubmitting(true);

    const matchedPlan = FEE_PLANS.find((p) => p.category === formCategory);
    const matchedCustom = siteData?.feeCategories?.find((c) => c.code === formCategory);
    const categoryLabel = matchedPlan
      ? `${matchedPlan.name} — ${matchedPlan.clause}`
      : matchedCustom
      ? `${matchedCustom.name} — ${matchedCustom.clause || 'MPGBSIM'}`
      : 'Yuran Keahlian MPGBSIM (Fasal 6)';

    try {
      const newPayment = await recordFeePayment({
        userId: currentUser?.uid,
        schoolId: currentUser?.schoolId,
        schoolCode: currentUser?.schoolCode || currentUser?.membershipNo?.split('-').pop() || 'MPGB',
        schoolName: currentUser?.school || 'Sekolah Ahli MPGBSIM',
        payerName: currentUser?.fullName || 'Pengetua / Guru Besar',
        payerEmail: currentUser?.email || currentUser?.pgbEmail || 'pgb@sekolah.edu.my',
        payerPhone: currentUser?.phone || currentUser?.pgbPhone,
        category: formCategory,
        categoryLabel,
        amount: Number(formAmount) || 0,
        paymentMethod: formMethod,
        transactionRef: formRef.trim(),
        paymentDate: formDate,
        status: 'DALAM_SEMAKAN', // Menunggu semakan oleh Bendahari MPGBSIM
        academicSession: '2026/2027',
        gateway: formMethod.includes('HerePay') ? 'HerePay' : 'Manual',
        gatewayUrl: OFFICIAL_HEREPAY_URL,
        notes: formNotes,
        receiptUrl: receiptPreview || undefined,
        paymentProofUrl: receiptPreview || undefined,
        proofFileName: proofFileName || (receiptPreview ? 'slip_bayaran.jpg' : undefined),
        proofUploadedAt: receiptPreview ? new Date().toISOString() : undefined,
        verifiedBy: 'Bendahari MPGBSIM',
        verifiedAt: new Date().toISOString(),
      });

      setSubmitSuccess('Bukti pembayaran yuran berjaya dihantar kepada Bendahari MPGBSIM untuk pengesahan.');
      setTimeout(() => {
        setIsRecordModalOpen(false);
        setReceiptToView(newPayment);
      }, 1200);
    } catch (err) {
      console.error('Error submitting payment record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter payments for this school
  const mySchoolPayments = useMemo(() => {
    const code = currentUser?.schoolCode?.toUpperCase();
    const name = currentUser?.school?.toLowerCase().trim();
    const memNo = currentUser?.membershipNo?.toUpperCase();

    return feePayments.filter((p) => {
      if (currentRole === 'ADMIN') return true;
      const pCode = p.schoolCode?.toUpperCase();
      const pName = p.schoolName?.toLowerCase().trim();
      if (code && pCode && pCode === code) return true;
      if (name && pName && pName === name) return true;
      if (memNo && p.transactionRef && pCode && memNo.includes(pCode)) return true;
      if (p.payerEmail && currentUser?.email && p.payerEmail.toLowerCase() === currentUser.email.toLowerCase())
        return true;
      return false;
    });
  }, [feePayments, currentUser, currentRole]);

  const filteredHistory = useMemo(() => {
    return mySchoolPayments.filter((p) => {
      if (statusFilter === 'ALL') return true;
      return p.status === statusFilter;
    });
  }, [mySchoolPayments, statusFilter]);

  const filteredPlans = useMemo(() => {
    if (tierFilter === 'ALL') return FEE_PLANS;
    return FEE_PLANS.filter((p) => p.membershipTier === tierFilter);
  }, [tierFilter]);

  const totalPaid = useMemo(() => {
    return mySchoolPayments
      .filter((p) => p.status === 'BERJAYA')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [mySchoolPayments]);

  const isCurrentSessionPaid = useMemo(() => {
    return mySchoolPayments.some(
      (p) =>
        p.status === 'BERJAYA' &&
        (p.category.startsWith('YURAN_AHLI_') ||
          p.category.startsWith('YURAN_BERSEKUTU_') ||
          p.category === 'YURAN_TAHUNAN_MENENGAH' ||
          p.category === 'YURAN_TAHUNAN_RENDAH') &&
        p.academicSession.includes('2026')
    );
  }, [mySchoolPayments]);

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Scale className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Fasal 6 Perlembagaan MPGBSIM (PPM-002-10-23041996) • Sumber Kewangan</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Pembayaran Yuran Keahlian Mengikut Perlembagaan MPGBSIM
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
            Kadar yuran tahunan ditetapkan berdasarkan <strong>Fasal 6 (Sumber Kewangan)</strong> dan{' '}
            <strong>Fasal 4 (Keahlian)</strong> Perlembagaan MPGBSIM mengikut taraf keahlian institusi (
            <strong>Ahli Biasa</strong> atau <strong>Ahli Bersekutu</strong>), tempoh penubuhan sekolah (
            <strong>1–3 tahun</strong> atau <strong>melebihi 3 tahun</strong>), serta bilangan enrolmen murid (
            <strong>≤ 300 murid</strong> atau <strong>≥ 301 murid</strong>).
          </p>

          {/* Status Badge & Official Gateway URL */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={OFFICIAL_HEREPAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>Bayar via Gerbang HerePay Rasmi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleCopyBank}
              className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center gap-2 border border-slate-700/80 transition cursor-pointer"
            >
              {copiedBank ? <Check className="w-4 h-4 text-emerald-400" /> : <Landmark className="w-4 h-4" />}
              <span>
                {copiedBank ? 'No. Akaun Maybank Disalin!' : `Maybank: ${OFFICIAL_MAYBANK_ACC}`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenRecordModal()}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Serah Bukti Bayaran / Rekod Resit</span>
            </button>
          </div>

          {/* Fasal 6(3) Official Bank & Deadline Strip */}
          <div className="mt-5 pt-4 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/75 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Akaun Rasmi Pertubuhan (Fasal 6(3))
              </span>
              <strong className="font-mono text-amber-300 text-sm block mt-0.5">
                Maybank: {OFFICIAL_MAYBANK_ACC}
              </strong>
              <span className="text-[11px] text-slate-300 block">{OFFICIAL_MAYBANK_NAME}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/75 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">
                Tarikh Akhir Bayaran (Fasal 6(3))
              </span>
              <strong className="text-white text-sm block mt-0.5">Selewatnya 31 Mac Setiap Tahun</strong>
              <span className="text-[11px] text-slate-300 block">
                Melalui Online Banking (HerePay/FPX) atau Cek kepada Bendahari MPGBSIM
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/75 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">
                Klausa Tunggakan (Fasal 6(5) & 6(6))
              </span>
              <strong className="text-white text-xs block mt-0.5">
                &gt; 2 Tahun: Notis Peringatan Bendahari
              </strong>
              <span className="text-[11px] text-slate-300 block">
                &gt; 3 Tahun Berturut-turut: Boleh dilucutkan keahlian oleh Jawatankuasa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Membership Status & Constitutional Fee Calculator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Status Card */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-700" />
                Status Yuran Sekolah Anda
              </span>
              <span className="text-[11px] font-mono text-slate-500">Tahun Kewangan Jan–Dis (Fasal 10(6))</span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  isCurrentSessionPaid
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isCurrentSessionPaid ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <Clock className="w-8 h-8 animate-pulse" />
                )}
              </div>

              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-1 ${
                    isCurrentSessionPaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isCurrentSessionPaid ? 'YURAN 2026/2027 DISAHKAN' : 'JELASKAN SEBELUM 31 MAC'}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {currentUser?.school || 'Sekolah Ahli MPGBSIM'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kod: <strong className="font-mono text-slate-800">{currentUser?.schoolCode || 'BLAD001'}</strong> •{' '}
                  Enrolmen: <strong className="text-teal-800">{schoolStudentCount} murid</strong>
                </p>
              </div>
            </div>

            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Kategori Perlembagaan Disyorkan:</span>
                <strong className="text-teal-800 font-bold text-right">
                  {recommendedPlan.badge} ({recommendedPlan.clause.split('&')[0].trim()})
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Kadar Yuran Tahunan (Fasal 6):</span>
                <strong className="text-slate-900 font-mono text-sm">
                  RM {recommendedPlan.amount.toFixed(2)} / tahun
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Jumlah Bayaran Direkodkan:</span>
                <strong className="text-emerald-700 font-mono text-sm">
                  RM {totalPaid.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Bilangan Transaksi:</span>
                <span className="font-bold text-slate-900">{mySchoolPayments.length} rekod</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Tarikh akhir: 31hb Mac setiap tahun</span>
            <button
              type="button"
              onClick={() => handleOpenHerePay(recommendedPlan)}
              className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Bayar RM {recommendedPlan.amount} Sekarang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Constitutional Fee Calculator & Payer Assistant Panel */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-200">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Penentu Kadar Yuran Perlembagaan (Fasal 6(1) & 6(2))
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih taraf keahlian, usia penubuhan sekolah & bilangan murid untuk pengiraan tepat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyPayerDetails}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition cursor-pointer"
              >
                {copiedPayer ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayer ? 'Butiran Disalin!' : 'Salin Butiran PGB'}</span>
              </button>
            </div>

            {/* 3-Step Fasal 6 Criteria Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                  1. Taraf Keahlian (Fasal 4)
                </label>
                <select
                  value={calcMembershipType}
                  onChange={(e) => setCalcMembershipType(e.target.value as 'AHLI_BIASA' | 'AHLI_BERSEKUTU')}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:border-teal-600"
                >
                  <option value="AHLI_BIASA">Ahli Biasa — Fasal 6(1)</option>
                  <option value="AHLI_BERSEKUTU">Ahli Bersekutu — Fasal 6(2)</option>
                </select>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {calcMembershipType === 'AHLI_BIASA'
                    ? 'Berdaftar IKRAM MUSLEH & KPM/JAI'
                    : 'Tidak berdaftar IKRAM MUSLEH (KPM/JAI)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                  2. Usia Penubuhan Sekolah
                </label>
                <select
                  value={calcSchoolAge}
                  onChange={(e) => setCalcSchoolAge(e.target.value as '1_3_TAHUN' | 'LEBIH_3_TAHUN')}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:border-teal-600"
                >
                  <option value="1_3_TAHUN">1 hingga 3 Tahun</option>
                  <option value="LEBIH_3_TAHUN">Melebihi 3 Tahun (&gt; 3 Tahun)</option>
                </select>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {calcSchoolAge === '1_3_TAHUN'
                    ? 'Kadar asas penubuhan 1–3 tahun'
                    : 'Mengikut kategori enrolmen murid'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                  3. Enrolmen Murid Sekolah
                </label>
                <select
                  value={calcEnrolment}
                  onChange={(e) => setCalcEnrolment(e.target.value as 'BAWAH_300' | 'ATAS_301')}
                  disabled={calcSchoolAge === '1_3_TAHUN'}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none focus:border-teal-600 disabled:opacity-60"
                >
                  <option value="BAWAH_300">300 Orang ke Bawah (≤ 300)</option>
                  <option value="ATAS_301">301 Orang ke Atas (≥ 301)</option>
                </select>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Rekod semasa sekolah: <strong>{schoolStudentCount} murid</strong>
                </span>
              </div>
            </div>

            {/* Result Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  Kadar Rasmi Mengikut {recommendedPlan.clause}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{recommendedPlan.name}</h4>
                <p className="text-[11px] text-slate-300">
                  {recommendedPlan.establishmentPeriod} • {recommendedPlan.enrolmentTier}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    RM {recommendedPlan.amount}
                  </span>
                  <span className="text-[10px] text-slate-300 block">setahun</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenRecordModal(recommendedPlan)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer"
                >
                  Pilih & Rekod
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>
              Akaun Maybank Rasmi: <strong className="font-mono text-slate-800">{OFFICIAL_MAYBANK_ACC}</strong> ({OFFICIAL_MAYBANK_NAME})
            </span>
            <a
              href={OFFICIAL_HEREPAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              <span>app.herepay.org/mpgbsim</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Official Fee Categories Catalog Grid (Perlembagaan Fasal 6) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-700" />
              <span>Jadual Lengkap Kategori Yuran Perlembagaan MPGBSIM (Fasal 6)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rujukan rasmi Fasal 6(1) Yuran Ahli Biasa, Fasal 6(2) Yuran Ahli Bersekutu & Fasal 6(4) Yuran Mesyuarat/Program
            </p>
          </div>

          {/* Tier Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setTierFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                tierFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kategori ({FEE_PLANS.length})
            </button>
            <button
              type="button"
              onClick={() => setTierFilter('AHLI_BIASA')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                tierFilter === 'AHLI_BIASA' ? 'bg-teal-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ahli Biasa • Fasal 6(1)
            </button>
            <button
              type="button"
              onClick={() => setTierFilter('AHLI_BERSEKUTU')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                tierFilter === 'AHLI_BERSEKUTU' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ahli Bersekutu • Fasal 6(2)
            </button>
            <button
              type="button"
              onClick={() => setTierFilter('PROGRAM_SUMBANGAN')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                tierFilter === 'PROGRAM_SUMBANGAN' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mesyuarat & Dana • Fasal 6(4)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredPlans.map((plan) => {
            const isMyRecommended = plan.category === recommendedCategory;

            return (
              <div
                key={plan.category}
                className={`rounded-3xl p-6 bg-white border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                  isMyRecommended
                    ? 'border-teal-600 ring-2 ring-teal-600/15'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isMyRecommended && (
                  <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Cadangan Sekolah Anda</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${plan.badgeColor}`}
                    >
                      {plan.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{plan.clause}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{plan.name}</h3>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">RM</span>
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                      {plan.amount}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {plan.membershipTier !== 'PROGRAM_SUMBANGAN' ? '/ setahun' : ''}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {plan.establishmentPeriod}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold">
                      {plan.enrolmentTier}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{plan.description}</p>

                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenHerePay(plan)}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <span>Bayar di HerePay</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRecordModal(plan)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Receipt className="w-3 h-3 text-slate-500" />
                    <span>Serah Bukti / Rekod Resit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Payment History & Official Invoices Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-teal-700" />
              <span>Sejarah Pembayaran & Resit Rasmi Bendahari MPGBSIM</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Senarai rekod transaksi yuran institusi anda mengikut Fasal 6(3) berserta slip pengesahan digital
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({mySchoolPayments.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('BERJAYA')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'BERJAYA'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disahkan ({mySchoolPayments.filter((p) => p.status === 'BERJAYA').length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRecordModal()}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Rekod Bayaran</span>
            </button>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Rujukan / Resit</th>
                <th className="py-3 px-4">Perihal / Kategori (Fasal 6)</th>
                <th className="py-3 px-4">Institusi & Pembayar</th>
                <th className="py-3 px-4">Tarikh</th>
                <th className="py-3 px-4">Kaedah</th>
                <th className="py-3 px-4 text-right">Amaun (RM)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-teal-800">
                      {item.transactionRef}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{item.categoryLabel}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Sesi {item.academicSession}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium text-slate-800 block truncate max-w-[200px]">
                        {item.schoolName}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                        {item.payerName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-xs">
                      {item.paymentDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-700">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {(Number(item.amount) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'BERJAYA'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {item.status === 'BERJAYA' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>TELAH BAYAR</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>DALAM SEMAKAN</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setReceiptToView(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition cursor-pointer"
                        title="Lihat / Cetak Slip Pembayaran Rasmi"
                      >
                        <Receipt className="w-3.5 h-3.5 text-teal-700" />
                        <span>Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    Tiada rekod pembayaran dijumpai. Klik butang "+ Rekod Bayaran" untuk menyerahkan bukti pembayaran kepada Bendahari MPGBSIM.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Petikan Rasmi Fasal 6 Perlembagaan MPGBSIM */}
      <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-amber-400" />
          <span>Rujukan Rasmi Fasal 6 (Sumber Kewangan) — Perlembagaan MPGBSIM</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold text-[10px]">
              FASAL 6 (1) — YURAN AHLI BIASA
            </span>
            <p className="text-slate-200 leading-relaxed">
              Yuran ahli bagi penubuhan sekolah <strong>1 hingga 3 tahun</strong> adalah sebanyak{' '}
              <strong className="text-amber-300">RM100 sahaja</strong>. Bagi yang <strong>melebihi 3 tahun</strong>{' '}
              adalah mengikut kategori enrolmen murid sekolah berkenaan iaitu{' '}
              <strong className="text-amber-300">RM300 setahun</strong> bagi bilangan murid <strong>300 orang ke bawah</strong>{' '}
              dan <strong className="text-amber-300">RM600 setahun</strong> bagi bilangan murid <strong>301 ke atas</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
              FASAL 6 (2) — YURAN AHLI BERSEKUTU
            </span>
            <p className="text-slate-200 leading-relaxed">
              Yuran ahli bersekutu bagi penubuhan sekolah <strong>1 hingga 3 tahun</strong> adalah sebanyak{' '}
              <strong className="text-amber-300">RM200 sahaja</strong>. Bagi yang <strong>melebihi 3 tahun</strong>{' '}
              adalah mengikut kategori enrolmen murid iaitu{' '}
              <strong className="text-amber-300">RM400 setahun</strong> bagi bilangan murid <strong>300 orang ke bawah</strong>{' '}
              dan <strong className="text-amber-300">RM700 setahun</strong> bagi bilangan murid <strong>301 ke atas</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
              FASAL 6 (3), (5) & (6) — TATACARA & AKAUN
            </span>
            <p className="text-slate-200 leading-relaxed">
              Dijelaskan selewatnya <strong>hujung bulan Mac</strong> setiap tahun melalui <em>online banking</em> atau cek
              dan diserahkan bukti bayaran kepada <strong>Bendahari MPGBSIM</strong> — Akaun Maybank{' '}
              <strong className="font-mono text-amber-300">562188100141</strong> atas nama{' '}
              <strong>PER MAJLIS GURU BESAR SEK-SEK ISLAM (M)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Rekod Resit / Transaksi Pembayaran */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Serah Bukti Pembayaran Yuran (Fasal 6(3))
                </h3>
                <p className="text-xs text-slate-500">
                  Maklumkan pembayaran kepada Bendahari MPGBSIM & jana resit rasmi
                </p>
              </div>
            </div>

            {submitSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kategori Yuran Mengikut Perlembagaan (Fasal 6) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const cat = e.target.value as FeeCategory;
                    setFormCategory(cat);
                    const plan = FEE_PLANS.find((p) => p.category === cat);
                    if (plan) {
                      setFormAmount(plan.amount);
                      setFormNotes(`Pembayaran ${plan.name} [${plan.clause}] bagi Sesi 2026/2027`);
                    } else {
                      const custom = siteData?.feeCategories?.find((c) => c.code === cat);
                      if (custom) {
                        setFormAmount(custom.amount);
                        setFormNotes(`Pembayaran ${custom.name} [${custom.clause || 'MPGBSIM'}] bagi Sesi ${custom.academicSession || '2026/2027'}`);
                      }
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                  required
                >
                  <optgroup label="Fasal 6(1) — Yuran Ahli Biasa (IKRAM MUSLEH & KPM/JAI)">
                    {FEE_PLANS.filter((p) => p.membershipTier === 'AHLI_BIASA').map((p) => (
                      <option key={p.category} value={p.category}>
                        {p.name} — RM {p.amount}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Fasal 6(2) — Yuran Ahli Bersekutu (KPM/JAI)">
                    {FEE_PLANS.filter((p) => p.membershipTier === 'AHLI_BERSEKUTU').map((p) => (
                      <option key={p.category} value={p.category}>
                        {p.name} — RM {p.amount}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Fasal 6(4) & Fasal 3(5)-(6) — Mesyuarat, Program & Sumbangan">
                    {FEE_PLANS.filter((p) => p.membershipTier === 'PROGRAM_SUMBANGAN').map((p) => (
                      <option key={p.category} value={p.category}>
                        {p.name} — RM {p.amount}
                      </option>
                    ))}
                    <option value="LAIN_LAIN">Lain-lain Pembayaran Diluluskan Pejabat Pengerusi</option>
                  </optgroup>
                  {customFeeCategories.length > 0 && (
                    <optgroup label="Kategori Tambahan / Terkini (Admin CMS)">
                      {customFeeCategories.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} — RM {c.amount} ({c.clause || 'Khas'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jumlah Amaun (RM) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tarikh Bayaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  No. Rujukan Transaksi HerePay / Online Banking / No. Cek <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: HP-MPGB-892147 / MBB-129384"
                  value={formRef}
                  onChange={(e) => setFormRef(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kaedah Pembayaran (Fasal 6(3))
                </label>
                <select
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                >
                  <option value="HerePay (FPX)">HerePay (FPX Perbankan Dalam Talian)</option>
                  <option value="Online Banking (Maybank 562188100141)">
                    Online Banking ke Akaun Maybank (562188100141)
                  </option>
                  <option value="HerePay (DuitNow QR)">HerePay (DuitNow QR)</option>
                  <option value="Pengeluaran Cek Rasmi">Pengeluaran Cek Rasmi Sekolah</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Muat Naik Bukti Pembayaran / Resit Bank (Pilihan)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-800 hover:file:bg-teal-100 cursor-pointer"
                />
                {receiptPreview && (
                  <div className="mt-2 p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                    <img
                      src={receiptPreview}
                      alt="Pratonton Resit"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                    />
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Bukti pembayaran berjaya dilampirkan
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan seperti nama sekolah, bilangan murid atau perincian bayaran..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Menyimpan Rekod...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-amber-300" />
                      <span>Simpan Bukti & Jana Resit</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Slip Rasmi Pengesahan Pembayaran Digital (PDF/Print View) */}
      {receiptToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative my-6 print:border-none print:shadow-none print:my-0">
            {/* Action Bar (Hidden on print) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-700" />
                Resit Rasmi Pembayaran Yuran MPGBSIM (Fasal 6)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cetak / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReceiptToView(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Canvas */}
            <div id="mpgbsim-official-receipt" className="space-y-6 text-slate-800">
              {/* Receipt Header with Official Branding */}
              <div className="flex items-center justify-between border-b-2 border-teal-900 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/mpgbsim-official-logo.png"
                    alt="Logo Rasmi MPGBSIM"
                    className="w-14 h-14 object-contain shrink-0"
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                      MAJLIS PENGETUA GURU BESAR SEKOLAH-SEKOLAH ISLAM MALAYSIA
                    </h2>
                    <p className="text-[11px] font-bold text-teal-800">
                      (MPGBSIM • PPM-002-10-23041996) • AKAUN MAYBANK: {OFFICIAL_MAYBANK_ACC}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      9, Jalan Dagang SB 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor
                    </p>
                    <p className="text-[10px] text-teal-800 font-medium mt-0.5">
                      Tel: 03-4251 6157 / 03-4251 6167 • Emel: mpgbsim.cemerlang@gmail.com • Laman Rasmi: https://www.mpgbsim.org/
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs">
                    TELAH DIBAYAR
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    NO. RESIT: RESIT-MPGB-{receiptToView.id.replace('pay-', '')}
                  </div>
                </div>
              </div>

              {/* Receipt Summary Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">No. Rujukan Transaksi</span>
                  <span className="font-mono font-bold text-teal-800 text-sm block">
                    {receiptToView.transactionRef}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tarikh Pembayaran</span>
                  <span className="font-mono font-semibold text-slate-800 block">
                    {receiptToView.paymentDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Kaedah Bayaran</span>
                  <span className="font-semibold text-slate-800 block">
                    {receiptToView.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sesi Kewangan</span>
                  <span className="font-mono font-bold text-slate-800 block">
                    {receiptToView.academicSession}
                  </span>
                </div>
              </div>

              {/* Payer & School Institutional Details */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Nama Pembayar (PGB):</span>
                    <strong className="text-slate-900 text-sm block">{receiptToView.payerName}</strong>
                    <span className="text-slate-500">{receiptToView.payerEmail}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Institusi Sekolah Ahli:</span>
                    <strong className="text-slate-900 text-sm block">{receiptToView.schoolName}</strong>
                    <span className="font-mono text-amber-800 font-bold">Kod Sekolah: {receiptToView.schoolCode}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Fee Breakdown Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Bil</th>
                      <th className="py-2.5 px-4">Keterangan Yuran (Perlembagaan Fasal 6)</th>
                      <th className="py-2.5 px-4">Akaun Penerima</th>
                      <th className="py-2.5 px-4 text-right">Amaun (RM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-mono">1</td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{receiptToView.categoryLabel}</strong>
                        <span className="text-slate-500 text-[11px]">
                          {receiptToView.notes || 'Pembayaran yuran rasmi mengikut Fasal 6 Perlembagaan MPGBSIM'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {OFFICIAL_MAYBANK_NAME} ({OFFICIAL_MAYBANK_ACC})
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {Number(receiptToView.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right font-bold text-slate-900 uppercase">
                        Jumlah Keseluruhan Dibayar:
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-teal-900 text-base tabular-nums">
                        RM {Number(receiptToView.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Bukti Bayaran / Slip Transaksi Terlampir */}
              {(receiptToView.paymentProofUrl || receiptToView.receiptUrl) && (
                <div className="p-3.5 rounded-2xl border border-teal-200 bg-teal-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={receiptToView.paymentProofUrl || receiptToView.receiptUrl}
                      alt="Bukti Bayaran"
                      className="w-16 h-16 object-cover rounded-xl border border-teal-200 shadow-xs cursor-pointer hover:opacity-90 shrink-0"
                      onClick={() => window.open(receiptToView.paymentProofUrl || receiptToView.receiptUrl, '_blank')}
                      title="Klik untuk lihat imej penuh"
                    />
                    <div>
                      <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
                        Bukti Bayaran Terlampir
                      </span>
                      <p className="font-semibold text-slate-800 text-xs">
                        {receiptToView.proofFileName || 'slip_pembayaran.jpg'}
                      </p>
                      {receiptToView.proofUploadedAt && (
                        <p className="text-slate-400 text-[10px]">
                          Dimuat naik: {receiptToView.proofUploadedAt.split('T')[0]}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(receiptToView.paymentProofUrl || receiptToView.receiptUrl, '_blank')}
                    className="px-3 py-1.5 rounded-lg bg-teal-800 text-white font-bold text-[11px] hover:bg-teal-900 transition cursor-pointer shrink-0"
                  >
                    Buka Slip Penuh ↗
                  </button>
                </div>
              )}

              {/* Authentication & Signature Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Disahkan Mengikut Fasal 6(3) & Fasal 9(5) Oleh:
                  </span>
                  <strong className="text-slate-900 block">Bendahari MPGBSIM</strong>
                  <span className="text-[10px] text-slate-500 block">
                    {OFFICIAL_MAYBANK_NAME} • Maybank ({OFFICIAL_MAYBANK_ACC})
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    ✓ Bukti Pembayaran Diterima & Direkodkan dalam Sistem Kewangan MPGBSIM
                  </span>
                  <span className="text-[10px] text-teal-800 font-mono block">
                    Laman Web Rasmi: https://www.mpgbsim.org/ • mpgbsim.cemerlang@gmail.com
                  </span>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="inline-block p-2 rounded-xl border border-slate-200 bg-white">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                        JSON.stringify({
                          resit: `RESIT-MPGB-${receiptToView.id}`,
                          ref: receiptToView.transactionRef,
                          school: receiptToView.schoolCode,
                          amount: receiptToView.amount,
                          acc: OFFICIAL_MAYBANK_ACC,
                          website: 'https://www.mpgbsim.org/',
                        })
                      )}`}
                      alt="QR Pengesahan Resit"
                      className="w-18 h-18"
                    />
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono">Imbas Sahkan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
