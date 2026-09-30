import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Send,
  CheckCircle2,
  History,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Link2,
  FileSpreadsheet,
  Printer,
  Download,
  Phone,
  Mail,
  UserCheck,
  Check,
  XCircle,
  ExternalLink,
  Eye,
  Filter,
  MessageCircle,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { ProgramEvent, EventRegistration } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

export const AdminEventManagement: React.FC = () => {
  const {
    siteData,
    addProgram,
    updateProgram,
    deleteProgram,
    eventRegistrations,
    registerForEvent,
    updateEventRegistrationStatus,
    deleteEventRegistration,
  } = useAdminContent();

  // Active top-level subtab: 'events' or 'registrations'
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'registrations'>('events');

  // Events list state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ProgramEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Poster upload state
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Registrations tab state
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [regStatusFilter, setRegStatusFilter] = useState<'all' | 'confirmed' | 'attended' | 'cancelled'>('all');
  const [selectedRegDetail, setSelectedRegDetail] = useState<EventRegistration | null>(null);
  const [regToDelete, setRegToDelete] = useState<EventRegistration | null>(null);
  const [isDeletingReg, setIsDeletingReg] = useState(false);

  // Manual participant registration modal state
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);
  const initialManualForm = {
    eventId: '',
    participantName: '',
    position: 'Pengetua',
    schoolName: '',
    state: 'Selangor',
    participantEmail: '',
    participantPhone: '',
    status: 'confirmed' as 'confirmed' | 'attended',
    notes: '',
  };
  const [manualForm, setManualForm] = useState(initialManualForm);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const programsList = siteData.programs || [];

  // Filter events
  const filteredEvents = programsList.filter((item) => {
    const itemStatus = item.status || 'upcoming';
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.theme && item.theme.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || itemStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filter participant registrations
  const filteredRegistrations = (eventRegistrations || []).filter((reg) => {
    const matchesEvent = selectedEventFilter === 'all' || reg.eventId === selectedEventFilter;
    const matchesStatus = regStatusFilter === 'all' || reg.status === regStatusFilter;
    const s = regSearchTerm.toLowerCase();
    const matchesSearch =
      !regSearchTerm ||
      reg.participantName.toLowerCase().includes(s) ||
      (reg.schoolName && reg.schoolName.toLowerCase().includes(s)) ||
      (reg.participantEmail && reg.participantEmail.toLowerCase().includes(s)) ||
      (reg.participantPhone && reg.participantPhone.toLowerCase().includes(s)) ||
      (reg.attendanceCode && reg.attendanceCode.toLowerCase().includes(s)) ||
      (reg.eventTitle && reg.eventTitle.toLowerCase().includes(s));

    return matchesEvent && matchesStatus && matchesSearch;
  });

  // Metrics for registrations
  const totalRegistrations = eventRegistrations?.length || 0;
  const confirmedCount = eventRegistrations?.filter((r) => r.status === 'confirmed').length || 0;
  const attendedCount = eventRegistrations?.filter((r) => r.status === 'attended').length || 0;
  const cancelledCount = eventRegistrations?.filter((r) => r.status === 'cancelled').length || 0;

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProgram(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error('Ralat ketika memadam acara:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const initialFormState: Omit<ProgramEvent, 'id'> = {
    title: '',
    theme: '',
    date: '2026-10-15',
    time: '8:30 Pagi - 5:00 Petang',
    venue: 'Pusat Konvensyen Antarabangsa Bangi',
    mode: 'Fizikal',
    targetAudience: 'Pengetua & Guru Besar Sekolah Islam Malaysia',
    description: '',
    spotsTotal: 150,
    spotsFilled: 0,
    registrationOpen: true,
    closingDate: '2026-10-10',
    fees: 'Percuma untuk Ahli MPGBSIM',
    posterUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
    status: 'upcoming',
  };

  const [formData, setFormData] = useState<Omit<ProgramEvent, 'id'>>(initialFormState);

  const handlePosterFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Sila pilih fail imej yang sah (PNG, JPG, JPEG, WebP).');
      return;
    }
    setUploadError(null);
    setIsUploadingPoster(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1000, 1400, 0.85);
      setFormData((prev) => ({ ...prev, posterUrl: compressedDataUrl }));
    } catch (err) {
      console.error('Ralat memproses poster:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, posterUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setUploadError(null);
    setShowUrlFallback(false);
    setIsEditing(true);
  };

  const handleOpenEdit = (item: ProgramEvent) => {
    setFormData({
      title: item.title,
      theme: item.theme,
      date: item.date,
      time: item.time,
      venue: item.venue,
      mode: item.mode,
      targetAudience: item.targetAudience,
      description: item.description,
      spotsTotal: item.spotsTotal,
      spotsFilled: item.spotsFilled,
      registrationOpen: item.registrationOpen,
      closingDate: item.closingDate,
      fees: item.fees,
      posterUrl: item.posterUrl || '',
      status: item.status || 'upcoming',
    });
    setEditingId(item.id);
    setUploadError(null);
    setShowUrlFallback(false);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      updateProgram(editingId, formData);
    } else {
      const newId = `prog-${Date.now()}`;
      addProgram({
        ...formData,
        id: newId,
      });
    }
    setIsEditing(false);
  };

  const handleToggleUpcomingPast = (item: ProgramEvent) => {
    const currentStatus = item.status || 'upcoming';
    const nextStatus = currentStatus === 'upcoming' ? 'past' : 'upcoming';
    updateProgram(item.id, { status: nextStatus });
  };

  // Switch to registrations tab filtered for a specific event
  const handleViewEventRegistrations = (eventId: string) => {
    setSelectedEventFilter(eventId);
    setActiveSubTab('registrations');
  };

  // Confirm delete registration
  const handleConfirmDeleteReg = async () => {
    if (!regToDelete) return;
    setIsDeletingReg(true);
    try {
      await deleteEventRegistration(regToDelete.id, regToDelete.eventId);
      setRegToDelete(null);
    } catch (e) {
      console.error('Ralat memadam pendaftaran:', e);
    } finally {
      setIsDeletingReg(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Kod Kehadiran',
      'Nama Peserta',
      'Jawatan',
      'Sekolah',
      'Negeri',
      'Emel',
      'No Telefon',
      'Program',
      'Tarikh Daftar',
      'Status Kehadiran',
      'Catatan',
    ];

    const rows = filteredRegistrations.map((reg, index) => [
      index + 1,
      `"${reg.attendanceCode || ''}"`,
      `"${reg.participantName.replace(/"/g, '""')}"`,
      `"${(reg.position || '').replace(/"/g, '""')}"`,
      `"${(reg.schoolName || '').replace(/"/g, '""')}"`,
      `"${(reg.state || '').replace(/"/g, '""')}"`,
      `"${reg.participantEmail}"`,
      `"${reg.participantPhone || ''}"`,
      `"${(reg.eventTitle || '').replace(/"/g, '""')}"`,
      `"${reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('ms-MY') : ''}"`,
      `"${reg.status === 'confirmed' ? 'Disahkan' : reg.status === 'attended' ? 'Hadir' : 'Dibatalkan'}"`,
      `"${(reg.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Senarai_Peserta_Program_MPGBSIM_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit manual participant registration
  const handleManualRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.eventId || !manualForm.participantName.trim()) {
      setManualError('Sila pilih program dan masukkan nama peserta.');
      return;
    }

    setManualSubmitting(true);
    setManualError(null);

    try {
      const res = await registerForEvent(manualForm.eventId, {
        participantName: manualForm.participantName.trim(),
        participantEmail: manualForm.participantEmail.trim() || 'manual@mpgbsim.org.my',
        participantPhone: manualForm.participantPhone.trim(),
        schoolName: manualForm.schoolName.trim() || 'Sekolah Peserta',
        position: manualForm.position.trim(),
        state: manualForm.state.trim(),
        notes: manualForm.notes.trim() || 'Pendaftaran manual urus setia CMS',
      });

      if (res.success) {
        // If status was chosen as attended, update status immediately
        if (manualForm.status === 'attended' && res.registrationId) {
          await updateEventRegistrationStatus(res.registrationId, 'attended');
        }
        setIsAddManualOpen(false);
        setManualForm(initialManualForm);
      } else {
        setManualError(res.message);
      }
    } catch (err: any) {
      setManualError(err?.message || 'Ralat mendaftar peserta manual.');
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Navigation */}
      <div className="pb-4 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Pengurusan Acara & Pendaftaran Peserta
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Urus takwim program, pantau kapasiti pendaftaran langsung, dan semak senarai peserta acara.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'events' ? (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Acara Baharu</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={filteredRegistrations.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                  title="Eksport data pendaftaran ke fail CSV / Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Eksport CSV</span>
                </button>
                <button
                  onClick={() => setIsAddManualOpen(true)}
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Daftar Peserta Manual</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-tab Navigation Pill Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'events'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-700" />
            <span>Takwim & Acara</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              {programsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('registrations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'registrations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Rekod Pendaftaran & Peserta</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
              {totalRegistrations}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TAKWIM & SENARAI ACARA                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'events' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama acara, tema, atau tempat program..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Status Acara</option>
              <option value="upcoming">Akan Datang (Upcoming)</option>
              <option value="past">Telah Berlangsung (Past)</option>
              <option value="cancelled">Dibatalkan (Cancelled)</option>
            </select>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Tiada program atau acara dijumpai mengikut tapisan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredEvents.map((item) => {
                  const status = item.status || 'upcoming';
                  const spotsTotal = item.spotsTotal || 100;
                  const spotsFilled = item.spotsFilled || 0;
                  const fillPercentage = Math.min(Math.round((spotsFilled / spotsTotal) * 100), 100);
                  const isFull = spotsFilled >= spotsTotal || item.registrationOpen === false;

                  return (
                    <div
                      key={item.id}
                      className="p-5 hover:bg-slate-50/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <img
                          src={item.posterUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'}
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded-2xl shrink-0 bg-slate-900 border border-slate-200 shadow-xs"
                          onError={(e) => {
                            (e.target as any).src =
                              'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                status === 'upcoming'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'past'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {status === 'upcoming' ? 'Akan Datang' : status === 'past' ? 'Program Lepas' : 'Dibatalkan'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                              {item.mode}
                            </span>
                            {item.registrationOpen && status === 'upcoming' && !isFull && (
                              <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                                Pendaftaran Dibuka
                              </span>
                            )}
                            {isFull && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                                Kapasiti Penuh
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                          {item.theme && (
                            <p className="text-xs text-slate-500 line-clamp-1 italic">{item.theme}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 pt-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-teal-700" />
                              {item.date} ({item.time || 'Sepenuh Hari'})
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[200px]">{item.venue}</span>
                            </span>
                          </div>

                          {/* Live Capacity Bar inside Card */}
                          <div className="pt-2 max-w-md space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-600 flex items-center gap-1">
                                <Users className="w-3 h-3 text-teal-700" />
                                Status Kapasiti:
                              </span>
                              <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-teal-900'}`}>
                                {spotsFilled} / {spotsTotal} Peserta ({fillPercentage}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isFull ? 'bg-rose-500' : fillPercentage >= 80 ? 'bg-amber-500' : 'bg-teal-600'
                                }`}
                                style={{ width: `${fillPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex flex-wrap lg:flex-col items-end justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                        {/* Prominent button to view participant registrations */}
                        <button
                          onClick={() => handleViewEventRegistrations(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Users className="w-3.5 h-3.5 text-teal-700" />
                          <span>Rekod Peserta ({spotsFilled})</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleUpcomingPast(item)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                              status === 'upcoming'
                                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                            }`}
                          >
                            {status === 'upcoming' ? 'Tukar Lepas' : 'Akan Datang'}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer"
                            title="Sunting Acara"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Padam Acara"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REKOD PENDAFTARAN & PESERTA                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'registrations' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Jumlah Pendaftaran
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {totalRegistrations}
              </span>
              <span className="text-[11px] text-slate-500">Semua program berdaftar</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs bg-gradient-to-br from-emerald-50/40 to-white">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Penyertaan Sah
              </span>
              <span className="text-2xl font-black text-emerald-900 mt-1 block">
                {confirmedCount}
              </span>
              <span className="text-[11px] text-emerald-700">Status Disahkan</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-2xs bg-gradient-to-br from-blue-50/40 to-white">
              <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                Hadir Acara
              </span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">
                {attendedCount}
              </span>
              <span className="text-[11px] text-blue-700">Telah mendaftar hadir</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-rose-600 block tracking-wider flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Dibatalkan
              </span>
              <span className="text-2xl font-black text-rose-900 mt-1 block">
                {cancelledCount}
              </span>
              <span className="text-[11px] text-slate-500">Kekosongan dipulangkan</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regSearchTerm}
                  onChange={(e) => setRegSearchTerm(e.target.value)}
                  placeholder="Cari nama peserta, sekolah, emel, telefon atau kod kehadiran..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              {/* Event Filter */}
              <div className="w-full md:w-64">
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                >
                  <option value="all">Semua Acara & Program ({programsList.length})</option>
                  {programsList.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.title.length > 38 ? `${prog.title.slice(0, 38)}...` : prog.title} ({prog.spotsFilled || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={regStatusFilter}
                onChange={(e) => setRegStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">Semua Status</option>
                <option value="confirmed">Disahkan (Confirmed)</option>
                <option value="attended">Hadir (Attended)</option>
                <option value="cancelled">Dibatalkan (Cancelled)</option>
              </select>
            </div>

            {selectedEventFilter !== 'all' && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                <span>
                  Menapis bagi acara:{' '}
                  <strong className="text-slate-900 font-bold">
                    {programsList.find((p) => p.id === selectedEventFilter)?.title}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedEventFilter('all')}
                  className="text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer"
                >
                  Papar Semua Acara
                </button>
              </div>
            )}
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Tiada rekod pendaftaran peserta dijumpai mengikut tapisan semasa.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-3 px-4">Kod & Peserta</th>
                      <th className="py-3 px-4">Institusi / Sekolah</th>
                      <th className="py-3 px-4">Hubungan</th>
                      <th className="py-3 px-4">Program / Acara</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map((reg) => {
                      const isConfirmed = reg.status === 'confirmed';
                      const isAttended = reg.status === 'attended';
                      const isCancelled = reg.status === 'cancelled';

                      return (
                        <tr key={reg.id} className="hover:bg-slate-50/70 transition">
                          {/* Kod & Peserta */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center font-bold text-xs shrink-0">
                                {reg.participantName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {reg.participantName}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {reg.attendanceCode || 'MPGB-REG'}
                                  </span>
                                  {reg.position && (
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      • {reg.position}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Sekolah & Negeri */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block line-clamp-1">
                              {reg.schoolName}
                            </span>
                            {reg.state && (
                              <span className="text-[10px] text-slate-500 block">
                                Negeri: {reg.state}
                              </span>
                            )}
                          </td>

                          {/* Hubungan */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <a
                                href={`mailto:${reg.participantEmail}`}
                                className="text-teal-700 hover:underline flex items-center gap-1 font-medium truncate max-w-[160px]"
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{reg.participantEmail}</span>
                              </a>
                              {reg.participantPhone && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <a
                                    href={`tel:${reg.participantPhone}`}
                                    className="hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{reg.participantPhone}</span>
                                  </a>
                                  <a
                                    href={`https://wa.me/${reg.participantPhone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 font-bold"
                                    title="WhatsApp Peserta"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Program */}
                          <td className="py-3 px-4 max-w-[200px]">
                            <span className="font-semibold text-slate-800 line-clamp-1 block">
                              {reg.eventTitle}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {reg.registeredAt
                                ? new Date(reg.registeredAt).toLocaleDateString('ms-MY', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Baru'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isAttended
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : isConfirmed
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {isAttended && <Check className="w-3 h-3" />}
                              {isConfirmed && <CheckCircle2 className="w-3 h-3" />}
                              {isCancelled && <XCircle className="w-3 h-3" />}
                              <span>
                                {isAttended ? 'Hadir' : isConfirmed ? 'Disahkan' : 'Batal'}
                              </span>
                            </span>
                          </td>

                          {/* Tindakan */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Attendance Toggle */}
                              {isConfirmed && (
                                <button
                                  type="button"
                                  onClick={() => updateEventRegistrationStatus(reg.id, 'attended')}
                                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200 transition cursor-pointer"
                                  title="Tandakan Hadir di Meja Pendaftaran"
                                >
                                  Tandakan Hadir
                                </button>
                              )}
                              {isAttended && (
                                <button
                                  type="button"
                                  onClick={() => updateEventRegistrationStatus(reg.id, 'confirmed')}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                                  title="Tukar semula ke Disahkan"
                                >
                                  Reset Status
                                </button>
                              )}
                              {isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => updateEventRegistrationStatus(reg.id, 'confirmed')}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition cursor-pointer"
                                  title="Aktifkan semula pendaftaran"
                                >
                                  Aktifkan Semula
                                </button>
                              )}

                              {/* View Detail */}
                              <button
                                type="button"
                                onClick={() => setSelectedRegDetail(reg)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer"
                                title="Lihat Butiran Penuh Peserta"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Cancel/Delete */}
                              {!isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => updateEventRegistrationStatus(reg.id, 'cancelled')}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                                  title="Batal Pendaftaran"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setRegToDelete(reg)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Padam Rekod Pendaftaran"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT EVENT MODAL                                          */}
      {/* ========================================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Sunting Maklumat Acara' : 'Cipta Acara Baharu'}
              </h4>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Program / Acara *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="cth: Kolokium Kepimpinan Pengetua Sekolah Islam Kebangsaan 2026"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tema Acara
                  </label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="cth: Membina Ekosistem Pendidikan Rabbani Abad Ke-21"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Acara
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="upcoming">Akan Datang (Upcoming)</option>
                    <option value="past">Telah Berlangsung (Past)</option>
                    <option value="cancelled">Dibatalkan (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tarikh Acara *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="cth: 18 - 20 Oktober 2026"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Waktu / Masa
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="cth: 8:30 Pagi - 5:00 Petang"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mod Pelaksanaan
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Fizikal">Fizikal</option>
                    <option value="Dalam Talian">Dalam Talian (Online)</option>
                    <option value="Hibrid">Hibrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lokasi / Tempat *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="cth: Dewan Perdana, Bangi Avenue Convention Centre"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Yuran Penyertaan
                  </label>
                  <input
                    type="text"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    placeholder="cth: Percuma untuk Ahli / RM150 Bukan Ahli"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Penerangan Program
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan objektif program dan modul pengisian..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sasaran Peserta
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Pengetua & Guru Besar"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jumlah Kapasiti Kuota *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.spotsTotal}
                    onChange={(e) => setFormData({ ...formData, spotsTotal: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kapasiti Terisi
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.spotsFilled}
                    onChange={(e) => setFormData({ ...formData, spotsFilled: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              {/* Muat Naik Poster Gambar Program */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-xs">
                    Poster Gambar Program
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>{showUrlFallback ? 'Guna Muat Naik Fail' : 'Guna Pautan URL'}</span>
                  </button>
                </div>

                {!showUrlFallback ? (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePosterFile(file);
                        if (e.target) e.target.value = '';
                      }}
                    />

                    {formData.posterUrl ? (
                      <div className="relative rounded-2xl border-2 border-teal-500/40 bg-slate-900 p-3.5 flex flex-col sm:flex-row items-center gap-4 overflow-hidden shadow-inner">
                        <div className="relative w-36 h-48 sm:w-28 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shadow-md">
                          <img
                            src={formData.posterUrl}
                            alt="Pratonton Poster"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-2">
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-teal-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Poster program sedia digunakan</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Fail gambar telah dimuat naik dan dioptimumkan untuk paparan pantas portal.
                          </p>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingPoster}
                              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingPoster ? 'Memproses...' : 'Tukar Poster'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, posterUrl: '' }))}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                            >
                              Buang Poster
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/40 p-6 text-center transition cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Klik untuk memuat naik Poster Acara
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          PNG, JPG atau WebP (Disyorkan nisbah 16:9 atau potret poster)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-md shadow-teal-900/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Simpan Perubahan' : 'Cipta Acara'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PARTICIPANT FULL DETAILS MODAL                                   */}
      {/* ========================================================================= */}
      {selectedRegDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Butiran Rekod Pendaftaran
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-teal-700">
                    {selectedRegDetail.attendanceCode || 'MPGB-REG'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Program Berdaftar
                  </span>
                  <strong className="text-slate-900 text-sm block">
                    {selectedRegDetail.eventTitle}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tarikh Daftar:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedRegDetail.registeredAt
                        ? new Date(selectedRegDetail.registeredAt).toLocaleString('ms-MY')
                        : 'Tidak dinyatakan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Kehadiran:</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedRegDetail.status === 'attended'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedRegDetail.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedRegDetail.status === 'attended'
                        ? 'Hadir'
                        : selectedRegDetail.status === 'confirmed'
                        ? 'Disahkan'
                        : 'Dibatalkan'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Nama Penuh Peserta
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedRegDetail.participantName}
                  </span>
                  {selectedRegDetail.position && (
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Jawatan: {selectedRegDetail.position}
                    </span>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Sekolah / Institusi
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedRegDetail.schoolName} ({selectedRegDetail.state || 'Selangor'})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Emel Rasmi
                    </span>
                    <a
                      href={`mailto:${selectedRegDetail.participantEmail}`}
                      className="text-teal-700 hover:underline font-semibold"
                    >
                      {selectedRegDetail.participantEmail}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      No. Telefon
                    </span>
                    <a
                      href={`tel:${selectedRegDetail.participantPhone}`}
                      className="text-slate-800 hover:underline font-semibold"
                    >
                      {selectedRegDetail.participantPhone || 'Tidak dinyatakan'}
                    </a>
                  </div>
                </div>

                {selectedRegDetail.notes && (
                  <div className="pt-1 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Catatan / Permintaan Khas
                    </span>
                    <p className="text-slate-700 italic">{selectedRegDetail.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {selectedRegDetail.status !== 'attended' && (
                  <button
                    type="button"
                    onClick={() => {
                      updateEventRegistrationStatus(selectedRegDetail.id, 'attended');
                      setSelectedRegDetail(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Tandakan Hadir
                  </button>
                )}
                {selectedRegDetail.status !== 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => {
                      updateEventRegistrationStatus(selectedRegDetail.id, 'confirmed');
                      setSelectedRegDetail(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Sahkan Kehadiran
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedRegDetail(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL PARTICIPANT REGISTRATION MODAL                            */}
      {/* ========================================================================= */}
      {isAddManualOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-700" />
                Daftar Peserta Manual (Walk-in / Urus Setia)
              </h4>
              <button
                onClick={() => setIsAddManualOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualRegSubmit} className="py-3 space-y-3.5 text-xs">
              {manualError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Program / Acara *
                </label>
                <select
                  required
                  value={manualForm.eventId}
                  onChange={(e) => setManualForm({ ...manualForm, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  <option value="">-- Sila Pilih Program --</option>
                  {programsList.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.title} (Kapasiti: {prog.spotsFilled || 0}/{prog.spotsTotal || 100})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Penuh Peserta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Pengetua Dr. Kamaruddin"
                    value={manualForm.participantName}
                    onChange={(e) => setManualForm({ ...manualForm, participantName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jawatan</label>
                  <select
                    value={manualForm.position}
                    onChange={(e) => setManualForm({ ...manualForm, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Pengetua">Pengetua</option>
                    <option value="Guru Besar">Guru Besar</option>
                    <option value="Penolong Kanan">Penolong Kanan</option>
                    <option value="Guru Kanan">Guru Kanan</option>
                    <option value="Pegawai Pengiring">Pegawai Pengiring</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Sekolah / Institusi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. SMKA Maahad Hamidiah"
                    value={manualForm.schoolName}
                    onChange={(e) => setManualForm({ ...manualForm, schoolName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Negeri</label>
                  <select
                    value={manualForm.state}
                    onChange={(e) => setManualForm({ ...manualForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="Selangor">Selangor</option>
                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                    <option value="Putrajaya">Putrajaya</option>
                    <option value="Johor">Johor</option>
                    <option value="Kedah">Kedah</option>
                    <option value="Kelantan">Kelantan</option>
                    <option value="Melaka">Melaka</option>
                    <option value="Negeri Sembilan">Negeri Sembilan</option>
                    <option value="Pahang">Pahang</option>
                    <option value="Perak">Perak</option>
                    <option value="Perlis">Perlis</option>
                    <option value="Pulau Pinang">Pulau Pinang</option>
                    <option value="Sabah">Sabah</option>
                    <option value="Sarawak">Sarawak</option>
                    <option value="Terengganu">Terengganu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Emel</label>
                  <input
                    type="email"
                    placeholder="peserta@sekolah.edu.my"
                    value={manualForm.participantEmail}
                    onChange={(e) => setManualForm({ ...manualForm, participantEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telefon</label>
                  <input
                    type="tel"
                    placeholder="+60 12-345 6789"
                    value={manualForm.participantPhone}
                    onChange={(e) => setManualForm({ ...manualForm, participantPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Kehadiran Awal</label>
                <select
                  value={manualForm.status}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  <option value="confirmed">Disahkan (Belum Hadir)</option>
                  <option value="attended">Telah Hadir (Check-in Sekarang)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="cth. Bayaran tunai di kaunter pendaftaran"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddManualOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-md shadow-teal-900/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {manualSubmitting ? 'Mendaftar...' : 'Sahkan & Tambah Peserta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE EVENT CONFIRMATION MODAL                                  */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900">Padam Acara?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Adakah anda pasti ingin memadamkan acara ini secara kekal daripada sistem?
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-900 line-clamp-2">
                {itemToDelete.title}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {itemToDelete.date} • {itemToDelete.venue}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sedang Memadam...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Sahkan Padam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE REGISTRATION RECORD CONFIRMATION MODAL                    */}
      {/* ========================================================================= */}
      {regToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900">Padam Rekod Pendaftaran?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Memadam rekod ini akan mengurangkan tempat terisi bagi program tersebut dan memulangkan kuota satu peserta.
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1">
              <p className="text-xs font-bold text-slate-900">
                {regToDelete.participantName}
              </p>
              <p className="text-[11px] text-slate-600">
                {regToDelete.schoolName}
              </p>
              <p className="text-[10px] text-teal-700 font-mono font-bold">
                {regToDelete.attendanceCode} • {regToDelete.eventTitle}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRegToDelete(null)}
                disabled={isDeletingReg}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReg}
                disabled={isDeletingReg}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeletingReg ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sedang Memadam...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Sahkan Padam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
