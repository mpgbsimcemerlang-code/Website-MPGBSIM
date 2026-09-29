import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { ContactInquiry, saveContactInquiry } from '../services/firebaseConfig';
import { useAdminContent } from '../context/AdminContentContext';

export const ContactSection: React.FC = () => {
  const { siteData, isAdmin, setIsCMSOpen } = useAdminContent();
  const { contactInfo } = siteData;

  const [formData, setFormData] = useState<ContactInquiry>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'Umum',
    message: '',
  });


  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; refCode?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await saveContactInquiry(formData);
    setLoading(false);
    setResult(res);

    if (res.success) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: 'Umum',
        message: '',
      });
    }
  };

  return (
    <section id="hubungi" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Mail className="w-3.5 h-3.5 text-teal-700" />
            <span>Saluran Rasmi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hubungi Urus Setia MPGBSIM
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Sebarang pertanyaan berkaitan keahlian, program kebangsaan, perkongsian amalan terbaik atau kerjasama strategik boleh diajukan terus kepada pihak Majlis.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-teal-600 to-amber-500 mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-700" />
                <span>Ibu Pejabat & Urus Setia Kebangsaan</span>
              </h3>

              <div className="space-y-6 text-sm text-slate-600">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0 mt-0.5 border border-teal-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Alamat Surat-Menyurat</strong>
                    <p className="text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0 mt-0.5 border border-amber-100">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Emel Rasmi</strong>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-teal-700 hover:text-teal-900 font-semibold underline mt-1 block"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0 mt-0.5 border border-teal-100">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Talian Telefon & WhatsApp Urus Setia</strong>
                    <p className="text-slate-700 mt-1 font-mono font-semibold">
                      {contactInfo.phone} {contactInfo.whatsapp ? `/ ${contactInfo.whatsapp}` : ''}
                    </p>
                    <span className="text-[11px] text-slate-400">Talian perhubungan rasmi ibu pejabat</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Waktu Urusan Pejabat</strong>
                    <p className="text-slate-600 mt-1 whitespace-pre-line">
                      {contactInfo.operatingHours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-900 text-white text-xs flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
              <span>
                MPGBSIM memproses setiap surat dan pertanyaan rasmi dalam tempoh <strong>3 hari bekerja</strong>.
              </span>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Borang Pertanyaan & Maklum Balas
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Sila lengkapkan butiran di bawah dan pegawai bertugas kami akan menghubungi anda.
              </p>

              {result && (
                <div
                  className={`p-4 rounded-xl mb-6 text-xs sm:text-sm flex items-start gap-3 ${
                    result.success
                      ? 'bg-teal-50 border border-teal-200 text-teal-900'
                      : 'bg-red-50 border border-red-200 text-red-900'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{result.message}</p>
                    {result.refCode && (
                      <p className="text-xs mt-1 text-slate-600 font-mono">
                        Nombor Rujukan Tiket: <strong>{result.refCode}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Penuh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="cth. Ustaz Fauzi bin Daud"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Emel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="cth. pengetua@sekolah.edu.my"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      No. Telefon / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="cth. 012-3456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kategori Pertanyaan
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ContactInquiry['category'],
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                    >
                      <option value="Umum">Pertanyaan Umum</option>
                      <option value="Keahlian">Pendaftaran / Status Keahlian PGB</option>
                      <option value="Program & Acara">Program & Konvensyen Kebangsaan</option>
                      <option value="Amalan Terbaik">Cadangan Perkongsian Amalan Terbaik</option>
                      <option value="Kerjasama Strategik">Jalinan Kerjasama / Tajaan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tajuk Perkara <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth. Permohonan Menjadi Tuan Rumah Bengkel Zon Tengah"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mesej / Kandungan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Sila nyatakan pertanyaan atau maklum balas anda secara terperinci..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Menghantar Mesej...' : 'Hantar Mesej ke Urus Setia'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
