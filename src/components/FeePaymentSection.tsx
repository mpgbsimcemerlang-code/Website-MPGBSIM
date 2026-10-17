import React, { useState } from 'react';
import {
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  Building,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Info,
  CheckCircle2,
  Calendar,
  Users,
  HeartHandshake,
  Receipt,
  FileCheck,
  Lock,
  Smartphone,
} from 'lucide-react';

export const OFFICIAL_HEREPAY_URL = 'https://app.herepay.org/mpgbsim';

interface FeePaymentSectionProps {
  onOpenPortal?: () => void;
}

interface FeeCategoryOption {
  id: string;
  title: string;
  type: 'rendah' | 'menengah' | 'daftar' | 'program' | 'infaq';
  amount: number;
  period: string;
  badge: string;
  badgeColor: string;
  suitableFor: string;
  features: string[];
  recommended?: boolean;
}

const FEE_CATEGORIES: FeeCategoryOption[] = [
  {
    id: 'rendah',
    title: 'Yuran Tahunan Sekolah Rendah',
    type: 'rendah',
    amount: 300,
    period: 'Sesi Tahunan 2026/2027',
    badge: 'Guru Besar / Institusi Rendah',
    badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    suitableFor: 'Sekolah Rendah Islam (SRI), SRITI, SRAI, Rakan Musleh',
    features: [
      'Pendaftaran keahlian sah Guru Besar & Majlis Pengurusan',
      'Penyertaan Takwim Peperiksaan UPKK & Bengkel Kurikulum',
      'Akses Penuh Portal Ahli PGB & Kad Digital',
      'Penerbitan warta berita & profil sekolah di portal kebangsaan',
    ],
    recommended: true,
  },
  {
    id: 'menengah',
    title: 'Yuran Tahunan Sekolah Menengah',
    type: 'menengah',
    amount: 500,
    period: 'Sesi Tahunan 2026/2027',
    badge: 'Pengetua / Institusi Menengah',
    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    suitableFor: 'Sekolah Menengah Islam (SMI), SMKA, SABK, Maahad Tahfiz',
    features: [
      'Keahlian sah Pengetua & Pengurusan Sekolah Menengah',
      'Modul kepimpinan Rabbani, takwim SPM & SPPIM',
      'Akses direktori institusi & perkongsian modul kepimpinan SLT',
      'Pentauliahan watikah keahlian berdaftar MPGBSIM',
    ],
    recommended: true,
  },
  {
    id: 'pendaftaran_baru',
    title: 'Yuran Pendaftaran Institusi Baharu',
    type: 'daftar',
    amount: 200,
    period: 'Sekali Sahaja (Permohonan Baru)',
    badge: 'Keahlian Baharu',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    suitableFor: 'Sekolah atau institusi yang baru pertama kali mendaftar',
    features: [
      'Audit pentauliahan & pengesahan kod rasmi institusi',
      'Pakej pengenalan standard pentadbiran MPGBSIM',
      'Akaun pentadbir portal dan sokongan onboarding',
    ],
  },
  {
    id: 'konvensyen',
    title: 'Yuran Konvensyen Pemimpin (KPSI 2026)',
    type: 'program',
    amount: 150,
    period: 'Setiap Peserta',
    badge: 'Program Kebangsaan',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    suitableFor: 'Pengetua, Guru Besar & Barisan Penolong Kanan',
    features: [
      'Kit persidangan digital, modul kepimpinan & AI sekolah',
      'Jamuan apresiasi kepimpinan & sijil kebangsaan',
      'Sesi ucaptama tokoh pendidikan tersohor',
    ],
  },
  {
    id: 'infaq_wakaf',
    title: 'Infaq Dana Pendidikan & Kepimpinan',
    type: 'infaq',
    amount: 100,
    period: 'Sumbangan Bebas',
    badge: 'Infaq Jariah',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    suitableFor: 'Penyumbang korporat, alumni & individu budiman',
    features: [
      'Pembangunan prasarana teknologi digital sekolah Islam',
      'Tabung bantuan kebajikan kepimpinan guru & murid asnaf',
      'Pahala jariah berterusan memperkasakan ummah',
    ],
  },
];

