import React from 'react';
import {
  BookOpen,
  Target,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Building,
  GraduationCap,
  Edit3
} from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

export const Introduction: React.FC = () => {
  const { siteData, isAdmin, setIsCMSOpen } = useAdminContent();
  const branding = siteData?.branding || {
    orgName: 'Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia',
    shortName: 'MPGBSIM',
    motto: 'Memperkasa Kepimpinan Pendidikan, Membina Generasi Rabbani',
  };
  const visionMission = siteData?.visionMission || {
    strategicPlanTitle: 'Rangka Tindakan Strategik Kepimpinan Sekolah Islam Malaysia (2025–2030)',
    vision: 'Peneraju Kecemerlangan Kepimpinan Pendidikan Islam Bertaraf Antarabangsa',
    visionSub: 'Menjadikan institusi pendidikan Islam sebagai model pembinaan modal insan unggul yang mengintegrasikan ilmu naqli dan aqli berteraskan nilai ketuhanan.',
    missions: [
      'Membangunkan kapasiti kepimpinan berprestasi tinggi dalam kalangan Pengetua dan Guru Besar secara berterusan.',
      'Menyelaras dan memperkasakan standard kurikulum akademik, tahfiz, dan pembinaan sahsiah bertaraf kebangsaan serta global.',
      'Memperkukuhkan jaringan strategik, perkongsian pintar, dan penyelidikan amalan terbaik antara institusi pendidikan Islam.',
      'Mendaulatkan kebajikan, profesionalisme, serta hak institusi sekolah Islam melalui advokasi dasar yang berkesan.',
    ],
    introParagraph1: '',
    introParagraph2: '',
    introParagraph3: '',
    pillar1Title: 'Pembangunan Kepimpinan & Governan',
    pillar1Desc: 'Memantapkan kompetensi manajerial, kepimpinan instruksional, dan pematuhan tadbir urus berwibawa bagi semua pentadbir sekolah ahli.',
    pillar2Title: 'Integrasi Kurikulum & Ekosistem Rabbani',
    pillar2Desc: 'Membudayakan standard kecemerlangan akademik bersepadu tahfiz berpandukan kerangka aspirasi generasi Rabbani abad ke-21.',
  };

  return (
    <section id="tentang" className="py-20 bg-white border-b border-slate-200/80 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-5xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-200">
              <BookOpen className="w-3.5 h-3.5 text-teal-700" />
              <span>Pengenalan Rasmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tentang {branding.orgName}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mt-4 rounded-full" />
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsCMSOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition shadow-2xs self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Sunting Kandungan (CMS)</span>
            </button>
          )}
        </div>

        {/* Narrative & Institutional Profile */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5 text-slate-700 text-base leading-relaxed">
            <p className="font-medium text-slate-900 text-lg leading-relaxed">
              {visionMission.introParagraph1 || (
                <>
                  <strong className="text-teal-900 font-bold">{branding.shortName}</strong> merupakan badan jaringan kepimpinan profesional 
                  yang menghimpunkan para Pengetua dan Guru Besar institusi pendidikan Islam di seluruh Malaysia — 
                  merangkumi Sekolah Menengah Kebangsaan Agama (SMKA), Sekolah Agama Bantuan Kerajaan (SABK), 
                  Sekolah Islam Swasta berdaftar, serta institusi Tahfiz Integrasi.
                </>
              )}
            </p>

            <p>
              {visionMission.introParagraph2 || `Ditubuhkan atas kesedaran bahawa kejayaan kemenjadian murid bermula daripada keunggulan kepimpinan di bilik pengetua, MPGBSIM berperanan sebagai wahana musyawarah kebangsaan, perkongsian amalan terbaik pentadbiran, serta jambatan advokasi dasar antara para pengamal di lapangan dengan pihak kementerian dan badan berautoriti agama.`}
            </p>

            <p>
              {visionMission.introParagraph3 || (
                <>
                  Dengan moto keramat <em className="font-semibold text-slate-900">“{branding.motto}”</em>, 
                  kami komited melonjakkan taraf sekolah-sekolah Islam agar bukan sahaja cemerlang dalam kurikulum akademik dan hafazan Al-Quran, 
                  bahkan tangkas mendepani era kecerdasan buatan (AI) serta transformasi teknologi alaf baharu.
                </>
              )}
            </p>

            {/* Key Pillars */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{visionMission.pillar1Title || 'Kepimpinan Berintegriti'}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{visionMission.pillar1Desc || 'Tadbir urus telus berpandukan syariat dan etika perkhidmatan cemerlang.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{visionMission.pillar2Title || 'Generasi Rabbani'}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{visionMission.pillar2Desc || 'Melahirkan insan berilmu, bertakwa, berketrampilan dan berkebajikan tinggi.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vision & Mission Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tag Perancangan Strategik */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>{visionMission.strategicPlanTitle || 'Perancangan Strategik MPGBSIM 2026–2028'}</span>
            </div>

            {/* Vision Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-teal-300">
                <Eye className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-2.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Eye className="w-4 h-4" />
                <span>Visi MPGBSIM</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-snug">
                “{visionMission.vision}”
              </h3>
              <p className="text-xs text-teal-200/80 mt-2 font-medium">
                {visionMission.visionSub}
              </p>
            </div>

            {/* Mission Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm relative">
              <div className="flex items-center gap-2.5 text-teal-800 text-xs font-bold uppercase tracking-wider mb-4">
                <Target className="w-4 h-4 text-teal-600" />
                <span>Misi MPGBSIM</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-800">
                {visionMission.missions.map((missionText, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="font-medium leading-relaxed">
                      {missionText}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
