import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import {
  Menu,
  X,
  Mail,
  Calendar,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { AdminBar } from './AdminBar';

interface NavbarProps {
  onOpenPortal?: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {

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
    { label: 'Peperiksaan', href: '#peperiksaan' },
    { label: 'Best Practice', href: '#best-practice' },
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
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
          </div>
        )}
      </nav>
    </header>
  );
};
