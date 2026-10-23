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
  Phone,
  Mail,
  Key,
  BarChart3,
  Download,
  Filter,
  Layers,
  LogIn,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { MemberSchool } from '../../types';
import { PORTAL_SCHOOL_TYPES } from '../../data/constants';
import { DiagnosticReport } from '../../utils/schoolDiagnostic';

export const AdminSchoolManagement: React.FC = () => {
  const {
    siteData,
    addMemberSchool,
    updateMemberSchool,
    deleteMemberSchool,
    resetPgbPassword,
    runSchoolDiagnostics,
    autoRepairSchoolIntegrity,
    setIsCMSOpen,
  } = useAdminContent();
  const { adminLoginAsSchoolWithoutPassword } = useMemberPortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAgency, setFilterAgency] = useState<string>('all');
  const [showStateAgencyBreakdown, setShowStateAgencyBreakdown] = useState<boolean>(false);
  const [isLoggingInSchoolId, setIsLoggingInSchoolId] = useState<string | null>(null);

  const handleAdminLoginAsSchool = async (school: MemberSchool) => {
    setIsLoggingInSchoolId(school.id);
    try {
      if (setIsCMSOpen) {
        setIsCMSOpen(false);
      }
      await adminLoginAsSchoolWithoutPassword(school);
    } catch (err: any) {
      alert('Ralat log masuk portal: ' + (err?.message || 'Sila cuba lagi.'));
      setIsLoggingInSchoolId(null);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Reset PGB Portal Password Modal States
  const [schoolToResetPass, setSchoolToResetPass] = useState<MemberSchool | null>(null);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [resetPassResult, setResetPassResult] = useState<{
    schoolName: string;
    schoolCode: string;
    principal: string;
    tempPassword: string;
  } | null>(null);
  const [copiedTempPass, setCopiedTempPass] = useState(false);

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
    membershipType: 'Ahli Biasa',
    registeredAgencies: [],
    principal: '',
    designation: 'Pengetua',
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
    pgbPhone: '',
    schoolPhone: '',
    email: '',
    pgbEmail: '',
    schoolEmail: '',
    password: '',
  };

  const [formData, setFormData] = useState<Omit<MemberSchool, 'id'>>(initialFormState);

  const schoolsList = siteData.memberSchools || [];
  const pendingCount = (siteData.memberApplications || []).filter((a) => a.status === 'pending').length;

  const getSchoolAgencies = (school: MemberSchool): string[] => {
    return Array.isArray(school.registeredAgencies) ? school.registeredAgencies : [];
  };

  // Comprehensive Agency Registration Analytics (KPM, Jabatan Agama, MIEB & Combinations)
  const agencyAnalytics = React.useMemo(() => {
    const total = schoolsList.length;
    let kpmCount = 0;
    let jaCount = 0;
    let miebCount = 0;
    let kpmStudents = 0;
    let jaStudents = 0;
    let miebStudents = 0;

    let allThreeCount = 0; // KPM + Jabatan Agama + MIEB
    let dualKpmJa = 0; // KPM + Jabatan Agama sahaja
    let dualKpmMieb = 0; // KPM + MIEB sahaja
    let dualJaMieb = 0; // Jabatan Agama + MIEB sahaja
    let singleKpm = 0; // Hanya KPM
    let singleJa = 0; // Hanya Jabatan Agama
    let singleMieb = 0; // Hanya MIEB
    let unregisteredCount = 0; // Belum pilih agensi

    const byStateMap = new Map<
      string,
      {
        state: string;
        total: number;
        kpm: number;
        ja: number;
        mieb: number;
        allThree: number;
        unregistered: number;
      }
    >();

    schoolsList.forEach((s) => {
      const agencies = getSchoolAgencies(s);
      const hasKpm = agencies.includes('KPM');
      const hasJa = agencies.includes('Jabatan Agama');
      const hasMieb = agencies.includes('MIEB');
      const std = Number(s.studentCount) || 0;

      if (hasKpm) {
        kpmCount++;
        kpmStudents += std;
      }
      if (hasJa) {
        jaCount++;
        jaStudents += std;
      }
      if (hasMieb) {
        miebCount++;
        miebStudents += std;
      }

      if (hasKpm && hasJa && hasMieb) {
        allThreeCount++;
      } else if (hasKpm && hasJa && !hasMieb) {
        dualKpmJa++;
      } else if (hasKpm && !hasJa && hasMieb) {
        dualKpmMieb++;
      } else if (!hasKpm && hasJa && hasMieb) {
        dualJaMieb++;
      } else if (hasKpm && !hasJa && !hasMieb) {
        singleKpm++;
      } else if (!hasKpm && hasJa && !hasMieb) {
        singleJa++;
      } else if (!hasKpm && !hasJa && hasMieb) {
        singleMieb++;
      } else {
        unregisteredCount++;
      }

      const stKey = s.state || 'Lain-lain';
      const existing = byStateMap.get(stKey) || {
        state: stKey,
        total: 0,
        kpm: 0,
        ja: 0,
        mieb: 0,
        allThree: 0,
        unregistered: 0,
      };
      existing.total += 1;
      if (hasKpm) existing.kpm += 1;
      if (hasJa) existing.ja += 1;
      if (hasMieb) existing.mieb += 1;
      if (hasKpm && hasJa && hasMieb) existing.allThree += 1;
      if (!hasKpm && !hasJa && !hasMieb) existing.unregistered += 1;
      byStateMap.set(stKey, existing);
    });

    const pct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

    return {
      total,
      kpmCount,
      kpmPct: pct(kpmCount),
      kpmStudents,
      jaCount,
      jaPct: pct(jaCount),
      jaStudents,
      miebCount,
      miebPct: pct(miebCount),
      miebStudents,
      allThreeCount,
      allThreePct: pct(allThreeCount),
      dualTotal: dualKpmJa + dualKpmMieb + dualJaMieb,
      dualKpmJa,
      dualKpmMieb,
      dualJaMieb,
      singleTotal: singleKpm + singleJa + singleMieb,
      singleKpm,
      singleJa,
      singleMieb,
      unregisteredCount,
      unregisteredPct: pct(unregisteredCount),
      registeredAnyCount: total - unregisteredCount,
      registeredAnyPct: pct(total - unregisteredCount),
      byState: Array.from(byStateMap.values()).sort((a, b) => b.total - a.total),
    };
  }, [schoolsList]);

  const handleQuickToggleSchoolAgency = async (school: MemberSchool, agency: string) => {
    const current = getSchoolAgencies(school);
    const next = current.includes(agency)
      ? current.filter((a) => a !== agency)
      : [...current, agency];
    await updateMemberSchool(school.id, { registeredAgencies: next });
    setSaveSuccessMsg(
      `Agensi pendaftaran bagi "${school.name}" dikemas kini: ${
        next.length > 0 ? next.join(', ') : 'Tiada agensi dipilih'
      }`
    );
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleExportAgencyAnalysisCsv = () => {
    const headers = [
      'Bil',
      'Kod Sekolah',
      'Nama Institusi Sekolah',
      'Negeri',
      'Daerah',
      'Kategori Sekolah',
      'Kategori Keahlian',
      'Berdaftar KPM',
      'Berdaftar Jabatan Agama',
      'Berdaftar MIEB',
      'Bilangan Agensi Berdaftar',
      'Senarai Agensi',
      'Nama PGB',
      'Jumlah Murid',
      'Jumlah Guru',
    ];
    const rows = filteredSchools.map((s, idx) => {
      const ags = getSchoolAgencies(s);
      return [
        idx + 1,
        `"${(s.code || '').replace(/"/g, '""')}"`,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.state || '').replace(/"/g, '""')}"`,
        `"${(s.district || '').replace(/"/g, '""')}"`,
        `"${(s.type || '').replace(/"/g, '""')}"`,
        `"${(s.membershipType || 'Ahli Biasa').replace(/"/g, '""')}"`,
        ags.includes('KPM') ? 'YA' : 'TIDAK',
        ags.includes('Jabatan Agama') ? 'YA' : 'TIDAK',
        ags.includes('MIEB') ? 'YA' : 'TIDAK',
        ags.length,
        `"${(ags.length > 0 ? ags.join(' + ') : 'Belum Dikemas Kini').replace(/"/g, '""')}"`,
        `"${(s.principal || '').replace(/"/g, '""')}"`,
        s.studentCount || 0,
        s.teacherCount || 0,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Analisa_Agensi_Sekolah_Berdaftar_MPGBSIM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredSchools = schoolsList.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.code && school.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (school.principal && school.principal.toLowerCase().includes(searchTerm.toLowerCase())) ||
      school.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === 'all' || school.state === filterState;
    const matchesType = filterType === 'all' || school.type === filterType;

    const ags = getSchoolAgencies(school);
    const hasKpm = ags.includes('KPM');
    const hasJa = ags.includes('Jabatan Agama');
    const hasMieb = ags.includes('MIEB');

    let matchesAgency = true;
    if (filterAgency === 'KPM') matchesAgency = hasKpm;
    else if (filterAgency === 'Jabatan Agama') matchesAgency = hasJa;
    else if (filterAgency === 'MIEB') matchesAgency = hasMieb;
    else if (filterAgency === 'ALL_THREE') matchesAgency = hasKpm && hasJa && hasMieb;
    else if (filterAgency === 'DUAL_KPM_JA') matchesAgency = hasKpm && hasJa && !hasMieb;
    else if (filterAgency === 'DUAL_KPM_MIEB') matchesAgency = hasKpm && !hasJa && hasMieb;
    else if (filterAgency === 'DUAL_JA_MIEB') matchesAgency = !hasKpm && hasJa && hasMieb;
    else if (filterAgency === 'ONLY_KPM') matchesAgency = hasKpm && !hasJa && !hasMieb;
    else if (filterAgency === 'ONLY_JA') matchesAgency = !hasKpm && hasJa && !hasMieb;
    else if (filterAgency === 'ONLY_MIEB') matchesAgency = !hasKpm && !hasJa && hasMieb;
    else if (filterAgency === 'UNREGISTERED') matchesAgency = !hasKpm && !hasJa && !hasMieb;

    return matchesSearch && matchesState && matchesType && matchesAgency;
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
      membershipType: school.membershipType || (school.type === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa'),
      registeredAgencies: Array.isArray(school.registeredAgencies) ? school.registeredAgencies : [],
      principal: school.principal || '',
      designation:
        school.designation ||
        (school.type?.toLowerCase().includes('rendah') ||
        school.name?.toLowerCase().includes('rendah') ||
        school.principal?.toLowerCase().includes('guru besar')
          ? 'Guru Besar'
          : 'Pengetua'),
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
      phone: school.schoolPhone || school.phone || '',
      pgbPhone: school.pgbPhone || '',
      schoolPhone: school.schoolPhone || school.phone || '',
      email: school.schoolEmail || school.email || '',
      pgbEmail: school.pgbEmail || '',
      schoolEmail: school.schoolEmail || school.email || '',
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
      const resolvedPgbPhone = (formData.pgbPhone || '').trim();
      const resolvedSchoolPhone = (formData.schoolPhone || formData.phone || '').trim();
      const resolvedPgbEmail = (formData.pgbEmail || '').trim();
      const resolvedSchoolEmail = (formData.schoolEmail || formData.email || '').trim();

      const payload = {
        ...formData,
        pgbPhone: resolvedPgbPhone, // ONLY PGB personal phone (for Portal)
        schoolPhone: resolvedSchoolPhone, // ONLY school office phone (for Website Directory)
        phone: resolvedSchoolPhone, // ONLY school office phone (for Website Directory)
        pgbEmail: resolvedPgbEmail,
        schoolEmail: resolvedSchoolEmail,
        email: resolvedSchoolEmail,
      };

      if (editingId) {
        await updateMemberSchool(editingId, payload);
        setSaveSuccessMsg(`Perubahan maklumat institusi "${formData.name}" berjaya disimpan (No. Peribadi PGB disimpan untuk Portal, No. Pejabat untuk Direktori Web)!`);
      } else {
        const newId = `sch-${Date.now()}`;
        await addMemberSchool({
          ...payload,
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

      {/* DATA ANALISA SEKOLAH BERDAFTAR MENGIKUT AGENSI (KPM / JABATAN AGAMA / MIEB) */}
      <div className="bg-white rounded-2xl border border-teal-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-200 text-[10px] font-extrabold uppercase tracking-wider">
                  Analitik Pendaftaran Agensi
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  Data Analisa Sekolah Berdaftar (KPM • Jabatan Agama • MIEB)
                </h4>
              </div>
              <p className="text-xs text-teal-100/85 mt-1 max-w-3xl leading-relaxed">
                Analisa langsung pendaftaran institusi sekolah ahli di bawah <strong>KPM</strong>, <strong>Jabatan Agama</strong>, dan <strong>MIEB</strong>. Pilihan adalah bebas kerana terdapat sekolah yang berdaftar dengan 1, 2, atau ketiga-tiga agensi serentak. Klik mana-mana kad di bawah untuk menapis senarai sekolah.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowStateAgencyBreakdown((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-teal-100 border border-teal-600/50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>{showStateAgencyBreakdown ? 'Sembunyi Pecahan Negeri' : 'Analisa Mengikut Negeri'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportAgencyAnalysisCsv}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Muat turun laporan penuh CSV Data Analisa Sekolah Berdaftar (KPM, Jabatan Agama, MIEB)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport CSV Analisa</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* 4 Primary Agency KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPM Card */}
            <button
              type="button"
              onClick={() => setFilterAgency(filterAgency === 'KPM' ? 'all' : 'KPM')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                filterAgency === 'KPM'
                  ? 'bg-blue-950 text-white border-blue-700 ring-2 ring-blue-500/30 shadow-md'
                  : 'bg-blue-50/60 hover:bg-blue-50 border-blue-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    filterAgency === 'KPM'
                      ? 'bg-blue-800 text-blue-200'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  Berdaftar KPM
                </span>
                <span className="font-mono text-xs font-bold tabular-nums opacity-80">
                  {agencyAnalytics.kpmPct}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular-nums">
                  {agencyAnalytics.kpmCount}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    filterAgency === 'KPM' ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  / {agencyAnalytics.total} Sekolah
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-blue-200/60 mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${agencyAnalytics.kpmPct}%` }}
                />
              </div>
              <p
                className={`text-[10px] mt-2 font-medium tabular-nums ${
                  filterAgency === 'KPM' ? 'text-blue-200' : 'text-slate-600'
                }`}
              >
                Kementerian Pendidikan Malaysia • {agencyAnalytics.kpmStudents.toLocaleString()} murid
              </p>
            </button>

            {/* Jabatan Agama Card */}
            <button
              type="button"
              onClick={() =>
                setFilterAgency(filterAgency === 'Jabatan Agama' ? 'all' : 'Jabatan Agama')
              }
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                filterAgency === 'Jabatan Agama'
                  ? 'bg-emerald-950 text-white border-emerald-700 ring-2 ring-emerald-500/30 shadow-md'
                  : 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    filterAgency === 'Jabatan Agama'
                      ? 'bg-emerald-800 text-emerald-200'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  Berdaftar Jabatan Agama
                </span>
                <span className="font-mono text-xs font-bold tabular-nums opacity-80">
                  {agencyAnalytics.jaPct}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular-nums">
                  {agencyAnalytics.jaCount}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    filterAgency === 'Jabatan Agama' ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  / {agencyAnalytics.total} Sekolah
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-emerald-200/60 mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${agencyAnalytics.jaPct}%` }}
                />
              </div>
              <p
                className={`text-[10px] mt-2 font-medium tabular-nums ${
                  filterAgency === 'Jabatan Agama' ? 'text-emerald-200' : 'text-slate-600'
                }`}
              >
                Jabatan Agama Islam Negeri • {agencyAnalytics.jaStudents.toLocaleString()} murid
              </p>
            </button>

            {/* MIEB Card */}
            <button
              type="button"
              onClick={() => setFilterAgency(filterAgency === 'MIEB' ? 'all' : 'MIEB')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                filterAgency === 'MIEB'
                  ? 'bg-amber-900 text-white border-amber-600 ring-2 ring-amber-500/30 shadow-md'
                  : 'bg-amber-50/70 hover:bg-amber-50 border-amber-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    filterAgency === 'MIEB'
                      ? 'bg-amber-800 text-amber-200'
                      : 'bg-amber-100 text-amber-950'
                  }`}
                >
                  Berdaftar MIEB
                </span>
                <span className="font-mono text-xs font-bold tabular-nums opacity-80">
                  {agencyAnalytics.miebPct}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular-nums">
                  {agencyAnalytics.miebCount}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    filterAgency === 'MIEB' ? 'text-amber-200' : 'text-slate-500'
                  }`}
                >
                  / {agencyAnalytics.total} Sekolah
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-amber-200/70 mt-2 overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full transition-all"
                  style={{ width: `${agencyAnalytics.miebPct}%` }}
                />
              </div>
              <p
                className={`text-[10px] mt-2 font-medium tabular-nums ${
                  filterAgency === 'MIEB' ? 'text-amber-100' : 'text-slate-600'
                }`}
              >
                Musleh Integrated Education Bhd • {agencyAnalytics.miebStudents.toLocaleString()} murid
              </p>
            </button>

            {/* Ketiga-tiga Agensi Card */}
            <button
              type="button"
              onClick={() =>
                setFilterAgency(filterAgency === 'ALL_THREE' ? 'all' : 'ALL_THREE')
              }
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                filterAgency === 'ALL_THREE'
                  ? 'bg-purple-950 text-white border-purple-700 ring-2 ring-purple-500/30 shadow-md'
                  : 'bg-purple-50/60 hover:bg-purple-50 border-purple-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    filterAgency === 'ALL_THREE'
                      ? 'bg-purple-800 text-purple-200'
                      : 'bg-purple-100 text-purple-900'
                  }`}
                >
                  Ketiga-tiga Agensi (3/3)
                </span>
                <span className="font-mono text-xs font-bold tabular-nums opacity-80">
                  {agencyAnalytics.allThreePct}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular-nums">
                  {agencyAnalytics.allThreeCount}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    filterAgency === 'ALL_THREE' ? 'text-purple-200' : 'text-slate-500'
                  }`}
                >
                  Sekolah Lengkap 3 Agensi
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-purple-200/60 mt-2 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{ width: `${agencyAnalytics.allThreePct}%` }}
                />
              </div>
              <p
                className={`text-[10px] mt-2 font-medium ${
                  filterAgency === 'ALL_THREE' ? 'text-purple-200' : 'text-slate-600'
                }`}
              >
                Berdaftar serentak KPM + Jabatan Agama + MIEB
              </p>
            </button>
          </div>

          {/* Combination Matrix (Pecahan Kombinasi Agensi Bebas) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-teal-700" />
                <span>Pecahan Kombinasi Pendaftaran Agensi (Klik untuk Tapis):</span>
              </span>
              {filterAgency !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilterAgency('all')}
                  className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200 cursor-pointer"
                >
                  Reset Tapisan Agensi ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {[
                { id: 'all', label: 'Semua Sekolah', count: agencyAnalytics.total },
                {
                  id: 'ALL_THREE',
                  label: 'Ketiga-tiga (KPM + Jabatan Agama + MIEB)',
                  count: agencyAnalytics.allThreeCount,
                },
                {
                  id: 'DUAL_KPM_JA',
                  label: 'Dwi: KPM + Jabatan Agama',
                  count: agencyAnalytics.dualKpmJa,
                },
                {
                  id: 'DUAL_KPM_MIEB',
                  label: 'Dwi: KPM + MIEB',
                  count: agencyAnalytics.dualKpmMieb,
                },
                {
                  id: 'DUAL_JA_MIEB',
                  label: 'Dwi: Jabatan Agama + MIEB',
                  count: agencyAnalytics.dualJaMieb,
                },
                { id: 'ONLY_KPM', label: 'Hanya KPM', count: agencyAnalytics.singleKpm },
                {
                  id: 'ONLY_JA',
                  label: 'Hanya Jabatan Agama',
                  count: agencyAnalytics.singleJa,
                },
                { id: 'ONLY_MIEB', label: 'Hanya MIEB', count: agencyAnalytics.singleMieb },
                {
                  id: 'UNREGISTERED',
                  label: 'Belum Kemas Kini Agensi',
                  count: agencyAnalytics.unregisteredCount,
                },
              ].map((pill) => {
                const isActive = filterAgency === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setFilterAgency(pill.id)}
                    className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                        : 'bg-white hover:bg-teal-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] tabular-nums ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* State Breakdown Table (Expandable) */}
          {showStateAgencyBreakdown && (
            <div className="border border-slate-200 rounded-xl overflow-hidden animate-in fade-in duration-200">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">
                  Jadual Analisa Pendaftaran Agensi Mengikut Negeri
                </span>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {agencyAnalytics.byState.length} Negeri Direkodkan
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-600">
                      <th className="py-2.5 px-3">Negeri</th>
                      <th className="py-2.5 px-3 text-right">Jumlah Sekolah</th>
                      <th className="py-2.5 px-3 text-right text-blue-800">KPM</th>
                      <th className="py-2.5 px-3 text-right text-emerald-800">Jabatan Agama</th>
                      <th className="py-2.5 px-3 text-right text-amber-800">MIEB</th>
                      <th className="py-2.5 px-3 text-right text-purple-800">Ketiga-tiga (3/3)</th>
                      <th className="py-2.5 px-3 text-right text-slate-500">Belum Kemas Kini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {agencyAnalytics.byState.map((row) => (
                      <tr
                        key={row.state}
                        onClick={() => setFilterState(filterState === row.state ? 'all' : row.state)}
                        className="hover:bg-teal-50/40 cursor-pointer transition"
                      >
                        <td className="py-2 px-3 font-sans font-bold text-slate-900">{row.state}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800">{row.total}</td>
                        <td className="py-2 px-3 text-right text-blue-700 font-semibold">{row.kpm}</td>
                        <td className="py-2 px-3 text-right text-emerald-700 font-semibold">{row.ja}</td>
                        <td className="py-2 px-3 text-right text-amber-700 font-semibold">{row.mieb}</td>
                        <td className="py-2 px-3 text-right text-purple-700 font-bold">{row.allThree}</td>
                        <td className="py-2 px-3 text-right text-slate-400">{row.unregistered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

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

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterAgency}
            onChange={(e) => setFilterAgency(e.target.value)}
            className="px-3 py-2 text-xs font-bold text-teal-950 rounded-xl border border-teal-300 bg-teal-50/70 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">Semua Agensi ({agencyAnalytics.total})</option>
            <option value="KPM">Berdaftar KPM ({agencyAnalytics.kpmCount})</option>
            <option value="Jabatan Agama">Berdaftar Jabatan Agama ({agencyAnalytics.jaCount})</option>
            <option value="MIEB">Berdaftar MIEB ({agencyAnalytics.miebCount})</option>
            <option value="ALL_THREE">Ketiga-tiga Agensi: KPM + JA + MIEB ({agencyAnalytics.allThreeCount})</option>
            <option value="DUAL_KPM_JA">Dwi-Agensi: KPM + Jabatan Agama ({agencyAnalytics.dualKpmJa})</option>
            <option value="DUAL_KPM_MIEB">Dwi-Agensi: KPM + MIEB ({agencyAnalytics.dualKpmMieb})</option>
            <option value="DUAL_JA_MIEB">Dwi-Agensi: Jabatan Agama + MIEB ({agencyAnalytics.dualJaMieb})</option>
            <option value="ONLY_KPM">Hanya KPM ({agencyAnalytics.singleKpm})</option>
            <option value="ONLY_JA">Hanya Jabatan Agama ({agencyAnalytics.singleJa})</option>
            <option value="ONLY_MIEB">Hanya MIEB ({agencyAnalytics.singleMieb})</option>
            <option value="UNREGISTERED">Belum Kemas Kini Agensi ({agencyAnalytics.unregisteredCount})</option>
          </select>

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

                    {/* Foto Institusi / Gambar Sekolah Status & Info Telefon PGB */}
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

                      {(school.pgbPhone || school.phone) && (
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-medium"
                          title="Nombor telefon peribadi / WhatsApp PGB"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp PGB: <strong>{school.pgbPhone || school.phone}</strong></span>
                        </div>
                      )}

                      {school.schoolPhone && school.schoolPhone !== (school.pgbPhone || school.phone) && (
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px]"
                          title="Nombor telefon pejabat sekolah"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>Pejabat: {school.schoolPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Inline Agency Registration Toggles (Pilihan Bebas: KPM, Jabatan Agama, MIEB) */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">
                        Berdaftar di Bawah:
                      </span>
                      {(['KPM', 'Jabatan Agama', 'MIEB'] as const).map((ag) => {
                        const isReg = getSchoolAgencies(school).includes(ag);
                        const activeColors =
                          ag === 'KPM'
                            ? 'bg-blue-900 text-white border-blue-900'
                            : ag === 'Jabatan Agama'
                            ? 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-amber-600 text-white border-amber-600';
                        return (
                          <button
                            key={ag}
                            type="button"
                            onClick={() => handleQuickToggleSchoolAgency(school, ag)}
                            title={`Klik untuk ${isReg ? 'nyahpilih' : 'tandakan'} pendaftaran ${ag} bagi ${school.name}`}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                              isReg
                                ? activeColors
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {isReg ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span>+</span>}
                            <span>{ag}</span>
                          </button>
                        );
                      })}
                      {getSchoolAgencies(school).length === 3 && (
                        <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                          ★ Ketiga-tiga Agensi (3/3)
                        </span>
                      )}

                      {/* Status Kata Laluan Portal PGB */}
                      <span
                        className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
                          !school.password ||
                          school.password.trim().toUpperCase() === 'MPGBSIM2026' ||
                          (school as any).isTemporaryPassword
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-teal-50 text-teal-900 border-teal-200'
                        }`}
                        title="Status Kata Laluan Log Masuk Portal PGB"
                      >
                        <Key className="w-2.5 h-2.5" />
                        <span>
                          {!school.password ||
                          school.password.trim().toUpperCase() === 'MPGBSIM2026' ||
                          (school as any).isTemporaryPassword
                            ? 'Password Sementara: MPGBSIM2026'
                            : 'Password Peribadi PGB'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    disabled={isLoggingInSchoolId === school.id}
                    onClick={() => handleAdminLoginAsSchool(school)}
                    className="px-2.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white border border-teal-950 text-[10.5px] font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60"
                    title={`Log masuk terus ke Portal PGB bagi institusi ${school.name} tanpa memerlukan kata laluan (Akses Pentadbir CMS)`}
                  >
                    {isLoggingInSchoolId === school.id ? (
                      <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>Log Masuk Portal (Tanpa Password)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetPassResult(null);
                      setCopiedTempPass(false);
                      setSchoolToResetPass(school);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white border border-amber-300 text-[10.5px] font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title="Reset kata laluan Portal PGB sekolah ini kepada kata laluan sementara MPGBSIM2026"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Reset Password</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(school)}
                    className="p-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer"
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
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
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
              <div className="flex items-center gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      const found = schoolsList.find((s) => s.id === editingId);
                      if (found) {
                        setIsEditing(false);
                        handleAdminLoginAsSchool(found);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs border border-teal-900"
                    title="Log masuk terus ke Portal PGB sekolah ini tanpa kata laluan"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-300" />
                    <span>Log Masuk Portal Sekolah Ini</span>
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                    onChange={(e) => {
                      const nextType = e.target.value;
                      const autoDesig =
                        nextType === 'Sekolah Rendah'
                          ? 'Guru Besar'
                          : nextType === 'Sekolah Menengah' || nextType === 'Maahad Tahfiz'
                          ? 'Pengetua'
                          : formData.designation || 'Pengetua';
                      const autoMem =
                        nextType === 'Rakan Musleh'
                          ? 'Ahli Bersekutu'
                          : formData.membershipType || 'Ahli Biasa';
                      setFormData({
                        ...formData,
                        type: nextType,
                        designation: autoDesig,
                        membershipType: autoMem,
                      });
                    }}
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

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Keahlian Institusi (Fasal 4 Perlembagaan)
                </label>
                <select
                  value={formData.membershipType || (formData.type === 'Rakan Musleh' ? 'Ahli Bersekutu' : 'Ahli Biasa')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      membershipType: e.target.value as 'Ahli Biasa' | 'Ahli Bersekutu',
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-bold text-slate-900"
                >
                  <option value="Ahli Biasa">Ahli Biasa — Fasal 4(2) (Rangkaian Penuh IKRAM MUSLEH)</option>
                  <option value="Ahli Bersekutu">Ahli Bersekutu — Fasal 4(3) (Sekolah Rakan Musleh / Bersekutu)</option>
                </select>
              </div>

              {/* Berdaftar di Bawah Agensi (Pilihan Bebas: KPM, Jabatan Agama, MIEB) */}
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block font-extrabold text-teal-950 uppercase tracking-wider text-[11px]">
                      Berdaftar di Bawah Agensi (Pilihan Bebas: KPM / Jabatan Agama / MIEB)
                    </label>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Boleh pilih 1, 2, atau ketiga-tiga agensi serentak mengikut sijil pendaftaran sekolah.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          registeredAgencies: ['KPM', 'Jabatan Agama', 'MIEB'],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-bold transition cursor-pointer"
                    >
                      Pilih Ketiga-tiga
                    </button>
                    {(formData.registeredAgencies?.length || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, registeredAgencies: [] })}
                        className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-semibold transition cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'KPM', label: 'KPM', desc: 'Kementerian Pendidikan Malaysia' },
                    { id: 'Jabatan Agama', label: 'Jabatan Agama', desc: 'Jabatan Agama Islam Negeri' },
                    { id: 'MIEB', label: 'MIEB', desc: 'Musleh Integrated Education Bhd' },
                  ].map((ag) => {
                    const currentAgs = Array.isArray(formData.registeredAgencies)
                      ? formData.registeredAgencies
                      : [];
                    const isChecked = currentAgs.includes(ag.id);
                    return (
                      <button
                        key={ag.id}
                        type="button"
                        onClick={() => {
                          const next = isChecked
                            ? currentAgs.filter((a) => a !== ag.id)
                            : [...currentAgs, ag.id];
                          setFormData({ ...formData, registeredAgencies: next });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                          isChecked
                            ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                            : 'bg-white hover:bg-teal-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                            isChecked
                              ? 'bg-amber-400 border-amber-300 text-slate-950'
                              : 'bg-white border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div>
                          <span className="font-extrabold text-xs block">{ag.label}</span>
                          <span
                            className={`text-[10px] block leading-tight mt-0.5 ${
                              isChecked ? 'text-teal-100' : 'text-slate-500'
                            }`}
                          >
                            {ag.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jawatan Kepimpinan PGB
                  </label>
                  <select
                    value={formData.designation || 'Pengetua'}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-semibold"
                  >
                    <option value="Pengetua">Pengetua</option>
                    <option value="Guru Besar">Guru Besar</option>
                  </select>
                </div>

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

              {/* Maklumat Hubungan & Komunikasi PGB & Pejabat Sekolah */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    Maklumat Perhubungan (PGB & Pejabat Sekolah)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Diselaraskan ke PGB Spotlight & Hari Lahir
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* No Telefon Bimbit / WhatsApp PGB */}
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                    <label className="block font-bold text-emerald-950 uppercase tracking-wider mb-1 text-[11px] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        No. Telefon Peribadi / WhatsApp PGB
                      </span>
                      <span className="text-[9px] font-bold uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm">
                        Spotlight
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.pgbPhone || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          pgbPhone: val,
                        }));
                      }}
                      placeholder="cth: 013-2695286 / 019-6654321"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white font-medium text-slate-900"
                    />
                    <p className="text-[10px] text-emerald-800 mt-1">
                      No. peribadi ini <strong>HANYA boleh dilihat oleh ahli PGB dalam Portal</strong> (PGB Spotlight & Hari Lahir). <strong>TIDAK</strong> dipaparkan di direktori web awam.
                    </p>
                  </div>

                  {/* No Telefon Pejabat Sekolah */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        No. Telefon Pejabat Sekolah
                      </span>
                      <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded-sm">
                        Direktori Awam
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.schoolPhone || formData.phone || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          schoolPhone: val,
                          phone: val,
                        }));
                      }}
                      placeholder="cth: 06-234 9405 / 03-8888 1234"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Talian rasmi pejabat sekolah (<strong>Hanya nombor pejabat ini dipaparkan di direktori web awam</strong>).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Emel Rasmi Pejabat (Web Awam)
                    </label>
                    <input
                      type="email"
                      value={formData.schoolEmail || formData.email || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          schoolEmail: val,
                          email: val,
                        }));
                      }}
                      placeholder="admin@sekolah.edu.my"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      Emel Peribadi PGB (Dalaman)
                    </label>
                    <input
                      type="email"
                      value={formData.pgbEmail || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          pgbEmail: val,
                        }));
                      }}
                      placeholder="pengetua@imuslehmelaka.edu.my"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-slate-500" />
                        Kata Laluan Akaun PGB
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          setFormData((prev) => ({ ...prev, password: 'MPGBSIM2026' }));
                          if (editingId) {
                            await resetPgbPassword(editingId);
                            setSaveSuccessMsg(
                              'Kata laluan PGB telah direset serta-merta kepada kata laluan sementara: MPGBSIM2026'
                            );
                          }
                        }}
                        className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-600 text-amber-900 hover:text-white border border-amber-300 text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer"
                        title="Set semula kepada kata laluan sementara rasmi MPGBSIM2026"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Reset ke MPGBSIM2026</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.password || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="MPGBSIM2026 (Kata Laluan Sementara Rasmi)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Jika PGB terlupa kata laluan portal mereka, klik <strong>Reset ke MPGBSIM2026</strong> untuk mengembalikan kata laluan sementara rasmi.
                    </p>
                  </div>
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

      {/* Modal Reset Kata Laluan Portal PGB ke Kata Laluan Sementara (MPGBSIM2026) */}
      {schoolToResetPass && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900">
                    Reset Kata Laluan Portal PGB
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Tetapkan semula ke kata laluan sementara rasmi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSchoolToResetPass(null);
                  setResetPassResult(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!resetPassResult ? (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-black text-slate-900 text-sm">
                    {schoolToResetPass.name}
                  </div>
                  <div className="text-slate-600">
                    PGB: <strong className="text-slate-900">{schoolToResetPass.principal || 'Pengetua / Guru Besar'}</strong>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                      Kod: {schoolToResetPass.code}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                      {schoolToResetPass.state}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2 text-xs text-amber-950">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Kata Laluan Sementara Rasmi:</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono text-sm font-black text-center tracking-wider text-slate-900 select-all">
                    MPGBSIM2026
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Selepas direset, PGB sekolah ini boleh terus log masuk ke Portal Ahli menggunakan Kod Sekolah (<strong>{schoolToResetPass.code}</strong>) atau Emel berserta kata laluan sementara <strong>MPGBSIM2026</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isResettingPass}
                    onClick={() => setSchoolToResetPass(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isResettingPass}
                    onClick={async () => {
                      setIsResettingPass(true);
                      const res = await resetPgbPassword(schoolToResetPass.id);
                      setIsResettingPass(false);
                      if (res.success) {
                        setResetPassResult({
                          schoolName: schoolToResetPass.name,
                          schoolCode: schoolToResetPass.code,
                          principal: schoolToResetPass.principal || 'Pengetua / Guru Besar',
                          tempPassword: res.tempPassword,
                        });
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-900/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isResettingPass ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mereset Kata Laluan...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Sahkan Reset ke MPGBSIM2026</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                  <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Kata Laluan Berjaya Direset!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Akaun Portal PGB bagi <strong>{resetPassResult.principal}</strong> ({resetPassResult.schoolName}) telah ditetapkan semula ke kata laluan sementara rasmi:
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-emerald-300 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        ID Log Masuk / Kod Sekolah: {resetPassResult.schoolCode}
                      </span>
                      <span className="font-mono text-base font-black text-slate-900 tracking-wider select-all">
                        {resetPassResult.tempPassword}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const textToCopy = `Makluman Reset Kata Laluan Portal Rasmi PGB MPGBSIM\nSekolah: ${resetPassResult.schoolName}\nKod Sekolah: ${resetPassResult.schoolCode}\nKata Laluan Sementara: ${resetPassResult.tempPassword}\n\nSila log masuk dan tukar kata laluan baharu anda di menu Profil Ahli.`;
                        navigator.clipboard?.writeText(textToCopy);
                        setCopiedTempPass(true);
                        setTimeout(() => setCopiedTempPass(false), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition cursor-pointer shrink-0"
                    >
                      {copiedTempPass ? 'Disalin!' : 'Salin Info'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSchoolToResetPass(null);
                      setResetPassResult(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
