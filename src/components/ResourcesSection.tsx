import React, { useState } from 'react';
import { ResourceDocument } from '../types';
import {
  FileText,
  Download,
  FileCheck,
  Search,
  CheckCircle,
  ExternalLink,
  BookMarked
} from 'lucide-react';

interface ResourcesSectionProps {
  resources: ResourceDocument[];
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({ resources }) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownload = (doc: ResourceDocument) => {
    const targetDriveUrl =
      doc.driveUrl ||
      doc.fileUrl ||
      `https://drive.google.com/drive/folders/1MPGBSIM_Pusat_Sumber_2026_Storage_Link`;

    setDownloadNotice(`Membuka simpanan Google Drive: ${doc.title}`);

    // Open Google Drive link in new window/tab
    if (typeof window !== 'undefined') {
      window.open(targetDriveUrl, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      setDownloadNotice(null);
    }, 4000);
  };

  return (
    <section id="sumber" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-200">
              <BookMarked className="w-3.5 h-3.5 text-teal-700" />
              <span>Pusat Sumber & Muat Turun</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pekeliling, Dokumen & Modul Rasmi
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mt-4 rounded-full" />
          </div>
          <p className="mt-3 md:mt-0 text-sm text-slate-500 max-w-md">
            Rujukan komprehensif bagi memudahkan pengurusan pentadbiran harian, tadbir urus dan pematuhan standard sekolah Islam.
          </p>
        </div>

        {downloadNotice && (
          <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between text-xs sm:text-sm animate-fadeIn">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              {downloadNotice}
            </span>
            <span className="text-slate-400 text-xs">Fail contoh disediakan</span>
          </div>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((doc) => (
            <div
              key={doc.id}
              id={`resource-card-${doc.id}`}
              className="flex flex-col justify-between p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400/80 shadow-xs hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                    {doc.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {doc.publishedDate}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-teal-700 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <FileText className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-900 transition-colors leading-snug">
                      {doc.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {doc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span className="font-semibold text-slate-700">{doc.fileFormat} ({doc.fileSize})</span>
                  <span>•</span>
                  <span>{doc.downloads.toLocaleString()} muat turun</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
