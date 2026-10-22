import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  FileCheck,
  FileSpreadsheet,
  Filter,
  MapPin,
  PenTool,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  useAdminContent,
  DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
} from '../../context/AdminContentContext';
import {
  EventRegistration,
  MemberSchool,
  ProgramCertificateConfig,
  ProgramEvent,
} from '../../types';
import { OfficialProgramCertificateModal } from '../portal/OfficialProgramCertificateModal';

interface AdminProgramAttendanceManagementProps {
  initialEventId?: string;
}

interface CombinedPgbAttendanceRow {
  key: string;
  school?: MemberSchool;
  registration?: EventRegistration;
  participantName: string;
  position: string;
  schoolName: string;
  schoolCode: string;
  state: string;
  email: string;
  phone: string;
  icNumber: string;
  isRegistered: boolean;
  isAttended: boolean;
  certificateIssued: boolean;
  certificateNo?: string;
  attendedAt?: string;
  certificateIssuedAt?: string;
}

export const AdminProgramAttendanceManagement: React.FC<
  AdminProgramAttendanceManagementProps
> = ({ initialEventId }) => {
  const {
    siteData,
    eventRegistrations,
    updateProgram,
    recordPgbProgramAttendance,
    bulkRecordPgbProgramAttendance,
    toggleProgramCertificateIssued,
    bulkIssueProgramCertificates,
    updateProgramCertificateConfig,
    updateEventRegistrationStatus,
    registerForEvent,
  } = useAdminContent();

  const programs: ProgramEvent[] = siteData.programs || [];
  const schools: MemberSchool[] = siteData.memberSchools || [];

  const [activeView, setActiveView] = useState<'attendance' | 'cert-settings'>('attendance');
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    if (initialEventId && programs.some((p) => p.id === initialEventId)) {
      return initialEventId;
    }
    return programs[0]?.id || '';
  });

  useEffect(() => {
    if (initialEventId && programs.some((p) => p.id === initialEventId)) {
      setSelectedEventId(initialEventId);
    } else if (!selectedEventId && programs.length > 0) {
      setSelectedEventId(programs[0].id);
    }
  }, [initialEventId, programs, selectedEventId]);

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === selectedEventId) || programs[0] || null,
    [programs, selectedEventId]
  );

  // Filters for attendance table
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'attended' | 'registered' | 'not_attended' | 'cert_issued'
  >('all');
  const [autoIssueOnAttend, setAutoIssueOnAttend] = useState<boolean>(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preview certificate modal state
  const [previewReg, setPreviewReg] = useState<EventRegistration | null>(null);

  // Per-program custom certificate title state
  const [eventCertTitleOverride, setEventCertTitleOverride] = useState<string>('');
  const [isSavingEventTitle, setIsSavingEventTitle] = useState(false);

  useEffect(() => {
    setEventCertTitleOverride(selectedProgram?.certificateTitleOverride || '');
  }, [selectedProgram]);

  // Global Certificate Config Form State
  const currentCertConfig: ProgramCertificateConfig = useMemo(
    () => ({
      ...DEFAULT_PROGRAM_CERTIFICATE_CONFIG,
      ...(siteData.programCertificateConfig || {}),
    }),
    [siteData.programCertificateConfig]
  );

  const [certForm, setCertForm] = useState<ProgramCertificateConfig>(currentCertConfig);
  const [isSavingCertConfig, setIsSavingCertConfig] = useState(false);
  const sigFileInputRef = useRef<HTMLInputElement | null>(null);

  // Interactive Signature Pad Canvas State
  const [sigMode, setSigMode] = useState<'upload' | 'draw'>('upload');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<'#0f172a' | '#134e4a' | '#1e3a8a'>('#0f172a');

  // Walk-in / Manual PGB Attendance Modal
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPosition, setWalkInPosition] = useState('Pengetua');
  const [walkInSchool, setWalkInSchool] = useState('');
  const [walkInCode, setWalkInCode] = useState('');
  const [walkInState, setWalkInState] = useState('Selangor');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInIc, setWalkInIc] = useState('');

  useEffect(() => {
    setCertForm(currentCertConfig);
  }, [currentCertConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Build unified list of all Member Schools (PGB) + any extra EventRegistrations for the selected event
  const combinedRows: CombinedPgbAttendanceRow[] = useMemo(() => {
    if (!selectedProgram) return [];
    const evId = selectedProgram.id;
    const evRegs = (eventRegistrations || []).filter(
      (r) => r.eventId === evId && r.status !== 'cancelled'
    );

    const matchedRegIds = new Set<string>();
    const rows: CombinedPgbAttendanceRow[] = [];

    for (const school of schools) {
      const normCode = (school.code || '').trim().toUpperCase();
      const normName = (school.name || '').trim().toLowerCase();
      const normEmail = (school.pgbEmail || school.email || '').trim().toLowerCase();

      const reg = evRegs.find((r) => {
        if (matchedRegIds.has(r.id)) return false;
        if (r.schoolId && school.id && r.schoolId === school.id) return true;
        if (normCode && r.schoolCode && r.schoolCode.trim().toUpperCase() === normCode) return true;
        if (normName && r.schoolName && r.schoolName.trim().toLowerCase() === normName) return true;
        if (normEmail && r.participantEmail && r.participantEmail.trim().toLowerCase() === normEmail)
          return true;
        return false;
      });

      if (reg) {
        matchedRegIds.add(reg.id);
      }

      const rawPrincipal = (school.principal || 'Pengetua / Guru Besar')
        .replace(/\s*\((Pengetua|Guru Besar|Mudir)\)\s*$/i, '')
        .trim();
      const defaultPos =
        school.designation ||
        (school.type?.toLowerCase().includes('rendah') ? 'Guru Besar' : 'Pengetua');

      rows.push({
        key: `school-${school.id}`,
        school,
        registration: reg,
        participantName: reg?.participantName || rawPrincipal,
        position: reg?.position || defaultPos,
        schoolName: school.name || reg?.schoolName || '',
        schoolCode: school.code || reg?.schoolCode || '',
        state: school.state || reg?.state || 'Malaysia',
        email: reg?.participantEmail || school.pgbEmail || school.email || '',
        phone: reg?.participantPhone || school.pgbPhone || school.phone || '',
        icNumber: reg?.icNumber || school.icNumber || '',
        isRegistered: Boolean(reg),
        isAttended: reg?.status === 'attended',
        certificateIssued: Boolean(reg?.certificateIssued),
        certificateNo: reg?.certificateNo,
        attendedAt: reg?.attendedAt,
        certificateIssuedAt: reg?.certificateIssuedAt,
      });
    }

    // Also include any eventRegistrations that didn't match a school in memberSchools (e.g. walk-in / SLT)
    for (const reg of evRegs) {
      if (matchedRegIds.has(reg.id)) continue;
      rows.push({
        key: `reg-${reg.id}`,
        registration: reg,
        participantName: reg.participantName,
        position: reg.position || 'Pengetua / Guru Besar',
        schoolName: reg.schoolName,
        schoolCode: reg.schoolCode || reg.attendanceCode || 'MPGB',
        state: reg.state || 'Malaysia',
        email: reg.participantEmail,
        phone: reg.participantPhone || '',
        icNumber: reg.icNumber || '',
        isRegistered: true,
        isAttended: reg.status === 'attended',
        certificateIssued: Boolean(reg.certificateIssued),
        certificateNo: reg.certificateNo,
        attendedAt: reg.attendedAt,
        certificateIssuedAt: reg.certificateIssuedAt,
      });
    }

    // Sort: Attended first, then Registered, then Alphabetical by School Name
    return rows.sort((a, b) => {
      if (a.isAttended !== b.isAttended) return a.isAttended ? -1 : 1;
      if (a.isRegistered !== b.isRegistered) return a.isRegistered ? -1 : 1;
      return a.schoolName.localeCompare(b.schoolName);
    });
  }, [selectedProgram, schools, eventRegistrations]);

  const availableStates = useMemo(() => {
    const s = new Set<string>();
    combinedRows.forEach((r) => {
      if (r.state) s.add(r.state);
    });
    return ['Semua', ...Array.from(s).sort()];
  }, [combinedRows]);

  const filteredRows = useMemo(() => {
    return combinedRows.filter((row) => {
      if (stateFilter !== 'Semua' && row.state !== stateFilter) return false;
      if (statusFilter === 'attended' && !row.isAttended) return false;
      if (statusFilter === 'registered' && !row.isRegistered) return false;
      if (statusFilter === 'not_attended' && row.isAttended) return false;
      if (statusFilter === 'cert_issued' && !row.certificateIssued) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = row.participantName.toLowerCase().includes(q);
        const matchSchool = row.schoolName.toLowerCase().includes(q);
        const matchCode = row.schoolCode.toLowerCase().includes(q);
        const matchState = row.state.toLowerCase().includes(q);
        const matchCert = (row.certificateNo || '').toLowerCase().includes(q);
        return matchName || matchSchool || matchCode || matchState || matchCert;
      }
      return true;
    });
  }, [combinedRows, stateFilter, statusFilter, searchTerm]);

  // Metrics for currently selected program
  const totalPgbCount = combinedRows.length;
  const registeredCount = combinedRows.filter((r) => r.isRegistered).length;
  const attendedCount = combinedRows.filter((r) => r.isAttended).length;
  const certIssuedCount = combinedRows.filter((r) => r.certificateIssued).length;

  // Toggle individual PGB attendance
  const handleToggleAttendance = async (row: CombinedPgbAttendanceRow) => {
    if (!selectedProgram) return;
    setBusyKey(row.key);
    try {
      const nextAttended = !row.isAttended;
      if (row.school) {
        await recordPgbProgramAttendance(
          selectedProgram.id,
          row.school,
          nextAttended,
          nextAttended && autoIssueOnAttend
        );
      } else if (row.registration) {
        const nextStatus = nextAttended ? 'attended' : 'confirmed';
        await updateEventRegistrationStatus(row.registration.id, nextStatus);
        if (nextAttended && autoIssueOnAttend) {
          await toggleProgramCertificateIssued(
            row.registration.id,
            true,
            eventCertTitleOverride.trim() || undefined
          );
        } else if (!nextAttended && row.registration.certificateIssued) {
          await toggleProgramCertificateIssued(row.registration.id, false);
        }
      }
      showToast(
        nextAttended
          ? autoIssueOnAttend
            ? `Kehadiran & Sijil Penyertaan disahkan bagi ${row.participantName}.`
            : `Kehadiran disahkan bagi ${row.participantName}.`
          : `Status kehadiran dikemas kini bagi ${row.participantName}.`
      );
    } finally {
      setBusyKey(null);
    }
  };

  // Toggle certificate issuance for an attended row
  const handleToggleCertificate = async (row: CombinedPgbAttendanceRow) => {
    if (!selectedProgram) return;
    setBusyKey(`cert-${row.key}`);
    try {
      const nextIssued = !row.certificateIssued;
      if (row.registration) {
        await toggleProgramCertificateIssued(
          row.registration.id,
          nextIssued,
          eventCertTitleOverride.trim() || undefined
        );
      } else if (row.school) {
        await recordPgbProgramAttendance(selectedProgram.id, row.school, true, nextIssued);
      }
      showToast(
        nextIssued
          ? `Sijil Penyertaan dikeluarkan untuk ${row.participantName} (${row.schoolCode}).`
          : `Sijil Penyertaan ditarik balik untuk ${row.participantName}.`
      );
    } finally {
      setBusyKey(null);
    }
  };

  // Bulk mark all registered participants as attended
  const handleBulkAttendAllRegistered = async () => {
    if (!selectedProgram) return;
    const registeredRows = combinedRows.filter((r) => r.isRegistered && !r.isAttended);
    if (registeredRows.length === 0) {
      showToast('Semua peserta berdaftar telah pun ditandakan hadir.');
      return;
    }
    setIsBulkProcessing(true);
    try {
      for (const row of registeredRows) {
        if (row.school) {
          await recordPgbProgramAttendance(
            selectedProgram.id,
            row.school,
            true,
            autoIssueOnAttend
          );
        } else if (row.registration) {
          await updateEventRegistrationStatus(row.registration.id, 'attended');
          if (autoIssueOnAttend) {
            await toggleProgramCertificateIssued(
              row.registration.id,
              true,
              eventCertTitleOverride.trim() || undefined
            );
          }
        }
      }
      showToast(
        `Berjaya menandakan hadir bagi ${registeredRows.length} PGB/peserta berdaftar!`
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk issue certificates for all attended PGBs in the selected program
  const handleBulkIssueCertificatesForAttended = async () => {
    if (!selectedProgram) return;
    setIsBulkProcessing(true);
    try {
      const count = await bulkIssueProgramCertificates(
        selectedProgram.id,
        eventCertTitleOverride.trim() || undefined
      );
      if (count > 0) {
        showToast(
          `Berjaya mengeluarkan ${count} Sijil Penyertaan Program! Ahli PGB kini boleh memuat turun sijil di Portal PGB masing-masing.`
        );
      } else {
        showToast('Sila tandakan kehadiran PGB terlebih dahulu sebelum mengeluarkan sijil.');
      }
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk mark currently filtered schools as attended + issue certificates
  const handleBulkAttendFilteredSchools = async () => {
    if (!selectedProgram) return;
    const targetSchools = filteredRows
      .filter((r) => !r.isAttended && r.school)
      .map((r) => r.school!);
    if (targetSchools.length === 0) {
      showToast('Semua PGB dalam senarai tapisan semasa telah ditandakan hadir.');
      return;
    }
    setIsBulkProcessing(true);
    try {
      await bulkRecordPgbProgramAttendance(
        selectedProgram.id,
        targetSchools,
        true,
        autoIssueOnAttend
      );
      showToast(
        `Berjaya merekodkan kehadiran${autoIssueOnAttend ? ' & mengeluarkan sijil' : ''} bagi ${targetSchools.length} PGB!`
      );
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Save custom certificate title override for the selected program
  const handleSaveEventCertTitleOverride = async () => {
    if (!selectedProgram) return;
    setIsSavingEventTitle(true);
    try {
      await updateProgram(selectedProgram.id, {
        certificateTitleOverride: eventCertTitleOverride.trim(),
      });
      showToast(
        eventCertTitleOverride.trim()
          ? `Tajuk sijil khas "${eventCertTitleOverride.trim()}" disimpan untuk program ini.`
          : 'Tajuk sijil program dikembalikan kepada tajuk sijil utama (default).'
      );
    } finally {
      setIsSavingEventTitle(false);
    }
  };

  // Export Attendance & Certificate Records to CSV
  const handleExportAttendanceCsv = () => {
    if (!selectedProgram) return;
    const headers = [
      'Bil',
      'Nama PGB / Peserta',
      'Jawatan',
      'Nama Sekolah',
      'Kod Sekolah',
      'Negeri',
      'Status Kehadiran',
      'Tarikh Hadir',
      'Status Sijil',
      'No Rujukan Sijil',
    ];
    const attendedOrRegistered = filteredRows.filter((r) => r.isAttended || r.isRegistered);
    const sourceRows = attendedOrRegistered.length > 0 ? attendedOrRegistered : filteredRows;

    const csvRows = sourceRows.map((r, idx) => [
      idx + 1,
      `"${r.participantName.replace(/"/g, '""')}"`,
      `"${r.position.replace(/"/g, '""')}"`,
      `"${r.schoolName.replace(/"/g, '""')}"`,
      `"${r.schoolCode}"`,
      `"${r.state}"`,
      `"${r.isAttended ? 'HADIR' : r.isRegistered ? 'BERDAFTAR (BELUM HADIR)' : 'TIDAK HADIR'}"`,
      `"${r.attendedAt ? new Date(r.attendedAt).toLocaleDateString('ms-MY') : '-'}"`,
      `"${r.certificateIssued ? 'SIJIL DIKELUARKAN' : 'BELUM DIKELUARKAN'}"`,
      `"${r.certificateNo || '-'}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Rekod_Kehadiran_Sijil_${selectedProgram.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Walk-in PGB Registration & Immediate Attendance + Certificate
  const handleAddWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !walkInName.trim() || !walkInSchool.trim()) return;
    const res = await registerForEvent(selectedProgram.id, {
      participantName: walkInName.trim(),
      position: walkInPosition,
      schoolName: walkInSchool.trim(),
      schoolCode: walkInCode.trim().toUpperCase(),
      icNumber: walkInIc.trim(),
      state: walkInState,
      participantEmail: walkInEmail.trim() || 'ahli@mpgbsim.org',
      participantPhone: '',
      notes: 'Rekod kehadiran terus oleh Admin CMS',
    });
    if (res.success && res.registrationId) {
      await updateEventRegistrationStatus(res.registrationId, 'attended');
      if (autoIssueOnAttend) {
        await toggleProgramCertificateIssued(
          res.registrationId,
          true,
          eventCertTitleOverride.trim() || undefined
        );
      }
      setWalkInName('');
      setWalkInSchool('');
      setWalkInCode('');
      setWalkInEmail('');
      setWalkInIc('');
      setIsWalkInOpen(false);
      showToast(`Kehadiran & sijil bagi ${walkInName} telah berjaya direkodkan!`);
    }
  };

  // Convert uploaded signature image to clean transparent PNG (removes near-white background automatically)
  const processSignatureImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 520;
        const maxH = 220;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        if (h > maxH) {
          w = Math.round((w * maxH) / h);
          h = maxH;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);

        // Make white / near-white pixels transparent so the signature blends cleanly on certificates
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 235 && g > 235 && b > 235) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        setCertForm((prev) => ({
          ...prev,
          chairmanSignatureImageUrl: pngDataUrl,
        }));
        showToast('Imej tandatangan digital Pengerusi dimuat naik (latar putih dijadikan lutsinar).');
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Interactive Signature Pad Drawing Handlers
  const getCanvasCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    const mouseEvt = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: (mouseEvt.clientX - rect.left) * scaleX,
      y: (mouseEvt.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if ('touches' in e) {
      e.preventDefault();
    }
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const applyDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setCertForm((prev) => ({
      ...prev,
      chairmanSignatureImageUrl: dataUrl,
    }));
    showToast('Tandatangan digital lukisan telah diterapkan! Sila klik Simpan Tetapan Sijil.');
  };

  const handleSaveCertConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCertConfig(true);
    try {
      await updateProgramCertificateConfig(certForm);
      showToast(
        'Tetapan Tajuk Sijil & Tandatangan Digital Pengerusi telah berjaya disimpan dan disegerakkan ke seluruh Portal PGB!'
      );
    } finally {
      setIsSavingCertConfig(false);
    }
  };

  // Sample registration for live template preview
  const samplePreviewRegistration: EventRegistration = useMemo(() => {
    const firstAttended = combinedRows.find((r) => r.isAttended && r.registration)?.registration;
    if (firstAttended) return firstAttended;
    return {
      id: 'preview-sample',
      eventId: selectedProgram?.id || 'prog-2026',
      eventTitle:
        selectedProgram?.title ||
        'Konvensyen Kebangsaan Pengetua & Guru Besar Sekolah Islam Malaysia 2026',
      eventDate: selectedProgram?.date || '24 Oktober 2026',
      eventVenue: selectedProgram?.venue || 'Pusat Konvensyen Antarabangsa Bangi',
      eventMode: selectedProgram?.mode || 'Fizikal',
      schoolCode: 'MJAC011',
      participantName: 'USTAZ ABDUL QAYYUM BIN YAAKOP',
      position: 'Guru Besar',
      schoolName: 'SEKOLAH RENDAH ISLAM I MUSLEH',
      state: 'Melaka',
      participantEmail: 'abdulqayyumyaakop@imuslehmelaka.edu.my',
      registeredAt: new Date().toISOString(),
      attendedAt: new Date().toISOString(),
      status: 'attended',
      attendanceCode: 'MPGB-MJAC011',
      certificateIssued: true,
      certificateNo: 'MPGBSIM/SIJIL/2026/KPSI/MJAC011',
      certificateTitleOverride: eventCertTitleOverride.trim() || certForm.certificateTitle,
    };
  }, [combinedRows, selectedProgram, eventCertTitleOverride, certForm.certificateTitle]);

  return (
    <div className="space-y-6">
      {/* Top Banner & View Switcher */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-teal-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              Sistem Rekod Kehadiran Takwim & Sijil Penyertaan PGB
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Pengurusan Kehadiran Program & Pengeluaran Sijil Digital PGB
            </h3>
            <p className="text-xs text-teal-100/85 max-w-2xl leading-relaxed">
              Tandakan kehadiran PGB mengikut takwim program, keluarkan Sijil Penyertaan Program
              secara automatik ke Portal PGB masing-masing, serta sunting tajuk sijil dan
              tandatangan digital Pengerusi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('attendance')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeView === 'attendance'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-teal-900/70 hover:bg-teal-800 text-teal-100 border border-teal-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Rekod Kehadiran & Keluarkan Sijil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('cert-settings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeView === 'cert-settings'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-teal-900/70 hover:bg-teal-800 text-teal-100 border border-teal-700'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Edit Tajuk Sijil & Sign Digital Pengerusi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-100 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: REKOD KEHADIRAN PROGRAM & PENGELUARAN SIJIL PGB                  */}
      {/* ========================================================================= */}
      {activeView === 'attendance' && (
        <div className="space-y-5">
          {/* Step 1: Select Takwim Program */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  1. Pilih Program Berdasarkan Takwim MPGBSIM
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-teal-700/40 bg-teal-50/30 text-slate-900 font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                >
                  {programs.map((prog, idx) => {
                    const evAttended = (eventRegistrations || []).filter(
                      (r) => r.eventId === prog.id && r.status === 'attended'
                    ).length;
                    const evCerts = (eventRegistrations || []).filter(
                      (r) => r.eventId === prog.id && r.certificateIssued
                    ).length;
                    return (
                      <option key={prog.id} value={prog.id}>
                        #{prog.order || idx + 1} — {prog.title} ({prog.date}) • [{evAttended} Hadir |{' '}
                        {evCerts} Sijil]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Per-Program Certificate Title Override Quick Input */}
              <div className="w-full lg:w-96 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Tajuk Sijil Program Ini (Boleh Ubah):</span>
                  <span className="text-[10px] text-teal-700 font-semibold">
                    Default: {currentCertConfig.certificateTitle}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={eventCertTitleOverride}
                    onChange={(e) => setEventCertTitleOverride(e.target.value)}
                    placeholder={currentCertConfig.certificateTitle || 'SIJIL PENYERTAAN PROGRAM'}
                    className="flex-1 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleSaveEventCertTitleOverride}
                    disabled={isSavingEventTitle}
                    className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>
              </div>
            </div>

            {selectedProgram && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-teal-700" />
                    {selectedProgram.date} ({selectedProgram.time || 'Sepenuh Hari'})
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    {selectedProgram.venue}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px]">
                    Mod: {selectedProgram.mode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewReg(samplePreviewRegistration)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pratonton Sijil Program Ini</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary KPI Metrics for Selected Program */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Jumlah Ahli PGB & Peserta
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block tabular-nums">
                {totalPgbCount}
              </span>
              <span className="text-[11px] text-slate-500">Senarai sekolah ahli & peserta</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-teal-200/80 shadow-2xs bg-gradient-to-br from-teal-50/40 to-white">
              <span className="text-[10px] uppercase font-bold text-teal-700 block tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" />
                Pra-Daftar Program
              </span>
              <span className="text-2xl font-black text-teal-900 mt-1 block tabular-nums">
                {registeredCount}
              </span>
              <span className="text-[11px] text-teal-700">Mendaftar melalui portal/web</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-2xs bg-gradient-to-br from-blue-50/40 to-white">
              <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                Disahkan Hadir Program
              </span>
              <span className="text-2xl font-black text-blue-900 mt-1 block tabular-nums">
                {attendedCount}
              </span>
              <span className="text-[11px] text-blue-700">Dipaparkan dalam Portal PGB</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-300/80 shadow-2xs bg-gradient-to-br from-amber-50/50 to-white">
              <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-600" />
                Sijil Penyertaan Dikeluarkan
              </span>
              <span className="text-2xl font-black text-amber-900 mt-1 block tabular-nums">
                {certIssuedCount}
              </span>
              <span className="text-[11px] text-amber-800">Sedia dimuat turun oleh PGB</span>
            </div>
          </div>

          {/* Search, Filter & Bulk Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama PGB, nama sekolah, kod sekolah (cth: MJAC011), atau negeri..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-white"
                />
              </div>

              {/* State Filter */}
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
              >
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Semua' ? 'Semua Negeri' : st}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
              >
                <option value="all">Semua PGB & Peserta ({totalPgbCount})</option>
                <option value="attended">Hadir Program Sahaja ({attendedCount})</option>
                <option value="cert_issued">Sijil Dikeluarkan ({certIssuedCount})</option>
                <option value="registered">Pra-Daftar Sahaja ({registeredCount})</option>
                <option value="not_attended">
                  Belum Ditandakan Hadir ({totalPgbCount - attendedCount})
                </option>
              </select>
            </div>

            {/* Bulk Action Controls */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoIssueOnAttend}
                  onChange={(e) => setAutoIssueOnAttend(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-700 focus:ring-teal-600"
                />
                <span>
                  Keluarkan <strong>Sijil Penyertaan</strong> secara automatik sebaik sahaja PGB
                  ditandakan <strong>Hadir</strong>
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-700" />
                  <span>Tambah Kehadiran Walk-In</span>
                </button>

                {registeredCount > attendedCount && (
                  <button
                    type="button"
                    disabled={isBulkProcessing}
                    onClick={handleBulkAttendAllRegistered}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Tandakan Hadir Semua Pendaftar</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isBulkProcessing || attendedCount === 0}
                  onClick={handleBulkIssueCertificatesForAttended}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Keluarkan Sijil Semua PGB Hadir ({attendedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportAttendanceCsv}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Eksport CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* PGB Attendance & Certificate Issuance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredRows.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Tiada rekod PGB atau peserta dijumpai mengikut tapisan semasa.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-3 px-4">Nama PGB & Jawatan</th>
                      <th className="py-3 px-4">Sekolah Ahli & Kod</th>
                      <th className="py-3 px-4">Negeri</th>
                      <th className="py-3 px-4 text-center">Status Kehadiran</th>
                      <th className="py-3 px-4 text-center">Status Sijil Penyertaan</th>
                      <th className="py-3 px-4 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row) => {
                      const isRowBusy = busyKey === row.key || busyKey === `cert-${row.key}`;
                      return (
                        <tr
                          key={row.key}
                          className={`transition ${
                            row.isAttended
                              ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Nama PGB */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  row.isAttended
                                    ? 'bg-teal-800 text-amber-300'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {row.participantName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {row.participantName}
                                </span>
                                <span className="text-[10.5px] text-slate-500 font-medium">
                                  {row.position}
                                  {row.icNumber ? ` • KP: ${row.icNumber}` : ''}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Sekolah & Kod */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block line-clamp-1">
                              {row.schoolName}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-teal-800 border border-slate-200 inline-block mt-0.5">
                              {row.schoolCode || 'MPGBSIM'}
                            </span>
                          </td>

                          {/* Negeri */}
                          <td className="py-3 px-4 font-medium text-slate-700">{row.state}</td>

                          {/* Status Kehadiran */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              disabled={isRowBusy}
                              onClick={() => handleToggleAttendance(row)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                                row.isAttended
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                  : row.isRegistered
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-900 border border-slate-200'
                              }`}
                            >
                              {row.isAttended ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>HADIR (Disahkan)</span>
                                </>
                              ) : row.isRegistered ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Pra-Daftar (Klik Tanda Hadir)</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Tandakan Hadir</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Status Sijil Penyertaan */}
                          <td className="py-3 px-4 text-center">
                            {row.certificateIssued ? (
                              <div className="flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10.5px] font-bold">
                                  <Award className="w-3 h-3 text-amber-700" />
                                  <span>Sijil Dikeluarkan</span>
                                </span>
                                {row.certificateNo && (
                                  <span className="text-[9.5px] font-mono text-slate-500 mt-0.5">
                                    {row.certificateNo}
                                  </span>
                                )}
                              </div>
                            ) : row.isAttended ? (
                              <button
                                type="button"
                                disabled={isRowBusy}
                                onClick={() => handleToggleCertificate(row)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black shadow-2xs transition cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Keluarkan Sijil</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Sahkan hadir dahulu
                              </span>
                            )}
                          </td>

                          {/* Tindakan Admin */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {row.isAttended && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const regObj: EventRegistration = row.registration || {
                                      id: `temp-${row.key}`,
                                      eventId: selectedProgram?.id || '',
                                      eventTitle: selectedProgram?.title || '',
                                      eventDate: selectedProgram?.date || '',
                                      eventVenue: selectedProgram?.venue || '',
                                      eventMode: selectedProgram?.mode || 'Fizikal',
                                      schoolCode: row.schoolCode,
                                      icNumber: row.icNumber,
                                      participantName: row.participantName,
                                      participantEmail: row.email,
                                      schoolName: row.schoolName,
                                      position: row.position,
                                      state: row.state,
                                      registeredAt: new Date().toISOString(),
                                      status: 'attended',
                                      certificateIssued: true,
                                    };
                                    setPreviewReg(regObj);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                  title="Pratonton & Muat Turun Sijil Penyertaan PGB Ini"
                                >
                                  <Eye className="w-3.5 h-3.5 text-teal-700" />
                                  <span>Lihat / Muat Turun Sijil</span>
                                </button>
                              )}

                              {row.certificateIssued && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleCertificate(row)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Batal Keluaran Sijil"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TETAPAN TAJUK SIJIL & TANDATANGAN DIGITAL PENGERUSI (CMS)        */}
      {/* ========================================================================= */}
      {activeView === 'cert-settings' && (
        <form
          onSubmit={handleSaveCertConfig}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-150"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-teal-700" />
                Tetapan Sijil Penyertaan & Tandatangan Digital Pengerusi
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua perubahan tajuk sijil dan tandatangan digital Pengerusi akan digunakan secara
                automatik pada semua Sijil Penyertaan Program yang dimuat turun oleh PGB.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewReg(samplePreviewRegistration)}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-700" />
                <span>Pratonton Sijil Penuh (A4)</span>
              </button>
              <button
                type="submit"
                disabled={isSavingCertConfig}
                className="px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingCertConfig ? 'Menyimpan...' : 'Simpan Tetapan Sijil'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Certificate Title & Text Wording */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <h5 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  1. Tajuk Sijil & Kandungan Teks Rasmi
                </h5>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tajuk Utama Sijil (Boleh Diedit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={certForm.certificateTitle}
                    onChange={(e) =>
                      setCertForm({ ...certForm, certificateTitle: e.target.value })
                    }
                    placeholder="cth: SIJIL PENYERTAAN PROGRAM"
                    className="w-full px-3.5 py-2 text-sm font-black uppercase rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-teal-950"
                  />
                  {/* Quick preset chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold">Pilihan Pantas:</span>
                    {[
                      'SIJIL PENYERTAAN PROGRAM',
                      'SIJIL PENYERTAAN',
                      'SIJIL PENGHARGAAN & PENYERTAAN',
                      'SIJIL KEHADIRAN PROGRAM KEPIMPINAN',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCertForm({ ...certForm, certificateTitle: preset })}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-teal-50 text-teal-900 border border-slate-200 text-[10px] font-bold transition cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sub-Tajuk Organisasi Di Atas Sijil
                  </label>
                  <input
                    type="text"
                    value={certForm.certificateSubtitle}
                    onChange={(e) =>
                      setCertForm({ ...certForm, certificateSubtitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ayat Pengenalan Sijil
                    </label>
                    <input
                      type="text"
                      value={certForm.introText}
                      onChange={(e) => setCertForm({ ...certForm, introText: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ayat Pengesahan Kehadiran
                    </label>
                    <input
                      type="text"
                      value={certForm.participationText}
                      onChange={(e) =>
                        setCertForm({ ...certForm, participationText: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Klausa Pengiktirafan Sijil
                  </label>
                  <textarea
                    rows={2}
                    value={certForm.recognitionClause}
                    onChange={(e) =>
                      setCertForm({ ...certForm, recognitionClause: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Chairman Digital Signature & Signatory Details */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h5 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  2. Tandatangan Digital Pengerusi (Sign Digital Pengerusi)
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Penuh Pengerusi *
                    </label>
                    <input
                      type="text"
                      required
                      value={certForm.chairmanName}
                      onChange={(e) => setCertForm({ ...certForm, chairmanName: e.target.value })}
                      placeholder="USTAZ MOHAMAD FAIZ BIN AZIZAN"
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jawatan Rasmi Pengerusi *
                    </label>
                    <input
                      type="text"
                      required
                      value={certForm.chairmanRole}
                      onChange={(e) => setCertForm({ ...certForm, chairmanRole: e.target.value })}
                      placeholder="Pengerusi Kebangsaan MPGBSIM"
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Digital Signature Mode Tabs: Upload Image vs Draw Signature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Kaedah Tandatangan Digital Pengerusi:
                    </span>
                    <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSigMode('upload')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          sigMode === 'upload'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Muat Naik Imej Sign
                      </button>
                      <button
                        type="button"
                        onClick={() => setSigMode('draw')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          sigMode === 'draw'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Lukis Sign Digital
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Upload Signature Image */}
                  {sigMode === 'upload' && (
                    <div className="space-y-3">
                      <input
                        ref={sigFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processSignatureImageFile(file);
                          if (e.target) e.target.value = '';
                        }}
                      />

                      <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-teal-600/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-40 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
                            {certForm.chairmanSignatureImageUrl ? (
                              <img
                                src={certForm.chairmanSignatureImageUrl}
                                alt="Sign Digital Pengerusi"
                                className="max-h-16 max-w-full object-contain"
                              />
                            ) : (
                              <span
                                className="text-lg italic text-teal-900 font-serif"
                                style={{ fontFamily: "'Amiri', serif" }}
                              >
                                {certForm.chairmanSignatureText || 'Mohamad Faiz Azizan'}
                              </span>
                            )}
                          </div>
                          <div className="text-xs space-y-1">
                            <span className="font-bold text-slate-800 block">
                              {certForm.chairmanSignatureImageUrl
                                ? 'Imej Tandatangan Digital Aktif'
                                : 'Tandatangan Kaligrafi Default'}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              PNG lutsinar atau JPG (latar belakang putih dibersihkan automatik).
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => sigFileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Muat Naik Sign</span>
                          </button>
                          {certForm.chairmanSignatureImageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setCertForm({ ...certForm, chairmanSignatureImageUrl: '' })
                              }
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer"
                              title="Buang Imej Tandatangan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Interactive Canvas Signature Pad */}
                  {sigMode === 'draw' && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">
                          Lukis Tandatangan Pengerusi Di Bawah:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Warna Dakwat:</span>
                          {(
                            [
                              { color: '#0f172a', label: 'Hitam Rasmi' },
                              { color: '#134e4a', label: 'Hijau Teal' },
                              { color: '#1e3a8a', label: 'Biru Dakwat' },
                            ] as const
                          ).map((ink) => (
                            <button
                              key={ink.color}
                              type="button"
                              onClick={() => setPenColor(ink.color)}
                              className={`w-5 h-5 rounded-full border-2 cursor-pointer ${
                                penColor === ink.color
                                  ? 'border-amber-500 scale-110'
                                  : 'border-white'
                              }`}
                              style={{ backgroundColor: ink.color }}
                              title={ink.label}
                            />
                          ))}
                        </div>
                      </div>

                      <canvas
                        ref={canvasRef}
                        width={460}
                        height={150}
                        onMouseDown={startDrawing}
                        onMouseMove={drawMove}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={drawMove}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 cursor-crosshair touch-none"
                      />

                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={clearSignatureCanvas}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Padam Lukisan
                        </button>
                        <button
                          type="button"
                          onClick={applyDrawnSignature}
                          className="px-4 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Guna Tandatangan Lukisan Ini</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Walk-In Attendance Modal */}
      {isWalkInOpen && (
        <div className="fixed inset-0 z-[125] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900">
                Tambah Rekod Kehadiran PGB / Peserta
              </h4>
              <button
                type="button"
                onClick={() => setIsWalkInOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWalkInSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Penuh PGB *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="cth: Ustaz Ahmad bin Abdullah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jawatan</label>
                  <select
                    value={walkInPosition}
                    onChange={(e) => setWalkInPosition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Pengetua">Pengetua</option>
                    <option value="Guru Besar">Guru Besar</option>
                    <option value="Mudir">Mudir</option>
                    <option value="Penolong Kanan">Penolong Kanan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kod Sekolah</label>
                  <input
                    type="text"
                    value={walkInCode}
                    onChange={(e) => setWalkInCode(e.target.value)}
                    placeholder="cth: MJAC011"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Sekolah *</label>
                <input
                  type="text"
                  required
                  value={walkInSchool}
                  onChange={(e) => setWalkInSchool(e.target.value)}
                  placeholder="cth: Sekolah Rendah Islam Al-Amin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Kad Pengenalan</label>
                  <input
                    type="text"
                    value={walkInIc}
                    onChange={(e) => setWalkInIc(e.target.value)}
                    placeholder="Pilihan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emel PGB</label>
                  <input
                    type="email"
                    value={walkInEmail}
                    onChange={(e) => setWalkInEmail(e.target.value)}
                    placeholder="pgb@sekolah.edu.my"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Simpan Kehadiran & Sijil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Program Certificate Preview & PDF Download Modal */}
      <OfficialProgramCertificateModal
        isOpen={Boolean(previewReg)}
        onClose={() => setPreviewReg(null)}
        registration={previewReg}
        programEvent={selectedProgram}
        configOverride={activeView === 'cert-settings' ? certForm : undefined}
      />
    </div>
  );
};
