import React from 'react';
import { Settings, LogOut, Lock, Sparkles, Upload } from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

export const AdminFloatingControl: React.FC = () => {
  const {
    isAdmin,
    adminUser,
    logoutAdmin,
    setIsCMSOpen,
    setIsLogoModalOpen,
    setIsLoginModalOpen,
  } = useAdminContent();

  if (!isAdmin) {
    return (
      <aside
        aria-label="Akses Pantas Pentadbir"
        className="fixed bottom-5 right-5 z-40"
      >
        <button
          id="fab-admin-login"
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/95 hover:bg-slate-950 text-slate-200 hover:text-amber-300 rounded-full shadow-2xl border border-teal-500/40 hover:border-amber-400/60 backdrop-blur-md transition-all duration-200 hover:scale-105 cursor-pointer text-xs font-semibold"
          title="Klik untuk Log Masuk Pentadbir & Buka Pusat Kawalan CMS"
        >
          <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <span>Log Masuk Admin CMS</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Panel Pantas Pusat Kawalan CMS"
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2"
    >
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/95 border-2 border-teal-400 rounded-2xl shadow-2xl backdrop-blur-md">
        {/* Button to open CMS */}
        <button
          id="fab-admin-open-cms"
          type="button"
          onClick={() => setIsCMSOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          title="Buka Pusat Kawalan CMS untuk kemas kini teks, program, & sekolah ahli"
        >
          <Settings className="w-4 h-4 animate-spin-slow text-amber-300" />
          <span>Pusat Kawalan CMS</span>
        </button>

        {/* Button to Upload Logo */}
        <button
          id="fab-admin-upload-logo"
          type="button"
          onClick={() => setIsLogoModalOpen(true)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 transition-colors cursor-pointer"
          title="Tukar Logo Rasmi MPGBSIM"
          aria-label="Tukar Logo Rasmi"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Button to Logout */}
        <button
          id="fab-admin-logout"
          type="button"
          onClick={logoutAdmin}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors cursor-pointer"
          title={`Log Keluar Sesi (${adminUser?.email})`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </aside>
  );
};
