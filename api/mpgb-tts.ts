import { GoogleGenAI } from '@google/genai';

/**
 * Splits long Bahasa Melayu text into natural sentence chunks <= 180 chars
 * for clean TTS synthesis.
 */
function splitMalayTextIntoChunks(text: string, maxLen = 180): string[] {
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
        // Split very long sentence by commas or words
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
}

/**
 * Fetches Bahasa Melayu MP3 audio buffers so the client can apply
 * Web Audio API Male Baritone Pitch & Formant DSP when Gemini TTS is unavailable.
 */
async function fetchMalayTtsBuffer(cleanText: string): Promise<string> {
  const chunks = splitMalayTextIntoChunks(cleanText, 175);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ms&client=tw-ob&q=${encodeURIComponent(
      chunk
    )}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    if (resp.ok) {
      const arrBuf = await resp.arrayBuffer();
      buffers.push(Buffer.from(arrBuf));
    }
  }

  if (buffers.length === 0) return '';
  return Buffer.concat(buffers).toString('base64');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const rawText = String(req.body?.text || '').trim();
    const emotion = String(req.body?.emotion || 'neutral').trim();

    if (!rawText) {
      res.status(400).json({ error: 'Tiada teks untuk dituturkan.' });
      return;
    }

    const cleanSpeechText = rawText
      .replace(/\*\*/g, '')
      .replace(/[*#_`~>•]/g, ' ')
      .replace(/https?:\/\/\S+/g, 'pautan rasmi')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\bMPGBSIM\b/g, 'M P G B S I M')
      .replace(/\bPGB\b/g, 'Pengetua dan Guru Besar')
      .replace(/\bKPM\b/g, 'K P M')
      .replace(/\bSRI\b/g, 'Sekolah Rendah Islam')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 680);

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Try Gemini 3.8 TTS with Male Voice ("Charon" - Deep Male Mentor)
    if (apiKey) {
      try {
        const styleByEmotion: Record<string, string> = {
          happy:
            'Deep male Malaysian Malay ustaz and educator voice, warm, cheerful, friendly baritone',
          waving:
            'Deep male Malaysian Malay ustaz voice, welcoming, polite, warm baritone greeting',
          serious:
            'Deep authoritative male Malaysian Malay school principal, calm, composed, firm baritone',
          empathetic:
            'Deep gentle male Malaysian Malay mentor, compassionate, comforting baritone',
          inspiring:
            'Deep inspiring male Malaysian Malay Islamic leader, passionate, visionary baritone',
          thinking:
            'Deep thoughtful male Malaysian Malay advisor, articulate baritone',
          neutral:
            'Deep natural male Malaysian Malay educator and mentor, clear baritone voice',
        };

        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanSpeechText,
                  speechMetadata: {
                    style: styleByEmotion[emotion] || styleByEmotion.neutral,
                  },
                } as any,
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Charon' },
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
            voiceSource: 'gemini-male',
            needsMaleDsp: false,
            fallback: false,
          });
          return;
        }
      } catch {
        // Fall through to Malay TTS stream + Male Baritone DSP
      }
    }

    // 2. Fallback Server-Side Bahasa Melayu Audio Stream (Processed by Client Web Audio Male Baritone DSP)
    const mp3Base64 = await fetchMalayTtsBuffer(cleanSpeechText);
    if (mp3Base64) {
      res.status(200).json({
        audioBase64: mp3Base64,
        mimeType: 'audio/mpeg',
        voiceSource: 'malay-neural-dsp',
        needsMaleDsp: true,
        fallback: false,
      });
      return;
    }

    res.status(200).json({ audioBase64: '', fallback: true });
  } catch {
    res.status(200).json({ audioBase64: '', fallback: true });
  }
}
