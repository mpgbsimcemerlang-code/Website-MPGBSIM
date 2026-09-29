import React, { useState } from 'react';
import { MediaItem } from '../types';
import {
  Image as ImageIcon,
  Video,
  Play,
  Calendar,
  MapPin,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';

interface MediaSectionProps {
  mediaList: MediaItem[];
}

export const MediaSection: React.FC<MediaSectionProps> = ({ mediaList }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const filteredMedia = activeFilter === 'all'
    ? mediaList
    : mediaList.filter((m) => m.type === activeFilter);

  return (
    <section id="media" className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-950 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-800">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Galeri & Multimedia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Sorotan Media MPGBSIM
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-amber-400 mt-4 rounded-full" />
          </div>

          {/* Filter Tabs */}
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Media
            </button>
            <button
              onClick={() => setActiveFilter('photo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'photo' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Foto</span>
            </button>
            <button
              onClick={() => setActiveFilter('video')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'video' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              id={`media-item-${item.id}`}
              onClick={() => setSelectedMedia(item)}
              className="group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                  loading="lazy"
                />

                {/* Video Play Overlay Badge */}
                {item.type === 'video' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-950/70 backdrop-blur-xs text-teal-300">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                )}

                <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs">
                  {item.type === 'video' ? 'Video Liputan' : 'Galeri Foto'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2 leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {item.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-400" />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {item.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Media Preview Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-800 text-teal-200">
                    {selectedMedia.type === 'video' ? 'Tayangan Video' : 'Paparan Foto'}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate max-w-md">
                    {selectedMedia.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                {selectedMedia.type === 'video' ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-2">
                      Siaran Liputan Rasmi MPGBSIM
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      Video dokumentasi acara kepimpinan disediakan oleh Urus Setia Komunikasi Media MPGBSIM.
                    </p>
                    <a
                      href={selectedMedia.videoUrl || 'https://youtube.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-colors"
                    >
                      <span>Tonton di Saluran Rasmi YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <img
                    src={selectedMedia.thumbnailUrl || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600'}
                    alt={selectedMedia.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
                <p className="text-sm font-medium text-white mb-1">{selectedMedia.title}</p>
                <p className="text-slate-400">{selectedMedia.caption}</p>
                <div className="mt-2 flex items-center gap-4 text-slate-500">
                  <span>Lokasi: {selectedMedia.location}</span>
                  <span>•</span>
                  <span>Tarikh: {selectedMedia.date}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
