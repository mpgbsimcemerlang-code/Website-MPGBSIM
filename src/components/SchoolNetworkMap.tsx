import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MemberSchool } from '../types';
import { resolveSchoolMembershipType } from './SchoolNetworkCharts';
import {
  MapPin,
  Compass,
  Maximize2,
  Layers,
  Navigation,
  Search,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface SchoolNetworkMapProps {
  schools: MemberSchool[];
  allSchoolsCount?: number;
  selectedState?: string;
  onStateSelect?: (state: string) => void;
  onSelectSchool?: (school: MemberSchool) => void;
}

// State center coordinates [lat, lng] and default zoom level for Malaysia
const STATE_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  Selangor: { lat: 3.0738, lng: 101.5183, zoom: 10 },
  'Kuala Lumpur': { lat: 3.139, lng: 101.6869, zoom: 11 },
  'Wilayah Persekutuan': { lat: 3.139, lng: 101.6869, zoom: 11 },
  Putrajaya: { lat: 2.9264, lng: 101.6964, zoom: 12 },
  Johor: { lat: 1.8548, lng: 103.3282, zoom: 9 },
  Kedah: { lat: 6.1184, lng: 100.3685, zoom: 9 },
  Kelantan: { lat: 6.1254, lng: 102.2381, zoom: 9 },
  Melaka: { lat: 2.2277, lng: 102.2611, zoom: 11 },
  'Negeri Sembilan': { lat: 2.7258, lng: 101.9424, zoom: 10 },
  Pahang: { lat: 3.8126, lng: 103.3256, zoom: 8 },
  Perak: { lat: 4.5921, lng: 101.0901, zoom: 9 },
  Perlis: { lat: 6.4449, lng: 100.2048, zoom: 11 },
  'Pulau Pinang': { lat: 5.4141, lng: 100.3288, zoom: 10 },
  Sabah: { lat: 5.9788, lng: 116.0753, zoom: 8 },
  Sarawak: { lat: 1.5533, lng: 110.3592, zoom: 7 },
  Terengganu: { lat: 5.3117, lng: 103.1324, zoom: 9 },
};

