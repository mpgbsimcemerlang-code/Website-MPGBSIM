import React, { useState } from 'react';
import { NetworkStats, MemberSchool } from '../types';
import { MALAYSIA_STATES, SCHOOL_TYPES } from '../data/constants';
import { useAdminContent } from '../context/AdminContentContext';
import {
  School,
  MapPin,
  Users,
  Search,
  SlidersHorizontal,
  Info,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Building2,
  AlertCircle,
  X,
  Eye,
  Globe,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface SchoolNetworkProps {
  stats: NetworkStats;
  onUpdateStats: (newStats: NetworkStats) => void;
  schools: MemberSchool[];
}

export const SchoolNetworkSection: React.FC<SchoolNetworkProps> = ({
  stats,
  onUpdateStats,
  schools
}) => {
  const { isAdmin, setIsCMSOpen } = useAdminContent();
  const [isEditing, setIsEditing] = useState(false);
  const [tempStats, setTempStats] = useState<NetworkStats>({ ...stats });

  // School profile modal state
  const [selectedSchool, setSelectedSchool] = useState<MemberSchool | null>(null);

  // Derive live school record so modal immediately reflects CMS profile updates
  const activeSchool = selectedSchool
    ? schools.find(
        (s) =>
          s.id === selectedSchool.id ||
          (selectedSchool.code && s.code && s.code.toLowerCase() === selectedSchool.code.toLowerCase())
      ) || selectedSchool
    : null;

  // Directory Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('Semua Negeri');
  const [selectedType, setSelectedType] = useState('Semua Jenis Sekolah');

  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStats({ ...tempStats });
    setIsEditing(false);
  };

  const handleResetStats = () => {
    const defaultVals: NetworkStats = {
      schoolsCount: 420,
      statesCount: 14,
      principalsCount: 850,
      studentsBenefited: '180,000+',
      isPlaceholder: true,
    };
    setTempStats(defaultVals);
    onUpdateStats(defaultVals);
    setIsEditing(false);
  };

  // Filter schools
  const normalizeCategory = (t?: string) => {
    if (!t) return 'Sekolah Menengah';
    const c = t.trim();
    if (c === 'Sekolah Rendah' || c === 'Sekolah Menengah' || c === 'Maahad Tahfiz' || c === 'Rakan Musleh') return c;
    if (c.includes('Rendah') || c.includes('SRI')) return 'Sekolah Rendah';
    if (c.includes('Tahfiz')) return 'Maahad Tahfiz';
    if (c.includes('Musleh')) return 'Rakan Musleh';
    return 'Sekolah Menengah';
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = selectedState === 'Semua Negeri' || school.state === selectedState;
    const matchesType = selectedType === 'Semua Jenis Sekolah' || normalizeCategory(school.type) === selectedType;

    return matchesSearch && matchesState && matchesType;
  });

  return (
    <section id="sekolah-ahli" className="py-20 bg-slate-100/70 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider mb-3">
            <School className="w-3.5 h-3.5 text-teal-700" />
            <span>Rangkaian Pendidikan Islam</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Rangkaian Sekolah-Sekolah Ahli MPGBSIM
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Jaringan kolaborasi kepimpinan merangkumi SRI, SMI, Maahad Tahfiz & Rakan Musleh dibawah Musleh Integrated Education Berhad (MIEB) di seluruh tanah air.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Clear Placeholder Disclaimer Badge */}
        {stats.isPlaceholder && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-900">
                  PEMBERITAHUAN: Nilai Statistik Adalah Pemegang Tempat (Placeholder Rasmi)
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Angka yang dipaparkan adalah anggaran sementara sehingga bancian rasmi keahlian MPGBSIM 2026 selesai dimuktamadkan oleh Urus Setia.
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCMSOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  <span>Buka CMS Statistik</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-xs shrink-0 cursor-pointer border border-amber-300 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-900" />
                  <span>{isEditing ? 'Tutup' : 'Sunting Cepat'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* If placeholder is hidden but user is admin, show a small edit button */}
        {!stats.isPlaceholder && isAdmin && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsCMSOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-700" />
              <span>Sunting Statistik Rangkaian (CMS)</span>
            </button>
          </div>
        )}

        {/* Editable Form Modal / Drawer if editing mode active */}
        {isEditing && (
          <form
            onSubmit={handleSaveStats}
            className="mb-8 p-6 rounded-xl bg-white border-2 border-amber-300 shadow-md animate-fadeIn"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                <span>Ubah Suai Nilai Statistik Placeholder (Untuk Ujian & Demonstrasi)</span>
              </h4>
              <button
                type="button"
                onClick={handleResetStats}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Set Semula Default
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bilangan Sekolah (Placeholder)
                </label>
                <input
                  type="number"
                  value={tempStats.schoolsCount}
                  onChange={(e) =>
                    setTempStats({ ...tempStats, schoolsCount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bilangan Negeri & Wilayah
                </label>
                <input
                  type="number"
                  value={tempStats.statesCount}
                  onChange={(e) =>
                    setTempStats({ ...tempStats, statesCount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  min="1"
                  max="16"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bilangan Pengetua & Guru Besar
                </label>
                <input
                  type="number"
                  value={tempStats.principalsCount}
                  onChange={(e) =>
                    setTempStats({ ...tempStats, principalsCount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> Simpan Perubahan Paparan
              </button>
            </div>
          </form>
        )}

        {/* 3 Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stat 1: Schools */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center">
            <span className="absolute top-3 right-3 text-[10px] uppercase font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
              Placeholder
            </span>
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-4">
              <School className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1 font-mono tracking-tight">
              {stats.schoolsCount}+
            </div>
            <p className="text-sm font-bold text-slate-700">Sekolah-Sekolah Ahli</p>
            <p className="text-xs text-slate-500 mt-1">
              SRI, SMI, Maahad Tahfiz & Rakan Musleh
            </p>
          </div>

          {/* Stat 2: States */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center">
            <span className="absolute top-3 right-3 text-[10px] uppercase font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
              Liputan Penuh
            </span>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1 font-mono tracking-tight">
              {stats.statesCount}
            </div>
            <p className="text-sm font-bold text-slate-700">Negeri & Wilayah Persekutuan</p>
            <p className="text-xs text-slate-500 mt-1">
              Rangkaian menyeluruh Semenanjung, Sabah & Sarawak
            </p>
          </div>

          {/* Stat 3: Principals & Headteachers */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center">
            <span className="absolute top-3 right-3 text-[10px] uppercase font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
              Placeholder
            </span>
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1 font-mono tracking-tight">
              {stats.principalsCount}+
            </div>
            <p className="text-sm font-bold text-slate-700">Pengetua & Guru Besar</p>
            <p className="text-xs text-slate-500 mt-1">
              Pemimpin instruksional berjiwa Rabbani
            </p>
          </div>
        </div>

        {/* Member Schools Sample Directory & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                <span>Direktori Rangkaian Sekolah Ahli</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Institusi pendidikan Islam berdaftar di bawah naungan MPGBSIM mengikut negeri dan kategori.
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Menunjukkan <strong className="text-slate-800">{filteredSchools.length}</strong> daripada {schools.length} sekolah ahli berdaftar
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama sekolah, kod, atau PGB..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
              >
                {MALAYSIA_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50/50"
              >
                {SCHOOL_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Hint */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 bg-teal-50/80 rounded-xl border border-teal-200/80 text-teal-950 text-xs mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
              </span>
              <span className="font-semibold">
                Klik pada mana-mana sekolah untuk melihat profil lengkap, maklumat institusi dan kepimpinan.
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-800 font-medium shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Privasi PGB dilindungi (No. telefon peribadi tidak dipaparkan)</span>
            </div>
          </div>

          {/* School Directory Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Sekolah</th>
                  <th className="py-3 px-4">Kod</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Negeri / Daerah</th>
                  <th className="py-3 px-4">Pengetua / Guru Besar</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((sch) => (
                    <tr
                      key={sch.id}
                      onClick={() => setSelectedSchool(sch)}
                      className="hover:bg-teal-50/60 transition-colors cursor-pointer group"
                      title="Klik untuk lihat profil penuh sekolah"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-teal-900">
                        <div className="flex items-center gap-2">
                          {sch.logoUrl && (
                            <img
                              src={sch.logoUrl}
                              alt=""
                              className="w-6 h-6 rounded-md object-contain shrink-0 border border-slate-200 p-0.5 bg-white"
                            />
                          )}
                          <span>{sch.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-teal-800 font-bold">
                        {sch.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {sch.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {sch.district}, {sch.state}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2.5">
                          {sch.principalPhotoUrl ? (
                            <img
                              src={sch.principalPhotoUrl}
                              alt={sch.principal}
                              className="w-8 h-8 rounded-full object-cover border-2 border-teal-700 shrink-0 shadow-xs"
                              onError={(e) => {
                                (e.target as any).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0 font-bold">
                              {sch.principal ? sch.principal.charAt(0) : 'P'}
                            </div>
                          )}
                          <span className="font-semibold text-slate-900 group-hover:text-teal-900">{sch.principal}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSchool(sch);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs transition-transform cursor-pointer shadow-2xs group-hover:scale-105"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Profil</span>
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCMSOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition cursor-pointer"
                              title="Buka Pusat Kawalan CMS untuk menyunting profil sekolah ini"
                            >
                              <Edit3 className="w-3 h-3 text-amber-800" />
                              <span className="hidden sm:inline">CMS</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                      Tiada sekolah sepadan dengan carian ini. Sila ubah penapis anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* School Full Profile Modal */}
      {selectedSchool && activeSchool && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedSchool(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedSchool(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
              title="Tutup Paparan"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Banner */}
            <div className="relative p-6 sm:p-7 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-inner">
                  {activeSchool.logoUrl ? (
                    <img
                      src={activeSchool.logoUrl}
                      alt={activeSchool.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <School className="w-10 h-10 text-amber-300" />
                  )}
                </div>

                <div className="min-w-0 pr-8">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold">
                      {activeSchool.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-mono font-bold">
                      Kod: {activeSchool.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-xs">
                      {activeSchool.state}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {activeSchool.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-200/90 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>{activeSchool.district}, {activeSchool.state}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 sm:p-7 space-y-5 max-h-[calc(85vh-160px)] overflow-y-auto">
              {/* 1. PGB Leadership Spotlight (Kecuali No. Telefon PGB) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-slate-50 border border-teal-200">
                <div className="text-[11px] font-bold text-teal-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span>Kepimpinan Institusi</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* PGB Corporate Photo */}
                  <div className="shrink-0 flex flex-col items-center">
                    {activeSchool.principalPhotoUrl ? (
                      <img
                        src={activeSchool.principalPhotoUrl}
                        alt={activeSchool.principal}
                        className="w-24 h-32 object-cover rounded-xl border-2 border-teal-700 shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-32 rounded-xl bg-slate-200 border-2 border-slate-300 flex flex-col items-center justify-center text-slate-400">
                        <Users className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-[10px]">Tiada Foto</span>
                      </div>
                    )}
                    <span className="mt-1.5 px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[10px] font-bold">
                      Foto Korporat PGB
                    </span>
                  </div>

                  {/* PGB Details */}
                  <div className="flex-1 text-center sm:text-left space-y-2.5">
                    <div>
                      <span className="text-xs text-slate-500 block">Nama Pengetua / Guru Besar:</span>
                      <h4 className="text-lg font-bold text-slate-900 leading-snug">
                        {activeSchool.principal}
                      </h4>
                      <p className="text-xs font-semibold text-teal-800 mt-0.5">
                        Pengetua / Guru Besar (PGB) Berdaftar MPGBSIM
                      </p>
                    </div>

                    {/* Strict Privacy Protection Notice (Kecuali No. Telefon PGB) */}
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-left space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Dasar Privasi & Keselamatan Kepimpinan PGB</span>
                      </div>
                      <p className="text-[11px] text-amber-800/90 leading-relaxed">
                        Nombor telefon peribadi Pengetua / Guru Besar <strong>tidak dipaparkan</strong> bagi melindungi privasi dan integriti keselamatan kepimpinan sekolah selaras dengan dasar tadbir urus MPGBSIM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Key Institutional Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center text-teal-700 mb-1">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {activeSchool.studentCount ? `${activeSchool.studentCount}+` : '-'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Bilangan Murid</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center text-teal-700 mb-1">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {activeSchool.teacherCount ? `${activeSchool.teacherCount}` : '25+'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Tenaga Pengajar</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center text-teal-700 mb-1">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {activeSchool.joinYear || '2020'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Tahun Ahli MPGBSIM</span>
                </div>
              </div>

              {/* Foto Institusi Sekolah jika ada */}
              {activeSchool.schoolPhotoUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative group">
                  <img
                    src={activeSchool.schoolPhotoUrl}
                    alt={`Foto Institusi ${activeSchool.name}`}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-101 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider mb-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Premis & Institusi Rasmi Sekolah</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white/95">
                        {activeSchool.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Latar Belakang & Penerangan Institusi */}
              {activeSchool.description && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    <span>Profil & Latar Belakang Institusi</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeSchool.description}
                  </p>
                </div>
              )}

              {/* 4. Maklumat Perhubungan Rasmi Institusi (Bukan Peribadi PGB) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Maklumat Perhubungan Rasmi Sekolah
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeSchool.address && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">Alamat Surat-Menyurat:</span>
                        <span className="text-slate-800 font-medium">{activeSchool.address}</span>
                      </div>
                    </div>
                  )}

                  {activeSchool.email && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">Emel Rasmi Pejabat:</span>
                        <a
                          href={`mailto:${activeSchool.email}`}
                          className="text-teal-700 hover:underline font-semibold break-all"
                        >
                          {activeSchool.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {activeSchool.phone && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">Talian Pejabat Am Sekolah:</span>
                        <a
                          href={`tel:${activeSchool.phone}`}
                          className="text-teal-700 hover:underline font-semibold"
                        >
                          {activeSchool.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {activeSchool.website && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <Globe className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">Portal / Laman Web Rasmi:</span>
                        <a
                          href={activeSchool.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 hover:underline font-semibold inline-flex items-center gap-1 break-all"
                        >
                          <span>{activeSchool.website}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Ahli Institusi Berdaftar MPGBSIM</span>
              </span>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSchool(null);
                      setIsCMSOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Buka CMS untuk mengemaskini maklumat profil sekolah ini"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting di CMS</span>
                  </button>
                )}
                {activeSchool.website && (
                  <a
                    href={activeSchool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Laman Web Sekolah</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedSchool(null)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
