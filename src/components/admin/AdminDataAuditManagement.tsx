import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Wrench,
  Download,
  School,
  UserCheck,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  HardDrive,
  FileSpreadsheet
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool, MemberApplication } from '../../types';
import { db, collection, getDocs, doc, setDoc } from '../../firebase';
import { isFirestoreQuotaExceeded } from '../../firebase';

export interface AuditAnomaly {
  id: string;
  type: 'missing_school' | 'duplicate_code' | 'missing_field' | 'count_discrepancy' | 'orphaned_record';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedItem?: string;
  actionLabel?: string;
  canAutoFix: boolean;
  fixData?: any;
}

export interface SchoolAuditRow {
  id: string;
  name: string;
  code: string;
  type: string;
  principal: string;
  state: string;
  district: string;
  studentCount: number;
  teacherCount: number;
  inFirestore: boolean;
  inCache: boolean;
  matchedApplication?: MemberApplication;
  missingFields: string[];
  isCodeDuplicate: boolean;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export const AdminDataAuditManagement: React.FC = () => {
  const {
    siteData,
    addMemberSchool,
    autoRepairSchoolIntegrity,
    runSchoolDiagnostics,
    syncAllToFirestore,
    isReadOnlyMode,
    syncStatus
  } = useAdminContent();

  const [isLoading, setIsLoading] = useState(false);
  const [firestoreSchools, setFirestoreSchools] = useState<MemberSchool[]>([]);
  const [firestoreApps, setFirestoreApps] = useState<MemberApplication[]>([]);
  const [lastAuditTime, setLastAuditTime] = useState<string>('');
  const [filterHealth, setFilterHealth] = useState<'all' | 'healthy' | 'issue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4500);
  };