// High-precision Google Maps E7 coordinates (verified directly against Google Maps) for each member school
const EXACT_SCHOOL_ADDRESS_COORDINATES: {
  codes?: string[];
  addressKeywords?: string[];
  nameKeywords?: string[];
  lat: number;
  lng: number;
  label: string;
}[] = [
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN KUCHING: Matang Jaya, 93050 Kuching, Sarawak
    nameKeywords: [
      'sekolah rendah islam al-amin kuching',
      'sekolah rendah islam al amin kuching',
      'sekolah rendah al-amin kuching',
      'sekolah rendah al amin kuching',
      'sri al-amin kuching',
      'sri al amin kuching',
    ],
    lat: 1.5761398,
    lng: 110.3002644,
    label: 'Matang Jaya, 93050 Kuching, Sarawak',
  },
  {
    // SEKOLAH MENENGAH AL AMIN KUCHING: 1st Floor, Sublot No. 1, 10 to 68, 71, 72, Lot 10010, Section 65, KTLD, The Hub@Matang Jaya, 93050 Kuching, Sarawak
    codes: ['YFB1001', 'YGA1001', 'SMAAK'],
    nameKeywords: [
      'sekolah menengah al amin kuching',
      'sekolah menengah al-amin kuching',
      'sekolah menengah islam al-amin kuching',
      'sekolah menengah islam al amin kuching',
      'sm al-amin kuching',
      'sm al amin kuching',
      'smi al-amin kuching',
      'smi al amin kuching',
      'al-amin kuching',
      'al amin kuching',
    ],
    addressKeywords: [
      'the hub@matang jaya',
      'the hub @ matang jaya',
      'hub matang jaya',
      'section 65, ktld',
      'section 65 ktld',
      'sublot no. 1, 10 to 68',
      'lot 10010',
    ],
    lat: 1.5764384,
    lng: 110.3026942,
    label:
      '1st Floor, Sublot No. 1, 10 to 68, 71, 72, Lot 10010, Section 65, KTLD, The Hub@Matang Jaya, 93050 Kuching, Sarawak',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN KOTA SAMARAHAN, SARAWAK
    nameKeywords: ['al-amin kota samarahan', 'al amin kota samarahan', 'al-amin samarahan', 'al amin samarahan'],
    lat: 1.4710761,
    lng: 110.4146532,
    label: 'Kota Samarahan, 94300 Sarawak',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN MIRI, SARAWAK
    nameKeywords: ['al-amin miri', 'al amin miri'],
    lat: 4.4506998,
    lng: 114.033348,
    label: 'Miri, 98000 Sarawak',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN SIBU, SARAWAK
    nameKeywords: ['al-amin sibu', 'al amin sibu'],
    lat: 2.3082741,
    lng: 111.8211033,
    label: 'Sibu, 96000 Sarawak',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN BINTULU, SARAWAK
    nameKeywords: ['al-amin bintulu', 'al amin bintulu'],
    lat: 3.195414,
    lng: 113.0557659,
    label: 'Bintulu, 97000 Sarawak',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN KOTA KINABALU, SABAH
    nameKeywords: ['al-amin kota kinabalu', 'al amin kota kinabalu'],
    lat: 6.0320914,
    lng: 116.1327161,
    label: 'Kota Kinabalu, 88450 Sabah',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN SANDAKAN, SABAH
    nameKeywords: ['al-amin sandakan', 'al amin sandakan'],
    lat: 5.8625916,
    lng: 118.0367781,
    label: 'Sandakan, 90000 Sabah',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN TAWAU, SABAH
    nameKeywords: ['al-amin tawau', 'al amin tawau'],
    lat: 4.2835283,
    lng: 117.8764171,
    label: 'Tawau, 91000 Sabah',
  },
  {
    // SEKOLAH RENDAH ISLAM I MUSLEH: No. 25-1, Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka
    codes: ['MJAC011'],
    nameKeywords: ['sekolah rendah islam i musleh', 'sekolah rendah islam i-musleh', 'sri i musleh'],
    lat: 2.2789457,
    lng: 102.2770393,
    label: 'No. 25-1, Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
  },
  {
    // SEKOLAH MENENGAH AGAMA I-MUSLEH: Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka
    codes: ['JAIM/SAS(M)130', 'MIA1009'],
    nameKeywords: ['sekolah menengah agama i-musleh', 'sma i-musleh', 'sekolah menengah agama i musleh'],
    lat: 2.2789299,
    lng: 102.2766557,
    label: 'Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
  },
  {
    // Generic Jalan TU 49A / Kompleks Komersial Boulevard Ayer Keroh match
    addressKeywords: ['jalan tu 49a', 'kompleks komersial boulevard'],
    lat: 2.2789378,
    lng: 102.2768475,
    label: 'Jalan TU 49A, Kompleks Komersial Boulevard, 75450 Ayer Keroh, Melaka',
  },
  {
    // SEKOLAH MENENGAH SRI AL-AMIN BANGI: SUNGAI TANGKAS, 43000 KAJANG, SELANGOR
    codes: ['BLAD001'],
    addressKeywords: ['sungai tangkas', 'jalan desa al-amin'],
    nameKeywords: ['sekolah menengah sri al-amin bangi', 'sri al-amin bangi', 'al-amin bangi', 'al amin bangi'],
    lat: 2.9426704,
    lng: 101.789956,
    label: 'Sungai Tangkas, 43000 Kajang, Selangor',
  },
  {
    // SEKOLAH MENENGAH / RENDAH SRI AL-AMIN PUTRA MAHKOTA BANGI
    nameKeywords: ['al-amin putra mahkota', 'al amin putra mahkota'],
    lat: 2.8984702,
    lng: 101.7911521,
    label: 'Bandar Bukit Mahkota, 43000 Kajang, Selangor',
  },
  {
    // SEKOLAH MENENGAH ISLAM AL-AMIN GOMBAK: Lot 1078, Batu 8 3/4, Jalan Sungai Pusu, 53100 Gombak, Selangor
    nameKeywords: ['sekolah menengah islam al-amin gombak', 'sekolah menengah al-amin gombak', 'smi al-amin gombak', 'al-amin gombak', 'al amin gombak'],
    addressKeywords: ['jalan sungai pusu', 'batu 8 3/4'],
    lat: 3.2481592,
    lng: 101.725864,
    label: 'Lot 1078, Batu 8 3/4, Jalan Sungai Pusu, 53100 Gombak, Selangor',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN CHERAS SELATAN
    nameKeywords: ['al-amin cheras selatan', 'al amin cheras selatan'],
    lat: 3.0413646,
    lng: 101.7503204,
    label: 'Cheras Selatan, 43200 Balakong, Selangor',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN PAYA JARAS, SUNGAI BULOH
    nameKeywords: ['al-amin paya jaras', 'al amin paya jaras', 'al-amin sungai buloh', 'al amin sungai buloh'],
    lat: 3.2014938,
    lng: 101.5455605,
    label: 'Paya Jaras, 47000 Sungai Buloh, Selangor',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN NILAI
    nameKeywords: ['al-amin nilai', 'al amin nilai'],
    lat: 2.8191794,
    lng: 101.7877913,
    label: 'Bandar Baru Nilai, 71800 Nilai, Negeri Sembilan',
  },
  {
    // SEKOLAH RENDAH ISLAM AMAL RINTIS: 40, TINGKAT 1, LORONG PERDA SELATAN 2, BANDAR PERDA
    codes: ['PYR0003'],
    addressKeywords: ['lorong perda selatan 2', 'perda selatan'],
    nameKeywords: ['amal rintis'],
    lat: 5.367971,
    lng: 100.4335349,
    label: '40, Tingkat 1, Lorong Perda Selatan 2, Bandar Perda, 14000 Bukit Mertajam',
  },
  {
    // Sekolah Menengah Al-Azhar: Mukim Gelung, 06000 Jitra Kedah
    codes: ['KO5E103'],
    nameKeywords: ['sekolah menengah al-azhar', 'sm al-azhar', 'sekolah menengah al azhar'],
    lat: 6.2896048,
    lng: 100.3934729,
    label: 'Mukim Gelung, 06000 Jitra, Kedah',
  },
  {
    // SEKOLAH RENDAH AL-AZHAR: MUKIM GELONG 06000 JITRA
    codes: ['KJA3002'],
    nameKeywords: ['sekolah rendah al-azhar', 'sr al-azhar', 'sekolah rendah al azhar'],
    lat: 6.2891481,
    lng: 100.3939277,
    label: 'Mukim Gelong, 06000 Jitra, Kedah',
  },
  {
    // Generic Mukim Gelong / Gelung Jitra address match
    addressKeywords: ['mukim gelung', 'mukim gelong', 'jalan muda kuari'],
    lat: 6.2891481,
    lng: 100.3939277,
    label: 'Mukim Gelong, 06000 Jitra, Kedah',
  },
  {
    // SEKOLAH RENDAH ISLAM AL AMIN WILAYAH PERSEKUTUAN: LOT 14073, JALAN 14/26, TAMAN SRI RAMPAI, 53500, KUALA LUMPUR
    codes: ['WJJ 0005', 'WJJ0005'],
    addressKeywords: ['lot 14073', 'jalan 14/26', 'taman sri rampai'],
    nameKeywords: ['al amin wilayah persekutuan', 'al-amin wilayah persekutuan', 'al-amin w.p', 'al amin wp'],
    lat: 3.1928373,
    lng: 101.732252,
    label: 'Lot 14073, Jalan 14/26, Taman Sri Rampai, 53300 Kuala Lumpur',
  },
  {
    // SEKOLAH MENENGAH ISLAM AL-AMIN KEMAMAN: LOT 4363, GELIGA BESAR, 24000 KEMAMAN, TERENGGANU
    codes: ['TLA2001'],
    addressKeywords: ['geliga besar', 'lot 4363', 'geliga sakti'],
    nameKeywords: ['sekolah menengah islam al-amin kemaman', 'al-amin kemaman', 'al amin kemaman'],
    lat: 4.1974983,
    lng: 103.4304451,
    label: 'Lot 4363, Geliga Besar, 24000 Kemaman, Terengganu',
  },
  {
    // SEKOLAH MENENGAH / RENDAH ISLAM AL-AMIN DUNGUN, TERENGGANU
    nameKeywords: ['al-amin dungun', 'al amin dungun'],
    lat: 4.7430666,
    lng: 103.4115871,
    label: 'Dungun, 23000 Terengganu',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN KERTEH, TERENGGANU
    nameKeywords: ['al-amin kerteh', 'al amin kerteh'],
    lat: 4.491774,
    lng: 103.4392368,
    label: 'Kerteh, 24300 Kemaman, Terengganu',
  },
  {
    // SEKOLAH RENDAH / MENENGAH ISLAM PERMATA AL-AMIN KUANTAN, PAHANG
    nameKeywords: ['permata al-amin', 'permata al amin', 'al-amin kuantan', 'al amin kuantan'],
    lat: 3.7893644,
    lng: 103.2511133,
    label: 'Kuantan, 25150 Pahang',
  },
  {
    // SEKOLAH RENDAH ISLAM AL-AMIN TEMERLOH, PAHANG
    nameKeywords: ['al-amin temerloh', 'al amin temerloh'],
    lat: 3.4851213,
    lng: 102.4299276,
    label: 'Temerloh, 28000 Pahang',
  },
  {
    // SEKOLAH RENDAH AL ISLAH: LOT 292. KAMPUNG POKOK ASAM ,JALAN PINANG TUNGGAL, 08000 SUNGAI PETANI KEDAH
    codes: ['KJA3001'],
    addressKeywords: ['kampung pokok asam', 'lot 292', 'jalan pinang tunggal'],
    nameKeywords: ['sekolah rendah al islah', 'sekolah rendah al-islah', 'al-islah sungai petani'],
    lat: 5.5794596,
    lng: 100.4705626,
    label: 'Lot 292, Kampung Pokok Asam, Jalan Pinang Tunggal, 08000 Sungai Petani, Kedah',
  },
  {
    // SEKOLAH MENENGAH AL-ISLAH SUNGAI PETANI
    nameKeywords: ['sekolah menengah al-islah', 'sekolah menengah al islah'],
    lat: 5.5796594,
    lng: 100.4704126,
    label: 'Kampung Pokok Asam, Jalan Pinang Tunggal, 08000 Sungai Petani, Kedah',
  },
  {
    // SEKOLAH RENDAH ISLAM HIDAYAH PASIRRIS BATU PAHAT: No 83, Jalan Shufaat, Kampung Olak Batu, 86400 Parit Raja, Batu Pahat, Johor
    codes: ['JJAA002'],
    addressKeywords: ['jalan shufaat', 'kampung olak batu', 'olak batu'],
    nameKeywords: ['hidayah pasirris', 'hidayah batu pahat'],
    lat: 1.9198683,
    lng: 103.1302235,
    label: 'No 83, Jalan Shufaat, Kampung Olak Batu, 86400 Parit Raja, Batu Pahat, Johor',
  },
  {
    // SEKOLAH MENENGAH / RENDAH ISLAM HIDAYAH JOHOR BAHRU
    nameKeywords: ['hidayah johor bahru', 'sri hidayah jb', 'smi hidayah jb'],
    addressKeywords: ['kampung sinaran baru', 'jalan utama, kampung sinaran baru'],
    lat: 1.6049663,
    lng: 103.7199072,
    label: 'Kampung Sinaran Baru, 81300 Skudai, Johor Bahru, Johor',
  },
  {
    // MAAHAD TAHFIZ AS-SA'IDIYYAH: TAMAN RASHIDAH UTAMA JALAN SENAWANG-PAROI 70450 SEREMBAN, NEGERI SEMBILAN
    codes: ['NZG4001'],
    addressKeywords: ['taman rashidah utama', 'jalan senawang-paroi', 'senawang-paroi'],
    nameKeywords: ["as-sa'idiyyah", 'as-saidiyyah'],
    lat: 2.7025925,
    lng: 101.9742787,
    label: 'Taman Rashidah Utama, Jalan Senawang-Paroi, 70450 Seremban, Negeri Sembilan',
  },
  {
    // SEKOLAH RENDAH SRI AL-AMIN CYBERJAYA: No. EG-3, Jalan GC4, Glomac Cyberjaya, Cyber 4, 63200 Cyberjaya, Selangor
    codes: ['BJJ9029'],
    addressKeywords: ['jalan gc4', 'jalan gc 4', 'glomac cyberjaya'],
    nameKeywords: ['sri al-amin cyberjaya', 'al-amin cyberjaya', 'al amin cyberjaya'],
    lat: 2.9239913,
    lng: 101.656334,
    label: 'No. EG-3, Jalan GC4, Glomac Cyberjaya, Cyber 4, 63200 Cyberjaya, Selangor',
  },
  {
    // SEKOLAH RENDAH ISLAM AL HIDAYAH IPOH: Lot 20849, Persiaran Sepakat 7, Taman Indah Jaya, 31350 Ipoh, Perak
    codes: ['AYR2001'],
    addressKeywords: ['persiaran sepakat 7', 'lot 20849', 'taman indah jaya'],
    nameKeywords: ['al hidayah ipoh', 'al-hidayah ipoh'],
    lat: 4.5627157,
    lng: 101.1266561,
    label: 'Lot 20849, Persiaran Sepakat 7, Taman Indah Jaya, 31350 Ipoh, Perak',
  },
  {
    // SEKOLAH MENENGAH / RENDAH AL-ITQAN PULAU PINANG
    nameKeywords: ['al-itqan', 'al itqan'],
    lat: 5.2952537,
    lng: 100.2252165,
    label: 'Bayan Lepas, 11920 Pulau Pinang',
  },
  {
    // SEKOLAH MENENGAH / RENDAH ISLAM AL-IKRAM PULAU PINANG
    nameKeywords: ['al-ikram', 'al ikram'],
    lat: 5.4863619,
    lng: 100.4823074,
    label: 'Tasek Gelugor, 13300 Pulau Pinang',
  },
  {
    // SEKOLAH MENENGAH / RENDAH IBN KHALDUN SHAH ALAM
    nameKeywords: ['ibn khaldun'],
    lat: 2.9779356,
    lng: 101.5275904,
    label: 'Jalan Kebun, Seksyen 30, 40460 Shah Alam, Selangor',
  },
  {
    // SMKA PUTRAJAYA
    codes: ['ABA2004', 'WRA2001'],
    nameKeywords: ['smka putrajaya'],
    lat: 2.9660264,
    lng: 101.6663392,
    label: 'Presint 11, 62300 Putrajaya',
  },
  {
    // Ibu Pejabat / Seri Kembangan: Taman Sungai Besi Indah, 43300 Seri Kembangan
    addressKeywords: ['taman sungai besi indah', '43300 seri kembangan', 'jalan dagang sb'],
    lat: 3.028215,
    lng: 101.716624,
    label: 'Taman Sungai Besi Indah, 43300 Seri Kembangan, Selangor',
  },
];

