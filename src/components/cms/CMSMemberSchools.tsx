import React, { useState } from 'react';
import { useAdminContent } from '../../context/AdminContentContext';
import { MemberSchool } from '../../types';
import { Building2, Plus, Edit2, Trash2, Save, X, CheckCircle, Search } from 'lucide-react';

export const CMSMemberSchools: React.FC = () => {
  const { siteData, addMemberSchool, updateMemberSchool, deleteMemberSchool } = useAdminContent();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState<Partial<MemberSchool>>({
    name: '',
    code: '',
    type: 'Sekolah Menengah',
    state: 'Selangor',
    district: '',
    principal: '',
    studentCount: 850,
    joinYear: 2024,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (item: MemberSchool) => {
    setForm({ ...item });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.principal?.trim()) {
      showToast('Sila lengkapkan nama sekolah dan nama Pengetua / Guru Besar.');
      return;
    }

    if (editingId) {
      updateMemberSchool(editingId, {
        name: form.name,
        code: form.code || 'SCH-000',
        type: form.type || 'Sekolah Menengah',
        state: form.state || 'Selangor',
        district: form.district || 'Pusat',
        principal: form.principal,
        studentCount: Number(form.studentCount) || 500,
        joinYear: Number(form.joinYear) || 2024,
      });
      showToast('Maklumat institusi sekolah ahli berjaya dikemaskini!');
      setEditingId(null);
    } else {
      const newItem: MemberSchool = {
        id: `sch-${Date.now()}`,
        name: form.name,
        code: form.code || `SCH-${Math.floor(100 + Math.random() * 900)}`,
        type: form.type || 'Sekolah Menengah',
        state: form.state || 'Selangor',
        district: form.district || 'Pusat',
        principal: form.principal,
        studentCount: Number(form.studentCount) || 500,
        joinYear: Number(form.joinYear) || new Date().getFullYear(),
      };
      addMemberSchool(newItem);
      showToast('Institusi sekolah ahli baharu berjaya didaftarkan!');
    }

    setIsAdding(false);
    setForm({
      name: '',
      code: '',
      type: 'Sekolah Menengah',
      state: 'Selangor',
      district: '',
      principal: '',
      studentCount: 850,
      joinYear: 2024,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadam sekolah: "${name}" daripada direktori ahli?`)) {
      deleteMemberSchool(id);
      showToast('Sekolah ahli telah dipadam.');
    }
  };

  const filteredSchools = (siteData.memberSchools || []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-700" />
            <h3 className="text-lg font-extrabold text-slate-900">
              Direktori Sekolah Ahli Berdaftar ({siteData.memberSchools?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Uruskan senarai institusi pendidikan Islam ahli, maklumat pentadbir, kod sekolah, negeri dan enrolmen murid.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingId(null);
            } else {
              setEditingId(null);
              setForm({
                name: '',
                code: '',
                type: 'SMKA',
                state: 'Selangor',
                district: '',
                principal: '',
                studentCount: 850,
                joinYear: 2024,
              });
              setIsAdding(true);
            }
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer ${
            isAdding ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-teal-800 hover:bg-teal-900 text-white'
          }`}
        >
          {isAdding ? (
            <>
              <X className="w-4 h-4" />
              <span>Tutup Borang</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Daftar Sekolah Ahli</span>
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-4">
          <h4 className="text-sm font-extrabold text-teal-950 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-teal-800 text-white flex items-center justify-center text-xs">
              {editingId ? '✏️' : '+'}
            </span>
            <span>{editingId ? 'Kemaskini Maklumat Sekolah' : 'Daftar Sekolah Ahli Baharu'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Penuh Sekolah / Institusi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: SMKA Sheikh Abdul Malek"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kod Sekolah
              </label>
              <input
                type="text"
                value={form.code || ''}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Contoh: TEE0011"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori Institusi
              </label>
              <select
                value={form.type || 'Sekolah Menengah'}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              >
                <option value="Sekolah Rendah">Sekolah Rendah</option>
                <option value="Sekolah Menengah">Sekolah Menengah</option>
                <option value="Maahad Tahfiz">Maahad Tahfiz</option>
                <option value="Rakan Musleh">Rakan Musleh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Negeri
              </label>
              <select
                value={form.state || 'Selangor'}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              >
                {[
                  'Johor',
                  'Kedah',
                  'Kelantan',
                  'Melaka',
                  'Negeri Sembilan',
                  'Pahang',
                  'Perak',
                  'Perlis',
                  'Pulau Pinang',
                  'Sabah',
                  'Sarawak',
                  'Selangor',
                  'Terengganu',
                  'Wilayah Persekutuan Kuala Lumpur',
                  'Wilayah Persekutuan Labuan',
                  'Wilayah Persekutuan Putrajaya',
                ].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Daerah / Kawasan
              </label>
              <input
                type="text"
                value={form.district || ''}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder="Contoh: Kuala Terengganu"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Pengetua / Guru Besar Semasa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.principal || ''}
                onChange={(e) => setForm({ ...form, principal: e.target.value })}
                placeholder="Contoh: Ustaz Roslan bin Othman"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bilangan Murid Berdaftar
              </label>
              <input
                type="number"
                value={form.studentCount || 0}
                onChange={(e) => setForm({ ...form, studentCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tahun Menyertai Majlis
              </label>
              <input
                type="number"
                value={form.joinYear || 2024}
                onChange={(e) => setForm({ ...form, joinYear: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-teal-200/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Kemaskini Sekolah' : 'Simpan Sekolah'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari mengikut nama sekolah, negeri, daerah, atau nama pengetua..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-600 shadow-2xs"
        />
      </div>

      {/* Table list */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Kod & Nama Sekolah</th>
              <th className="py-3 px-3">Kategori</th>
              <th className="py-3 px-3">Negeri & Daerah</th>
              <th className="py-3 px-3">Pengetua / Guru Besar</th>
              <th className="py-3 px-3">Murid</th>
              <th className="py-3 px-3 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSchools.map((sch) => (
              <tr key={sch.id} className="hover:bg-teal-50/40 transition">
                <td className="py-3 px-4">
                  <span className="font-mono text-[10px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {sch.code}
                  </span>
                  <div className="font-bold text-slate-900 mt-1">{sch.name}</div>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px]">
                    {sch.type}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600">
                  <div className="font-semibold text-slate-800">{sch.state}</div>
                  <div className="text-[10px] text-slate-500">{sch.district}</div>
                </td>
                <td className="py-3 px-3 font-medium text-slate-800">{sch.principal}</td>
                <td className="py-3 px-3 font-semibold text-teal-900">{sch.studentCount.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(sch)}
                      className="p-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                      title="Sunting Sekolah"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sch.id, sch.name)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Padam Sekolah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
