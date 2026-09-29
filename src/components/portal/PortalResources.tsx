import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Video,
  FileText,
  Download,
  ExternalLink,
  Presentation,
  PlayCircle,
  Calendar,
  User,
} from 'lucide-react';
import { PortalResource } from '../../types';
import { useAdminContent } from '../../context/AdminContentContext';

export const PortalResources: React.FC = () => {
  const { siteData } = useAdminContent();
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const types = ['Semua', 'modul', 'artikel', 'template', 'video', 'webinar', 'presentation', 'Garis Panduan', 'Kertas Dasar', 'Pekeliling'];

  const resourcesData: PortalResource[] = [
    {
      id: 'res-1',
      title: 'Webinar Rakaman: Transformasi Kepimpinan Murabbi Era AI',
      type: 'webinar',
      category: 'Kepimpinan',
      description: 'Rakaman sesi perkongsian panel kepimpinan MPGBSIM bersama pakar teknologi universiti.',
      url: 'https://youtube.com',
      author: 'Biro Latihan & Akademik',
      date: '2026-08-20',
      fileSize: '58 minit',
    },
    {
      id: 'res-2',
      title: 'Modul Latihan Guru Asrama & Pengurusan Sahsiah Asnaf',
      type: 'modul',
      category: 'HEM & Tarbiah',
      description: 'Panduan lengkap latihan kemahiran mendengar, bimbingan kaunseling dan tarbiah murid.',
      url: '#',
      author: 'Biro Sahsiah & Disiplin',
      date: '2026-07-15',
      fileSize: '4.2 MB',
    },
    {
      id: 'res-3',
      title: 'Koleksi Slaid: Standard Kualiti Sekolah Islam (SKSI) 2026',
      type: 'presentation',
      category: 'Pentadbiran',
      description: 'Slaid pembentangan bengkel penarafan kualiti institusi dan instrumen semakan pengurusan.',
      url: '#',
      author: 'Unit Jaminan Kualiti',
      date: '2026-06-10',
      fileSize: '12 MB',
    },
    {
      id: 'res-4',
      title: 'Artikel: Mengukuhkan Ekosistem Wakaf Pendidikan di Malaysia',
      type: 'artikel',
      category: 'Kewangan',
      description: 'Analisis strategi pengumpulan dana wakaf produktif bagi sekolah-sekolah agama rakyat.',
      url: '#',
      author: 'Dr. Mohd Asri (Penasihat Kewangan)',
      date: '2026-05-30',
      fileSize: '5 halaman',
    },
    {
      id: 'res-5',
      title: 'Templat Excel: Perancangan Kewangan & Belanjawan Tahunan Sekolah',
      type: 'template',
      category: 'Kewangan',
      description: 'Format hamparan kerja Excel dengan formula siap bina untuk kiraan belanjawan sekolah.',
      url: '#',
      author: 'Biro Kewangan',
      date: '2026-04-12',
      fileSize: '850 KB',
    },
    {
      id: 'res-6',
      title: 'Video Demonstrasi: Penggunaan Alatan AI Penjana RPH Bahasa Arab',
      type: 'video',
      category: 'Kurikulum',
      description: 'Video panduan langkah demi langkah guru membina rancangan pengajaran harian.',
      url: 'https://youtube.com',
      author: 'Biro Transformasi Digital',
      date: '2026-09-05',
      fileSize: '14 minit',
    },
  ];

  // Combine siteData.resources (uploaded via website CMS) and portal digital resources
  const allResources: PortalResource[] = React.useMemo(() => {
    const list: PortalResource[] = [...resourcesData];
    (siteData.resources || []).forEach((r) => {
      if (!list.some((existing) => existing.id === r.id || existing.title.toLowerCase() === r.title.toLowerCase())) {
        list.push({
          id: r.id,
          title: r.title,
          type: (r.category?.toLowerCase().includes('modul')
            ? 'modul'
            : r.category?.toLowerCase().includes('pekeliling')
            ? 'artikel'
            : r.category?.toLowerCase().includes('garis panduan')
            ? 'template'
            : 'artikel') as any,
          category: r.category || 'Panduan Rasmi',
          description: r.description || 'Dokumen rujukan rasmi yang dimuat naik melalui sistem CMS MPGBSIM.',
          url: '#',
          author: 'Sekretariat Utama MPGBSIM',
          date: r.publishedDate || '2026',
          fileSize: r.fileSize || '2.8 MB',
        });
      }
    });
    return list;
  }, [siteData.resources]);

  const filteredResources = allResources.filter((item) => {
    const matchType =
      selectedType === 'Semua' ||
      item.type.toLowerCase() === selectedType.toLowerCase() ||
      item.category.toLowerCase().includes(selectedType.toLowerCase());
    const matchQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchQuery;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'webinar':
        return <Video className="w-4 h-4 text-rose-600" />;
      case 'presentation':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'template':
        return <FileText className="w-4 h-4 text-teal-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Pusat Bahan Ilmiah & Media
          </div>
          <h1 className="text-2xl font-black text-slate-900">Pusat Sumber & Bahan Digital (Resource Centre)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Artikel ilmiah, rakaman webinar, modul panduan, templat perancangan dan video latihan kepimpinan.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  selectedType === t
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tajuk sumber..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  {getTypeIcon(res.type)}
                  {res.type}
                </span>
                <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                  {res.category}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">{res.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{res.description}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] truncate max-w-[120px]">Oleh: {res.author}</span>
              <button
                onClick={() => alert(`Membuka sumber: ${res.title}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
              >
                {res.type === 'video' || res.type === 'webinar' ? (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" /> Tonton
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Akses
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