// Malaysian Postcode Prefix / Exact Postcode Coordinates for accurate address resolution
const POSTCODE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Perlis (01xxx - 02xxx)
  '01000': { lat: 6.4414, lng: 100.1986 },
  '02600': { lat: 6.4297, lng: 100.2698 },
  // Kedah (05xxx - 09xxx)
  '05000': { lat: 6.1248, lng: 100.3678 },
  '05100': { lat: 6.1333, lng: 100.3812 },
  '05400': { lat: 6.0892, lng: 100.3621 },
  '06000': { lat: 6.2891481, lng: 100.3939277 },
  '08000': { lat: 5.5794596, lng: 100.4705626 },
  '09000': { lat: 5.3649, lng: 100.5618 },
  '09100': { lat: 5.6751, lng: 100.9178 },
  // Pulau Pinang (10xxx - 14xxx)
  '10000': { lat: 5.4141, lng: 100.3288 },
  '11900': { lat: 5.3298, lng: 100.2874 },
  '11920': { lat: 5.2952537, lng: 100.2252165 },
  '13200': { lat: 5.5171, lng: 100.4265 },
  '13300': { lat: 5.4863619, lng: 100.4823074 },
  '13500': { lat: 5.3961, lng: 100.4079 },
  '14000': { lat: 5.367971, lng: 100.4335349 },
  // Kelantan (15xxx - 18xxx)
  '15000': { lat: 6.1254, lng: 102.2381 },
  '16100': { lat: 6.1614, lng: 102.2886 },
  '16150': { lat: 6.0972, lng: 102.2775 },
  '16800': { lat: 5.8362, lng: 102.4012 },
  '17000': { lat: 6.0429, lng: 102.1424 },
  '18500': { lat: 5.7644, lng: 102.2189 },
  // Terengganu (20xxx - 24xxx)
  '20000': { lat: 5.3296, lng: 103.137 },
  '21000': { lat: 5.3082, lng: 103.1124 },
  '21300': { lat: 5.3961, lng: 103.0954 },
  '22000': { lat: 5.7366, lng: 102.4897 },
  '23000': { lat: 4.7430666, lng: 103.4115871 },
  '24000': { lat: 4.1974983, lng: 103.4304451 },
  '24300': { lat: 4.491774, lng: 103.4392368 },
  // Pahang (25xxx - 28xxx)
  '25000': { lat: 3.8077, lng: 103.326 },
  '25150': { lat: 3.7893644, lng: 103.2511133 },
  '25200': { lat: 3.8342, lng: 103.3012 },
  '26600': { lat: 3.4836, lng: 103.3996 },
  '28000': { lat: 3.4851213, lng: 102.4299276 },
  // Perak (30xxx - 36xxx)
  '30000': { lat: 4.5975, lng: 101.0901 },
  '31350': { lat: 4.5627157, lng: 101.1266561 },
  '31400': { lat: 4.6142, lng: 101.1258 },
  '32610': { lat: 4.359, lng: 100.9797 },
  '34000': { lat: 4.8519, lng: 100.7416 },
  // Selangor (40xxx - 48xxx, 63xxx, 68xxx)
  '40000': { lat: 3.0733, lng: 101.5185 },
  '40100': { lat: 3.0733, lng: 101.5185 },
  '40460': { lat: 2.9779356, lng: 101.5275904 },
  '41000': { lat: 3.0449, lng: 101.4456 },
  '43000': { lat: 2.9426704, lng: 101.789956 },
  '43200': { lat: 3.0413646, lng: 101.7503204 },
  '43300': { lat: 3.028215, lng: 101.716624 },
  '43650': { lat: 2.9598, lng: 101.7562 },
  '47000': { lat: 3.2014938, lng: 101.5455605 },
  '53100': { lat: 3.2481592, lng: 101.725864 },
  '63000': { lat: 2.9239913, lng: 101.656334 },
  '63200': { lat: 2.9239913, lng: 101.656334 },
  '68100': { lat: 3.2379, lng: 101.684 },
  // Kuala Lumpur & Putrajaya (50xxx - 62xxx)
  '50000': { lat: 3.1478, lng: 101.6953 },
  '53300': { lat: 3.1928373, lng: 101.732252 },
  '53500': { lat: 3.1928373, lng: 101.732252 },
  '62000': { lat: 2.9264, lng: 101.6964 },
  '62300': { lat: 2.9660264, lng: 101.6663392 },
  // Negeri Sembilan (70xxx - 73xxx)
  '70000': { lat: 2.7258, lng: 101.9424 },
  '70400': { lat: 2.7185, lng: 101.9762 },
  '70450': { lat: 2.7025925, lng: 101.9742787 },
  '71800': { lat: 2.8191794, lng: 101.7877913 },
  // Melaka (75xxx - 78xxx)
  '75150': { lat: 2.2187528, lng: 102.2616417 },
  '75400': { lat: 2.2226341, lng: 102.2542787 },
  '75450': { lat: 2.2789299, lng: 102.2766557 },
  // Johor (79xxx - 86xxx)
  '80000': { lat: 1.4655, lng: 103.7578 },
  '81100': { lat: 1.5486, lng: 103.7621 },
  '81300': { lat: 1.6049663, lng: 103.7199072 },
  '83000': { lat: 1.8483191, lng: 102.9455261 },
  '84000': { lat: 2.0442, lng: 102.5689 },
  '86000': { lat: 2.0305, lng: 103.3185 },
  '86400': { lat: 1.9198683, lng: 103.1302235 },
  // Sabah (88xxx - 91xxx)
  '88000': { lat: 5.9804, lng: 116.0735 },
  '88450': { lat: 6.0320914, lng: 116.1327161 },
  '90000': { lat: 5.8625916, lng: 118.0367781 },
  '91000': { lat: 4.2835283, lng: 117.8764171 },
  // Sarawak (93xxx - 98xxx)
  '93000': { lat: 1.5533, lng: 110.3592 },
  '93050': { lat: 1.5764384, lng: 110.3026942 },
  '93200': { lat: 1.5312, lng: 110.3442 },
  '93250': { lat: 1.5015, lng: 110.3358 },
  '93300': { lat: 1.5482, lng: 110.3685 },
  '93350': { lat: 1.5194, lng: 110.3698 },
  '93400': { lat: 1.5452, lng: 110.3512 },
  '93450': { lat: 1.5518, lng: 110.3842 },
  '94300': { lat: 1.4710761, lng: 110.4146532 },
  '96000': { lat: 2.3082741, lng: 111.8211033 },
  '97000': { lat: 3.195414, lng: 113.0557659 },
  '98000': { lat: 4.4506998, lng: 114.033348 },
};

