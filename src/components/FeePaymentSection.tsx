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
  HeartHandshake,
  Receipt,
  FileCheck,
  Scale,
  Landmark,
} from 'lucide-react';

export const OFFICIAL_HEREPAY_URL = 'https://app.herepay.org/mpgbsim';
const OFFICIAL_MAYBANK_ACC = '562188100141';
const OFFICIAL_MAYBANK_NAME = 'PER MAJLIS GURU BESAR SEK-SEK ISLAM (M)';

interface FeePaymentSectionProps {
  onOpenPortal?: () => void;
}

interface FeeCategoryOption {
  id: string;
  title: string;
  clause: string;
  type: 'ahli_biasa' | 'ahli_bersekutu' | 'program' | 'infaq';
  amount: number;
  period: string;
  badge: string;
  badgeColor: string;
  suitableFor: string;
  features: string[];
}

const FEE_CATEGORIES: FeeCategoryOption[] = [
  // FASAL 6(1): YURAN AHLI BIASA
  {
    id: 'ahli_1_3_tahun',
    title: 'Yuran Ahli Biasa (Penubuhan 1–3 Tahun)',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    type: 'ahli_biasa',
    amount: 100,
    period: 'Setahun • Penubuhan 1–3 Tahun',
    badge: 'Ahli Biasa • 1–3 Tahun',
    badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    suitableFor: 'Institusi berdaftar IKRAM MUSLEH & KPM/JAI (Penubuhan sekolah 1 hingga 3 tahun)',
    features: [
      'Bayaran tahunan RM100 sahaja bagi sekolah berusia 1–3 tahun (Fasal 6(1))',
      'Keahlian automatik bagi Guru Besar / Mudir / Pengetua (Fasal 4(2))',
      'Hak penuh mengundi & perbincangan usul dalam Mesyuarat Agung MPGBSIM',
      'Pengeluaran Sijil Keahlian Rasmi & akses penuh Portal Ahli PGB',
    ],
  },
  {
    id: 'ahli_bawah_300',
    title: 'Yuran Ahli Biasa (> 3 Tahun • ≤ 300 Murid)',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    type: 'ahli_biasa',
    amount: 300,
    period: 'Setahun • Enrolmen ≤ 300 Murid',
    badge: 'Ahli Biasa • ≤ 300 Murid',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    suitableFor: 'Institusi Ahli Biasa (> 3 tahun penubuhan) dengan bilangan murid 300 orang ke bawah',
    features: [
      'Mengikut kategori enrolmen murid 300 orang ke bawah (Fasal 6(1))',
      'Hak mengundi & perbincangan usul dalam Mesyuarat Agung Tahunan',
      'Program latihan ikhtisas & kompetensi kepimpinan ahli (Fasal 3(3))',
      'Akses penuh Portal Ahli PGB, Kad Digital QR & Direktori Kebangsaan',
    ],
  },
  {
    id: 'ahli_atas_301',
    title: 'Yuran Ahli Biasa (> 3 Tahun • ≥ 301 Murid)',
    clause: 'Fasal 6(1) & Fasal 4(1)',
    type: 'ahli_biasa',
    amount: 600,
    period: 'Setahun • Enrolmen ≥ 301 Murid',
    badge: 'Ahli Biasa • ≥ 301 Murid',
    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    suitableFor: 'Institusi Ahli Biasa (> 3 tahun penubuhan) dengan bilangan murid 301 orang ke atas',
    features: [
      'Mengikut kategori enrolmen murid 301 orang ke atas (Fasal 6(1))',
      'Hak mengundi & perbincangan usul dalam Mesyuarat Agung Tahunan',
      'Penyertaan program latihan ikhtisas, kurikulum & kokurikulum (Fasal 3)',
      'Akses penuh Portal Ahli PGB, Kad Digital QR & Direktori Kebangsaan',
    ],
  },

  // FASAL 6(2): YURAN AHLI BERSEKUTU
  {
    id: 'bersekutu_1_3_tahun',
    title: 'Yuran Ahli Bersekutu (Penubuhan 1–3 Tahun)',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    type: 'ahli_bersekutu',
    amount: 200,
    period: 'Setahun • Penubuhan 1–3 Tahun',
    badge: 'Ahli Bersekutu • 1–3 Tahun',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    suitableFor: 'Institusi berdaftar KPM/Jabatan Agama (bukan IKRAM MUSLEH) berusia 1–3 tahun',
    features: [
      'Bayaran tahunan RM200 sahaja bagi penubuhan 1 hingga 3 tahun (Fasal 6(2))',
      'Terlibat dalam perbincangan mesyuarat berkala MPGBSIM (Fasal 4(7))',
      'Hadir sebagai pemerhati rasmi dalam Mesyuarat Agung MPGBSIM',
      'Akses jaringan kepimpinan PGB & program latihan profesional',
    ],
  },
  {
    id: 'bersekutu_bawah_300',
    title: 'Yuran Ahli Bersekutu (> 3 Tahun • ≤ 300 Murid)',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    type: 'ahli_bersekutu',
    amount: 400,
    period: 'Setahun • Enrolmen ≤ 300 Murid',
    badge: 'Ahli Bersekutu • ≤ 300 Murid',
    badgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    suitableFor: 'Institusi Ahli Bersekutu (> 3 tahun penubuhan) dengan bilangan murid 300 orang ke bawah',
    features: [
      'Mengikut kategori enrolmen murid 300 orang ke bawah (Fasal 6(2))',
      'Penglibatan dalam mesyuarat berkala, seminar & kursus pendidikan Islam',
      'Pemerhati rasmi dalam Mesyuarat Agung Tahunan MPGBSIM (Fasal 4(7))',
      'Akses Portal Ahli PGB, sumber dokumen & direktori sekolah',
    ],
  },
  {
    id: 'bersekutu_atas_301',
    title: 'Yuran Ahli Bersekutu (> 3 Tahun • ≥ 301 Murid)',
    clause: 'Fasal 6(2) & Fasal 4(7)',
    type: 'ahli_bersekutu',
    amount: 700,
    period: 'Setahun • Enrolmen ≥ 301 Murid',
    badge: 'Ahli Bersekutu • ≥ 301 Murid',
    badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    suitableFor: 'Institusi Ahli Bersekutu (> 3 tahun penubuhan) dengan bilangan murid 301 orang ke atas',
    features: [
      'Mengikut kategori enrolmen murid 301 orang ke atas (Fasal 6(2))',
      'Penglibatan dalam mesyuarat berkala, seminar & kursus pendidikan Islam',
      'Pemerhati rasmi dalam Mesyuarat Agung Tahunan MPGBSIM (Fasal 4(7))',
      'Akses Portal Ahli PGB, sumber dokumen & direktori sekolah',
    ],
  },

  // FASAL 6(4) & FASAL 3(5)-(6)
  {
    id: 'mesyuarat_program',
    title: 'Yuran Mesyuarat / Program / Aktiviti',
    clause: 'Fasal 6(4)',
    type: 'program',
    amount: 150,
    period: 'Mengikut Kelulusan Pejabat Pengerusi',
    badge: 'Fasal 6(4) • Program & Mesyuarat',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    suitableFor: 'Yuran Mesyuarat, yuran program atau aktiviti atas pertimbangan & kelulusan Pejabat Pengerusi MPGBSIM',
    features: [
      'Tertakluk pada pertimbangan & kelulusan Pejabat Pengerusi MPGBSIM (Fasal 6(4))',
      'Merangkumi Yuran Mesyuarat, Konvensyen (KPSI), seminar & kursus',
      'Kit persidangan, modul latihan ikhtisas & sijil penyertaan rasmi',
    ],
  },
  {
    id: 'infaq_wakaf',
    title: 'Derma & Dana Kebajikan Ahli MPGBSIM',
    clause: 'Fasal 3(5) & Fasal 3(6)',
    type: 'infaq',
    amount: 100,
    period: 'Sumbangan Kebajikan & Aktiviti',
    badge: 'Fasal 3(5)-(6) • Dana Kebajikan',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    suitableFor: 'Derma, bantuan kewangan dan dana bagi tujuan kebajikan ahli-ahli & pelaksanaan aktiviti',
    features: [
      'Mewujud dan mengumpulkan dana bagi tujuan kebajikan ahli-ahli (Fasal 3(6))',
      'Memperkasa latihan ikhtisas, penerbitan & seminar pendidikan Islam',
      'Dilaporkan dalam penyata kewangan tahunan Bendahari (Fasal 10(5))',
    ],
  },
];

