import React, { useState, useRef } from 'react';
import { useAdminContent } from '../../context/AdminContentContext';
import { Quote, Sparkles, Save, CheckCircle, Camera, Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';

export const CMSAmanatCta: React.FC = () => {
  const { siteData, updateQuote, updateCta } = useAdminContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const [quoteForm, setQuoteForm] = useState(siteData.quote || {
    quoteText: '“Bersama PGB, kita membina sekolah Islam yang lebih unggul.”',
    authorName: 'Dato’ Seri Ustaz Haji Kamaruddin bin Mohamad',
    authorRole: 'Yang Dipertua Kebangsaan, Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    badge: 'Amanat Kepimpinan Pendidikan Islam Malaysia',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  });

  const [ctaForm, setCtaForm] = useState(siteData.cta || {
    badge: 'Seruan Jaringan Kepimpinan Kebangsaan',
    title: 'Bersama memperkasa pendidikan Islam Malaysia.',
    description:
      'Sertai ratusan Pengetua dan Guru Besar di seluruh tanah air untuk membina permuafakatan, mengoptimumkan tadbir urus sekolah dan melahirkan generasi Rabbani yang berdaya saing di persada dunia.',
    btnPrimaryText: 'Daftar Keahlian PGB / Sekolah',
    btnSecondaryText: 'Hubungi Urus Setia',
    footerNotes: 'Tiada yuran tersembunyi • Kelulusan rasmi Jawatankuasa MPGBSIM • Akses modul eksklusif',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const processPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Sila pilih fail imej yang sah (JPG, PNG, JPEG, WEBP).');
      return;
    }
    setIsProcessingPhoto(true);
    try {
      const optimized = await compressImageFile(file, 800, 1000, 0.85);
      setQuoteForm((prev) => ({ ...prev, authorPhotoUrl: optimized }));
      showToast('Foto Pengerusi berjaya dimuat naik ke pratonton!');
    } catch (err) {
      console.warn('Fallback file reader:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setQuoteForm((prev) => ({ ...prev, authorPhotoUrl: reader.result as string }));
        showToast('Foto Pengerusi berjaya dimuat naik!');
      };
      reader.onerror = () => {
        showToast('Ralat membaca fail foto. Sila cuba lagi.');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processPhoto(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuote(quoteForm);
    showToast('Amanat & Petikan Tokoh berjaya dikemaskini!');
  };

  const handleSaveCta = (e: React.FormEvent) => {
    e.preventDefault();
    updateCta(ctaForm);
    showToast('Teks Seruan Jaringan (CTA) berjaya dikemaskini!');
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* SECTION 1: AMANAT KEPIMPINAN / QUOTE */}
      <form onSubmit={handleSaveQuote} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-teal-800 text-amber-300 flex items-center justify-center">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Amanat Kepimpinan & Petikan Tokoh (Quote Section)</h3>
            <p className="text-xs text-slate-500">Kemas kini kata-kata amanat inspirasi rasmi Yang Dipertua / Majlis di halaman utama.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Lencana / Sub-Tajuk Amanat
          </label>
          <input
            type="text"
            value={quoteForm.badge}
            onChange={(e) => setQuoteForm({ ...quoteForm, badge: e.target.value })}
            placeholder="Amanat Kepimpinan Pendidikan Islam Malaysia"
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Teks Petikan Amanat Rasmi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={quoteForm.quoteText}
            onChange={(e) => setQuoteForm({ ...quoteForm, quoteText: e.target.value })}
            placeholder="“Bersama PGB, kita membina sekolah Islam yang lebih unggul.”"
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-bold text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Tokoh / Pengucap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={quoteForm.authorName}
              onChange={(e) => setQuoteForm({ ...quoteForm, authorName: e.target.value })}
              placeholder="Dato’ Seri Ustaz Haji Kamaruddin bin Mohamad"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Jawatan / Peranan Tokoh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={quoteForm.authorRole}
              onChange={(e) => setQuoteForm({ ...quoteForm, authorRole: e.target.value })}
              placeholder="Yang Dipertua Kebangsaan, Majlis Pengetua Guru Besar..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Ruang Gambar Pengerusi MPGBSIM */}
        <div className="pt-3 border-t border-slate-200">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-teal-700" />
            <span>Foto Pengerusi / Yang Dipertua MPGBSIM</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Muat naik gambar foto profil Pengerusi MPGBSIM terus dari komputer atau telefon. Foto akan dipaparkan bersaiz kemas dan jelas di sebelah kata-kata amanat.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handlePhotoUpload}
            className="sr-only pointer-events-none"
            aria-hidden="true"
            tabIndex={-1}
          />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-white border border-teal-200 shadow-xs">
            {/* Portrait Preview Box */}
            <div
              onClick={() => !isProcessingPhoto && fileInputRef.current?.click()}
              className="relative w-32 h-40 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-dashed border-teal-600 hover:border-teal-400 bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer group shadow-sm transition-all"
              title="Klik untuk memilih foto dari komputer atau telefon"
            >
              {isProcessingPhoto ? (
                <div className="text-center p-3 text-teal-800">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto mb-1 text-teal-700" />
                  <span className="text-[11px] font-bold block">Memproses...</span>
                </div>
              ) : quoteForm.authorPhotoUrl ? (
                <>
                  <img
                    src={quoteForm.authorPhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'}
                    alt="Pratonton Foto Pengerusi"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                    <Upload className="w-5 h-5 text-amber-300 mb-1" />
                    <span className="text-xs font-bold">Tukar Foto</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-3 text-slate-400 group-hover:text-teal-700 transition-colors">
                  <Camera className="w-8 h-8 mx-auto mb-1 text-teal-600/70" />
                  <span className="text-[11px] font-bold text-teal-900 block">Pilih Foto</span>
                  <span className="text-[9px] text-slate-500 block">Klik / Sentuh</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-2.5 w-full">
              <span className="text-xs font-bold text-slate-800 block">
                Pilihan Muat Naik Foto Pengerusi:
              </span>
              <p className="text-[11px] text-slate-500">
                Pilih fail imej (JPG, PNG, WEBP) dari telefon atau komputer. Sistem akan mengoptimumkan saiz secara automatik.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-300" />
                  <span>{quoteForm.authorPhotoUrl ? 'Tukar / Upload Foto Baru' : 'Pilih Fail Foto'}</span>
                </button>

                {quoteForm.authorPhotoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        authorPhotoUrl:
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                      }))
                    }
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    Guna Foto Asal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Amanat & Petikan</span>
          </button>
        </div>
      </form>

      {/* SECTION 2: CALL TO ACTION / SERUAN JARINGAN */}
      <form onSubmit={handleSaveCta} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Seruan Bertindak & Pendaftaran (Call To Action)</h3>
            <p className="text-xs text-slate-500">Uruskan teks promosi seruan kebangsaan, ajakan menyertai majlis dan label butang.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lencana Seruan (Badge)
            </label>
            <input
              type="text"
              value={ctaForm.badge}
              onChange={(e) => setCtaForm({ ...ctaForm, badge: e.target.value })}
              placeholder="Seruan Jaringan Kepimpinan Kebangsaan"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tajuk Utama Seruan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={ctaForm.title}
              onChange={(e) => setCtaForm({ ...ctaForm, title: e.target.value })}
              placeholder="Bersama memperkasa pendidikan Islam Malaysia."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Penerangan / Mesej Seruan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={ctaForm.description}
              onChange={(e) => setCtaForm({ ...ctaForm, description: e.target.value })}
              placeholder="Sertai ratusan Pengetua dan Guru Besar di seluruh tanah air..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Teks Butang Utama (Pendaftaran)
            </label>
            <input
              type="text"
              value={ctaForm.btnPrimaryText}
              onChange={(e) => setCtaForm({ ...ctaForm, btnPrimaryText: e.target.value })}
              placeholder="Daftar Keahlian PGB / Sekolah"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Teks Butang Kedua (Hubungi Urus Setia)
            </label>
            <input
              type="text"
              value={ctaForm.btnSecondaryText}
              onChange={(e) => setCtaForm({ ...ctaForm, btnSecondaryText: e.target.value })}
              placeholder="Hubungi Urus Setia"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-semibold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nota Kaki / Jaminan Di Bawah Butang
            </label>
            <input
              type="text"
              value={ctaForm.footerNotes}
              onChange={(e) => setCtaForm({ ...ctaForm, footerNotes: e.target.value })}
              placeholder="Tiada yuran tersembunyi • Kelulusan rasmi Jawatankuasa MPGBSIM • Akses modul eksklusif"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seruan & CTA</span>
          </button>
        </div>
      </form>
    </div>
  );
};
