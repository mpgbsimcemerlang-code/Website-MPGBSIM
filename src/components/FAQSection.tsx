import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  ExternalLink,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  CreditCard,
  Users,
} from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'Keahlian & Perlembagaan' | 'Yuran & Pendaftaran' | 'Portal & Digital PGB' | 'Program & Direktori';
  question: string;
  answer: string;
  keywords: string[];
  actionLabel?: string;
  actionTarget?: 'portal' | 'bayar-yuran' | 'sekolah-ahli' | 'hubungi' | 'program';
}

export const MPGBSIM_FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Keahlian & Perlembagaan',
    question: 'Apakah itu Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)?',
    answer:
      'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) ialah pertubuhan rasmi peringkat kebangsaan berdaftar di bawah Jabatan Pendaftaran Pertubuhan Malaysia (No. Pendaftaran: PPM-002-10-23041996, ditubuhkan pada 23 April 1996). MPGBSIM berperanan sebagai wadah penyatuan, pemerkasaan profesionalisme kepimpinan, penyelarasan kurikulum bersepadu Rabbani, serta jaringan kerjasama strategik bagi Pengetua dan Guru Besar Sekolah-Sekolah Islam di seluruh Malaysia.',
    keywords: ['MPGBSIM', 'PPM-002-10-23041996', 'Pertubuhan Pengetua Guru Besar', 'Sekolah Islam Malaysia'],
    actionLabel: 'Kenali Sejarah & Visi MPGBSIM',
    actionTarget: 'portal',
  },
  {
    id: 'faq-2',
    category: 'Keahlian & Perlembagaan',
    question: 'Apakah perbezaan antara kategori Ahli Biasa (Fasal 4(2)) dan Ahli Bersekutu (Fasal 4(3)) MPGBSIM?',
    answer:
      'Mengikut Fasal 4 Perlembagaan MPGBSIM, keahlian terbahagi kepada dua kategori utama: (1) Ahli Biasa (Fasal 4(2)) merangkumi Pengetua dan Guru Besar daripada Sekolah-Sekolah Islam Malaysia di bawah rangkaian IKRAM Musleh (Sekolah Rendah Islam dan Sekolah Menengah Islam); manakala (2) Ahli Bersekutu (Fasal 4(3)) terbuka kepada Pengetua dan Guru Besar daripada Sekolah Rangkaian / Rakan Musleh, Sekolah Agama Bantuan Kerajaan (SABK), SMKA, SMAN, SRAI, SAR/KAFA, serta Maahad Tahfiz berdaftar di seluruh negeri.',
    keywords: ['Ahli Biasa', 'Ahli Bersekutu', 'Fasal 4 Perlembagaan MPGBSIM', 'IKRAM Musleh', 'Rakan Musleh', 'SABK', 'Maahad Tahfiz'],
    actionLabel: 'Semak Direktori Sekolah Ahli',
    actionTarget: 'sekolah-ahli',
  },
  {
    id: 'faq-3',
    category: 'Yuran & Pendaftaran',
    question: 'Bagaimanakah cara mendaftar keahlian baharu sekolah dan mengakses Portal Rasmi Ahli PGB MPGBSIM?',
    answer:
      'Pengetua atau Guru Besar boleh mendaftar secara dalam talian dengan menekan butang "Portal Ahli PGB" di laman web rasmi https://www.mpgbsim.org/ dan memilih tab "Pendaftaran Keahlian Baharu". Selepas melengkapkan maklumat Pengetua/Guru Besar, kod sekolah, kategori institusi serta muat naik logo sekolah, permohonan akan disahkan oleh Urus Setia Kebangsaan untuk akses penuh ke Kad Keahlian Digital, Direktori PGB, dan sijil rasmi.',
    keywords: ['Daftar Ahli MPGBSIM', 'Log Masuk Portal PGB', 'Pendaftaran Sekolah Islam', 'Kad Keahlian Digital'],
    actionLabel: 'Buka Portal Ahli PGB Sekarang',
    actionTarget: 'portal',
  },
  {
    id: 'faq-4',
    category: 'Yuran & Pendaftaran',
    question: 'Berapakah kadar yuran keahlian tahunan MPGBSIM dan bagaimanakah kaedah pembayarannya?',
    answer:
      'Pembayaran yuran pendaftaran keahlian, yuran tahunan ahli/sekolah, serta sumbangan program kebangsaan MPGBSIM boleh dijelaskan secara dalam talian dengan selamat melalui gerbang pembayaran rasmi HerePay MPGBSIM (menyokong FPX Perbankan Internet, DuitNow QR, dan Kad Debit/Kredit). Resit rasmi digital dijana secara automatik dan direkodkan terus di dalam Portal Ahli PGB untuk rujukan audit sekolah.',
    keywords: ['Yuran Tahunan MPGBSIM', 'HerePay MPGBSIM', 'Bayar Yuran PGB', 'FPX DuitNow QR', 'Resit Rasmi Sekolah'],
    actionLabel: 'Ke Seksyen Bayaran Yuran',
    actionTarget: 'bayar-yuran',
  },
  {
    id: 'faq-5',
    category: 'Portal & Digital PGB',
    question: 'Apakah manfaat utama dan kemudahan eksklusif di dalam Portal Rasmi Ahli PGB MPGBSIM?',
    answer:
      'Ahli berdaftar menikmati pelbagai kemudahan eksklusif termasuk: (1) Kad Pengenalan Keahlian Digital dengan Kod QR Verifikasi Rasmi; (2) Cetakan Rekod Profil Rasmi Kepimpinan & Institusi 1 muka surat A4 (format PDF); (3) Hub AI & Digital PGB untuk penjanaan draf pelan strategik sekolah, kertas kerja dana wakaf/CSR, teks ucapan tazkirah, dan intervensi akademik; (4) Ruang Sembang Live PGB untuk komunikasi terus 1-ke-1 bersama rakan PGB seluruh Malaysia; serta (5) Muat turun dokumen pekeliling, perlembagaan, dan kertas kerja konvensyen.',
    keywords: ['Manfaat Keahlian MPGBSIM', 'Hub AI Kepimpinan PGB', 'Sembang Live PGB', 'Rekod Profil PDF', 'Pekeliling Sekolah Islam'],
    actionLabel: 'Terokai Portal Rasmi PGB',
    actionTarget: 'portal',
  },
  {
    id: 'faq-6',
    category: 'Program & Direktori',
    question: 'Bagaimanakah cara mencari maklumat dan lokasi Sekolah-Sekolah Islam Ahli MPGBSIM mengikut negeri?',
    answer:
      'Pengunjung, ibu bapa, dan warga pendidik boleh melayari seksyen "Direktori Sekolah-Sekolah Islam Ahli" di laman utama MPGBSIM yang dilengkapi Peta Interaktif Malaysia. Anda boleh menapis sekolah mengikut negeri (Selangor, Johor, Melaka, Kelantan, Terengganu, Kedah, Perak, Pahang, Negeri Sembilan, Pulau Pinang, Perlis, Sabah, Sarawak dan Wilayah Persekutuan), kategori sekolah (Sekolah Rendah, Sekolah Menengah, Maahad Tahfiz, Rakan Musleh), atau membuat carian terus mengikut nama sekolah dan kod pendaftaran.',
    keywords: ['Direktori Sekolah Islam Malaysia', 'Peta Sekolah Islam', 'Senarai SMIM SRIM Malaysia', 'Carian Kod Sekolah'],
    actionLabel: 'Lihat Peta & Direktori Sekolah',
    actionTarget: 'sekolah-ahli',
  },
  {
    id: 'faq-7',
    category: 'Program & Direktori',
    question: 'Apakah program tahunan, konvensyen kepimpinan, dan takwim peperiksaan yang diselaraskan oleh MPGBSIM?',
    answer:
      'MPGBSIM menganjurkan Konvensyen Kepimpinan Pendidikan Islam Kebangsaan, Mesyuarat Agung Tahunan (AGM), Bengkel Pengurusan Strategik PGB, Wacana Kurikulum Dini & Tahfiz STEM, serta Lawatan Penanda Aras Antarabangsa. Selain itu, portal ini menyediakan Kalendar & Countdown Peperiksaan Awam serta Dini seperti SPM, UPKK, dan Syahadah Perguruan Pendidikan Islam Musleh (SPPIM) bagi membantu sekolah merancang takwim akademik tahunan.',
    keywords: ['Konvensyen Kepimpinan MPGBSIM', 'Mesyuarat Agung Tahunan AGM', 'Takwim Peperiksaan SPM UPKK SPPIM', 'Amalan Terbaik Sekolah'],
    actionLabel: 'Semak Takwim & Program',
    actionTarget: 'program',
  },
  {
    id: 'faq-8',
    category: 'Keahlian & Perlembagaan',
    question: 'Bagaimanakah cara menghubungi Sekretariat Kebangsaan MPGBSIM untuk urusan rasmi atau perkongsian amalan terbaik?',
    answer:
      'Urus Setia Kebangsaan MPGBSIM beroperasi di alamat D/A 9, Jalan Dagang Sb 4/1, Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor Darul Ehsan. Sebarang surat rasmi, permohonan kolaborasi pendidikan, atau penghantaran kertas kajian Amalan Terbaik (Best Practice) boleh disalurkan melalui talian telefon 03-4251 6157 / 03-4251 6167, e-mel rasmi mpgbsim.cemerlang@gmail.com, atau melalui Borang Pertanyaan di seksyen Hubungi Kami.',
    keywords: ['Alamat Sekretariat MPGBSIM', 'Nombor Telefon MPGBSIM', 'mpgbsim.cemerlang@gmail.com', 'Seri Kembangan Selangor'],
    actionLabel: 'Hubungi Urus Setia',
    actionTarget: 'hubungi',
  },
];

