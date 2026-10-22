import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Building,
  GraduationCap,
  Edit3,
  Award,
  Users,
  FileText,
  Landmark,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Search,
  X,
  CreditCard,
  PhoneCall,
  Check,
  Info
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

// 10 Fasal Rasmi Ringkasan Perlembagaan MPGBSIM (PPM-002-10-23041996)
interface ConstitutionalClause {
  fasal: number;
  title: string;
  badge: string;
  summary: string;
  details: string[];
}

const CONSTITUTION_CLAUSES: ConstitutionalClause[] = [
  {
    fasal: 1,
    title: 'Nama Pertubuhan, Status Pendaftaran & Tafsiran',
    badge: 'Fasal 1 • Identiti Perundangan',
    summary:
      'Pertubuhan ini dikenali dengan nama Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM), berdaftar secara rasmi di bawah Akta Pertubuhan 1966 dengan No. Pendaftaran ROS PPM-002-10-23041996 yang diperakui pada 23 April 1996.',
    details: [
      'Nama Rasmi: Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM).',
      'No. Pendaftaran ROS: PPM-002-10-23041996 (Tarikh Berdaftar: 23 April 1996).',
      'Tertakluk sepenuhnya kepada Akta Pertubuhan 1966 di bawah bidang kuasa Pendaftar Pertubuhan Malaysia.',
      'Moto Rasmi: "Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani".',
    ],
  },
  {
    fasal: 2,
    title: 'Tempat Urusan & Alamat Berdaftar',
    badge: 'Fasal 2 • Ibu Pejabat',
    summary:
      'Tempat urusan dan alamat pos berdaftar pertubuhan terletak di Selangor Darul Ehsan dan tidak boleh diubah tanpa kelulusan Mesyuarat Agung dan Pendaftar Pertubuhan.',
    details: [
      'Alamat Berdaftar: D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor Darul Ehsan.',
      'Sebarang pertukaran alamat berdaftar hendaklah mendapat kelulusan Pendaftar Pertubuhan (ROS).',
      'Pusat pentadbiran dan operasi setiausaha agung berpusat di alamat ini.',
    ],
  },
  {
    fasal: 3,
    title: 'Tujuan, Objektif & 7 Matlamat Utama',
    badge: 'Fasal 3 • Matlamat Pertubuhan',
    summary:
      'MPGBSIM beriltizam menyatukan kepimpinan sekolah Islam, mempertingkatkan mutu pendidikan bersepadu, latihan kepimpinan ikhtisas, penyelarasan kurikulum, tabung kebajikan dan advokasi dasar rasmi bersama KPM, JAKIM dan agensi autoriti agama.',
    details: [
      'Fasal 3(1): Menyatukan Pengetua, Guru Besar dan Mudir sekolah-sekolah Islam di seluruh Malaysia dalam ikatan ukhuwah ikhtisas.',
      'Fasal 3(2): Meningkatkan mutu pendidikan Islam merangkumi akademik, diniyah bersepadu dan tahfiz Al-Quran.',
      'Fasal 3(3): Menganjurkan latihan kepimpinan ikhtisas, kursus kompetensi PGB, wacana ilmiah, dan konvensyen kebangsaan.',
      'Fasal 3(4): Menyelaras kurikulum, kokurikulum, pentaksiran sahsiah dan peperiksaan bersama sekolah-sekolah ahli.',
      'Fasal 3(5): Membina perkongsian pintar (smart partnership) dan penyelidikan amalan terbaik kepimpinan.',
      'Fasal 3(6): Mengumpulkan dana dan mentadbir tabung kebajikan bagi memelihara kebajikan ahli dan warga sekolah Islam.',
      'Fasal 3(7): Menjadi badan perundingan dan advokasi dasar rasmi bersama KPM, JAKIM, MAIN dan JAIN.',
    ],
  },
  {
    fasal: 4,
    title: 'Kategori Keahlian & Syarat Kelayakan',
    badge: 'Fasal 4 • Struktur Keahlian',
    summary:
      'Keahlian pertubuhan terbahagi kepada Ahli Biasa (Fasal 4(2)) bagi rangkaian IKRAM Musleh dan Ahli Bersekutu (Fasal 4(3)) bagi Rakan Musleh, SMKA, SABK, SMAN, SRAI, SAR dan Maahad Tahfiz.',
    details: [
      'Fasal 4(2) Ahli Biasa: Pengetua, Guru Besar & Mudir institusi rangkaian IKRAM Musleh berdaftar. Memiliki hak suara penuh, hak mengundi dan dipilih.',
      'Fasal 4(3) Ahli Bersekutu: Pengetua, Guru Besar & Mudir institusi Rakan Musleh, SMKA, SABK, SMAN, SRAI, SAR/KAFA dan Tahfiz berdaftar.',
      'Fasal 4(4): Permohonan keahlian dikemukakan secara rasmi kepada Setiausaha Agung untuk perakuan Jawatankuasa.',
      'Fasal 4(7): Ahli Bersekutu berhak menyertai aktiviti ikhtisas dan hadir sebagai pemerhati dalam AGM tanpa hak mengundi.',
    ],
  },
  {
    fasal: 5,
    title: 'Hak & Tanggungjawab Ahli',
    badge: 'Fasal 5 • Hak Keahlian',
    summary:
      'Semua ahli berhak menikmati kemudahan program ikhtisas, modul kepimpinan dan penerbitan pertubuhan dengan kewajipan mematuhi perlembagaan serta melunaskan yuran tahunan.',
    details: [
      'Berhak menerima bimbingan profesionalisme, modul kepimpinan PGB, dan sokongan advokasi pentadbiran.',
      'Wajib menjaga nama baik pertubuhan dan mematuhi ketetapan perlembagaan.',
      'Wajib menjelaskan yuran tahunan pertubuhan mengikut kategori yang ditetapkan.',
    ],
  },
  {
    fasal: 6,
    title: 'Sumber Kewangan, Jadual Yuran & Akaun Rasmi',
    badge: 'Fasal 6 • Kewangan & Yuran',
    summary:
      'Kewangan pertubuhan diperoleh daripada yuran tahunan ahli mengikut skala tempoh penubuhan dan enrolmen murid, derma yang sah, serta diuruskan menerusi akaun rasmi Maybank 562188100141.',
    details: [
      'Fasal 6(1) Yuran Ahli Biasa: RM100 (1–3 tahun penubuhan); RM300 (>3 tahun, ≤300 murid); RM600 (>3 tahun, ≥301 murid).',
      'Fasal 6(2) Yuran Ahli Bersekutu: RM200 (1–3 tahun penubuhan); RM500 (>3 tahun, ≤300 murid); RM800 (>3 tahun, ≥301 murid).',
      'Fasal 6(3) Akaun Rasmi Bank: Akaun Maybank 562188100141 atas nama "PER MAJLIS GURU BESAR SEK-SEK ISLAM (M)".',
      'Fasal 6(4): Yuran khas bagi persidangan dan program kepimpinan tertakluk kepada keputusan Jawatankuasa.',
    ],
  },
  {
    fasal: 7,
    title: 'Mesyuarat Agung Tahunan (AGM) & Luar Biasa (EGM)',
    badge: 'Fasal 7 • Kuasa Tertinggi',
    summary:
      'Mesyuarat Agung Tahunan ialah badan pembuat dasar tertinggi pertubuhan yang diadakan setiap tahun untuk menerima laporan aktiviti tahunan dan meluluskan penyata kewangan beraudit.',
    details: [
      'AGM diadakan tidak lewat dari tarikh yang ditetapkan dalam perlembagaan pada setiap tahun kewangan.',
      'Membentangkan dan meluluskan Laporan Setiausaha Agung bagi aktiviti tahunan pertubuhan.',
      'Membentangkan, membahaskan dan menerima Penyata Kewangan Beraudit Bendahari Kehormat.',
      'Memilih Majlis Jawatankuasa Kerja Kebangsaan mengikut kitaran penggal pemilihan.',
    ],
  },
  {
    fasal: 8,
    title: 'Majlis Jawatankuasa Kerja Kebangsaan',
    badge: 'Fasal 8 • Kepimpinan Eksekutif',
    summary:
      'Pertubuhan ditadbir oleh Majlis Jawatankuasa Kerja Kebangsaan yang dipilih dalam AGM, merangkumi Pengerusi, Timbalan Pengerusi, Setiausaha, Bendahari dan Ahli Majlis.',
    details: [
      'Komposisi: Pengerusi Kebangsaan, Timbalan Pengerusi, Setiausaha Agung, Penolong Setiausaha, Bendahari Kehormat, dan Ahli-ahli Jawatankuasa.',
      'Bertanggungjawab melaksanakan resolusi Mesyuarat Agung dan mengendalikan urusan harian pertubuhan.',
      'Boleh membentuk biro-biro khas bagi memperkasakan portfolio akademik, kurikulum, kebajikan, dan penyelidikan.',
    ],
  },
  {
    fasal: 9,
    title: 'Tugas-Tugas Pegawai Eksekutif & Juruaudit',
    badge: 'Fasal 9 • Amanah Pengurusan',
    summary:
      'Garis panduan tugasan jelas bagi Pengerusi, Setiausaha Agung, Bendahari Kehormat dan dua orang Juruaudit Dalaman bagi memastikan tatakelola telus dan akauntabiliti penuh.',
    details: [
      'Pengerusi mempengerusikan semua mesyuarat dan menjadi jurubicara rasmi MPGBSIM.',
      'Setiausaha Agung menguruskan surat-menyurat, daftar keahlian, dan minit mesyuarat.',
      'Bendahari Kehormat menguruskan semua kutipan yuran, resit rasmi, dan penyata perbelanjaan.',
      'Dua orang Juruaudit memeriksa akaun pertubuhan sebelum dibentangkan kepada AGM.',
    ],
  },
  {
    fasal: 10,
    title: 'Pindaan Perlembagaan & Pembubaran',
    badge: 'Fasal 10 • Pindaan & Governan',
    summary:
      'Sebarang pindaan kepada perlembagaan ini hanya boleh dibuat melalui kelulusan dua pertiga undi perwakilan dalam Mesyuarat Agung dan berkuat kuasa setelah diluluskan oleh Pendaftar Pertubuhan (ROS).',
    details: [
      'Cadangan pindaan mesti diedarkan kepada ahli sekurang-kurangnya 14 hari sebelum AGM.',
      'Memerlukan sokongan sekurang-kurangnya dua pertiga ahli yang hadir berhak mengundi.',
      'Pindaan tidak berkuat kuasa sehingga diluluskan oleh Pendaftar Pertubuhan (ROS).',
    ],
  },
];

