import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Newspaper,
  Calendar,
  Award,
  School,
  Image as ImageIcon,
  Settings,
  LogOut,
  Flame,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Layout,
  BookOpen,
  Target,
  Users,
  BarChart3,
  Quote,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';
import { AdminDashboardOverview } from './admin/AdminDashboardOverview';
import { AdminNewsManagement } from './admin/AdminNewsManagement';
import { AdminEventManagement } from './admin/AdminEventManagement';
import { AdminBestPracticeManagement } from './admin/AdminBestPracticeManagement';
import { AdminSchoolManagement } from './admin/AdminSchoolManagement';
import { AdminApplicationManagement } from './admin/AdminApplicationManagement';
import { AdminMediaManagement } from './admin/AdminMediaManagement';
import { AdminSiteSettings } from './admin/AdminSiteSettings';
import { AdminLeadershipManagement } from './admin/AdminLeadershipManagement';
import { AdminStatsManagement } from './admin/AdminStatsManagement';
import { AdminAlumniManagement } from './admin/AdminAlumniManagement';
import { CMSHero } from './cms/CMSHero';
import { CMSVisionMission } from './cms/CMSVisionMission';
import { CMSStrategicFocus } from './cms/CMSStrategicFocus';
import { CMSAmanatCta } from './cms/CMSAmanatCta';
import { CMSResources } from './cms/CMSResources';