interface FAQSectionProps {
  onOpenPortal?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenPortal,
  onNavigateSection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-2', 'faq-3']);

  const categories = [
    'Semua',
    'Keahlian & Perlembagaan',
    'Yuran & Pendaftaran',
    'Portal & Digital PGB',
    'Program & Direktori',
  ];

  const filteredFaqs = useMemo(() => {
    return MPGBSIM_FAQ_LIST.filter((item) => {
      const matchesCat =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    if (openIds.length === filteredFaqs.length) {
      setOpenIds([]);
    } else {
      setOpenIds(filteredFaqs.map((f) => f.id));
    }
  };

  const handleActionClick = (target?: FAQItem['actionTarget']) => {
    if (!target) return;
    if (target === 'portal') {
      if (onOpenPortal) onOpenPortal();
      return;
    }
    if (onNavigateSection) {
      onNavigateSection(target);
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="soalan-lazim"
      aria-labelledby="faq-heading"
      itemScope
      itemType="https://schema.org/FAQPage"
      className="py-20 bg-white border-b border-slate-200 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-800 mb-2">
              <HelpCircle className="w-4 h-4 text-teal-700" />
              <span>Panduan & Rujukan Rasmi Keahlian</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-amber-700">Fasal 4 Perlembagaan MPGBSIM</span>
            </div>
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              Soalan Lazim (FAQ) Keahlian & Portal MPGBSIM
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Jawapan lengkap berkaitan syarat kelayakan keahlian sekolah Islam (Ahli Biasa &amp; Ahli Bersekutu), pendaftaran Portal Rasmi PGB, pembayaran yuran tahunan HerePay, serta jaringan direktori kebangsaan.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-teal-700 to-amber-500 mt-4 rounded-full" />
          </div>

          {/* Search & Expand Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[260px] sm:min-w-[300px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci keahlian, yuran, PGB..."
                aria-label="Cari soalan lazim MPGBSIM"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-600 outline-none transition"
              />
            </div>
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer shrink-0"
            >
              {openIds.length === filteredFaqs.length && filteredFaqs.length > 0
                ? 'Tutup Semua Jawapan'
                : 'Buka Semua Jawapan'}
            </button>
          </div>
        </div>

        {/* Interactive Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl mb-8 w-fit max-w-full">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List with Schema.org Microdata */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-3.5">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <p className="text-sm font-bold text-slate-800">
                  Tiada soalan lazim ditemui untuk carian &ldquo;{searchQuery}&rdquo;.
                </p>
                <p className="text-xs text-slate-500">
                  Sila cuba kata kunci lain atau pilih kategori &ldquo;Semua&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                  }}
                  className="mt-2 px-4 py-2 rounded-lg bg-teal-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Set Semula Carian
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIds.includes(faq.id);
                return (
                  <article
                    key={faq.id}
                    itemScope
                    itemProp="mainEntity"
                    itemType="https://schema.org/Question"
                    className={`rounded-2xl border transition-all duration-200 ${
                      isOpen
                        ? 'bg-white border-teal-700/40 shadow-md'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200'
                    }`}
                  >
                    <h3 className="m-0">
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        aria-expanded={isOpen}
                        className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer"
                      >
                        <div className="space-y-1.5 pr-2">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-teal-800">
                            <span>0{index + 1}.</span>
                            <span aria-hidden="true">·</span>
                            <span>{faq.category}</span>
                          </div>
                          <span
                            itemProp="name"
                            className="block text-sm sm:text-base font-bold text-slate-900 leading-snug"
                          >
                            {faq.question}
                          </span>
                        </div>
                        <span
                          className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                            isOpen
                              ? 'bg-teal-900 text-amber-300 rotate-180'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>
                    </h3>

                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                      className={isOpen ? 'block px-5 pb-5 sm:px-6 sm:pb-6 pt-0' : 'hidden'}
                    >
                      <div className="pt-3 border-t border-slate-100">
                        <p
                          itemProp="text"
                          className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                        >
                          {faq.answer}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-500">Topik berkaitan:</span>
                            {faq.keywords.map((kw, kIdx) => (
                              <React.Fragment key={kw}>
                                {kIdx > 0 && <span aria-hidden="true">·</span>}
                                <span>{kw}</span>
                              </React.Fragment>
                            ))}
                          </div>

                          {faq.actionLabel && faq.actionTarget && (
                            <button
                              type="button"
                              onClick={() => handleActionClick(faq.actionTarget)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-amber-700 transition cursor-pointer shrink-0"
                            >
                              <span>{faq.actionLabel}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Right Column: Summary Cards for Membership & Quick Actions */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  Ringkasan Perlembagaan MPGBSIM
                </p>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  Kategori Keahlian Rasmi (Fasal 4)
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Terbuka kepada semua barisan Pengetua dan Guru Besar Sekolah-Sekolah Islam berdaftar di seluruh Malaysia.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>1. Ahli Biasa — Fasal 4(2)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Pengetua &amp; Guru Besar Sekolah-Sekolah Islam Malaysia di bawah rangkaian IKRAM Musleh (SRI &amp; SMI).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-teal-300">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>2. Ahli Bersekutu — Fasal 4(3)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Pengetua &amp; Guru Besar Sekolah Rangkaian / Rakan Musleh, SABK, SMKA, SMAN, SRAI, SAR/KAFA &amp; Maahad Tahfiz.
                  </p>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleActionClick('portal')}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Daftar / Log Masuk Portal PGB</span>
                </button>
                <a
                  href="https://app.herepay.org/mpgbsim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>Gerbang Yuran Rasmi HerePay</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-950 space-y-3">
              <div>
                <strong className="font-bold block text-sm text-teal-900">
                  Tanya Mursyid AI (Pembantu Pintar MPGBSIM)
                </strong>
                <p className="text-slate-600 leading-relaxed mt-1">
                  Ada soalan khusus mengenai senarai sekolah ahli, perlembagaan, jawatankuasa kepimpinan, atau cara reset kata laluan Portal PGB? Tanya terus kepada <strong>Mursyid AI</strong> atau hubungi Sekretariat di talian <strong>03-4251 6157 / 03-4251 6167</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-mursyid-ai'))}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-900 hover:bg-teal-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <span>Buka Sembang Mursyid AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
