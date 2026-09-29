import React, { useState } from 'react';
import {
  Users,
  Building2,
  Search,
  Filter,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  ArrowUpDown,
  Lock,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  School,
  GraduationCap,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool } from '../../types';

export const PortalDirectory: React.FC = () => {
  const { portalSubTab, setPortalSubTab, currentUser, registeredSchools } = useMemberPortal();
  const { siteData } = useAdminContent();

  const schools: MemberSchool[] =
    registeredSchools && registeredSchools.length > 0
      ? registeredSchools
      : siteData.memberSchools || [];

  const [activeTab, setActiveTab] = useState<'pgb' | 'sekolah'>(
    portalSubTab === 'sekolah' ? 'sekolah' : 'pgb'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('Semua');
  const [selectedType, setSelectedType] = useState('Semua');
  const [sortAlpha, setSortAlpha] = useState<'asc' | 'desc'>('asc');

  // Detail Modal States
  const [selectedPGB, setSelectedPGB] = useState<any | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<MemberSchool | null>(null);

  const statesList = [
    'Semua',
    'Selangor',
    'Kuala Lumpur',
    'Wilayah Persekutuan',
    'Johor',
    'Perak',
    'Kedah',
    'Kelantan',
    'Terengganu',
    'Pahang',
    'Negeri Sembilan',
    'Melaka',
    'Pulau Pinang',
    'Perlis',
    'Sabah',
    'Sarawak',
  ];

  const typesList = ['Semua', 'Sekolah Rendah', 'Sekolah Menengah', 'Maahad Tahfiz', 'Rakan Musleh'];

  const normalizeSchoolType = (t?: string): string => {
    if (!t) return 'Sekolah Menengah';
    const c = t.trim();
    if (c === 'Sekolah Rendah' || c === 'Sekolah Menengah' || c === 'Maahad Tahfiz' || c === 'Rakan Musleh') {
      return c;
    }
    if (c.includes('Rendah') || c.includes('SRI')) return 'Sekolah Rendah';
    if (c.includes('Tahfiz')) return 'Maahad Tahfiz';
    if (c.includes('Musleh')) return 'Rakan Musleh';
    return 'Sekolah Menengah';
  };

  // PGB items mapped from schools directory
  const pgbList = schools.map((sch) => ({
    id: `pgb-${sch.id}`,
    name: sch.principal || 'Pengetua / Guru Besar',
    position: sch.type.includes('Rendah') || sch.type.includes('SRI') ? 'Guru Besar' : 'Pengetua',
    school: sch.name,
    schoolCode: sch.code,
    state: sch.state,
    district: sch.district,
    schoolType: normalizeSchoolType(sch.type),
    expertise: [
      'Kepimpinan Pengurusan',
      sch.type.includes('Tahfiz') ? 'Kurikulum Al-Quran' : 'Kurikulum Bersepadu',
      'Pembangunan Sahsiah',
    ],
    photoUrl: sch.principalPhotoUrl || sch.logoUrl,
    schoolEmail: sch.email || 'info@sekolah.edu.my',
    schoolWebsite: sch.website,
    schoolPhotoUrl: sch.schoolPhotoUrl,
    serviceStartYear: sch.serviceStartYear || (sch as any).pgbStartYear,
  }));

  // Derive live school and PGB records so updates in CMS reflect immediately in open modals
  const activeSchool = selectedSchool
    ? schools.find(
        (s) =>
          s.id === selectedSchool.id ||
          (selectedSchool.code && s.code && s.code.toLowerCase() === selectedSchool.code.toLowerCase())
      ) || selectedSchool
    : null;

  const activePGB = selectedPGB
    ? pgbList.find(
        (p) =>
          p.id === selectedPGB.id ||
          (selectedPGB.schoolCode && p.schoolCode && p.schoolCode.toLowerCase() === selectedPGB.schoolCode.toLowerCase())
      ) || selectedPGB
    : null;

  // Filtering for PGB
  const filteredPGB = pgbList
    .filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchState = selectedState === 'Semua' || p.state === selectedState;
      const matchType = selectedType === 'Semua' || p.schoolType === selectedType;
      return matchQuery && matchState && matchType;
    })
    .sort((a, b) => {
      return sortAlpha === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  // Filtering for Schools
  const filteredSchools = schools
    .filter((sch) => {
      const matchQuery =
        sch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sch.principal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchState = selectedState === 'Semua' || sch.state === selectedState;
      const matchType = selectedType === 'Semua' || normalizeSchoolType(sch.type) === selectedType;
      return matchQuery && matchState && matchType;
    })
    .sort((a, b) => {
      return sortAlpha === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-tab Switcher */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            Jaringan Direktori Rasmi
          </div>
          <h1 className="text-2xl font-black text-slate-900">Direktori Ahli & Sekolah MPGBSIM</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pusat carian maklumat Pengetua, Guru Besar dan profil institusi pendidikan Islam ahli berdaftar.
          </p>
        </div>

        {/* Directory Tab Switcher */}
        <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex items-center shrink-0">
          <button
            onClick={() => {
              setActiveTab('pgb');
              setPortalSubTab('pgb');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'pgb'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            Direktori PGB ({pgbList.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('sekolah');
              setPortalSubTab('sekolah');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'sekolah'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            Direktori Sekolah ({schools.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'pgb' ? 'Cari nama Pengetua atau sekolah...' : 'Cari nama sekolah, kod atau negeri...'
              }
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st === 'Semua' ? 'Semua Negeri' : `Negeri: ${st}`}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
            >
              {typesList.map((t) => (
                <option key={t} value={t}>
                  {t === 'Semua' ? 'Semua Jenis Sekolah' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Alpha */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortAlpha(sortAlpha === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Susun Abjad: {sortAlpha === 'asc' ? 'A → Z' : 'Z → A'}</span>
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>
            Privasi Terpelihara: Maklumat nombor telefon peribadi Pengetua dan Guru Besar dilindungi di bawah akta privasi ahli MPGBSIM.
          </span>
        </div>
      </div>

      {/* Content: TAB 1 - Direktori PGB */}
      {activeTab === 'pgb' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPGB.map((pgb) => (
            <div
              key={pgb.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="relative shrink-0">
                    <img
                      src={
                        pgb.photoUrl ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
                      }
                      alt={pgb.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      {pgb.position}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 truncate" title={pgb.name}>
                      {pgb.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5" title={pgb.school}>
                      {pgb.school}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{pgb.state} ({pgb.district})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{pgb.schoolType}</span>
                  </div>
                </div>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-1">
                  {pgb.expertise.map((exp: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Ahli Disahkan
                </span>
                <button
                  onClick={() => setSelectedPGB(pgb)}
                  className="text-xs font-bold text-indigo-800 hover:text-indigo-950 flex items-center gap-1"
                >
                  Profil Penuh <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content: TAB 2 - Direktori Sekolah Ahli */}
      {activeTab === 'sekolah' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchools.map((sch) => (
            <div
              key={sch.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Campus photo if available */}
              {sch.schoolPhotoUrl && (
                <div className="h-36 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={sch.schoolPhotoUrl}
                    alt={sch.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-bold text-white px-2 py-0.5 rounded bg-black/50 backdrop-blur-xs">
                    {sch.type}
                  </span>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
                      {sch.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{sch.state}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedSchool(sch)}
                    className="font-black text-base text-slate-900 hover:text-teal-900 cursor-pointer line-clamp-2"
                  >
                    {sch.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span className="truncate">Pengetua: <strong>{sch.principal}</strong></span>
                    </div>
                    {sch.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span className="truncate">{sch.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Murid</span>
                      <strong className="text-slate-800">{sch.studentCount || '500+'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Guru</span>
                      <strong className="text-slate-800">{sch.teacherCount || '45'}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {sch.website ? (
                    <a
                      href={sch.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-800 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5" /> Laman Web
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Tiada web rasmi</span>
                  )}

                  <button
                    onClick={() => setSelectedSchool(sch)}
                    className="text-xs font-bold text-teal-900 hover:underline flex items-center gap-0.5"
                  >
                    Profil Lengkap →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PGB Detail Modal */}
      {selectedPGB && activePGB && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPGB(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={
                  activePGB.photoUrl ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                }
                alt={activePGB.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200"
              />
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  {activePGB.position}
                </span>
                <h2 className="text-lg font-black text-slate-900">{activePGB.name}</h2>
                <p className="text-xs text-slate-600">{activePGB.school}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
              <div>
                <span className="text-slate-400 font-semibold block">Negeri & Daerah:</span>
                <span className="text-slate-800 font-bold">{activePGB.state} ({activePGB.district})</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Jenis Sekolah:</span>
                <span className="text-slate-800 font-bold">{activePGB.schoolType} (Kod: {activePGB.schoolCode})</span>
              </div>
              {activePGB.serviceStartYear && (
                <div>
                  <span className="text-slate-400 font-semibold block">Tahun Menjadi PGB:</span>
                  <span className="text-teal-900 font-bold">{activePGB.serviceStartYear}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-semibold block">Hubungan Emel Sekolah:</span>
                <span className="text-slate-800 font-mono">{activePGB.schoolEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Status Privasi Hubungan:</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                  <Lock className="w-3.5 h-3.5" /> Nombor peribadi dilindungi secara rasmi
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Bidang Kepakaran & Fokus
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activePGB.expertise.map((exp: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-medium"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPGB(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* School Detail Modal */}
      {selectedSchool && activeSchool && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSchool(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {activeSchool.schoolPhotoUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden max-h-56 w-full">
                <img
                  src={activeSchool.schoolPhotoUrl}
                  alt={activeSchool.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 font-mono">
                {activeSchool.code}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-teal-100 text-teal-900">
                {activeSchool.type}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{activeSchool.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{activeSchool.district}, {activeSchool.state}</p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block font-semibold">Pengetua / Guru Besar:</span>
                <strong className="text-slate-900 text-sm">{activeSchool.principal}</strong>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400 block font-semibold">Enrolmen Murid:</span>
                  <strong>{activeSchool.studentCount} Murid</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Tenaga Pengajar:</span>
                  <strong>{activeSchool.teacherCount || 45} Guru</strong>
                </div>
              </div>
              {activeSchool.address && (
                <div className="pt-2">
                  <span className="text-slate-400 block font-semibold">Alamat Sekolah:</span>
                  <span>{activeSchool.address}</span>
                </div>
              )}
            </div>

            {activeSchool.description && (
              <div className="mt-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
                  Keterangan & Profil Sekolah
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">{activeSchool.description}</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              {activeSchool.website ? (
                <a
                  href={activeSchool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-semibold hover:bg-teal-900 flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" /> Laman Web Rasmi
                </a>
              ) : (
                <div />
              )}
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
