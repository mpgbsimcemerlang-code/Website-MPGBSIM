import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Plus,
  Share2,
  X,
  Sparkles,
  Info,
  CalendarDays,
  List,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { ProgramEvent } from '../../types';

export const PortalPrograms: React.FC = () => {
  const {
    currentUser,
    currentRole,
    registeredProgramIds,
    registerForProgram,
  } = useMemberPortal();

  const { siteData, addProgram } = useAdminContent();
  const programs: ProgramEvent[] = siteData.programs || [];

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterMode, setFilterMode] = useState<string>('Semua');
  const [selectedProgram, setSelectedProgram] = useState<ProgramEvent | null>(null);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);

  // New Program Modal for Admin/Media AJK
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newDate, setNewDate] = useState('2026-11-14');
  const [newTime, setNewTime] = useState('8:30 Pagi - 4:30 Petang');
  const [newVenue, setNewVenue] = useState('Dewan Muktamar, Pusat Islam Bangi');
  const [newMode, setNewMode] = useState<'Fizikal' | 'Dalam Talian' | 'Hibrid'>('Fizikal');
  const [newDesc, setNewDesc] = useState('');
  const [newFees, setNewFees] = useState('Percuma Ahli');
  const [newSpots, setNewSpots] = useState(120);

  const canManage = currentRole === 'ADMIN' || currentRole === 'MEDIA_AJK';

  const filteredPrograms = programs.filter((p) => {
    if (filterMode === 'Semua') return true;
    if (filterMode === 'Didaftar') return registeredProgramIds.includes(p.id);
    if (filterMode === 'Fizikal') return p.mode === 'Fizikal';
    if (filterMode === 'Dalam Talian') return p.mode === 'Dalam Talian';
    if (filterMode === 'Hibrid') return p.mode === 'Hibrid';
    return true;
  });

  const handleRegister = (progId: string) => {
    registerForProgram(progId);
    setIsRegisterSuccess(true);
    setTimeout(() => {
      setIsRegisterSuccess(false);
    }, 4000);
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addProgram({
      id: `prog-${Date.now()}`,
      title: newTitle,
      theme: newTheme || 'Kepimpinan Holistik',
      date: newDate,
      time: newTime,
      venue: newVenue,
      mode: newMode,
      targetAudience: 'Pengetua, Guru Besar dan Penolong Kanan',
      description: newDesc || 'Program pembangunan profesional kepimpinan sekolah Islam anjuran MPGBSIM.',
      spotsTotal: Number(newSpots) || 100,
      spotsFilled: 12,
      registrationOpen: true,
      closingDate: newDate,
      fees: newFees,
      status: 'upcoming',
    });

    setIsAddOpen(false);
    alert('Program baharu berjaya didaftarkan ke dalam takwim.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Takwim Pembangunan Profesional
          </div>
          <h1 className="text-2xl font-black text-slate-900">Program & Acara Kepimpinan MPGBSIM</h1>
          <p className="text-xs text-slate-500 mt-1">
            Konvensyen tahunan, bengkel pemerkasaan AI, retreat kepimpinan dan siri wacana meja bulat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Paparan Senarai"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Senarai</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Paparan Kalendar"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Kalendar</span>
            </button>
          </div>

          {canManage && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Program Baharu
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {['Semua', 'Didaftar', 'Fizikal', 'Dalam Talian', 'Hibrid'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterMode(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterMode === f
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {f === 'Didaftar' ? `Program Didaftar (${registeredProgramIds.length})` : f}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 hidden md:block">
          Jumlah: <strong>{filteredPrograms.length}</strong> program
        </div>
      </div>

      {isRegisterSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Pendaftaran anda telah berjaya direkodkan! Butiran penuh telah dihantar ke emel ahli.</span>
          </div>
          <button onClick={() => setIsRegisterSuccess(false)} className="text-white hover:text-emerald-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View Mode: List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredPrograms.map((prog) => {
            const isRegistered = registeredProgramIds.includes(prog.id);
            return (
              <div
                key={prog.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-800 text-white text-[10px] font-bold uppercase tracking-wider">
                      {prog.mode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {prog.theme || 'Program Kepimpinan'}
                    </span>
                    {isRegistered && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Penyertaan Dikesahkan
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900">{prog.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{prog.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>{prog.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>{prog.time || '8:30 Pagi - 4:30 Petang'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                      <span className="truncate">{prog.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-center lg:text-right w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Yuran</span>
                    <span className="text-sm font-bold text-teal-900">{prog.fees || 'Percuma Ahli'}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedProgram(prog)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      Butiran Penuh
                    </button>
                    {isRegistered ? (
                      <button
                        disabled
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Telah Daftar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(prog.id)}
                        className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Daftar Program
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode: Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Takwim Bulanan MPGBSIM Sesi 2026</h3>
              <p className="text-xs text-slate-500">Susunan tarikh program kebangsaan dan zon</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              Oktober - Disember 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrograms.map((prog) => {
              const isRegistered = registeredProgramIds.includes(prog.id);
              return (
                <div
                  key={prog.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {prog.date ? prog.date.split(' ')[1] || 'TARIKH' : 'PROG'}
                        </span>
                        <span className="text-base font-black leading-none">
                          {prog.date ? prog.date.split(' ')[0] || '20' : '20'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900">
                        {prog.mode}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{prog.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prog.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 truncate max-w-[120px]">{prog.venue}</span>
                    {isRegistered ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" /> Didaftar
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(prog.id)}
                        className="text-teal-800 font-bold hover:underline"
                      >
                        Daftar →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProgram(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900">
              Mod: {selectedProgram.mode}
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{selectedProgram.title}</h2>
            <p className="text-xs font-bold text-amber-600 mt-1">{selectedProgram.theme}</p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-800" />
                <span>Tarikh: <strong>{selectedProgram.date}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-800" />
                <span>Masa: <strong>{selectedProgram.time || '8:30 Pagi - 4:30 Petang'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-800" />
                <span>Tempat: <strong>{selectedProgram.venue}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-800" />
                <span>Sasaran: {selectedProgram.targetAudience || 'Pengetua & Guru Besar'}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
                Keterangan Program
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedProgram.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Yuran Pendaftaran</span>
                <span className="text-sm font-bold text-teal-900">{selectedProgram.fees || 'Percuma'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold"
                >
                  Tutup
                </button>
                {registeredProgramIds.includes(selectedProgram.id) ? (
                  <button
                    disabled
                    className="px-5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Telah Mendaftar
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleRegister(selectedProgram.id);
                      setSelectedProgram(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs"
                  >
                    Sahkan Pendaftaran
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Program Modal for Admin */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4">+ Daftar Program / Acara Baharu</h2>

            <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tajuk Program *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Kolokium Pengurusan Kewangan Sekolah Islam 2026"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tema / Sub-Tajuk</label>
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="Contoh: Tadbir Urus Berintegriti"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mod Pelaksanaan *</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  >
                    <option value="Fizikal">Fizikal</option>
                    <option value="Dalam Talian">Dalam Talian</option>
                    <option value="Hibrid">Hibrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarikh Program *</label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="Contoh: 14 November 2026"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Masa</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Contoh: 8:30 Pagi - 4:30 Petang"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tempat / Platform *</label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="Contoh: Kompleks Pendidikan Islam Antarabangsa, Bangi"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Ringkas</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Objektif, pengisian utama dan faedah kepada peserta..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Yuran</label>
                  <input
                    type="text"
                    value={newFees}
                    onChange={(e) => setNewFees(e.target.value)}
                    placeholder="Percuma Ahli / RM50"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kapasiti Tempat</label>
                  <input
                    type="number"
                    value={newSpots}
                    onChange={(e) => setNewSpots(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 font-bold text-white shadow-xs"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
