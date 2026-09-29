import React, { useState, useRef } from 'react';
import {
  Trophy,
  Sparkles,
  Globe,
  Send,
  Eye,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
  Building,
  Image as ImageIcon,
  AlertCircle,
  FileText,
  Edit3,
  Trash2,
  ExternalLink,
  ChevronRight,
  Layers,
  HelpCircle,
  Check,
  Award,
  Radio,
  Tag,
  Share2,
  Upload,
  Camera,
  RefreshCw,
  X
} from 'lucide-react';
import { useMemberPortal } from '../../context/MemberPortalContext';
import { useAdminContent } from '../../context/AdminContentContext';
import { NewsItem } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  sortNewsByPublishedDate,
  toInputDateFormat,
  formatToMalayDate,
} from '../../utils/dateUtils';

// Preset HD Images for quick selection by PGB
const PRESET_NEWS_IMAGES = [
  {
    label: 'Robotik & STEM Antarabangsa',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
    desc: 'Murid menyertai pertandingan robotik & inovasi teknologi'
  },
  {
    label: 'Tahfiz, Hafazan & Tilawah',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1000&q=80',
    desc: 'Majlis khatam hafazan dan pertandingan musabaqah Al-Quran'
  },
  {
    label: 'Juara Sukan & Memanah Tradisional',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',
    desc: 'Kejuaraan memanah berkuda, silat dan sukan kebangsaan'
  },
  {
    label: 'Kecemerlangan Akademik & SPM/STAM',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    desc: 'Keputusan cemerlang dan majlis graduasi para murid'
  },
  {
    label: 'Pentas Anugerah & Piala Kejayaan',
    url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1000&q=80',
    desc: 'Penerimaan piala, pingat dan sijil penghargaan kepimpinan'
  },
  {
    label: 'Aktiviti Kepimpinan & Sahsiah',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
    desc: 'Kem kepimpinan murid dan jalinan ukhuwah sekolah Islam'
  },
];