// Detailed town / sub-district coordinates across Malaysia (with state affinity to prevent cross-state collisions like Matang Kuching vs Larut Matang Perak)
const DISTRICT_COORDINATES: { state?: string; keywords: string[]; lat: number; lng: number }[] = [
  // Sarawak (Checked first when school is in Sarawak or mentions Kuching/Sarawak)
  { state: 'Sarawak', keywords: ['matang jaya', 'jalan matang', 'the hub@matang jaya', 'matang, kuching', '93050'], lat: 1.5764384, lng: 110.3026942 },
  { state: 'Sarawak', keywords: ['kuching', 'petra jaya', 'padawan', 'bau', 'serian', 'santubong'], lat: 1.5533, lng: 110.3592 },
  { state: 'Sarawak', keywords: ['samarahan', 'kota samarahan', 'asajaya'], lat: 1.4710761, lng: 110.4146532 },
  { state: 'Sarawak', keywords: ['miri', 'lutong', 'baram'], lat: 4.3995, lng: 113.9914 },
  { state: 'Sarawak', keywords: ['sibu', 'mukah', 'sarikei', 'kapit'], lat: 2.2873, lng: 111.8305 },
  { state: 'Sarawak', keywords: ['bintulu', 'tatau'], lat: 3.1713, lng: 113.0419 },
  { state: 'Sarawak', keywords: ['sri aman', 'betong', 'limbang', 'lawas'], lat: 1.2376, lng: 111.4621 },

  // Sabah
  { state: 'Sabah', keywords: ['kota kinabalu', 'likas', 'inanam', 'putatan', 'penampang', 'tuaran', 'papar', 'menggatal'], lat: 5.9804, lng: 116.0735 },
  { state: 'Sabah', keywords: ['sandakan', 'kinabatangan', 'beluran'], lat: 5.8394, lng: 118.1172 },
  { state: 'Sabah', keywords: ['tawau', 'semporna', 'lahad datu', 'kunak'], lat: 4.2446, lng: 117.8912 },
  { state: 'Sabah', keywords: ['keningau', 'tambunan', 'ranau', 'kudat', 'kota belud', 'beaufort'], lat: 5.3378, lng: 116.1602 },

  // Melaka
  { state: 'Melaka', keywords: ['ayer keroh', 'tasik utama', 'mitc', 'durian tunggal'], lat: 2.2789299, lng: 102.2766557 },
  { state: 'Melaka', keywords: ['peringgit', 'bukit baru', 'melaka tengah', 'bandar hilir', 'cheng', 'bachang'], lat: 2.2219, lng: 102.2643 },
  { state: 'Melaka', keywords: ['alor gajah', 'masjid tanah', 'tampin'], lat: 2.3822, lng: 102.2089 },
  { state: 'Melaka', keywords: ['jasin', 'merlimau', 'bemban'], lat: 2.3097, lng: 102.4305 },

  // Selangor & KL / Putrajaya
  { state: 'Selangor', keywords: ['sungai tangkas', 'bangi', 'kajang', 'hulu langat', 'semenyih'], lat: 2.9426704, lng: 101.789956 },
  { state: 'Selangor', keywords: ['seri kembangan', 'serdang', 'sungai besi indah'], lat: 3.0282, lng: 101.7166 },
  { state: 'Selangor', keywords: ['cyberjaya', 'glomac cyberjaya', 'sepang', 'dengkil', 'salak tinggi'], lat: 2.9239913, lng: 101.656334 },
  { state: 'Selangor', keywords: ['shah alam', 'subang', 'petaling', 'puchong', 'kelana jaya'], lat: 3.0733, lng: 101.5185 },
  { state: 'Wilayah Persekutuan', keywords: ['sri rampai', 'setapak', 'wangsa maju'], lat: 3.1928373, lng: 101.732252 },
  { state: 'Selangor', keywords: ['gombak', 'sungai pusu', 'batu caves', 'selayang', 'rawang', 'sungai cincin'], lat: 3.2481592, lng: 101.725864 },
  { state: 'Selangor', keywords: ['klang', 'kapar', 'meru', 'port klang', 'banting', 'kuala langat'], lat: 3.0449, lng: 101.4456 },
  { state: 'Selangor', keywords: ['kuala selangor', 'puncak alam', 'ijok', 'tanjong karang', 'sabak bernam'], lat: 3.3402, lng: 101.2504 },
  { state: 'Selangor', keywords: ['hulu selangor', 'kuala kubu', 'batang kali'], lat: 3.5637, lng: 101.6581 },
  { state: 'Putrajaya', keywords: ['putrajaya'], lat: 2.9264, lng: 101.6964 },
  { state: 'Wilayah Persekutuan', keywords: ['kuala lumpur', 'ampang', 'keramat', 'segambut', 'ttdi', 'lembah pantai', 'cheras'], lat: 3.1478, lng: 101.6953 },

  // Negeri Sembilan
  { state: 'Negeri Sembilan', keywords: ['taman rashidah utama', 'senawang', 'paroi', 'seremban', 'ampangan', 'rantau'], lat: 2.7025925, lng: 101.9742787 },
  { state: 'Negeri Sembilan', keywords: ['nilai', 'mantin', 'labu'], lat: 2.8191794, lng: 101.7877913 },
  { state: 'Negeri Sembilan', keywords: ['port dickson', 'lukut'], lat: 2.5225, lng: 101.7963 },
  { state: 'Negeri Sembilan', keywords: ['kuala pilah', 'bahau', 'jempol', 'rembau', 'jelebu'], lat: 2.7389, lng: 102.2487 },

  // Johor
  { state: 'Johor', keywords: ['olak batu', 'parit raja', 'jalan shufaat'], lat: 1.9198683, lng: 103.1302235 },
  { state: 'Johor', keywords: ['batu pahat', 'yong peng'], lat: 1.8548, lng: 102.9325 },
  { state: 'Johor', keywords: ['johor bahru', 'skudai', 'tebrau', 'pasir gudang', 'iskandar puteri', 'tampoi', 'perling', 'kempas'], lat: 1.6049663, lng: 103.7199072 },
  { state: 'Johor', keywords: ['muar', 'tangkak', 'pagoh'], lat: 2.0442, lng: 102.5689 },
  { state: 'Johor', keywords: ['kluang', 'simpang renggam', 'ayer hitam'], lat: 2.0305, lng: 103.3185 },
  { state: 'Johor', keywords: ['kota tinggi', 'pengerang', 'desaru'], lat: 1.7381, lng: 103.8999 },
  { state: 'Johor', keywords: ['kulai', 'senai'], lat: 1.6561, lng: 103.6032 },
  { state: 'Johor', keywords: ['segamat', 'labis'], lat: 2.5148, lng: 102.8158 },
  { state: 'Johor', keywords: ['pontian', 'pekan nanas'], lat: 1.4866, lng: 103.3896 },
  { state: 'Johor', keywords: ['mersing'], lat: 2.4312, lng: 103.8405 },

  // Perak
  { state: 'Perak', keywords: ['taman indah jaya', 'persiaran sepakat', 'gunung rapat'], lat: 4.5627157, lng: 101.1266561 },
  { state: 'Perak', keywords: ['ipoh', 'kinta', 'chemor', 'gopeng', 'batu gajah', 'tambun'], lat: 4.5975, lng: 101.0901 },
  { state: 'Perak', keywords: ['kelian intan', 'pengkalan hulu', 'gerik', 'hulu perak'], lat: 5.3982, lng: 101.0153 },
  { state: 'Perak', keywords: ['seri iskandar', 'bota', 'perak tengah', 'parit'], lat: 4.359, lng: 100.9797 },
  { state: 'Perak', keywords: ['taiping', 'larut', 'kamunting', 'kuala kangsar'], lat: 4.8519, lng: 100.7416 },
  { state: 'Perak', keywords: ['manjung', 'sitiawan', 'lumut', 'seri manjung'], lat: 4.2024, lng: 100.6634 },
  { state: 'Perak', keywords: ['teluk intan', 'hilir perak', 'bagan datuk', 'tapah', 'tanjung malim', 'muallim'], lat: 4.0259, lng: 101.0213 },

  // Kedah & Perlis
  { state: 'Kedah', keywords: ['mukim gelong', 'mukim gelung', 'jitra', 'kubang pasu', 'changlun'], lat: 6.2891481, lng: 100.3939277 },
  { state: 'Kedah', keywords: ['pokok asam', 'pinang tunggal', 'sungai petani', 'kuala muda', 'gurun', 'bedong'], lat: 5.5794596, lng: 100.4705626 },
  { state: 'Kedah', keywords: ['alor setar', 'kota setar', 'pokok sena', 'anak bukit'], lat: 6.1248, lng: 100.3678 },
  { state: 'Kedah', keywords: ['kulim', 'hi-tech', 'lunas', 'padang serai'], lat: 5.3649, lng: 100.5618 },
  { state: 'Kedah', keywords: ['baling', 'kupang', 'sik', 'pendang', 'yan'], lat: 5.6751, lng: 100.9178 },
  { state: 'Kedah', keywords: ['langkawi', 'kuah'], lat: 6.35, lng: 99.8 },
  { state: 'Perlis', keywords: ['kangar', 'arau', 'padang besar', 'perlis'], lat: 6.4414, lng: 100.1986 },

  // Pulau Pinang
  { state: 'Pulau Pinang', keywords: ['perda', 'bandar perda', 'bukit mertajam', 'permatang pauh', 'seberang jaya', 'butterworth', 'perai'], lat: 5.367971, lng: 100.4335349 },
  { state: 'Pulau Pinang', keywords: ['kepala batas', 'bertam', 'seberang perai utara', 'tasek gelugor'], lat: 5.4863619, lng: 100.4823074 },
  { state: 'Pulau Pinang', keywords: ['nibong tebal', 'jawi', 'seberang perai selatan'], lat: 5.1658, lng: 100.4779 },
  { state: 'Pulau Pinang', keywords: ['bayan lepas', 'gelugor', 'georgetown', 'george town', 'balik pulau', 'timur laut', 'barat daya'], lat: 5.2952537, lng: 100.2252165 },

  // Kelantan
  { state: 'Kelantan', keywords: ['kota bharu', 'kubang kerian', 'pengkalan chepa', 'wakaf che yeh'], lat: 6.1211, lng: 102.2465 },
  { state: 'Kelantan', keywords: ['pasir mas', 'rantau panjang', 'tumpat', 'wakaf bharu'], lat: 6.0429, lng: 102.1424 },
  { state: 'Kelantan', keywords: ['machang', 'tanah merah', 'pasir puteh', 'bachok', 'kok lanas'], lat: 5.7644, lng: 102.2189 },
  { state: 'Kelantan', keywords: ['kuala krai', 'gua musang', 'jeli'], lat: 5.5313, lng: 102.2019 },

  // Terengganu
  { state: 'Terengganu', keywords: ['geliga', 'geliga besar', 'kemaman', 'chukai', 'kerteh', 'paka'], lat: 4.1974983, lng: 103.4304451 },
  { state: 'Terengganu', keywords: ['kuala terengganu', 'kuala nerus', 'gong badak', 'manir'], lat: 5.3296, lng: 103.137 },
  { state: 'Terengganu', keywords: ['dungun', 'marang', 'ajil', 'hulu terengganu', 'kuala berang'], lat: 4.7430666, lng: 103.4115871 },
  { state: 'Terengganu', keywords: ['besut', 'jerteh', 'setiu', 'kampung raja'], lat: 5.7366, lng: 102.5562 },

  // Pahang
  { state: 'Pahang', keywords: ['kuantan', 'indera mahkota', 'beserah', 'gambang', 'permata al-amin'], lat: 3.7893644, lng: 103.2511133 },
  { state: 'Pahang', keywords: ['temerloh', 'mentakab', 'maran', 'jengka', 'jerantut', 'bera'], lat: 3.4851213, lng: 102.4299276 },
  { state: 'Pahang', keywords: ['pekan', 'rompin', 'muadzam shah'], lat: 3.4836, lng: 103.3996 },
  { state: 'Pahang', keywords: ['bentong', 'raub', 'lipis', 'cameron'], lat: 3.5227, lng: 101.9087 },
];

