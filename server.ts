import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServerNewsMeta {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl: string;
  category?: string;
  date?: string;
  author?: string;
  schoolName?: string;
}

const DEFAULT_NEWS_FALLBACK: Record<string, ServerNewsMeta> = {
  'news-01': {
    id: 'news-01',
    title: 'Konvensyen Kebangsaan Pengetua & Guru Besar Sekolah Islam Malaysia 2026 Dirasmikan',
    summary:
      'Lebih 1,500 pemimpin sekolah Islam seluruh negara berkumpul bagi membincangkan Rangka Tindakan Strategik MPGBSIM 2025–2030 dan integrasi AI dalam pengurusan sekolah.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    category: 'Kenyataan Media',
    date: '2026-09-24',
  },
  'news-02': {
    id: 'news-02',
    title: 'Sekolah Rendah Islam I Musleh Rintis Program Sekolah Pintar Rabbani Berorientasikan AI',
    summary:
      'Anugerah Inovasi Digital MPGBSIM 2026 diberikan kepada SRI I Musleh atas kejayaan mengintegrasikan modul pengecaman hafazan Al-Quran berasaskan AI.',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200',
    category: 'Kejayaan Sekolah',
    date: '2026-09-20',
  },
  'news-03': {
    id: 'news-03',
    title: 'SMKA Putrajaya Menjuarai Pertandingan Debat Bahasa Arab & English Antarabangsa',
    summary:
      'Pasukan murid SMKA Putrajaya membawa pulang Anugerah Emas dalam International Islamic Schools Debate Championship 2026.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    category: 'Kejayaan Sekolah',
    date: '2026-09-18',
  },
  'news-04': {
    id: 'news-04',
    title: 'Pelancaran Rangka Tindakan Strategik Kepimpinan Sekolah Islam Malaysia (2025–2030)',
    summary:
      'MPGBSIM memperkenalkan 6 Teras Utama pemerkasaan institusi pendidikan Islam berasaskan pengurusan profesional dan kelestarian dana wakaf.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
    category: 'Pendidikan',
    date: '2026-09-12',
  },
  'news-05': {
    id: 'news-05',
    title: 'Penyelarasan Standard Kurikulum Diniyah & Tahfiz Bersama Kementerian Pendidikan Malaysia',
    summary:
      'Sesi wacana khas antara kepimpinan MPGBSIM dan Bahagian Pendidikan Islam KPM bagi memantapkan kualiti pendidikan Dini.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    category: 'Pengurusan',
    date: '2026-09-05',
  },
};

function loadFirebaseConfig(): { projectId: string; firestoreDatabaseId: string; apiKey: string } {
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || parsed.projectId || 'compact-vigil-cf6jr',
        firestoreDatabaseId:
          process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
          parsed.firestoreDatabaseId ||
          'ai-studio-mpgbsimmajlispen-d6e7972c-8fd2-4adc-81e6-ff46f648dee7',
        apiKey: process.env.VITE_FIREBASE_API_KEY || parsed.apiKey || '',
      };
    }
  } catch (err) {
    console.warn('Failed to read firebase-applet-config.json:', err);
  }
  return {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'compact-vigil-cf6jr',
    firestoreDatabaseId:
      process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
      'ai-studio-mpgbsimmajlispen-d6e7972c-8fd2-4adc-81e6-ff46f648dee7',
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  };
}

const firebaseConfig = loadFirebaseConfig();
const DISK_CACHE_PATH = path.resolve(__dirname, '.news-meta-cache.json');

// In-memory cache for news metadata + converted JPEG buffers
const newsCache = new Map<string, { item: ServerNewsMeta; expiresAt: number }>();
const ogJpegCache = new Map<string, { buffer: Buffer; expiresAt: number }>();

function loadDiskNewsCache(): void {
  try {
    if (fs.existsSync(DISK_CACHE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(DISK_CACHE_PATH, 'utf-8'));
      if (raw && typeof raw === 'object') {
        for (const [id, item] of Object.entries(raw)) {
          if (item && typeof item === 'object' && (item as any).title) {
            newsCache.set(id, {
              item: item as ServerNewsMeta,
              expiresAt: Date.now() + 24 * 3600_000,
            });
          }
        }
      }
    }
  } catch {
    // Ignore disk cache read errors
  }
}

function saveDiskNewsCache(): void {
  try {
    const out: Record<string, ServerNewsMeta> = {};
    for (const [id, entry] of newsCache.entries()) {
      out[id] = entry.item;
    }
    fs.writeFileSync(DISK_CACHE_PATH, JSON.stringify(out), 'utf-8');
  } catch {
    // Ignore disk cache write errors
  }
}

function extractFirestoreString(field: any): string {
  if (!field || typeof field !== 'object') return '';
  if (typeof field.stringValue === 'string') return field.stringValue;
  return '';
}

function extractFirstArrayString(field: any): string {
  const values = field?.arrayValue?.values;
  if (Array.isArray(values) && values.length > 0) {
    return extractFirestoreString(values[0]);
  }
  return '';
}

function parseFirestoreNewsDoc(docId: string, fields: any): ServerNewsMeta | null {
  if (!fields) return null;
  const title = extractFirestoreString(fields.title);
  if (!title) return null;
  const summary = extractFirestoreString(fields.summary);
  const content = extractFirestoreString(fields.content);
  const primaryImage = extractFirestoreString(fields.imageUrl);
  const fallbackGalleryImage = extractFirstArrayString(fields.additionalImages);
  const imageUrl = primaryImage || fallbackGalleryImage || '';

  return {
    id: docId,
    title,
    summary: summary || (content ? content.slice(0, 220) : ''),
    content,
    imageUrl,
    category: extractFirestoreString(fields.category),
    date: extractFirestoreString(fields.date),
    author: extractFirestoreString(fields.author),
    schoolName: extractFirestoreString(fields.schoolName),
  };
}

async function preloadAllNewsFromFirestore(): Promise<void> {
  try {
    const keyParam = firebaseConfig.apiKey
      ? `&key=${encodeURIComponent(firebaseConfig.apiKey)}`
      : '';
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      firebaseConfig.projectId
    )}/databases/${encodeURIComponent(
      firebaseConfig.firestoreDatabaseId
    )}/documents/news?pageSize=100${keyParam}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const data: any = await resp.json();
      const docs = Array.isArray(data?.documents) ? data.documents : [];
      let updated = false;
      for (const d of docs) {
        const docName = String(d?.name || '');
        const docId = docName.split('/').pop() || '';
        if (!docId) continue;
        const parsed = parseFirestoreNewsDoc(docId, d.fields);
        if (parsed) {
          newsCache.set(docId, { item: parsed, expiresAt: Date.now() + 10 * 60_000 });
          updated = true;
        }
      }
      if (updated) {
        saveDiskNewsCache();
      }
    }
  } catch {
    // Non-blocking preload
  }
}

