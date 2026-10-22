import React from 'react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { PortalHeader } from './PortalHeader';
import { PortalDashboardHome } from './PortalDashboardHome';
import { PortalLiveChat } from './PortalLiveChat';
import { PortalAnnouncements } from './PortalAnnouncements';
import { PortalExamCalendar } from './PortalExamCalendar';
import { PortalPrograms } from './PortalPrograms';
import { PortalDirectory } from './PortalDirectory';
import { PortalDocuments } from './PortalDocuments';
import { PortalBestPractice } from './PortalBestPractice';
import { PortalAIDigitalHub } from './PortalAIDigitalHub';
import { PortalResources } from './PortalResources';
import { PortalSubmitPractice } from './PortalSubmitPractice';
import { PortalSchoolNewsSubmit } from './PortalSchoolNewsSubmit';
import { PortalProfile } from './PortalProfile';
import { PortalActivityLog } from './PortalActivityLog';
import { PortalBirthdaySection } from './PortalBirthdaySection';
import { PortalFeePayment } from './PortalFeePayment';
import { PortalAdminDashboard } from './PortalAdminDashboard';
import { PortalGlobalSearchModal } from './PortalGlobalSearchModal';
import { PortalNotificationModal } from './PortalNotificationModal';
import { PortalLoginView } from './PortalLoginView';
import { PortalPGBSpotlight } from './PortalPGBSpotlight';
import { ShieldAlert, MessageSquare, Bell } from 'lucide-react';

export const PortalMainLayout: React.FC = () => {
  const {
    portalTab,
    portalSubTab,
    currentRole,
    setPortalTab,
    currentUser,
    unreadPersonalSenders,
    unreadPersonalChatCount,
    totalUnreadChatCount,
    openDirectChatWithSchool,
  } = useMemberPortal();

  const unreadChatBadgeCount = unreadPersonalChatCount > 0 ? unreadPersonalChatCount : totalUnreadChatCount;

  // Ensure clicking any module (e.g. from Pusat Akses Pantas) always positions the view at the very top
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const rafId = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [portalTab, portalSubTab]);

  // If user is not logged in, render the dedicated integrated Member Portal Login View
  if (!currentUser) {
    return <PortalLoginView />;
  }

  const renderContent = () => {
    switch (portalTab) {
      case 'dashboard':
        return <PortalDashboardHome />;
      case 'sembang-live':
        return <PortalLiveChat />;
      case 'yuran':
        return <PortalFeePayment />;
      case 'pengumuman':
        return <PortalAnnouncements />;
      case 'peperiksaan':
        return <PortalExamCalendar />;
      case 'program':
        return <PortalPrograms />;
      case 'direktori':
        return <PortalDirectory />;
      case 'dokumen':
        return <PortalDocuments />;
      case 'best-practice':
        return <PortalBestPractice />;
      case 'ai-hub':
        return <PortalAIDigitalHub />;
      case 'sumber':
        return <PortalResources />;
      case 'kongsi-amalan':
        return <PortalSubmitPractice />;
      case 'kejayaan-sekolah':
        return <PortalSchoolNewsSubmit />;
      case 'profil':
        return <PortalProfile />;
      case 'log-keaktifan':
        return <PortalActivityLog />;
      case 'hari-lahir':
        return <PortalBirthdaySection />;
      case 'admin-hub':
      case 'ajk-admin':
        // Protected route check
        if (currentRole !== 'ADMIN' && currentRole !== 'MEDIA_AJK') {
          return (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-xl font-black text-slate-900">Akses Dihadkan</h2>
              <p className="text-xs text-slate-500 mt-2">
                Halaman ini dikhaskan untuk peranan ADMIN atau MEDIA AJK sahaja. Akaun anda tidak mempunyai kebenaran untuk membuka panel kawalan ini.
              </p>
              <button
                onClick={() => setPortalTab('dashboard')}
                className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Kembali ke Dashboard Ahli
              </button>
            </div>
          );
        }
        return <PortalAdminDashboard />;
      default:
        return <PortalDashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header */}
      <PortalHeader />

      {/* Portal-Wide Real-Time Personal Chat Notification Alert (Visible on any Portal page when another PGB sends a personal message) */}
      {portalTab !== 'sembang-live' && unreadPersonalSenders.length > 0 && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gradient-to-r from-rose-600 via-amber-500 to-teal-800 p-0.5 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-slate-900 text-white rounded-[14px] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 animate-bounce">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-black tracking-wide">
                      {unreadPersonalChatCount} mesej baharu
                    </span>
                    <span className="text-xs font-bold text-amber-300 truncate">
                      Mesej Peribadi PGB daripada {unreadPersonalSenders[0].senderName} ({unreadPersonalSenders[0].senderSchool})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">
                    "{unreadPersonalSenders[0].latestText}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  openDirectChatWithSchool(
                    unreadPersonalSenders[0].senderSchoolCode || unreadPersonalSenders[0].channelId
                  )
                }
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Buka & Baca Mesej</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PGB Spotlight Widget (Tokoh Kepimpinan Ahli MPGBSIM) */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <PortalPGBSpotlight />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Floating Quick-Access Live Chat Button when not on sembang-live tab */}
      {portalTab !== 'sembang-live' && (
        <button
          type="button"
          onClick={() => {
            if (unreadPersonalSenders.length > 0) {
              openDirectChatWithSchool(
                unreadPersonalSenders[0].senderSchoolCode || unreadPersonalSenders[0].channelId
              );
            } else {
              setPortalTab('sembang-live');
            }
          }}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-teal-900 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl border border-teal-700 transition-transform hover:scale-105 cursor-pointer"
          title="Buka Ruang Sembang Live PGB"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>Sembang Live PGB</span>
          {unreadChatBadgeCount > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black animate-pulse">
              {unreadChatBadgeCount} mesej baharu
            </span>
          )}
        </button>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Majlis Pengetua Guru Besar Sekolah Islam Malaysia (MPGBSIM) •{' '}
            <a href="https://www.mpgbsim.org/" target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline font-mono">
              https://www.mpgbsim.org/
            </a>
          </span>
          <span className="text-[11px] text-slate-400">
            Portal Ahli Rasmi Bersepadu • Versi 3.2.0 • Sesi 2026/2027
          </span>
        </div>
      </footer>

      {/* Modals */}
      <PortalGlobalSearchModal />
      <PortalNotificationModal />
    </div>
  );
};
