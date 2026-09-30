import React, { useState } from 'react';
import {
  Bell,
  Search,
  LogOut,
  Shield,
  User,
  ExternalLink,
  Menu,
  X,
  CheckCircle,
  FileText,
  Calendar,
  Sparkles,
  BookOpen,
  Share2,
  Users,
  Settings,
  HelpCircle,
  Check,
  School,
  Trophy,
} from 'lucide-react';
import { useMemberPortal, PortalTab } from '../../context/MemberPortalContext';
import { Logo } from '../Logo';

export const PortalHeader: React.FC = () => {
  const {
    currentUser,
    currentRole,
    portalTab,
    setPortalTab,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    logoutPortal,
    setViewMode,
    setIsSearchOpen,
  } = useMemberPortal();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems: { id: PortalTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'pengumuman', label: 'Pengumuman', icon: Bell },
    { id: 'program', label: 'Program', icon: Calendar },
    { id: 'direktori', label: 'Direktori', icon: Users },
    { id: 'dokumen', label: 'Dokumen', icon: FileText },
    { id: 'best-practice', label: 'Best Practice', icon: Sparkles },
    { id: 'kejayaan-sekolah', label: 'Kejayaan Sekolah', icon: Trophy },
    { id: 'ai-hub', label: 'AI & Digital', icon: Sparkles },
    { id: 'sumber', label: 'Sumber', icon: BookOpen },
    { id: 'kongsi-amalan', label: 'Kongsi Amalan', icon: Share2 },
    { id: 'profil', label: 'Profil Saya', icon: User },
  ];

  if (currentRole === 'ADMIN' || currentRole === 'MEDIA_AJK') {
    navItems.push({ id: 'ajk-admin', label: 'Panel Pengurusan', icon: Shield });
  }

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-600" />
            ADMIN PENTADBIR
          </span>
        );
      case 'MEDIA_AJK':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            MEDIA AJK
          </span>
        );
      case 'MEMBER':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            AHLI PGB
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            TETAMU AWAM
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Utility & Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPortalTab('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
            >
              <Logo showText={false} size="sm" className="shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-wide text-white group-hover:text-amber-300 transition-colors">
                    MPGBSIM MEMBER PORTAL
                  </span>
                  <span className="hidden md:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                    Rasmi
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 hidden sm:block">
                  Majlis Pengetua Guru Besar Sekolah Islam Malaysia
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Icons & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm transition-colors"
              title="Carian Global (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Cari dalam portal...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsUserMenuOpen(false);
                }}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Pusat Pemberitahuan"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Panel */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-xs uppercase tracking-wider">Pemberitahuan Ahli</h4>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-amber-300 hover:underline font-medium"
                      >
                        Tanda Semua Dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">Tiada pemberitahuan baharu.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.linkTab) {
                              setPortalTab(notif.linkTab as PortalTab);
                            }
                            setIsNotifOpen(false);
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors text-xs flex gap-3 ${
                            !notif.read ? 'bg-amber-50/60 font-medium' : ''
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !notif.read ? 'bg-amber-500' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{notif.title}</div>
                            <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.date).toLocaleDateString('ms-MY', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                    <button
                      onClick={() => {
                        setPortalTab('pengumuman');
                        setIsNotifOpen(false);
                      }}
                      className="text-xs text-teal-800 font-semibold hover:underline"
                    >
                      Lihat Semua Pengumuman Rasmi →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              >
                <img
                  src={
                    currentUser?.photoURL ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={currentUser?.fullName || 'Ahli'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-400/50"
                />
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-100 truncate max-w-[120px] lg:max-w-[160px]">
                    {currentUser?.fullName?.split(' ')[0] || 'Ahli'}
                  </div>
                  <div className="text-[10px] text-amber-300">{currentUser?.position || 'Pengetua'}</div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-slate-900 text-white border-b border-slate-800">
                    <div className="font-bold text-sm text-amber-300">{currentUser?.fullName}</div>
                    <div className="text-xs text-slate-300 mt-0.5">{currentUser?.school}</div>
                    <div className="mt-2.5 flex items-center justify-between">
                      {getRoleBadge()}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentUser?.membershipNo?.replace('MIA1009', 'MJAC011') || 'MPGB-AHLI'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 divide-y divide-slate-100 text-xs">
                    <button
                      onClick={() => {
                        setPortalTab('profil');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 font-medium text-slate-700"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Profil & Kad Ahli Saya
                    </button>
                    <button
                      onClick={() => {
                        logoutPortal();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 flex items-center gap-2 font-semibold text-amber-800"
                    >
                      <School className="w-4 h-4 text-amber-600" />
                      Tukar Sekolah / Log Masuk PGB Lain
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('public');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 font-medium text-slate-700"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                      Lihat Laman Awam Rasmi
                    </button>
                    <button
                      onClick={() => {
                        logoutPortal();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 flex items-center gap-2 font-semibold text-rose-600"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Log Keluar Portal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Horizontal Navigation (Desktop) */}
      <div className="hidden lg:block bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 py-1.5 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = portalTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPortalTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 p-4 space-y-1 animate-in fade-in duration-150">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
            Menu Portal Ahli
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = portalTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPortalTab(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 text-left transition-colors ${
                    isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs px-2">
            <button
              onClick={() => {
                setViewMode('public');
                setIsMobileNavOpen(false);
              }}
              className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Laman Awam
            </button>
            <button
              onClick={() => {
                logoutPortal();
                setIsMobileNavOpen(false);
              }}
              className="text-rose-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Keluar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