export const FeePaymentSection: React.FC<FeePaymentSectionProps> = ({ onOpenPortal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ahli_bawah_300');
  const [tierTab, setTierTab] = useState<'ALL' | 'ahli_biasa' | 'ahli_bersekutu' | 'program'>('ALL');
  const [schoolCode, setSchoolCode] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedBank, setCopiedBank] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const activeCategory = FEE_CATEGORIES.find((c) => c.id === selectedCategory) || FEE_CATEGORIES[1];

  const displayedCategories = FEE_CATEGORIES.filter((c) => {
    if (tierTab === 'ALL') return true;
    if (tierTab === 'program') return c.type === 'program' || c.type === 'infaq';
    return c.type === tierTab;
  });

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

  const generatedPaymentNote = `MPGBSIM [${activeCategory.clause.split('&')[0].trim()}]: ${activeCategory.title} | ${
    schoolCode ? `[${schoolCode.toUpperCase()}] ` : ''
  }${schoolName ? schoolName.toUpperCase() : 'NAMA SEKOLAH'}`;

  const handleCopyNote = () => {
    navigator.clipboard.writeText(generatedPaymentNote);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

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
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-xs shadow-md">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Fasal 6 Perlembagaan MPGBSIM (PPM-002-10-23041996) • Sumber Kewangan</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Kategori & Kadar Yuran Perlembagaan MPGBSIM
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Pembayaran yuran tahunan bagi <strong>Ahli Biasa (Fasal 6(1))</strong> dan{' '}
            <strong>Ahli Bersekutu (Fasal 6(2))</strong> berdasarkan tempoh penubuhan sekolah serta
            kategori enrolmen murid, dijelaskan selewatnya <strong className="text-amber-400">31 Mac setiap tahun</strong>.
          </p>

          {/* Quick Official Link & Maybank Account Bar */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 p-2.5 bg-slate-900/90 rounded-2xl border border-teal-500/30 shadow-lg">
            <span className="text-xs text-slate-300 px-2 font-mono">
              Maybank Rasmi: <strong className="text-amber-300">{OFFICIAL_MAYBANK_ACC}</strong> ({OFFICIAL_MAYBANK_NAME})
            </span>
            <button
              type="button"
              onClick={handleCopyBank}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer border border-slate-700"
            >
              {copiedBank ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">No. Akaun Disalin!</span>
                </>
              ) : (
                <>
                  <Landmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Salin No. Akaun</span>
                </>
              )}
            </button>
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
                  <span>Salin HerePay</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payment Main Grid: Plan Selector & Interactive Gateway Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column: Category Selection Tabs & Features */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Pilih Kategori Yuran Mengikut Fasal 6</span>
              </h3>

              <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTierTab('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    tierTab === 'ALL' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({FEE_CATEGORIES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTierTab('ahli_biasa')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    tierTab === 'ahli_biasa' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ahli Biasa • Fasal 6(1)
                </button>
                <button
                  type="button"
                  onClick={() => setTierTab('ahli_bersekutu')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    tierTab === 'ahli_bersekutu' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ahli Bersekutu • Fasal 6(2)
                </button>
                <button
                  type="button"
                  onClick={() => setTierTab('program')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    tierTab === 'program' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mesyuarat & Dana
                </button>
              </div>
            </div>

            {/* List of Category Cards */}
            <div className="space-y-3">
              {displayedCategories.map((cat) => {
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
                          {cat.type === 'ahli_biasa' ? (
                            <GraduationCap className="w-5 h-5" />
                          ) : cat.type === 'ahli_bersekutu' ? (
                            <Building className="w-5 h-5" />
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
                            <span className="text-[10px] font-mono text-slate-400">{cat.clause}</span>
                          </div>
                          <p className="text-xs text-slate-400">{cat.suitableFor}</p>
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
                    <h4 className="text-sm font-bold text-white">Ringkasan Bayaran (Fasal 6)</h4>
                    <p className="text-[11px] text-slate-400">HerePay & Akaun Maybank MPGBSIM</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800">
                    {activeCategory.clause.split('&')[0].trim()}
                  </span>
                </div>
              </div>

              {/* Selected Plan Details */}
              <div className="py-5">
                <span className="text-xs text-slate-400 block mb-1">Kategori Yang Dipilih:</span>
                <div className="text-base font-bold text-white flex items-center justify-between gap-2">
                  <span>{activeCategory.title}</span>
                  <span className="text-2xl font-black text-amber-300 shrink-0">
                    RM {activeCategory.amount}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{activeCategory.suitableFor}</p>
              </div>

              {/* Official Bank Account Box (Fasal 6(3)) */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 mb-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-amber-400">
                    Akaun Bank Rasmi Pertubuhan (Fasal 6(3))
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBank}
                    className="text-[11px] font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedBank ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedBank ? 'Disalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="font-mono font-bold text-sm text-white">
                  Maybank: <span className="text-amber-300">{OFFICIAL_MAYBANK_ACC}</span>
                </div>
                <div className="text-[11px] text-slate-300">{OFFICIAL_MAYBANK_NAME}</div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Tarikh akhir bayaran: <strong>Selewatnya hujung bulan Mac (31 Mac)</strong> setiap tahun.
                </div>
              </div>

              {/* Helper: Input School Details for auto note generation */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    Penjana Catatan Rujukan Transaksi:
                  </span>
                  <span className="text-[10px] text-slate-500">Fasal 6(3)</span>
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
                      <span>Serah Resit di Portal</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Security & Bank Badges */}
              <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bendahari MPGBSIM (Fasal 6(3))</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    FPX
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Maybank
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Cek
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Portal Ahli sync note */}
            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/50 flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white block font-semibold mb-0.5">
                  Serahan Bukti Pembayaran Kepada Bendahari (Fasal 6(3))
                </strong>
                Selepas membuat pembayaran melalui HerePay, <em>online banking</em> atau cek, log masuk ke{' '}
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  Portal Ahli PGB
                </button>{' '}
                untuk menyerahkan bukti pembayaran dan menjana Resit Pengesahan Rasmi MPGBSIM.
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Perlembagaan Fasal 6 */}
        <div className="mt-8 pt-12 border-t border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block mb-1">
              Perlembagaan Pertubuhan Induk MPGBSIM (PPM-002-10-23041996)
            </span>
            <h3 className="text-2xl font-bold text-white">
              Ketetapan Rasmi Fasal 6: Sumber Kewangan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-left relative">
              <div className="inline-flex px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-xs mb-3">
                Fasal 6 (1) • Yuran Ahli Biasa
              </div>
              <h4 className="text-base font-bold text-white mb-2">Institusi IKRAM MUSLEH & KPM/JAI</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penubuhan sekolah 1 hingga 3 tahun: <strong className="text-white">RM100 setahun</strong>. Melebihi 3 tahun mengikut enrolmen murid:{' '}
                <strong className="text-white">RM300 setahun</strong> (≤ 300 murid) dan{' '}
                <strong className="text-white">RM600 setahun</strong> (≥ 301 murid).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-left relative">
              <div className="inline-flex px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs mb-3">
                Fasal 6 (2) • Yuran Ahli Bersekutu
              </div>
              <h4 className="text-base font-bold text-white mb-2">Institusi Bersekutu KPM/Jabatan Agama</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penubuhan sekolah 1 hingga 3 tahun: <strong className="text-white">RM200 setahun</strong>. Melebihi 3 tahun mengikut enrolmen murid:{' '}
                <strong className="text-white">RM400 setahun</strong> (≤ 300 murid) dan{' '}
                <strong className="text-white">RM700 setahun</strong> (≥ 301 murid).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 text-left relative">
              <div className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs mb-3">
                Fasal 6 (3), (5) & (6) • Tatacara & Tempoh
              </div>
              <h4 className="text-base font-bold text-white mb-2">Sebelum Hujung Bulan Mac</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dijelaskan selewatnya hujung bulan Mac setiap tahun ke Akaun Maybank{' '}
                <strong className="text-amber-300 font-mono">562188100141</strong> ({OFFICIAL_MAYBANK_NAME}). Tunggakan &gt; 2 tahun diberi notis peringatan; &gt; 3 tahun boleh dilucutkan keahlian.
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

            <h4 className="text-lg font-bold text-white mb-2">Gerbang HerePay MPGBSIM</h4>
            <p className="text-xs text-slate-400 mb-6">
              Halakan kamera telefon pintar anda untuk membuka terus laman rasmi HerePay MPGBSIM.
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto mb-5">
              <img src={qrCodeUrl} alt="QR Kod HerePay MPGBSIM" className="w-48 h-48 mx-auto" />
            </div>

            <div className="text-xs font-mono text-teal-300 mb-5 break-all">{OFFICIAL_HEREPAY_URL}</div>

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