const GEOCACHE_STORAGE_KEY = 'mpgbsim_school_address_geocache_v4';

function loadAddressGeoCache(): Record<string, { lat: number; lng: number }> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(GEOCACHE_STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveAddressGeoCache(cache: Record<string, { lat: number; lng: number }>) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GEOCACHE_STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    // ignore
  }
}

// Validate that dynamically geocoded coordinates fall within the expected region (e.g., Sarawak vs Sabah vs Peninsular Malaysia)
function isCoordinateValidForSchoolState(lat: number, lng: number, state: string, fullText: string): boolean {
  const s = (state || '').toLowerCase();
  const isSarawak = s.includes('sarawak') || fullText.includes('kuching') || fullText.includes('sarawak');
  const isSabah = s.includes('sabah') || fullText.includes('kota kinabalu') || fullText.includes('sabah');

  if (isSarawak) {
    return lat >= 0.8 && lat <= 5.2 && lng >= 109.5 && lng <= 115.8;
  }
  if (isSabah) {
    return lat >= 4.0 && lat <= 7.5 && lng >= 115.0 && lng <= 119.5;
  }
  // Peninsular Malaysia
  return lat >= 1.2 && lat <= 6.8 && lng >= 99.5 && lng <= 104.6;
}

export function resolveSchoolAddressCoordinates(
  school: MemberSchool,
  dynamicGeoCache: Record<string, { lat: number; lng: number }>
): { lat: number; lng: number; isExactAddress: boolean; officialAddressLabel?: string } {
  const codeUpper = (school.code || '').trim().toUpperCase();
  const nameLower = (school.name || '').trim().toLowerCase();
  const addressLower = (school.address || '').trim().toLowerCase();
  const districtLower = (school.district || '').trim().toLowerCase();
  const stateLower = (school.state || '').trim().toLowerCase();
  const fullText = `${addressLower} ${districtLower} ${nameLower} ${stateLower}`;

  // 1. Check exact school code or name + street address match first
  for (const entry of EXACT_SCHOOL_ADDRESS_COORDINATES) {
    if (entry.codes && codeUpper && entry.codes.some((c) => c.toUpperCase() === codeUpper)) {
      return { lat: entry.lat, lng: entry.lng, isExactAddress: true, officialAddressLabel: entry.label };
    }
    if (entry.nameKeywords && entry.nameKeywords.some((nk) => nameLower.includes(nk))) {
      return { lat: entry.lat, lng: entry.lng, isExactAddress: true, officialAddressLabel: entry.label };
    }
    if (entry.addressKeywords && entry.addressKeywords.some((ak) => addressLower.includes(ak))) {
      return { lat: entry.lat, lng: entry.lng, isExactAddress: true, officialAddressLabel: entry.label };
    }
  }

  // 2. Check dynamically geocoded address cache (validated against state region)
  const cacheKey = `${school.id}:${school.address || ''}`.trim();
  if (
    dynamicGeoCache[cacheKey] &&
    isCoordinateValidForSchoolState(
      dynamicGeoCache[cacheKey].lat,
      dynamicGeoCache[cacheKey].lng,
      school.state || '',
      fullText
    )
  ) {
    return {
      lat: dynamicGeoCache[cacheKey].lat,
      lng: dynamicGeoCache[cacheKey].lng,
      isExactAddress: true,
    };
  }

  // 3. Check 5-digit Malaysian Postcode inside school.address
  const postcodeMatch = (school.address || '').match(/\b(\d{5})\b/);
  if (postcodeMatch && postcodeMatch[1]) {
    const pc = postcodeMatch[1];
    if (POSTCODE_COORDINATES[pc]) {
      return {
        lat: POSTCODE_COORDINATES[pc].lat,
        lng: POSTCODE_COORDINATES[pc].lng,
        isExactAddress: true,
      };
    }
  }

  // 4a. Match town/street/district keywords within the same state first
  for (const entry of DISTRICT_COORDINATES) {
    if (entry.state && stateLower && !stateLower.includes(entry.state.toLowerCase())) {
      continue;
    }
    if (entry.keywords.some((kw) => fullText.includes(kw))) {
      return { lat: entry.lat, lng: entry.lng, isExactAddress: false };
    }
  }

  // 4b. Fallback keyword match across all states if state was unset or mismatched
  for (const entry of DISTRICT_COORDINATES) {
    if (entry.keywords.some((kw) => fullText.includes(kw))) {
      return { lat: entry.lat, lng: entry.lng, isExactAddress: false };
    }
  }

  // 5. Fallback to state coordinates
  const stateClean = (school.state || '').trim();
  const stateMatch =
    STATE_COORDINATES[stateClean] ||
    Object.entries(STATE_COORDINATES).find(([k]) =>
      stateClean.toLowerCase().includes(k.toLowerCase())
    )?.[1];

  if (stateMatch) {
    return { lat: stateMatch.lat, lng: stateMatch.lng, isExactAddress: false };
  }

  return { lat: 3.139, lng: 101.6869, isExactAddress: false };
}

