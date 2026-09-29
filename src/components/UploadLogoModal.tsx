import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Eye,
  Lock
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';
import { compressImageFile } from '../utils/imageCompressor';

interface UploadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadLogoModal: React.FC<UploadLogoModalProps> = ({ isOpen, onClose }) => {
  const { siteData, updateLogo, resetLogoToDefault, isAdmin, setIsLoginModalOpen } = useAdminContent();
  const [previewUrl, setPreviewUrl] = useState<string>(siteData?.branding?.logoUrl || '/mpgbsim-official-logo.png');
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Security gate check: only admin can change logo!
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Akses Terhad Pentadbir</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Hanya akaun Pentadbir Sah sahaja yang mempunyai kebenaran untuk memuat naik atau menukar logo rasmi MPGBSIM.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                setIsLoginModalOpen(true);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-sm font-semibold shadow-md transition"
            >
              Log Masuk Pentadbir
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Sila pilih fail imej yang sah (PNG, JPG, SVG, atau WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Saiz fail melebihi had 5MB. Sila muat naik imej yang lebih optimum.' });
      return;
    }

    try {
      compressImageFile(file, 800, 800, 0.85).then((compressedResult) => {
        setPreviewUrl(compressedResult);
        setFileDetails({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB (Dioptimumkan)`,
          type: file.type,
        });
        setFeedback({ type: 'success', text: 'Imej logo berjaya dioptimumkan dan sedia untuk disimpan.' });
      }).catch(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreviewUrl(result);
          setFileDetails({
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type,
          });
          setFeedback({ type: 'success', text: 'Imej logo sedia untuk disimpan. Semak pratonton di bawah.' });
        };
        reader.readAsDataURL(file);
      });
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setFileDetails({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
        });
        setFeedback({ type: 'success', text: 'Imej logo sedia untuk disimpan. Semak pratonton di bawah.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    setFileDetails({
      name: 'Pautan URL Luaran',
      size: 'Dihoskan Luar',
      type: 'Imej Web',
    });
    setFeedback({ type: 'success', text: 'Pautan imej berjaya dimuatkan ke pratonton.' });
  };

  const handleSaveLogo = () => {
    if (!previewUrl) return;
    updateLogo(previewUrl);
    setFeedback({ type: 'success', text: 'Logo rasmi berjaya dikemas kini di seluruh laman web!' });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleReset = () => {
    resetLogoToDefault();
    setPreviewUrl('/mpgbsim-official-logo.png');
    setFileDetails(null);
    setUrlInput('');
    setFeedback({ type: 'success', text: 'Logo telah dikembalikan kepada logo rasmi lalai (1988).' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Muat Naik & Kemas Kini Logo</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> Pentadbir Sah
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tukar logo rasmi MPGBSIM untuk keseluruhan paparan portal (Header, Hero, Footer & Favicon).
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition ${
            isDragOver
              ? 'border-teal-600 bg-teal-50/60'
              : 'border-slate-300 hover:border-teal-500 bg-slate-50/70 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
            accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
            className="hidden"
          />
          <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-slate-200 text-teal-800 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Seret dan lepaskan imej logo baharu di sini, atau{' '}
            <span className="text-teal-700 underline underline-offset-2">pilih fail dari komputer</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Format disokong: PNG, JPG, JPEG, SVG, WebP (Maksimum 5MB). Format bulat atau berlatar putih disyorkan.
          </p>

          {fileDetails && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-teal-900 shadow-2xs">
              <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>{fileDetails.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{fileDetails.size}</span>
            </div>
          )}
        </div>

        {/* Alternative URL Input */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Atau masukkan pautan URL Imej Logo:
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://contoh.com/logo-mpgbsim.png"
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              Uji Pautan
            </button>
          </div>
        </div>

        {/* Live Preview Comparison */}
        <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-teal-700" />
              <span>Pratonton Paparan Sebenar Logo</span>
            </div>
            <span className="text-[11px] text-slate-500">Kemas kini langsung</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Background (Like Navbar / Hero) */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-[11px] font-semibold text-slate-400 mb-2">Pada Latar Gelap (Navbar / Hero)</span>
              <div className="w-20 h-20 rounded-full bg-white p-1 ring-2 ring-teal-400/40 flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src={previewUrl || '/mpgbsim-official-logo.png'}
                  alt="Pratonton Logo Gelap"
                  className="w-full h-full object-contain"
                  onError={() => {
                    setFeedback({ type: 'error', text: 'Gagal memaparkan imej logo. Sila semak semula fail atau pautan URL.' });
                  }}
                />
              </div>
              <span className="text-[10px] text-teal-300 font-bold mt-2">MPGBSIM</span>
            </div>

            {/* Light Background (White Mode) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 mb-2">Pada Latar Terang (Kandungan)</span>
              <div className="w-20 h-20 rounded-full bg-white p-1 ring-2 ring-slate-300 flex items-center justify-center overflow-hidden shadow-md">
                <img
                  src={previewUrl || '/mpgbsim-official-logo.png'}
                  alt="Pratonton Logo Terang"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-slate-800 font-bold mt-2">MPGBSIM</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Logo Rasmi Asal (1988)</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveLogo}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-900/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Terapkan Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
