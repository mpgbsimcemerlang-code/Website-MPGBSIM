import React, { useState, useMemo } from 'react';
import { NewsItem } from '../types';
import { sortNewsByPublishedDate } from '../utils/dateUtils';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
  ChevronRight,
  Trophy,
  Award,
  Search,
  BookOpen,
  LayoutGrid,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Filter
} from 'lucide-react';

interface LatestNewsProps {
  newsList: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
  onOpenPortal?: () => void;
}

export const LatestNewsSection: React.FC<LatestNewsProps> = ({
  newsList,
  onSelectNews,
  onOpenPortal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isViewAll, setIsViewAll] = useState<boolean>(false);

  // Filter and sort items strictly according to published date (latest first)
  const filteredList = useMemo(() => {
    let list: NewsItem[] = [...newsList];

    // Filter by Category or School Achievement
    if (selectedFilter === 'kejayaan') {
      list = list.filter(
        (n) =>
          n.isSchoolAchievement ||
          n.category?.toLowerCase().includes('kejayaan') ||
          Boolean(n.schoolName)
      );
    } else if (selectedFilter !== 'semua') {
      list = list.filter(
        (n) => n.category?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Filter by Search Query (Title, Summary, Content, School, Author)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.summary?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q) ||
          n.schoolName?.toLowerCase().includes(q) ||
          n.author?.toLowerCase().includes(q) ||
          n.state?.toLowerCase().includes(q)
      );
    }

    // Sort all news according to published date in descending order
    return sortNewsByPublishedDate(list);
  }, [newsList, selectedFilter, searchQuery]);

  const schoolAchievementCount = useMemo(
    () =>
      newsList.filter(
        (n) => n.isSchoolAchievement || n.schoolName || n.category?.includes('Kejayaan')
      ).length,
    [newsList]
  );

  const featuredItem = filteredList.find((n) => n.featured) || filteredList[0];
  const regularItems = filteredList.filter((n) => n.id !== featuredItem?.id);

  // In compact view, show featured + first 4 regular items. In "Lihat Semua" view, show everything.
  const displayedRegularItems = isViewAll ? regularItems : regularItems.slice(0, 4);
  const hiddenCount = Math.max(0, regularItems.length - 4);

  return (
    <section id="berita" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-200">
              <Newspaper className="w-3.5 h-3.5 text-teal-700" />
              <span>Kenyataan, Warta & Kejayaan Sekolah</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Berita & Pengumuman Terkini
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mt-4 rounded-full" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Semua warta rasmi, aktiviti kepimpinan serta perkongsian berita kejayaan sekolah ahli boleh dibaca secara langsung di sini.
            </p>
            {onOpenPortal && (
              <button
                type="button"
                onClick={onOpenPortal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-slate-950" />
                <span>PGB: Hantar Berita Kejayaan</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tajuk berita, nama sekolah atau topik..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Kosongkan carian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick View Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden lg:inline">
              Memaparkan <strong className="text-slate-900">{filteredList.length}</strong> berita
            </span>

            <button
              type="button"
              onClick={() => setIsViewAll((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                isViewAll
                  ? 'bg-teal-800 text-white hover:bg-teal-900'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span>{isViewAll ? 'Paparan Pilihan' : `Lihat Semua (${filteredList.length})`}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedFilter('semua')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === 'semua'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Berita ({newsList.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('kejayaan')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === 'kejayaan'
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-700" />
            <span>🏆 Kejayaan Sekolah Ahli ({schoolAchievementCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('Kenyataan Media')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === 'Kenyataan Media'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kenyataan Media
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('Pendidikan')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === 'Pendidikan'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pendidikan
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('Aktiviti')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === 'Aktiviti'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aktiviti
          </button>
        </div>

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Tiada Berita Dijumpai</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tiada berita sepadan dengan carian "${searchQuery}". Sila cuba kata kunci lain.`
                : 'Belum ada berita dalam kategori ini.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
              >
                Kosongkan Carian
              </button>
            )}
          </div>
        )}

        {/* VIEW MODE 1: ALL NEWS GRID (When isViewAll is true) */}
        {isViewAll && filteredList.length > 0 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>Semua Berita & Pengumuman ({filteredList.length} Dihantar)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsViewAll(false)}
                className="text-xs font-bold text-teal-800 hover:text-teal-900 underline cursor-pointer"
              >
                Kembali ke Paparan Ringkas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((news) => (
                <article
                  key={news.id}
                  id={`all-news-card-${news.id}`}
                  onClick={() => onSelectNews(news)}
                  className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200 hover:border-teal-500/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <img
                        src={
                          news.imageUrl ||
                          'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800'
                        }
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-950/85 backdrop-blur-md text-amber-300 border border-white/20 shadow-xs">
                          {news.category}
                        </span>
                        {news.achievementLevel && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 shadow-xs">
                            {news.achievementLevel}
                          </span>
                        )}
                      </div>

                      {/* School Name Tag */}
                      {(news.schoolName || news.isSchoolAchievement) && (
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/20 text-[11px] font-bold text-amber-300">
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{news.schoolName || 'Sekolah Ahli MPGBSIM'}</span>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1 text-teal-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {news.date}
                        </span>
                        <span>•</span>
                        <span>{news.readTime}</span>
                        {news.state && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{news.state}</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug line-clamp-2 mb-2">
                        {news.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {news.summary}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate max-w-[170px]">
                      {news.author || 'Urus Setia'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-teal-800 group-hover:translate-x-1 transition-transform">
                      <span>Baca Berita</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Bottom Collapse Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsViewAll(false);
                  const el = document.getElementById('berita');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <ChevronUp className="w-4 h-4 text-teal-700" />
                <span>Tunjukkan Kurang (Kembali ke Ringkasan)</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: FEATURED + REGULAR COLUMNS (When isViewAll is false) */}
        {!isViewAll && filteredList.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Featured Large Card */}
              {featuredItem && (
                <div
                  id={`featured-news-${featuredItem.id}`}
                  className="lg:col-span-6 flex flex-col justify-between rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl group border border-slate-800 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-teal-500/50"
                  onClick={() => onSelectNews(featuredItem)}
                >
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-800">
                    <img
                      src={
                        featuredItem.imageUrl ||
                        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800'
                      }
                      alt={featuredItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                        {featuredItem.category}
                      </span>

                      {featuredItem.achievementLevel && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-900/90 text-teal-200 border border-teal-500/40 shadow-md backdrop-blur-xs">
                          Peringkat {featuredItem.achievementLevel}
                        </span>
                      )}
                    </div>

                    {/* School Badge Pill if school news */}
                    {(featuredItem.schoolName || featuredItem.isSchoolAchievement) && (
                      <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">
                          Kejayaan Sekolah Ahli: {featuredItem.schoolName || 'Sekolah Ahli MPGBSIM'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          {featuredItem.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {featuredItem.readTime}
                        </span>
                        {featuredItem.state && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold">
                            {featuredItem.state}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-teal-300 transition-colors leading-snug mb-3">
                        {featuredItem.title}
                      </h3>

                      <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                        {featuredItem.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span className="truncate max-w-[240px]">{featuredItem.author}</span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 group-hover:translate-x-1 transition-transform">
                        <span>Baca Penuh</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular News Items Column */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                {displayedRegularItems.map((news) => (
                  <div
                    key={news.id}
                    id={`news-card-${news.id}`}
                    onClick={() => onSelectNews(news)}
                    className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="sm:w-44 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-200 relative">
                      <img
                        src={
                          news.imageUrl ||
                          'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800'
                        }
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {news.category}
                      </span>

                      {news.achievementLevel && (
                        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 shadow-xs">
                          {news.achievementLevel}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        {/* School Name Tag if present */}
                        {(news.schoolName || news.isSchoolAchievement) && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 mb-1">
                            <Trophy className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{news.schoolName || 'Sekolah Ahli MPGBSIM'}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
                          <span className="flex items-center gap-1 font-semibold text-teal-700">
                            <Calendar className="w-3 h-3" />
                            {news.date}
                          </span>
                          <span>•</span>
                          <span>{news.readTime}</span>
                          {news.state && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">{news.state}</span>
                            </>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-900 transition-colors leading-snug line-clamp-2 mb-1.5">
                          {news.title}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {news.summary}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="truncate max-w-[180px]">{news.author}</span>
                        <span className="font-bold text-teal-800 inline-flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          <span>Baca Berita</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* "Lihat Semua Berita" Action Banner */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-teal-800/40">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Terdapat {filteredList.length} Berita & Warta Diterbitkan
                  </h4>
                  <p className="text-xs text-slate-300">
                    Semua berita kejayaan dan kenyataan rasmi sekolah ahli boleh diakses dan dibaca sepenuhnya.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsViewAll(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer shrink-0"
              >
                <span>Lihat Semua Berita ({filteredList.length})</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
