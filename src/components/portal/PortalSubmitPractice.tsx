import React, { useState } from 'react';
import {
  Share2,
  CheckCircle,
  FileText,
  Sparkles,
  Upload,
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Clock,
  Send,
  Save,
  MessageSquare,
  Trophy,
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { BestPracticeItem, MemberSubmission } from '../../types';

export const PortalSubmitPractice: React.FC = () => {
  const { currentUser, submitBestPractice, submitMemberForm, setPortalTab, submissions } =
    useMemberPortal();

  const [activeFormType, setActiveFormType] = useState<'best-practice' | 'general'>(
    'best-practice'
  );

  // Best Practice Form State (Section M)
  const [bpTitle, setBpTitle] = useState('');
  const [bpSchool, setBpSchool] = useState(currentUser?.school || '');
  const [bpCategory, setBpCategory] = useState<BestPracticeItem['category']>('Kurikulum');
  const [bpChallenge, setBpChallenge] = useState('');
  const [bpApproach, setBpApproach] = useState('');
  const [bpImplementation, setBpImplementation] = useState('');
  const [bpOutcome, setBpOutcome] = useState('');
  const [bpLessonLearned, setBpLessonLearned] = useState('');
  const [bpImageUrl, setBpImageUrl] = useState('');
  const [bpSupportingFile, setBpSupportingFile] = useState('');

  // General Member Submission State (Section P)
  const [genType, setGenType] = useState<MemberSubmission['type']>('Cadangan program');
  const [genTitle, setGenTitle] = useState('');
  const [genContent, setGenContent] = useState('');
  const [genAttachment, setGenAttachment] = useState('');

  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'Kepimpinan',
    'Kurikulum',
    'HEM',
    'Kokurikulum',
    'Tarbiah',
    'AI',
    'Digital',
    'HR',
    'Kewangan',
    'Pengurusan',
    'Inovasi',
  ];

  const generalTypes: MemberSubmission['type'][] = [
    'Cadangan program',
    'Cadangan penambahbaikan',
    'Kisah kejayaan',
    'Berita sekolah',
    'Sumber perkongsian',
  ];

  const [formError, setFormError] = useState('');

  const handleBestPracticeSubmit = async (status: 'Draft' | 'Submitted') => {
    setFormError('');
    if (!bpTitle.trim() || !bpChallenge.trim()) {
      setFormError('Sila lengkapkan sekurang-kurangnya Tajuk dan Cabaran sekolah.');
      return;
    }

    await submitBestPractice({
      title: bpTitle,
      school: bpSchool || currentUser?.school || 'Sekolah Ahli',
      category: bpCategory,
      challenge: bpChallenge,
      approach: bpApproach,
      implementation: bpImplementation,
      outcome: bpOutcome,
      lessonLearned: bpLessonLearned,
      supportingDocs: bpSupportingFile || undefined,
      driveUrl: bpSupportingFile || undefined,
      documentUrl: bpSupportingFile || undefined,
      images: bpImageUrl ? [bpImageUrl] : undefined,
      status,
      year: String(new Date().getFullYear()),
    });

    setSuccessMessage(
      status === 'Submitted'
        ? 'Amalan terbaik anda telah berjaya dihantar untuk semakan urus setia MPGBSIM.'
        : 'Amalan terbaik anda telah disimpan sebagai Draf.'
    );
    setIsSubmittedSuccess(true);

    // Reset fields
    setBpTitle('');
    setBpChallenge('');
    setBpApproach('');
    setBpImplementation('');
    setBpOutcome('');
    setBpLessonLearned('');
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!genTitle.trim() || !genContent.trim()) {
      setFormError('Sila lengkapkan tajuk dan kandungan cadangan.');
      return;
    }

    await submitMemberForm({
      submitter: currentUser?.fullName || 'Ahli PGB',
      submitterEmail: currentUser?.email || 'ahli@mpgbsim.org.my',
      school: currentUser?.school || 'Sekolah Ahli',
      type: genType,
      title: genTitle,
      content: genContent,
      attachmentName: genAttachment || undefined,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    });

    setSuccessMessage(
      `Bahan "${genTitle}" jenis (${genType}) telah direkodkan ke dalam peti masuk urus setia.`
    );
    setIsSubmittedSuccess(true);
    setGenTitle('');
    setGenContent('');
    setGenAttachment('');
  };

  // User's own submissions
  const mySubmissions = submissions.filter(
    (s) => !currentUser?.email || s.submitterEmail === currentUser.email
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Share2 className="w-3.5 h-3.5" />
            Pusat Perkongsian Ilmu & Submisi Ahli
          </div>
          <h1 className="text-2xl font-black text-slate-900">+ Kongsi Amalan & Hantar Bahan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Saluran rasmi Pengetua dan Guru Besar untuk berkongsi amalan terbaik, cadangan program dan berita sekolah.
          </p>
        </div>

        {/* Form Selector Tabs */}
        <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap items-center gap-1 shrink-0">
          <button
            onClick={() => {
              setActiveFormType('best-practice');
              setIsSubmittedSuccess(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeFormType === 'best-practice'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Amalan Terbaik (Best Practice)
          </button>
          <button
            onClick={() => {
              setActiveFormType('general');
              setIsSubmittedSuccess(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeFormType === 'general'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-amber-400" />
            Cadangan & Bahan Ahli
          </button>
          <button
            onClick={() => setPortalTab('kejayaan-sekolah')}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-xs transition-all"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>🏆 Hantar Berita Kejayaan (Live Web)</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {isSubmittedSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-700 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-200 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Penghantaran Berjaya!</h4>
              <p className="text-xs text-emerald-100">{successMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setPortalTab('best-practice')}
            className="px-4 py-2 bg-white text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-50 shrink-0"
          >
            Lihat Hab Amalan Terbaik →
          </button>
        </div>
      )}

      {/* FORM 1: BEST PRACTICE SUBMISSION (Section M) */}
      {activeFormType === 'best-practice' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">+ KONGSI AMALAN TERBAIK</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lengkapkan 12 fasa di bawah untuk dinilai oleh AJK Media & Panel Akademik MPGBSIM.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Title & School */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tajuk Amalan Terbaik *</label>
                <input
                  type="text"
                  required
                  value={bpTitle}
                  onChange={(e) => setBpTitle(e.target.value)}
                  placeholder="Contoh: Pengurusan Tahfiz Terbeza Berbantukan Data Analitik"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Institusi / Sekolah *</label>
                <input
                  type="text"
                  required
                  value={bpSchool}
                  onChange={(e) => setBpSchool(e.target.value)}
                  placeholder="Nama penuh sekolah anda"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs font-medium"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Amalan *</label>
              <select
                value={bpCategory}
                onChange={(e) => setBpCategory(e.target.value as any)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs font-semibold"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Challenge */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cabaran Dihadapi (The Challenge) *
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Apakah masalah atau kekangan asal sebelum inovasi ini dimulakan?
              </p>
              <textarea
                rows={3}
                required
                value={bpChallenge}
                onChange={(e) => setBpChallenge(e.target.value)}
                placeholder="Huraikan masalah murid, guru, jadual atau pengurusan kewangan..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs"
              />
            </div>

            {/* Solution / Approach */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pendekatan / Solusi (Solution & Approach) *
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Bagaimanakah idea solusi atau formula diperkenalkan?
              </p>
              <textarea
                rows={3}
                value={bpApproach}
                onChange={(e) => setBpApproach(e.target.value)}
                placeholder="Rangka idea inovasi atau kaedah bersepadu yang dibangunkan..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs"
              />
            </div>

            {/* Implementation */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tatacara Pelaksanaan (Implementation) *
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Bagaimanakah projek ini dilaksanakan secara praktikal di lapangan?
              </p>
              <textarea
                rows={3}
                value={bpImplementation}
                onChange={(e) => setBpImplementation(e.target.value)}
                placeholder="Fasa rintis, penglibatan guru, masa pelaksanaan dan alatan yang digunakan..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs"
              />
            </div>

            {/* Outcome & Impact */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Hasil & Impak Terbukti (Outcome) *
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Apakah data, statistik atau kejayaan yang terbukti dicapai?
              </p>
              <textarea
                rows={3}
                value={bpOutcome}
                onChange={(e) => setBpOutcome(e.target.value)}
                placeholder="Contoh: 94% murid mencapai Mumtaz, penjimatan kos operasi sebanyak RM12,000 setahun..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs"
              />
            </div>

            {/* Lesson Learned */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pengajaran & Ibrah Kepimpinan (Lesson Learned) *
              </label>
              <p className="text-[11px] text-slate-400 mb-1.5">
                Nasihat dan panduan replikasi untuk Pengetua dan Guru Besar lain.
              </p>
              <textarea
                rows={3}
                value={bpLessonLearned}
                onChange={(e) => setBpLessonLearned(e.target.value)}
                placeholder="Perkara penting yang perlu diberi perhatian oleh sekolah lain..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs"
              />
            </div>

            {/* Media & Attachments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pautan Gambar Aktiviti (Images URL)</label>
                <input
                  type="url"
                  value={bpImageUrl}
                  onChange={(e) => setBpImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-teal-900">
                    <FileText className="w-4 h-4 text-teal-700" />
                    Pautan Dokumen / Modul Sokongan (Google Drive / Link Muat Turun)
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium">Diakses & dimuat turun oleh pengguna lain</span>
                </label>
                <input
                  type="url"
                  value={bpSupportingFile}
                  onChange={(e) => setBpSupportingFile(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1.../view atau https://drive.google.com/drive/folders/..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-teal-300 focus:bg-white text-xs font-mono text-teal-900 shadow-2xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Masukkan pautan Google Drive, Dropbox, atau PDF modul amalan terbaik anda supaya pengguna/pengetua lain boleh muat turun.
                </p>
              </div>
            </div>

            {/* Action Buttons: Draft vs Submitted */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleBestPracticeSubmit('Draft')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4 text-slate-500" />
                Simpan sebagai Draft
              </button>
              <button
                type="button"
                onClick={() => handleBestPracticeSubmit('Submitted')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
                Hantar untuk Semakan (Submit)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM 2: GENERAL MEMBER SUBMISSIONS (Section P) */}
      {activeFormType === 'general' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Borang Cadangan & Perkongsian Bahan Ahli</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hantar cadangan penambahbaikan, kertas kerja program, kisah kejayaan atau berita aktiviti sekolah anda.
            </p>
          </div>

          <form onSubmit={handleGeneralSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Penghantaran (Submission Type) *</label>
              <select
                value={genType}
                onChange={(e) => setGenType(e.target.value as any)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs font-semibold"
              >
                {generalTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tajuk Permohonan / Bahan *</label>
              <input
                type="text"
                required
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                placeholder="Contoh: Cadangan Kolaborasi Bengkel Robotik Tahfiz Zon Selatan"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kandungan Terperinci *</label>
              <textarea
                rows={6}
                required
                value={genContent}
                onChange={(e) => setGenContent(e.target.value)}
                placeholder="Jelaskan rasional cadangan, objektif, faedah kepada sekolah ahli MPGBSIM, atau ringkasan berita..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Fail Lampiran (Pilihan)</label>
              <input
                type="text"
                value={genAttachment}
                onChange={(e) => setGenAttachment(e.target.value)}
                placeholder="Contoh: Kertas_Kerja_Bengkel_Robotik.pdf"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                Hantar Submisi Kepada Urus Setia
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Track My Submissions Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Rekod Submisi Anda</h3>
            <p className="text-[11px] text-slate-500">Semak status pemprosesan bahan yang telah dihantar</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {mySubmissions.length} Submisi Direkodkan
          </span>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            Anda belum mempunyai submisi bahan. Gunakan borang di atas untuk memulakan perkongsian.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mySubmissions.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {sub.type}
                    </span>
                    <strong className="text-slate-900 font-semibold">{sub.title}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Dihantar pada: {sub.date}</span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    sub.status === 'Approved' || sub.status === 'Published'
                      ? 'bg-emerald-100 text-emerald-900'
                      : sub.status === 'Under Review' || sub.status === 'Submitted'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
