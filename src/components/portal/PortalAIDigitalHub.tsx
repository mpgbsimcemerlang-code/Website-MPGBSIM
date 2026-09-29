import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Layers,
  Search,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Database,
  Users,
  Compass,
} from 'lucide-react';
import { AI_PROMPTS_LIBRARY, AI_TOOLS_LIST } from '../../data/portalMockData';
import { AIPromptItem } from '../../types';

export const PortalAIDigitalHub: React.FC = () => {
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string>('Semua');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabSection, setActiveTabSection] = useState<
    'all' | 'kepimpinan' | 'pentadbiran' | 'kurikulum' | 'hem' | 'data' | 'prompts' | 'tools'
  >('all');

  const categories = ['Semua', 'Kepimpinan', 'Pentadbiran', 'Kurikulum', 'HEM', 'Data & Analisis', 'Tarbiah & Sahsiah'];

  const filteredPrompts = AI_PROMPTS_LIBRARY.filter((item) => {
    const matchCat = selectedPromptCategory === 'Semua' || item.category === selectedPromptCategory;
    const matchQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleCopyPrompt = (promptItem: AIPromptItem) => {
    navigator.clipboard.writeText(promptItem.prompt);
    setCopiedPromptId(promptItem.id);
    setTimeout(() => {
      setCopiedPromptId(null);
    }, 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-purple-900/50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Biro Transformasi Digital MPGBSIM
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            AI & DIGITAL HUB SEKOLAH ISLAM
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-purple-200 leading-relaxed max-w-2xl">
            Panduan strategik, pustaka prompt sedia guna, dan alatan kecerdasan buatan (AI) beretika untuk memperkasa kecekapan Pengetua dan Guru Besar.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-purple-300">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">✓ Beretika Syariah</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">✓ Perlindungan Privasi Murid</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs">✓ Prompt Teruji di Sekolah</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for the 7 Sections */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'Semua Fokus' },
          { id: 'kepimpinan', label: '1. AI Kepimpinan' },
          { id: 'pentadbiran', label: '2. AI Pentadbiran' },
          { id: 'kurikulum', label: '3. AI Kurikulum' },
          { id: 'hem', label: '4. AI HEM' },
          { id: 'data', label: '5. AI Data' },
          { id: 'prompts', label: '6. Prompt Library' },
          { id: 'tools', label: '7. Alatan AI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabSection(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTabSection === tab.id
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5 Pillars of Educational AI Framework (Sections 1 to 5) */}
      {(activeTabSection === 'all' ||
        ['kepimpinan', 'pentadbiran', 'kurikulum', 'hem', 'data'].includes(activeTabSection)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Section 1: AI untuk Kepimpinan */}
          {(activeTabSection === 'all' || activeTabSection === 'kepimpinan') && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">1. AI untuk Kepimpinan</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Menyokong perancangan strategik 5 tahun, perangkaan wawasan sekolah Rabbani, penulisan amanat tahunan dan komunikasi empati bersama pemegang taruh.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-600 font-bold">•</span>
                    Draf Pelan Strategik Berasaskan Aspirasi KPM & Dini
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-600 font-bold">•</span>
                    Penulisan Teks Ucapan Tazkirah Perhimpunan
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-600 font-bold">•</span>
                    Penilaian Prestasi & Maklum Balas Membina Guru
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 2: AI untuk Pentadbiran */}
          {(activeTabSection === 'all' || activeTabSection === 'pentadbiran') && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">2. AI untuk Pentadbiran</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Mempercepatkan automasi surat-menyurat rasmi, penyediaan kertas kerja permohonan dana wakaf, dan peringkasan minit mesyuarat pengurusan.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    Kertas Kerja Memohon Dana Sumbangan & CSR
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    Format Minit Mesyuarat Tindakan Segera
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    SOP Pengurusan Premis & Keselamatan Asrama
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 3: AI untuk Kurikulum */}
          {(activeTabSection === 'all' || activeTabSection === 'kurikulum') && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-4">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">3. AI untuk Kurikulum</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Menghubungkan pedagogi terbeza, penjanaan soalan KBAT dwibahasa, integrasi hafazan tahfiz dengan STEM, dan pemulihan mata pelajaran kritikal.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    Pelan Intervensi Murid Percubaan SPM
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    Jadual Waktu Murajaah & Tahfiz Terbeza
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    Rubrik Penilaian Kurikulum Dini & Azhari
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 4: AI untuk HEM */}
          {(activeTabSection === 'all' || activeTabSection === 'hem') && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">4. AI untuk HEM & Sahsiah</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Pengesanan awal isu emosi dan tekanan asrama, modul pembinaan kepimpinan pengawas, serta komunikasi pantas mengendalikan isu viral media sosial.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    SOP Komunikasi Krisis & Isu Tular Media
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    Modul Tarbiah & Biah Solehah Asrama
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    Analisis Kehadiran & Amaran Awal Ponteng
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 5: AI untuk Data */}
          {(activeTabSection === 'all' || activeTabSection === 'data') && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center mb-4">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">5. AI untuk Data & Analitik</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Menganalisis maklum balas Google Form ibu bapa (PIBG), mengesan trend pencapaian peperiksaan dan merumuskan beban tugas guru berasaskan data sahih.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    Analisis Sentimen Kaji Selidik Ibu Bapa PIBG
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    Sintesis Laporan Tahunan Sekolah Ahli
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-rose-600 font-bold">•</span>
                    Unjuran Enrolmen & Kapasiti Bilik Darjah
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: PROMPT LIBRARY */}
      {(activeTabSection === 'all' || activeTabSection === 'prompts') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                6. Pustaka Prompt Sedia Guna (Prompt Library)
              </div>
              <h2 className="text-xl font-black text-slate-900">Prompt Library Pengetua & Guru Besar</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Salin prompt dengan 1-klik dan tampal terus ke Google Gemini atau ChatGPT untuk hasil kerja profesional.
              </p>
            </div>

            {/* Prompt category filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedPromptCategory(c)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedPromptCategory === c
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPrompts.map((p) => {
              const isCopied = copiedPromptId === p.id;
              return (
                <div
                  key={p.id}
                  className="rounded-3xl p-5 bg-slate-50 border border-slate-200 hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">
                        {p.category}
                      </span>
                      <button
                        onClick={() => handleCopyPrompt(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 shadow-xs'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Disalin!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Salin Prompt
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.description}</p>

                    {/* Prompt Box */}
                    <div className="mt-3 p-3.5 rounded-2xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                      {p.prompt}
                    </div>

                    {/* Usage Instructions */}
                    <div className="mt-3 p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Cara Penggunaan:</strong> {p.usageInstructions}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-1">
                    {p.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 7: TOOLS & RESOURCES */}
      {(activeTabSection === 'all' || activeTabSection === 'tools') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              7. Alatan AI Disyorkan untuk Sekolah Islam
            </div>
            <h2 className="text-xl font-black text-slate-900">Tools & Resources Terpilih</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alatan digital yang diuji untuk keselamatan data peribadi dan mesra kegunaan pendidikan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_TOOLS_LIST.map((tool) => (
              <div
                key={tool.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900">
                      {tool.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{tool.category}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{tool.name}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{tool.description}</p>

                  <div className="mt-3 p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700">
                    <strong className="text-teal-900 block">Sangat Sesuai Untuk:</strong>
                    <span>{tool.bestFor}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-right">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline"
                  >
                    Buka Platform <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
