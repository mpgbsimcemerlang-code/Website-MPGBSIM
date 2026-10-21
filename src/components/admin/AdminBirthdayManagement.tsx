import React, { useMemo, useState } from 'react';
import {
  Cake,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  ShieldCheck,
  Plus,
  Trash2,
  RotateCcw,
  Search,
  AlertTriangle,
  Sliders,
  FileText,
  Users,
  Play,
  Check,
} from 'lucide-react';
import { useAdminContent } from '../../context/AdminContentContext';
import {
  cleanMemberDisplayName,
  DEFAULT_BIRTHDAY_SETTINGS,
  DEFAULT_BIRTHDAY_TEMPLATES,
  evaluateMemberBirthdaySchedule,
  getKualaLumpurDateParts,
  maskIcNumber,
  resolveMemberBirthInfo,
  runBirthdayAcceptanceTests,
} from '../../utils/birthdayUtils';
import { BirthdayMemberOverride } from '../../types';

export const AdminBirthdayManagement: React.FC = () => {
  const { siteData, updateBirthdaySettings, updateMemberSchool } = useAdminContent();
  const currentSettings = siteData.birthdaySettings || DEFAULT_BIRTHDAY_SETTINGS;

  const [activeSubTab, setActiveSubTab] = useState<'tetapan' | 'templat' | 'ahli' | 'ujian'>('tetapan');
  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'detected' | 'needs_review' | 'hidden'>('all');
  const [newTemplateText, setNewTemplateText] = useState('');
  const [editingBirthDateId, setEditingBirthDateId] = useState<string | null>(null);
  const [birthDateInput, setBirthDateInput] = useState<string>('');
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const klToday = useMemo(() => getKualaLumpurDateParts(), []);

  const showNotice = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 3500);
  };

  // Build member birthday status table WITHOUT ever exposing full IC numbers
  const memberRows = useMemo(() => {
    const schools = siteData.memberSchools || [];
    const apps = siteData.memberApplications || [];
    const subs = siteData.submissions || [];
    const overrides = currentSettings.memberOverrides || {};

    return schools.map((sch) => {
      const memberKey = sch.code || sch.id;
      const codeNorm = (sch.code || '').trim().toLowerCase();
      const nameNorm = (sch.name || '').trim().toLowerCase();
      const pgbEmailNorm = (sch.pgbEmail || sch.email || '').trim().toLowerCase();
      const principalClean = cleanMemberDisplayName(sch.principal);
      const principalNorm = principalClean.toLowerCase();

      const matchedApp = apps.find((a) => {
        const aCode = (a.schoolCode || '').trim().toLowerCase();
        const aName = (a.schoolName || '').trim().toLowerCase();
        const aEmail = (a.email || a.pgbEmail || '').trim().toLowerCase();
        const aFullName = cleanMemberDisplayName(a.fullName).toLowerCase();
        return (
          (codeNorm && aCode && aCode === codeNorm) ||
          (nameNorm && aName && aName === nameNorm) ||
          (pgbEmailNorm && aEmail && aEmail === pgbEmailNorm) ||
          (principalNorm && aFullName && (principalNorm.includes(aFullName) || aFullName.includes(principalNorm)))
        );
      });

      let subIc = '';
      if (!sch.icNumber && !matchedApp?.icNumber) {
        for (const sub of subs) {
          const msg = sub.message || '';
          const kpMatch = msg.match(/No\s*KP:\s*([0-9A-Za-z-]{6,20})/i);
          if (!kpMatch || !kpMatch[1] || kpMatch[1] === '-') continue;
          const msgLower = msg.toLowerCase();
          if (
            (codeNorm && msgLower.includes(`(${codeNorm})`)) ||
            (nameNorm && msgLower.includes(nameNorm))
          ) {
            subIc = kpMatch[1].trim();
            break;
          }
        }
      }

      const override = overrides[memberKey] || overrides[sch.id] || overrides[sch.code];
      const rawIc = sch.icNumber || matchedApp?.icNumber || subIc || '';
      const verifiedBirthDate = override?.verifiedBirthDate || sch.verifiedBirthDate || '';

      const birthInfo = resolveMemberBirthInfo({
        verifiedBirthDate,
        icNumber: rawIc,
        cachedBirthMonthDay: sch.cachedBirthMonthDay,
        centuryOverride: override?.centuryOverride,
        currentYear: klToday.year,
      });

      const maskedIc = rawIc ? maskIcNumber(rawIc) : 'Tiada Rekod IC';

      const schedule =
        birthInfo.isValid && birthInfo.birthMonth && birthInfo.birthDay
          ? evaluateMemberBirthdaySchedule(birthInfo.birthMonth, birthInfo.birthDay, klToday, 7)
          : null;

      return {
        school: sch,
        memberKey,
        principalName: principalClean || sch.principal || 'Pengetua / Guru Besar',
        position: sch.designation || matchedApp?.designation || 'Pengetua / Guru Besar',
        maskedIc,
        birthInfo,
        daysUntil: schedule?.daysUntilBirthday ?? null,
        isToday: schedule?.isBirthdayToday ?? false,
        hideGreeting: Boolean(override?.hiddenFromBirthday),
        override,
      };
    });
  }, [siteData.memberSchools, siteData.memberApplications, siteData.submissions, currentSettings, klToday]);

  const filteredMemberRows = useMemo(() => {
    return memberRows.filter((row) => {
      if (memberFilter === 'detected' && !row.birthInfo.isValid) return false;
      if (memberFilter === 'needs_review' && !row.birthInfo.needsCenturyConfirmation) return false;
      if (memberFilter === 'hidden' && !row.hideGreeting) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        row.principalName.toLowerCase().includes(q) ||
        row.school.name.toLowerCase().includes(q) ||
        (row.school.code || '').toLowerCase().includes(q) ||
        (row.birthInfo.formattedDayMonth || '').toLowerCase().includes(q)
      );
    });
  }, [memberRows, memberFilter, searchQuery]);

  const handleToggleSetting = async (
    key:
      | 'enabled'
      | 'showOnPublicWebsite'
      | 'showOnMemberPortal'
      | 'showMemberName'
      | 'showSchoolName'
      | 'showPosition'
  ) => {
    const nextVal = !currentSettings[key];
    await updateBirthdaySettings({ [key]: nextVal });
    showNotice('Tetapan paparan ucapan hari lahir telah dikemas kini.');
  };

  const handleToggleHideMember = async (memberKey: string, currentHidden: boolean) => {
    const existingOverrides = currentSettings.memberOverrides || {};
    const currentEntry: BirthdayMemberOverride = existingOverrides[memberKey] || { memberKey };
    const nextOverrides = {
      ...existingOverrides,
      [memberKey]: {
        ...currentEntry,
        memberKey,
        hiddenFromBirthday: !currentHidden,
        updatedAt: new Date().toISOString(),
      },
    };
    await updateBirthdaySettings({ memberOverrides: nextOverrides });
    showNotice(
      !currentHidden
        ? 'Ucapan bagi ahli ini telah disembunyikan daripada paparan.'
        : 'Ucapan bagi ahli ini telah diaktifkan semula.'
    );
  };

  const handleStartEditBirthDate = (schoolId: string, currentIso?: string) => {
    setEditingBirthDateId(schoolId);
    setBirthDateInput(currentIso || '1980-01-01');
  };

  const handleSaveVerifiedBirthDate = async (schoolId: string, memberKey: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateInput)) {
      return;
    }
    const existingOverrides = currentSettings.memberOverrides || {};
    const currentEntry: BirthdayMemberOverride = existingOverrides[memberKey] || { memberKey };
    const nextOverrides = {
      ...existingOverrides,
      [memberKey]: {
        ...currentEntry,
        memberKey,
        verifiedBirthDate: birthDateInput,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin CMS',
      },
    };
    await updateBirthdaySettings({ memberOverrides: nextOverrides });
    await updateMemberSchool(schoolId, {
      verifiedBirthDate: birthDateInput,
      cachedBirthMonthDay: birthDateInput.slice(5),
    });
    setEditingBirthDateId(null);
    showNotice(`Tarikh lahir rasmi yang disahkan (${birthDateInput}) telah disimpan.`);
  };

  const handleClearVerifiedBirthDate = async (schoolId: string, memberKey: string) => {
    const existingOverrides = { ...(currentSettings.memberOverrides || {}) };
    if (existingOverrides[memberKey]) {
      delete existingOverrides[memberKey].verifiedBirthDate;
      delete existingOverrides[memberKey].centuryOverride;
    }
    if (existingOverrides[schoolId]) {
      delete existingOverrides[schoolId].verifiedBirthDate;
      delete existingOverrides[schoolId].centuryOverride;
    }
    await updateBirthdaySettings({ memberOverrides: existingOverrides });
    await updateMemberSchool(schoolId, { verifiedBirthDate: '' });
    setEditingBirthDateId(null);
    showNotice('Pembetulan manual dipadamkan. Sistem kembali menggunakan pengesanan automatik.');
  };

  const handleUpdateTemplate = async (idx: number, val: string) => {
    const nextTemplates = [...(currentSettings.greetingTemplates || DEFAULT_BIRTHDAY_TEMPLATES)];
    nextTemplates[idx] = val;
    await updateBirthdaySettings({ greetingTemplates: nextTemplates });
  };

  const handleAddTemplate = async () => {
    if (!newTemplateText.trim()) return;
    const nextTemplates = [
      ...(currentSettings.greetingTemplates || DEFAULT_BIRTHDAY_TEMPLATES),
      newTemplateText.trim(),
    ];
    await updateBirthdaySettings({ greetingTemplates: nextTemplates });
    setNewTemplateText('');
    showNotice('Templat variasi ucapan baharu telah ditambah.');
  };

  const handleDeleteTemplate = async (idx: number) => {
    const currentList = currentSettings.greetingTemplates || DEFAULT_BIRTHDAY_TEMPLATES;
    if (currentList.length <= 1) return;
    const nextTemplates = currentList.filter((_, i) => i !== idx);
    await updateBirthdaySettings({ greetingTemplates: nextTemplates });
    showNotice('Templat ucapan telah dipadamkan.');
  };

  const handleResetTemplates = async () => {
    await updateBirthdaySettings({ greetingTemplates: DEFAULT_BIRTHDAY_TEMPLATES });
    showNotice('Templat ucapan telah ditetapkan semula kepada 5 variasi rasmi MPGBSIM.');
  };

  const testSuite = useMemo(() => runBirthdayAcceptanceTests(), []);

  const detectedCount = memberRows.filter((r) => r.birthInfo.isValid).length;
  const needsReviewCount = memberRows.filter((r) => r.birthInfo.needsCenturyConfirmation).length;
  const hiddenCount = memberRows.filter((r) => r.hideGreeting).length;
  const templatesList = currentSettings.greetingTemplates || DEFAULT_BIRTHDAY_TEMPLATES;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-900 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Cake className="w-4 h-4" />
              <span>Pengurusan Automasi & Privasi Data Ahli</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              Modul Ucapan Hari Lahir Automatik MPGBSIM
            </h2>
            <p className="text-xs text-teal-100/90 max-w-2xl">
              Kawal paparan sambutan hari lahir pada Website Rasmi dan Portal PGB, sunting variasi templat ucapan, dan urus pengesahan tarikh lahir ahli tanpa mendedahkan nombor kad pengenalan penuh.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-center">
              <span className="text-[10px] text-teal-200 block">Tarikh Lahir Dikesan</span>
              <strong className="text-lg font-extrabold text-amber-300">
                {detectedCount} / {memberRows.length}
              </strong>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-center">
              <span className="text-[10px] text-teal-200 block">Status Modul</span>
              <strong className="text-xs font-extrabold text-emerald-300 block mt-1">
                {currentSettings.enabled ? 'AKTIF' : 'NYAHAKTIF'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {saveBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('tetapan')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'tetapan'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Kawalan Paparan & Privasi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('templat')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'templat'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Templat Variasi Ucapan ({templatesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ahli')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'ahli'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pengesahan Tarikh Lahir & Sembunyi Ahli ({memberRows.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ujian')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'ujian'
              ? 'bg-teal-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Ujian Penerimaan & Keselamatan ({testSuite.results.filter((r) => r.passed).length}/{testSuite.results.length} Lulus)</span>
        </button>
      </div>

      {/* SUB-TAB 1: DISPLAY & PRIVACY SETTINGS */}
      {activeSubTab === 'tetapan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-700" />
              <span>1. Saluran Paparan Ucapan Hari Lahir</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Aktifkan Modul Ucapan Hari Lahir Automatik
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Suis utama untuk menghidupkan atau mematikan keseluruhan modul hari lahir
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.enabled}
                  onChange={() => handleToggleSetting('enabled')}
                  className="w-5 h-5 accent-teal-800 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Paparkan pada Website Rasmi MPGBSIM (Awam)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Memaparkan seksyen "Sambutan Hari Lahir Ahli MPGBSIM" tanpa tahun kelahiran atau IC
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.showOnPublicWebsite}
                  onChange={() => handleToggleSetting('showOnPublicWebsite')}
                  className="w-5 h-5 accent-teal-800 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Paparkan pada Portal Pengetua / Guru Besar (Portal PGB)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Memaparkan sambutan hari ini serta senarai 7 hari akan datang dalam Portal PGB
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.showOnMemberPortal}
                  onChange={() => handleToggleSetting('showOnMemberPortal')}
                  className="w-5 h-5 accent-teal-800 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Field Visibility Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>2. Kawalan Maklumat Yang Dibenarkan Untuk Paparan</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Paparkan Nama Ahli (PGB)</span>
                  <span className="text-[11px] text-slate-500">
                    Nama penuh Pengetua / Guru Besar pada kad ucapan
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.showMemberName}
                  onChange={() => handleToggleSetting('showMemberName')}
                  className="w-5 h-5 accent-teal-800 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Paparkan Jawatan (Pengetua / Guru Besar)</span>
                  <span className="text-[11px] text-slate-500">
                    Jawatan rasmi kepimpinan pada kad sambutan
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.showPosition}
                  onChange={() => handleToggleSetting('showPosition')}
                  className="w-5 h-5 accent-teal-800 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Paparkan Nama Sekolah Institusi</span>
                  <span className="text-[11px] text-slate-500">
                    Nama institusi sekolah ahli di bawah pimpinan PGB
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.showSchoolName}
                  onChange={() => handleToggleSetting('showSchoolName')}
                  className="w-5 h-5 accent-teal-800 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 text-xs text-teal-950 space-y-1">
              <strong className="block font-bold">Perlindungan Data Peribadi (PDPA) Aktif:</strong>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Nombor Kad Pengenalan penuh dan tahun kelahiran disembunyikan secara automatik daripada pengunjung awam, URL, log, dan cache pelayar (<code className="font-mono">localStorage</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GREETING TEMPLATES */}
      {activeSubTab === 'templat' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Templat Variasi Ucapan Hari Lahir Bahasa Melayu
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan pemegang tempat <code className="font-mono font-bold text-teal-800">[Nama Ahli]</code>,{' '}
                <code className="font-mono font-bold text-teal-800">[Jawatan]</code>, dan{' '}
                <code className="font-mono font-bold text-teal-800">[Sekolah]</code>. Sistem memilih variasi secara automatik tanpa memanggil AI API.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetTemplates}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tetapkan Semula Templat Asal</span>
            </button>
          </div>

          <div className="space-y-4">
            {templatesList.map((tpl, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-teal-900">
                    Variasi Ucapan #{index + 1}
                  </span>
                  {templatesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(index)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Padam</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={tpl}
                  onChange={(e) => handleUpdateTemplate(index, e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Add New Template */}
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-3">
            <label className="block text-xs font-extrabold text-teal-950">
              Tambah Variasi Templat Ucapan Baharu
            </label>
            <textarea
              rows={2}
              value={newTemplateText}
              onChange={(e) => setNewTemplateText(e.target.value)}
              placeholder="Contoh: Selamat Hari Lahir kepada [Nama Ahli] ([Jawatan], [Sekolah]). Semoga terus diberi kesihatan dan keberkatan. Ikhlas daripada MPGBSIM."
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddTemplate}
              className="px-4 py-2 rounded-xl bg-teal-900 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Templat Ucapan</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MEMBER BIRTHDATE VERIFICATION & HIDE CONTROLS */}
      {activeSubTab === 'ahli' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Senarai Status Hari Lahir Ahli & Pengesahan Abad / Tarikh Lahir
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nombor Kad Pengenalan penuh disulitkan (<code className="font-mono">••••••-••-XXXX</code>) mengikut dasar privasi CMS. Pentadbir boleh menyembunyikan ucapan bagi ahli tertentu atau menetapkan tarikh lahir yang telah disahkan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMemberFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  memberFilter === 'all' ? 'bg-teal-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Semua ({memberRows.length})
              </button>
              <button
                type="button"
                onClick={() => setMemberFilter('detected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  memberFilter === 'detected' ? 'bg-teal-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Tarikh Dikesan ({detectedCount})
              </button>
              {needsReviewCount > 0 && (
                <button
                  type="button"
                  onClick={() => setMemberFilter('needs_review')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    memberFilter === 'needs_review' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  Semakan Abad ({needsReviewCount})
                </button>
              )}
              <button
                type="button"
                onClick={() => setMemberFilter('hidden')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  memberFilter === 'hidden' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Disembunyikan ({hiddenCount})
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama PGB, nama sekolah, kod sekolah atau bulan kelahiran..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 bg-slate-50">
                  <th className="py-3 px-4">Ahli PGB & Sekolah</th>
                  <th className="py-3 px-4">No. KP (Dilindungi)</th>
                  <th className="py-3 px-4">Tarikh Hari Lahir & Sumber</th>
                  <th className="py-3 px-4">Status Paparan</th>
                  <th className="py-3 px-4 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMemberRows.map((row) => {
                  const isEditing = editingBirthDateId === row.school.id;

                  return (
                    <tr key={row.school.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <strong className="font-bold text-slate-900 block">{row.principalName}</strong>
                        <span className="text-[11px] text-slate-500 block">
                          {row.position} • {row.school.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {row.maskedIc}
                      </td>

                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={birthDateInput}
                              onChange={(e) => setBirthDateInput(e.target.value)}
                              className="p-1.5 rounded-lg border border-teal-300 text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveVerifiedBirthDate(row.school.id, row.memberKey)}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-800 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingBirthDateId(null)}
                              className="px-2 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : row.birthInfo.isValid ? (
                          <div>
                            <span className="font-extrabold text-teal-900">
                              {row.birthInfo.formattedDayMonth}
                            </span>
                            {row.birthInfo.birthYear && (
                              <span className="text-[11px] text-slate-500 ml-1.5 font-mono">
                                (Abad/Tahun: {row.birthInfo.birthYear})
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  row.birthInfo.source === 'VERIFIED_DATE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-teal-50 text-teal-800'
                                }`}
                              >
                                {row.birthInfo.source === 'VERIFIED_DATE'
                                  ? 'Disahkan Admin'
                                  : 'Automatik (YYMMDD)'}
                              </span>
                              {row.birthInfo.needsCenturyConfirmation && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Semak Abad
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum ditetapkan</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {row.hideGreeting ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                            <EyeOff className="w-3 h-3" />
                            Disembunyikan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <Eye className="w-3 h-3" />
                            Dibenarkan
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleStartEditBirthDate(row.school.id, row.birthInfo.isoBirthDate)
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-teal-900 font-bold text-[11px] transition cursor-pointer"
                        >
                          Sahkan Tarikh Lahir
                        </button>

                        {row.override?.verifiedBirthDate && (
                          <button
                            type="button"
                            onClick={() => handleClearVerifiedBirthDate(row.school.id, row.memberKey)}
                            className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-[11px] transition cursor-pointer"
                          >
                            Reset Auto
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleHideMember(row.memberKey, row.hideGreeting)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                            row.hideGreeting
                              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {row.hideGreeting ? 'Papar Semula' : 'Sembunyi'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: AUTOMATED ACCEPTANCE TESTS */}
      {activeSubTab === 'ujian' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Keputusan Ujian Penerimaan & Pengesahan Keselamatan (9 Kriteria)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Semua ujian dijalankan secara langsung ke atas enjin pengesanan tarikh lahir dan penapis privasi MPGBSIM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testSuite.results.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  t.passed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50 border-rose-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    t.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Ujian #{t.id}: {t.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 font-mono">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
