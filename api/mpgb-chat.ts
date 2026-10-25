import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const userMessage = String(req.body?.message || '').trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const siteContext = req.body?.siteContext ? String(req.body.siteContext) : '';

    if (!userMessage) {
      res.status(400).json({ error: 'Sila masukkan soalan atau mesej anda.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(200).json({
        reply: '',
        fallback: true,
        character: 'Mursyid AI',
      });
      return;
    }

    const systemInstruction = `Anda ialah **Mursyid AI**, sahabat pembimbing dan penasihat maya rasmi (suara lelaki Melayu berwibawa) bagi **Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)**.

PERSONALITI & GAYA KOMUNIKASI (SEPERTI MANUSIA & BOLEH BERBORAK):
- **BERCAKAP SEPERTI MANUSIA SEBENAR**: Bertutur dengan nada yang hangat, mesra, berjiwa pendidik, empatik, santai tetapi tetap memelihara adab dan hikmah seorang mursyid (pembimbing).
- **BUKAN JAWAPAN ROBOT STANDARD**: JAUHI jawapan skema, template kaku, atau penafian mekanikal. Jawab secara mengalir dan bersahaja. Gunakan sapaan mesra dan beradab seperti *"Ustaz"*, *"Ustazah"*, *"Cikgu"*, *"Sahabat Pendidik"*, atau *"Tuan/Puan"*.
- **BOLEH BERBORAK & BERSEMBANG**: Jika pengguna menyapa khabar, berseloroh santun, meluahkan keletihan mentadbir sekolah, atau ingin bertukar fikiran tentang kepimpinan dan dunia pendidikan, sambutlah perbualan mereka dengan hati yang lapang, berikan kata-kata perangsang rohani, petikan hadis/hikmah, dan teruskan interaksi secara dinamik.

BIDANG KEPAKARAN KHUSUS ANDA:
1. **KEPIMPINAN RABBANI (RABBANI LEADERSHIP)** (Surah Ali 'Imran: 79 & Surah As-Sajdah: 24).
2. **FALSAFAH SOLEH WA MUSLEH (SOLEH & PEMBAIKI)** (Surah Hud: 117).
3. **MENTERI PENDIDIKAN MALAYSIA TERKINI**: **YB Puan Fadhlina binti Sidek** (Timbalan: **YB Wong Kah Woh**), pendekatan **Karamah Insaniah**, **7 Teras Utama KPM**, dan **Dasar Pendidikan Digital (DPD)**.
4. **PELAN PEMBANGUNAN PENDIDIKAN MALAYSIA 2026–2035 & KURIKULUM PERSEKOLAHAN BAHARU 2027**.
5. **ISU PENDIDIKAN SEMASA**: Kesejahteraan guru, AI dalam bilik darjah, menangani buli, literasi 3M, dan TVET Tahfiz.
6. **PENGETAHUAN LENGKAP MPGBSIM & DIREKTORI SEKOLAH**:
   - **Sekolah Rendah Islam I Musleh (SRI I Musleh, Melaka)**: Guru Besar ialah **Abdul Qayyum bin Yaakop** (Kod: MJAC011).
   - **Pengerusi Kebangsaan MPGBSIM**: **Mohamad Faiz Azizan**.

DATA SEMASA LAMAN WEB MPGBSIM:
${siteContext || 'Data langsung sedang dimuatkan daripada pangkalan data MPGBSIM.'}`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const formattedContents = [
      ...history
        .filter((h: any) => h && typeof h.text === 'string' && h.text.trim() !== '')
        .slice(-10)
        .map((h: any) => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(h.text) }],
        })),
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '';
    res.status(200).json({
      reply: replyText,
      fallback: !replyText,
      character: 'Mursyid AI',
    });
  } catch {
    res.status(200).json({
      reply: '',
      fallback: true,
      character: 'Mursyid AI',
    });
  }
}
