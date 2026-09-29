import React from 'react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { PortalHeader } from './PortalHeader';
import { PortalDashboardHome } from './PortalDashboardHome';
import { PortalAnnouncements } from './PortalAnnouncements';
import { PortalPrograms } from './PortalPrograms';
import { PortalDirectory } from './PortalDirectory';
import { PortalDocuments } from './PortalDocuments';
import { PortalBestPractice } from './PortalBestPractice';
import { PortalAIDigitalHub } from './PortalAIDigitalHub';
import { PortalResources } from './PortalResources';
import { PortalSubmitPractice } from './PortalSubmitPractice';
import { PortalSchoolNewsSubmit } from './PortalSchoolNewsSubmit';
import { PortalProfile } from './PortalProfile';
import { PortalAdminDashboard } from './PortalAdminDashboard';
import { PortalGlobalSearchModal } from './PortalGlobalSearchModal';
import { PortalNotificationModal } from './PortalNotificationModal';
import { PortalLoginView } from './PortalLoginView';
import { ShieldAlert } from 'lucide-react';

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
      case 'pengumuman':
        return <PortalAnnouncements />;
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
