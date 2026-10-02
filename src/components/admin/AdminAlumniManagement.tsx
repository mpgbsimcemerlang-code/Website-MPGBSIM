import React, { useState } from 'react';
import {
  Search,
  Filter,
  Check,
  X,
  Edit,
  Trash2,
  Star,
  Archive,
  ShieldCheck,
  AlertCircle,
  Building2,
  Calendar,
  User,
  Quote,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { AlumniRecord, AlumniVerificationStatus } from '../../types';

interface AdminAlumniManagementProps {
  alumniList: AlumniRecord[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onUpdate: (id: string, patch: Partial<AlumniRecord>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleFeature: (id: string) => Promise<void>;
  isMediaAjk?: boolean;
}

export const AdminAlumniManagement: React.FC<AdminAlumniManagementProps> = ({
  alumniList,
  onApprove,
  onReject,
  onUpdate,
  onDelete,
  onToggleFeature,
  isMediaAjk = false,
}) => {
  const [activeTab, setActiveTab] = useState<AlumniVerificationStatus | 'ALL' | 'FEATURED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection reason modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Edit modal state
  const [editingAlumni, setEditingAlumni] = useState<AlumniRecord | null>(null);
  const [editBio, setEditBio] = useState('');
  const [editQuote, setEditQuote] = useState('');
  const [editContribution, setEditContribution] = useState('');

  const [statusMessage, setStatusMessage] = useState('');

  const filteredAlumni = alumniList.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastSchool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'FEATURED') return matchesSearch && item.featured;
    return matchesSearch && item.verificationStatus === activeTab;
  });

  const handleApprove = async (id: string) => {
    try {
      await onApprove(id);
      setStatusMessage('Profil alumni berjaya diluluskan!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (e: any) {
      alert('Ralat semasa meluluskan alumni: ' + e.message);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId || !rejectionReason.trim()) return;
    try {
      await onReject(rejectingId, rejectionReason.trim());
      setRejectingId(null);
      setRejectionReason('');
      setStatusMessage('Permohonan alumni telah ditolak dengan sebab.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (e: any) {
      alert('Ralat semasa menolak alumni: ' + e.message);
    }
  };

  const handleOpenEdit = (alumni: AlumniRecord) => {
    setEditingAlumni(alumni);
    setEditBio(alumni.biography || '');
    setEditQuote(alumni.legacyQuote || '');
    setEditContribution(alumni.contributions || '');
  };

  const handleSaveEdit = async () => {
    if (!editingAlumni) return;
    try {
      await onUpdate(editingAlumni.id, {
        biography: editBio,
        legacyQuote: editQuote,
        contributions: editContribution,
      });
      setEditingAlumni(null);
      setStatusMessage('Kandungan profil alumni berjaya dikemaskini!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (e: any) {
      alert('Ralat mengemaskini profil: ' + e.message);
    }
  };

  const counts = {
    ALL: alumniList.length,
    SUBMITTED: alumniList.filter((a) => a.verificationStatus === 'SUBMITTED').length,
    UNDER_REVIEW: alumniList.filter((a) => a.verificationStatus === 'UNDER_REVIEW').length,
    APPROVED: alumniList.filter((a) => a.verificationStatus === 'APPROVED').length,
    REJECTED: alumniList.filter((a) => a.verificationStatus === 'REJECTED').length,
    FEATURED: alumniList.filter((a) => a.featured).length,
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner Status */}
      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="text-[11px] font-bold text-amber-800 uppercase">Menunggu Kelulusan</div>
          <div className="text-2xl font-black text-amber-900 tabular-nums">{counts.SUBMITTED}</div>
        </div>
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="text-[11px] font-bold text-emerald-800 uppercase">Disahkan & Awam</div>
          <div className="text-2xl font-black text-emerald-900 tabular-nums">{counts.APPROVED}</div>
        </div>
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="text-[11px] font-bold text-teal-800 uppercase">Ditampilkan (Unggul)</div>
          <div className="text-2xl font-black text-teal-900 tabular-nums">{counts.FEATURED}</div>
        </div>
        <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl">
          <div className="text-[11px] font-bold text-slate-700 uppercase">Jumlah Pendaftaran</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">{counts.ALL}</div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({counts.ALL})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SUBMITTED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'SUBMITTED'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Baharu ({counts.SUBMITTED})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'APPROVED'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Disahkan ({counts.APPROVED})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'REJECTED'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ditolak ({counts.REJECTED})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama/sekolah..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          />
        </div>
      </div>

      {/* Alumni Management Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAlumni.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Tiada rekod alumni bertepatan dengan pilihan tab/carian.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredAlumni.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-300">
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={item.fullName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-teal-800 text-sm">
                        {item.fullName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{item.fullName}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          item.verificationStatus === 'APPROVED'
                            ? 'bg-teal-100 text-teal-800'
                            : item.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.verificationStatus}
                      </span>
                      {item.featured && (
                        <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-slate-950" />
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {item.lastPosition} — <span className="text-slate-800">{item.lastSchool}</span> ({item.state})
                    </p>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Emel: {item.email}</span>
                      <span>Telefon: {item.phone}</span>
                      <span>
                        Siri Khidmat: {item.careerStartYear}–{item.retirementYear}
                      </span>
                    </div>

                    {item.rejectionReason && item.verificationStatus === 'REJECTED' && (
                      <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200 mt-1">
                        <strong>Sebab Penolakan:</strong> {item.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Approve / Reject buttons */}
                  {item.verificationStatus !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Luluskan</span>
                    </button>
                  )}

                  {item.verificationStatus !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(item.id);
                        setRejectionReason('');
                      }}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-lg border border-rose-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  )}

                  {/* Toggle Featured */}
                  <button
                    type="button"
                    onClick={() => onToggleFeature(item.id)}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                      item.featured
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                    title="Unggul / Featured Story"
                  >
                    <Star className={`w-4 h-4 ${item.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  {/* Edit Story / Bio */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Sunting Kandungan Story/Bio"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete (Admins only) */}
                  {!isMediaAjk && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Padamkan rekod alumni ${item.fullName}?`)) {
                          onDelete(item.id);
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 cursor-pointer"
                      title="Padam Rekod Alumni"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Rejection Reason */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Sebab Penolakan Pendaftaran Alumni
            </h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Sila nyatakan sebab permohonan ditolak atau perlu pembetulan..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg cursor-pointer"
              >
                Sahkan Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Bio & Story */}
      {editingAlumni && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-teal-700" />
              Sunting Profil & Legasi Alumni: {editingAlumni.fullName}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pesanan Legasi (Quote)
                </label>
                <textarea
                  rows={2}
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ringkasan Biografi / Story
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sumbangan Kepada MPGBSIM
                </label>
                <textarea
                  rows={2}
                  value={editContribution}
                  onChange={(e) => setEditContribution(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingAlumni(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 rounded-lg cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
