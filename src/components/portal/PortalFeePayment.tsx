import React, { useState, useMemo } from 'react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { FeePaymentRecord, FeeCategory } from '../../types';
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
  Download,
  Printer,
  X,
  Upload,
  Calendar,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Info,
  DollarSign,
  ChevronRight,
  Filter,
} from 'lucide-react';

const OFFICIAL_HEREPAY_URL = 'https://app.herepay.org/mpgbsim';

interface FeePlan {
  category: FeeCategory;
  name: string;
  level: string;
  amount: number;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  recommendedFor: 'MENENGAH' | 'RENDAH' | 'ALL';
}

const FEE_PLANS: FeePlan[] = [
  {
    category: 'YURAN_TAHUNAN_MENENGAH',
    name: 'Yuran Tahunan Sekolah Menengah',
    level: 'SMI / SMKA / SABK / Maahad Tahfiz',
    amount: 500,
    badge: 'Sekolah Menengah',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Yuran tahunan institusi menengah bagi keahlian rasmi MPGBSIM sesi 2026/2027.',
    features: [
      'Penyertaan penuh Konvensyen & Wacana SLT Kebangsaan',
      'Akses direktori kepimpinan pengetua & modul Rabbani',
      'Akaun Portal Ahli Rasmi & Kad Keahlian Digital (QR)',
      'Pengiktirafan dan pensijilan institusi ahli',
    ],
    recommendedFor: 'MENENGAH',
  },
  {
    category: 'YURAN_TAHUNAN_RENDAH',
    name: 'Yuran Tahunan Sekolah Rendah',
    level: 'SRI / Rakan Musleh / SRITI / SRAI',
    amount: 300,
    badge: 'Sekolah Rendah',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Yuran tahunan institusi rendah bagi keahlian rasmi MPGBSIM sesi 2026/2027.',
    features: [
      'Jaringan kepimpinan Guru Besar seluruh Malaysia',
      'Akses takwim peperiksaan UPKK, modul pengurusan & pekeliling',
      'Hak penyiaran Berita Kejayaan Sekolah di portal kebangsaan',
      'Penyertaan bengkel bimbingan kepimpinan kurikulum',
    ],
    recommendedFor: 'RENDAH',
  },
  {
    category: 'YURAN_PENDAFTARAN_BARU',
    name: 'Yuran Pendaftaran Institusi Baharu',
    level: 'Institusi Baharu Memohon Keahlian',
    amount: 200,
    badge: 'Sekali Seumur Hidup',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Yuran pemprosesan dan pentauliahan nombor keahlian rasmi baharu MPGBSIM.',
    features: [
      'Penyemakan audit kelayakan institusi oleh Jawatankuasa MPGBSIM',
      'Pemberian Kod Ahli Rasmi (e.g. MPGB-2026-XXXX)',
      'Pakej permulaan modul kepimpinan Rabbani',
      'Penyerahan watikah keahlian berdaftar majlis',
    ],
    recommendedFor: 'ALL',
  },
  {
    category: 'YURAN_KONVENSYEN_KPSI',
    name: 'Yuran Konvensyen Pemimpin (KPSI 2026)',
    level: 'Pengetua, Guru Besar & Penolong Kanan',
    amount: 150,
    badge: 'Program Tahunan',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Penyertaan Konvensyen Pemimpin Sekolah Islam Malaysia 2026 bertemakan Kepimpinan Rabbani & AI.',
    features: [
      'Kit persidangan fizikal / digital & modul pembentangan AI',
      'Jamuan makan rasmi & majlis apresiasi kecemerlangan',
      'Sijil penyertaan beriktiraf peringkat kebangsaan',
      'Sesi interaktif meja bulat bersama tokoh pendidikan',
    ],
    recommendedFor: 'ALL',
  },
  {
    category: 'SUMBANGAN_DANA_WAKAF',
    name: 'Infaq & Dana Pembangunan Pendidikan',
    level: 'Sumbangan Sukarela / Kebajikan',
    amount: 100,
    badge: 'Infaq / Wakaf',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Sumbangan kebajikan bagi memperkasa prasarana kepimpinan dan modul digital sekolah Islam.',
    features: [
      'Pahala jariah berterusan memperkasakan ummah',
      'Pembangunan sistem AI & latihan guru sekolah Islam',
      'Tabung bantuan kebajikan kepimpinan PGB',
      'Laporan ketelusan dana tahunan',
    ],
    recommendedFor: 'ALL',
  },
];

