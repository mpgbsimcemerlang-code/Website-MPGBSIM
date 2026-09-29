import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  Award,
  School,
  Inbox,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  Trash2,
  Mail,
  Phone,
  Edit3,
  Sliders,
  Bell,
  StickyNote,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useAdminContent, DEFAULT_DASHBOARD_CONFIG } from '../../context/AdminContentContext';
import { ContactSubmission } from '../../types';
import { AdminDashboardEditorModal } from './AdminDashboardEditorModal';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ onNavigateTab }) => {
  const {
    siteData,
    adminUser,
    syncAllToFirestore,
    updateSubmissionStatus,
    deleteSubmission,
    approveMemberApplication,
    rejectMemberApplication,
  } = useAdminContent();

  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [appActionLoading, setAppActionLoading] = useState<string | null>(null);
  const [appActionMsg, setAppActionMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dashboard element customization modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<'banner' | 'announcement' | 'metrics' | 'membership' | 'submissions' | 'memo'>('banner');

  const dashboardConfig = siteData.dashboardConfig || DEFAULT_DASHBOARD_CONFIG;

  const handleOpenEditor = (tab: 'banner' | 'announcement' | 'metrics' | 'membership' | 'submissions' | 'memo' = 'banner') => {
    setEditorTab(tab);
    setIsEditorOpen(true);
  };

  // Computed metrics
  const applications = siteData.memberApplications || [];
  const pendingApplications = applications.filter((a) => a.status === 'pending');
  const approvedApplications = applications.filter((a) => a.status === 'approved');

  const newsList = siteData.news || [];
  const totalNews = newsList.length;
  const publishedNews = newsList.filter((n) => (n.status || 'published') === 'published').length;
  const draftNews = newsList.filter((n) => n.status === 'draft').length;
  const scheduledNews = newsList.filter((n) => n.status === 'scheduled').length;

  const eventsList = siteData.programs || [];
  const totalEvents = eventsList.length;
  const upcomingEvents = eventsList.filter((e) => (e.status || 'upcoming') === 'upcoming').length;
  const pastEvents = eventsList.filter((e) => e.status === 'past').length;

  const practicesList = siteData.practices || [];
  const totalPractices = practicesList.length;
  const publishedPractices = practicesList.filter((p) => (p.status || 'published') === 'published').length;
  const draftPractices = practicesList.filter((p) => p.status === 'draft').length;

  const schoolsList = siteData.memberSchools || [];
  const totalSchools = schoolsList.length;
  const statesCovered = new Set(schoolsList.map((s) => s.state)).size;

  const submissions = siteData.submissions || [];
  const unreadSubmissions = submissions.filter((s) => s.status === 'unread').length;

  const handleApproveApp = async (id: string) => {
    setAppActionLoading(id);
    setAppActionMsg(null);
    try {
      const res = await approveMemberApplication(id);
      if (res.success) {
        setAppActionMsg({ type: 'success', message: res.message });
      } else {
        setAppActionMsg({ type: 'error', message: res.message });
      }
    } catch {
      setAppActionMsg({ type: 'error', message: 'Ralat semasa meluluskan permohonan keahlian.' });
    } finally {
      setAppActionLoading(null);
    }
  };

  const handleRejectApp = async (id: string) => {
    if (!window.confirm('Adakah anda pasti mahu menolak permohonan keahlian ini?')) return;
    setAppActionLoading(id);
    try {
      await rejectMemberApplication(id);
      setAppActionMsg({ type: 'success', message: 'Permohonan keahlian ditandakan sebagai Ditolak.' });
    } catch {
      setAppActionMsg({ type: 'error', message: 'Ralat menolak permohonan.' });
    } finally {
      setAppActionLoading(null);
    }
  };

  const handleSyncFirestore = async () => {
    setSyncing(true);
    setSyncStatus(null);
    const res = await syncAllToFirestore();
    setSyncStatus(res);
    setSyncing(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Backend Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-lg relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600/50 text-teal-200 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>{dashboardConfig.welcomeBadge}</span>
              <button
                onClick={() => handleOpenEditor('banner')}
                title="Tukar teks lencana"
                className="opacity-60 hover:opacity-100 hover:text-amber-300 transition cursor-pointer ml-1"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {dashboardConfig.welcomeGreeting}, {adminUser?.name || 'Pentadbir'}
              </h2>
              <button
                onClick={() => handleOpenEditor('banner')}
                title="Tukar tajuk aluan"
                className="p-1 rounded text-teal-300/60 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
              {dashboardConfig.welcomeDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenEditor('banner')}
              className="px-3.5 py-2 rounded-xl bg-teal-700/80 hover:bg-teal-600 text-white text-xs font-bold transition flex items-center gap-1.5 border border-teal-500/50 shadow-xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>Edit Semua Elemen Dashboard</span>
            </button>

            <div className="px-3.5 py-2 rounded-xl bg-slate-950/40 border border-teal-500/30 text-xs">
              <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                {dashboardConfig.backendStatusLabel}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">{dashboardConfig.backendStatusValue}</span>
              </div>
            </div>

            <button
              onClick={handleSyncFirestore}
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Menyegerak...' : dashboardConfig.syncBtnLabel}</span>
            </button>
          </div>
        </div>

        {/* Sync notification message */}
        {syncStatus && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              syncStatus.success
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                : 'bg-rose-500/20 border border-rose-400/40 text-rose-200'
            }`}
          >
            {syncStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : null}
            <span>{syncStatus.message}</span>
          </div>
        )}
      </div>

      {/* DASHBOARD ANNOUNCEMENT / NOTIS PENTADBIR */}
      {dashboardConfig.showAnnouncement && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs transition ${
            dashboardConfig.announcementType === 'warning'
              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
              : dashboardConfig.announcementType === 'success'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : 'bg-teal-50/90 border-teal-200 text-teal-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {dashboardConfig.announcementType === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : dashboardConfig.announcementType === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Bell className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="block font-bold text-slate-900">{dashboardConfig.announcementTitle}</strong>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{dashboardConfig.announcementText}</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenEditor('announcement')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition cursor-pointer shrink-0"
            title="Edit Pengumuman Khas Ini"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MEMO & TUGASAN URUS SETIA */}
      {dashboardConfig.adminMemo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/90 via-white to-amber-50/60 border border-purple-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-950">Memo & Peringatan Tindakan Urus Setia</span>
                {dashboardConfig.adminMemoDate && (
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                    {dashboardConfig.adminMemoDate}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap font-medium">
                {dashboardConfig.adminMemo}
              </p>
              {dashboardConfig.adminMemoAuthor && (
                <span className="text-[11px] text-slate-400 italic block mt-1">
                  — {dashboardConfig.adminMemoAuthor}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleOpenEditor('memo')}
            className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition flex items-center gap-1.5 self-start md:self-center shrink-0 cursor-pointer shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Memo</span>
          </button>
        </div>
      )}

      {/* 4 Primary Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Statistik & Navigasi Modul Utama
          </span>
          <button
            onClick={() => handleOpenEditor('metrics')}
            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Ubah Teks & Tajuk Kad</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* News Card */}
          <div
            onClick={() => onNavigateTab('berita')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-400 transition cursor-pointer group relative"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition">
                <Newspaper className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>{dashboardConfig.cardActionText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalNews}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{dashboardConfig.cardNewsTitle}</div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-semibold">{publishedNews} Diterbitkan</span>
              <span>{draftNews} Draf</span>
              {scheduledNews > 0 && <span className="text-amber-700">{scheduledNews} Terjadual</span>}
            </div>
          </div>

          {/* Events Card */}
          <div
            onClick={() => onNavigateTab('program')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-400 transition cursor-pointer group relative"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>{dashboardConfig.cardActionText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalEvents}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{dashboardConfig.cardEventsTitle}</div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-semibold">{upcomingEvents} Akan Datang</span>
              <span>{pastEvents} Lepas</span>
            </div>
          </div>

          {/* Best Practices Card */}
          <div
            onClick={() => onNavigateTab('amalan')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-400 transition cursor-pointer group relative"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>{dashboardConfig.cardActionText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalPractices}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{dashboardConfig.cardPracticesTitle}</div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-semibold">{publishedPractices} Diterbitkan</span>
              <span>{draftPractices} Draf</span>
            </div>
          </div>

          {/* Member Schools Card */}
          <div
            onClick={() => onNavigateTab('sekolah-ahli')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-400 transition cursor-pointer group relative"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-700 group-hover:text-white transition">
                <School className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>{dashboardConfig.cardActionText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalSchools}</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{dashboardConfig.cardSchoolsTitle}</div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-blue-700 font-semibold">{statesCovered} Negeri & Wilayah</span>
              <span>SMKA / SABK / Swasta</span>
            </div>
          </div>
        </div>
      </div>

      {/* PENDING MEMBERSHIP APPLICATIONS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden group">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50/70 via-white to-amber-50/50">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
                <School className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {dashboardConfig.membershipTitle}
              </h3>
              <button
                onClick={() => handleOpenEditor('membership')}
                title="Edit teks seksyen permohonan keahlian"
                className="text-slate-400 hover:text-teal-800 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              {pendingApplications.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold animate-pulse">
                  {pendingApplications.length} Menunggu Kelulusan
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {dashboardConfig.membershipDesc}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('permohonan-keahlian')}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer shadow-xs shrink-0"
          >
            <span>{dashboardConfig.membershipBtnText} ({applications.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {appActionMsg && (
          <div
            className={`p-3.5 mx-5 mt-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
              appActionMsg.type === 'success'
                ? 'bg-teal-50 border border-teal-200 text-teal-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{appActionMsg.message}</span>
            </div>
            <button
              onClick={() => setAppActionMsg(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-5">
          {pendingApplications.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="font-bold text-xs sm:text-sm text-slate-800">
                {dashboardConfig.membershipEmptyTitle}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {dashboardConfig.membershipEmptyDesc}
              </p>
              {approvedApplications.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full font-semibold">
                    {approvedApplications.length} Institusi / Sekolah Telah Diluluskan & Berdaftar
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApplications.map((app) => {
                const isLoading = appActionLoading === app.id;
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 hover:bg-amber-50/40 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
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

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {app.schoolName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-[11px] font-bold">
                            {app.schoolType}
                          </span>
                          {app.schoolCode && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
                              {app.schoolCode}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {app.fullName} ({app.designation})
                          </span>
                          <span>•</span>
                          <span>Mula PGB: {app.serviceStartYear || 2026}</span>
                          <span>•</span>
                          <span>{app.district}, {app.state}</span>
                          <span>•</span>
                          <span>{app.studentCount || 0} Murid</span>
                          <span>•</span>
                          <span>{app.teacherCount || 0} Guru</span>
                        </div>

                        {app.schoolDescription && (
                          <p className="text-xs text-slate-500 line-clamp-1 italic">
                            "{app.schoolDescription}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      <button
                        onClick={() => handleRejectApp(app.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer disabled:opacity-50 transition"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApproveApp(app.id)}
                        disabled={isLoading}
                        className="px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isLoading ? 'Meluluskan...' : 'Luluskan & Masukkan Direktori'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden group">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{dashboardConfig.submissionsTitle}</h3>
              <button
                onClick={() => handleOpenEditor('submissions')}
                title="Edit teks seksyen peti masuk"
                className="text-slate-400 hover:text-teal-800 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              {unreadSubmissions > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                  {unreadSubmissions} Baharu
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {dashboardConfig.submissionsDesc}
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            {dashboardConfig.submissionsEmptyDesc}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className={`p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  sub.status === 'unread' ? 'bg-teal-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      sub.status === 'unread' ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{sub.name}</span>
                      <span className="text-[11px] text-slate-400">({sub.email})</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          sub.status === 'unread'
                            ? 'bg-rose-100 text-rose-700'
                            : sub.status === 'read'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sub.status === 'unread' ? 'Baharu' : sub.status === 'read' ? 'Telah Dibaca' : 'Selesai'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{sub.subject}</div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{sub.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-[10px] text-slate-400">
                    {new Date(sub.date).toLocaleDateString('ms-MY', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSubmissionStatus(sub.id, sub.status === 'unread' ? 'read' : 'unread');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition"
                    title={sub.status === 'unread' ? 'Tandakan Dibaca' : 'Tandakan Belum Dibaca'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Padam mesej daripada ${sub.name}?`)) {
                        deleteSubmission(sub.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                    title="Padam Mesej"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{selectedSubmission.subject}</h4>
                  <p className="text-[11px] text-slate-400">ID: {selectedSubmission.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Nama Pengirim</span>
                  <div className="font-bold text-slate-900">{selectedSubmission.name}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Tarikh Dihantar</span>
                  <div>{new Date(selectedSubmission.date).toLocaleString('ms-MY')}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Emel</span>
                  <div className="text-teal-800 font-semibold">{selectedSubmission.email}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">No Telefon</span>
                  <div>{selectedSubmission.phone || '-'}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Kandungan Mesej</span>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white leading-relaxed whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateSubmissionStatus(selectedSubmission.id, 'read');
                    setSelectedSubmission(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold transition"
                >
                  Tandakan Telah Dibaca
                </button>
                <button
                  onClick={() => {
                    updateSubmissionStatus(selectedSubmission.id, 'replied');
                    setSelectedSubmission(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition"
                >
                  Tandakan Selesai
                </button>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD ELEMENTS CUSTOMIZATION MODAL */}
      <AdminDashboardEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialTab={editorTab}
      />
    </div>
  );
};
