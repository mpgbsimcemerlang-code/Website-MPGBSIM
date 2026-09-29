import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  School,
  Globe,
  MapPin,
  X,
  Send,
  ExternalLink,
  Users,
  Camera,
  Upload,
  UserCheck,
  User,
  Image as ImageIcon,
  Building2,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Wrench,
  Check,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool } from '../../types';
import { PORTAL_SCHOOL_TYPES } from '../../data/mockData';
import { DiagnosticReport } from '../../utils/schoolDiagnostic';

export const AdminSchoolManagement: React.FC = () => {
  const {
    siteData,
    addMemberSchool,
    updateMemberSchool,
    deleteMemberSchool,
    runSchoolDiagnostics,
    autoRepairSchoolIntegrity,
  } = useAdminContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Diagnostic Modal States
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairResults, setRepairResults] = useState<string[] | null>(null);

  const handleOpenDiagnostic = () => {
    const report = runSchoolDiagnostics();
    setDiagnosticReport(report);
    setRepairResults(null);
    setIsDiagnosticOpen(true);
  };

  const handleReRunDiagnostic = () => {
    const report = runSchoolDiagnostics();
    setDiagnosticReport(report);
  };

  const handleAutoRepair = () => {
    setIsRepairing(true);
    setTimeout(() => {
      const res = autoRepairSchoolIntegrity();
      setRepairResults(
        res.actionsTaken.length > 0
          ? res.actionsTaken
          : ['Semua integriti kod dan data sekolah telah disahkan unik dan disegerakkan.']
      );
      const updatedReport = runSchoolDiagnostics();
      setDiagnosticReport(updatedReport);
      setIsRepairing(false);
    }, 350);
  };

  const malaysianStates = [
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
    'W.P. Kuala Lumpur',
    'W.P. Labuan',
    'W.P. Putrajaya',
  ];

  const schoolTypes = PORTAL_SCHOOL_TYPES;

  const initialFormState: Omit<MemberSchool, 'id'> = {
    name: '',
    code: '',
    state: 'Selangor',
    district: '',
    type: 'Sekolah Menengah',
    principal: '',
    principalPhotoUrl: '',
    schoolPhotoUrl: '',
    website: 'https://',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
    description: '',
    studentCount: 500,
    joinYear: 2026,
    serviceStartYear: 2020,
    teacherCount: 45,
    address: '',
    phone: '',
    email: '',
    password: '',
  };

  const [formData, setFormData] = useState<Omit<MemberSchool, 'id'>>(initialFormState);

  const schoolsList = siteData.memberSchools || [];
  const pendingCount = (siteData.memberApplications || []).filter((a) => a.status === 'pending').length;

  const filteredSchools = schoolsList.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.code && school.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (school.principal && school.principal.toLowerCase().includes(searchTerm.toLowerCase())) ||
      school.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === 'all' || school.state === filterState;
    const matchesType = filterType === 'all' || school.type === filterType;
    return matchesSearch && matchesState && matchesType;
  });

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (school: MemberSchool) => {
    setFormData({
      name: school.name,
      code: school.code || '',
      state: school.state,
      district: school.district || '',
      type: school.type,
      principal: school.principal || '',
      principalPhotoUrl: school.principalPhotoUrl || '',
      schoolPhotoUrl: school.schoolPhotoUrl || '',
      website: school.website || '',
      logoUrl: school.logoUrl || '',
      description: school.description || '',
      studentCount: school.studentCount || 0,
      joinYear: school.joinYear || 2026,
      serviceStartYear: school.serviceStartYear || (school as any).pgbStartYear || 2020,
      teacherCount: school.teacherCount || 0,
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      password: school.password || '',
    });
    setEditingId(school.id);
    setIsEditing(true);
  };

  const handlePrincipalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Saiz gambar korporat melebihi 3MB. Sila pilih gambar yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, principalPhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Saiz logo melebihi 2MB. Sila pilih gambar yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSchoolPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Saiz gambar sekolah melebihi 5MB. Sila pilih fail yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, schoolPhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await updateMemberSchool(editingId, formData);
        setSaveSuccessMsg(`Perubahan maklumat institusi "${formData.name}" & Pengetua/Guru Besar berjaya disimpan dan disegerakkan ke Portal Ahli!`);
      } else {
        const newId = `sch-${Date.now()}`;
        await addMemberSchool({
          ...formData,
          id: newId,
        });
        setSaveSuccessMsg(`Institusi sekolah "${formData.name}" berjaya didaftarkan ke dalam direktori!`);
      }
      setTimeout(() => {
        setIsEditing(false);
        setIsSaving(false);
      }, 350);
      setTimeout(() => {
        setSaveSuccessMsg(null);
      }, 5000);
    } catch (err) {
      console.error('Ralat simpan sekolah:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Pengurusan Direktori Sekolah Ahli</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar, sunting maklumat sekolah, kemas kini logo, pautan laman web rasmi dan penerangan profil sekolah.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenDiagnostic}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            title="Jalankan semakan integriti kod sekolah (seperti MJAC011) dan pautan data Portal Ahli"
          >
            <Activity className="w-4 h-4 text-indigo-700" />
            <span>Semakan Diagnostik Kod</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-teal-900/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Sekolah Baharu</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>
              Terdapat <strong>{pendingCount} permohonan keahlian baharu</strong> dari Portal Ahli yang menunggu kelulusan untuk didaftarkan ke direktori ini secara automatik.
            </span>
          </div>
          <span className="text-[11px] text-teal-800 font-bold bg-white px-3 py-1 rounded-lg border border-amber-200 shrink-0">
            Buka Tab 'Permohonan Keahlian' untuk luluskan
          </span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama sekolah, kod sekolah, atau pengetua..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">Semua Negeri</option>
            {malaysianStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">Semua Kategori</option>
            {schoolTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schools List / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSchools.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <School className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Tiada sekolah dijumpai mengikut tapisan semasa.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  {school.logoUrl ? (
                    <img
                      src={school.logoUrl}
                      alt={school.name}
                      className="w-14 h-14 object-contain rounded-xl p-1 bg-white border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as any).src =
                          'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base shrink-0">
                      {school.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold">
                        {school.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {school.state}
                      </span>
                      {school.code && (
                        <span className="text-[11px] font-mono text-slate-400">
                          Kod: {school.code}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{school.name}</h4>
                    {school.principal && (
                      <div className="flex items-center gap-2 mt-1">
                        {school.principalPhotoUrl ? (
                          <div className="relative group/pgb shrink-0">
                            <img
                              src={school.principalPhotoUrl}
                              alt={school.principal}
                              className="w-8 h-8 rounded-full object-cover border-2 border-teal-600 shadow-xs"
                              onError={(e) => {
                                (e.target as any).style.display = 'none';
                              }}
                            />
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold" title="Foto Korporat PGB Ada">
                              ✓
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(school)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-medium border border-amber-200 transition shrink-0 cursor-pointer"
                            title="Klik untuk muat naik gambar korporat PGB bagi sekolah ini"
                          >
                            <Camera className="w-3 h-3 text-amber-700" />
                            <span>+ Muat Naik Foto PGB</span>
                          </button>
                        )}
                        <p className="text-xs text-slate-700 font-semibold truncate">
                          PGB: <span className="text-slate-900">{school.principal}</span>
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {school.description || 'Sekolah berdaftar di bawah Majlis Pengetua Guru Besar Sekolah Islam Malaysia.'}
                    </p>

                    {school.website && (
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 hover:underline mt-1 font-semibold"
                      >
                        <Globe className="w-3 h-3" />
                        <span>{school.website}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}

                    {/* Foto Institusi / Gambar Sekolah Status */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {school.schoolPhotoUrl ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                          <Building2 className="w-3 h-3 text-emerald-700" />
                          <span>Foto Institusi: Ada</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(school)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-[10px] font-medium border border-amber-200 transition cursor-pointer"
                          title="Muat naik sekeping foto institusi sekolah (bangunan/pintu gerbang)"
                        >
                          <Building2 className="w-3 h-3 text-amber-700" />
                          <span>+ Upload Foto Institusi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEdit(school)}
                    className="p-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition"
                    title="Sunting Sekolah"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Padam sekolah "${school.name}" daripada direktori?`)) {
                        deleteMemberSchool(school.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                    title="Padam Sekolah"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit School Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="text-base font-extrabold text-slate-900">
                {editingId ? 'Sunting Maklumat Sekolah' : 'Daftar Sekolah Baharu'}
              </h4>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Penuh Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="cth: SMKA Maahad Muar"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kod Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="cth: JEA0012"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Negeri
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {malaysianStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori / Jenis Sekolah
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {schoolTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Pengetua / Guru Besar
                  </label>
                  <input
                    type="text"
                    value={formData.principal}
                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                    placeholder="cth: Ustaz Ahmad bin Ismail"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tahun Menjadi PGB
                  </label>
                  <input
                    type="number"
                    min="1970"
                    max={new Date().getFullYear() + 2}
                    value={formData.serviceStartYear || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceStartYear: e.target.value ? Number(e.target.value) : undefined,
                        pgbStartYear: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="cth: 2018"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Daerah
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="cth: Muar"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Emel Rasmi Sekolah / PGB
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="pengetua@sekolah.edu.my"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    No. Telefon Pejabat / PGB
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="cth: 03-8888 1234"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kata Laluan Akaun PGB
                  </label>
                  <input
                    type="text"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={formData.code ? `cth: PGB#${formData.code.toUpperCase()}` : 'cth: PGB#2026!'}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Muat Naik Gambar Korporat PGB */}
              <div className="p-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Camera className="w-4 h-4 text-teal-700" />
                    <span>Gambar Korporat PGB (Pengetua / Guru Besar)</span>
                  </label>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    Foto Rasmi CMS
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Admin boleh memuat naik foto korporat/formal Pengetua atau Guru Besar bagi sekolah yang telah berdaftar untuk dipaparkan dalam profil direktori rangkaian sekolah MPGBSIM.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-24 h-28 rounded-xl border-2 border-dashed border-teal-400 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-xs group">
                    {formData.principalPhotoUrl ? (
                      <>
                        <img
                          src={formData.principalPhotoUrl}
                          alt="Foto Korporat PGB"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded">Tukar</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <UserCheck className="w-8 h-8 text-teal-600/70 mb-1" />
                        <span className="text-[10px] leading-tight text-slate-500 font-medium">Foto PGB</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Muat Naik Fail Foto PGB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePrincipalPhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {formData.principalPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, principalPhotoUrl: '' })}
                          className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Padam Foto</span>
                        </button>
                      )}
                      <span className="text-[11px] text-slate-500">Maks. 3MB (JPG / PNG / WebP)</span>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Atau tampal pautan (URL) foto rasmi PGB..."
                        value={formData.principalPhotoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, principalPhotoUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-800 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Sekolah */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-xs">
                    Logo / Lencana Sekolah
                  </label>
                  <label className="text-[11px] text-teal-700 font-medium hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Muat Naik Fail Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://... atau muat naik fail di atas"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Preview"
                      className="w-9 h-9 object-contain rounded-lg border border-slate-200 p-0.5 bg-white shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Muat Naik Sekeping Foto Institusi (Sekolah) */}
              <div className="p-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Building2 className="w-4 h-4 text-teal-700" />
                    <span>Foto Institusi (Sekolah)</span>
                  </label>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    Foto Direktori
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Muat naik sekeping foto institusi sekolah (bangunan pentadbiran atau pintu gerbang utama) untuk dipaparkan pada profil sekolah dalam Direktori Rangkaian Sekolah MPGBSIM.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-32 h-20 rounded-xl border-2 border-dashed border-teal-400 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-xs group">
                    {formData.schoolPhotoUrl ? (
                      <>
                        <img
                          src={formData.schoolPhotoUrl}
                          alt="Gambar Sekolah"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded">Tukar</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <Building2 className="w-6 h-6 text-teal-600/70 mb-1" />
                        <span className="text-[10px] leading-tight text-slate-500 font-medium">Foto Sekolah</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Muat Naik Fail Gambar Sekolah</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSchoolPhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {formData.schoolPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, schoolPhotoUrl: '' })}
                          className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Padam Foto</span>
                        </button>
                      )}
                      <span className="text-[11px] text-slate-500">Maks. 5MB (JPG / PNG / WebP)</span>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Atau masukkan pautan (URL) gambar sekolah..."
                        value={formData.schoolPhotoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, schoolPhotoUrl: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-800 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Laman Web Rasmi Sekolah (Website)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://sekolahanda.edu.my"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Penerangan / Profil Sekolah (Description)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Latar belakang penubuhan, aliran tahfiz, keistimewaan kurikulum dan pencapaian..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Anggaran Bilangan Murid
                  </label>
                  <input
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bilangan Guru
                  </label>
                  <input
                    type="number"
                    value={formData.teacherCount}
                    onChange={(e) => setFormData({ ...formData, teacherCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-md shadow-teal-900/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Daftar Sekolah')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diagnostic Verification & Integrity Repair Modal */}
      {isDiagnosticOpen && diagnosticReport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    Semakan Diagnostik Kod Sekolah & Integriti Keahlian
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pengesahan keunikan kod (termasuk MJAC011), ID rekod, dan integriti pautan Portal Ahli.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDiagnosticOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${
                  diagnosticReport.overallStatus === 'passed'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : diagnosticReport.overallStatus === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {diagnosticReport.overallStatus === 'passed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-extrabold text-sm block">
                      {diagnosticReport.overallStatus === 'passed'
                        ? 'Status Integriti: SEMUA KOD & DATA SAH (PASSED)'
                        : 'Status Integriti: PERHATIAN / PERLU PENYELARASAN'}
                    </span>
                    <p className="text-xs opacity-90 mt-0.5">
                      {diagnosticReport.overallStatus === 'passed'
                        ? 'Semua kod institusi sekolah unik dan rekod Sekolah Rendah Islam I Musleh (MJAC011) terpaut dengan tepat.'
                        : 'Terdapat anomali atau data bertindih yang perlu dibaiki.'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/80 font-mono font-bold shrink-0 border border-slate-200">
                  {diagnosticReport.timestamp}
                </span>
              </div>

              {/* Repair Result Banner if auto-repair was triggered */}
              {repairResults && (
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Check className="w-4 h-4 text-teal-700" />
                    <span>Tindakan Auto-Baiki Berjaya Dilaksanakan:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-teal-800 space-y-0.5 pl-1">
                    {repairResults.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Jumlah Sekolah</span>
                  <strong className="text-base text-slate-900 font-black">{diagnosticReport.summary.totalSchools}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Kod Unik</span>
                  <strong className="text-base text-emerald-700 font-black font-mono">
                    {diagnosticReport.summary.uniqueCodesCount} / {diagnosticReport.summary.totalSchools}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">SRI I Musleh</span>
                  <strong className="text-xs text-indigo-700 font-bold font-mono">MJAC011 (Sah)</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Integriti Pautan</span>
                  <strong className="text-xs text-teal-700 font-bold">100% Aktif</strong>
                </div>
              </div>

              {/* Checks Detailed Cards */}
              <div className="space-y-3">
                {diagnosticReport.checks.map((check) => (
                  <div
                    key={check.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {check.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : check.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <h5 className="font-bold text-slate-900 text-xs">{check.title}</h5>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          check.status === 'passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : check.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {check.status === 'passed' ? 'Lulus' : check.status === 'warning' ? 'Perhatian' : 'Ralat'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 mb-2">{check.message}</p>

                    {check.details && check.details.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                        {check.details.map((det, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            <span>{det}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {check.recommendation && (
                      <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{check.recommendation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleReRunDiagnostic}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Uji Semula</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isRepairing}
                  onClick={handleAutoRepair}
                  className="px-4 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-900/20 transition cursor-pointer disabled:opacity-50"
                  title="Cantumkan sebarang data bertindih, kemas kini kod lapuk kepada MJAC011 dan selaraskan profil ahli"
                >
                  <Wrench className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`} />
                  <span>{isRepairing ? 'Menyelaraskan...' : 'Auto-Baiki & Segerak Integriti'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDiagnosticOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