export const Introduction: React.FC = () => {
  const { siteData, isAdmin, setIsCMSOpen } = useAdminContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFasalTab, setSelectedFasalTab] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const branding = siteData?.branding || {
    orgName: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    shortName: 'MPGBSIM',
    motto: 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani',
    registrationNumber: 'PPM-002-10-23041996',
    establishedYear: '1996',
  };

  const visionMission = siteData?.visionMission || {
    strategicPlanTitle: 'Pelan Strategik Kepimpinan Pendidikan Islam MPGBSIM (2025–2030)',
    vision: 'Peneraju Kecemerlangan Kepimpinan Pendidikan Islam Bertaraf Antarabangsa',
    visionSub:
      'Menjadikan institusi pendidikan Islam sebagai model pembinaan modal insan unggul yang mengintegrasikan ilmu naqli dan aqli berteraskan nilai ketuhanan.',
    missions: [
      'Menyatukan Pengetua dan Guru Besar Sekolah-Sekolah Islam Malaysia dalam satu ikatan ukhuwah dan permuafakatan rasmi (Fasal 3(1)).',
      'Meningkatkan mutu pendidikan Islam bersepadu merangkumi akademik, kurikulum diniyah, dan pengajian tahfiz (Fasal 3(2)).',
      'Menganjurkan program latihan kepimpinan ikhtisas, kursus kompetensi PGB, dan konvensyen pendidikan kebangsaan (Fasal 3(3)).',
      'Menyelaras kurikulum, kokurikulum dan pentaksiran bersama institusi sekolah Islam ahli demi kemenjadian murid (Fasal 3(4)).',
      'Memelihara kebajikan ahli dan bertindak sebagai badan advokasi rasmi bersama KPM, JAKIM, dan JAIN/MAIN (Fasal 3(6) & 3(7)).',
    ],
    introParagraph1: '',
    introParagraph2: '',
    introParagraph3: '',
    pillar1Title: 'Tujuan & Matlamat Rasmi (Fasal 3)',
    pillar1Desc:
      'Memantapkan kompetensi instruksional, penyelarasan kurikulum diniyah dan akademik, serta advokasi dasar bersama agensi kerajaan.',
    pillar2Title: 'Keahlian Berpelembagaan (Fasal 4)',
    pillar2Desc:
      'Penyatuan inklusif Ahli Biasa (Fasal 4(2)) dan Ahli Bersekutu (Fasal 4(3)) demi melahirkan generasi Rabbani seimbang.',
  };

  const filteredClauses = CONSTITUTION_CLAUSES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.details.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopyClause = (clause: ConstitutionalClause) => {
    const text = `${clause.badge}: ${clause.title}\n${clause.summary}\n\nButiran:\n${clause.details.map((d) => `• ${d}`).join('\n')}\n(Sumber: Perlembagaan MPGBSIM PPM-002-10-23041996)`;
    navigator.clipboard?.writeText(text);
    setCopiedText(`Fasal ${clause.fasal}`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <section id="tentang" className="py-20 bg-slate-50/60 border-b border-slate-200/80 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Legal Registration Bar */}
        <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Landmark className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-teal-800/80 text-amber-300 font-bold text-[11px] tracking-wide uppercase border border-teal-600/50">
                  Akta Pertubuhan 1966 • ROS Selangor
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200 font-mono text-[11px] font-bold">
                  No. Pendaftaran: {branding.registrationNumber || 'PPM-002-10-23041996'}
                </span>
                <span className="text-[11px] text-teal-200/80 font-medium">
                  (Didaftarkan pada 23 April 1996)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                Pertubuhan Rasmi Kepimpinan Pengetua & Guru Besar Sekolah Islam Malaysia
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-md cursor-pointer group"
            >
              <FileText className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Naskhah Ringkasan Perlembagaan</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsCMSOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Sunting Kandungan Pengenalan & Misi Melalui CMS"
              >
                <Edit3 className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">CMS</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-5xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-200">
              <BookOpen className="w-3.5 h-3.5 text-teal-700" />
              <span>Identiti & Asas Berpelembagaan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tentang {branding.orgName}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl">
              Ditubuhkan secara sah berpandukan perlembagaan yang berdaftar di bawah Jabatan Pendaftaran Pertubuhan Malaysia, bertindak sebagai wadah muafakat kebangsaan bagi memartabatkan kepimpinan sekolah Islam.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mt-4 rounded-full" />
          </div>
        </div>

        {/* Narrative & Institutional Profile */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-5 text-slate-700 text-base leading-relaxed bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-slate-800 text-sm leading-relaxed">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wide mb-1.5">
                <Scale className="w-4 h-4 text-teal-700" />
                <span>Ketetapan Fasal 1 & Fasal 2 Perlembagaan</span>
              </div>
              <p className="font-semibold text-slate-900 text-base">
                {visionMission.introParagraph1 || (
                  <>
                    <strong className="text-teal-900 font-bold">{branding.shortName}</strong> ialah pertubuhan kebangsaan berdaftar mengikut peruntukan Akta Pertubuhan 1966 dengan No. Pendaftaran ROS{' '}
                    <strong className="text-teal-950 font-bold">{branding.registrationNumber || 'PPM-002-10-23041996'}</strong> pada 23 April 1996.
                  </>
                )}
              </p>
            </div>

            <p>
              {visionMission.introParagraph2 ||
                `Berpaksikan ketetapan Fasal 3 Perlembagaan Pertubuhan, MPGBSIM berfungsi sebagai wadah penaung dan musyawarah kepimpinan tertinggi yang menghimpunkan para Pengetua, Guru Besar, dan Mudir dari seluruh pelusuk tanah air untuk memperkasakan profesionalisme pentadbiran, penyelarasan kurikulum bersama, serta kebajikan institusi pendidikan Islam.`}
            </p>

            <p>
              {visionMission.introParagraph3 || (
                <>
                  Mengikut <strong>Fasal 4 Perlembagaan</strong>, keahlian terbuka kepada dua kategori utama iaitu{' '}
                  <strong className="text-teal-900">Ahli Biasa (Fasal 4(2))</strong> bagi institusi rangkaian IKRAM Musleh dan{' '}
                  <strong className="text-teal-900">Ahli Bersekutu (Fasal 4(3))</strong> bagi institusi Rakan Musleh, SMKA, SABK, SMAN, SRAI, SAR dan Maahad Tahfiz swasta yang berdaftar di bawah moto keramat{' '}
                  <em className="font-semibold text-slate-900">“{branding.motto}”</em>.
                </>
              )}
            </p>

            {/* Registered Headquarters Box (Fasal 2) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Tempat Urusan & Alamat Berdaftar (Fasal 2):</span>
                  <span className="text-slate-600">
                    D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor Darul Ehsan.
                  </span>
                </div>
              </div>
              <a
                href="#hubungi"
                className="text-teal-700 hover:text-teal-800 font-bold underline shrink-0 self-start sm:self-auto"
              >
                Hubungi Kami
              </a>
            </div>

            {/* Official Maybank Account Box (Fasal 6(3)) */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950 block">Akaun Bank Rasmi Pertubuhan (Fasal 6(3)):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">Maybank: 562188100141</span>
                  <span className="text-slate-600 block text-[11px]">
                    Nama Akaun: PER MAJLIS GURU BESAR SEK-SEK ISLAM (M)
                  </span>
                </div>
              </div>
              <a
                href="#bayar-yuran"
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-2xs shrink-0 self-start sm:self-auto transition text-center"
              >
                Semak Yuran Fasal 6
              </a>
            </div>

            {/* Key Pillars */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{visionMission.pillar1Title || 'Tujuan & Matlamat (Fasal 3)'}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {visionMission.pillar1Desc || 'Penyelarasan kurikulum bersepadu, latihan ikhtisas PGB dan advokasi dasar rasmi.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition">
                <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{visionMission.pillar2Title || 'Keahlian Berpelembagaan (Fasal 4)'}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {visionMission.pillar2Desc || 'Penyatuan inklusif Ahli Biasa dan Ahli Bersekutu bagi melahirkan generasi Rabbani seimbang.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vision & Mission Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tag Perancangan Strategik */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>{visionMission.strategicPlanTitle || 'Pelan Strategik Kepimpinan Pendidikan Islam MPGBSIM'}</span>
            </div>

            {/* Vision Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-teal-300 pointer-events-none">
                <Eye className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Eye className="w-4 h-4" />
                <span>Visi MPGBSIM</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-snug">
                “{visionMission.vision}”
              </h3>
              <p className="text-xs text-teal-200/80 mt-2 font-medium leading-relaxed">
                {visionMission.visionSub}
              </p>
            </div>

            {/* Mission Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
                  <Target className="w-4 h-4 text-teal-600" />
                  <span>Misi Berteraskan Perlembagaan</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Fasal 3
                </span>
              </div>
              <ul className="space-y-3 text-sm text-slate-800">
                {visionMission.missions.map((missionText, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-teal-50/40 transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {idx + 1}
                    </div>
                    <span className="font-medium text-xs sm:text-sm leading-relaxed text-slate-800">
                      {missionText}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 7 Tujuan & Matlamat Rasmi (Fasal 3 Perlembagaan MPGBSIM) */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Target className="w-3.5 h-3.5 text-teal-700" />
              <span>Fasal 3 Perlembagaan Pertubuhan</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              7 Tujuan & Matlamat Utama MPGBSIM
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Berdasarkan Fasal 3 Perlembagaan Pertubuhan (PPM-002-10-23041996), berikut merupakan tujuh mandat statutori yang diamanahkan kepada kepimpinan majlis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 3(1) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
                    Fasal 3(1)
                  </span>
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Penyatuan Ukhuwah & Permuafakatan PGB
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Menyatukan para Pengetua, Guru Besar dan Mudir sekolah-sekolah Islam seluruh Malaysia dalam ikatan ukhuwah ikhtisas rasmi sebagai wadah musyawarah berwibawa.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
                <span>Rangkaian Kebangsaan</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
            </div>

            {/* 3(2) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
                    Fasal 3(2)
                  </span>
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Peningkatan Mutu Pendidikan Bersepadu
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Meningkatkan mutu pendidikan Islam yang holistik merangkumi kurikulum kebangsaan (KPM), kurikulum diniyah bersepadu dan pengajian tahfiz Al-Quran.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
                <span>Kurikulum & Diniyah</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
            </div>

            {/* 3(3) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
                    Fasal 3(3)
                  </span>
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Latihan Kepimpinan Ikhtisas Berterusan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Menganjurkan program pembangunan profesionalisme kepimpinan, kursus kompetensi instruksional pentadbir, wacana ilmiah, dan konvensyen pendidikan kebangsaan.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
                <span>Kompetensi PGB</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
            </div>

            {/* 3(4) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
                    Fasal 3(4)
                  </span>
                  <Award className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Penyelarasan Kurikulum & Peperiksaan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Menyelaras standard kurikulum, kokurikulum, pentaksiran sahsiah, dan sistem peperiksaan bersama sekolah-sekolah Islam ahli demi kemenjadian murid yang seimbang.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
                <span>Standard Peperiksaan</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
            </div>

            {/* 3(5) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
                    Fasal 3(5)
                  </span>
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Jaringan Kerjasama & Amalan Terbaik
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Membina jaringan perkongsian pintar (smart partnership), penyelidikan amalan terbaik kepimpinan pentadbiran, dan penandaarasan kualiti serantau serta antarabangsa.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
                <span>Perkongsian Pintar</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
            </div>

            {/* 3(6) & 3(7) Combined Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-md border border-teal-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-xs">
                      Fasal 3(6)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-800 text-teal-200 font-bold text-xs">
                      Fasal 3(7)
                    </span>
                  </div>
                  <Scale className="w-5 h-5 text-amber-300" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">
                  Tabung Kebajikan & Advokasi Dasar Rasmi
                </h4>
                <p className="text-xs text-teal-100/90 leading-relaxed">
                  <strong>Fasal 3(6):</strong> Mentadbir tabung dana kebajikan bagi menjaga kemaslahatan ahli dan warga sekolah. <br className="my-1" />
                  <strong>Fasal 3(7):</strong> Menjadi badan advokasi dan perundingan dasar rasmi bersama KPM, JAKIM, MAIN dan JAIN.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                <span>Advokasi & Kebajikan</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Struktur Keahlian Mengikut Fasal 4 Perlembagaan */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5 text-teal-700" />
              <span>Fasal 4 Perlembagaan Pertubuhan</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Struktur Keahlian MPGBSIM
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Perlembagaan membahagikan keahlian kepada dua kategori rasmi bagi memastikan penglibatan inklusif semua institusi pendidikan Islam di Malaysia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Ahli Biasa Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-emerald-500/40 shadow-sm relative hover:border-emerald-600 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    Kategori 1 • Fasal 4(2)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Hak Penuh & Undi
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 mb-2">
                  Ahli Biasa (Fasal 4(2))
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Terbuka kepada Pengetua, Guru Besar dan Mudir daripada institusi rangkaian IKRAM Musleh yang berdaftar di seluruh Malaysia.
                </p>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Mempunyai <strong>hak bersuara penuh</strong> dan hak mengundi dalam Mesyuarat Agung Tahunan (AGM).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Layak dicalonkan dan dipilih menganggotai Majlis Jawatankuasa Kerja Kebangsaan (Fasal 8).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Yuran tahunan berperingkat Fasal 6(1): RM100 (1–3 tahun), RM300 (≤300 murid), RM600 (≥301 murid).</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Rangkaian IKRAM Musleh</span>
                <a
                  href="#bayar-yuran"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <span>Kadar Yuran Fasal 6(1)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Ahli Bersekutu Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-indigo-400/40 shadow-sm relative hover:border-indigo-600 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs uppercase tracking-wider">
                    Kategori 2 • Fasal 4(3)
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    Jaringan Kerjasama
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 mb-2">
                  Ahli Bersekutu (Fasal 4(3))
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Terbuka kepada Pengetua, Guru Besar dan Mudir institusi Rakan Musleh, SMKA, SABK, SMAN, SRAI, SAR dan Maahad Tahfiz berdaftar.
                </p>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Menyertai latihan ikhtisas, kursus kompetensi PGB, dan konvensyen pendidikan kebangsaan (Fasal 3(3)).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Hadir sebagai pemerhati rasmi dalam Mesyuarat Agung Tahunan (Fasal 4(7)).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Yuran tahunan berperingkat Fasal 6(2): RM200 (1–3 tahun), RM500 (≤300 murid), RM800 (≥301 murid).</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">SMKA, SABK, SMAN & Tahfiz</span>
                <a
                  href="#bayar-yuran"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-800"
                >
                  <span>Kadar Yuran Fasal 6(2)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action for Constitution Digest */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-amber-50 border border-teal-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4 text-teal-700" />
              <span>Dokumentasi Berdaftar Pertubuhan</span>
            </div>
            <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Ketahui Lebih Lanjut Mengenai Perlembagaan Rasmi MPGBSIM
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Semak ringkasan komprehensif bagi Fasal 1 sehingga Fasal 10 merangkumi statut tatakelola, tadbir urus AGM, pemilihan Majlis Jawatankuasa Kerja Kebangsaan, serta amanah Bendahari dan Juruaudit.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-md shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Buka Ringkasan 10 Fasal Perlembagaan</span>
          </button>
        </div>
      </div>

      {/* Modal: Ringkasan Lengkap Perlembagaan MPGBSIM (10 Fasal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <Landmark className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-teal-900 px-2 py-0.5 rounded border border-teal-700">
                      Naskhah Rujukan Rasmi
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">
                      ROS: PPM-002-10-23041996
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    Ringkasan Perlembagaan MPGBSIM (Fasal 1 – 10)
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Tabs Filter */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari fasal, matlamat, yuran, keahlian, atau jawatankuasa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>
              {copiedText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Petikan {copiedText} disalin!</span>
                </div>
              )}
            </div>

            {/* Modal Body: Clause Listing */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {filteredClauses.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Tiada fasal yang sepadan dengan carian "{searchQuery}".
                </div>
              ) : (
                filteredClauses.map((clause) => (
                  <div
                    key={clause.fasal}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-teal-400 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-teal-800 text-amber-300 font-bold text-xs">
                          Fasal {clause.fasal}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {clause.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleCopyClause(clause)}
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:border-teal-300 transition self-start sm:self-auto cursor-pointer"
                        title="Salin petikan fasal perlembagaan"
                      >
                        Salin Petikan
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                      {clause.summary}
                    </p>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-2 text-xs text-slate-700">
                      {clause.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Info className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  Dokumen rasmi dipelihara di bawah Seksyen 7 Akta Pertubuhan 1966 (Pendaftar Pertubuhan Malaysia).
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer self-end sm:self-auto"
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