interface AdminCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'dashboard',
}) => {
  const {
    adminUser,
    logoutAdmin,
    syncAllToFirestore,
    siteData,
    syncStatus,
    lastSyncedAt,
    approveAlumniRecord,
    rejectAlumniRecord,
    updateAlumniRecord,
    deleteAlumniRecord,
    toggleFeatureAlumniRecord,
  } = useAdminContent();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logoutAdmin();
    onClose();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncAllToFirestore();
    setIsSyncing(false);
  };

  const applications = siteData.memberApplications || [];
  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  // Categorized CMS Modules
  const navSections = [
    {
      group: 'Pusat Kawalan & Ahli',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
          count: undefined,
        },
        {
          id: 'permohonan-keahlian',
          label: 'Permohonan Keahlian',
          icon: UserCheck,
          count: pendingCount > 0 ? `${pendingCount} Baru` : (applications.length || 0),
          isHighlight: pendingCount > 0,
        },
        {
          id: 'sekolah-ahli',
          label: 'Direktori Sekolah Ahli',
          icon: School,
          count: siteData.memberSchools?.length || 0,
        },
        {
          id: 'alumni-pgb',
          label: 'Alumni PGB MPGBSIM',
          icon: GraduationCap,
          count: siteData.alumni?.length || 0,
        },
      ],
    },
    {
      group: 'Kandungan Laman & Visi',
      items: [
        {
          id: 'hero',
          label: 'Hero Banner & Slogan',
          icon: Layout,
          count: undefined,
        },
        {
          id: 'visi-misi',
          label: 'Pengenalan & Visi Misi',
          icon: BookOpen,
          count: undefined,
        },
        {
          id: 'fokus-strategik',
          label: 'Fokus Strategik (4 Teras)',
          icon: Target,
          count: siteData.strategicFocus?.length || 4,
        },
        {
          id: 'kepimpinan',
          label: 'Saf Kepimpinan',
          icon: Users,
          count: siteData.leadership?.length || 0,
        },
        {
          id: 'statistik',
          label: 'Statistik Rangkaian',
          icon: BarChart3,
          count: undefined,
        },
        {
          id: 'amanat-cta',
          label: 'Amanat YDP & Seruan CTA',
          icon: Quote,
          count: undefined,
        },
        {
          id: 'sumber',
          label: 'Pusat Sumber & Pekeliling',
          icon: FileText,
          count: siteData.resources?.length || 0,
        },
      ],
    },
    {
      group: 'Aktiviti & Pengumuman',
      items: [
        {
          id: 'berita',
          label: 'Pengurusan Berita',
          icon: Newspaper,
          count: siteData.news?.length || 0,
        },
        {
          id: 'program',
          label: 'Pengurusan Acara',
          icon: Calendar,
          count: siteData.programs?.length || 0,
        },
        {
          id: 'amalan',
          label: 'Amalan Terbaik',
          icon: Award,
          count: siteData.practices?.length || 0,
        },
        {
          id: 'galeri',
          label: 'Media & Galeri',
          icon: ImageIcon,
          count: siteData.media?.length || 0,
        },
      ],
    },
    {
      group: 'Sistem & Konfigurasi',
      items: [
        {
          id: 'tetapan',
          label: 'Tetapan Laman & Hubungan',
          icon: Settings,
          count: undefined,
        },
      ],
    },
  ];

  // Flattened for easy mobile navigation
  const allTabs = navSections.flatMap((s) => s.items);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-hidden">
      <div className="bg-slate-50 rounded-3xl w-full max-w-7xl h-[94vh] max-h-[900px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-900 text-teal-300 flex items-center justify-center shadow-md shadow-teal-950/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  Pusat Kawalan CMS MPGBSIM
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Segerak PC & Android Aktif</span>
                </span>
                {lastSyncedAt && (
                  <span className="text-[10px] text-slate-400 hidden lg:inline">
                    Disegerak {lastSyncedAt}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Akses Pentadbir: <span className="font-semibold text-teal-900">{adminUser?.email || 'mpgbsim.cemerlang@gmail.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Segerak semua data ke Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-700' : ''}`} />
              <span>{isSyncing ? 'Menyegerak...' : 'Segerak Firestore'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 cursor-pointer"
              title="Log Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Keluar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Tutup Pusat Kawalan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Tabs */}
        <div className="md:hidden flex overflow-x-auto bg-white border-b border-slate-200 px-3 py-2 gap-1.5 no-scrollbar shrink-0">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-teal-800 text-teal-200' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Body: Desktop Sidebar + Content Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Left Sidebar */}
          <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-4 shrink-0 overflow-y-auto justify-between space-y-4">
            <nav className="space-y-4">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                    {section.group}
                  </div>
                  {section.items.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                          isActive
                            ? 'bg-teal-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-300' : 'text-slate-400'}`} />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        {tab.count !== undefined && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
                              tab.isHighlight
                                ? 'bg-amber-500 text-white animate-pulse'
                                : isActive
                                ? 'bg-teal-800 text-teal-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom Status Card */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs shrink-0">
              <div className="flex items-center gap-1.5 text-teal-900 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Semua Elemen Web Boleh Diedit</span>
              </div>
              <p className="text-[11px] text-teal-800/80 leading-relaxed">
                Pilih modul di atas untuk menyunting sebarang maklumat, ayat, angka, atau foto di seluruh laman web.
              </p>
            </div>
          </aside>

          {/* Right Content Panel */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
            {activeTab === 'dashboard' && <AdminDashboardOverview onNavigateTab={setActiveTab} />}
            {activeTab === 'permohonan-keahlian' && (
              <AdminApplicationManagement onNavigateToSchools={() => setActiveTab('sekolah-ahli')} />
            )}
            {activeTab === 'sekolah-ahli' && <AdminSchoolManagement />}
            {activeTab === 'alumni-pgb' && (
              <AdminAlumniManagement
                alumniList={siteData.alumni || []}
                onApprove={approveAlumniRecord}
                onReject={rejectAlumniRecord}
                onUpdate={updateAlumniRecord}
                onDelete={deleteAlumniRecord}
                onToggleFeature={toggleFeatureAlumniRecord}
              />
            )}
            {activeTab === 'hero' && <CMSHero />}
            {activeTab === 'visi-misi' && <CMSVisionMission />}
            {activeTab === 'fokus-strategik' && <CMSStrategicFocus />}
            {activeTab === 'kepimpinan' && <AdminLeadershipManagement />}
            {activeTab === 'statistik' && <AdminStatsManagement />}
            {activeTab === 'berita' && <AdminNewsManagement />}
            {activeTab === 'program' && <AdminEventManagement />}
            {activeTab === 'amalan' && <AdminBestPracticeManagement />}
            {activeTab === 'galeri' && <AdminMediaManagement />}
            {activeTab === 'amanat-cta' && <CMSAmanatCta />}
            {activeTab === 'sumber' && <CMSResources />}
            {activeTab === 'tetapan' && <AdminSiteSettings />}
          </main>
        </div>
      </div>
    </div>
  );
};
