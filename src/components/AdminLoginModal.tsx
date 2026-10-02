import React, { useState } from 'react';
import {
  Lock,
  X,
  Mail,
  Key,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAdmin, loginWithGoogle } = useAdminContent();
  const [email, setEmail] = useState('mpgbsim.cemerlang@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  React.useEffect(() => {
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

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUnauthorizedDomain(false);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setGoogleLoading(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 600);
      } else {
        setGoogleLoading(false);
        setErrorMsg(res.message);
        if (res.isUnauthorizedDomain) {
          setIsUnauthorizedDomain(true);
        }
      }
    } catch (err: any) {
      setGoogleLoading(false);
      const isUnauth =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain') ||
        String(err).includes('unauthorized-domain');
      if (isUnauth) {
        setIsUnauthorizedDomain(true);
        setErrorMsg('Domain belum didaftarkan di Firebase Console. Sila masukkan kata laluan secara manual di bawah.');
      } else {
        setErrorMsg('Ralat semasa pengesahan Google: ' + (err?.message || 'Sila cuba lagi.'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!password || !password.trim()) {
      setErrorMsg('Sila masukkan kata laluan pentadbir.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setLoading(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 600);
      } else {
        setLoading(false);
        setErrorMsg(res.message);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Ralat pelayan semasa log masuk.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Icon & Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-teal-900 text-teal-300 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-950/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Akses Pentadbir CMS</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Akaun rasmi: <strong className="text-teal-900 font-bold">mpgbsim.cemerlang@gmail.com</strong>
          </p>
        </div>

        {/* Unauthorized Domain Helper Card */}
        {isUnauthorizedDomain && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Domain Belum Didaftarkan di Firebase Console
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Firebase memerlukan domain aplikasi ini (<code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-[10px] break-all">{currentHost}</code>) didaftarkan di <span className="font-semibold">Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</span> untuk popup Google. Sila masukkan kata laluan anda secara manual di bawah.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  if (currentHost) {
                    navigator.clipboard.writeText(currentHost);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 3000);
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-amber-200/90 hover:bg-amber-300 text-amber-950 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-amber-300 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedDomain ? 'Domain Disalin!' : 'Salin Domain ' + currentHost}</span>
              </button>
            </div>
          </div>
        )}

        {/* Notification alerts */}
        {errorMsg && !isUnauthorizedDomain && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-200 hover:border-teal-600 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-3 bg-white cursor-pointer"
          >
            {googleLoading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{googleLoading ? 'Menyambung ke Google...' : 'Log Masuk dengan Akaun Google'}</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
              Atau Log Masuk Emel & Kata Laluan
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Emel Pentadbir
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mpgbsim.cemerlang@gmail.com"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Kata Laluan
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata laluan pentadbir"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>{loading ? 'Mengesahkan Akses...' : 'Log Masuk Pentadbir CMS'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
