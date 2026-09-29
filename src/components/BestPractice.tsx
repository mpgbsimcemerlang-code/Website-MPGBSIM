import React, { useState } from 'react';
import { BestPracticeItem } from '../types';
import {
  Award,
  BookOpen,
  MapPin,
  TrendingUp,
  User,
  ArrowUpRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface BestPracticeProps {
  practices: BestPracticeItem[];
  onSelectPractice: (practice: BestPracticeItem) => void;
  onRequestShare: () => void;
}

export const BestPracticeSection: React.FC<BestPracticeProps> = ({
  practices,
  onSelectPractice,
  onRequestShare
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', 'Tahfiz & Kurikulum', 'Kepimpinan Digital', 'Pembangunan Sahsiah', 'Kelestarian & Wakaf'];

  const filteredPractices = selectedCategory === 'Semua'
    ? practices
    : practices.filter((p) => p.category === selectedCategory);

  return (
    <section id="best-practice" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-100/70 text-teal-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5 text-teal-700" />
              <span>Pusat Perkongsian Ilmu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Amalan Terbaik Sekolah-Sekolah Islam
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mt-4 rounded-full" />
          </div>

          <div className="mt-4 md:mt-0">
            <button
              type="button"
              onClick={onRequestShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-teal-300" />
              <span>Hantar Amalan Terbaik Sekolah Anda</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none text-xs">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 mr-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Best Practice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPractices.map((bp) => (
            <div
              key={bp.id}
              id={`best-practice-card-${bp.id}`}
              className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/60 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                    {bp.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Tahun {bp.year}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug mb-2">
                  {bp.title}
                </h3>

                {/* School & State */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    {bp.schoolName}, {bp.state}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {bp.leadPerson}
                  </span>
                </div>

                {/* Impact Highlight Box */}
                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-950 mb-4">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900 mb-1">
                    <TrendingUp className="w-4 h-4 text-teal-700" />
                    <span>Impak & Hasil Kejayaan:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {bp.impactSummary}
                  </p>
                </div>

                {/* Key Outcomes Checklist */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-2">
                  {bp.keyOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Kategori: <strong className="text-slate-700">{bp.category}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => onSelectPractice(bp)}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer group-hover:translate-x-0.5"
                >
                  <span>Lihat Kajian Kes</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