  // 1. Fetch live records from Firestore for comparison
  const fetchLiveAuditData = async () => {
    setIsLoading(true);
    try {
      if (isFirestoreQuotaExceeded()) {
        // Fallback safely to cached data if quota reached
        setFirestoreSchools(siteData.memberSchools || []);
        setFirestoreApps(siteData.memberApplications || []);
        setLastAuditTime(new Date().toLocaleTimeString('ms-MY'));
        setIsLoading(false);
        return;
      }

      const [schoolsSnap, appsSnap] = await Promise.all([
        getDocs(collection(db, 'schools')).catch(() => null),
        getDocs(collection(db, 'memberApplications')).catch(() => null),
      ]);

      if (schoolsSnap && !schoolsSnap.empty) {
        const liveSchools: MemberSchool[] = [];
        schoolsSnap.forEach((d) => {
          liveSchools.push({ id: d.id, ...d.data() } as MemberSchool);
        });
        setFirestoreSchools(liveSchools);
      } else {
        setFirestoreSchools(siteData.memberSchools || []);
      }

      if (appsSnap && !appsSnap.empty) {
        const liveApps: MemberApplication[] = [];
        appsSnap.forEach((d) => {
          liveApps.push({ id: d.id, ...d.data() } as MemberApplication);
        });
        setFirestoreApps(liveApps);
      } else {
        setFirestoreApps(siteData.memberApplications || []);
      }

      setLastAuditTime(new Date().toLocaleTimeString('ms-MY'));
    } catch (err) {
      console.warn('Live audit fetch fallback:', err);
      setFirestoreSchools(siteData.memberSchools || []);
      setFirestoreApps(siteData.memberApplications || []);
      setLastAuditTime(new Date().toLocaleTimeString('ms-MY'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAuditData();
  }, []);

  // 2. Comprehensive Audit Evaluation
  const auditAnalysis = useMemo(() => {
    const cachedSchools = siteData.memberSchools || [];
    const applications = (firestoreApps.length > 0 ? firestoreApps : siteData.memberApplications) || [];
    const approvedApps = applications.filter((a) => a.status === 'approved');
    const liveSchoolsList = firestoreSchools.length > 0 ? firestoreSchools : cachedSchools;

    const anomalies: AuditAnomaly[] = [];

    // Check A: Record Count Discrepancy
    if (liveSchoolsList.length !== cachedSchools.length) {
      anomalies.push({
        id: 'count-discrepancy',
        type: 'count_discrepancy',
        severity: 'warning',
        title: 'Percanggahan Kiraan Rekod Firestore & Cache',
        description: `Pangkalan data Firestore mempunyai ${liveSchoolsList.length} sekolah, manakala memori cache laman web mempunyai ${cachedSchools.length} sekolah.`,
        canAutoFix: true,
        actionLabel: 'Segerakkan Cache & Pangkalan Data',
      });
    }

    // Check B: Missing Schools from Approved Applications (Crucial check that caught Al-Azhar issue)
    approvedApps.forEach((app) => {
      const appSchoolName = (app.schoolName || '').toLowerCase().trim();
      const appSchoolCode = (app.schoolCode || '').toLowerCase().trim();
      const appApplicant = (app.fullName || '').toLowerCase().trim();

      const existsInSchools = liveSchoolsList.some((s) => {
        const sName = (s.name || '').toLowerCase().trim();
        const sCode = (s.code || '').toLowerCase().trim();
        const sPrincipal = (s.principal || '').toLowerCase().trim();

        const matchCode = appSchoolCode && sCode && (sCode === appSchoolCode || sCode.includes(appSchoolCode));
        const matchName = sName && appSchoolName && (sName === appSchoolName || sName.includes(appSchoolName) || appSchoolName.includes(sName));
        const matchPrincipal = sPrincipal && appApplicant && (sPrincipal.includes(appApplicant) || appApplicant.includes(sPrincipal));

        return matchCode || (matchName && (s.type === app.schoolType || matchPrincipal));
      });

      if (!existsInSchools) {
        anomalies.push({
          id: `missing-app-${app.id}`,
          type: 'missing_school',
          severity: 'critical',
          title: `Sekolah Sah Terlepas Daripada Direktori: ${app.schoolName}`,
          description: `Permohonan keahlian (${app.id}) telah diluluskan bagi "${app.schoolName}" (${app.fullName}), namun rekod sekolah tidak ditemui dalam koleksi pangkalan data 'schools'.`,
          affectedItem: app.schoolName,
          canAutoFix: true,
          actionLabel: 'Daftar Semula Sekolah Ini ke Firestore',
          fixData: app,
        });
      }
    });

    // Check C: Duplicate School Codes (The collision issue)
    const codeCounts = new Map<string, { count: number; schools: MemberSchool[] }>();
    liveSchoolsList.forEach((s) => {
      const codeKey = (s.code || '').trim().toUpperCase();
      if (!codeKey) return;
      const cur = codeCounts.get(codeKey) || { count: 0, schools: [] };
      cur.count += 1;
      cur.schools.push(s);
      codeCounts.set(codeKey, cur);
    });

    codeCounts.forEach((data, code) => {
      if (data.count > 1) {
        const schoolNames = data.schools.map((s) => s.name).join(', ');
        anomalies.push({
          id: `dup-code-${code}`,
          type: 'duplicate_code',
          severity: 'critical',
          title: `Pertindihan Kod Sekolah: ${code}`,
          description: `Kod ${code} digunakan serentak oleh ${data.count} institusi berbeza (${schoolNames}). Ini boleh mengakibatkan kehilangan data semasa penggabungan cache!`,
          affectedItem: code,
          canAutoFix: true,
          actionLabel: 'Asingkan & Baiki Kod Sekolah',
        });
      }
    });

    // Check D: Incomplete Data Fields
    liveSchoolsList.forEach((s) => {
      const missing: string[] = [];
      if (!s.name || s.name.trim() === '') missing.push('Nama Sekolah');
      if (!s.code || s.code.trim() === '') missing.push('Kod Sekolah');
      if (!s.principal || s.principal.trim() === '') missing.push('Nama Pengetua / Guru Besar');
      if (!s.state || s.state.trim() === '') missing.push('Negeri');
      if (s.studentCount === undefined || s.studentCount === null || s.studentCount === 0) missing.push('Bilangan Murid');
      if (s.teacherCount === undefined || s.teacherCount === null || s.teacherCount === 0) missing.push('Bilangan Guru');

      if (missing.length > 0) {
        anomalies.push({
          id: `missing-field-${s.id}`,
          type: 'missing_field',
          severity: 'warning',
          title: `Medan Tidak Lengkap: ${s.name || 'Sekolah Tanpa Nama'}`,
          description: `Institusi (${s.code || s.id}) kehilangan medan penting: ${missing.join(', ')}.`,
          affectedItem: s.name,
          canAutoFix: false,
        });
      }
    });

    // Build School Matrix Rows
    const rows: SchoolAuditRow[] = liveSchoolsList.map((sch) => {
      const sCode = (sch.code || '').trim().toUpperCase();
      const isDup = sCode ? (codeCounts.get(sCode)?.count || 0) > 1 : false;

      const missing: string[] = [];
      if (!sch.name) missing.push('Nama');
      if (!sch.code) missing.push('Kod');
      if (!sch.principal) missing.push('PGB');
      if (!sch.state) missing.push('Negeri');
      if (!sch.studentCount) missing.push('Murid');
      if (!sch.teacherCount) missing.push('Guru');

      const matchedApp = approvedApps.find((a) => {
        const appCode = (a.schoolCode || '').toUpperCase().trim();
        const appName = (a.schoolName || '').toLowerCase().trim();
        return (
          (appCode && sCode && sCode.includes(appCode)) ||
          (appName && sch.name.toLowerCase().includes(appName))
        );
      });

      let health: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (isDup) health = 'critical';
      else if (missing.length > 0) health = 'warning';

      return {
        id: sch.id,
        name: sch.name,
        code: sch.code,
        type: sch.type,
        principal: sch.principal,
        state: sch.state,
        district: sch.district || '-',
        studentCount: sch.studentCount || 0,
        teacherCount: sch.teacherCount || 0,
        inFirestore: firestoreSchools.some((fs) => fs.id === sch.id),
        inCache: cachedSchools.some((cs) => cs.id === sch.id),
        matchedApplication: matchedApp,
        missingFields: missing,
        isCodeDuplicate: isDup,
        healthStatus: health,
      };
    });

    const healthyCount = rows.filter((r) => r.healthStatus === 'healthy').length;
    const criticalCount = anomalies.filter((a) => a.severity === 'critical').length;
    const warningCount = anomalies.filter((a) => a.severity === 'warning').length;

    const integrityScore =
      rows.length > 0
        ? Math.max(0, Math.round(((rows.length - criticalCount * 1.5 - warningCount * 0.5) / rows.length) * 100))
        : 100;

    return {
      totalFirestore: liveSchoolsList.length,
      totalApprovedApps: approvedApps.length,
      totalCached: cachedSchools.length,
      integrityScore: Math.min(100, integrityScore),
      healthyCount,
      criticalCount,
      warningCount,
      anomalies,
      rows,
    };
  }, [firestoreSchools, firestoreApps, siteData.memberSchools, siteData.memberApplications]);

  // 3. Actions: Auto-Fixing Anomalies
  const handleFixAnomaly = async (anomaly: AuditAnomaly) => {
    setIsFixing(anomaly.id);
    try {
      if (anomaly.type === 'missing_school' && anomaly.fixData) {
        const app: MemberApplication = anomaly.fixData;
        const newSchool: MemberSchool = {
          id: `school-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: app.schoolName,
          code: app.schoolCode || `SCH-${Date.now().toString().slice(-4)}`,
          type: app.schoolType || 'Sekolah Rendah',
          state: app.state,
          district: app.district,
          principal: `${app.fullName} (${app.designation})`,
          designation: app.designation,
          icNumber: app.icNumber || '',
          principalPhotoUrl: app.pgbPhotoUrl || '',
          studentCount: Number(app.studentCount) || 0,
          teacherCount: Number(app.teacherCount) || 0,
          joinYear: app.joinYear || app.schoolJoinYear || new Date().getFullYear(),
          serviceStartYear: app.serviceStartYear,
          pgbStartYear: app.serviceStartYear,
          website: app.website || '',
          logoUrl: app.logoUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
          schoolPhotoUrl: app.schoolPhotoUrl || '',
          description: app.schoolDescription || `Sekolah Ahli Berdaftar MPGBSIM di bawah kepimpinan ${app.fullName} (${app.designation}).`,
          phone: app.schoolPhone || app.phoneNumber,
          email: app.schoolEmail || app.email,
          pgbPhone: app.phoneNumber || app.pgbPhone || '',
          pgbEmail: app.email || app.pgbEmail || '',
          address: app.address || `${app.district}, ${app.state}`,
        };

        await addMemberSchool(newSchool);
        showNotification(`Sekolah "${newSchool.name}" telah berjaya dipulihkan dan disegerakkan ke pangkalan data!`);
      } else if (anomaly.type === 'duplicate_code' || anomaly.type === 'count_discrepancy') {
        const res = autoRepairSchoolIntegrity();
        showNotification(`Integriti rekod berjaya diperbaiki: ${res.actionsTaken.join(', ') || 'Semua kod telah disahkan unik'}.`);
      } else {
        await syncAllToFirestore();
        showNotification('Segerakan seluruh pangkalan data selesai.');
      }

      await fetchLiveAuditData();
    } catch (err: any) {
      showNotification(`Ralat semasa membaiki rekod: ${err?.message || 'Sila cuba lagi'}`);
    } finally {
      setIsFixing(null);
    }
  };

  const handleRunFullRepair = async () => {
    setIsLoading(true);
    try {
      const res = autoRepairSchoolIntegrity();
      await syncAllToFirestore();
      await fetchLiveAuditData();
      showNotification(
        `Audit pembaikan selesai! ${res.actionsTaken.length > 0 ? res.actionsTaken.join(' | ') : 'Pangkalan data diselaraskan 100%'}.`
      );
    } catch (e: any) {
      showNotification(`Ralat: ${e?.message || 'Gagal membaiki pangkalan data'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAuditJson = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSchoolsInFirestore: auditAnalysis.totalFirestore,
        totalApprovedApplications: auditAnalysis.totalApprovedApps,
        totalCachedSchools: auditAnalysis.totalCached,
        integrityScore: auditAnalysis.integrityScore,
        criticalAnomalies: auditAnalysis.criticalCount,
        warningAnomalies: auditAnalysis.warningCount,
      },
      anomalies: auditAnalysis.anomalies,
      schoolMatrix: auditAnalysis.rows,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MPGBSIM_Data_Audit_Report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Laporan Audit Data berjaya dieksport!');
  };

  // Filtered Matrix Rows
  const filteredRows = useMemo(() => {
    return auditAnalysis.rows.filter((row) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.principal.toLowerCase().includes(q) ||
        row.state.toLowerCase().includes(q);

      const matchesFilter =
        filterHealth === 'all' ||
        (filterHealth === 'healthy' && row.healthStatus === 'healthy') ||
        (filterHealth === 'issue' && row.healthStatus !== 'healthy');

      return matchesSearch && matchesFilter;
    });
  }, [auditAnalysis.rows, searchTerm, filterHealth]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center justify-between shadow-xl animate-in fade-in sticky top-2 z-50">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-200 hover:text-white text-xs font-bold px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            Modul Audit Data & Integriti Rekod
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Audit Pangkalan Data Firestore & Metadata Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Sistem pengawasan automatik yang menyemak silang bilangan rekod Firestore dengan metadata permohonan keahlian bagi mengesan dan memulihkan kehilangan data institusi sekolah ahli secara serta-merta.
          </p>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
            <span>Semakan Terakhir: <strong className="text-white">{lastAuditTime || 'Sedang memuat...'}</strong></span>
            <span>•</span>
            <span>Status Sambungan: <strong className="text-teal-300">{isReadOnlyMode ? 'Cache Read-Only' : syncStatus.toUpperCase()}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={fetchLiveAuditData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition border border-slate-700 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Imbas Semula Sekarang</span>
          </button>

          <button
            onClick={handleRunFullRepair}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold flex items-center gap-2 transition shadow-md shadow-teal-900/40 cursor-pointer disabled:opacity-50"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Baiki Semua Anomali</span>
          </button>

          <button
            onClick={handleExportAuditJson}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition border border-slate-700 cursor-pointer"
            title="Eksport Laporan Audit JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eksport</span>
          </button>
        </div>
      </div>

      {/* Metric Comparison Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Firestore Live Record Count */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Firestore Rekod</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {auditAnalysis.totalFirestore}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Dokumen aktif dalam koleksi <code className="text-teal-700 font-bold bg-teal-50 px-1 rounded">schools</code>
          </p>
        </div>

        {/* Approved Member Applications Metadata */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Permohonan Sah</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {auditAnalysis.totalApprovedApps}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Permohonan status <code className="text-blue-700 font-bold bg-blue-50 px-1 rounded">approved</code>
          </p>
        </div>

        {/* Anomalies Detected */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Anomali Dikesan</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                auditAnalysis.criticalCount > 0
                  ? 'bg-rose-50 text-rose-600'
                  : auditAnalysis.warningCount > 0
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {auditAnalysis.criticalCount > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black ${
              auditAnalysis.criticalCount > 0
                ? 'text-rose-600'
                : auditAnalysis.warningCount > 0
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {auditAnalysis.anomalies.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {auditAnalysis.criticalCount > 0
              ? `${auditAnalysis.criticalCount} kritikal, ${auditAnalysis.warningCount} amaran`
              : 'Tiada kehilangan data dikesan'}
          </p>
        </div>

        {/* Overall Integrity Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Skor Integriti</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {auditAnalysis.integrityScore}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                auditAnalysis.integrityScore === 100
                  ? 'bg-emerald-500'
                  : auditAnalysis.integrityScore > 85
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${auditAnalysis.integrityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Anomalies / Alerts Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Pengesanan Anomali & Kehilangan Data Automatik
              </h3>
              <p className="text-xs text-slate-500">
                Laporan diagnosis automatik bagi setiap perbezaan antara Firestore dan rekod metadata.
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              auditAnalysis.anomalies.length === 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {auditAnalysis.anomalies.length === 0 ? 'Semua Rekod Sepadan ✓' : `${auditAnalysis.anomalies.length} Perkara Memerlukan Perhatian`}
          </span>
        </div>

        {auditAnalysis.anomalies.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-950">Integriti Data Pangkalan Sempurna</h4>
            <p className="text-xs text-emerald-800/80 max-w-lg mx-auto">
              Semua {auditAnalysis.totalFirestore} rekod sekolah dalam Firestore sepadan tepat dengan metadata permohonan keahlian yang telah diluluskan. Tiada sekolah yang hilang, tiada kod bertindih, dan tiada percanggahan dikesan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditAnalysis.anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  anomaly.severity === 'critical'
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${
                      anomaly.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          anomaly.severity === 'critical' ? 'text-rose-950' : 'text-amber-950'
                        }`}
                      >
                        {anomaly.title}
                      </h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          anomaly.severity === 'critical'
                            ? 'bg-rose-200 text-rose-800'
                            : 'bg-amber-200 text-amber-800'
                        }`}
                      >
                        {anomaly.severity}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        anomaly.severity === 'critical' ? 'text-rose-800/90' : 'text-amber-800/90'
                      }`}
                    >
                      {anomaly.description}
                    </p>
                  </div>
                </div>

                {anomaly.canAutoFix && (
                  <button
                    onClick={() => handleFixAnomaly(anomaly)}
                    disabled={isFixing === anomaly.id}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                      anomaly.severity === 'critical'
                        ? 'bg-rose-700 hover:bg-rose-800 text-white'
                        : 'bg-amber-700 hover:bg-amber-800 text-white'
                    }`}
                  >
                    <Wrench className={`w-3.5 h-3.5 ${isFixing === anomaly.id ? 'animate-spin' : ''}`} />
                    <span>{anomaly.actionLabel || 'Baiki Sekarang'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* School Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-700" />
              <span>Matriks Integriti Setiap Institusi Sekolah ({filteredRows.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Senarai terperinci perbandingan data Firestore, metadata permohonan, dan status kesihatan rekod.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sekolah, kod, PGB..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>

            {/* Health Filter */}
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value as any)}
              className="py-1.5 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Semua Status ({auditAnalysis.rows.length})</option>
              <option value="healthy">Sihat / Lengkap ({auditAnalysis.healthyCount})</option>
              <option value="issue">Ada Isu / Anomali ({auditAnalysis.rows.length - auditAnalysis.healthyCount})</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Bil</th>
                <th className="py-3 px-4">Nama Institusi & Kod</th>
                <th className="py-3 px-4">Pengetua / Guru Besar</th>
                <th className="py-3 px-4">Negeri / Daerah</th>
                <th className="py-3 px-4">Enrolmen</th>
                <th className="py-3 px-4">Firestore</th>
                <th className="py-3 px-4">Permohonan Sah</th>
                <th className="py-3 px-4">Status Integriti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Tiada institusi sepadan dengan carian "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                          {row.code || 'TIADA KOD'}
                        </span>
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-medium">
                          {row.type}
                        </span>
                        {row.isCodeDuplicate && (
                          <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">
                            Kod Bertindih!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      <div>{row.principal || <span className="text-rose-500 italic">Tiada PGB</span>}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{row.state}</div>
                      <div className="text-[10px] text-slate-400">{row.district}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>{row.studentCount} murid</div>
                      <div className="text-[10px] text-slate-400">{row.teacherCount} guru</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {row.inFirestore ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>Wujud</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" />
                          <span>Hilang</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.matchedApplication ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>Diluluskan</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Daftar Langsung
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.healthStatus === 'healthy' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>100% Sepadan</span>
                        </span>
                      ) : row.healthStatus === 'critical' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Isu Kod/Pertindihan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <Info className="w-3.5 h-3.5" />
                          <span>Medan Kosong: {row.missingFields.join(', ')}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Menunjukkan {filteredRows.length} daripada {auditAnalysis.rows.length} institusi sekolah ahli</span>
          <span>Sistem Audit MPGBSIM dikuasakan oleh Google Cloud Firestore & Engine Integriti Diagnostik</span>
        </div>
      </div>
    </div>
  );
};
