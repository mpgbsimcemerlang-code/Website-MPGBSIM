import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Award,
  MapPin,
  FileText,
  Share2,
  Bookmark,
  Send,
  Building,
  Check,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { NewsItem, StrategicFocus, BestPracticeItem, ProgramEvent } from '../types';
import { db, doc, setDoc } from '../firebase';

export type ModalContentType =
  | { type: 'news'; data: NewsItem }
  | { type: 'focus'; data: StrategicFocus }
  | { type: 'practice'; data: BestPracticeItem }
  | { type: 'program'; data: ProgramEvent }
  | { type: 'privacy' }
  | { type: 'sharePractice' }
  | null;

interface DetailModalProps {
  content: ModalContentType;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ content, onClose }) => {
  // Program registration mini-form state
  const [progName, setProgName] = useState('');
  const [progSchool, setProgSchool] = useState('');
  const [progEmail, setProgEmail] = useState('');
  const [progRegistered, setProgRegistered] = useState(false);

  // Share best practice mini-form state
  const [shareTitle, setShareTitle] = useState('');
  const [shareSchool, setShareSchool] = useState('');
  const [shareDesc, setShareDesc] = useState('');
  const [shareSubmitted, setShareSubmitted] = useState(false);

  React.useEffect(() => {
    if (!content) {
      document.body.style.overflow = '';
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow || '';
    };
  }, [content, onClose]);

  if (!content) return null;

  const handleProgramRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content?.type === 'program' && content.data) {
      try {
        const id = `reg-${Date.now()}`;
        await setDoc(doc(db, 'submissions', id), {
          id,
          submitter: progName,
          submitterEmail: progEmail,
          school: progSchool,
          type: 'Pendaftaran Program',
          title: `Pendaftaran: ${content.data.title}`,
          content: `Nama: ${progName}, Sekolah: ${progSchool}, Emel: ${progEmail}, Program: ${content.data.title}`,
          date: new Date().toISOString().split('T')[0],
          status: 'Submitted',
        });
      } catch (err) {}
    }
    setProgRegistered(true);
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = `share-${Date.now()}`;
      await setDoc(doc(db, 'submissions', id), {
        id,
        submitter: shareSchool,
        type: 'Kisah kejayaan',
        title: shareTitle,
        content: shareDesc,
        date: new Date().toISOString().split('T')[0],
        status: 'Submitted',
      });
      await setDoc(doc(db, 'practices', id), {
        id,
        title: shareTitle,
        schoolName: shareSchool,
        category: 'Kurikulum',
        description: shareDesc,
        status: 'Submitted',
        year: '2026',
      });
      await setDoc(doc(db, 'bestPractices', id), {
        id,
        title: shareTitle,
        schoolName: shareSchool,
        category: 'Kurikulum',
        description: shareDesc,
        status: 'Submitted',
        year: '2026',
      });
    } catch (err) {}
    setShareSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div role="dialog" aria-modal="true" className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-900 bg-white/80 hover:bg-white rounded-full shadow-xs transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Type: NEWS */}
        {content.type === 'news' && (
          <div>
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
              <img
                src={content.data.imageUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800'}
                alt={content.data.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500 text-slate-950 shadow-md inline-block">
                    {content.data.category}
                  </span>
                  {content.data.achievementLevel && (
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-teal-800 text-teal-100 border border-teal-600/50 shadow-md inline-block">
                      Peringkat {content.data.achievementLevel}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {content.data.title}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
              {/* School Achievement Spotlight if present */}
              {(content.data.schoolName || content.data.isSchoolAchievement) && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-900">
                        Kejayaan Sekolah Ahli MPGBSIM
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {content.data.schoolName || 'Sekolah Ahli Berdaftar'}
                      </div>
                    </div>
                  </div>

                  {content.data.state && (
                    <div className="px-3 py-1 rounded-lg bg-white border border-amber-200 text-xs font-bold text-amber-900 shrink-0 self-start sm:self-auto">
                      Negeri: {content.data.state}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 mb-6 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {content.data.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {content.data.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  {content.data.author}
                </span>
              </div>

              <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {content.data.content}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {content.data.schoolName
                    ? `Diterbitkan secara langsung melalui Portal Ahli MPGBSIM (${content.data.schoolName})`
                    : 'Diterbitkan oleh Urus Setia MPGBSIM'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                  }}
                  className="inline-flex items-center gap-1 text-teal-700 font-semibold hover:underline"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Salin Pautan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Type: STRATEGIC FOCUS */}
        {content.type === 'focus' && (
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {content.data.code}
              </span>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {content.data.status}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
              {content.data.title}
            </h3>

            <p className="text-sm text-slate-700 leading-relaxed mb-6 font-normal">
              {content.data.fullDesc}
            </p>

            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Senarai Inisiatif Strategik Kebangsaan:
              </h4>
              <div className="space-y-2.5">
                {content.data.initiatives.map((init, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{init}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
              <strong className="block text-amber-900 font-bold mb-0.5">Penunjuk Prestasi Utama (KPI):</strong>
              <p>{content.data.kpi}</p>
            </div>
          </div>
        )}

        {/* Content Type: BEST PRACTICE */}
        {content.type === 'practice' && (
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {content.data.badge}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {content.data.category} • Tahun {content.data.year}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
              {content.data.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-700">
                {content.data.schoolName}, {content.data.state}
              </span>
              <span>•</span>
              <span>Diterajui: {content.data.leadPerson}</span>
            </div>

            <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-950">
                <strong className="block text-teal-900 font-bold mb-1">Ringkasan Impak & Pembuktian:</strong>
                <p>{content.data.impactSummary}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Metodologi & Pelaksanaan:</h4>
                <p>{content.data.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Hasil Pencapaian Terperinci:</h4>
                <div className="space-y-2">
                  {content.data.keyOutcomes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Type: PROGRAM REGISTRATION */}
        {content.type === 'program' && (
          <div className="max-h-[85vh] overflow-y-auto">
            {content.data.posterUrl && (
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                {/* Ambient backdrop so portrait/square posters never get cropped awkwardly */}
                <img
                  src={content.data.posterUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none"
                />
                <img
                  src={content.data.posterUrl}
                  alt={content.data.title}
                  className="relative z-10 max-h-full max-w-full object-contain drop-shadow-md"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none z-20" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white z-30">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-600/90 text-white backdrop-blur-xs shadow-xs">
                    Poster Rasmi Program
                  </span>
                  <a
                    href={content.data.posterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition cursor-pointer"
                  >
                    <span>Buka Poster Penuh</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 mb-2 inline-block">
                Pendaftaran Program MPGBSIM
              </span>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
              {content.data.title}
            </h3>
            <p className="text-xs sm:text-sm font-medium italic text-teal-800 mb-4 bg-teal-50 p-2.5 rounded-lg border-l-2 border-teal-600">
              {content.data.theme}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <div>
                <span className="text-slate-400 block">Tarikh:</span>
                <strong className="text-slate-800">{content.data.date}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Waktu:</span>
                <strong className="text-slate-800">{content.data.time}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Tempat:</span>
                <strong className="text-slate-800">{content.data.venue} ({content.data.mode})</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Yuran:</span>
                <strong className="text-amber-800 font-semibold">{content.data.fees}</strong>
              </div>
            </div>

            {progRegistered ? (
              <div className="p-5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                <h4 className="text-base font-bold text-teal-900">Pendaftaran Berjaya Diterima!</h4>
                <p className="text-xs text-slate-600">
                  Pengesahan kehadiran dan surat pelepasan rasmi MPGBSIM telah dihantar ke emel <strong>{progEmail}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleProgramRegisterSubmit} className="space-y-3.5 text-xs sm:text-sm">
                <h4 className="font-bold text-slate-900">Borang Pendaftaran Peserta (PGB / Wakil):</h4>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Penuh Peserta</label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Pengetua Hj. Kamaruddin"
                    value={progName}
                    onChange={(e) => setProgName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Sekolah / Institusi</label>
                  <input
                    type="text"
                    required
                    placeholder="cth. SMKA Putrajaya"
                    value={progSchool}
                    onChange={(e) => setProgSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Alamat Emel Rasmi</label>
                  <input
                    type="email"
                    required
                    placeholder="cth. pgb@sekolah.edu.my"
                    value={progEmail}
                    onChange={(e) => setProgEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Sahkan Pendaftaran Acara</span>
                  </button>
                </div>
              </form>
            )}
            </div>
          </div>
        )}

        {/* Content Type: SHARE BEST PRACTICE FORM */}
        {content.type === 'sharePractice' && (
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
              Cadang & Kongsi Amalan Terbaik Sekolah Anda
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Amalan terbaik yang terpilih akan didokumentasikan dalam Repositori Terbuka MPGBSIM serta menerima pengiktirafan di peringkat kebangsaan.
            </p>

            {shareSubmitted ? (
              <div className="p-6 rounded-xl bg-teal-50 border border-teal-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                <h4 className="text-base font-bold text-teal-900">Cadangan Diterima!</h4>
                <p className="text-xs text-slate-600">
                  Jawatankuasa Penilaian Amalan Terbaik MPGBSIM akan menyemak dokumen ini dan menghubungi pihak sekolah anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleShareSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tajuk Amalan Terbaik / Inovasi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Model Pengurusan Tahfiz Terpimpin Melalui Analitik AI"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Sekolah & Negeri
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Sekolah Menengah Islam Hidayah, Johor"
                    value={shareSchool}
                    onChange={(e) => setShareSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Penerangan Ringkas & Bukti Impak
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Sila nyatakan objektif amalan, cara pelaksanaan, dan pencapaian konkrit yang dicapai oleh sekolah..."
                    value={shareDesc}
                    onChange={(e) => setShareDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Hantar Cadangan ke Panel MPGBSIM</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Content Type: PRIVACY POLICY */}
        {content.type === 'privacy' && (
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4">
              Dasar Privasi & Perlindungan Data MPGBSIM
            </h3>
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM) komited untuk melindungi privasi dan keselamatan data peribadi Pengetua, Guru Besar, pentadbir, murid, serta pihak-pihak berkepentingan selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA) Malaysia.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">1. Pengumpulan Maklumat</h4>
              <p>
                Kami hanya mengumpul maklumat yang diserahkan secara sukarela oleh pihak sekolah atau Pengetua/Guru Besar semasa memohon keahlian, mendaftar ke konvensyen, atau menghantar maklum balas rasmi melalui portal ini.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">2. Penggunaan Data</h4>
              <p>
                Data yang dikumpul digunakan khusus untuk urusan pentadbiran keahlian, penyaluran pekeliling rasmi, jemputan persidangan, serta penerbitan statistik beragregat pendidikan Islam kebangsaan. Kami tidak akan menjual atau menyewakan data kepada pihak ketiga.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">3. Keselamatan & Seni Bina Awan</h4>
              <p>
                Sistem portal direka dengan protokol keselamatan ketat, bersedia untuk dihubungkan kepada pangkalan data awan berenkripsi (seperti Firebase Firestore & Authentication) bagi menjamin kerahsiaan data pentadbir sekolah.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">4. Pertanyaan Privasi</h4>
              <p>
                Untuk sebarang kemas kini atau pertanyaan berhubung dasar privasi, sila hubungi Urus Setia MPGBSIM di emel: <strong>mpgbsim.cemerlang@gmail.com</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Modal Bottom Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