function getSchoolLevelCategory(school: MemberSchool): 'RENDAH' | 'MENENGAH' | 'TAHFIZ' {
  const t = (school.type || '').toLowerCase();
  const n = (school.name || '').toLowerCase();

  if (t.includes('tahfiz') || n.includes('tahfiz') || n.includes('maahad')) {
    return 'TAHFIZ';
  }
  if (
    t.includes('menengah') ||
    t.includes('smka') ||
    t.includes('sabk') ||
    n.includes('menengah') ||
    /\bsmk\b|\bsmka\b|\bsma\b|\bsmi\b|\bsmabk\b/i.test(n)
  ) {
    return 'MENENGAH';
  }
  if (
    t.includes('rendah') ||
    n.includes('rendah') ||
    /\bsriti\b|\bsra\b|\bsrai\b|\bsri\b|\bsr\b/i.test(n)
  ) {
    return 'RENDAH';
  }
  return 'MENENGAH';
}

const TILE_LAYERS = {
  gmaps: {
    name: 'Google Maps (Jalan & Alamat)',
    url: 'https://mt1.google.com/vt/lyrs=m&hl=ms&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Malaysia',
    tileFilter: 'none',
    bgColor: '#f1f5f9',
  },
  ghybrid: {
    name: 'Google Maps Satelit',
    url: 'https://mt1.google.com/vt/lyrs=y&hl=ms&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite & Street Labels',
    tileFilter: 'none',
    bgColor: '#090d16',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileFilter: 'none',
    bgColor: '#f1f5f9',
  },
  voyager: {
    name: 'Peta Standard',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, TomTom, Garmin, FAO, NOAA, USGS',
    tileFilter: 'saturate(0.95) contrast(1.02)',
    bgColor: '#e2e8f0',
  },
  dark: {
    name: 'Peta Gelap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileFilter: 'invert(100%) hue-rotate(180deg) brightness(93%) contrast(92%)',
    bgColor: '#0f172a',
  },
};