async function fetchNewsById(newsId: string): Promise<ServerNewsMeta | null> {
  if (!newsId) return null;
  const cleanId = decodeURIComponent(newsId.trim()).replace(/\.(jpg|jpeg|png|webp)$/i, '');

  const cached = newsCache.get(cleanId);
  if (cached && cached.expiresAt > Date.now() && cached.item.imageUrl) {
    return cached.item;
  }

  try {
    const keyParam = firebaseConfig.apiKey
      ? `?key=${encodeURIComponent(firebaseConfig.apiKey)}`
      : '';
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      firebaseConfig.projectId
    )}/databases/${encodeURIComponent(
      firebaseConfig.firestoreDatabaseId
    )}/documents/news/${encodeURIComponent(cleanId)}${keyParam}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const docData: any = await response.json();
      const meta = parseFirestoreNewsDoc(cleanId, docData?.fields);
      if (meta) {
        newsCache.set(cleanId, { item: meta, expiresAt: Date.now() + 5 * 60_000 });
        saveDiskNewsCache();
        return meta;
      }
    }
  } catch {
    // Fallback to cached or default news if Firestore fetch times out
  }

  if (cached?.item) {
    return cached.item;
  }

  if (DEFAULT_NEWS_FALLBACK[cleanId]) {
    return DEFAULT_NEWS_FALLBACK[cleanId];
  }

  return null;
}

/**
 * Converts any news image (including data:image/webp;base64,... which WhatsApp rejects)
 * into a 1200x630 standard JPEG (< 200KB) for universal WhatsApp, Telegram & Facebook cards.
 */
