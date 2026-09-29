import React from 'react';
import { LeaderProfile } from '../types';
import { Award, UserCheck, MapPin, Building, Edit3, Shield } from 'lucide-react';
import { useAdminContent } from '../context/AdminContentContext';

interface LeadershipSectionProps {
  leaders: LeaderProfile[];
}

export const LeadershipSection: React.FC<LeadershipSectionProps> = ({ leaders }) => {
  const { isAdmin, setIsCMSOpen } = useAdminContent();

  return (
    <section id="kepimpinan" className="py-20 bg-slate-50/60 border-b border-slate-200 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-teal-200">
            <UserCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Saf Kepimpinan Nasional</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Barisan Kepimpinan Tertinggi MPGBSIM
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Diterajui oleh tokoh-tokoh pentadbir dan pendidik berwibawa yang beriltizam memajukan institusi pendidikan Islam kebangsaan.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mx-auto mt-4 rounded-full" />

          {/* Admin Quick Action */}
          {isAdmin && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsCMSOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold hover:bg-amber-100 transition shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                <span>Urus Saf Kepimpinan Dalam CMS ({leaders.length} Tokoh)</span>
              </button>
            </div>
          )}
        </div>

        {/* Leadership Grid with Large Clear Portrait Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              id={`leader-card-${leader.id}`}
              className="flex flex-col justify-between rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-500/70 transition-all duration-300 overflow-hidden group"
            >
              <div>
                {/* Large Portrait Photo Container - Wajah Tokoh Jelas Dilihat */}
                <div className="relative w-full aspect-[4/5] sm:h-88 bg-gradient-to-b from-slate-100 via-teal-950/5 to-slate-200 overflow-hidden">
                  <img
                    src={leader.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'}
                    alt={leader.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  {/* Subtle Gradient Vignette at Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10 pointer-events-none" />

                  {/* Top Badge */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>MPGBSIM</span>
                  </div>

                  {/* Role Floating Badge on Photo */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5">
                    <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-teal-900/95 text-amber-300 border border-amber-400/40 shadow-lg backdrop-blur-sm">
                      {leader.role}
                    </span>
                  </div>
                </div>

                {/* Leader Information (Without Qualification) */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-teal-900 transition-colors">
                      {leader.name}
                    </h3>
                    {leader.subRole && (
                      <p className="text-xs font-semibold text-amber-700 mt-1">
                        {leader.subRole}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800 leading-tight">
                        {leader.institution}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-slate-500 font-medium">
                        Negeri {leader.state}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-teal-900 font-bold text-[11px]">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{leader.category || 'Kepimpinan Utama'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold bg-slate-100 px-2 py-0.5 rounded">
                  {leader.term || 'PENGGAL 2026–2028'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
