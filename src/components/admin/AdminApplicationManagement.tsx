import React, { useState } from 'react';
import {
  School,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Users,
  GraduationCap,
  Calendar,
  Globe,
  FileText,
  Mail,
  Phone,
  Trash2,
  Check,
  X,
  Eye,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Camera,
  UserCheck,
  Building2,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberApplication } from '../../types';

interface AdminApplicationManagementProps {
  onNavigateToSchools?: () => void;
}

export const AdminApplicationManagement: React.FC<AdminApplicationManagementProps> = ({
  onNavigateToSchools,
}) => {
  const {
    siteData,
    approveMemberApplication,
    rejectMemberApplication,
    deleteMemberApplication,
  } = useAdminContent();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<MemberApplication | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const applications = siteData.memberApplications || [];

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      app.schoolName.toLowerCase().includes(term) ||
      app.fullName.toLowerCase().includes(term) ||
      (app.refId && app.refId.toLowerCase().includes(term)) ||
      (app.schoolCode && app.schoolCode.toLowerCase().includes(term)) ||
      app.state.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      const res = await approveMemberApplication(id);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: 'approved' } : null));
        }
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Ralat semasa meluluskan permohonan keahlian.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Adakah anda pasti mahu menolak permohonan keahlian ini?')) return;
    setActionLoading(id);
    setFeedback(null);
    try {
      await rejectMemberApplication(id);
      setFeedback({ type: 'success', message: 'Permohonan keahlian telah ditandakan sebagai Ditolak.' });
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp((prev) => (prev ? { ...prev, status: 'rejected' } : null));
      }
    } catch {
      setFeedback({ type: 'error', message: 'Ralat semasa menolak permohonan.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Adakah anda pasti mahu memadam rekod permohonan ini secara kekal?')) return;
    setActionLoading(id);
    try {
      await deleteMemberApplication(id);
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null);
      }
      setFeedback({ type: 'success', message: 'Rekod permohonan berjaya dipadam.' });
    } catch {
      setFeedback({ type: 'error', message: 'Ralat semasa memadam permohonan.' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <School className="w-6 h-6 text-teal-700" />
            <span>Pengurusan Permohonan Keahlian Baharu</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Semak, luluskan permohonan keahlian PGB & sekolah Islam untuk didaftarkan secara automatik ke Direktori Sekolah Ahli MPGBSIM.
          </p>
        </div>

        {onNavigateToSchools && (
          <button
            type="button"
            onClick={onNavigateToSchools}
            className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Lihat Direktori Sekolah Ahli</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 transition-all ${
            feedback.type === 'success'
              ? 'bg-teal-50 border border-teal-200 text-teal-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-teal-900 text-white border-teal-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-teal-300 text-slate-800'
          }`}
        >
          <div className="text-xs font-medium opacity-80">Jumlah Permohonan</div>
          <div className="text-2xl font-black mt-1">{applications.length}</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
            filterStatus === 'pending'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-amber-50 border-amber-200 hover:border-amber-300 text-amber-900'
          }`}
        >
          <div className="text-xs font-medium">Menunggu Tindakan</div>
          <div className="text-2xl font-black mt-1 flex items-center justify-between">
            <span>{pendingCount}</span>
            {pendingCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('approved')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'approved'
              ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
              : 'bg-teal-50 border-teal-200 hover:border-teal-300 text-teal-950'
          }`}
        >
          <div className="text-xs font-medium">Telah Diluluskan</div>
          <div className="text-2xl font-black mt-1">{approvedCount}</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('rejected')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            filterStatus === 'rejected'
              ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
              : 'bg-rose-50 border-rose-200 hover:border-rose-300 text-rose-950'
          }`}
        >
          <div className="text-xs font-medium">Ditolak / KIV</div>
          <div className="text-2xl font-black mt-1">{rejectedCount}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama institusi, PGB, No. Rujukan, negeri atau emel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium cursor-pointer"
          >
            <option value="all">Semua Status ({applications.length})</option>
            <option value="pending">Menunggu Tindakan ({pendingCount})</option>
            <option value="approved">Diluluskan ({approvedCount})</option>
            <option value="rejected">Ditolak ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <School className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tiada permohonan keahlian dijumpai</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm ? 'Cuba kata kunci carian yang lain.' : 'Permohonan baharu akan dipaparkan di sini.'}
            </p>
          </div>
        ) : (
          filteredApplications.map((app) => {
            const isPending = app.status === 'pending';
            const isApproved = app.status === 'approved';
            const isLoading = actionLoading === app.id;

            return (
              <div
                key={app.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white shadow-xs hover:shadow-md ${
                  isPending
                    ? 'border-amber-200 bg-amber-50/20'
                    : isApproved
                    ? 'border-teal-200 bg-teal-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: School Logo & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {app.logoUrl ? (
                        <img
                          src={app.logoUrl}
                          alt={app.schoolName}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <School className="w-6 h-6 text-teal-800" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-900 truncate">
                          {app.schoolName}
                        </span>
                        {app.schoolCode && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">
                            {app.schoolCode}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : isApproved
                              ? 'bg-teal-100 text-teal-900 border border-teal-200'
                              : 'bg-rose-100 text-rose-900 border border-rose-200'
                          }`}
                        >
                          {isPending && <Clock className="w-3 h-3" />}
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isPending ? 'Menunggu Kelulusan' : isApproved ? 'Telah Diluluskan' : 'Ditolak'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        {app.pgbPhotoUrl ? (
                          <div className="flex items-center gap-1.5 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                            <img
                              src={app.pgbPhotoUrl}
                              alt={app.fullName}
                              className="w-5 h-5 rounded-full object-cover border border-teal-600"
                            />
                            <span className="font-semibold text-teal-900 text-[11px]">Foto PGB Ada</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tiada Foto PGB</span>
                        )}
                        {app.schoolPhotoUrl && (
                          <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="font-semibold text-emerald-900 text-[11px]">Foto Institusi Ada</span>
                          </div>
                        )}
                        <span className="font-medium text-slate-800">
                          {app.fullName} ({app.designation})
                        </span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold">
                          {app.schoolType}
                        </span>
                        <span>•</span>
                        <span>{app.district}, {app.state}</span>
                        {app.serviceStartYear && (
                          <>
                            <span>•</span>
                            <span>Mula PGB: {app.serviceStartYear}</span>
                          </>
                        )}
                      </div>

                      {/* Quick Meta Stats */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                        {app.studentCount !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                            {app.studentCount} Murid
                          </span>
                        )}
                        {app.teacherCount !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-teal-700" />
                            {app.teacherCount} Guru
                          </span>
                        )}
                        {app.website && (
                          <a
                            href={app.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Laman Web</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          Ruj: {app.refId || app.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Butiran Penuh</span>
                    </button>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleApprove(app.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isLoading ? 'Memproses...' : 'Luluskan & Masukkan Direktori'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleReject(app.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <span className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Keahlian Aktif & Berdaftar</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(app.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Padam Rekod Permohonan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedApp.logoUrl ? (
                    <img
                      src={selectedApp.logoUrl}
                      alt={selectedApp.schoolName}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <School className="w-6 h-6 text-teal-800" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {selectedApp.schoolName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    No. Rujukan: {selectedApp.refId || selectedApp.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Status Banner */}
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                selectedApp.status === 'pending'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : selectedApp.status === 'approved'
                  ? 'bg-teal-50 text-teal-900 border border-teal-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Status Permohonan:{' '}
                {selectedApp.status === 'pending'
                  ? 'Menunggu Kelulusan Admin'
                  : selectedApp.status === 'approved'
                  ? 'Telah Diluluskan'
                  : 'Ditolak'}
              </span>
              {selectedApp.submittedAt && (
                <span className="text-[11px] font-normal text-slate-600">
                  Dihantar pada:{' '}
                  {new Date(selectedApp.submittedAt).toLocaleDateString('ms-MY', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            {/* Information Grid */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-teal-950 uppercase tracking-wider text-xs mb-2">
                  1. Maklumat Pengetua / Guru Besar (PGB)
                </h4>
                <div className="flex flex-col sm:flex-row gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  {/* PGB Corporate Photo Display */}
                  <div className="shrink-0 flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-teal-200 w-full sm:w-28 text-center">
                    {selectedApp.pgbPhotoUrl ? (
                      <>
                        <img
                          src={selectedApp.pgbPhotoUrl}
                          alt={selectedApp.fullName}
                          className="w-20 h-24 object-cover rounded-lg border border-slate-200 shadow-xs mb-1.5"
                        />
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                          Foto PGB Rasmi
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-20 rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-400 mb-1.5">
                          <UserCheck className="w-6 h-6 text-slate-300 mb-1" />
                          <span className="text-[9px]">Tiada Foto</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Belum dimuat naik</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div>
                      <span className="block text-slate-500 text-[11px]">Nama Penuh PGB:</span>
                      <strong className="text-slate-900">{selectedApp.fullName}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[11px]">Jawatan Hakiki:</span>
                      <strong className="text-slate-900">{selectedApp.designation}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[11px]">No. Kad Pengenalan:</span>
                      <span className="text-slate-900 font-mono">{selectedApp.icNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[11px]">Tahun Menjadi PGB:</span>
                      <strong className="text-teal-900">{selectedApp.serviceStartYear || (selectedApp as any).pgbStartYear || '-'}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[11px]">Email Rasmi PGB:</span>
                      <a
                        href={`mailto:${selectedApp.email}`}
                        className="text-teal-700 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{selectedApp.email}</span>
                      </a>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[11px]">No. Telefon PGB:</span>
                      <a
                        href={`tel:${selectedApp.phoneNumber}`}
                        className="text-teal-700 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{selectedApp.phoneNumber}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-teal-950 uppercase tracking-wider text-xs mb-2">
                  2. Maklumat Institusi Sekolah
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="block text-slate-500 text-[11px]">Nama Institusi Sekolah:</span>
                    <strong className="text-slate-900">{selectedApp.schoolName}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Kod Sekolah:</span>
                    <span className="font-mono text-slate-900">{selectedApp.schoolCode || 'Tiada Kod'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Kategori Sekolah:</span>
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-bold inline-block">
                      {selectedApp.schoolType}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Tahun Menjadi Ahli MPGBSIM:</span>
                    <strong className="text-teal-900 font-mono font-bold">
                      {selectedApp.joinYear || (selectedApp as any).schoolJoinYear || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Negeri & Daerah:</span>
                    <span className="text-slate-900">
                      {selectedApp.district ? `${selectedApp.district}, ` : ''}{selectedApp.state}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Email Rasmi Sekolah:</span>
                    {selectedApp.schoolEmail ? (
                      <a
                        href={`mailto:${selectedApp.schoolEmail}`}
                        className="text-teal-700 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{selectedApp.schoolEmail}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">Tiada emel sekolah dinyatakan</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">No. Telefon Sekolah:</span>
                    {selectedApp.schoolPhone ? (
                      <a
                        href={`tel:${selectedApp.schoolPhone}`}
                        className="text-teal-700 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{selectedApp.schoolPhone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">Tiada no. telefon sekolah dinyatakan</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Jumlah Murid:</span>
                    <strong className="text-slate-900">{selectedApp.studentCount || 0} orang</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[11px]">Jumlah Guru:</span>
                    <strong className="text-slate-900">{selectedApp.teacherCount || 0} orang</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-slate-500 text-[11px]">Laman Web Rasmi:</span>
                    {selectedApp.website ? (
                      <a
                        href={selectedApp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{selectedApp.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">Tiada laman web dinyatakan</span>
                    )}
                  </div>
                  {selectedApp.address && (
                    <div className="sm:col-span-2">
                      <span className="block text-slate-500 text-[11px]">Alamat Lengkap:</span>
                      <span className="text-slate-800">{selectedApp.address}</span>
                    </div>
                  )}

                  {/* Foto Institusi Sekolah Dimuat Naik */}
                  {selectedApp.schoolPhotoUrl && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                      <span className="block text-slate-600 text-[11px] font-bold mb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>Foto Institusi (Sekolah) yang Dimuat Naik:</span>
                      </span>
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white max-h-60 shadow-xs">
                        <img
                          src={selectedApp.schoolPhotoUrl}
                          alt={`Foto Institusi ${selectedApp.schoolName}`}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedApp.schoolDescription && (
                <div>
                  <h4 className="font-bold text-teal-950 uppercase tracking-wider text-xs mb-1">
                    3. Profil / Penerangan Sekolah
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                    {selectedApp.schoolDescription}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {selectedApp.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleReject(selectedApp.id);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                    >
                      Tolak Permohonan
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleApprove(selectedApp.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Luluskan & Masukkan Direktori Sekolah</span>
                    </button>
                  </>
                )}

                {selectedApp.status === 'approved' && onNavigateToSchools && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(null);
                      onNavigateToSchools();
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Lihat di Direktori Sekolah Ahli</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
