import sharp from 'sharp';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'compact-vigil-cf6jr';
const DATABASE_ID =
  process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  'ai-studio-mpgbsimmajlispen-d6e7972c-8fd2-4adc-81e6-ff46f648dee7';
const API_KEY =
  process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCoUNSSoxIocRQBwoQfqQE8_svuFXYMtZM';

function extractStr(field) {
  if (!field || typeof field !== 'object') return '';
  return typeof field.stringValue === 'string' ? field.stringValue : '';
}

function extractFirstArr(field) {
  const vals = field?.arrayValue?.values;
  if (Array.isArray(vals) && vals.length > 0) {
    return extractStr(vals[0]);
  }
  return '';
}

export default async function handler(req, res) {
  try {
    const rawId = String(req.query?.id || req.query?.newsId || req.query?.berita || '')
      .trim()
      .replace(/\.(jpg|jpeg|png|webp)$/i, '');

    let imageUrl = '';

    if (rawId) {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
        PROJECT_ID
      )}/databases/${encodeURIComponent(DATABASE_ID)}/documents/news/${encodeURIComponent(
        rawId
      )}?key=${encodeURIComponent(API_KEY)}`;

      const fsResp = await fetch(firestoreUrl);
      if (fsResp.ok) {
        const docData = await fsResp.json();
        const fields = docData?.fields || {};
        imageUrl = extractStr(fields.imageUrl) || extractFirstArr(fields.additionalImages) || '';
      }
    }

    if (imageUrl) {
      let rawBuffer = null;
      if (imageUrl.startsWith('data:image/')) {
        const commaIdx = imageUrl.indexOf(',');
        if (commaIdx !== -1) {
          rawBuffer = Buffer.from(imageUrl.slice(commaIdx + 1).trim(), 'base64');
        }
      } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        const imgResp = await fetch(imageUrl);
        if (imgResp.ok) {
          const ab = await imgResp.arrayBuffer();
          rawBuffer = Buffer.from(ab);
        }
      }

      if (rawBuffer && rawBuffer.length > 0) {
        const jpegBuffer = await sharp(rawBuffer)
          .resize(1200, 630, { fit: 'cover', position: 'attention' })
          .jpeg({ quality: 84, mozjpeg: true })
          .toBuffer();

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', String(jpegBuffer.length));
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).send(jpegBuffer);
      }
    }

    res.redirect(302, '/mpgbsim-official-logo.png');
  } catch (e) {
    res.redirect(302, '/mpgbsim-official-logo.png');
  }
}
