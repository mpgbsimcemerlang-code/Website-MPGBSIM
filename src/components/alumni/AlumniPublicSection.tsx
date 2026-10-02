import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  Quote,
  ChevronRight,
  BookOpen,
  UserPlus,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { AlumniRecord } from '../../types';
import { AlumniDetailModal } from './AlumniDetailModal';
import { AlumniRegistrationModal } from './AlumniRegistrationModal';

interface AlumniPublicSectionProps {
  alumniList: AlumniRecord[];
  onAddAlumniRecord: (data: Omit<AlumniRecord, 'id' | 'submittedAt'>) => Promise<string>;
}

export const AlumniPublicSection: React.FC<AlumniPublicSectionProps> = ({
  alumniList,
  onAddAlumniRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('ALL');

  const [selectedAlumniDetail, setSelectedAlumniDetail] = useState<AlumniRecord | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Filter only APPROVED and public alumni profiles
  const approvedAlumni = useMemo(() => {
    return alumniList.filter(
      (a) =>
        a.verificationStatus === 'APPROVED' &&
        (a.consent ? a.consent.allowPublicDisplay !== false : true)
    );
  }, [alumniList]);

  // Compute Live Statistics from Firestore/State
  const liveStats = useMemo(() => {
    const totalAlumni = approvedAlumni.length;

    // Unique schools count across leadership histories
    const schoolSet = new Set<string>();
    approvedAlumni.forEach((a) => {
      if (a.lastSchool) schoolSet.add(a.lastSchool.trim().toLowerCase());
      a.leadershipHistory?.forEach((lh) => {
        if (lh.schoolName) schoolSet.add(lh.schoolName.trim().toLowerCase());
      });
    });

    // Unique states
    const stateSet = new Set<string>();
    approvedAlumni.forEach((a) => {
      if (a.state) stateSet.add(a.state.trim());
    });

    // Years of Leadership sum
    let totalYears = 0;
    approvedAlumni.forEach((a) => {
      if (a.retirementYear && a.careerStartYear) {
        totalYears += Math.max(1, a.retirementYear - a.careerStartYear);
      } else {
        totalYears += 25; // default fallback span
      }
    });

    return {
      totalAlumni,
      totalSchools: schoolSet.size || totalAlumni,
      totalStates: stateSet.size || 14,
      totalYears,
    };
  }, [approvedAlumni]);

  // Extract unique filter dropdown values
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    approvedAlumni.forEach((a) => a.state && set.add(a.state));
    return Array.from(set).sort();
  }, [approvedAlumni]);

  const availableExpertise = useMemo(() => {
    const set = new Set<string>();
    approvedAlumni.forEach((a) => a.expertise?.forEach((exp) => set.add(exp)));
    return Array.from(set).sort();
  }, [approvedAlumni]);

  // Filtered Alumni List
  const filteredAlumni = useMemo(() => {
    return approvedAlumni.filter((a) => {
      const matchQuery =
        !searchQuery.trim() ||
        a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.lastSchool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.lastPosition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.state.toLowerCase().includes(searchQuery.toLowerCase());

      const matchState = selectedState === 'ALL' || a.state === selectedState;

      const matchPosition =
        selectedPosition === 'ALL' ||
        (selectedPosition === 'Pengetua' && a.lastPosition.toLowerCase().includes('pengetua')) ||
        (selectedPosition === 'Guru Besar' && a.lastPosition.toLowerCase().includes('guru besar'));

      const matchExpertise =
        selectedExpertise === 'ALL' || a.expertise?.includes(selectedExpertise);

      return matchQuery && matchState && matchPosition && matchExpertise;
    });
  }, [approvedAlumni, searchQuery, selectedState, selectedPosition, selectedExpertise]);

  // Featured Legacy Stories
  const featuredLegacyAlumni = useMemo(() => {
    const featured = approvedAlumni.filter((a) => a.featured && a.legacyQuote);
    return featured.length > 0 ? featured : approvedAlumni.filter((a) => a.legacyQuote).slice(0, 3);
  }, [approvedAlumni]);

  return (
    <section id="alumni" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Direktori Rasmi Kepimpinan</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ALUMNI PGB MPGBSIM
          </h2>

          <p className="text-lg sm:text-xl font-bold text-amber-300/90 font-serif">
            “Jejak Kepimpinan, Legasi Pendidikan”
          </p>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Menghimpunkan barisan bekas Pengetua dan Guru Besar yang telah menyumbang kepada pembangunan serta kecemerlangan pendidikan Islam Malaysia.
          </p>

          {/* Action Button: Daftar Alumni */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setIsRegistrationOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg hover:shadow-amber-400/20 active:scale-95 transition-all cursor-pointer border border-amber-200"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>Daftar Alumni PGB Sekarang</span>
            </button>
          </div>
        </div>

        {/* LIVE FIRESTORE STATISTICS BAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-md">
          <div className="text-center p-3 space-y-1">
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-teal-900/60 text-teal-300 mb-1">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
              {liveStats.totalAlumni}
            </div>
            <div className="text-xs text-slate-400 font-medium">Jumlah Alumni PGB</div>
          </div>

          <div className="text-center p-3 space-y-1">
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-teal-900/60 text-teal-300 mb-1">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
              {liveStats.totalSchools}+
            </div>
            <div className="text-xs text-slate-400 font-medium">Sekolah Pernah Dipimpin</div>
          </div>

          <div className="text-center p-3 space-y-1">
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-teal-900/60 text-teal-300 mb-1">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
              {liveStats.totalStates}
            </div>
            <div className="text-xs text-slate-400 font-medium">Negeri Diwakili</div>
          </div>

          <div className="text-center p-3 space-y-1">
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-teal-900/60 text-teal-300 mb-1">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
              {liveStats.totalYears}+
            </div>
            <div className="text-xs text-slate-400 font-medium">Tahun Kumulatif Khidmat</div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama alumni, sekolah atau jawatan..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Filter by State */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="ALL">Semua Negeri ({liveStats.totalStates})</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Position */}
            <div>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="ALL">Semua Jawatan</option>
                <option value="Pengetua">Pengetua</option>
                <option value="Guru Besar">Guru Besar</option>
              </select>
            </div>
          </div>

          {/* Filter by Expertise Badges */}
          {availableExpertise.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-700/60 text-xs">
              <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                Tapis Kepakaran:
              </span>
              <button
                type="button"
                onClick={() => setSelectedExpertise('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedExpertise === 'ALL'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Semua
              </button>
              {availableExpertise.map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => setSelectedExpertise(exp)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedExpertise === exp
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ALUMNI DIRECTORY CARDS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              Direktori Alumni Disahkan ({filteredAlumni.length})
            </h3>
          </div>

          {filteredAlumni.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/60 rounded-2xl border border-slate-700 p-6 space-y-3">
              <p className="text-slate-300 font-medium">Tiada rekod alumni ditemui padanan tapisan anda.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedState('ALL');
                  setSelectedPosition('ALL');
                  setSelectedExpertise('ALL');
                }}
                className="px-4 py-2 bg-slate-700 text-teal-300 rounded-lg text-xs font-semibold hover:bg-slate-600 cursor-pointer"
              >
                Set Semula Tapisan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((alumni) => (
                <div
                  key={alumni.id}
                  className="bg-slate-800/90 hover:bg-slate-800 transition-all rounded-2xl p-5 border border-slate-700/80 hover:border-teal-500/50 shadow-lg flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header: Photo + Name */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-amber-400/60 shadow-md">
                        {alumni.photo ? (
                          <img
                            src={alumni.photo}
                            alt={alumni.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-teal-300 font-bold text-xl">
                            {alumni.fullName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-teal-400 truncate">
                          {alumni.title || 'Mantan PGB'} · {alumni.state}
                        </div>
                        <h4 className="text-base font-bold text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
                          {alumni.fullName}
                        </h4>
                        <p className="text-xs text-amber-200/90 font-medium truncate mt-0.5">
                          {alumni.lastPosition}
                        </p>
                      </div>
                    </div>

                    {/* School & Service Period */}
                    <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{alumni.lastSchool}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          Tempoh: {alumni.careerStartYear} – {alumni.retirementYear || 'Kini'}
                        </span>
                      </div>
                    </div>

                    {/* Expertise Pills (Unboxed text tags) */}
                    {alumni.expertise && alumni.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[11px] text-teal-300">
                        {alumni.expertise.slice(0, 3).map((exp, i) => (
                          <span
                            key={i}
                            className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {alumni.leadershipHistory?.length || 1} Institusi Dijaga
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedAlumniDetail(alumni)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                    >
                      <span>Lihat Profil</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LEGACY STORYTELLING SECTION: "JEJAK LEGASI" */}
        {featuredLegacyAlumni.length > 0 && (
          <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950 p-8 rounded-3xl border border-amber-400/30 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Quote className="w-4 h-4 text-amber-400" />
                  Mutiara Kata & Pedoman Kepimpinan
                </span>
                <h3 className="text-2xl font-black text-white">JEJAK LEGASI</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Rangkaian pesanan ikhlas dan hikmah pengalaman daripada barisan tokoh mantan Pengetua & Guru Besar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredLegacyAlumni.map((alm) => (
                <div
                  key={`legacy-${alm.id}`}
                  className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all"
                >
                  <div className="space-y-3">
                    <Quote className="w-6 h-6 text-amber-400/60" />
                    <p className="text-xs sm:text-sm italic text-slate-200 leading-relaxed font-serif">
                      “{alm.legacyQuote}”
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-amber-400/50">
                      {alm.photo ? (
                        <img
                          src={alm.photo}
                          alt={alm.fullName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-teal-300 font-bold text-xs">
                          {alm.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{alm.fullName}</div>
                      <div className="text-[11px] text-amber-300 truncate">{alm.lastPosition}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Profile Modal */}
      {selectedAlumniDetail && (
        <AlumniDetailModal
          alumni={selectedAlumniDetail}
          onClose={() => setSelectedAlumniDetail(null)}
          onOpenRegistration={() => setIsRegistrationOpen(true)}
        />
      )}

      {/* Multi-step Registration Modal */}
      <AlumniRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSubmit={onAddAlumniRecord}
      />
    </section>
  );
};
