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
import { PortalFeePayment } from './PortalFeePayment';
import { PortalAdminDashboard } from './PortalAdminDashboard';
import { PortalGlobalSearchModal } from './PortalGlobalSearchModal';
import { PortalNotificationModal } from './PortalNotificationModal';
import { PortalLoginView } from './PortalLoginView';
import { ShieldAlert, MessageSquare } from 'lucide-react';

export const PortalMainLayout: React.FC = () => {
  const { portalTab, currentRole, setPortalTab, currentUser } = useMemberPortal();

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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Floating Quick-Access Live Chat Button when not on sembang-live tab */}
      {portalTab !== 'sembang-live' && (
        <button
          type="button"
          onClick={() => setPortalTab('sembang-live')}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-teal-900 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl border border-teal-700 transition-transform hover:scale-105 cursor-pointer"
          title="Buka Ruang Sembang Live PGB"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>Sembang Live PGB</span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Majlis Pengetua Guru Besar Sekolah Islam Malaysia (MPGBSIM). Hak Cipta Terpelihara.
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