export const FeePaymentSection: React.FC<FeePaymentSectionProps> = ({ onOpenPortal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('rendah');
  const [schoolCode, setSchoolCode] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const activeCategory = FEE_CATEGORIES.find((c) => c.id === selectedCategory) || FEE_CATEGORIES[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(OFFICIAL_HEREPAY_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const generatedPaymentNote = `MPGBSIM: ${activeCategory.title} | ${schoolCode ? `[${schoolCode.toUpperCase()}] ` : ''}${schoolName ? schoolName.toUpperCase() : 'NAMA SEKOLAH'}`;

  const handleCopyNote = () => {
    navigator.clipboard.writeText(generatedPaymentNote);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  // Direct QR Code using Google Charts API encoded with HerePay official URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    OFFICIAL_HEREPAY_URL
  )}&color=0f172a&bgcolor=ffffff&margin=10`;

  return (
    <section
      id="bayar-yuran"
      className="relative py-20 bg-slate-950 text-white overflow-hidden border-b border-teal-900/40 scroll-mt-20"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-xs shadow-md">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Gerbang Rasmi Pembayaran Yuran PGB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Bayar Yuran Keahlian PGB & Institusi
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Saluran rasmi dalam talian bagi Pengetua, Guru Besar dan Pihak Pengurusan Sekolah
            menjelaskan yuran tahunan, pendaftaran baharu, atau program dengan pantas dan selamat
            melalui gerbang rasmi <strong className="text-amber-400 font-semibold">HerePay</strong>.
          </p>

          {/* Quick Official Link Bar */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 p-2 bg-slate-900/90 rounded-2xl border border-teal-500/30 shadow-lg">
            <span className="text-xs text-slate-400 px-2 font-mono">
              Pautan Rasmi: <strong className="text-teal-300">{OFFICIAL_HEREPAY_URL}</strong>
            </span>
            <a
              href={OFFICIAL_HEREPAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-95"
            >
              <span>Buka HerePay</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer border border-slate-700"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Pautan Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Salin Pautan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payment Main Grid: Plan Selector & Interactive Gateway Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column: Category Selection Tabs & Features */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Pilih Kategori Yuran Anda</span>
              </h3>
              <span className="text-xs text-slate-400">Sesi Kalendar 2026/2027</span>
            </div>

            {/* List of Category Cards */}
            <div className="space-y-3">
              {FEE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-200 border text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-slate-900 to-teal-950/70 border-teal-400/80 shadow-xl shadow-teal-950/50 ring-1 ring-teal-500/40'
                        : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {cat.type === 'rendah' ? (
                            <GraduationCap className="w-5 h-5" />
                          ) : cat.type === 'menengah' ? (
                            <Building className="w-5 h-5" />
                          ) : cat.type === 'daftar' ? (
                            <FileCheck className="w-5 h-5" />
                          ) : cat.type === 'program' ? (
                            <Calendar className="w-5 h-5" />
                          ) : (
                            <HeartHandshake className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm sm:text-base font-bold text-white">
                              {cat.title}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.badgeColor}`}
                            >
                              {cat.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{cat.suitableFor}</p>
                        </div>
                      </div>

                      {/* Price Badge */}
                      <div className="sm:text-right shrink-0">
                        <div className="text-xl sm:text-2xl font-black text-amber-300">
                          {cat.type === 'infaq' ? 'RM 100+' : `RM ${cat.amount}`}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {cat.period}
                        </div>
                      </div>
                    </div>

                    {/* Expanded details when selected */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-teal-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 animate-fadeIn">
                        {cat.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Direct Payment Action & Helper Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-teal-950/50 border border-teal-500/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center text-teal-300">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ringkasan Bayaran PGB</h4>
                    <p className="text-[11px] text-slate-400">Gerbang Rasmi HerePay MPGBSIM</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800">
                    FPX & DuitNow
                  </span>
                </div>
              </div>

              {/* Selected Plan Details */}
              <div className="py-5">
                <span className="text-xs text-slate-400 block mb-1">Kategori Yang Dipilih:</span>
                <div className="text-base font-bold text-white flex items-center justify-between">
                  <span>{activeCategory.title}</span>
                  <span className="text-2xl font-black text-amber-300">
                    RM {activeCategory.amount}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{activeCategory.suitableFor}</p>
              </div>

              {/* Helper: Input School Details for auto note generation */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    Penjana Catatan Transaksi HerePay:
                  </span>
                  <span className="text-[10px] text-slate-500">Pilihan Mudah</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <input
                      type="text"
                      placeholder="Kod (e.g. BLAD001)"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 uppercase"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Nama Sekolah (e.g. SMI SRI AL-AMIN)"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Generated Preview & Copy */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-teal-300">
                  <span className="truncate pr-2">{generatedPaymentNote}</span>
                  <button
                    type="button"
                    onClick={handleCopyNote}
                    className="shrink-0 p-1 hover:text-amber-300 text-slate-400 transition cursor-pointer"
                    title="Salin Catatan"
                  >
                    {copiedRef ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  💡 Tip: Salin catatan ini untuk diisi dalam borang HerePay bagi memudahkan
                  pengesahan automatik oleh Bendahari Kehormat.
                </p>
              </div>

              {/* Primary Action Button: Open HerePay */}
              <div className="space-y-3">
                <a
                  href={OFFICIAL_HEREPAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-center text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-98"
                >
                  <CreditCard className="w-5 h-5 text-slate-950" />
                  <span>Bayar Sekarang di HerePay</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-400" />
                    <span>Imbas QR HerePay</span>
                  </button>

                  {onOpenPortal && (
                    <button
                      type="button"
                      onClick={onOpenPortal}
                      className="py-2.5 px-3 rounded-xl bg-teal-950/80 hover:bg-teal-900 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-teal-800/80 transition cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-400" />
                      <span>Semak Resit di Portal</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Security & Bank Badges */}
              <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Gerbang Rasmi Disahkan</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    FPX
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    DuitNow
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Visa / MC
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Portal Ahli sync note */}
            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/50 flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white block font-semibold mb-0.5">
                  Sudah Selesai Membayar di HerePay?
                </strong>
                Masukkan nombor rujukan transaksi anda ke dalam{' '}
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  Portal Ahli PGB
                </button>{' '}
                untuk menjana Resit Digital Rasmi MPGBSIM dan mengaktifkan lencana keahlian digital
                sekolah anda serta-merta.
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Guide for PGB */}
        <div className="mt-8 pt-12 border-t border-slate-800">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block mb-1">
              Panduan Mudah & Pantas
            </span>
            <h3 className="text-2xl font-bold text-white">
              3 Langkah Mudah Pembayaran Yuran via HerePay
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-left relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-2">Pilih Kategori Yuran</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tentukan kadar yuran bagi institusi anda (Sekolah Rendah RM300 / Sekolah Menengah
                RM500 / Ahli Baru RM200) dan sediakan Kod Sekolah anda.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-left relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-2">Buka HerePay & Buat Bayaran</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Klik pautan rasmi{' '}
                <a
                  href={OFFICIAL_HEREPAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-300 hover:underline font-mono"
                >
                  app.herepay.org/mpgbsim
                </a>{' '}
                dan jelaskan bayaran menggunakan perbankan internet (FPX), DuitNow QR atau Kad
                Debit/Kredit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-left relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-2">Simpan & Jana Resit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dapatkan rujukan transaksi daripada HerePay, log masuk ke Portal Ahli MPGBSIM untuk
                merekod bayaran dan memuat turun Resit Pengesahan Keahlian.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Mobile Payers */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
              aria-label="Tutup"
            >
              ✕
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-700 text-xs font-semibold mb-4">
              <QrCode className="w-3.5 h-3.5" />
              <span>Imbas Untuk Bayar (HerePay)</span>
            </div>

            <h4 className="text-lg font-bold text-white mb-2">
              Gerbang HerePay MPGBSIM
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              Halakan kamera telefon pintar anda untuk membuka terus laman rasmi HerePay MPGBSIM.
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto mb-5">
              <img
                src={qrCodeUrl}
                alt="QR Kod HerePay MPGBSIM"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="text-xs font-mono text-teal-300 mb-5 break-all">
              {OFFICIAL_HEREPAY_URL}
            </div>

            <div className="space-y-2">
              <a
                href={OFFICIAL_HEREPAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <span>Buka di Pelayar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
