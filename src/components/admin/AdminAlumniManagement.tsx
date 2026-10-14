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
  Upload,
  MapPin,
  Plus,
  UserPlus,
} from 'lucide-react';
import { AlumniRecord, AlumniVerificationStatus, LeadershipHistoryRecord } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { useAdminContent } from '../../context/AdminContentContext';
import { AlumniRegistrationModal } from '../alumni/AlumniRegistrationModal';

interface AdminAlumniManagementProps {
  alumniList: AlumniRecord[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onUpdate: (id: string, patch: Partial<AlumniRecord>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleFeature: (id: string) => Promise<void>;
  isMediaAjk?: boolean;
}

const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Wilayah Persekutuan Kuala Lumpur',
  'Wilayah Persekutuan Putrajaya',
  'Wilayah Persekutuan Labuan',
];

export const AdminAlumniManagement: React.FC<AdminAlumniManagementProps> = ({
  alumniList,
  onApprove,
  onReject,
  onUpdate,
  onDelete,
  onToggleFeature,
  isMediaAjk = false,
}) => {
  const { addAlumniRecord } = useAdminContent();
  const [activeTab, setActiveTab] = useState<AlumniVerificationStatus | 'ALL' | 'FEATURED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // Rejection reason modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Edit modal state
  const [editingAlumni, setEditingAlumni] = useState<AlumniRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editLastPosition, setEditLastPosition] = useState('');
  const [editLastSchool, setEditLastSchool] = useState('');
  const [editState, setEditState] = useState('Selangor');
  const [editCareerStartYear, setEditCareerStartYear] = useState<number>(1990);
  const [editRetirementYear, setEditRetirementYear] = useState<number>(2024);
  const [editLeadershipHistory, setEditLeadershipHistory] = useState<LeadershipHistoryRecord[]>([]);
  const [editBio, setEditBio] = useState('');
  const [editQuote, setEditQuote] = useState('');
  const [editContribution, setEditContribution] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  const [statusMessage, setStatusMessage] = useState('');

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingPhoto(true);
    try {
      const dataUrl = await compressImageFile(file, 600, 600, 0.85);
      if (dataUrl) {
        setEditPhoto(dataUrl);
      }
    } catch (err) {
      alert('Ralat memproses gambar: Sila pilih fail gambar PNG atau JPG.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const filteredAlumni = alumniList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      item.fullName.toLowerCase().includes(q) ||
      item.lastSchool.toLowerCase().includes(q) ||
      (item.state && item.state.toLowerCase().includes(q)) ||
      (item.leadershipHistory &&
        item.leadershipHistory.some(
          (lh) =>
            lh.schoolName?.toLowerCase().includes(q) ||
            lh.state?.toLowerCase().includes(q)
        ));

    const matchesState =
      selectedStateFilter === 'ALL' ||
      item.state === selectedStateFilter ||
      (item.leadershipHistory &&
        item.leadershipHistory.some((lh) => lh.state === selectedStateFilter));

    if (!matchesSearch || !matchesState) return false;
    if (activeTab === 'ALL') return true;
    if (activeTab === 'FEATURED') return Boolean(item.featured);
    return item.verificationStatus === activeTab;
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
    setEditTitle(alumni.title || '');
    setEditFullName(alumni.fullName || '');
    setEditLastPosition(alumni.lastPosition || '');
    setEditLastSchool(alumni.lastSchool || '');
    setEditState(alumni.state || 'Selangor');
    setEditCareerStartYear(alumni.careerStartYear || 1990);
    setEditRetirementYear(alumni.retirementYear || 2024);
    setEditLeadershipHistory(
      alumni.leadershipHistory && alumni.leadershipHistory.length > 0
        ? alumni.leadershipHistory.map((r, i) => ({
            ...r,
            id: r.id || `lh-edit-${i}-${Date.now()}`,
            state: r.state || alumni.state || 'Selangor',
          }))
        : [
            {
              id: `lh-edit-0-${Date.now()}`,
              schoolName: alumni.lastSchool || '',
              position: alumni.lastPosition || 'Pengetua',
              startYear: alumni.careerStartYear || 2010,
              endYear: alumni.retirementYear || 2024,
              state: alumni.state || 'Selangor',
            },
          ]
    );
    setEditBio(alumni.biography || '');
    setEditQuote(alumni.legacyQuote || '');
    setEditContribution(alumni.contributions || '');
    setEditPhoto(alumni.photo || '');
  };

  const handleAddEditLeadershipRecord = () => {
    setEditLeadershipHistory((prev) => [
      ...prev,
      {
        id: `lh-edit-${Date.now()}`,
        schoolName: '',
        position: 'Pengetua',
        startYear: 2015,
        endYear: 2024,
        state: editState || 'Selangor',
      },
    ]);
  };

  const handleRemoveEditLeadershipRecord = (id: string) => {
    if (editLeadershipHistory.length <= 1) return;
    setEditLeadershipHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateEditLeadershipRecord = (
    id: string,
    field: keyof LeadershipHistoryRecord,
    value: any
  ) => {
    setEditLeadershipHistory((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveEdit = async () => {
    if (!editingAlumni) return;
    try {
      await onUpdate(editingAlumni.id, {
        title: editTitle.trim(),
        fullName: editFullName.trim() || editingAlumni.fullName,
        lastPosition: editLastPosition.trim() || editingAlumni.lastPosition,
        lastSchool: editLastSchool.trim() || editingAlumni.lastSchool,
        state: editState,
        careerStartYear: editCareerStartYear,
        retirementYear: editRetirementYear,
        leadershipHistory: editLeadershipHistory.filter((r) => r.schoolName.trim().length > 0),
        biography: editBio,
        legacyQuote: editQuote,
        contributions: editContribution,
        photo: editPhoto,
      });
      setEditingAlumni(null);
      setStatusMessage('Profil, sekolah & negeri berkhidmat alumni berjaya dikemaskini!');
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

      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Pengurusan CMS Direktori Alumni PGB
          </span>
          <h3 className="text-lg font-black text-white mt-0.5">
            Rekod Alumni, Sekolah & Negeri Berkhidmat
          </h3>
          <p className="text-xs text-slate-300">
            Urus kelulusan pendaftaran, kemas kini sekolah dan negeri tempat berkhidmat, serta profil legasi alumni.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsRegistrationModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer shrink-0 self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Daftar Alumni PGB Baharu</span>
        </button>
      </div>

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

      {/* Tabs, State Filter & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
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

        {/* State Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative min-w-[190px]">
            <MapPin className="w-3.5 h-3.5 text-teal-700 absolute left-2.5 top-2.5 pointer-events-none" />
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-700 cursor-pointer"
            >
              <option value="ALL">Semua Negeri Berkhidmat</option>
              {MALAYSIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, sekolah atau negeri..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>
        </div>
      </div>

      {/* Alumni Management Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAlumni.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Tiada rekod alumni bertepatan dengan pilihan tab/negeri/carian.
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

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {item.title ? `${item.title} ` : ''}
                        {item.fullName}
                      </span>
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

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>
                          {item.lastPosition} — <strong className="text-slate-900">{item.lastSchool}</strong>
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-bold">
                        <MapPin className="w-3 h-3 text-teal-700" />
                        Negeri Sekolah: {item.state || 'Tiada Maklumat'}
                      </span>
                    </div>

                    {item.leadershipHistory && item.leadershipHistory.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Sejarah Sekolah:
                        </span>
                        {item.leadershipHistory.map((lh, idx) => (
                          <span
                            key={lh.id || idx}
                            className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            {lh.schoolName} ({lh.state || item.state})
                          </span>
                        ))}
                      </div>
                    )}

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

                  {/* Edit Profile, School, State & Story */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 cursor-pointer"
                    title="Sunting Maklumat Sekolah, Negeri Berkhidmat & Legasi"
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

      {/* Modal Edit Profile, School, State & Story */}
      {editingAlumni && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-teal-700" />
                Sunting Profil, Sekolah & Negeri Berkhidmat: {editingAlumni.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAlumni(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Gambar Profil */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gambar Profil Alumni
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 border border-amber-400 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {editPhoto ? (
                      <img src={editPhoto} alt="Profil Alumni" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                    {isCompressingPhoto && (
                      <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-amber-300 text-[9px] font-bold">
                        Memproses...
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>Muat Naik Gambar Baharu</span>
                      <input type="file" accept="image/*" onChange={handlePhotoFileChange} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500">Pilih gambar rasmi dari peranti anda. Dioptimumkan secara automatik.</p>
                  </div>
                </div>
              </div>

              {/* Maklumat Utama, Sekolah Terakhir & Negeri Berkhidmat */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-extrabold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  Maklumat Perkhidmatan & Negeri Sekolah Berkhidmat
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Gelaran
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Contoh: Dato' Hj. / Ustaz"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Penuh Alumni
                    </label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Jawatan Terakhir
                    </label>
                    <input
                      type="text"
                      value={editLastPosition}
                      onChange={(e) => setEditLastPosition(e.target.value)}
                      placeholder="Contoh: Mantan Pengetua Cemerlang"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Sekolah / Institusi Terakhir Berkhidmat
                    </label>
                    <input
                      type="text"
                      value={editLastSchool}
                      onChange={(e) => setEditLastSchool(e.target.value)}
                      placeholder="Contoh: SMKA Maahad Hamidiah Kajang"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Negeri Sekolah / Institusi Terakhir Berkhidmat <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white font-bold text-teal-950"
                    >
                      {MALAYSIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tahun Mula Khidmat
                    </label>
                    <input
                      type="number"
                      value={editCareerStartYear}
                      onChange={(e) => setEditCareerStartYear(parseInt(e.target.value) || 1990)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tahun Bersara / Akhir Khidmat
                    </label>
                    <input
                      type="number"
                      value={editRetirementYear}
                      onChange={(e) => setEditRetirementYear(parseInt(e.target.value) || 2024)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Senarai Sejarah Sekolah & Negeri Berkhidmat */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    Sejarah Sekolah & Negeri Tempat Berkhidmat
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddEditLeadershipRecord}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Sekolah
                  </button>
                </div>

                {editLeadershipHistory.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Sekolah #{idx + 1}
                      </span>
                      {editLeadershipHistory.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditLeadershipRecord(rec.id!)}
                          className="text-rose-600 hover:text-rose-800 text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Nama Sekolah Berkhidmat
                        </label>
                        <input
                          type="text"
                          value={rec.schoolName}
                          onChange={(e) =>
                            handleUpdateEditLeadershipRecord(rec.id!, 'schoolName', e.target.value)
                          }
                          placeholder="Nama sekolah..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Negeri Sekolah Berkhidmat
                        </label>
                        <select
                          value={rec.state || editState}
                          onChange={(e) =>
                            handleUpdateEditLeadershipRecord(rec.id!, 'state', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-semibold text-slate-800"
                        >
                          {MALAYSIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Jawatan
                        </label>
                        <input
                          type="text"
                          value={rec.position}
                          onChange={(e) =>
                            handleUpdateEditLeadershipRecord(rec.id!, 'position', e.target.value)
                          }
                          placeholder="Pengetua / Guru Besar"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Tahun Mula
                        </label>
                        <input
                          type="number"
                          value={rec.startYear}
                          onChange={(e) =>
                            handleUpdateEditLeadershipRecord(
                              rec.id!,
                              'startYear',
                              parseInt(e.target.value) || 2010
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Tahun Tamat
                        </label>
                        <input
                          type="number"
                          value={rec.endYear}
                          onChange={(e) =>
                            handleUpdateEditLeadershipRecord(
                              rec.id!,
                              'endYear',
                              parseInt(e.target.value) || 2024
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
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

      {/* Direct Admin Registration Modal */}
      <AlumniRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSubmit={async (data) => {
          const id = await addAlumniRecord({
            ...data,
            verificationStatus: 'APPROVED',
          });
          setStatusMessage('Rekod alumni baharu berjaya didaftarkan dan diluluskan!');
          setTimeout(() => setStatusMessage(''), 4000);
          return id;
        }}
      />
    </div>
  );
};
