import { AlumniRecord } from '../types';

export const INITIAL_DEMO_ALUMNI: AlumniRecord[] = [
  {
    id: 'alm-demo-01',
    fullName: 'Dato\' Hj. Othman bin Salleh',
    title: 'Dato\' Hj.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    gender: 'Lelaki',
    email: 'othman.salleh@alumni.mpgbsim.edu.my',
    phone: '+60 19-321 8899',
    state: 'Selangor',
    lastPosition: 'Pengetua Cemerlang Gred Khas C',
    lastSchool: 'SMKA Maahad Hamidiah Kajang',
    careerStartYear: 1986,
    retirementYear: 2021,
    leadershipHistory: [
      {
        id: 'lh-1',
        schoolName: 'SMKA Maahad Hamidiah Kajang',
        position: 'Pengetua Cemerlang',
        startYear: 2012,
        endYear: 2021,
        state: 'Selangor',
        district: 'Hulu Langat',
        highlights: 'Memimpin sekolah mencapai pencapaian 100% lulus SPM & Pengurusan Dini Rabbani Terbaik Kebangsaan.'
      },
      {
        id: 'lh-2',
        schoolName: 'SAM Bestari Subang Jaya',
        position: 'Pengetua',
        startYear: 2004,
        endYear: 2012,
        state: 'Selangor',
        district: 'Petaling Perdana',
        highlights: 'Pelaksanaan Modul Tahfiz Model Ulul Albab awal & Pusat Kecemerlangan Dini Negeri.'
      },
      {
        id: 'lh-3',
        schoolName: 'SMKA Kuala Lumpur',
        position: 'Penolong Kanan Pentadbiran',
        startYear: 1996,
        endYear: 2004,
        state: 'Kuala Lumpur',
        district: 'Kuala Lumpur',
        highlights: 'Menyelaras pembangunan akademik dan sahsiah pelajar.'
      }
    ],
    expertise: [
      'Kepimpinan Instruksional Pendidikan Islam',
      'Pengurusan Dini Rabbani',
      'Pembangunan Kurikulum Tahfiz Sains',
      'Tata Kelola Sekolah Berprestasi Tinggi'
    ],
    biography: 'Servis kepimpinan selama 35 tahun dalam sektor Pendidikan Islam Kebangsaan. Telah memimpin beberapa sekolah menengah kebangsaan agama (SMKA) dan sekolah agama bantuan kerajaan (SABK) di Selangor dan Kuala Lumpur.',
    currentOrganisation: 'Lembaga Penasihat Pendidikan Islam Negeri Selangor (AJK Akademik)',
    awards: [
      'Tokoh Kepimpinan Pendidikan Islam Kebangsaan (2022)',
      'Pingat Dato\' Paduka Mahkota Selangor (DPMS)',
      'Anugerah Pengetua Cemerlang Kebangsaan KPM (2018)'
    ],
    achievements: [
      'Memacu SMKA Maahad Hamidiah mendapat Anugerah Sekolah Kluster Kecemerlangan.',
      'Menerbitkan 4 Modul Pengurusan Sahsiah dan Kepimpinan Pelajar Rabbani.',
      'Melatih lebih 300 SLT & PGB Sekolah Islam melalui program pementoran MPGBSIM.'
    ],
    projects: [
      'Inisiatif Wakaf Kampus Digital Sekolah Islam (2015–2020)',
      'Program Pertukaran Budaya & Tahfiz Antarabangsa Malaysia-Indonesia'
    ],
    innovations: [
      'Sistem Pemantauan Sahsiah & Murajaah Hafazan Digital (S-Murajaah)',
      'Modul Integrasi Naqli & Aqli (MINA)'
    ],
    contributions: 'Peneraju asas penstrukturan standard kurikulum Diniyah & Tahfiz serta pengasas bersama Program Pertukaran Kepimpinan PGB Sekolah Islam Kebangsaan.',
    mpgbsimRole: 'Timbalan Pengerusi Kebangsaan MPGBSIM',
    mpgbsimStartYear: 2010,
    mpgbsimEndYear: 2018,
    mpgbsimContribution: 'Merangka Rangka Tindakan Strategik MPGBSIM 2015–2020 dan mengetuai Biro Kurikulum & Akademik Kebangsaan.',
    legacyQuote: '“Pendidikan Rabbani bukan sekadar menyampaikan ilmu di bilik darjah, tetapi menyemai roh ketuhanan dan ikhlas dalam jiwa setiap pemimpin sekolah.”',
    consent: {
      allowPublicDisplay: true,
      allowSchoolHistory: true,
      allowExpertise: true,
      allowQuote: true,
      allowContact: false
    },
    verificationStatus: 'APPROVED',
    submittedAt: '2026-01-15T09:30:00Z',
    verifiedAt: '2026-01-18T14:20:00Z',
    verifiedBy: 'mpgbsim.cemerlang@gmail.com',
    featured: true,
    archived: false,
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-01-18T14:20:00Z'
  },
  {
    id: 'alm-demo-02',
    fullName: 'Datin Hjh. Zubaidah binti Ahmad',
    title: 'Datin Hjh.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    gender: 'Perempuan',
    email: 'zubaidah.ahmad@alumni.mpgbsim.edu.my',
    phone: '+60 12-887 2211',
    state: 'Johor',
    lastPosition: 'Guru Besar Cemerlang',
    lastSchool: 'Sekolah Rendah Islam Hidayah Johor Bahru',
    careerStartYear: 1990,
    retirementYear: 2023,
    leadershipHistory: [
      {
        id: 'lh-201',
        schoolName: 'Sekolah Rendah Islam Hidayah Johor Bahru',
        position: 'Guru Besar',
        startYear: 2008,
        endYear: 2023,
        state: 'Johor',
        district: 'Johor Bahru',
        highlights: 'Membangunkan ekosistem sekolah rendah Islam swasta bertaraf lima bintang dengan enrolmen murid melebihi 1,200 orang.'
      },
      {
        id: 'lh-202',
        schoolName: 'SRI Al-Irsyad Kuantan',
        position: 'Penolong Kanan Hal Ehwal Murid',
        startYear: 1998,
        endYear: 2008,
        state: 'Pahang',
        district: 'Kuantan',
        highlights: 'Merintis sistem disiplin dan bina insan murid rendah.'
      }
    ],
    expertise: [
      'Pengurusan Sekolah Rendah Islam Swasta',
      'Pendidikan Awal Kanak-Kanak & Sahsiah Rabbani',
      'Pembangunan Guru & Tadbir Urus Sekolah Musleh',
      'Pengurusan Kewangan & Dana Pendidikan'
    ],
    biography: 'Berkhidmat selama 33 tahun memacu institusi pendidikan rendah Islam di Johor dan Pahang. Pelopor kaedah pembelajaran berasaskan nilai dan aktiviti luar bilik darjah.',
    currentOrganisation: 'Konsultan Bebas Kepimpinan Pendidikan Rendah Islam',
    awards: [
      'Anugerah Guru Besar Cemerlang Kebangsaan (2020)',
      'Pingat Jasa Pemimpin Pendidikan Johor (2021)'
    ],
    achievements: [
      'Melahirkan ribuan alumni Sekolah Rendah Islam Hidayah yang cemerlang dalam pelbagai bidang profesional.',
      'Membina model pengurusan kantin dan persekitaran iklim Rabbani terbaik negeri Johor.'
    ],
    projects: [
      'Projek Pembinaan Bangunan Akademik Bersepadu SRI Hidayah (RM 4.5 Juta)',
      'Modul Pendidikan Sahsiah Awal Anak-Anak Rabbani'
    ],
    innovations: [
      'Modul Amalan Sunnah Harian (MASH) Sekolah Rendah',
      'Kad Laporan Sahsiah Bersepadu Parent-Teacher'
    ],
    contributions: 'Penceramah jemputan Konvensyen PGB Sekolah Islam dan jawatankuasa penilaian standard kualiti sekolah ahli MPGBSIM.',
    mpgbsimRole: 'Ahli AJK Kebangsaan (Biro Sekolah Rendah & Swasta)',
    mpgbsimStartYear: 2012,
    mpgbsimEndYear: 2022,
    mpgbsimContribution: 'Aktif merangka garis panduan akreditasi sekolah rendah Islam dan penganjuran bengkel kepimpinan pentadbir wanita.',
    legacyQuote: '“Ikhlas dan sabar dalam mendidik murid-murid di peringkat sekolah rendah adalah pelaburan akhirat yang tidak pernah rugi.”',
    consent: {
      allowPublicDisplay: true,
      allowSchoolHistory: true,
      allowExpertise: true,
      allowQuote: true,
      allowContact: false
    },
    verificationStatus: 'APPROVED',
    submittedAt: '2026-02-01T11:00:00Z',
    verifiedAt: '2026-02-05T09:15:00Z',
    verifiedBy: 'mpgbsim.cemerlang@gmail.com',
    featured: true,
    archived: false,
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-05T09:15:00Z'
  },
  {
    id: 'alm-demo-03',
    fullName: 'Ustaz Dr. Abdul Rahman bin Hashim',
    title: 'Dr. Ustaz',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    gender: 'Lelaki',
    email: 'rahman.hashim@alumni.mpgbsim.edu.my',
    phone: '+60 13-991 3344',
    state: 'Kedah',
    lastPosition: 'Pengetua & Pengarah Pengajian Diniyah',
    lastSchool: 'SMA Darul Aman Al-Islamiah Alor Setar',
    careerStartYear: 1989,
    retirementYear: 2022,
    leadershipHistory: [
      {
        id: 'lh-301',
        schoolName: 'SMA Darul Aman Al-Islamiah Alor Setar',
        position: 'Pengetua',
        startYear: 2010,
        endYear: 2022,
        state: 'Kedah',
        district: 'Kota Setar',
        highlights: 'Memimpin transformasi sekolah bantuan kerajaan kepada institusi tahfiz sains contoh.'
      },
      {
        id: 'lh-302',
        schoolName: 'Maahad Mahmud Pendang',
        position: 'Pengetua',
        startYear: 2001,
        endYear: 2010,
        state: 'Kedah',
        district: 'Pendang',
        highlights: 'Mengukuhkan pengajian Bahasa Arab dan Syariah bertaraf antarabangsa.'
      }
    ],
    expertise: [
      'Pengajian Turath & Syariah Diniyah',
      'Kepimpinan Pentadbiran Maahad & Sabk',
      'Integrasi STEM & Tahfiz Al-Quran',
      'Kerjasama Akademik Universiti Antarabangsa'
    ],
    biography: 'Tokoh ilmuwan dan bekas pengetua yang berpengalaman luas dalam sistem pengajian Diniyah di Kedah. Pemegang Ijazah Doktor Falsafah Syariah dari Universiti Al-Azhar, Mesir.',
    currentOrganisation: 'Pensyarah Pelawat Kolej Universiti Islam Antarabangsa Sultan Abdul Halim Mu\'adzam Shah (KUIPs)',
    awards: [
      'Tokoh Maulidur Rasul Negeri Kedah (2023)',
      'Pingat Ahli Mahkota Kedah (AMK)',
      'Anugerah Khas Pengerusi MPGBSIM (2022)'
    ],
    achievements: [
      'Menerbitkan 8 buah buku teks dan modul pengajian Bahasa Arab Sekolah Agama.',
      'Mengasaskan Program Interprestasi Al-Quran dan Sains untuk pelajar SMKA/SABK.'
    ],
    projects: [
      'Projek Pemerkasaan Turath Bahasa Arab Kebangsaan',
      'Jaringan Sekolah Agama Malaysia-Mesir-Jordan'
    ],
    innovations: [
      'Kaedah Pantas Hafazan Al-Quran "Al-Fath"',
      'Aplikasi Kamus Diniyah Digital'
    ],
    contributions: 'Penasihat Akademik MPGBSIM dan perangka Modul Turath Kepimpinan Pengetua Sekolah Agama Kebangsaan.',
    mpgbsimRole: 'Ketua Biro Akademik & Hal Ehwal Antarabangsa MPGBSIM',
    mpgbsimStartYear: 2011,
    mpgbsimEndYear: 2021,
    mpgbsimContribution: 'Memimpin delegasi kepimpinan MPGBSIM ke Universiti Al-Azhar Mesir & Universiti Yarmouk Jordan bagi jalinan biasiswa alumni.',
    legacyQuote: '“Kekuatan sekolah Islam terletak pada keikhlasan ilmu dan keutuhan akhlak para pentadbirnya.”',
    consent: {
      allowPublicDisplay: true,
      allowSchoolHistory: true,
      allowExpertise: true,
      allowQuote: true,
      allowContact: false
    },
    verificationStatus: 'APPROVED',
    submittedAt: '2026-02-10T14:15:00Z',
    verifiedAt: '2026-02-12T16:00:00Z',
    verifiedBy: 'mpgbsim.cemerlang@gmail.com',
    featured: true,
    archived: false,
    createdAt: '2026-02-10T14:15:00Z',
    updatedAt: '2026-02-12T16:00:00Z'
  },
  {
    id: 'alm-demo-04',
    fullName: 'Hj. Mohamad Zakaria bin Ismail',
    title: 'Hj.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    gender: 'Lelaki',
    email: 'zakaria.ismail@alumni.mpgbsim.edu.my',
    phone: '+60 19-771 5566',
    state: 'Kelantan',
    lastPosition: 'Pengetua Cemerlang',
    lastSchool: 'Maahad Muhammadi Lelaki Kota Bharu',
    careerStartYear: 1988,
    retirementYear: 2023,
    leadershipHistory: [
      {
        id: 'lh-401',
        schoolName: 'Maahad Muhammadi Lelaki Kota Bharu',
        position: 'Pengetua',
        startYear: 2011,
        endYear: 2023,
        state: 'Kelantan',
        district: 'Kota Bharu',
        highlights: 'Mengekalkan rekod pencapaian 100% lulus STAM & SPM selama 12 tahun berturut-turut.'
      },
      {
        id: 'lh-402',
        schoolName: 'SMKA Naim Lilbanat',
        position: 'Penolong Kanan Pentadbiran',
        startYear: 2002,
        endYear: 2011,
        state: 'Kelantan',
        district: 'Kota Bharu',
        highlights: 'Menyelaras program akademik cemerlang SPM.'
      }
    ],
    expertise: [
      'Pengurusan Kurikulum STAM & SPM Dini',
      'Kepimpinan Motivasi Pelajar Rabbani',
      'Pembangunan Modal Insan Sekolah Agama',
      'Pengurusan Badan Kebajikan & Hal Ehwal Pelajar'
    ],
    biography: 'Berkhidmat lebih 35 tahun melahirkan tokoh ulama, akademik dan cendekiawan Islam di Kelantan. Terkenal dengan pendekatan kepimpinan keibubapaan dan penyayang.',
    currentOrganisation: 'Penasihat Persatuan Bekas Pelajar Maahad Muhammadi',
    awards: [
      'Anugerah Tokoh Guru Kelantan (2024)',
      'Pingat Setia Jiwa Kelantan (SJK)'
    ],
    achievements: [
      'Membawa Maahad Muhammadi Lelaki menjuarai Debat Bahasa Arab Kebangsaan 5 kali.',
      'Melatih lebih 50 orang guru muda menjadi pentadbir sekolah agama.'
    ],
    projects: [
      'Menaik Naik Alat Perkakas Makmal Komputer & Pusat Sumber Digital Maahad',
      'Program Pembangunan Sahsiah Pemimpin Muda'
    ],
    innovations: [
      'Modul Bina Minda STAM Cemerlang'
    ],
    contributions: 'Penceramah jemputan seminar kebangsaan pengurusan sekolah Dini YIK dan Jabatan Agama Islam.',
    mpgbsimRole: 'AJK Kebangsaan Zon Timur MPGBSIM',
    mpgbsimStartYear: 2013,
    mpgbsimEndYear: 2023,
    mpgbsimContribution: 'Menganjurkan Konvensyen Kepimpinan PGB Zon Timur 2018 & 2021 di Kota Bharu.',
    legacyQuote: '“Kemuliaan seorang guru dan pentadbir terletak pada ketaqwaan murid yang dididiknya selepas mereka keluar ke masyarakat.”',
    consent: {
      allowPublicDisplay: true,
      allowSchoolHistory: true,
      allowExpertise: true,
      allowQuote: true,
      allowContact: false
    },
    verificationStatus: 'APPROVED',
    submittedAt: '2026-02-15T08:00:00Z',
    verifiedAt: '2026-02-18T10:30:00Z',
    verifiedBy: 'mpgbsim.cemerlang@gmail.com',
    featured: false,
    archived: false,
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-18T10:30:00Z'
  }
];
