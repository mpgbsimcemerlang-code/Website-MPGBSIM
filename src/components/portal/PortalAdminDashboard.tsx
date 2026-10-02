import React, { useState } from 'react';
import {
  Shield,
  Users,
  Building2,
  Calendar,
  FileText,
  Sparkles,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Activity,
  Layers,
  Check,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { AdminAlumniManagement } from '../admin/AdminAlumniManagement';

export const PortalAdminDashboard: React.FC = () => {
  const {
    currentRole,
    currentUser,
    setPortalTab,
    setPortalSubTab,
    announcements,
    documents,
    bestPractices,
    submissions,
    auditLogs,
    reviewBestPractice,
    reviewSubmission,
  } = useMemberPortal();

  const {
    siteData,
    approveMemberApplication,
    rejectMemberApplication,
    approveAlumniRecord,
    rejectAlumniRecord,
    updateAlumniRecord,
    deleteAlumniRecord,
    toggleFeatureAlumniRecord,
  } = useAdminContent();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'submissions' | 'practices' | 'applications' | 'alumni' | 'audit' | 'roles'
  >('overview');
  const [auditSearch, setAuditSearch] = useState('');
  const [appFeedback, setAppFeedback] = useState<string | null>(null);

  const isAdmin = currentRole === 'ADMIN';
  const isMediaAJK = currentRole === 'MEDIA_AJK';

  // Statistics calculation
  const totalMembers = 286;
  const totalSchools = siteData.memberSchools?.length || 24;
  const upcomingEvents = siteData.programs?.length || 4;
  const publishedAnnouncements = announcements.filter((a) => a.status === 'published').length;
  const totalPractices = (siteData.practices?.length || 0) + bestPractices.length;

  const pendingApplications = (siteData.memberApplications || []).filter(
    (a) => a.status === 'pending'
  );
  const pendingAppsCount = pendingApplications.length;

  // Unify submissions from Portal and Website Contact Form
  const allSubmissions = React.useMemo(() => {
    const list: any[] = [...submissions];
    (siteData.submissions || []).forEach((siteSub) => {
      if (!list.some((s) => s.id === siteSub.id || (s.title === siteSub.subject && s.submitterEmail === siteSub.email))) {
        list.push({
          id: siteSub.id,
          submitter: siteSub.name,
          submitterEmail: siteSub.email,
          school: siteSub.phone || 'Pertanyaan Laman Web',
          type: 'Pertanyaan Awam',
          title: siteSub.subject,
          content: siteSub.message,
          date: siteSub.date ? siteSub.date.split('T')[0] : '2026-09-24',
          status: siteSub.status === 'read' ? 'Approved' : 'Submitted',
        });
      }
    });
    return list;
  }, [submissions, siteData.submissions]);

  const pendingSubmissionsCount =
    allSubmissions.filter((s) => s.status === 'Submitted' || s.status === 'Under Review').length +
    bestPractices.filter((b) => b.status === 'Submitted' || b.status === 'Under Review').length;
  const totalDocs = documents.length;

  const filteredAuditLogs = auditLogs.filter((log) => {
    return (
      log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.content.toLowerCase().includes(auditSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            {isAdmin ? 'Dashboard Pentadbir Sistem (ADMIN)' : 'Dashboard Pengurusan Media (MEDIA AJK)'}
          </div>
          <h1 className="text-2xl font-black text-white">
            {isAdmin ? 'Pusat Kawalan Pentadbir MPGBSIM' : 'Pusat Kawalan Media & Penerangan'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isAdmin
              ? 'Pantau keahlian, semakan kertas kerja, takwim, dokumen dasar dan rekod audit keselamatan.'
              : 'Semak submisi amalan terbaik, berita sekolah, program dan penerbitan warta pengumuman.'}
          </p>
        </div>

        {/* Quick Tabs inside Panel */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-800 border border-slate-700 overflow-x-auto">
          {[
            { id: 'overview', label: 'Ringkasan' },
            { id: 'submissions', label: `Submisi (${pendingSubmissionsCount})` },
            { id: 'applications', label: `Permohonan (${pendingAppsCount})` },
            { id: 'practices', label: 'Amalan Terbaik' },
            { id: 'alumni', label: `Alumni PGB (${siteData.alumni?.length || 0})` },
            ...(isAdmin ? [{ id: 'audit', label: 'Audit Log' }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeAdminTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-8">
          {/* Statistics Grid (Prompt Section R) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Members
              </span>
              <strong className="text-xl font-black text-slate-900 mt-1 block">{totalMembers}</strong>
              <span className="text-[10px] text-emerald-600 font-semibold">+12 bulan ini</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Schools
              </span>
              <strong className="text-xl font-black text-slate-900 mt-1 block">{totalSchools}</strong>
              <span className="text-[10px] text-teal-600 font-semibold">14 Negeri</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Upcoming Events
              </span>
              <strong className="text-xl font-black text-slate-900 mt-1 block">{upcomingEvents}</strong>
              <span className="text-[10px] text-amber-600 font-semibold">Takwim 2026</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Published News
              </span>
              <strong className="text-xl font-black text-slate-900 mt-1 block">{publishedAnnouncements}</strong>
              <span className="text-[10px] text-blue-600 font-semibold">Pekeliling Aktif</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Best Practices
              </span>
              <strong className="text-xl font-black text-slate-900 mt-1 block">{totalPractices}</strong>
              <span className="text-[10px] text-emerald-600 font-semibold">Inovasi Ahli</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-300 bg-amber-50/50 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Pending Submissions
              </span>
              <strong className="text-xl font-black text-amber-900 mt-1 block">
                {pendingSubmissionsCount}
              </strong>
              <span className="text-[10px] text-amber-700 font-semibold">Perlu Semakan</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Documents
              </span>
              <strong className="text-xl font-black text-slate-900 mt-1 block">{totalDocs}</strong>
              <span className="text-[10px] text-slate-500 font-semibold">Pusat Repositori</span>
            </div>
          </div>

          {/* Quick Actions Bar (Prompt Section R & S) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" />
              Tindakan Pantas (Quick Actions)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => setPortalTab('pengumuman')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Plus className="w-4 h-4" />
                </div>
                <strong className="text-xs text-slate-900 block font-bold">Add Announcement</strong>
                <span className="text-[10px] text-slate-500">Cipta pekeliling</span>
              </button>

              <button
                onClick={() => setPortalTab('program')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4" />
                </div>
                <strong className="text-xs text-slate-900 block font-bold">Add Event</strong>
                <span className="text-[10px] text-slate-500">Daftar takwim</span>
              </button>

              <button
                onClick={() => setPortalTab('dokumen')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <strong className="text-xs text-slate-900 block font-bold">Add Document</strong>
                <span className="text-[10px] text-slate-500">Muat naik fail</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('submissions')}
                className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-2 font-bold">
                  !
                </div>
                <strong className="text-xs text-amber-950 block font-bold">Review Submission</strong>
                <span className="text-[10px] text-amber-800">{pendingSubmissionsCount} menunggu</span>
              </button>

              <button
                onClick={() => {
                  setPortalTab('direktori');
                  setPortalSubTab('sekolah');
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <strong className="text-xs text-slate-900 block font-bold">Add School</strong>
                <span className="text-[10px] text-slate-500">Direktori sekolah</span>
              </button>

              <button
                onClick={() => {
                  setPortalTab('direktori');
                  setPortalSubTab('pgb');
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <strong className="text-xs text-slate-900 block font-bold">Manage Members</strong>
                <span className="text-[10px] text-slate-500">Senarai PGB</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Stream (Prompt Section R) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              Aktiviti Terbaharu Sistem (Recent Activity)
            </h2>

            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{log.action}</div>
                    <p className="text-slate-600 mt-0.5">{log.content}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Oleh: {log.user} ({log.email})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SUBMISSIONS REVIEW QUEUE */}
      {activeAdminTab === 'submissions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Senarai Submisi Menunggu Semakan</h2>
              <p className="text-xs text-slate-500">
                Semak cadangan program, kertas kerja dan perkongsian bahan ahli untuk tindakan susulan
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
              {submissions.length} Submisi
            </span>
          </div>

          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      {sub.type}
                    </span>
                    <strong className="text-sm text-slate-900">{sub.title}</strong>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      sub.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-900'
                        : sub.status === 'Published'
                        ? 'bg-teal-100 text-teal-900'
                        : sub.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {sub.content}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                  <span className="text-[11px] text-slate-500">
                    Pengirim: <strong>{sub.submitter}</strong> ({sub.school}) • Emel: {sub.submitterEmail} • Tarikh: {sub.date}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => reviewSubmission(sub.id, 'Approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Luluskan
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Sebab penolakan cadangan:');
                        if (reason) reviewSubmission(sub.id, 'Rejected', reason);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: BEST PRACTICES REVIEW QUEUE */}
      {activeAdminTab === 'practices' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pengurusan Amalan Terbaik Ahli</h2>
              <p className="text-xs text-slate-500">
                Pilih amalan terbaik untuk diterbitkan ke Hab Best Practice portal rasmi
              </p>
            </div>
            <button
              onClick={() => setPortalTab('best-practice')}
              className="text-xs text-teal-800 font-bold hover:underline"
            >
              Buka Hab Best Practice →
            </button>
          </div>

          <div className="space-y-4">
            {bestPractices.map((bp) => (
              <div
                key={bp.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                      {bp.category}
                    </span>
                    <strong className="text-sm text-slate-900">{bp.title}</strong>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      bp.status === 'Published'
                        ? 'bg-emerald-100 text-emerald-900'
                        : bp.status === 'Approved'
                        ? 'bg-teal-100 text-teal-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {bp.status || 'Published'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {bp.challenge || bp.description || 'Penerangan amalan terbaik sekolah.'}
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-500">
                    Sekolah: {bp.school || bp.schoolName} • Penulis: {bp.author}
                  </span>

                  <div className="flex items-center gap-2">
                    {bp.status !== 'Published' && (
                      <button
                        onClick={() => reviewBestPractice(bp.id, 'Published')}
                        className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs"
                      >
                        Terbitkan ke Hab
                      </button>
                    )}
                    <button
                      onClick={() => setPortalTab('best-practice')}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
                    >
                      Semak Penuh
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: MEMBERSHIP APPLICATIONS QUEUE */}
      {activeAdminTab === 'applications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Senarai Permohonan Keahlian Sekolah Baharu</h2>
              <p className="text-xs text-slate-500">
                Kelulusan permohonan akan secara automatik mendaftarkan sekolah ke dalam direktori website dan portal MPGBSIM.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
              {pendingApplications.length} Menunggu Tindakan
            </span>
          </div>

          {appFeedback && (
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium">
              {appFeedback}
            </div>
          )}

          <div className="space-y-4">
            {(siteData.memberApplications || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Tiada rekod permohonan keahlian dijumpai.</p>
            ) : (
              (siteData.memberApplications || []).map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {app.schoolCode || 'SCH'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{app.schoolName}</h3>
                        <p className="text-[11px] text-slate-500">
                          {app.district ? `${app.district}, ` : ''}{app.state} • {app.schoolType}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {app.status === 'approved' ? 'Diluluskan' : app.status === 'rejected' ? 'Ditolak' : 'Menunggu Semakan'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pemohon / PGB</span>
                      <strong className="text-slate-800">{app.fullName}</strong>
                      <span className="text-slate-500 block text-[11px]">({app.designation})</span>
                      {app.serviceStartYear && (
                        <span className="text-teal-800 block text-[11px] font-semibold mt-0.5">
                          Tahun Menjadi PGB: {app.serviceStartYear}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Hubungi</span>
                      <span className="text-slate-700 block text-[11px]">{app.email}</span>
                      <span className="text-slate-700 block text-[11px]">{app.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Statistik & Keahlian</span>
                      <span className="text-slate-700 block text-[11px]">Murid: {app.studentCount} | Guru: {app.teacherCount}</span>
                      {(app.joinYear || (app as any).schoolJoinYear) && (
                        <span className="text-teal-800 block text-[11px] font-semibold">
                          Tahun Ahli MPGBSIM: {app.joinYear || (app as any).schoolJoinYear}
                        </span>
                      )}
                      <span className="text-slate-500 block text-[10px]">Dihantar: {app.submittedAt?.split('T')[0] || '2026'}</span>
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={async () => {
                          const res = await approveMemberApplication(app.id);
                          setAppFeedback(res.message);
                          setTimeout(() => setAppFeedback(null), 4000);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Luluskan & Daftarkan Sekolah ke Direktori
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt('Sebab penolakan permohonan keahlian:');
                          if (reason) {
                            await rejectMemberApplication(app.id, reason);
                            setAppFeedback(`Permohonan ${app.schoolName} telah ditolak.`);
                            setTimeout(() => setAppFeedback(null), 4000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: ALUMNI MANAGEMENT */}
      {activeAdminTab === 'alumni' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <AdminAlumniManagement
            alumniList={siteData.alumni || []}
            onApprove={approveAlumniRecord}
            onReject={rejectAlumniRecord}
            onUpdate={updateAlumniRecord}
            onDelete={deleteAlumniRecord}
            onToggleFeature={toggleFeatureAlumniRecord}
            isMediaAjk={isMediaAJK}
          />
        </div>
      )}

      {/* VIEW: AUDIT LOGS (Section T) */}
      {activeAdminTab === 'audit' && isAdmin && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Rekod Audit Log Keselamatan & Tindakan Pentadbir</h2>
              <p className="text-xs text-slate-500">
                Menjejaki setiap tindakan pentadbir, kelulusan submisi, muat naik dokumen dan penukaran peranan
              </p>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Cari rekod log..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Masa & Tarikh</th>
                  <th className="py-2.5 px-3">Pengguna</th>
                  <th className="py-2.5 px-3">Tindakan</th>
                  <th className="py-2.5 px-3">Keterangan / Sasaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      <div>{log.user}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{log.email}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{log.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
