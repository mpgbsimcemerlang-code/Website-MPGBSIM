import React, { useState } from 'react';
import {
  School,
  Search,
  KeyRound,
  Shield,
  ArrowRight,
  Sparkles,
  MapPin,
  GraduationCap,
  Mail,
  Lock,
  Building2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  UserCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  ImageIcon,
  X,
  Phone,
  Users,
  Camera,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Logo } from '../Logo';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool, MemberApplication } from '../../types';
import { MALAYSIA_STATES, PORTAL_SCHOOL_TYPES } from '../../data/mockData';
import { MemberRegistrationForm, savePendingRegistration } from '../../services/firebaseConfig';

export const PortalLoginView: React.FC = () => {
  const {
    loginAsMemberSchool,
    loginWithEmail,
    loginWithGoogle,
    setViewMode,
  } = useMemberPortal();

  const { siteData, addMemberApplication } = useAdminContent();

  const [activeTab, setActiveTab] = useState<'schools' | 'credentials' | 'register' | 'status'>('schools');

  // Search & Filters for Registered Schools
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('Semua Negeri');
  const [selectedType, setSelectedType] = useState('Semua Jenis');

  // Form credentials state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Registered School Authentication Modal state
  const [schoolToAuth, setSchoolToAuth] = useState<MemberSchool | null>(null);
  const [schoolAuthPass, setSchoolAuthPass] = useState('');
  const [schoolAuthError, setSchoolAuthError] = useState<string | null>(null);
  const [isVerifyingSchool, setIsVerifyingSchool] = useState(false);
  const [showSchoolPassword, setShowSchoolPassword] = useState(false);

  // Status check query
  const [statusQuery, setStatusQuery] = useState('');
  const [statusResult, setStatusResult] = useState<{
    found: boolean;
    message: string;
    data?: any;
  } | null>(null);

  // New Registration form
  const [regForm, setRegForm] = useState<MemberRegistrationForm>({
    fullName: '',
    icNumber: '',
    position: 'Pengetua',
    serviceStartYear: 2020,
    pgbStartYear: 2020,
    email: '', // Email Rasmi PGB
    phone: '', // No. Telefon PGB
    pgbPhotoUrl: '', // Upload Gambar PGB
    schoolName: '',
    schoolCode: '',
    schoolType: 'Sekolah Menengah',
    joinYear: new Date().getFullYear(),
    schoolJoinYear: new Date().getFullYear(),
    state: 'Selangor',
    district: '',
    address: '',
    schoolEmail: '', // Email Rasmi Sekolah
    schoolPhone: '', // No Telefon Sekolah
    website: '',
    studentCount: 500, // Jumlah Murid
    teacherCount: 40, // Jumlah Guru
    logoUrl: '',
    schoolPhotoUrl: '', // Foto Institusi
    notes: '',
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Registered schools list from CMS / context
  const registeredSchools = siteData.memberSchools || [];

  const filteredSchools = registeredSchools.filter((school) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      school.name.toLowerCase().includes(q) ||
      (school.code && school.code.toLowerCase().includes(q)) ||
      (school.principal && school.principal.toLowerCase().includes(q)) ||
      school.state.toLowerCase().includes(q) ||
      (school.district && school.district.toLowerCase().includes(q));

    const matchesState =
      selectedState === 'Semua Negeri' || school.state === selectedState;
    const matchesType =
      selectedType === 'Semua Jenis' || school.type === selectedType;

    return matchesQuery && matchesState && matchesType;
  });

  const handleOpenSchoolAuth = (school: MemberSchool) => {
    setSchoolToAuth(school);
    setSchoolAuthPass('');
    setSchoolAuthError(null);
  };

  const handleConfirmSchoolAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolToAuth) return;
    setSchoolAuthError(null);
    setIsVerifyingSchool(true);

    try {
      await loginWithEmail(schoolToAuth.code, schoolAuthPass);
      setSchoolToAuth(null);
    } catch (err: any) {
      setSchoolAuthError(
        err.message || 'Kata laluan tidak tepat. Sila pastikan kata laluan akaun sekolah adalah sah.'
      );
    } finally {
      setIsVerifyingSchool(false);
    }
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const emailOrCode = emailInput.trim();
      const pass = passwordInput.trim();

      await loginWithEmail(emailOrCode, pass);
    } catch (err: any) {
      setAuthError(err.message || 'Ralat semasa log masuk. Sila semak emel/kod sekolah dan kata laluan anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Akaun Google ini tidak berdaftar sebagai ahli sah MPGBSIM.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusQuery.trim()) return;

    const q = statusQuery.trim().toLowerCase();

    // 1. Check in registered schools
    const foundSchool = registeredSchools.find(
      (s) =>
        s.code.toLowerCase() === q ||
        s.name.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase() === q) ||
        (s.principal && s.principal.toLowerCase().includes(q))
    );

    if (foundSchool) {
      setStatusResult({
        found: true,
        message: `Tahniah! Institusi ${foundSchool.name} (${foundSchool.code}) telah berdaftar secara aktif dalam rangkaian rasmi MPGBSIM.`,
        data: {
          schoolName: foundSchool.name,
          principal: foundSchool.principal,
          code: foundSchool.code,
          state: foundSchool.state,
          type: foundSchool.type,
          status: 'Aktif / Diluluskan',
          school: foundSchool,
        },
      });
      return;
    }

    // 2. Check in applications
    const apps = siteData.memberApplications || [];
    const foundApp = apps.find(
      (a) =>
        a.email?.toLowerCase() === q ||
        a.schoolName?.toLowerCase().includes(q) ||
        a.refId?.toLowerCase() === q
    );

    if (foundApp) {
      setStatusResult({
        found: true,
        message: `Permohonan bagi institusi ${foundApp.schoolName} dijumpai.`,
        data: {
          schoolName: foundApp.schoolName,
          principal: foundApp.fullName,
          code: foundApp.schoolCode || 'Dalam Pemprosesan',
          state: foundApp.state,
          status: foundApp.status === 'approved' ? 'Diluluskan' : 'Sedang Diproses Urus Setia',
        },
      });
      return;
    }

    setStatusResult({
      found: false,
      message: `Tiada rekod pendaftaran ditemui bagi "${statusQuery}". Sila semak no. kod sekolah atau alamat emel pendaftaran anda.`,
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitting(true);
    setRegSuccess(null);

    const serviceYear = Number(regForm.serviceStartYear) || new Date().getFullYear();
    const joinYear = Number(regForm.joinYear) || Number(regForm.schoolJoinYear) || new Date().getFullYear();
    const res = await savePendingRegistration({
      ...regForm,
      phoneNumber: regForm.phone,
      designation: regForm.position as any,
      serviceStartYear: serviceYear,
      pgbStartYear: serviceYear,
      joinYear,
      schoolJoinYear: joinYear,
      studentCount: Number(regForm.studentCount) || 0,
      teacherCount: Number(regForm.teacherCount) || 0,
    });
    if (res.success && res.refId) {
      const application: MemberApplication = {
        id: res.refId,
        refId: res.refId,
        fullName: regForm.fullName,
        icNumber: regForm.icNumber || '',
        email: regForm.email,
        phoneNumber: regForm.phone,
        pgbEmail: regForm.email,
        pgbPhone: regForm.phone,
        schoolEmail: regForm.schoolEmail || '',
        schoolPhone: regForm.schoolPhone || '',
        designation: regForm.position,
        serviceStartYear: serviceYear,
        pgbStartYear: serviceYear,
        joinYear,
        schoolJoinYear: joinYear,
        schoolName: regForm.schoolName,
        schoolCode: regForm.schoolCode || '',
        schoolType: regForm.schoolType,
        state: regForm.state,
        district: regForm.district || '',
        studentCount: Number(regForm.studentCount) || 0,
        teacherCount: Number(regForm.teacherCount) || 0,
        logoUrl: regForm.logoUrl,
        schoolPhotoUrl: regForm.schoolPhotoUrl,
        pgbPhotoUrl: regForm.pgbPhotoUrl,
        address: regForm.address,
        website: regForm.website,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      await addMemberApplication(application);
      setRegSuccess(
        `Permohonan keahlian bagi ${regForm.schoolName} berjaya dihantar dengan No. Rujukan: ${res.refId}. Urus Setia MPGBSIM akan menyemak dokumen anda dalam tempoh 1-3 hari bekerja.`
      );
    } else {
      alert('Ralat semasa menghantar permohonan. Sila cuba lagi.');
    }
    setRegSubmitting(false);
  };

  const handlePgbPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Saiz gambar PGB melebihi 3MB. Sila pilih fail imej yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRegForm((prev) => ({ ...prev, pgbPhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSchoolPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Saiz foto institusi melebihi 5MB. Sila pilih fail imej yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRegForm((prev) => ({ ...prev, schoolPhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Saiz logo melebihi 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRegForm((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo showText={false} size="sm" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-wide text-white">
                  MPGBSIM MEMBER PORTAL
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-400 text-slate-950 rounded font-mono">
                  Sesi 2026/2027
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Majlis Pengetua Guru Besar Sekolah Islam Malaysia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('public')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Laman Web Utama</span>
              <span className="sm:hidden">Laman Utama</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Portal Hero Intro */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            Gerbang Rasmi Ahli PGB Berdaftar
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ruang Digital Tertutup Kepimpinan Sekolah Islam
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Satu pusat bersepadu untuk komunikasi ahli, perkongsian amalan terbaik, direktori institusi, modul kecerdasan buatan (AI) serta pengurusan kepimpinan pendidikan Islam Malaysia.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="max-w-4xl mx-auto mb-6 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap sm:flex-nowrap gap-1">
          <button
            onClick={() => setActiveTab('schools')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'schools'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Sekolah Ahli Berdaftar ({registeredSchools.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'credentials'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Emel & Kata Laluan</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Daftar Ahli Baharu</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Semak Status</span>
          </button>
        </div>

        {/* TAB 1: INTEGRATED REGISTERED MEMBER SCHOOLS */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            {/* Search & Filtering Toolbar */}
            <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari mengikut nama sekolah, kod sekolah (cth: MJAC011), negeri, atau nama Pengetua..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Semua Negeri">Semua Negeri</option>
                    {MALAYSIA_STATES.filter((s) => s !== 'Semua Negeri').map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Semua Jenis">Semua Jenis Sekolah</option>
                    {PORTAL_SCHOOL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                <span>
                  Memaparkan <strong className="text-amber-400">{filteredSchools.length}</strong> daripada {registeredSchools.length} sekolah ahli berdaftar.
                </span>
                <span className="text-[11px] text-teal-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pilih sekolah anda untuk log masuk segera ke papan pemuka PGB
                </span>
              </div>
            </div>

            {/* School Grid */}
            {filteredSchools.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                <School className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Tiada sekolah ditemui</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Tiada rekod sekolah ahli sepadan dengan carian "{searchQuery}". Cuba gunakan kata kunci nama sekolah atau kod sekolah yang berlainan.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedState('Semua Negeri');
                    setSelectedType('Semua Jenis');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Set Semula Carian
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className="group bg-slate-900/90 hover:bg-slate-850 rounded-2xl border border-slate-800 hover:border-amber-400/50 transition-all duration-200 overflow-hidden shadow-lg flex flex-col justify-between"
                  >
                    {/* Sekeping Gambar Sekolah / Kampus Header */}
                    {school.schoolPhotoUrl ? (
                      <div className="h-32 w-full overflow-hidden relative bg-slate-950">
                        <img
                          src={school.schoolPhotoUrl}
                          alt={school.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-amber-300 backdrop-blur-xs border border-amber-400/30">
                          {school.type}
                        </span>
                        <span className="absolute bottom-2 left-3 text-[10px] font-mono text-white/90 bg-black/50 px-2 py-0.5 rounded">
                          {school.code}
                        </span>
                      </div>
                    ) : (
                      <div className="h-20 w-full bg-gradient-to-r from-slate-950 to-teal-950/60 p-3 flex items-center justify-between border-b border-slate-800">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {school.code}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {school.type}
                        </span>
                      </div>
                    )}

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          {school.logoUrl ? (
                            <img
                              src={school.logoUrl}
                              alt="Logo"
                              className="w-10 h-10 object-contain rounded-lg p-0.5 bg-white shrink-0 border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-teal-900/60 border border-teal-700/50 flex items-center justify-center shrink-0 text-amber-300">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                              {school.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                              <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                              <span className="truncate">{school.district ? `${school.district}, ` : ''}{school.state}</span>
                            </div>
                          </div>
                        </div>

                        {/* Principal & Info Box */}
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300 my-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">
                              PGB: <strong className="text-white">{school.principal || 'Pengetua / Guru Besar'}</strong>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                            <span>Murid: <strong className="text-slate-200">{school.studentCount || '400+'}</strong></span>
                            <span>Guru: <strong className="text-slate-200">{school.teacherCount || '35'}</strong></span>
                            <span className="text-emerald-400 font-semibold">Aktif</span>
                          </div>
                        </div>
                      </div>

                      {/* Authenticated Login Button */}
                      <button
                        onClick={() => handleOpenSchoolAuth(school)}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-amber-400/20 active:scale-98 transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-900" />
                        <span>Log Masuk PGB Berdaftar</span>
                        <ArrowRight className="w-4 h-4 text-slate-900" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MODAL PENGESAHAN KESELAMATAN LOG MASUK SEKOLAH */}
            {schoolToAuth && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 relative text-slate-100 space-y-5">
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setSchoolToAuth(null)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header with School Details */}
                  <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {schoolToAuth.logoUrl ? (
                        <img
                          src={schoolToAuth.logoUrl}
                          alt={schoolToAuth.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <School className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        KOD: {schoolToAuth.code}
                      </span>
                      <h3 className="font-extrabold text-sm text-white truncate mt-0.5">
                        {schoolToAuth.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        PGB: {schoolToAuth.principal}
                      </p>
                    </div>
                  </div>

                  {/* Campus Photo banner if available */}
                  {schoolToAuth.schoolPhotoUrl && (
                    <div className="rounded-xl overflow-hidden h-24 border border-slate-800 relative">
                      <img
                        src={schoolToAuth.schoolPhotoUrl}
                        alt={schoolToAuth.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-2">
                        <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                          <School className="w-3 h-3" />
                          Institusi Rasmi Berdaftar
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      Pengesahan Keselamatan Pengetua / Guru Besar
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sila masukkan kata laluan rasmi akaun sekolah ini untuk log masuk ke portal keahlian tertutup.
                    </p>
                  </div>

                  {schoolAuthError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{schoolAuthError}</span>
                    </div>
                  )}

                  <form onSubmit={handleConfirmSchoolAuth} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                        Kata Laluan Akaun Sekolah
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showSchoolPassword ? 'text' : 'password'}
                          required
                          autoFocus
                          placeholder="Masukkan kata laluan akaun sekolah"
                          value={schoolAuthPass}
                          onChange={(e) => setSchoolAuthPass(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 placeholder:text-slate-600 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSchoolPassword(!showSchoolPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showSchoolPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                        <span>Format laluan rasmi: <strong className="text-amber-400 font-mono">PGB#{schoolToAuth.code}</strong></span>
                        <button
                          type="button"
                          onClick={() => setSchoolAuthPass(`PGB#${schoolToAuth.code}`)}
                          className="text-amber-400 hover:underline cursor-pointer"
                        >
                          Isi Automatik
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Sekiranya anda belum menerima kata laluan rasmi, hubungi Urus Setia MPGBSIM di mpgbsim.cemerlang@gmail.com.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSchoolToAuth(null)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifyingSchool || !schoolAuthPass.trim()}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <span>{isVerifyingSchool ? 'Mengesahkan...' : 'Sahkan & Masuk'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EMAIL / PASSWORD & GOOGLE AUTH */}
        {activeTab === 'credentials' && (
          <div className="max-w-md mx-auto bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white">Log Masuk Pengesahan Ahli</h2>
              <p className="text-xs text-slate-400">
                Gunakan alamat emel rasmi berdaftar atau Kod Sekolah anda.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleCredentialSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                  Alamat Emel / Kod Sekolah
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="cth: WRA0001 atau pengetua@sekolah.edu.my"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                  Kata Laluan
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata laluan"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  <span>Hanya akaun sekolah dan pentadbir berdaftar MPGBSIM yang dibenarkan log masuk.</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Mengesahkan...' : 'Log Masuk ke Portal Ahli'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold shrink-0">
                Atau
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Log Masuk dengan Google Rasmi</span>
            </button>

            {/* Quick Demo Login Preset Helper */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                Pilihan Pantas Log Masuk Ahli / PGB Berdaftar:
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('abdulqayyumyaakop@imuslehmelaka.edu.my');
                    setPasswordInput('PGB#MJAC011');
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-amber-300 block truncate group-hover:text-amber-200">
                      Ustaz Abdul Qayyum bin Yaakop
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Sekolah Rendah Islam I Musleh (Kod: MJAC011)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono shrink-0">
                    PGB#MJAC011
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTER NEW MEMBER WITH SCHOOL PICTURE UPLOAD */}
        {activeTab === 'register' && (
          <div className="max-w-3xl mx-auto bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                Borang Pendaftaran Rasmi
              </div>
              <h2 className="text-xl font-black text-white">Permohonan Keahlian Baharu MPGBSIM</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                Borang ini dikhaskan untuk Pengetua atau Guru Besar sekolah Islam yang belum berdaftar dalam direktori rasmi.
              </p>
            </div>

            {regSuccess ? (
              <div className="p-6 rounded-2xl bg-teal-950/80 border border-teal-700 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Permohonan Berjaya Dihantar!</h3>
                <p className="text-xs text-teal-200 leading-relaxed max-w-md mx-auto">{regSuccess}</p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => setActiveTab('schools')}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold"
                  >
                    Kembali ke Senarai Sekolah
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                {/* 1. Maklumat Pengetua / Guru Besar (PGB) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                      <span>1. Maklumat Pengetua / Guru Besar (PGB)</span>
                    </h3>
                    <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 font-medium">
                      Kepimpinan Institusi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Nama Penuh PGB *</label>
                      <input
                        type="text"
                        required
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="cth: Ustaz Ahmad Fauzi bin Daud"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Jawatan Hakiki PGB *</label>
                      <select
                        value={regForm.position}
                        onChange={(e) => setRegForm({ ...regForm, position: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      >
                        <option value="Pengetua">Pengetua</option>
                        <option value="Guru Besar">Guru Besar</option>
                        <option value="Pemangku Pengetua">Pemangku Pengetua</option>
                        <option value="Penolong Kanan Pentadbiran">Penolong Kanan Pentadbiran</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tahun Menjadi PGB *</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1970"
                        max={new Date().getFullYear() + 2}
                        value={regForm.serviceStartYear || ''}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            serviceStartYear: e.target.value ? Number(e.target.value) : ('' as any),
                            pgbStartYear: e.target.value ? Number(e.target.value) : ('' as any),
                          })
                        }
                        placeholder="cth: 2018"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Tahun mula dilantik sebagai Pengetua / Guru Besar</span>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">No. Kad Pengenalan PGB</label>
                      <input
                        type="text"
                        value={regForm.icNumber || ''}
                        onChange={(e) => setRegForm({ ...regForm, icNumber: e.target.value })}
                        placeholder="cth: 750101-01-5555"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">No. pengenalan diri rasmi PGB</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-teal-400" />
                        <span>Email Rasmi PGB *</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="pgb@sekolah.edu.my"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Emel peribadi rasmi / urusan PGB</span>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-teal-400" />
                        <span>No. Telefon PGB *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="012-3456789"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">No. telefon bimbit / WhatsApp PGB</span>
                    </div>
                  </div>

                  {/* Upload Gambar PGB */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-teal-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-teal-300 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-teal-400" />
                          <span>Upload Gambar PGB (Foto Profil Rasmi / Korporat)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Maks. 3MB (JPG / PNG)</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Muat naik gambar potret atau foto korporat formal Pengetua / Guru Besar untuk paparan profil rasmi keahlian MPGBSIM.
                      </p>
                      <div className="flex items-center gap-4 pt-1">
                        <div className="w-16 h-20 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {regForm.pgbPhotoUrl ? (
                            <img
                              src={regForm.pgbPhotoUrl}
                              alt="Foto PGB"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-1">
                              <UserCheck className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                              <span className="text-[9px] text-slate-500 block leading-tight">Tiada Foto</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{regForm.pgbPhotoUrl ? 'Tukar Foto PGB' : 'Pilih Foto PGB'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePgbPhotoUpload}
                                className="hidden"
                              />
                            </label>
                            {regForm.pgbPhotoUrl && (
                              <button
                                type="button"
                                onClick={() => setRegForm((prev) => ({ ...prev, pgbPhotoUrl: '' }))}
                                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Padam Foto</span>
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Disyorkan foto berlatarbelakang kemas dan berpakaian rasmi/korporat.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Maklumat Sekolah & Institusi */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                      <School className="w-4 h-4 text-amber-400" />
                      <span>2. Maklumat Institusi Sekolah</span>
                    </h3>
                    <span className="text-[10px] text-teal-400/80 bg-teal-400/10 px-2.5 py-0.5 rounded-full border border-teal-400/20 font-medium">
                      Data Institusi
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Nama Penuh Institusi Sekolah *</label>
                    <input
                      type="text"
                      required
                      value={regForm.schoolName}
                      onChange={(e) => setRegForm({ ...regForm, schoolName: e.target.value })}
                      placeholder="cth: SMKA Maahad Muar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Kod Sekolah</label>
                      <input
                        type="text"
                        value={regForm.schoolCode || ''}
                        onChange={(e) => setRegForm({ ...regForm, schoolCode: e.target.value })}
                        placeholder="cth: JEA0012"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-amber-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Kategori Sekolah *</label>
                      <select
                        value={regForm.schoolType}
                        onChange={(e) => setRegForm({ ...regForm, schoolType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      >
                        {PORTAL_SCHOOL_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tahun Sekolah Menjadi Ahli MPGBSIM *</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1990"
                        max={new Date().getFullYear() + 2}
                        value={regForm.joinYear || ''}
                        onChange={(e) =>
                          setRegForm({
                            ...regForm,
                            joinYear: e.target.value ? Number(e.target.value) : ('' as any),
                            schoolJoinYear: e.target.value ? Number(e.target.value) : ('' as any),
                          })
                        }
                        placeholder={`cth: ${new Date().getFullYear()}`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Tahun institusi sekolah memohon / menyertai keahlian MPGBSIM</span>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Negeri *</label>
                      <select
                        value={regForm.state}
                        onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      >
                        {MALAYSIA_STATES.filter((s) => s !== 'Semua Negeri').map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Daerah *</label>
                      <input
                        type="text"
                        required
                        value={regForm.district || ''}
                        onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                        placeholder="cth: Muar / Petaling Perdana"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Alamat Lengkap Institusi</label>
                      <input
                        type="text"
                        value={regForm.address || ''}
                        onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                        placeholder="cth: Jalan Joned, 84000 Muar, Johor"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  {/* Email Rasmi Sekolah & No Telefon Sekolah */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>Email Rasmi Sekolah *</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regForm.schoolEmail || ''}
                        onChange={(e) => setRegForm({ ...regForm, schoolEmail: e.target.value })}
                        placeholder="cth: jea0012@moe.edu.my atau pejabat@sekolah.edu.my"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Emel rasmi pejabat pentadbiran sekolah</span>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>No Telefon Sekolah *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={regForm.schoolPhone || ''}
                        onChange={(e) => setRegForm({ ...regForm, schoolPhone: e.target.value })}
                        placeholder="cth: 06-9521234 atau 03-88881234"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">No. telefon pejabat / talian tetap sekolah</span>
                    </div>
                  </div>

                  {/* Jumlah Murid, Jumlah Guru & Laman Web */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                        <span>Jumlah Murid *</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={regForm.studentCount || ''}
                        onChange={(e) => setRegForm({ ...regForm, studentCount: parseInt(e.target.value) || 0 })}
                        placeholder="cth: 650"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Bilangan murid / pelajar terkini</span>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-teal-400" />
                        <span>Jumlah Guru *</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={regForm.teacherCount || ''}
                        onChange={(e) => setRegForm({ ...regForm, teacherCount: parseInt(e.target.value) || 0 })}
                        placeholder="cth: 55"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Bilangan tenaga pengajar / guru</span>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-teal-400" />
                        <span>Laman Web Rasmi</span>
                      </label>
                      <input
                        type="url"
                        value={regForm.website || ''}
                        onChange={(e) => setRegForm({ ...regForm, website: e.target.value })}
                        placeholder="https://sekolah.edu.my"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-amber-400 transition"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Portal / laman web sekolah (jika ada)</span>
                    </div>
                  </div>

                  {/* Upload Logo Sekolah & Sekeping Foto Institusi (Sekolah) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-800/80">
                    {/* Logo Upload */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                          <span>Logo / Lencana Sekolah</span>
                        </label>
                        <span className="text-[10px] text-slate-500">Maks. 2MB</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {regForm.logoUrl ? (
                            <img src={regForm.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                          ) : (
                            <Building2 className="w-6 h-6 text-slate-600" />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] cursor-pointer transition flex items-center gap-1.5">
                            <Upload className="w-3 h-3" />
                            <span>{regForm.logoUrl ? 'Tukar Logo' : 'Pilih Logo'}</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                          {regForm.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setRegForm((prev) => ({ ...prev, logoUrl: '' }))}
                              className="text-[10px] text-rose-400 hover:underline cursor-pointer block"
                            >
                              Padam Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sekeping Foto Institusi Upload */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-400/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-amber-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sekeping Foto Institusi (Sekolah) *</span>
                        </label>
                        <span className="text-[10px] text-slate-500">Maks. 5MB</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Muat naik sekeping foto mercu tanda institusi sekolah (bangunan pentadbiran atau pintu gerbang utama).
                      </p>
                      <div className="flex items-center gap-3 pt-0.5">
                        <div className="w-20 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {regForm.schoolPhotoUrl ? (
                            <img src={regForm.schoolPhotoUrl} alt="Foto Institusi" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 text-slate-600" />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] cursor-pointer transition flex items-center gap-1.5">
                            <Upload className="w-3 h-3" />
                            <span>{regForm.schoolPhotoUrl ? 'Tukar Foto Institusi' : 'Pilih Foto Institusi'}</span>
                            <input type="file" accept="image/*" onChange={handleSchoolPhotoUpload} className="hidden" />
                          </label>
                          {regForm.schoolPhotoUrl && (
                            <button
                              type="button"
                              onClick={() => setRegForm((prev) => ({ ...prev, schoolPhotoUrl: '' }))}
                              className="text-[10px] text-rose-400 hover:underline cursor-pointer block"
                            >
                              Padam Foto Institusi
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <SendIcon className="w-4 h-4" />
                  <span>{regSubmitting ? 'Menghantar Permohonan...' : 'Hantar Permohonan Keahlian MPGBSIM'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: SEMAK STATUS PERMOHONAN */}
        {activeTab === 'status' && (
          <div className="max-w-xl mx-auto bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-center mx-auto mb-2">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white">Semakan Status Pendaftaran Ahli</h2>
              <p className="text-xs text-slate-400">
                Masukkan No. Kod Sekolah, Nama Sekolah, atau Emel PGB untuk menyemak kelulusan keahlian.
              </p>
            </div>

            <form onSubmit={handleStatusCheck} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="cth: MJAC011, Sekolah Rendah Islam I Musleh, atau sekolahrendahimusleh@gmail.com"
                  value={statusQuery}
                  onChange={(e) => setStatusQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 placeholder:text-slate-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Semak Status Sekarang
              </button>
            </form>

            {statusResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  statusResult.found
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-100'
                    : 'bg-rose-950/60 border-rose-800 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {statusResult.found ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{statusResult.found ? 'Rekod Ditemui' : 'Tidak Ditemui'}</span>
                </div>
                <p className="leading-relaxed">{statusResult.message}</p>

                {statusResult.data && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1 text-slate-300 mt-2">
                    <div>
                      Institusi: <strong className="text-white">{statusResult.data.schoolName}</strong>
                    </div>
                    <div>
                      PGB: <strong className="text-white">{statusResult.data.principal}</strong>
                    </div>
                    <div>
                      Status: <span className="font-bold text-amber-400">{statusResult.data.status}</span>
                    </div>
                    {statusResult.data.school && (
                      <button
                        type="button"
                        onClick={() => loginAsMemberSchool(statusResult.data.school)}
                        className="mt-2 w-full py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>Terus Log Masuk Sebagai PGB</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Majlis Pengetua Guru Besar Sekolah Islam Malaysia (MPGBSIM).
          </span>
          <span className="text-[11px] text-slate-400">
            MPGBSIM Member Portal • Sistem Bersepadu Pengurusan Sekolah Islam
          </span>
        </div>
      </footer>
    </div>
  );
};

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