export const PortalSchoolNewsSubmit: React.FC = () => {
  const {
    currentUser,
    submitSchoolNews,
    updateSchoolNews,
    deleteSchoolNews,
    schoolNews,
    setViewMode,
  } = useMemberPortal();

  const { siteData } = useAdminContent();

  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // Form State
  const [title, setTitle] = useState('');
  const [achievementLevel, setAchievementLevel] = useState<string>('Kebangsaan');
  const [category, setCategory] = useState<string>('Kejayaan Sekolah');
  const [publishedDate, setPublishedDate] = useState<string>(() => formatToMalayDate(new Date()));
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_NEWS_IMAGES[0].url);
  const [uploadedImageDetails, setUploadedImageDetails] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishDirectly, setPublishDirectly] = useState(true);

  // Edit Mode State
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ title: string; id: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // In-App Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Combine news from live website context and portal context to accurately identify this school's items
  const allAvailableNews = React.useMemo(() => {
    const map = new Map<string, NewsItem>();
    (siteData.news || []).forEach((n) => map.set(n.id, n));
    (schoolNews || []).forEach((n) => map.set(n.id, n));
    return Array.from(map.values());
  }, [siteData.news, schoolNews]);

  // Filter news belonging to the current school/PGB, sorted by published date (latest first)
  const mySchoolNews = React.useMemo(() => {
    const filtered = allAvailableNews.filter((n) => {
      if (currentUser?.email && n.submittedBy === currentUser.email) return true;
      if (currentUser?.school && n.schoolName && n.schoolName.toLowerCase().trim() === currentUser.school.toLowerCase().trim()) return true;
      if (currentUser?.membershipNo && n.schoolCode && currentUser.membershipNo.includes(n.schoolCode)) return true;
      return false;
    });
    return sortNewsByPublishedDate(filtered);
  }, [allAvailableNews, currentUser]);

  const schoolName = currentUser?.school || 'Sekolah Ahli MPGBSIM';
  const schoolCode = currentUser?.membershipNo || 'MPGB-AHLI';
  const pgbName = currentUser?.fullName || 'Pengetua / Guru Besar';
  const pgbState = currentUser?.state || 'Malaysia';

  // Fast Fill Template Generator
  const applyTemplate = (type: 'robotik' | 'akademik' | 'sukan') => {
    if (type === 'robotik') {
      setTitle(`Kejayaan Gemilang ${schoolName} Merangkul Tempat Pertama Pertandingan Inovasi & Robotik 2026`);
      setAchievementLevel('Kebangsaan');
      setCategory('Robotik, STEM & Digital');
      setSummary(`Pasukan inovasi murid ${schoolName} berjaya mengharumkan nama institusi dengan merangkul pingat emas dalam kejohanan reka cipta teknologi dan kecerdasan buatan peringkat kebangsaan.`);
      setContent(
        `Alhamdulillah, warga ${schoolName} meraikan detik bersejarah apabila pasukan murid sekolah berjaya merangkul johan dalam Pertandingan Inovasi & Robotik Sekolah-Sekolah Malaysia 2026.\n\n` +
        `Pencapaian ini adalah hasil kegigihan para murid di bawah bimbingan guru penasihat STEM yang komited meluangkan masa membina model prototaip pintar berasaskan automasi lestari.\n\n` +
        `"Kejayaan ini membuktikan murid-murid sekolah Islam berupaya bersaing dan mendahului dalam bidang sains teknologi, mengintegrasikan adab, kefahaman syariah dan kehebatan daya cipta," ulas ${pgbName}.\n\n` +
        `Pihak pentadbiran ${schoolName} merakamkan setinggi-tinggi tahniah kepada para pemenang, barisan guru pembimbing, dan ibu bapa atas sokongan padu yang berterusan.`
      );
      setImageUrl(PRESET_NEWS_IMAGES[0].url);
    } else if (type === 'akademik') {
      setTitle(`${schoolName} Catat Peningkatan Gred Purata & 100% Lulus Tahfiz Serta Peperiksaan Utama`);
      setAchievementLevel('Negeri');
      setCategory('Kejayaan Akademik & Tahfiz');
      setSummary(`Keputusan rasmi terkini menyaksikan lonjakan kualiti akademik dan pencapaian cemerlang murid ${schoolName} dengan rekod kelulusan syahadah tahfiz yang membanggakan.`);
      setContent(
        `Majlis Pengetua Guru Besar Sekolah Islam Malaysia (MPGBSIM) mengucapkan setinggi-tinggi tahniah kepada ${schoolName} atas keputusan cemerlang yang dicatatkan dalam penilaian akademik dan pentaksiran tahfiz baru-baru ini.\n\n` +
        `Seramai 45 orang murid berjaya menyempurnakan hafazan mengikut sukatan kurikulum bersepadu dengan gred Mumtaz, di samping peningkatan ketara pada Gred Purata Sekolah (GPS).\n\n` +
        `Kejayaan ini mencerminkan keberkesanan modul bimbingan rohani dan disiplin hafazan yang digarap secara sistematik oleh saf tenaga pengajar ${schoolName}.\n\n` +
        `Semoga kecemerlangan ini menjadi penyuntik semangat kepada seluruh warga sekolah untuk terus melahirkan generasi huffaz yang berwibawa, berakhlak mulia dan cemerlang ilmu.`
      );
      setImageUrl(PRESET_NEWS_IMAGES[1].url);
    } else if (type === 'sukan') {
      setTitle(`Kontinjen ${schoolName} Dominasi Kejohanan Sukan Memanah & Seni Silat Sekolah Islam`);
      setAchievementLevel('Kebangsaan');
      setCategory('Kokurikulum & Sukan');
      setSummary(`Atlet murid ${schoolName} berjaya membawa pulang 4 pingat emas dan piala pusingan dalam kejohanan sukan sunnah dan silat peringkat kebangsaan.`);
      setContent(
        `Kontinjen sukan ${schoolName} telah melakarkan kejayaan manis apabila berjaya membawa pulang 4 pingat emas dan dinobatkan sebagai Juara Keseluruhan dalam Kejohanan Sukan Sunnah & Seni Memanah Tradisional 2026.\n\n` +
        `Para atlet mempamerkan disiplin tinggi, fokus jitu dan semangat kesukanan yang terpuji sepanjang berlangsungnya kejohanan tersebut.\n\n` +
        `"Aktiviti sukan sunnah ini bukan sahaja melatih ketangkasan fizikal malah membentuk ketenangan emosi dan sahsiah kepimpinan yang kukuh dalam jiwa anak-anak murid," kata ${pgbName}.\n\n` +
        `Syabas dan tahniah diucapkan kepada semua atlet, jurulatih, dan warga ${schoolName}!`
      );
      setImageUrl(PRESET_NEWS_IMAGES[2].url);
    }
  };

  const handleProcessFile = async (file: File) => {
    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Sila pilih fail format imej yang sah (JPG, PNG, WebP, GIF, HEIC).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setImageError('Saiz fail melebihi had 15MB. Sila pilih foto yang lebih kecil.');
      return;
    }

    setIsUploadingImage(true);
    try {
      // Compress to optimal WebP/JPEG data URL for ultra-fast loading & storage
      const compressedDataUrl = await compressImageFile(file, 1280, 1280, 0.82);
      setImageUrl(compressedDataUrl);
      const estSizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);
      setUploadedImageDetails({
        name: file.name,
        size: `${estSizeKb} KB (Dioptimumkan)`,
      });
    } catch (err) {
      // Fallback: direct FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUrl(result);
        setUploadedImageDetails({
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setUploadedImageDetails(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartEdit = (news: NewsItem) => {
    setEditingNewsId(news.id);
    setTitle(news.title);
    setAchievementLevel(news.achievementLevel || 'Kebangsaan');
    setCategory(news.category || 'Kejayaan Sekolah');
    setPublishedDate(news.date || formatToMalayDate(new Date()));
    setSummary(news.summary);
    setContent(news.content);
    setImageUrl(news.imageUrl || PRESET_NEWS_IMAGES[0].url);
    if (news.imageUrl?.startsWith('data:')) {
      setUploadedImageDetails({ name: 'Foto Dimuat Naik Sebelumnya', size: 'Sedia' });
    } else {
      setUploadedImageDetails(null);
    }
    setIsFeatured(Boolean(news.featured));
    setPublishDirectly(news.status !== 'draft');
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingNewsId(null);
    setTitle('');
    setPublishedDate(formatToMalayDate(new Date()));
    setSummary('');
    setContent('');
    setImageUrl(PRESET_NEWS_IMAGES[0].url);
    setUploadedImageDetails(null);
    setImageError('');
    setIsFeatured(false);
    setPublishDirectly(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Sila masukkan tajuk berita kejayaan sekolah anda.');
      return;
    }
    if (!summary.trim()) {
      setErrorMessage('Sila masukkan ringkasan padat berita (1-2 ayat).');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Sila masukkan kandungan lengkap berita pencapaian.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingNewsId) {
        // Update existing news
        await updateSchoolNews(editingNewsId, {
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          category,
          achievementLevel,
          imageUrl: imageUrl.trim() || PRESET_NEWS_IMAGES[0].url,
          featured: isFeatured,
          status: publishDirectly ? 'published' : 'draft',
          schoolName,
          schoolCode,
          state: pgbState,
          date: publishedDate.trim() || formatToMalayDate(new Date()),
          updatedAt: new Date().toISOString(),
        });

        setSuccessInfo({ title: title.trim(), id: editingNewsId });
        setShowSuccessBanner(true);
        handleCancelEdit();
      } else {
        // Submit brand-new news published directly to website
        const createdItem = await submitSchoolNews({
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          category,
          achievementLevel,
          imageUrl: imageUrl.trim() || PRESET_NEWS_IMAGES[0].url,
          featured: isFeatured,
          status: publishDirectly ? 'published' : 'draft',
          schoolName,
          schoolCode,
          state: pgbState,
          date: publishedDate.trim() || formatToMalayDate(new Date()),
        });

        setSuccessInfo({ title: createdItem.title, id: createdItem.id });
        setShowSuccessBanner(true);

        // Reset form
        setTitle('');
        setSummary('');
        setContent('');
        setImageUrl(PRESET_NEWS_IMAGES[0].url);
        setUploadedImageDetails(null);
        setImageError('');
        setIsFeatured(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Ralat ketika menghantar berita sekolah:', err);
      setErrorMessage(
        'Berlaku masalah ketika menghantar berita ke pelayan. Sila cuba sebentar lagi atau pastikan sambungan internet anda stabil.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, itemTitle: string) => {
    setItemToDelete({ id, title: itemTitle });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSchoolNews(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error('Gagal memadamkan berita:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Banner: Real-time Live Sync Indicator */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-teal-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3 backdrop-blur-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span>Siaran Langsung Ke Laman Utama Rasmi MPGBSIM</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
              <span>Hantar Berita Kejayaan Sekolah PGB</span>
            </h1>

            <p className="mt-2 text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              Ruang khas bagi para Pengetua & Guru Besar (PGB) berkongsi pencapaian murid, anugerah sekolah, dan kejayaan institusi masing-masing. Berita yang disiarkan akan terpapar secara langsung di bahagian <strong className="text-amber-300">Berita & Pengumuman Terkini</strong> laman utama MPGBSIM.
            </p>
          </div>

          {/* School Badge Summary */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 sm:min-w-[280px]">
            <div className="text-[11px] text-teal-200 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>Institusi Pelapor (PGB)</span>
            </div>
            <p className="text-sm font-bold text-white leading-snug truncate">{schoolName}</p>
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-teal-100">
              <span>{pgbName}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
                {pgbState}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {showSuccessBanner && successInfo && (
        <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-500 p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-950">
                Alhamdulillah! Berita Kejayaan Berjaya Disiarkan Secara Langsung!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                Berita <span className="font-bold">"{successInfo.title}"</span> kini sedang dipaparkan di laman utama portal MPGBSIM. Semua pelawat dan rakan PGB di seluruh Malaysia boleh membacanya sekarang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setViewMode('public');
                setTimeout(() => {
                  const el = document.getElementById('berita');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>Lihat di Laman Utama</span>
            </button>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="px-3 py-2.5 rounded-xl bg-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-300"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setActiveTab('create');
              if (!editingNewsId) handleCancelEdit();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>{editingNewsId ? 'Sunting Berita Kejayaan' : 'Borang Berita Baharu'}</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'manage'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-teal-500" />
            <span>Senarai Berita Sekolah Saya ({mySchoolNews.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            setViewMode('public');
            setTimeout(() => {
              const el = document.getElementById('berita');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Laman Web Utama MPGBSIM</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* VIEW 1: CREATE / EDIT FORM WITH LIVE PREVIEW */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form (8 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editingNewsId ? 'Kemaskini Berita Kejayaan Sekolah' : 'Maklumat Berita Kejayaan Sekolah'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isikan butiran di bawah. Maklumat akan dipaparkan secara langsung ke website setelah disiarkan.
                </p>
              </div>

              {editingNewsId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Batal Sunting
                </button>
              )}
            </div>

            {/* Quick Templates Buttons */}
            {!editingNewsId && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Templat Pantas PGB (Pilih untuk isi draf secara automatik):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate('robotik')}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 shadow-xs transition-colors"
                  >
                    🤖 Robotik & STEM
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('akademik')}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 shadow-xs transition-colors"
                  >
                    📖 Tahfiz & Akademik
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('sukan')}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-amber-100 text-xs font-bold border border-amber-200 shadow-xs transition-colors"
                  >
                    🏹 Sukan Sunnah & Memanah
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tajuk Berita */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tajuk Berita Kejayaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: SRI Musleh Melaka Merangkul Johan Pertandingan Robotik Antarabangsa 2026"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                  required
                />
              </div>

              {/* Peringkat Kejayaan & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Peringkat Kejayaan
                  </label>
                  <select
                    value={achievementLevel}
                    onChange={(e) => setAchievementLevel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 bg-white text-xs sm:text-sm font-medium text-slate-800"
                  >
                    <option value="Antarabangsa">Peringkat Antarabangsa</option>
                    <option value="Kebangsaan">Peringkat Kebangsaan</option>
                    <option value="Negeri">Peringkat Negeri</option>
                    <option value="Daerah">Peringkat Daerah</option>
                    <option value="Institusi">Peringkat Institusi & Komuniti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kategori Berita
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 bg-white text-xs sm:text-sm font-medium text-slate-800"
                  >
                    <option value="Kejayaan Sekolah">Kejayaan Sekolah</option>
                    <option value="Robotik, STEM & Digital">Robotik, STEM & Digital</option>
                    <option value="Kejayaan Akademik & Tahfiz">Kejayaan Akademik & Tahfiz</option>
                    <option value="Kokurikulum & Sukan">Kokurikulum & Sukan</option>
                    <option value="Kepimpinan & Tarbiah">Kepimpinan & Tarbiah</option>
                    <option value="Anugerah Khas & Pengiktirafan">Anugerah Khas & Pengiktirafan</option>
                  </select>
                </div>
              </div>

              {/* Tarikh Siaran Berita / Diterbitkan (Published Date) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 via-emerald-50/50 to-slate-50 border border-teal-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    <span>Tarikh Siaran / Diterbitkan (Published Date)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full border border-teal-300 flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3 text-teal-700" />
                    <span>Disusun mengikut tarikh terkini di laman web</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pilih Tarikh Kalendar:
                    </label>
                    <input
                      type="date"
                      required
                      value={toInputDateFormat(publishedDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setPublishedDate(formatToMalayDate(e.target.value));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 bg-white text-xs sm:text-sm font-bold text-slate-900 shadow-2xs cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-6 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Format Tarikh Dipaparkan di Laman Web:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-xl bg-white border border-teal-200 text-xs font-bold text-teal-950 shadow-2xs truncate flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{publishedDate}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPublishedDate(formatToMalayDate(new Date()))}
                          className="px-2.5 py-2 rounded-xl bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          title="Set tarikh ke hari ini"
                        >
                          Hari Ini
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const y = new Date();
                            y.setDate(y.getDate() - 1);
                            setPublishedDate(formatToMalayDate(y));
                          }}
                          className="px-2.5 py-2 rounded-xl bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          title="Set tarikh ke semalam"
                        >
                          Semalam
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-0.5">
                  * Anda boleh memilih tarikh kejadian kejayaan atau tarikh hari ini bagi menyusun turutan berita di laman web rasmi MPGBSIM.
                </p>
              </div>

              {/* Ringkasan Berita (Teaser) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ringkasan Berita (Lead / Teaser Kad Muka Depan) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">1 - 3 ayat ringkas</span>
                </div>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Ringkasan padat pencapaian yang akan dipaparkan pada kad hadapan di laman utama MPGBSIM..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Kandungan Penuh Berita */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kandungan Penuh Berita Kejayaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={7}
                  placeholder="Tulis butiran lanjut pencapaian: nama pemenang/peserta, nama guru pembimbing, ulasan Pengetua/Guru Besar, impak kejayaan kepada sekolah dan kata-kata inspirasi..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed font-sans"
                  required
                />
              </div>

              {/* Pilihan Gambar Kejayaan - Dedicated Upload Button (No URL) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Foto / Gambar Kejayaan Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Muat Naik Terus Dari Peranti (Tanpa URL)</span>
                  </span>
                </div>

                {/* Hidden File Input for Device/Phone/Computer Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Upload Status & Preview Card */}
                {imageUrl && (uploadedImageDetails || imageUrl.startsWith('data:')) ? (
                  /* State: User has uploaded custom photo */
                  <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/50 p-4 transition-all shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {/* Thumbnail Preview */}
                      <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-900 border border-emerald-300 shadow-md shrink-0">
                        <img
                          src={imageUrl || PRESET_NEWS_IMAGES[0].url}
                          alt="Foto dimuat naik"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-600 text-white shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Details & Actions */}
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold mb-1.5 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Foto Berjaya Dimuat Naik & Sedia Disiarkan</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate" title={uploadedImageDetails?.name || 'Foto Sekolah'}>
                          {uploadedImageDetails?.name || 'Foto Kejayaan Sekolah'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {uploadedImageDetails?.size ? `Saiz Fail: ${uploadedImageDetails.size}` : 'Imej dioptimumkan untuk kelajuan web'}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5 text-teal-700" />
                            <span>Tukar Foto Lain</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Padam Foto</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* State: Primary Upload Area */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-2xl border-2 border-dashed p-6 transition-all text-center ${
                      isDragging
                        ? 'border-teal-600 bg-teal-50/90 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50/80 hover:bg-slate-50 hover:border-teal-500'
                    }`}
                  >
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3 shadow-inner">
                        {isUploadingImage ? (
                          <RefreshCw className="w-7 h-7 animate-spin text-teal-700" />
                        ) : (
                          <Upload className="w-7 h-7 text-teal-700" />
                        )}
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900">
                        {isUploadingImage
                          ? 'Sedang Memproses & Mengoptimumkan Foto...'
                          : 'Muat Naik Foto / Gambar Kejayaan'}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Pilih foto aktiviti atau murid cemerlang terus dari telefon atau komputer anda.
                      </p>

                      <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Pilih & Muat Naik Foto Dari Peranti</span>
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-2.5">
                        Menyokong format JPG, PNG, WebP (Dioptimumkan secara automatik untuk pemuatan laju)
                      </p>
                    </div>
                  </div>
                )}

                {imageError && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{imageError}</span>
                  </p>
                )}

                {/* Preset HD Image Gallery Selection (Optional Alternative) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600">
                      Atau pilih daripada foto contoh resolusi tinggi galeri:
                    </span>
                    {imageUrl && !uploadedImageDetails && !imageUrl.startsWith('data:') && (
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                        Foto dipilih daripada galeri
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_NEWS_IMAGES.map((img, idx) => {
                      const isSelected = imageUrl === img.url && !uploadedImageDetails && !imageUrl.startsWith('data:');
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setImageUrl(img.url);
                            setUploadedImageDetails(null);
                          }}
                          className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all ${
                            isSelected
                              ? 'border-teal-600 ring-2 ring-teal-200'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            className="w-full h-14 sm:h-16 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="p-1 bg-slate-900/80 text-white text-[9px] font-bold truncate">
                            {img.label}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-teal-600 text-white shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Toggle Options */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/60 border border-teal-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishDirectly}
                    onChange={(e) => setPublishDirectly(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-teal-950 block">
                      Siarkan Terus Ke Laman Web MPGBSIM (Secara Langsung)
                    </span>
                    <span className="text-[11px] text-teal-700 block">
                      Berita akan serta-merta terpapar di seksyen Berita laman utama sebaik sahaja disimpan.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Cadangkan Sebagai Berita Pilihan Utama (Featured)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Akan dipaparkan pada kad besar di muka depan laman web jika dipilih.
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                >
                  Set Semula
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Sedang Memproses...'
                      : editingNewsId
                      ? 'Simpan Perubahan Berita'
                      : publishDirectly
                      ? 'Siarkan Ke Laman Utama Secara Langsung'
                      : 'Simpan Sebagai Deraf'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-teal-600" />
                  <span>Pratonton Langsung di Laman Web</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Preview
                </span>
              </div>

              {/* Simulated Card on Website */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={imageUrl || PRESET_NEWS_IMAGES[0].url}
                    alt={title || 'Pratonton Berita'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md">
                    {category}
                  </span>

                  {/* Achievement Level Pill */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-900/90 text-teal-200 border border-teal-500/40 backdrop-blur-xs">
                    {achievementLevel}
                  </span>

                  {/* School Badge Pill on bottom of image */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5 text-xs text-white">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-bold truncate text-teal-100">{schoolName}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      {publishedDate || formatToMalayDate(new Date())}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      3 min bacaan
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2 line-clamp-2">
                    {title || 'Tajuk Berita Kejayaan Sekolah Anda Akan Muncul Di Sini...'}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {summary ||
                      'Ringkasan berita akan dipaparkan di sini untuk pembaca di laman utama MPGBSIM sebelum membaca laporan penuh...'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[170px] flex items-center gap-1 font-semibold text-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      {pgbName}
                    </span>

                    <span className="font-bold text-teal-700 inline-flex items-center gap-1">
                      <span>Baca Penuh</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Petua Penerbitan Berita Berimpak Tinggi</span>
                </div>
                <p>
                  • Sertakan nama pelajar/guru pembimbing agar jasa mereka mendapat penghargaan rasmi institusi.
                </p>
                <p>
                  • Muat naik gambar berorientasi landskap untuk paparan visual yang tajam dan kemas di telefon pintar dan komputer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MANAGE ALL MY SUBMITTED NEWS */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Pengurusan Berita Kejayaan {schoolName}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Senarai semua berita pencapaian yang telah disiarkan atau disimpan oleh institusi anda.
                </p>
              </div>

              <button
                onClick={() => {
                  handleCancelEdit();
                  setActiveTab('create');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-colors shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                <span>+ Masukkan Berita Baharu</span>
              </button>
            </div>

            {mySchoolNews.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Belum Ada Berita Kejayaan Dihantar
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                  Sekolah anda belum menghantar sebarang berita kejayaan. Klik butang di bawah untuk memasukkan kejayaan pertama sekolah anda!
                </p>
                <button
                  onClick={() => {
                    handleCancelEdit();
                    setActiveTab('create');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Masukkan Berita Sekarang
                </button>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-slate-100">
                {mySchoolNews.map((news) => (
                  <div
                    key={news.id}
                    className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-24 h-18 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative">
                        <img
                          src={news.imageUrl || PRESET_NEWS_IMAGES[0].url}
                          alt={news.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/80 text-white">
                          {news.achievementLevel || 'Sekolah'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {news.category}
                          </span>

                          {news.status === 'published' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Disiarkan Secara Langsung
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                              Deraf
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">• {news.date}</span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1">
                          {news.title}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {news.summary}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      <button
                        onClick={() => {
                          setViewMode('public');
                          setTimeout(() => {
                            const el = document.getElementById('berita');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold border border-teal-200 transition-colors"
                        title="Lihat di Laman Utama"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Laman Utama</span>
                      </button>

                      <button
                        onClick={() => handleStartEdit(news)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Sunting</span>
                      </button>

                      <button
                        onClick={() => handleDelete(news.id, news.title)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Padam</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal for School News */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900">Padam Berita Kejayaan?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Adakah anda pasti ingin memadamkan berita kejayaan sekolah ini daripada laman web rasmi MPGBSIM?
            </p>

            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs font-bold text-slate-900 line-clamp-2">
                {itemToDelete.title}
              </p>
            </div>

            <p className="text-[11px] text-rose-600 font-semibold">
              Amaran: Berita ini akan ditarik balik daripada paparan umum serta-merta.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sedang Memadam...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Sahkan Padam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