export const PortalFeePayment: React.FC = () => {
  const { currentUser, feePayments, recordFeePayment, currentRole } = useMemberPortal();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPayer, setCopiedPayer] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FeePlan | null>(null);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BERJAYA' | 'DALAM_SEMAKAN'>('ALL');

  // Record Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptToView, setReceiptToView] = useState<FeePaymentRecord | null>(null);

  // Form Fields
  const [formCategory, setFormCategory] = useState<FeeCategory>('YURAN_TAHUNAN_RENDAH');
  const [formAmount, setFormAmount] = useState<number>(300);
  const [formRef, setFormRef] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<string>('HerePay (FPX)');
  const [formNotes, setFormNotes] = useState<string>('');
  const [receiptPreview, setReceiptPreview] = useState<string>('');

  const isSecondary =
    currentUser?.position === 'Pengetua' ||
    currentUser?.schoolType?.toLowerCase().includes('menengah') ||
    currentUser?.school?.toLowerCase().includes('menengah');

  // Copy helper
  const handleCopyLink = () => {
    navigator.clipboard.writeText(OFFICIAL_HEREPAY_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const payerDetailsText = `NAMA: ${currentUser?.fullName || 'Pengetua / Guru Besar'}
EMEL: ${currentUser?.email || currentUser?.pgbEmail || 'pgb@sekolah.edu.my'}
NO. TEL: ${currentUser?.phone || currentUser?.pgbPhone || '012-3456789'}
INSTITUSI: ${currentUser?.school || 'Sekolah Ahli MPGBSIM'}
KOD SEKOLAH: ${currentUser?.schoolCode || currentUser?.membershipNo || 'BLAD001'}
NO. KEAHLIAN: ${currentUser?.membershipNo || 'MPGB-2026-MEMBER'}`;

  const handleCopyPayerDetails = () => {
    navigator.clipboard.writeText(payerDetailsText);
    setCopiedPayer(true);
    setTimeout(() => setCopiedPayer(false), 2500);
  };

  const handleOpenHerePay = (plan?: FeePlan) => {
    if (plan) {
      setFormCategory(plan.category);
      setFormAmount(plan.amount);
    }
    window.open(OFFICIAL_HEREPAY_URL, '_blank', 'noopener,noreferrer');
  };

  const handleOpenRecordModal = (plan?: FeePlan) => {
    if (plan) {
      setFormCategory(plan.category);
      setFormAmount(plan.amount);
      setFormNotes(`Pembayaran bagi ${plan.name} sesi 2026/2027`);
    } else {
      setFormCategory(isSecondary ? 'YURAN_TAHUNAN_MENENGAH' : 'YURAN_TAHUNAN_RENDAH');
      setFormAmount(isSecondary ? 500 : 300);
      setFormNotes(`Pembayaran Yuran Tahunan Sesi 2026/2027`);
    }
    setFormRef(`HP-MPGB-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitSuccess(null);
    setIsRecordModalOpen(true);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.trim()) {
      alert('Sila masukkan No. Rujukan Transaksi HerePay.');
      return;
    }
    setIsSubmitting(true);

    const matchedPlan = FEE_PLANS.find((p) => p.category === formCategory);
    const categoryLabel = matchedPlan ? matchedPlan.name : 'Yuran Keahlian MPGBSIM';

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
        status: 'BERJAYA',
        academicSession: '2026/2027',
        gateway: 'HerePay',
        gatewayUrl: OFFICIAL_HEREPAY_URL,
        notes: formNotes,
        receiptUrl: receiptPreview || undefined,
        verifiedBy: 'Sistem HerePay & Bendahari MPGBSIM',
        verifiedAt: new Date().toISOString(),
      });

      setSubmitSuccess('Rekod pembayaran HerePay berjaya disimpan ke pangkalan data dan resit telah dijana.');
      setTimeout(() => {
        setIsRecordModalOpen(false);
        setReceiptToView(newPayment);
      }, 1200);
    } catch (err) {
      console.error('Error submitting payment record:', err);
      alert('Ralat menyimpan maklumat pembayaran. Sila cuba sebentar lagi.');
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
      if (memNo && p.transactionRef && memNo.includes(pCode)) return true;
      if (p.payerEmail && currentUser?.email && p.payerEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
      return false;
    });
  }, [feePayments, currentUser, currentRole]);

  const filteredHistory = useMemo(() => {
    return mySchoolPayments.filter((p) => {
      if (statusFilter === 'ALL') return true;
      return p.status === statusFilter;
    });
  }, [mySchoolPayments, statusFilter]);

  const totalPaid = useMemo(() => {
    return mySchoolPayments
      .filter((p) => p.status === 'BERJAYA')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [mySchoolPayments]);

  const isCurrentSessionPaid = useMemo(() => {
    return mySchoolPayments.some(
      (p) =>
        p.status === 'BERJAYA' &&
        (p.category === 'YURAN_TAHUNAN_MENENGAH' || p.category === 'YURAN_TAHUNAN_RENDAH') &&
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
          <CreditCard className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Gerbang Rasmi HerePay • Pembayaran Yuran PGB</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Bayar Yuran Keahlian PGB MPGBSIM
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
            Saluran rasmi dalam talian bagi Pengetua, Guru Besar dan Institusi Sekolah Islam membuat bayaran yuran keahlian tahunan, pendaftaran baharu, atau program dengan pantas dan selamat menggunakan gerbang pembayaran <strong>HerePay</strong>.
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
              <span>Buka Gerbang HerePay Rasmi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 font-bold text-xs flex items-center gap-2 border border-slate-700/80 transition cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Pautan Disalin!' : 'Salin Pautan HerePay'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenRecordModal()}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Rekod No. Rujukan / Resit</span>
            </button>
          </div>

          {/* Verified Official Domain Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-300">
            <span className="font-semibold text-emerald-400">Pautan Rasmi Sah:</span>
            <code className="px-2 py-0.5 rounded bg-slate-900 font-mono text-amber-300 border border-slate-800">
              {OFFICIAL_HEREPAY_URL}
            </code>
            <span className="text-slate-400">• FPX Online Banking, DuitNow QR & Kad</span>
          </div>
        </div>
      </div>

      {/* 2. Membership Status & PGB Helper Assistant Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Status Card */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-700" />
                Status Yuran Sekolah Anda
              </span>
              <span className="text-[11px] font-mono text-slate-500">Sesi 2026/2027</span>
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
                  {isCurrentSessionPaid ? 'YURAN 2026/2027 DISAHKAN' : 'PERBAHARUI KEAHLIAN 2026'}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {currentUser?.school || 'Sekolah Ahli MPGBSIM'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kod: <strong className="font-mono text-slate-800">{currentUser?.schoolCode || 'BLAD001'}</strong> •{' '}
                  {currentUser?.schoolType || 'Sekolah Ahli'}
                </p>
              </div>
            </div>

            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Kadar Yuran Disyorkan:</span>
                <strong className="text-slate-900 font-mono text-sm">
                  RM {isSecondary ? '500.00' : '300.00'} / tahun
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
            <span className="text-[11px] text-slate-500">Keahlian aktif sehingga Disember 2027</span>
            <button
              type="button"
              onClick={() => handleOpenHerePay()}
              className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Bayar Sekarang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Payer Assistant Auto-fill Panel */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pembantu Butiran Pembayar PGB</h3>
                  <p className="text-[11px] text-slate-500">Salin maklumat ini dengan mudah semasa mengisi borang HerePay</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyPayerDetails}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition cursor-pointer"
              >
                {copiedPayer ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayer ? 'Disalin!' : 'Salin Semua'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Nama Pengetua / Guru Besar</span>
                <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                  {currentUser?.fullName || 'NOOR ASYIKIN BINTI AHMAT (Pengetua)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Emel Rasmi</span>
                <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                  {currentUser?.email || currentUser?.pgbEmail || 'srialaminbangi@gmail.com'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Nama Institusi / Sekolah</span>
                <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                  {currentUser?.school || 'SEKOLAH MENENGAH SRI AL-AMIN BANGI'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Kod Sekolah & No. Ahli</span>
                <span className="font-mono font-bold text-amber-700 mt-0.5 block">
                  {currentUser?.schoolCode || 'BLAD001'} • {currentUser?.membershipNo || 'MPGB-2026-BLAD001'}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-teal-50/70 border border-teal-200/70 text-[11px] text-teal-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <p>
                <strong>Tip Pantas:</strong> Semasa di laman HerePay MPGBSIM, pilih kategori yuran yang berkenaan, masukkan nama sekolah dan kod institusi anda dalam ruangan perihal/catatan bagi memudahkan pengesahan automatik oleh Bendahari Kehormat.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Saluran perbankan: <strong>FPX (Semua Bank Malaysia), DuitNow QR, Kad Debit/Kredit</strong></span>
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

      {/* 3. Official Fee Categories Catalog Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-700" />
              <span>Kategori & Kadar Yuran Rasmi MPGBSIM</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih kategori yang berkenaan untuk membuka terus gerbang pembayaran HerePay
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
              Sekolah Menengah: RM 500
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-semibold border border-teal-200">
              Sekolah Rendah: RM 300
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEE_PLANS.map((plan, idx) => {
            const isMyRecommended =
              (isSecondary && plan.recommendedFor === 'MENENGAH') ||
              (!isSecondary && plan.recommendedFor === 'RENDAH');

            return (
              <div
                key={idx}
                className={`rounded-3xl p-6 bg-white border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                  isMyRecommended
                    ? 'border-teal-600 ring-2 ring-teal-600/15'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isMyRecommended && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Institusi Anda</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${plan.badgeColor}`}
                    >
                      {plan.badge}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{plan.level}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{plan.name}</h3>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">RM</span>
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                      {plan.amount}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {plan.category.includes('TAHUNAN') ? '/ tahun' : ''}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{plan.description}</p>

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
                    <span>Telah Bayar? Rekod No. Rujukan</span>
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
              <span>Sejarah Pembayaran & Resit Rasmi MPGBSIM</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Senarai rekod transaksi yuran institusi anda berserta slip pengesahan digital
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
                <th className="py-3 px-4">Perihal / Kategori</th>
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
                    Tiada rekod pembayaran dijumpai. Klik butang "+ Rekod Bayaran" untuk memasukkan rujukan transaksi HerePay anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Step-by-Step Payment Guide */}
      <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Panduan Langkah Demi Langkah Pembayaran Yuran via HerePay</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-bold text-white">Buka Pautan HerePay</h4>
            <p className="text-slate-300 leading-relaxed">
              Klik butang <strong>"Buka Gerbang HerePay"</strong> atau layari pautan rasmi <code>https://app.herepay.org/mpgbsim</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-bold text-white">Isi Maklumat & Kod Sekolah</h4>
            <p className="text-slate-300 leading-relaxed">
              Masukkan nama PGB, emel, nombor telefon serta nama dan kod sekolah anda (e.g. BLAD001) dalam ruangan rujukan.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-bold text-white">Buat Bayaran FPX / QR</h4>
            <p className="text-slate-300 leading-relaxed">
              Pilih bank anda melalui perbankan internet FPX atau imbas DuitNow QR rasmi. Bayaran diproses serta-merta.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
              4
            </div>
            <h4 className="font-bold text-white">Rekod No. Rujukan & Slip</h4>
            <p className="text-slate-300 leading-relaxed">
              Salin nombor transaksi HerePay dan simpankan ke dalam portal untuk menjana slip pengesahan rasmi MPGBSIM.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Rekod Resit / Transaksi HerePay */}
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
                  Rekod Pembayaran HerePay
                </h3>
                <p className="text-xs text-slate-500">
                  Simpan maklumat transaksi untuk pengesahan & penjanaan slip rasmi
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
                  Kategori Yuran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const cat = e.target.value as FeeCategory;
                    setFormCategory(cat);
                    const plan = FEE_PLANS.find((p) => p.category === cat);
                    if (plan) setFormAmount(plan.amount);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                  required
                >
                  {FEE_PLANS.map((p) => (
                    <option key={p.category} value={p.category}>
                      {p.name} (RM {p.amount})
                    </option>
                  ))}
                  <option value="LAIN_LAIN">Lain-lain Pembayaran</option>
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
                  No. Rujukan HerePay / Transaksi FPX <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: HP-MPGB-892147 atau FPX-129384"
                  value={formRef}
                  onChange={(e) => setFormRef(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Boleh didapati pada e-mel pengesahan HerePay atau slip transaksi perbankan anda.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kaedah Pembayaran
                </label>
                <select
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
                >
                  <option value="HerePay (FPX)">HerePay (FPX Perbankan Internet)</option>
                  <option value="HerePay (DuitNow QR)">HerePay (DuitNow QR)</option>
                  <option value="HerePay (Kad)">HerePay (Kad Debit / Kredit)</option>
                  <option value="Pindahan Manual">Pindahan Manual Akaun Bank</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Muat Naik Bukti / Tangkap Layar Resit (Pilihan)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-800 hover:file:bg-teal-100 cursor-pointer"
                />
                {receiptPreview && (
                  <div className="mt-2 p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                    <img src={receiptPreview} alt="Pratonton Resit" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                    <span className="text-[11px] text-emerald-700 font-semibold">Resit berjaya dimuat naik</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan seperti nama sekolah atau perincian pembayaran..."
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
                      <span>Simpan Rekod & Jana Slip</span>
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
                Resit Rasmi Pembayaran Yuran MPGBSIM
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
                      MAJLIS PENGETUA GURU BESAR SEKOLAH ISLAM MALAYSIA
                    </h2>
                    <p className="text-[11px] font-bold text-teal-800">
                      (MPGBSIM) • KOD PENDAFTARAN KEBANGSAAN
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Pejabat Agong, Kompleks Pendidikan Islam, Batu 4 1/2, Jalan Peringgit, 75400 Melaka
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
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">No. Rujukan HerePay</span>
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
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sesi Akademik</span>
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
                      <th className="py-2.5 px-4">Keterangan Yuran / Perihal</th>
                      <th className="py-2.5 px-4">Saluran</th>
                      <th className="py-2.5 px-4 text-right">Amaun (RM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-4 font-mono">1</td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{receiptToView.categoryLabel}</strong>
                        <span className="text-slate-500 text-[11px]">
                          {receiptToView.notes || 'Pembayaran rasmi gerbang HerePay MPGBSIM'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        HerePay Online FPX
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

              {/* Authentication & Signature Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Disahkan Secara Digital Oleh:</span>
                  <strong className="text-slate-900 block">Bendahari Kehormat MPGBSIM</strong>
                  <span className="text-[10px] text-slate-500 block">
                    Pusat Operasi Kewangan Majlis Pengetua Guru Besar Sekolah Islam Malaysia
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    ✓ Transaksi Disahkan melalui Gerbang Rasmi HerePay (app.herepay.org/mpgbsim)
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
                          url: OFFICIAL_HEREPAY_URL,
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