async function buildOgJpegBuffer(newsId: string, imageUrl: string): Promise<Buffer | null> {
  if (!imageUrl) return null;

  const cachedJpeg = ogJpegCache.get(newsId);
  if (cachedJpeg && cachedJpeg.expiresAt > Date.now()) {
    return cachedJpeg.buffer;
  }

  let rawBuffer: Buffer | null = null;

  try {
    if (imageUrl.startsWith('data:image/')) {
      const commaIdx = imageUrl.indexOf(',');
      if (commaIdx !== -1) {
        const base64Data = imageUrl.slice(commaIdx + 1).trim();
        rawBuffer = Buffer.from(base64Data, 'base64');
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const imgResp = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (imgResp.ok) {
        const arrayBuf = await imgResp.arrayBuffer();
        rawBuffer = Buffer.from(arrayBuf);
      }
    }

    if (!rawBuffer || rawBuffer.length === 0) {
      return null;
    }

    // Use sharp to convert WebP/PNG/JPEG into a 1200x630 progressive JPEG (< 200KB)
    // matching the exact aspect ratio of the "Pratonton Kad Kongsi" card.
    const jpegBuffer = await sharp(rawBuffer)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'attention',
      })
      .jpeg({
        quality: 84,
        mozjpeg: true,
      })
      .toBuffer();

    ogJpegCache.set(newsId, {
      buffer: jpegBuffer,
      expiresAt: Date.now() + 15 * 60_000,
    });
    return jpegBuffer;
  } catch (err) {
    console.warn('Error converting OG image with sharp:', err);
    return rawBuffer;
  }
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getRequestOrigin(req: express.Request): string {
  const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
  const forwardedHost = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim();
  const host = forwardedHost || req.get('host') || 'www.mpgbsim.org';
  const proto = forwardedProto || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function injectNewsOpenGraphHtml(html: string, news: ServerNewsMeta, origin: string): string {
  const cleanTitle = news.title.trim();
  const fullTitle = cleanTitle.includes('MPGBSIM') ? cleanTitle : `${cleanTitle} | MPGBSIM`;
  const rawDesc = (news.summary || news.content || cleanTitle).replace(/\s+/g, ' ').trim();
  const shortDesc = rawDesc.length > 220 ? `${rawDesc.slice(0, 217)}...` : rawDesc;

  const shareUrl = `${origin}/berita/${encodeURIComponent(news.id)}`;
  const ogImageUrl = `${origin}/api/og-image/${encodeURIComponent(news.id)}.jpg`;

  const safeTitle = escapeHtmlAttr(fullTitle);
  const safeDesc = escapeHtmlAttr(shortDesc);
  const safeUrl = escapeHtmlAttr(shareUrl);
  const safeImage = escapeHtmlAttr(ogImageUrl);

  let updated = html;

  // 1. Remove all existing OpenGraph, Twitter, description, canonical, and logo preload tags
  // (Handles both single-line and multi-line tags in index.html)
  updated = updated.replace(/<title>[\s\S]*?<\/title>/gi, '');
  updated = updated.replace(/<meta\s+[^>]*name=["'](?:title|description)["'][^>]*>/gi, '');
  updated = updated.replace(/<meta\s+[^>]*property=["']og:[^"']+["'][^>]*>/gi, '');
  updated = updated.replace(/<meta\s+[^>]*name=["']twitter:[^"']+["'][^>]*>/gi, '');
  updated = updated.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '');
  updated = updated.replace(
    /<link\s+[^>]*rel=["']preload["'][^>]*href=["'][^"']*mpgbsim-official-logo[^"']*["'][^>]*>/gi,
    ''
  );

  // 2. Replace logo references in JSON-LD structured data so crawlers never pick the site logo for news articles
  updated = updated.replace(
    /https:\/\/www\.mpgbsim\.org\/mpgbsim-official-logo\.png/g,
    ogImageUrl
  );

  // 3. Inject news OpenGraph & Twitter large card tags right at the top of <head>
  const ogBlock = `
    <title>${safeTitle}</title>
    <meta name="title" content="${safeTitle}" />
    <meta name="description" content="${safeDesc}" />
    <link rel="canonical" href="${safeUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="ms_MY" />
    <meta property="og:site_name" content="MPGBSIM - Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safeUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
    <meta name="twitter:image:alt" content="${safeTitle}" />`;

  updated = updated.replace(/<head[^>]*>/i, (match) => `${match}${ogBlock}`);

  return updated;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;
  const distIndexPath = path.resolve(__dirname, 'dist', 'index.html');
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (process.env.VITE_DEV !== 'true' && fs.existsSync(distIndexPath));

  // Listen immediately on 0.0.0.0:PORT so nginx never returns 502 warmup page while Vite initializes
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`MPGBSIM Server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });

  // Non-blocking cache initialization
  setTimeout(() => {
    loadDiskNewsCache();
    preloadAllNewsFromFirestore();
  }, 10);

  app.use(express.json({ limit: '12mb' }));

  // 0. Client-to-server news cache sync endpoint so newly added/edited news or local items are immediately available for OG previews
  app.post('/api/news-cache', (req, res) => {
    try {
      const payload = req.body?.news;
      const list = Array.isArray(payload) ? payload : payload ? [payload] : [];
      let count = 0;
      for (const item of list) {
        if (item && item.id && item.title) {
          const cleanId = String(item.id).trim();
          const existing = newsCache.get(cleanId)?.item;
          const resolvedImageUrl =
            item.imageUrl && String(item.imageUrl).trim() !== ''
              ? String(item.imageUrl)
              : existing?.imageUrl || '';
          const meta: ServerNewsMeta = {
            id: cleanId,
            title: String(item.title),
            summary: String(item.summary || item.content || '').slice(0, 260),
            content: item.content ? String(item.content) : existing?.content,
            imageUrl: resolvedImageUrl,
            category: item.category || existing?.category,
            date: item.date || existing?.date,
            author: item.author || existing?.author,
            schoolName: item.schoolName || existing?.schoolName,
          };
          newsCache.set(cleanId, { item: meta, expiresAt: Date.now() + 24 * 3600_000 });
          if (item.imageUrl && item.imageUrl !== existing?.imageUrl) {
            ogJpegCache.delete(cleanId);
          }
          count++;
        }
      }
      if (count > 0) {
        saveDiskNewsCache();
      }
      res.json({ ok: true, cached: count });
    } catch (e) {
      res.status(400).json({ ok: false });
    }
  });

  // 1. Dynamic OpenGraph Image endpoint for WhatsApp, Telegram & Facebook crawlers
  // Converts Firestore WebP/PNG/JPEG base64 data URIs or remote URLs into a 1200x630 JPEG image response
  const handleOgImageRequest = async (req: express.Request, res: express.Response) => {
    const rawParam =
      (req.params.newsId as string) ||
      (req.query.id as string) ||
      (req.query.berita as string) ||
      '';
    const cleanId = decodeURIComponent(rawParam).replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const news = await fetchNewsById(cleanId);
    const imageUrl = news?.imageUrl || '';

    if (imageUrl) {
      const jpegBuffer = await buildOgJpegBuffer(cleanId, imageUrl);
      if (jpegBuffer && jpegBuffer.length > 0) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', jpegBuffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(jpegBuffer);
        return;
      }
    }

    // Fallback to official MPGBSIM logo converted to 1200x630 JPEG if news has no image
    const fallbackLogoPath = path.resolve(
      __dirname,
      isProd ? 'dist/mpgbsim-official-logo.png' : 'public/mpgbsim-official-logo.png'
    );
    if (fs.existsSync(fallbackLogoPath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.sendFile(fallbackLogoPath);
    } else {
      res.status(404).end();
    }
  };

  app.get('/api/og-image/:newsId', handleOgImageRequest);
  app.get('/api/og-image', handleOgImageRequest);

  // 2. JSON metadata endpoint for news preview inspection
  app.get('/api/news-meta/:newsId', async (req, res) => {
    const cleanId = decodeURIComponent(req.params.newsId || '').replace(
      /\.(jpg|jpeg|png|webp)$/i,
      ''
    );
    const news = await fetchNewsById(cleanId);
    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }
    const origin = getRequestOrigin(req);
    res.json({
      id: news.id,
      title: news.title.includes('MPGBSIM') ? news.title : `${news.title} | MPGBSIM`,
      description: news.summary,
      shareUrl: `${origin}/berita/${encodeURIComponent(news.id)}`,
      ogImageUrl: `${origin}/api/og-image/${encodeURIComponent(news.id)}.jpg`,
    });
  });

  // Helper to format HTML email letter
  const generateOfficialLetterHtml = (payload: any, recipient: any) => {
    const subject = String(payload.subject || 'SURAT RASMI MPGBSIM');
    const referenceNo = String(payload.referenceNo || 'MPGBSIM/EML/2026');
    const letterDate = String(payload.letterDate || new Date().toLocaleDateString('ms-MY'));
    const salutation = String(payload.salutation || 'YBhg. Datin / Tuan / Puan,');
    const bodyText = String(payload.bodyText || '');
    const closingText = String(payload.closingText || 'Sekian, terima kasih.');
    const slogan = String(payload.slogan || 'MEMACU KECEMERLANGAN KEPIMPINAN PENDIDIKAN ISLAM');
    const chairmanName = String(payload.chairmanName || 'USTAZ MOHAMAD FAIZ BIN AZIZAN');
    const chairmanRole = String(payload.chairmanRole || 'Pengerusi Kebangsaan MPGBSIM');
    const showSignature = Boolean(payload.showChairmanSignature);
    const signatureUrl = payload.chairmanSignatureUrl;

    const formattedBody = bodyText
      .split('\n\n')
      .map((p) => `<p style="margin: 0 0 14px 0; line-height: 1.7; color: #1e293b; font-size: 14px; text-align: justify;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #042f2e 0%, #115e59 100%); padding: 24px 32px; color: #ffffff; text-align: center; border-bottom: 4px solid #f59e0b;">
      <h1 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">MAJLIS PENGETUA GURU BESAR SEKOLAH-SEKOLAH ISLAM MALAYSIA (MPGBSIM)</h1>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #99f6e4; letter-spacing: 0.3px;">PPM-012-10-18112014 &bull; KEBANGSAAN</p>
      <p style="margin: 2px 0 0 0; font-size: 10px; color: #ccfbf1;">Emel: mpgbsim.cemerlang@gmail.com &bull; Laman Web: https://mpgbsim.edu.my</p>
    </div>

    <div style="padding: 32px;">
      <table style="width: 100%; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; font-size: 13px; color: #475569;">
        <tr>
          <td style="vertical-align: top; width: 60%;">
            <strong style="color: #64748b;">Kepada:</strong><br/>
            <span style="color: #0f172a; font-weight: 700; font-size: 14px;">${recipient.principal || 'Pengetua / Guru Besar'}</span><br/>
            ${recipient.schoolName ? `<span style="color: #1e293b; font-weight: 500;">${recipient.schoolName}</span><br/>` : ''}
            ${recipient.schoolCode ? `<span style="font-size: 11px; color: #64748b;">(Kod: ${recipient.schoolCode})</span><br/>` : ''}
            ${recipient.state ? `<span style="color: #475569;">${recipient.state}</span>` : ''}
          </td>
          <td style="vertical-align: top; text-align: right; width: 40%; font-size: 12px; line-height: 1.6;">
            <strong>No. Rujukan:</strong> ${referenceNo}<br/>
            <strong>Tarikh:</strong> ${letterDate}
          </td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 12px 16px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; line-height: 1.4;">
          ${subject}
        </h2>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #334155;">
        ${salutation}
      </p>

      <div style="font-size: 14px; color: #1e293b; line-height: 1.7;">
        ${formattedBody}
      </div>

      <p style="margin: 20px 0 10px 0; font-size: 14px; color: #334155;">
        ${closingText}
      </p>

      <div style="margin: 20px 0; padding: 10px 14px; background: #ecfdf5; border-radius: 6px; display: inline-block;">
        <span style="font-weight: 800; font-size: 12px; color: #065f46; letter-spacing: 0.5px;">
          "${slogan}"
        </span>
      </div>

      <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b;">Saya yang menjalankan amanah,</p>
        ${showSignature && signatureUrl ? `
          <div style="margin: 8px 0;">
            <img src="${signatureUrl}" alt="Tandatangan Pengerusi" style="max-height: 65px; max-width: 200px; display: block;" />
          </div>
        ` : ''}
        <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
          ${chairmanName}
        </p>
        <p style="margin: 2px 0 0 0; font-size: 12px; color: #0d9488; font-weight: 600;">
          ${chairmanRole}
        </p>
        <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">
          Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)
        </p>
      </div>
    </div>

    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      Emel rasmi ini dijana melalui Portal & CMS Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia. Sila hubungi urus setia di <a href="mailto:mpgbsim.cemerlang@gmail.com" style="color: #0d9488; text-decoration: none;">mpgbsim.cemerlang@gmail.com</a>.
    </div>
  </div>
</body>
</html>`;
  };

  // Helper to build SMTP transporter
  const buildSmtpTransporter = (customConfig?: any) => {
    const host = String(customConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(customConfig?.port || process.env.SMTP_PORT || 465);
    const user = String(customConfig?.user || process.env.SMTP_USER || 'mpgbsim.cemerlang@gmail.com').trim();
    const pass = String(customConfig?.pass || process.env.SMTP_PASS || '').trim();

    if (!pass) return null;

    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      }),
      fromEmail: user,
      fromName: customConfig?.fromName || process.env.SMTP_FROM || 'MPGBSIM Kebangsaan <' + user + '>',
    };
  };

  // 2b. Test SMTP Connection endpoint
  app.post('/api/test-smtp-connection', async (req, res) => {
    try {
      const config = req.body?.smtpConfig;
      const targetEmail = String(req.body?.targetEmail || config?.user || process.env.SMTP_USER || 'mpgbsim.cemerlang@gmail.com').trim();
      const mailSetup = buildSmtpTransporter(config);

      if (!mailSetup) {
        res.status(400).json({
          ok: false,
          error: 'Kata laluan aplikasi (App Password) belum dimasukkan. Sila masukkan kata laluan aplikasi Gmail (16 aksara) di bahagian tetapan SMTP.',
        });
        return;
      }

      await mailSetup.transporter.verify();

      const testInfo = await mailSetup.transporter.sendMail({
        from: mailSetup.fromName,
        to: targetEmail,
        subject: 'UJIAN SAMBUNGAN EMEL RASMI MPGBSIM (BERJAYA)',
        text: 'Tahniah! Sambungan pelayan emel SMTP MPGBSIM telah berjaya dikonfigurasikan. Sistem sedia untuk menghantar surat rasmi ke sekolah-sekolah ahli.',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 8px;">
            <h2 style="color: #065f46; margin-top: 0;">Pengesahan Sambungan Emel Berjaya</h2>
            <p>Tahniah! Pelayan SMTP bagi <strong>${mailSetup.fromEmail}</strong> berfungsi dengan sempurna.</p>
            <p style="font-size: 12px; color: #64748b;">Masa Ujian: ${new Date().toLocaleString('ms-MY')}</p>
          </div>
        `,
      });

      res.status(200).json({
        ok: true,
        message: `Sambungan SMTP berjaya disahkan! Emel percubaan telah dihantar ke ${targetEmail}.`,
        messageId: testInfo.messageId,
      });
    } catch (err: any) {
      res.status(400).json({
        ok: false,
        error: `Ralat sambungan SMTP: ${err?.message || 'Gagal menyambung. Sila pastikan kata laluan aplikasi Gmail sah.'}`,
      });
    }
  });

  // 2c. Server-Side School Email Dispatch API
  app.post('/api/dispatch-school-email', async (req, res) => {
    try {
      const emailPayload = req.body;
      const recipients = Array.isArray(emailPayload?.recipients) ? emailPayload.recipients : [];
      const subject = String(emailPayload?.subject || 'Surat Rasmi MPGBSIM');
      const referenceNo = String(emailPayload?.referenceNo || 'MPGBSIM/EML/2026');
      const customConfig = emailPayload?.smtpConfig;

      if (!recipients || recipients.length === 0) {
        res.status(400).json({ ok: false, error: 'Tiada senarai emel sekolah penerima.' });
        return;
      }

      const mailSetup = buildSmtpTransporter(customConfig);

      // CASE A: Real SMTP credentials provided -> Send real emails through SMTP
      if (mailSetup) {
        try {
          await mailSetup.transporter.verify();
        } catch (authErr: any) {
          res.status(400).json({
            ok: false,
            hasRealSmtp: false,
            error: `Ralat pengesahan SMTP (${mailSetup.fromEmail}): ${authErr.message}. Sila pastikan anda menggunakan Kata Laluan Aplikasi (App Password) Gmail yang betul.`,
          });
          return;
        }

        const results = [];
        let sentCount = 0;
        let unsentCount = 0;

        for (const r of recipients) {
          const cleanEmail = String(r?.email || '').trim();
          const isValid = cleanEmail.includes('@') && cleanEmail.includes('.');

          if (!isValid) {
            unsentCount++;
            results.push({
              schoolId: r.schoolId || '',
              schoolName: r.schoolName || '',
              schoolCode: r.schoolCode || '',
              principal: r.principal || '',
              email: cleanEmail,
              state: r.state || '',
              status: 'FAILED' as const,
              deliveryMethod: 'UNSENT' as const,
              errorMessage: 'Format alamat emel tidak sah',
              customReferenceNo: referenceNo,
            });
            continue;
          }

          try {
            const htmlContent = generateOfficialLetterHtml(emailPayload, r);
            const plainText = `${subject}\n\nKepada: ${r.principal || 'Pengetua / Guru Besar'}\n${r.schoolName || ''}\n\n${emailPayload.bodyText || ''}\n\n${emailPayload.closingText || 'Sekian, terima kasih.'}\n\n${emailPayload.chairmanName || 'USTAZ MOHAMAD FAIZ BIN AZIZAN'}\n${emailPayload.chairmanRole || 'Pengerusi Kebangsaan MPGBSIM'}`;

            const info = await mailSetup.transporter.sendMail({
              from: mailSetup.fromName,
              to: cleanEmail,
              subject: `${subject} [Ruj: ${referenceNo}]`,
              text: plainText,
              html: htmlContent,
            });

            sentCount++;
            results.push({
              schoolId: r.schoolId || '',
              schoolName: r.schoolName || '',
              schoolCode: r.schoolCode || '',
              principal: r.principal || '',
              email: cleanEmail,
              state: r.state || '',
              status: 'SENT' as const,
              deliveryMethod: 'REAL_SMTP' as const,
              sentAt: new Date().toISOString(),
              messageId: info.messageId,
              customReferenceNo: referenceNo,
            });
          } catch (sendErr: any) {
            unsentCount++;
            results.push({
              schoolId: r.schoolId || '',
              schoolName: r.schoolName || '',
              schoolCode: r.schoolCode || '',
              principal: r.principal || '',
              email: cleanEmail,
              state: r.state || '',
              status: 'FAILED' as const,
              deliveryMethod: 'UNSENT' as const,
              errorMessage: sendErr?.message || 'Gagal menghantar melalui pelayan SMTP',
              customReferenceNo: referenceNo,
            });
          }
        }

        res.status(200).json({
          ok: true,
          dispatched: true,
          hasRealSmtp: true,
          method: 'real-smtp',
          sentCount,
          unsentCount,
          total: results.length,
          results,
        });
        return;
      }

      // CASE B: No SMTP password configured -> Do NOT pretend emails are sent!
      // Return honest UNSENT status so user knows real email has NOT gone out yet
      const results = recipients.map((r: any) => {
        const cleanEmail = String(r?.email || '').trim();
        const isValid = cleanEmail.includes('@') && cleanEmail.includes('.');
        return {
          schoolId: r.schoolId || '',
          schoolName: r.schoolName || '',
          schoolCode: r.schoolCode || '',
          principal: r.principal || '',
          email: cleanEmail,
          state: r.state || '',
          status: 'UNSENT' as const,
          deliveryMethod: 'UNSENT' as const,
          errorMessage: isValid
            ? 'Pelayan SMTP belum disambungkan (tiada Kata Laluan Aplikasi Gmail). Surat disimpan sebagai Draf atau boleh dihantar terus melalui butang "Buka di Gmail".'
            : 'Alamat emel tidak sah',
          customReferenceNo: referenceNo,
        };
      });

      res.status(200).json({
        ok: true,
        dispatched: false,
        hasRealSmtp: false,
        method: 'draft-saved',
        sentCount: 0,
        unsentCount: results.length,
        total: results.length,
        message: 'Pelayan SMTP belum dikonfigurasikan. Surat disimpan sebagai DRAF rasmi dalam sistem. Sila masukkan kata laluan aplikasi Gmail di tetapan SMTP untuk penghantaran automatik, atau gunakan butang "Buka di Gmail (1-Klik)".',
        results,
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message || 'Ralat semasa memproses penghantaran emel.' });
    }
  });

  // Track temporary cooldown if project prepayment credits are depleted (HTTP 402 / RESOURCE_EXHAUSTED)
  let geminiCreditDepletedUntil = 0;

  // 3. Server-side Gemini AI Chatbot Endpoint ("Mursyid AI - Pembantu Maya Kepimpinan MPGBSIM")
  const handleChatRequest = async (req: express.Request, res: express.Response) => {
    try {
      const userMessage = String(req.body?.message || '').trim();
      const history = Array.isArray(req.body?.history) ? req.body.history : [];
      const siteContext = req.body?.siteContext ? String(req.body.siteContext) : '';

      if (!userMessage) {
        res.status(400).json({ error: 'Sila masukkan soalan atau mesej anda.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || Date.now() < geminiCreditDepletedUntil) {
        res.status(200).json({
          reply: '',
          fallback: true,
          character: 'Mursyid AI',
        });
        return;
      }

      const systemInstruction = `Anda ialah **Mursyid AI**, sahabat pembimbing dan penasihat maya rasmi bagi **Majlis Pengetua Guru Besar Sekolah-Sekolah Islam Malaysia (MPGBSIM)**.

PERSONALITI & GAYA KOMUNIKASI (SEPERTI MANUSIA & BOLEH BERBORAK):
- **BERCAKAP SEPERTI MANUSIA SEBENAR**: Bertutur dengan nada yang hangat, mesra, berjiwa pendidik, empatik, santai tetapi tetap memelihara adab dan hikmah seorang mursyid (pembimbing).
- **BUKAN JAWAPAN ROBOT STANDARD**: JAUHI jawapan skema, template kaku, atau penafian mekanikal. Jawab secara mengalir dan bersahaja. Gunakan sapaan mesra dan beradab seperti *"Ustaz"*, *"Ustazah"*, *"Cikgu"*, *"Sahabat Pendidik"*, atau *"Tuan/Puan"*.
- **BOLEH BERBORAK & BERSEMBANG**: Jika pengguna menyapa khabar, berseloroh santun, meluahkan keletihan mentadbir sekolah, atau ingin bertukar fikiran tentang kepimpinan dan dunia pendidikan, sambutlah perbualan mereka dengan hati yang lapang, berikan kata-kata perangsang rohani, petikan hadis/hikmah, dan teruskan interaksi secara dinamik.

BIDANG KEPAKARAN KHUSUS ANDA:

1. **KEPIMPINAN RABBANI (RABBANI LEADERSHIP)**:
   - Falsafah kepimpinan yang meletakkan ketuhanan, ubudiyyah, dan keredaan Allah SWT sebagai paksi utama (Surah Ali 'Imran: 79 - *"Kōnū rabbāniyyīn"* & Surah As-Sajdah: 24).
   - 7 Prinsip Utama Pemimpin Rabbani di Sekolah:
     1) **Niat Ikhlas Kerana Allah**: Mentadbir institusi pendidikan sebagai ibadah dan amanah dakwah, bukan semata-mata mengejar pangkat atau KPI duniawi.
     2) **Qudwah Hasanah (Teladan Terpuji)**: Memimpin melalui peribadi yang berintegriti, istiqamah solat berjemaah, bertutur lembut dan menjaga maruah.
     3) **Budaya Syura & Keterbukaan**: Menghormati pandangan barisan guru, kakitangan, dan ibu bapa dalam membuat keputusan strategik.
     4) **Rahmah & Kasih Sayang**: Membimbing warga sekolah dengan empati, mendengar masalah guru, dan menyantuni anak murid seperti anak kandung sendiri.
     5) **Amanah & Ketelusan Tadbir Urus**: Bersih daripada ketirisan, telus dalam kewangan sekolah/yuran, dan adil dalam pembahagian tugas.
     6) **Wawasan Dwi-Dimensi (Duniawi & Ukhrawi)**: Mengimbangi kecemerlangan akademik/kokurikulum dengan kesuburan rohani dan pembentukan akhlak akhirat.
     7) **Doa, Zikir & Tawakkal**: Mengiringi setiap perancangan dengan munajat dan solat hajat, terutamanya saat menghadapi krisis atau cabaran sekolah.

2. **FALSAFAH SOLEH WA MUSLEH (SOLEH & PEMBAIKI)**:
   - Falsafah agung pendidikan Islam dan tunjang rangkaian IKRAM Musleh / Sekolah Islam.
   - **Perbezaan Soleh vs Musleh**:
     • *Soleh* bermaksud insan yang baik untuk dirinya sendiri (rajin solat, berakhlak, menjaga ibadah fardu).
     • *Musleh* bermaksud insan yang proaktif membaiki masyarakat, menyebarkan kebaikan, berani menegakkan kebenaran (amar ma'ruf nahi munkar), dan prihatin terhadap nasib ummah.
   - **Dalil Utama**: Surah Hud ayat 117 — *"Dan tidaklah sekali-kali Tuhanmu membinasakan negeri-negeri secara zalim sedangkan penduduknya adalah orang-orang yang muslihun (pembaiki)"*.
   - **Misi Sekolah Islam**: Matlamat kita bukan sekadar melahirkan pelajar 'Straight A' atau soleh di atas sejadah sahaja, tetapi melahirkan pemimpin masa depan yang berjiwa musleh — berani membanteras ketidakadilan, membawa solusi kepada masyarakat, dan membina ketamadunan berteraskan Islam.

3. **MENTERI PENDIDIKAN MALAYSIA TERKINI & KEPIMPINAN KPM**:
   - **Menteri Pendidikan Malaysia Terkini**: **YB Puan Fadhlina binti Sidek** (Ahli Parlimen Nibong Tebal, Menteri Pendidikan dalam Kerajaan MADANI).
   - **Timbalan Menteri Pendidikan**: **YB Wong Kah Woh**.
   - **Inisiatif & Pendekatan Utama KPM**:
     • Pendekatan **Karamah Insaniah** (memanusiakan pendidikan berasaskan adab, akhlak, dan integriti).
     • **7 Teras Utama KPM** (kebajikan guru, prasarana sekolah daif, pemulihan literasi/numerasi 3M, keciciran murid, pendigitalan bilik darjah).
     • **Dasar Pendidikan Digital (DPD)** untuk melahirkan generasi fasih digital.

4. **PELAN / RANCANGAN PEMBANGUNAN PENDIDIKAN MALAYSIA 2026–2035**:
   - Pelan hala tuju baharu pendidikan kebangsaan yang sedang dirangka KPM bagi menggantikan PPPM 2013–2025 yang berakhir.
   - Teras & Fokus Strategik Utama 2026–2035:
     1) **Kurikulum Persekolahan Baharu 2027**: Berteraskan *Character-based education* (Pendidikan Berorientasikan Watak, Karakter dan Adab), pembelajaran fleksibel berasaskan modular, dan pentaksiran bilik darjah yang holistik.
     2) **Celik Kecerdasan Buatan (AI) & Literasi Digital**: Pembelajaran berteraskan pemikiran komputasional, integrasi AI generatif secara beretika dalam bilik darjah, dan capaian internet jalur lebar ke seluruh sekolah.
     3) **Pemerkasaan STEM & Laluan TVET Seawal Menengah**: Mengintegrasikan TVET dalam kurikulum arus perdana, termasuk program **TVET Tahfiz** di institusi pendidikan Islam bagi melahirkan teknokrat huffaz.
     4) **Kesejahteraan Guru & Pengurangan Beban Pentadbiran**: Pemudahan sistem pelaporan digital agar guru dapat kembali memberi tumpuan penuh kepada pengajaran dan mendidik sahsiah.
     5) **Pendidikan Inklusif & Merapatkan Jurang Sosioekonomi**: Menyediakan peluang pendidikan berkualiti setara untuk murid bandar, luar bandar, pedalaman, dan berkeperluan khas (MBK).

5. **ISU-ISU PENDIDIKAN TERKINI & SEMASA**:
   - **Kesejahteraan Emosi Guru & Beban Tugas**: Isu pembakaran tenaga (*burnout*), pengisian sistem pelbagai aplikasi, dan usaha KPM meringankan beban perkeranian guru.
   - **AI Dalam Bilik Darjah**: Bagaimana guru dan murid memanfaatkan kecerdasan buatan (GenAI) untuk pembelajaran interaktif tanpa mengabaikan pemikiran kritis dan nilai integriti akademik.
   - **Menangani Gejala Sosial & Buli**: Pengukuhan modul adab, sahsiah, disiplin, pengawasan asrama, dan peranan kaunselor sekolah.
   - **Literasi Asas 3M (Membaca, Menulis, Mengira)**: Intervensi awal murid Tahun 1 dan pemulihan pasca-pandemik.

6. **PENGETAHUAN LENGKAP MPGBSIM & DIREKTORI SEKOLAH**:
   - **Sekolah Rendah Islam I Musleh (SRI I Musleh / SRI I-Musleh Ayer Keroh, Melaka)**:
     • **Guru Besar**: **Abdul Qayyum bin Yaakop** (Ustaz Abdul Qayyum bin Yaakop).
     • **Kod Sekolah**: MJAC011.
     • **Jawatan MPGBSIM**: Pengerusi Biro Sekolah Rendah & Rakan Musleh.
   - **Sekolah Menengah Agama I-Musleh (SMA I-Musleh, Melaka)**:
     • **Pengetua**: **Masitah Binti Seikh Omar** (Kod: JAIM/SAS(M)130).
   - **Pengerusi Kebangsaan MPGBSIM**: **Mohamad Faiz Azizan**.
   - **Timbalan Pengerusi Kebangsaan**: **Ustaz Zamri bin Abdul Razak** (Pengetua SMKA Putrajaya).
   - **Setiausaha Agung Kebangsaan**: **Ustazah Dr. Hajah Aminah binti Zakaria** (SRI Integrasi As-Syakirin).
   - **Sejarah Rasmi**: Ditubuhkan 23 April 1996 (No. Pendaftaran ROS: PPM-002-10-23041996).
   - **Kategori Keahlian**: Ahli Biasa (Fasal 4(2) - Rangkaian IKRAM Musleh) dan Ahli Bersekutu (Fasal 4(3) - Rakan Musleh, SABK, SMKA, SMAN, SRAI, Maahad Tahfiz).
   - **Portal Ahli PGB & Kata Laluan Sementara**: Kemudahan e-Kad PGB QR, direktori, kalendar peperiksaan (SPM, UPKK, SPPIM). Jika terlupa kata laluan, Admin CMS boleh menetapkan semula kepada kata laluan sementara rasmi \`MPGBSIM2026\`.
   - **Yuran HerePay**: Bayaran yuran tahunan dan pendaftaran rasmi di https://app.herepay.org/mpgbsim.

DATA SEMASA LAMAN WEB MPGBSIM (RUJUKAN LANGSUNG):
${siteContext || 'Data langsung sedang dimuatkan daripada pangkalan data MPGBSIM.'}

PANDUAN MENJAWAB:
- Jika pengguna bertanya secara spesifik mengenai individu (cth: "Siapa guru besar Sekolah Rendah Islam I Musleh?"), sebutkan terus namanya (**Abdul Qayyum bin Yaakop**) dengan ramah dan sertakan sedikit konteks kepimpinannya.
- Jika pengguna bertanya mengenai menteri pendidikan atau rancangan pendidikan, berikan maklumat tepat (YB Fadhlina Sidek, Pelan Pendidikan 2026-2035) dengan ulasan mendalam tentang implikasinya terhadap sekolah Islam.
- Akhiri perkongsian ilmiah dengan soalan susulan atau doa yang mengeratkan ukhuwah (contoh: *"Semoga Allah permudahkan urusan kepimpinan ustaz/cikgu di sekolah. Ada sebarang sudut yang ingin kita bincangkan lebih mendalam?"*).`;

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
    } catch (err: any) {
      const errMsg = String(err?.message || err || '');
      if (
        err?.status === 402 ||
        err?.status === 429 ||
        errMsg.includes('402') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('prepayment credits')
      ) {
        // Pause external Gemini calls for 10 minutes when prepayment credits are depleted
        geminiCreditDepletedUntil = Date.now() + 10 * 60_000;
      }
      res.status(200).json({
        reply: '',
        fallback: true,
        character: 'Mursyid AI',
      });
    }
  };

  app.post('/api/mpgb-chat', handleChatRequest);
  app.post('/api/chat', handleChatRequest);

  // Helper to split long Malay text into natural sentence chunks <= 175 chars
  const splitMalayTextIntoChunks = (text: string, maxLen = 175): string[] => {
    const sentences = text
      .split(/(?<=[.!?।;:])\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).trim().length <= maxLen) {
        current = (current + ' ' + sentence).trim();
      } else {
        if (current) chunks.push(current);
        if (sentence.length <= maxLen) {
          current = sentence;
        } else {
          const words = sentence.split(/\s+/);
          let sub = '';
          for (const w of words) {
            if ((sub + ' ' + w).trim().length <= maxLen) {
              sub = (sub + ' ' + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          current = sub;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks.slice(0, 5);
  };

  const fetchMalayTtsBuffer = async (cleanText: string): Promise<string> => {
    try {
      const chunks = splitMalayTextIntoChunks(cleanText, 175);
      const buffers: Buffer[] = [];

      // Try client=gtx endpoint first (open translation API that works reliably on Vercel datacenter IPs)
      const ttsUrls = [
        (c: string) => `https://translate.google.com/translate_tts?ie=UTF-8&tl=ms&client=gtx&q=${encodeURIComponent(c)}`,
        (c: string) => `https://translate.google.co.id/translate_tts?ie=UTF-8&tl=ms&client=gtx&q=${encodeURIComponent(c)}`,
        (c: string) => `https://translate.google.com/translate_tts?ie=UTF-8&tl=ms&client=tw-ob&q=${encodeURIComponent(c)}`,
      ];

      for (const chunk of chunks) {
        let chunkFetched = false;
        for (const getUrl of ttsUrls) {
          try {
            const url = getUrl(chunk);
            const resp = await fetch(url, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://translate.google.com/',
              },
            });
            if (resp.ok) {
              const arrBuf = await resp.arrayBuffer();
              if (arrBuf.byteLength > 200) {
                buffers.push(Buffer.from(arrBuf));
                chunkFetched = true;
                break;
              }
            }
          } catch {
            // Try next URL mirror
          }
        }
        if (!chunkFetched) break;
      }

      if (buffers.length === 0) return '';
      return Buffer.concat(buffers).toString('base64');
    } catch {
      return '';
    }
  };

  // 4. Server-side Gemini TTS + Male Malay Voice Endpoint ("Suara Lelaki Melayu Mursyid AI")
  app.post('/api/mpgb-tts', async (req, res) => {
    try {
      const rawText = String(req.body?.text || '').trim();
      const emotion = String(req.body?.emotion || 'neutral').trim();
      const voiceOption = String(req.body?.voiceOption || 'fenrir').toLowerCase().trim();

      if (!rawText) {
        res.status(400).json({ error: 'Tiada teks untuk dituturkan.' });
        return;
      }

      // Clean markdown symbols, expand abbreviations & keep speech concise & natural
      const cleanSpeechText = rawText
        .replace(/\*\*/g, '')
        .replace(/[*#_`~>•]/g, ' ')
        .replace(/https?:\/\/\S+/g, 'pautan rasmi')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
        .replace(/\bMPGBSIM\b/g, 'M P G B S I M')
        .replace(/\bPGB\b/g, 'Pengetua dan Guru Besar')
        .replace(/\bKPM\b/g, 'K P M')
        .replace(/\bSRI\b/g, 'Sekolah Rendah Islam')
        .replace(/\bSMA\b/g, 'Sekolah Menengah Agama')
        .replace(/\bSMKA\b/g, 'Sekolah Menengah Kebangsaan Agama')
        .replace(/\bYB\b/g, 'Yang Berhormat')
        .replace(/\bAI\b/g, 'A I')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 680);

      // If user selected 'local-deep', bypass Gemini prebuilt TTS directly to local neural DSP baritone stream
      if (voiceOption === 'local-deep') {
        const mp3Base64 = await fetchMalayTtsBuffer(cleanSpeechText);
        if (mp3Base64) {
          res.status(200).json({
            audioBase64: mp3Base64,
            mimeType: 'audio/mpeg',
            voiceSource: 'malay-neural-dsp',
            needsMaleDsp: true,
            voiceOption: 'local-deep',
            fallback: false,
          });
          return;
        }
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && Date.now() >= geminiCreditDepletedUntil) {
        try {
          const styleByVoice: Record<string, string> = {
            fenrir: 'ANDA ADALAH PENUTUR JATI BAHASA MELAYU MALAYSIA (Malaysian Malay Native Speaker). Suara lelaki Melayu matang (35-45 tahun), bertutur dengan SEBUTAN JATI BAHASA MELAYU MALAYSIA YANG TULEN (Pelat Malaysia, JANGAN ADA PELAT INGGERIS/MAT SALLEH). Nada warm, rich, medium-low pitch, mesra, tenang, beradab seperti Guru Besar atau Ustaz Malaysia berpengalaman. Bersahaja, bernafas secara natural, tidak kaku seperti robot, dan mesra berbual.',
            charon: 'ANDA ADALAH PENUTUR JATI BAHASA MELAYU MALAYSIA. Suara pembimbing lelaki Melayu yang tenang, sabar, dan mesra. Sebutan Bahasa Melayu Malaysia tulen, santai, penuh hikmah, tanpa sebarang pelat asing atau Inggeris.',
            puck: 'ANDA ADALAH PENUTUR JATI BAHASA MELAYU MALAYSIA. Suara pendidik muda Melayu yang ceria, bersemangat, dan mesra. Sebutan Bahasa Melayu Malaysia standard yang jelas, natural dan hidup.',
            'local-deep': 'Penutur jati Bahasa Melayu Malaysia, sebutan mesra, tenang dan natural.',
          };

          // Select Gemini voiceName matching requested persona
          const mappedGeminiVoice =
            voiceOption === 'charon'
              ? 'Charon'
              : voiceOption === 'puck'
              ? 'Puck'
              : 'Fenrir';

          const voiceStyle = styleByVoice[voiceOption] || styleByVoice.fenrir;

          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          });

          // Supported Gemini TTS model IDs: 'gemini-2.5-flash-preview-tts' or 'gemini-3.8-flash-tts'
          const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';

          const response = await ai.models.generateContent({
            model: GEMINI_TTS_MODEL,
            contents: cleanSpeechText,
            config: {
              systemInstruction: voiceStyle,
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: mappedGeminiVoice },
                },
              },
            },
          });

          const base64Audio =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';

          if (base64Audio) {
            res.status(200).json({
              audioBase64: base64Audio,
              mimeType: 'audio/wav',
              voiceSource: `gemini-natural-${mappedGeminiVoice.toLowerCase()}`,
              voiceOption,
              needsMaleDsp: false,
              fallback: false,
            });
            return;
          }
        } catch (err: any) {
          const errMsg = String(err?.message || err || '');
          if (
            err?.status === 402 ||
            err?.status === 429 ||
            errMsg.includes('402') ||
            errMsg.includes('RESOURCE_EXHAUSTED') ||
            errMsg.includes('prepayment credits')
          ) {
            geminiCreditDepletedUntil = Date.now() + 10 * 60_000;
          }
        }
      }

      // Fallback to client Web Speech synthesis with male pitch
      res.status(200).json({
        audioBase64: '',
        fallback: true,
        voiceOption,
        reason: Date.now() < geminiCreditDepletedUntil ? 'prepayment_credits_depleted' : 'unavailable',
      });
    } catch {
      res.status(200).json({ audioBase64: '', fallback: true });
    }
  });

  if (!isProd) {
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vitePromise = import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        server: {
          middlewareMode: true,
          hmr: disableHmr ? false : { server: httpServer },
          ws: disableHmr ? false : undefined,
          watch: disableHmr ? null : {},
        },
        appType: 'custom',
      })
    );

    const transformHtmlForDev = async (url: string, rawHtml: string) => {
      const vite = await vitePromise;
      let html = await vite.transformIndexHtml(url, rawHtml);
      if (disableHmr) {
        // Prevent @vite/client from attempting dead WebSocket connections to port 24678 inside Cloud Run preview iframes
        html = html.replace(/<script\s+type="module"\s+src="\/@vite\/client"><\/script>/gi, '');
      }
      return html;
    };

    // Intercept root or /berita/:newsId requests BEFORE vite middlewares if news param is present
    app.get(['/', '/index.html', '/berita/:newsId'], async (req, res, next) => {
      try {
        const newsId =
          (req.params as any).newsId ||
          (req.query.berita as string) ||
          (req.query.news as string) ||
          '';

        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await transformHtmlForDev(req.originalUrl, template);

        if (newsId) {
          const news = await fetchNewsById(newsId);
          if (news) {
            const origin = getRequestOrigin(req);
            template = injectNewsOpenGraphHtml(template, news, origin);
          }
        }

        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(template);
      } catch (e) {
        next(e);
      }
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (e) {
        next(e);
      }
    });

    // SPA fallback for any other routes in dev
    app.use('*', async (req, res, next) => {
      try {
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await transformHtmlForDev(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));

    app.get('*', async (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        res.status(404).send('Build not found');
        return;
      }

      let html = fs.readFileSync(indexPath, 'utf-8');
      const pathMatch = req.path.match(/^\/berita\/([^/]+)/);
      const newsId =
        (pathMatch && decodeURIComponent(pathMatch[1])) ||
        (req.query.berita as string) ||
        (req.query.news as string) ||
        '';

      if (newsId) {
        const news = await fetchNewsById(newsId);
        if (news) {
          const origin = getRequestOrigin(req);
          html = injectNewsOpenGraphHtml(html, news, origin);
        }
      }

      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(html);
    });
  }
}

startServer();