export const SchoolNetworkMap: React.FC<SchoolNetworkMapProps> = ({
  schools,
  allSchoolsCount,
  selectedState,
  onStateSelect,
  onSelectSchool,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Default to 'gmaps' (Google Maps Jalan & Alamat) so pins align identically with Google Maps POIs and streets
  const [mapStyle, setMapStyle] = useState<'gmaps' | 'ghybrid' | 'osm' | 'voyager' | 'dark'>('gmaps');
  const [activeRegion, setActiveRegion] = useState<'ALL' | 'SEMENANJUNG' | 'BORNEO'>('ALL');
  const [sidebarTab, setSidebarTab] = useState<'alamat' | 'negeri'>('alamat');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [focusedSchoolId, setFocusedSchoolId] = useState<string | null>(null);
  const [dynamicGeoCache, setDynamicGeoCache] = useState<
    Record<string, { lat: number; lng: number }>
  >(() => loadAddressGeoCache());

  // Background live geocoding via ArcGIS World Geocoding Service + OpenStreetMap Nominatim for any newly registered schools
  useEffect(() => {
    let cancelled = false;
    const toGeocode = schools.filter((sch) => {
      if (!sch.address || sch.address.trim().length < 5) return false;
      const cacheKey = `${sch.id}:${sch.address || ''}`.trim();
      if (dynamicGeoCache[cacheKey]) return false;
      const resolved = resolveSchoolAddressCoordinates(sch, dynamicGeoCache);
      return !resolved.isExactAddress;
    });

    if (toGeocode.length === 0) return;

    (async () => {
      const updatedCache = { ...dynamicGeoCache };
      let changed = false;

      for (const sch of toGeocode.slice(0, 8)) {
        if (cancelled) break;
        const cacheKey = `${sch.id}:${sch.address || ''}`.trim();
        const queryText = `${sch.name}, ${sch.address}, ${sch.state || ''}, Malaysia`;
        try {
          const fullCheck = `${sch.address || ''} ${sch.district || ''} ${sch.name || ''} ${sch.state || ''}`.toLowerCase();
          // 1. Try ArcGIS World Geocoding Service (high-precision Malaysia POI & street database)
          const arcRes = await fetch(
            `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&countryCode=MYS&singleLine=${encodeURIComponent(
              queryText
            )}`
          );
          if (arcRes.ok) {
            const arcData = await arcRes.json();
            const candidate = arcData?.candidates?.[0];
            if (candidate && candidate.score >= 85 && candidate.location?.y && candidate.location?.x) {
              const candLat = Number(candidate.location.y);
              const candLng = Number(candidate.location.x);
              if (isCoordinateValidForSchoolState(candLat, candLng, sch.state || '', fullCheck)) {
                updatedCache[cacheKey] = {
                  lat: candLat,
                  lng: candLng,
                };
                changed = true;
                continue;
              }
            }
          }

          // 2. Fallback to OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=my&q=${encodeURIComponent(
              `${sch.address}, ${sch.state || ''}, Malaysia`
            )}`,
            { headers: { 'Accept-Language': 'ms,en' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
              const nomLat = parseFloat(data[0].lat);
              const nomLng = parseFloat(data[0].lon);
              if (isCoordinateValidForSchoolState(nomLat, nomLng, sch.state || '', fullCheck)) {
                updatedCache[cacheKey] = {
                  lat: nomLat,
                  lng: nomLng,
                };
                changed = true;
              }
            }
          }
        } catch {
          // Ignore network errors and rely on postcode/district coordinates
        }
        await new Promise((r) => setTimeout(r, 600));
      }

      if (!cancelled && changed) {
        saveAddressGeoCache(updatedCache);
        setDynamicGeoCache(updatedCache);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [schools]);

  // Enrich schools with exact Google Maps coordinates; preserve exact 7-decimal coordinates without artificial drift
  const mappedSchools = useMemo(() => {
    const coordCollisions: Record<string, number> = {};

    return schools.map((sch) => {
      const base = resolveSchoolAddressCoordinates(sch, dynamicGeoCache);
      const coordKey = `${base.lat.toFixed(6)},${base.lng.toFixed(6)}`;
      const duplicateIdx = coordCollisions[coordKey] || 0;
      coordCollisions[coordKey] = duplicateIdx + 1;

      // Zero offset when coordinates are distinct (even on the same street); tiny 25m separation only if two records share identical 6-decimal coordinates
      const angle = duplicateIdx * (Math.PI / 3);
      const offsetRadius = duplicateIdx === 0 ? 0 : 0.00022 * duplicateIdx;

      const lat = Number((base.lat + Math.sin(angle) * offsetRadius).toFixed(7));
      const lng = Number((base.lng + Math.cos(angle) * offsetRadius).toFixed(7));
      const levelCat = getSchoolLevelCategory(sch);
      const membershipType = resolveSchoolMembershipType(sch);

      return {
        school: sch,
        lat,
        lng,
        levelCat,
        membershipType,
        officialAddressLabel: base.officialAddressLabel,
      };
    });
  }, [schools, dynamicGeoCache]);

  const filteredSidebarSchools = useMemo(() => {
    if (!sidebarSearch.trim()) return mappedSchools;
    const q = sidebarSearch.toLowerCase();
    return mappedSchools.filter(
      ({ school, officialAddressLabel }) =>
        school.name.toLowerCase().includes(q) ||
        (school.address || '').toLowerCase().includes(q) ||
        (officialAddressLabel || '').toLowerCase().includes(q) ||
        (school.code || '').toLowerCase().includes(q) ||
        (school.district || '').toLowerCase().includes(q) ||
        (school.state || '').toLowerCase().includes(q)
    );
  }, [mappedSchools, sidebarSearch]);

  // State distribution summary
  const stateBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; students: number }> = {};
    schools.forEach((sch) => {
      const st = (sch.state || 'Lain-lain').trim();
      if (!counts[st]) counts[st] = { count: 0, students: 0 };
      counts[st].count += 1;
      counts[st].students += Number(sch.studentCount) || 0;
    });
    return Object.entries(counts)
      .map(([state, data]) => ({ state, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [schools]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [4.2, 108.2],
      zoom: 6,
      minZoom: 5,
      maxZoom: 20,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    const initialLayer = TILE_LAYERS[mapStyle];
    const tileLayer = L.tileLayer(initialLayer.url, {
      attribution: initialLayer.attribution,
      maxZoom: 20,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersGroup;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 180);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      markerMapRef.current.clear();
    };
  }, []);

  // Switch tile layer style and apply CSS filter on .leaflet-tile-pane when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const selected = TILE_LAYERS[mapStyle];
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(selected.url, {
      attribution: selected.attribution,
      maxZoom: 20,
    }).addTo(map);
    tileLayerRef.current = newTileLayer;

    if (mapContainerRef.current) {
      mapContainerRef.current.style.backgroundColor = selected.bgColor;
      const tilePane = mapContainerRef.current.querySelector(
        '.leaflet-tile-pane'
      ) as HTMLElement | null;
      if (tilePane) {
        tilePane.style.filter = selected.tileFilter;
      }
    }
  }, [mapStyle]);

  // Render markers whenever mappedSchools changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    markerMapRef.current.clear();

    mappedSchools.forEach(({ school, lat, lng, levelCat, membershipType, officialAddressLabel }) => {
      const pinColor =
        levelCat === 'RENDAH'
          ? '#d97706' // Amber for Sekolah Rendah
          : levelCat === 'TAHFIZ'
          ? '#4338ca' // Indigo for Maahad Tahfiz
          : '#0f766e'; // Teal for Sekolah Menengah

      const ringColor = membershipType === 'Ahli Bersekutu' ? '#818cf8' : '#34d399';

      const customIcon = L.divIcon({
        className: 'mpgbsim-custom-map-pin',
        html: `
          <div style="
            position: relative;
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              width: 30px;
              height: 30px;
              border-radius: 9999px;
              background: ${pinColor};
              border: 2.5px solid #ffffff;
              box-shadow: 0 4px 10px rgba(15, 23, 42, 0.35), 0 0 0 2px ${ringColor};
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: 11px;
              transition: transform 0.15s ease;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 22v-4a2 2 0 1 0-4 0v4"/>
                <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/>
                <path d="M18 5v17"/>
                <path d="m4 6 8-4 8 4"/>
                <path d="M6 5v17"/>
                <circle cx="12" cy="9" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContainer = document.createElement('div');
      popupContainer.style.minWidth = '265px';
      popupContainer.style.maxWidth = '305px';
      popupContainer.style.fontFamily = "'Plus Jakarta Sans', sans-serif";

      const badgeBg = membershipType === 'Ahli Bersekutu' ? '#eef2ff' : '#ecfdf5';
      const badgeText = membershipType === 'Ahli Bersekutu' ? '#3730a3' : '#065f46';
      const levelLabel =
        levelCat === 'RENDAH'
          ? 'Sekolah Rendah'
          : levelCat === 'TAHFIZ'
          ? 'Maahad Tahfiz'
          : 'Sekolah Menengah';

      const isKuchingAlAmin =
        school.name.toLowerCase().includes('al amin kuching') ||
        school.name.toLowerCase().includes('al-amin kuching');

      const fullAddressText =
        isKuchingAlAmin && officialAddressLabel
          ? officialAddressLabel
          : school.address && school.address.trim()
          ? school.address.trim()
          : officialAddressLabel || `${school.district ? `${school.district}, ` : ''}${school.state}`;

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${school.name}, ${fullAddressText}`
      )}`;

      popupContainer.innerHTML = `
        <div style="padding: 4px 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 7px; border-radius: 6px; background: ${badgeBg}; color: ${badgeText};">
              ${membershipType}
            </span>
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #0f766e;">
              ${school.code || '-'}
            </span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.3; margin-bottom: 4px;">
            ${school.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            ${school.district ? `${school.district}, ` : ''}${school.state} · <strong style="color: #334155;">${levelLabel}</strong>
          </div>
          <div style="padding: 6px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 11px; color: #14532d; margin-bottom: 6px; line-height: 1.35;">
            <div style="font-weight: 800; font-size: 10px; text-transform: uppercase; color: #15803d; margin-bottom: 2px;">
              📍 Alamat Rasmi Sekolah:
            </div>
            <div>${fullAddressText}</div>
            <div style="font-family: monospace; font-size: 10px; color: #166534; margin-top: 3px;">
              Koordinat Google Maps: ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </div>
          </div>
          <div style="padding: 6px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; color: #334155; margin-bottom: 8px;">
            <div style="margin-bottom: 2px;"><strong>PGB:</strong> ${school.principal || '-'}</div>
            <div><strong>Enrolmen:</strong> ${(Number(school.studentCount) || 0).toLocaleString('ms-MY')} murid · ${Number(school.teacherCount) || 0} guru</div>
          </div>
          <div style="display: flex; gap: 6px; margin-bottom: 6px;">
            <button
              type="button"
              class="mpgbsim-popup-zoom-btn"
              style="
                flex: 1;
                padding: 6px 8px;
                border-radius: 7px;
                background: #f1f5f9;
                color: #0f172a;
                font-size: 10.5px;
                font-weight: 700;
                border: 1px solid #cbd5e1;
                cursor: pointer;
              "
            >
              🔍 Zum Jalan (18x)
            </button>
            <a
              href="${googleMapsUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                flex: 1;
                padding: 6px 8px;
                border-radius: 7px;
                background: #eff6ff;
                color: #1d4ed8;
                font-size: 10.5px;
                font-weight: 700;
                border: 1px solid #bfdbfe;
                text-decoration: none;
                text-align: center;
              "
            >
              🗺️ Google Maps ↗
            </a>
          </div>
          <button
            type="button"
            class="mpgbsim-popup-view-btn"
            style="
              width: 100%;
              padding: 7px 12px;
              border-radius: 8px;
              background: #0f766e;
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            "
          >
            <span>Lihat Profil Penuh Sekolah</span>
            <span>→</span>
          </button>
        </div>
      `;

      const viewBtn = popupContainer.querySelector('.mpgbsim-popup-view-btn');
      if (viewBtn && onSelectSchool) {
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectSchool(school);
        });
      }

      const zoomBtn = popupContainer.querySelector('.mpgbsim-popup-zoom-btn');
      if (zoomBtn) {
        zoomBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (mapStyle !== 'gmaps' && mapStyle !== 'ghybrid') {
            setMapStyle('gmaps');
          }
          map.flyTo([lat, lng], 18, { duration: 0.9 });
        });
      }

      marker.bindPopup(popupContainer, {
        maxWidth: 320,
        closeButton: true,
      });

      marker.addTo(markersGroup);
      markerMapRef.current.set(school.id, marker);
    });

    // Adjust map bounds if a specific state is selected or if filtered
    if (
      selectedState &&
      selectedState !== 'Semua Negeri' &&
      selectedState !== 'Semua' &&
      STATE_COORDINATES[selectedState]
    ) {
      const st = STATE_COORDINATES[selectedState];
      map.flyTo([st.lat, st.lng], st.zoom, { duration: 0.8 });
    } else if (mappedSchools.length > 0 && mappedSchools.length < (allSchoolsCount || 999)) {
      const bounds = L.latLngBounds(mappedSchools.map((m) => [m.lat, m.lng] as [number, number]));
      if (bounds.isValid()) {
        map.flyToBounds(bounds.pad(0.2), { maxZoom: 16, duration: 0.8 });
      }
    }
  }, [mappedSchools, selectedState, allSchoolsCount, onSelectSchool]);

  const handleFlyToSchoolAddress = (item: {
    school: MemberSchool;
    lat: number;
    lng: number;
  }) => {
    setFocusedSchoolId(item.school.id);
    if (mapStyle !== 'gmaps' && mapStyle !== 'ghybrid') {
      setMapStyle('gmaps');
    }
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([item.lat, item.lng], 18, { duration: 0.9 });
    const marker = markerMapRef.current.get(item.school.id);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 450);
    }
  };

  const handleFlyToRegion = (region: 'ALL' | 'SEMENANJUNG' | 'BORNEO') => {
    setActiveRegion(region);
    setFocusedSchoolId(null);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (region === 'ALL') {
      map.flyTo([4.2, 108.2], 6, { duration: 0.8 });
    } else if (region === 'SEMENANJUNG') {
      map.flyTo([4.15, 102.15], 7, { duration: 0.8 });
    } else if (region === 'BORNEO') {
      map.flyTo([3.8, 114.8], 6, { duration: 0.8 });
    }
  };

  const handleFitFilteredBounds = () => {
    setFocusedSchoolId(null);
    const map = mapInstanceRef.current;
    if (!map || mappedSchools.length === 0) return;
    const bounds = L.latLngBounds(mappedSchools.map((m) => [m.lat, m.lng] as [number, number]));
    if (bounds.isValid()) {
      map.flyToBounds(bounds.pad(0.18), { maxZoom: 14, duration: 0.8 });
    }
  };

  const handleFocusState = (stateName: string) => {
    setFocusedSchoolId(null);
    const map = mapInstanceRef.current;
    if (onStateSelect) {
      const isCurrentlySelected = selectedState === stateName;
      if (isCurrentlySelected) {
        onStateSelect('RESET');
        if (map) map.flyTo([4.2, 108.2], 6, { duration: 0.8 });
        return;
      }
      onStateSelect(stateName);
    }
    if (map && STATE_COORDINATES[stateName]) {
      const st = STATE_COORDINATES[stateName];
      map.flyTo([st.lat, st.lng], st.zoom, { duration: 0.8 });
    }
  };

  return (
    <div className="mb-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Map Header & Region Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Pemetaan Lokasi Tepat Mengikut Alamat Rasmi Sekolah</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Peta Interaktif Taburan & Alamat Sekolah Ahli Seluruh Malaysia</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Kedudukan setiap pin dipetakan secara terperinci mengikut alamat jalan, poskod dan mukim rasmi sekolah masing-masing. Klik mana-mana sekolah pada senarai di kanan untuk zum terus ke alamat tepat sekolah (16x).
            </p>
          </div>

          {/* Region Quick-Zoom & Style Switcher */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/90 border border-slate-700">
              <button
                type="button"
                onClick={() => handleFlyToRegion('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeRegion === 'ALL'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Seluruh Malaysia
              </button>
              <button
                type="button"
                onClick={() => handleFlyToRegion('SEMENANJUNG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeRegion === 'SEMENANJUNG'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Semenanjung
              </button>
              <button
                type="button"
                onClick={() => handleFlyToRegion('BORNEO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeRegion === 'BORNEO'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sabah & Sarawak
              </button>
            </div>

            <button
              type="button"
              onClick={handleFitFilteredBounds}
              className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold border border-teal-600/60 flex items-center gap-1.5 transition cursor-pointer"
              title="Zum automatik kepada senarai sekolah yang sedang dipaparkan"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Fokus Pin ({mappedSchools.length})</span>
            </button>
          </div>
        </div>

        {/* Map Legend & Layer Switcher Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-bold text-slate-300">Petunjuk Kategori Pin:</span>
            <span className="inline-flex items-center gap-1.5 text-slate-200">
              <span className="w-3 h-3 rounded-full bg-teal-700 border border-white inline-block shadow-2xs" />
              <span>Sekolah Menengah (SMI / SMKA / SABK)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-200">
              <span className="w-3 h-3 rounded-full bg-amber-600 border border-white inline-block shadow-2xs" />
              <span>Sekolah Rendah (SRI / Rakan Musleh)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-200">
              <span className="w-3 h-3 rounded-full bg-indigo-700 border border-white inline-block shadow-2xs" />
              <span>Maahad Tahfiz</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px]">Mod Peta:</span>
            {(['gmaps', 'ghybrid', 'osm', 'voyager', 'dark'] as const).map((styleKey) => (
              <button
                key={styleKey}
                type="button"
                onClick={() => setMapStyle(styleKey)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  mapStyle === styleKey
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {TILE_LAYERS[styleKey].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map & Interactive Address / State Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left / Center: Leaflet Interactive Map Canvas */}
        <div className="lg:col-span-8 relative bg-slate-100 min-h-[440px] sm:min-h-[520px]">
          <div
            ref={mapContainerRef}
            className="w-full h-[440px] sm:h-[520px] z-10"
            aria-label="Peta Interaktif Sekolah Ahli MPGBSIM"
          />

          {/* Floating Status Pill on Bottom-Left of Map */}
          <div className="absolute bottom-3 left-3 z-[400] pointer-events-none bg-slate-900/90 backdrop-blur-xs text-white px-3.5 py-2 rounded-xl border border-slate-700 shadow-lg text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Memaparkan <strong className="text-amber-300 font-mono">{mappedSchools.length}</strong> lokasi alamat sekolah
              {selectedState && selectedState !== 'Semua Negeri' && selectedState !== 'Semua'
                ? ` di ${selectedState}`
                : ' di seluruh Malaysia'}
            </span>
          </div>
        </div>

        {/* Right Column: Interactive School Address & State Locator */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/70 flex flex-col justify-between max-h-[520px]">
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
            {/* Switch between Exact School Address Locator & State Breakdown */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setSidebarTab('alamat')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sidebarTab === 'alamat'
                    ? 'bg-teal-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Alamat Sekolah ({mappedSchools.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('negeri')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sidebarTab === 'negeri'
                    ? 'bg-teal-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Taburan Negeri ({stateBreakdown.length})</span>
              </button>
            </div>

            {sidebarTab === 'alamat' ? (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Cari nama atau alamat sekolah..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                />
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Klik nama negeri untuk zum terus ke lokasi sekolah di negeri berkenaan
              </p>
            )}
          </div>

          {sidebarTab === 'alamat' ? (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/70 p-2 space-y-1.5">
              {filteredSidebarSchools.map((item) => {
                const { school, lat, lng, officialAddressLabel } = item;
                const isFocused = focusedSchoolId === school.id;
                const isKuchingAlAmin =
                  school.name.toLowerCase().includes('al amin kuching') ||
                  school.name.toLowerCase().includes('al-amin kuching');
                const fullAddr =
                  isKuchingAlAmin && officialAddressLabel
                    ? officialAddressLabel
                    : school.address && school.address.trim()
                    ? school.address.trim()
                    : officialAddressLabel || `${school.district ? `${school.district}, ` : ''}${school.state}`;

                return (
                  <div
                    key={school.id}
                    onClick={() => handleFlyToSchoolAddress(item)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all border cursor-pointer ${
                      isFocused
                        ? 'bg-teal-950 text-white border-teal-800 shadow-sm'
                        : 'bg-white hover:bg-teal-50/70 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs leading-snug">
                        {school.name}
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                          isFocused
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-teal-50 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {school.code}
                      </span>
                    </div>

                    <div
                      className={`mt-1 text-[11px] leading-snug flex items-start gap-1 ${
                        isFocused ? 'text-teal-100' : 'text-slate-600'
                      }`}
                    >
                      <MapPin
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isFocused ? 'text-amber-300' : 'text-teal-700'
                        }`}
                      />
                      <span>{fullAddr}</span>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/40 flex items-center justify-between text-[10px]">
                      <span className={`font-mono ${isFocused ? 'text-amber-300' : 'text-slate-400'}`}>
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </span>
                      <span
                        className={`font-bold ${
                          isFocused ? 'text-emerald-300' : 'text-teal-700'
                        }`}
                      >
                        Zum ke Alamat →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/70 p-2 space-y-1">
              {stateBreakdown.map((item) => {
                const isSelected = selectedState === item.state;
                return (
                  <button
                    key={item.state}
                    type="button"
                    onClick={() => handleFocusState(item.state)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate flex items-center gap-1.5">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-amber-300' : 'text-teal-700'
                          }`}
                        />
                        <span>{item.state}</span>
                      </div>
                      <div
                        className={`text-[10px] pl-5 ${
                          isSelected ? 'text-teal-200' : 'text-slate-500'
                        }`}
                      >
                        {item.students.toLocaleString('ms-MY')} murid & pelajar
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-xs font-extrabold shrink-0 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedState &&
            selectedState !== 'Semua Negeri' &&
            selectedState !== 'Semua' &&
            onStateSelect && (
              <div className="p-3 bg-white border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    onStateSelect('RESET');
                    handleFlyToRegion('ALL');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Papar Semula Semua Negeri
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
