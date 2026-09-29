import React, { useState } from 'react';
import {
  ShieldCheck,
  Upload,
  Settings,
  LogOut,
  Sparkles,
  RefreshCw,
  CloudCheck,
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

export const AdminBar: React.FC = () => {
  const {
    isAdmin,
    adminUser,
    logoutAdmin,
    setIsCMSOpen,
    setIsLogoModalOpen,
    syncStatus,
    syncAllToFirestore,
  } = useAdminContent();

  const [isSyncing, setIsSyncing] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleQuickSync = async () => {
    setIsSyncing(true);
    await syncAllToFirestore();
    setIsSyncing(false);
  };

  return (
    <div
      id="admin-active-top-bar"
      className="w-full bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950 text-white border-b-2 border-teal-400 shadow-xl py-2 px-4 sm:px-6 text-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Admin identity indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600/40 border border-teal-400/60 flex items-center justify-center text-teal-300 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-wide text-[11px] sm:text-xs">SESI PENTADBIR AKTIF</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/40 font-medium">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Kawalan Penuh Tapak
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Akaun: <span className="text-teal-300 font-mono font-medium">{adminUser?.email}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Cloud Sync to all devices Button */}
          <button
            id="btn-admin-sync-cloud"
            type="button"
            onClick={handleQuickSync}
            disabled={isSyncing}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 text-teal-200 text-xs font-medium transition cursor-pointer"
            title="Segerak ke Cloud Firestore (menyelaraskan semua perubahan antara PC dan Tab Android)"
          >
            <RefreshCw className={`w-3 h-3 text-amber-300 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-[11px]">{isSyncing ? 'Menyegerak...' : 'Segerak PC ⇄ Android'}</span>
          </button>

          {/* Dedicated Button for Uploading Logo */}
          <button
            id="btn-admin-upload-logo"
            type="button"
            onClick={() => setIsLogoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-900/80 hover:bg-teal-800 text-teal-200 hover:text-white font-semibold text-xs border border-teal-500/40 transition-colors cursor-pointer"
            title="Tukar logo rasmi MPGBSIM"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Tukar Logo</span>
          </button>

          {/* Full CMS Control Center Button */}
          <button
            id="btn-admin-cms-control"
            type="button"
            onClick={() => setIsCMSOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold text-xs shadow-md border border-teal-300/40 transition-all hover:scale-102 cursor-pointer"
            title="Buka Pusat Kawalan CMS untuk sunting teks, program, sekolah & pautan"
          >
            <Settings className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>Pusat Kawalan Kandungan (CMS)</span>
          </button>

          {/* Logout Button */}
          <button
            id="btn-admin-logout"
            type="button"
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-xs font-semibold transition-colors cursor-pointer"
            title="Log Keluar Sesi Pentadbir"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
