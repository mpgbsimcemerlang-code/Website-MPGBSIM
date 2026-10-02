import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import {
  Menu,
  X,
  Lock,
  Mail,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';
import { AdminBar } from './AdminBar';

interface NavbarProps {
  onOpenPortal: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPortal, activeSection }) => {
  const {
    isAdmin,
    adminUser,
    logoutAdmin,
    setIsCMSOpen,
    setIsLogoModalOpen,
    setIsLoginModalOpen,
  } = useAdminContent();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Utama', href: '#utama' },
    { label: 'Tentang MPGBSIM', href: '#tentang' },
    { label: 'Berita', href: '#berita' },
    { label: 'Kepimpinan', href: '#kepimpinan' },
    { label: 'Sekolah Ahli', href: '#sekolah-ahli' },
    { label: 'Alumni PGB', href: '#alumni' },
    { label: 'Program', href: '#program' },
    { label: 'Best Practice', href: '#best-practice' },
    { label: 'Sumber', href: '#sumber' },
    { label: 'Hubungi Kami', href: '#hubungi' },
  ];

  const currentDateFormatted = new Intl.DateTimeFormat('ms-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* 0. Top Admin Bar (active when admin is logged in) */}
      <AdminBar />

      {/* Top Institutional Info Bar */}
      <div className="hidden lg:block bg-slate-950 text-slate-300 text-xs py-1.5 px-6 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-teal-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Portal Rasmi Kebangsaan
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentDateFormatted}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              mpgbsim.cemerlang@gmail.com
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="text-amber-300 font-medium tracking-wide">
              “Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani”
            </span>
            <span className="text-slate-600">|</span>

            {/* Quick Admin Access in Institutional Bar */}
            {!isAdmin ? (
              <button
                id="btn-nav-top-admin-login"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1 text-teal-300 hover:text-amber-300 transition-colors font-medium cursor-pointer"
                title="Log masuk untuk kemas kini teks, logo & acara"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Log Masuk Admin CMS</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-top-open-cms"
                  type="button"
                  onClick={() => setIsCMSOpen(true)}
                  className="inline-flex items-center gap-1 text-teal-300 hover:text-white font-semibold cursor-pointer"
                >
                  <Settings className="w-3 h-3 text-amber-400 animate-spin-slow" />
                  <span>Pusat Kawalan CMS</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  id="btn-nav-top-logout"
                  type="button"
                  onClick={logoutAdmin}
                  className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        id="main-navigation"
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-md shadow-xl border-b border-teal-900/40 py-3'
            : 'bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#utama"
            id="brand-logo-link"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-lg p-1"
          >
            <Logo variant="dark" size="md" />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.href}
                  href={link.href}
                  id={`nav-link-${link.href.replace('#', '')}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`px-3 py-2 text-xs 2xl:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-white bg-teal-800/60 shadow-xs border border-teal-500/40 font-semibold'
                      : 'text-slate-200 hover:text-teal-300 hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Action: Portal Ahli + Admin Controls */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Member Portal Button */}
            <button
              id="btn-portal-ahli-nav"
              type="button"
              onClick={onOpenPortal}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md hover:shadow-amber-400/20 active:scale-95 transition-all border border-amber-200 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-950" />
              <span>Portal Ahli</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-amber-300 uppercase tracking-wider">
                PGB
              </span>
            </button>

            {/* Admin CMS Access Button (Desktop) */}
            {!isAdmin ? (
              <button
                id="btn-admin-login-nav"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold text-teal-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 rounded-lg border border-teal-600/40 hover:border-teal-400 transition-colors shadow-xs cursor-pointer"
                title="Log Masuk Pentadbir untuk menguruskan CMS"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin CMS</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-admin-cms-nav"
                  type="button"
                  onClick={() => setIsCMSOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-bold text-white bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 rounded-lg shadow-md border border-teal-400/50 transition-all cursor-pointer"
                  title="Buka Pusat Kawalan Kandungan (CMS)"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                  <span>CMS</span>
                </button>
                <button
                  id="btn-admin-logout-nav"
                  type="button"
                  onClick={logoutAdmin}
                  className="p-2 text-rose-300 hover:text-rose-200 bg-rose-950/70 hover:bg-rose-900 rounded-lg border border-rose-800/50 transition-colors cursor-pointer"
                  title="Log Keluar Pentadbir"
                  aria-label="Log Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              id="btn-mobile-portal-quick"
              type="button"
              onClick={onOpenPortal}
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-md shadow-xs cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Portal</span>
            </button>

            {/* Mobile Quick Admin Button */}
            {!isAdmin ? (
              <button
                id="btn-mobile-admin-quick"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="sm:hidden inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-teal-300 bg-slate-800 border border-teal-600/40 rounded-md shadow-xs cursor-pointer"
                title="Admin CMS"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                id="btn-mobile-cms-quick"
                type="button"
                onClick={() => setIsCMSOpen(true)}
                className="sm:hidden inline-flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-white bg-teal-700 rounded-md shadow-xs cursor-pointer"
                title="Buka CMS"
              >
                <Settings className="w-3 h-3 text-amber-300 animate-spin-slow" />
                <span>CMS</span>
              </button>
            )}

            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="xl:hidden bg-slate-900 border-b border-slate-800 shadow-2xl px-4 pt-3 pb-6 space-y-2 animate-fadeIn"
          >
            <div className="p-2 mb-2 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Jaringan Kepimpinan Pengetua & Guru Besar Malaysia</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-teal-300 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
              ))}
            </div>

            {/* Action Buttons in Mobile Drawer */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                id="btn-mobile-drawer-portal"
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPortal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm shadow-md"
              >
                <Lock className="w-4 h-4" />
                <span>Buka Portal Ahli PGB</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Admin login or CMS controls in drawer */}
              {!isAdmin ? (
                <button
                  id="btn-mobile-drawer-admin-login"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white font-semibold text-sm border border-teal-600/40 shadow-xs cursor-pointer transition-colors"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Log Masuk Pentadbir (Pusat Kawalan CMS)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    id="btn-mobile-drawer-cms"
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCMSOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4 text-amber-300 animate-spin-slow" />
                    <span>Buka Pusat Kawalan Kandungan (CMS)</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      id="btn-mobile-drawer-logo"
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsLogoModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 cursor-pointer"
                    >
                      <span>Tukar Logo</span>
                    </button>
                    <button
                      id="btn-mobile-drawer-logout"
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logoutAdmin();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-semibold border border-rose-800/60 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Keluar Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
