import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquareHeart,
  Smile,
  Hand,
  Brain,
  HeartHandshake,
  Zap,
  Volume2,
  VolumeX,
  ShieldAlert,
  Meh,
} from 'lucide-react';

export type MursyidEmotion =
  | 'idle'
  | 'neutral'
  | 'waving'
  | 'happy'
  | 'serious'
  | 'thinking'
  | 'empathetic'
  | 'speaking'
  | 'inspiring';

export interface SentimentAnalysisResult {
  emotion: MursyidEmotion;
  sentimentCategory: 'Gembira / Positif' | 'Neutral / Fakta' | 'Serius / Tegas' | 'Sedih / Prihatin' | 'Analitikal / Berfikir' | 'Salam & Ukhuwah' | 'Inspirasi Rabbani';
  bodyLanguageLabel: string;
  facialExpressionLabel: string;
}

/**
 * Analyzes user input or conversation text to determine sentiment,
 * mapping it to Mursyid AI's state-based facial expression and body language.
 */
export function analyzeMursyidSentiment(text: string): SentimentAnalysisResult {
  const normalized = (text || '').toLowerCase().trim();

  if (!normalized) {
    return {
      emotion: 'neutral',
      sentimentCategory: 'Neutral / Fakta',
      bodyLanguageLabel: 'Postur tenang, pernafasan stabil & bersedia mendengar',
      facialExpressionLabel: 'Mata fokus semula jadi & senyuman tenang',
    };
  }

  // 1. Check Serious / Formal / Policy / Discipline / Audit / Urgent issues
  if (
    /\b(serius|tegas|disiplin|tatatertib|audit|undang-undang|akta|perlembagaan|ros|amaran|krisis|kritikal|masalah besar|kesalahan|gantung|buang sekolah|jenayah|buli|keselamatan|kecemasan|wajib|patuh|integriti|rasuah|akauntabiliti|kewangan|defisit|tunggakan)\b/.test(
      normalized
    )
  ) {
    return {
      emotion: 'serious',
      sentimentCategory: 'Serius / Tegas',
      bodyLanguageLabel: 'Postur tegak berwibawa, bahu stabil & anggukan tegas',
      facialExpressionLabel: 'Kening berkerut fokus, pandangan tajam & bibir serius',
    };
  }

  // 2. Check Empathetic / Sad / Stressed / Teacher Burnout
  if (
    /\b(sedih|penat|lelah|letih|stres|stress|tekanan|beban|kecewa|risau|bimbang|susah hati|menangis|dugaan|ujian|sakit|musibah|simpati|prihatin|kesian|tolonglah|buntu|putus asa|keluh)\b/.test(
      normalized
    )
  ) {
    return {
      emotion: 'empathetic',
      sentimentCategory: 'Sedih / Prihatin',
      bodyLanguageLabel: 'Kepala meneleng lembut, gerakan perlahan & menyantuni',
      facialExpressionLabel: 'Kening sayu prihatin, mata redup & senyuman menenangkan',
    };
  }

  // 3. Check Happy / Positive / Grateful / Joyful
  if (
    /\b(gembira|seronok|suka|ceria|alhamdulillah|syukur|tahniah|cemerlang|hebat|terbaik|bagus|berjaya|menang|anugerah|terima kasih|syukran|mantap|gemilang|senyum|ketawa|haha)\b/.test(
      normalized
    )
  ) {
    return {
      emotion: 'happy',
      sentimentCategory: 'Gembira / Positif',
      bodyLanguageLabel: 'Gerakan badan ceria, kepala mengangguk riang & tangan melambai',
      facialExpressionLabel: 'Mata melengkung ceria, pipi berseri & senyuman lebar',
    };
  }

  // 4. Check Greetings / Waving
  if (
    /\b(assalamualaikum|salam|hai|hello|hi|apa khabar|selamat pagi|selamat petang|selamat sejahtera|ahlan|berkenalan)\b/.test(
      normalized
    )
  ) {
    return {
      emotion: 'waving',
      sentimentCategory: 'Salam & Ukhuwah',
      bodyLanguageLabel: 'Tangan kanan melambai mesra & badan sedikit membongkok hormat',
      facialExpressionLabel: 'Kening terangkat mesra & senyuman menyambut tetamu',
    };
  }

  // 5. Check Inspiring / Rabbani / Visionary
  if (
    /\b(rabbani|soleh wa musleh|musleh|dakwah|tarbiah|hikmah|visi|misi|2026|2035|kurikulum 2027|semangat|motivasi|inspirasi|ummah|adab|akhlak|karamah insaniah)\b/.test(
      normalized
    )
  ) {
    return {
      emotion: 'inspiring',
      sentimentCategory: 'Inspirasi Rabbani',
      bodyLanguageLabel: 'Dada bidang bersemangat, aura bercahaya & gerakan tangan yakin',
      facialExpressionLabel: 'Mata bersinar fokus, kening terangkat & senyuman berwawasan',
    };
  }

  // 6. Check Analytical / Thinking questions
  if (
    /\b(kenapa|mengapa|bagaimana|analisis|bandingkan|strategi|cadangan|pendapat|pandangan|kajian|statistik|jumlah|berapa|senaraikan|terangkan)\b/.test(
      normalized
    )
  ) {
    return {
      emotion: 'thinking',
      sentimentCategory: 'Analitikal / Berfikir',
      bodyLanguageLabel: 'Kepala meneleng memikirkan solusi & postur meneliti',
      facialExpressionLabel: 'Sebelah kening terangkat & bibir fokus meneliti',
    };
  }

  // 7. Default Neutral / Factual
  return {
    emotion: 'neutral',
    sentimentCategory: 'Neutral / Fakta',
    bodyLanguageLabel: 'Postur tenang profesional & pernafasan sekata',
    facialExpressionLabel: 'Mimik muka tenang, kening neutral & kelipan mata semula jadi',
  };
}

// Global singleton references for active audio playback so we can stop cleanly
let activeMursyidAudio: HTMLAudioElement | null = null;
let activeAudioCtx: AudioContext | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;

export function stopMursyidVoice(): void {
  try {
    if (activeBufferSource) {
      try {
        activeBufferSource.onended = null;
        activeBufferSource.stop();
        activeBufferSource.disconnect();
      } catch {
        // Ignore if already stopped
      }
      activeBufferSource = null;
    }
    if (activeMursyidAudio) {
      activeMursyidAudio.pause();
      activeMursyidAudio.currentTime = 0;
      activeMursyidAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // Ignore audio stop errors
  }
}

/**
 * Time-Domain Synchronized Overlap-Add (SOLA) Male Baritone Pitch & Formant Shifter.
 * Lowers a female/neutral Bahasa Melayu speech buffer by ~4.6 semitones (pitchFactor = 0.765)
 * into a warm 115-130Hz Malay Male Ustaz/Principal register while preserving 100% natural speaking speed!
 */
function pitchShiftToMaleBaritone(
  ctx: AudioContext,
  inputBuffer: AudioBuffer,
  pitchFactor = 0.88,
  tempoFactor = 1.08
): AudioBuffer {
  const sampleRate = inputBuffer.sampleRate;
  const inputData = inputBuffer.getChannelData(0);
  const inputLen = inputData.length;

  // Step 1: Clean pitch & formant resampling
  const resampledLen = Math.floor(inputLen / pitchFactor);
  const resampled = new Float32Array(resampledLen);
  for (let i = 0; i < resampledLen; i++) {
    const srcIdx = i * pitchFactor;
    const idx0 = Math.floor(srcIdx);
    const idx1 = Math.min(idx0 + 1, inputLen - 1);
    const frac = srcIdx - idx0;
    resampled[i] = inputData[idx0] * (1 - frac) + inputData[idx1] * frac;
  }

  // Step 2: Time-compression with 24ms grain window for fluid, natural speed without phase cancellation artifacts
  const stretchRatio = pitchFactor * tempoFactor;
  const outputLen = Math.max(1, Math.floor(resampledLen * stretchRatio));
  const output = new Float32Array(outputLen);

  const grainSize = Math.floor(sampleRate * 0.024); // 24ms grain (crisp & clear)
  const halfGrain = Math.floor(grainSize / 2);
  const searchRange = Math.floor(sampleRate * 0.008); // 8ms phase search

  const fadeIn = new Float32Array(halfGrain);
  const fadeOut = new Float32Array(halfGrain);
  for (let i = 0; i < halfGrain; i++) {
    const w = 0.5 * (1 - Math.cos((Math.PI * i) / halfGrain));
    fadeIn[i] = w;
    fadeOut[i] = 1 - w;
  }

  const firstCopy = Math.min(grainSize, resampledLen, outputLen);
  for (let i = 0; i < firstCopy; i++) {
    output[i] = resampled[i];
  }

  let outWritePos = halfGrain;
  while (outWritePos + grainSize < outputLen) {
    const targetInPos = Math.floor(outWritePos / stretchRatio);
    if (targetInPos + grainSize + searchRange >= resampledLen) break;

    let bestOffset = 0;
    let bestCorr = -Infinity;
    for (let off = 0; off < searchRange; off += 2) {
      let corr = 0;
      const candStart = targetInPos + off;
      for (let k = 0; k < halfGrain; k += 4) {
        corr += output[outWritePos + k] * resampled[candStart + k];
      }
      if (corr > bestCorr) {
        bestCorr = corr;
        bestOffset = off;
      }
    }

    const chosenStart = targetInPos + bestOffset;
    for (let i = 0; i < halfGrain; i++) {
      output[outWritePos + i] =
        output[outWritePos + i] * fadeOut[i] + resampled[chosenStart + i] * fadeIn[i];
    }
    for (let i = halfGrain; i < grainSize; i++) {
      output[outWritePos + i] = resampled[chosenStart + i];
    }

    outWritePos += halfGrain;
  }

  const outBuffer = ctx.createBuffer(1, outputLen, sampleRate);
  outBuffer.copyToChannel(output, 0);
  return outBuffer;
}

/**
 * Plays base64 audio through Web Audio API with natural, clear voice tone
 * and fluid, conversational ChatGPT-style playback speed control.
 */
async function playBase64WithMaleVoiceDsp(
  base64Data: string,
  needsMaleDsp: boolean,
  emotion: MursyidEmotion,
  voiceOption: MaleVoiceOption = 'fenrir',
  callbacks?: { onStart?: () => void; onEnd?: () => void },
  speedMultiplier: number = getSavedSpeechSpeed()
): Promise<boolean> {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!activeAudioCtx || activeAudioCtx.state === 'closed') {
      activeAudioCtx = new AudioContextClass();
    }
    if (activeAudioCtx.state === 'suspended') {
      await activeAudioCtx.resume();
    }

    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const decodedBuffer = await activeAudioCtx.decodeAudioData(bytes.buffer.slice(0));

    const source = activeAudioCtx.createBufferSource();
    source.buffer = decodedBuffer;

    // Apply fluid conversational playback rate with user speed control multiplier (0.5x - 2.0x)
    const clampedMultiplier = Math.min(2.0, Math.max(0.5, speedMultiplier));
    source.playbackRate.value = clampedMultiplier;

    // Natural, warm, medium-low vocal EQ for a 35-45yo Malaysian male educator persona
    const vocalWarmth = activeAudioCtx.createBiquadFilter();
    vocalWarmth.type = 'peaking';
    vocalWarmth.frequency.value = 260; // Warm medium-low chest resonance
    vocalWarmth.Q.value = 1.1;
    vocalWarmth.gain.value = 1.8; // Gentle warmth & clarity

    source.connect(vocalWarmth);
    vocalWarmth.connect(activeAudioCtx.destination);

    activeBufferSource = source;
    source.onended = () => {
      if (activeBufferSource === source) {
        activeBufferSource = null;
      }
      callbacks?.onEnd?.();
    };

    callbacks?.onStart?.();
    source.start(0);
    return true;
  } catch {
    return false;
  }
}

export type MaleVoiceOption = 'fenrir' | 'charon' | 'puck' | 'local-deep';

export interface MaleVoiceInfo {
  id: MaleVoiceOption;
  name: string;
  subTitle: string;
  tag: string;
  description: string;
  previewPhrase: string;
}

export const MALE_VOICE_OPTIONS: MaleVoiceInfo[] = [
  {
    id: 'fenrir',
    name: 'Fenrir',
    subTitle: 'Pendidik Matang 35–45 Tahun (Default)',
    tag: 'Warm Medium-Low (Melayu MY)',
    description: 'Suara lelaki Melayu matang (35–45 tahun) yang mesra, bersahaja, tenang, pintar & meyakinkan.',
    previewPhrase: 'Assalamualaikum sahabat, saya Mursyid AI. Mari kita bincangkan hal pentadbiran sekolah secara santai dan jelas.',
  },
  {
    id: 'charon',
    name: 'Charon',
    subTitle: 'Ustaz Santai & Tenang',
    tag: 'Suara Santai Rabbani',
    description: 'Suara pembimbing penyayang, santai dan tenang dengan penyampaian bermaklumat.',
    previewPhrase: 'Salam ukhuwah sahabat pendidik, mari kita berbual secara santai dan tenang.',
  },
  {
    id: 'puck',
    name: 'Puck',
    subTitle: 'Pendidik Muda & Ceria',
    tag: 'Suara Muda Bersemangat',
    description: 'Suara pendidik muda yang dinamik, ceria, meyakinkan dan bersemangat.',
    previewPhrase: 'Alhamdulillah, semangat wahai sahabat pendidik untuk mendidik generasi Rabbani!',
  },
  {
    id: 'local-deep',
    name: 'Tempatan Normal',
    subTitle: 'Suara Tempatan Natural',
    tag: 'Suara Melayu Jelas',
    description: 'Suara Bahasa Melayu Malaysia tempatan yang jelas dan semula jadi.',
    previewPhrase: 'Ini ialah tataan suara Bahasa Melayu Malaysia tempatan yang jelas dan semula jadi.',
  },
];

export function getSavedMaleVoicePersona(): MaleVoiceOption {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('mursyid_male_voice_persona') as MaleVoiceOption;
    if (saved && MALE_VOICE_OPTIONS.some((v) => v.id === saved)) {
      return saved;
    }
  }
  return 'fenrir';
}

export function saveMaleVoicePersona(voice: MaleVoiceOption): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('mursyid_male_voice_persona', voice);
  }
}

export function getSavedSpeechSpeed(): number {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('mursyid_speech_speed');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2.0) {
        return parsed;
      }
    }
  }
  return 1.0;
}

export function saveSpeechSpeed(speed: number): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    const clamped = Math.min(2.0, Math.max(0.5, speed));
    window.localStorage.setItem('mursyid_speech_speed', clamped.toString());
  }
}

/**
 * Speaks text out loud as Mursyid AI in Bahasa Melayu with natural voice tone and speed control.
 * 1. Calls /api/mpgb-tts with chosen voiceOption ('fenrir', 'charon', 'puck', 'local-deep').
 * 2. Applies speed multiplier (0.5x to 2.0x).
 * 3. Falls back to Web Speech API at standard pitch (1.0).
 */
export async function speakMursyidVoice(
  rawText: string,
  emotion: MursyidEmotion = 'neutral',
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
  },
  requestedVoiceOption?: MaleVoiceOption,
  requestedSpeechSpeed?: number
): Promise<void> {
  stopMursyidVoice();

  const activeVoicePersona = requestedVoiceOption || getSavedMaleVoicePersona();
  const activeSpeedMultiplier =
    typeof requestedSpeechSpeed === 'number' ? requestedSpeechSpeed : getSavedSpeechSpeed();
  const clampedSpeed = Math.min(2.0, Math.max(0.5, activeSpeedMultiplier));

  // Clean markdown, emojis, URLs, and expand abbreviations for natural Malay speech cadence
  const cleanText = (rawText || '')
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
    .replace(/\b(assalamualaikum|salam ukhuwah|sahabat pendidik|ustaz|cikgu)\b/gi, '$1, ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 680);

  if (!cleanText) {
    callbacks?.onEnd?.();
    return;
  }

  const playWithWebSpeechFallback = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      callbacks?.onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ms-MY';

      const voices = window.speechSynthesis.getVoices();
      const femaleRegex = /yasmin|amira|gadis|damayanti|siti|female|perempuan|wanita|zira|samantha|victoria|helena|monika|salimah|nurul|fiona|karen|tessa|moira|veena/i;
      const maleMalayRegex = /\b(osman|rizwan|ardi|budi|indra|faizal|amir|adam|daniel|zainal|ahmad|ibrahim|lokman|faiz|hafiz|male|lelaki|pria)\b/i;

      // 1. Strictly look for a verified Native Male Malay/Indonesian voice
      const explicitMaleMalayVoice = voices.find(
        (v) =>
          (v.lang.toLowerCase().startsWith('ms') || v.lang.toLowerCase().startsWith('id')) &&
          maleMalayRegex.test(v.name) &&
          !femaleRegex.test(v.name)
      );

      // If no verified native male Malay voice exists on the client device:
      if (!explicitMaleMalayVoice) {
        console.warn(
          'Suara lelaki Bahasa Melayu tidak ditemui dalam sistem pelayar ini. Audio luar pelat dibatalkan untuk mengekalkan keaslian.'
        );
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('mursyid-voice-notice', {
              detail: {
                message:
                  'Suara penutur jati lelaki Bahasa Melayu tidak tersedia pada pelayar ini (kredit Gemini TTS perlu ditambah nilai). Teks jawapan lengkap sedia dibaca.',
              },
            })
          );
        }
        callbacks?.onEnd?.();
        return;
      }

      utterance.voice = explicitMaleMalayVoice;

      // Enforce natural mature male pitch (0.88) and user speed control rate (0.5x - 2.0x)
      utterance.pitch = 0.88;
      utterance.rate = clampedSpeed;

      utterance.onstart = () => callbacks?.onStart?.();
      utterance.onend = () => callbacks?.onEnd?.();
      utterance.onerror = () => callbacks?.onEnd?.();

      callbacks?.onStart?.();
      window.speechSynthesis.speak(utterance);
    } catch {
      callbacks?.onEnd?.();
    }
  };

  try {
    const resp = await fetch('/api/mpgb-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        emotion,
        voiceOption: activeVoicePersona,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data?.audioBase64) {
        const playedViaWebAudio = await playBase64WithMaleVoiceDsp(
          data.audioBase64,
          Boolean(data.needsMaleDsp),
          emotion,
          activeVoicePersona,
          callbacks,
          clampedSpeed
        );
        if (playedViaWebAudio) {
          return;
        }
      }
    }
  } catch {
    // Fallback to Web Speech API with deep male pitch
  }

  playWithWebSpeechFallback();
}

interface MursyidAnimatedCharacterProps {
  emotion?: MursyidEmotion;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'stage';
  speechText?: string;
  isSpeaking?: boolean;
  interactive?: boolean;
  showEmotionBar?: boolean;
  sentimentInfo?: SentimentAnalysisResult;
  onEmotionChange?: (emotion: MursyidEmotion) => void;
  className?: string;
}

const ORIGINAL_3D_MURSYID_SRC =
  '/assets/aistudio/Gemini_Generated_Image_nyb83tnyb83tnyb8_b2aa451c.jpeg';

export const MursyidAnimatedCharacter: React.FC<MursyidAnimatedCharacterProps> = ({
  emotion = 'neutral',
  size = 'md',
  speechText,
  isSpeaking = false,
  interactive = false,
  showEmotionBar = false,
  sentimentInfo,
  onEmotionChange,
  className = '',
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<MursyidEmotion>(emotion);
  const [blink, setBlink] = useState(false);
  const [talkingCycle, setTalkingCycle] = useState(0);
  const [localVoiceSpeaking, setLocalVoiceSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Listen for voice status/fallback notices
  useEffect(() => {
    const handleVoiceNotice = (e: any) => {
      const msg = e?.detail?.message;
      if (msg) {
        setVoiceNotice(msg);
        setTimeout(() => setVoiceNotice(null), 7000);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('mursyid-voice-notice', handleVoiceNotice);
      return () => window.removeEventListener('mursyid-voice-notice', handleVoiceNotice);
    }
  }, []);

  // Sync with prop
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  // Normalize idle -> neutral for display consistency
  const resolvedEmotion: MursyidEmotion =
    currentEmotion === 'idle' ? 'neutral' : currentEmotion;

  const activeSpeaking = isSpeaking || localVoiceSpeaking || resolvedEmotion === 'speaking';

  // Dynamic lip-sync cycle when speaking
  useEffect(() => {
    if (activeSpeaking) {
      const interval = setInterval(() => {
        setTalkingCycle((prev) => (prev + 1) % 4);
      }, 140);
      return () => clearInterval(interval);
    } else {
      setTalkingCycle(0);
    }
  }, [activeSpeaking]);

  // Natural spontaneous blinking (including occasional double-blink like a real human)
  useEffect(() => {
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => {
        setBlink(false);
        if (Math.random() < 0.3) {
          setTimeout(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
          }, 170);
        }
      }, 160);
    };

    const blinkInterval = setInterval(triggerBlink, 3200 + Math.random() * 1800);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleSelectEmotion = (newEmotion: MursyidEmotion, speakPhrase = false) => {
    setCurrentEmotion(newEmotion);
    onEmotionChange?.(newEmotion);
    if (speakPhrase) {
      const phrase = emotionDetails[newEmotion]?.voicePhrase || '';
      if (phrase) {
        speakMursyidVoice(phrase, newEmotion, {
          onStart: () => setLocalVoiceSpeaking(true),
          onEnd: () => setLocalVoiceSpeaking(false),
        });
      }
    }
  };

  // Dimensions based on size prop (preserving 1:1 aspect ratio of original 3D character)
  const sizeMap = {
    xs: { width: 40, height: 40, rounded: 'rounded-xl' },
    sm: { width: 52, height: 52, rounded: 'rounded-2xl' },
    md: { width: 112, height: 112, rounded: 'rounded-2xl' },
    lg: { width: 148, height: 148, rounded: 'rounded-3xl' },
    stage: { width: 200, height: 200, rounded: 'rounded-3xl' },
  };

  const currentSize = sizeMap[size];
  const isCompact = size === 'xs' || size === 'sm';

  // Emotional metadata, body language & voice phrases
  const emotionDetails: Record<
    MursyidEmotion,
    {
      label: string;
      badgeBg: string;
      borderGlow: string;
      icon: React.ReactNode;
      voicePhrase: string;
      bodyLanguage: string;
    }
  > = {
    idle: {
      label: 'Tenang & Neutral',
      badgeBg: 'bg-teal-950/90 border-teal-400/50 text-teal-200',
      borderGlow: 'border-teal-400/60 shadow-teal-500/20',
      icon: <Meh className="w-3.5 h-3.5 text-teal-300" />,
      voicePhrase: 'Assalamualaikum, ada apa-apa yang boleh Mursyid bantu hari ini?',
      bodyLanguage: 'Postur tenang profesional & pernafasan sekata',
    },
    neutral: {
      label: 'Neutral & Tenang',
      badgeBg: 'bg-teal-950/90 border-teal-400/50 text-teal-200',
      borderGlow: 'border-teal-400/60 shadow-teal-500/20',
      icon: <Meh className="w-3.5 h-3.5 text-teal-300" />,
      voicePhrase: 'Sedia mendengar dan memberi maklumat dengan tepat & tenang.',
      bodyLanguage: 'Postur tenang profesional, kepala stabil & mata fokus',
    },
    waving: {
      label: 'Melambai Salam',
      badgeBg: 'bg-amber-950/90 border-amber-400/60 text-amber-200',
      borderGlow: 'border-amber-400/80 shadow-amber-500/30',
      icon: <Hand className="w-3.5 h-3.5 text-amber-300" />,
      voicePhrase: 'Ahlan wa sahlan sahabat pendidik MPGBSIM! 👋',
      bodyLanguage: 'Tangan kanan melambai mesra & kepala mengangguk sapaan',
    },
    happy: {
      label: 'Gembira & Ceria',
      badgeBg: 'bg-emerald-950/90 border-emerald-400/60 text-emerald-200',
      borderGlow: 'border-emerald-400/80 shadow-emerald-500/30',
      icon: <Smile className="w-3.5 h-3.5 text-emerald-300" />,
      voicePhrase: 'Alhamdulillah, seronok dapat berbincang bersama Tuan/Puan! 😊',
      bodyLanguage: 'Gerakan badan ceria, mata melengkung & senyuman lebar',
    },
    serious: {
      label: 'Serius & Tegas',
      badgeBg: 'bg-slate-900/95 border-amber-500/80 text-amber-200',
      borderGlow: 'border-amber-500/90 shadow-amber-600/30',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
      voicePhrase: 'Perkara ini penting dan memerlukan ketegasan, tadbir urus serta integriti tinggi.',
      bodyLanguage: 'Postur tegak berwibawa, kening fokus & mimik muka serius',
    },
    thinking: {
      label: 'Sedang Berfikir',
      badgeBg: 'bg-indigo-950/90 border-indigo-400/60 text-indigo-200',
      borderGlow: 'border-indigo-400/80 shadow-indigo-500/30',
      icon: <Brain className="w-3.5 h-3.5 text-indigo-300" />,
      voicePhrase: 'Hmm, biar Mursyid teliti fakta & pandangan terbaik... 🤔',
      bodyLanguage: 'Kepala meneleng analitikal, sebelah kening terangkat',
    },
    empathetic: {
      label: 'Sedih / Prihatin',
      badgeBg: 'bg-rose-950/90 border-rose-400/60 text-rose-200',
      borderGlow: 'border-rose-400/80 shadow-rose-500/30',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-rose-300" />,
      voicePhrase: 'Saya amat memahami cabaran ustaz & cikgu, moga terus diberi kekuatan. 🤲',
      bodyLanguage: 'Kepala menunduk lembut, pandangan redup & penuh empati',
    },
    speaking: {
      label: 'Sedang Berbicara',
      badgeBg: 'bg-cyan-950/90 border-cyan-400/60 text-cyan-200',
      borderGlow: 'border-cyan-400/80 shadow-cyan-500/30',
      icon: <MessageSquareHeart className="w-3.5 h-3.5 text-cyan-300" />,
      voicePhrase: 'Mari kita bincangkan perkara ini secara santai dan mendalam...',
      bodyLanguage: 'Gerakan mulut lip-sync aktif, anggukan kepala & gerak tangan',
    },
    inspiring: {
      label: 'Semangat Rabbani',
      badgeBg: 'bg-amber-900/95 border-amber-300/80 text-amber-100',
      borderGlow: 'border-amber-300 shadow-amber-400/40',
      icon: <Zap className="w-3.5 h-3.5 text-amber-300" />,
      voicePhrase: 'Ayuh kita perkukuh Kepimpinan Rabbani & generasi Soleh wa Musleh! ✨',
      bodyLanguage: 'Postur bersemangat, aura emas & pandangan berwawasan',
    },
  };

  const activeEmotionInfo = emotionDetails[resolvedEmotion] || emotionDetails.neutral;

  // Determine 3D Body Posture class based on sentiment
  const getBodyPostureClass = () => {
    switch (resolvedEmotion) {
      case 'serious':
        return 'mursyid-body-serious';
      case 'happy':
      case 'inspiring':
        return 'mursyid-body-energetic';
      case 'empathetic':
        return 'mursyid-body-empathetic';
      default:
        return 'mursyid-body-breathe';
    }
  };

  // Determine 3D Head animation class based on emotion
  const getHeadAnimationClass = () => {
    if (activeSpeaking) return 'mursyid-head-speaking';
    switch (resolvedEmotion) {
      case 'waving':
        return 'mursyid-head-waving';
      case 'happy':
        return 'mursyid-head-happy';
      case 'serious':
        return 'mursyid-head-serious';
      case 'thinking':
        return 'mursyid-head-thinking';
      case 'empathetic':
        return 'mursyid-head-empathetic';
      case 'inspiring':
        return 'mursyid-head-inspiring';
      default:
        return 'mursyid-head-idle';
    }
  };

  // Determine 3D Hand gesture animation class based on emotion
  const getHandAnimationClass = () => {
    if (resolvedEmotion === 'waving') return 'mursyid-hand-wave-active';
    if (resolvedEmotion === 'happy' || resolvedEmotion === 'inspiring')
      return 'mursyid-hand-wave-joy';
    if (resolvedEmotion === 'serious') return 'mursyid-hand-serious';
    if (resolvedEmotion === 'empathetic') return 'mursyid-hand-empathetic';
    if (activeSpeaking) return 'mursyid-hand-gesture-talk';
    return 'mursyid-hand-idle';
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Voice Status / Fallback Notice Banner */}
      {!isCompact && voiceNotice && (
        <div className="relative mb-1.5 px-3 py-1.5 w-full max-w-[320px] rounded-xl bg-amber-950/95 border border-amber-400/80 shadow-md text-[9.5px] font-medium text-amber-200 animate-in fade-in duration-200 flex items-start gap-1.5">
          <span className="shrink-0 text-amber-300">⚠️</span>
          <span className="leading-tight">{voiceNotice}</span>
        </div>
      )}

      {/* Dynamic Speech Bubble & Voice Trigger above the 3D Stage */}
      {!isCompact && (speechText || activeEmotionInfo.voicePhrase) && (
        <div className="relative mb-1.5 px-3 py-1.5 w-full max-w-[320px] rounded-xl bg-slate-900/95 border border-teal-400/40 shadow-md text-[10px] font-medium text-teal-50 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2">
            <p className="leading-snug flex items-center gap-1.5 text-left line-clamp-2">
              {activeSpeaking && (
                <Volume2 className="w-3 h-3 text-amber-400 animate-bounce shrink-0" />
              )}
              <span>{speechText || activeEmotionInfo.voicePhrase}</span>
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (localVoiceSpeaking) {
                  stopMursyidVoice();
                  setLocalVoiceSpeaking(false);
                } else {
                  const textToSpeak = speechText || activeEmotionInfo.voicePhrase;
                  speakMursyidVoice(textToSpeak, resolvedEmotion, {
                    onStart: () => setLocalVoiceSpeaking(true),
                    onEnd: () => setLocalVoiceSpeaking(false),
                  });
                }
              }}
              className={`px-2 py-1 rounded-lg font-extrabold flex items-center gap-1 shrink-0 transition cursor-pointer ${
                localVoiceSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
              title="Dengar suara Mursyid AI bercakap secara langsung"
            >
              {localVoiceSpeaking ? (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span>Henti</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Suara</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main 3D Character Rig Viewport */}
      <div
        className={`relative overflow-hidden ${currentSize.rounded} border-2 ${activeEmotionInfo.borderGlow} shadow-xl bg-slate-950 shrink-0 transition-all duration-300 ${
          interactive ? 'cursor-pointer group' : ''
        }`}
        style={{
          width: currentSize.width,
          height: currentSize.height,
          perspective: '700px',
        }}
        onClick={() => {
          if (interactive) {
            const list: MursyidEmotion[] = [
              'neutral',
              'happy',
              'serious',
              'empathetic',
              'thinking',
              'waving',
              'inspiring',
            ];
            const nextIdx = (list.indexOf(resolvedEmotion) + 1) % list.length;
            handleSelectEmotion(list[nextIdx]);
          }
        }}
        title={
          interactive
            ? 'Klik pada watak 3D Mursyid AI untuk menukar aksi, sentimen & mimik muka'
            : 'Mursyid AI 3D MPGBSIM'
        }
      >
        {/* =====================================================================
            LAYER 1: BASE 3D CHARACTER & BODY LANGUAGE POSTURE
            Uses the exact original 3D Mursyid AI image with state-based posture
        ===================================================================== */}
        <div className={`w-full h-full relative transition-transform duration-500 ${getBodyPostureClass()}`}>
          <img
            src={ORIGINAL_3D_MURSYID_SRC}
            alt="Mursyid AI 3D"
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* Holographic AI Circuit Shimmer Overlay on Baju Melayu & Background */}
          <div
            className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
              resolvedEmotion === 'inspiring'
                ? 'bg-gradient-to-tr from-amber-500/25 via-transparent to-cyan-400/25 opacity-100 animate-pulse'
                : resolvedEmotion === 'happy'
                ? 'bg-gradient-to-t from-emerald-500/20 via-transparent to-cyan-400/15 opacity-95'
                : resolvedEmotion === 'serious'
                ? 'bg-gradient-to-b from-slate-950/35 via-amber-900/10 to-slate-950/40 opacity-95'
                : resolvedEmotion === 'empathetic'
                ? 'bg-gradient-to-t from-rose-500/20 via-transparent to-transparent opacity-85'
                : resolvedEmotion === 'thinking'
                ? 'bg-gradient-to-b from-indigo-500/25 via-transparent to-transparent opacity-90'
                : 'opacity-35'
            }`}
          />

          {/* =====================================================================
              LAYER 2: DETACHED 3D HEAD & FACIAL RIG (Feathered Seamless Mask)
              Tilts, nods, turns in 3D space, and carries synchronized eye/mouth rig
          ===================================================================== */}
          <div
            className={`absolute inset-0 pointer-events-none ${getHeadAnimationClass()}`}
            style={{
              transformOrigin: '48.5% 52%',
              WebkitMaskImage:
                'radial-gradient(ellipse 23% 29% at 48.5% 28.5%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
              maskImage:
                'radial-gradient(ellipse 23% 29% at 48.5% 28.5%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
            }}
          >
            {/* Identical 3D Image for the Head Layer */}
            <img
              src={ORIGINAL_3D_MURSYID_SRC}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* --- 3D EYEBROW EXPRESSION OVERLAYS --- */}
            {/* Left Eyebrow (viewer's left: x: 37.5%-46%, y: 23.2%) */}
            <div
              className="absolute transition-all duration-300"
              style={{
                left: '37.5%',
                top: '23.2%',
                width: '8.5%',
                height: '2.5%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, rgba(35,23,18,0.9), rgba(45,30,24,0.95))',
                transform:
                  resolvedEmotion === 'serious'
                    ? 'translateY(32%) rotate(10deg) scaleX(1.06)'
                    : resolvedEmotion === 'thinking'
                    ? 'translateY(18%) rotate(6deg)'
                    : resolvedEmotion === 'empathetic'
                    ? 'translateY(-12%) rotate(-13deg)'
                    : resolvedEmotion === 'happy' ||
                      resolvedEmotion === 'waving' ||
                      resolvedEmotion === 'inspiring'
                    ? 'translateY(-28%) rotate(-3deg)'
                    : 'scaleY(0)',
                opacity: resolvedEmotion === 'neutral' ? 0 : 0.9,
              }}
            />
            {/* Right Eyebrow (viewer's right: x: 50.0%-58.5%, y: 22.6%) */}
            <div
              className="absolute transition-all duration-300"
              style={{
                left: '50.0%',
                top: '22.6%',
                width: '8.5%',
                height: '2.5%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, rgba(45,30,24,0.95), rgba(35,23,18,0.9))',
                transform:
                  resolvedEmotion === 'serious'
                    ? 'translateY(32%) rotate(-10deg) scaleX(1.06)'
                    : resolvedEmotion === 'thinking'
                    ? 'translateY(-38%) rotate(-9deg)'
                    : resolvedEmotion === 'empathetic'
                    ? 'translateY(-12%) rotate(13deg)'
                    : resolvedEmotion === 'happy' ||
                      resolvedEmotion === 'waving' ||
                      resolvedEmotion === 'inspiring'
                    ? 'translateY(-28%) rotate(3deg)'
                    : 'scaleY(0)',
                opacity: resolvedEmotion === 'neutral' ? 0 : 0.9,
              }}
            />

            {/* Furrowed Brow Crease between eyebrows when SERIOUS */}
            {resolvedEmotion === 'serious' && (
              <div
                className="absolute transition-opacity duration-300"
                style={{
                  left: '47.4%',
                  top: '23.4%',
                  width: '1.8%',
                  height: '3.2%',
                  borderRadius: '999px',
                  background: 'rgba(120, 65, 45, 0.55)',
                }}
              />
            )}

            {/* --- 3D EYELIDS (NATURAL BLINKING & EMOTIONAL EYE EXPRESSIONS) --- */}
            {/* Viewer's Left Eye (x: 42.1%, y: 30.3%) */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
              style={{
                left: '42.1%',
                top: '30.3%',
                width: '6.8%',
                height: '4.6%',
              }}
            >
              {/* Upper 3D Eyelid */}
              <div
                className="w-full h-full transition-transform duration-150 origin-top"
                style={{
                  background:
                    'linear-gradient(180deg, #b57453 0%, #d4926f 70%, #3d2319 100%)',
                  transform: blink
                    ? 'scaleY(1)'
                    : resolvedEmotion === 'serious'
                    ? 'scaleY(0.32) rotate(5deg)'
                    : resolvedEmotion === 'empathetic'
                    ? 'scaleY(0.38) rotate(-8deg)'
                    : resolvedEmotion === 'thinking'
                    ? 'scaleY(0.22)'
                    : 'scaleY(0)',
                }}
              />
              {/* Lower Eyelid Curve (Happy squint or Serious focus) */}
              <div
                className="absolute bottom-0 inset-x-0 h-1/2 transition-transform duration-200 origin-bottom rounded-t-full"
                style={{
                  background: 'linear-gradient(0deg, #d89672 0%, #c07d5b 85%, #5c3424 100%)',
                  transform:
                    !blink && (resolvedEmotion === 'happy' || resolvedEmotion === 'waving')
                      ? 'scaleY(0.65)'
                      : !blink && resolvedEmotion === 'serious'
                      ? 'scaleY(0.28)'
                      : 'scaleY(0)',
                }}
              />
            </div>

            {/* Viewer's Right Eye (x: 54.4%, y: 29.8%) */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
              style={{
                left: '54.4%',
                top: '29.8%',
                width: '6.8%',
                height: '4.6%',
              }}
            >
              {/* Upper 3D Eyelid */}
              <div
                className="w-full h-full transition-transform duration-150 origin-top"
                style={{
                  background:
                    'linear-gradient(180deg, #b57453 0%, #d4926f 70%, #3d2319 100%)',
                  transform: blink
                    ? 'scaleY(1)'
                    : resolvedEmotion === 'serious'
                    ? 'scaleY(0.32) rotate(-5deg)'
                    : resolvedEmotion === 'empathetic'
                    ? 'scaleY(0.38) rotate(8deg)'
                    : resolvedEmotion === 'thinking'
                    ? 'scaleY(0.15)'
                    : 'scaleY(0)',
                }}
              />
              {/* Lower Eyelid Curve (Happy squint or Serious focus) */}
              <div
                className="absolute bottom-0 inset-x-0 h-1/2 transition-transform duration-200 origin-bottom rounded-t-full"
                style={{
                  background: 'linear-gradient(0deg, #d89672 0%, #c07d5b 85%, #5c3424 100%)',
                  transform:
                    !blink && (resolvedEmotion === 'happy' || resolvedEmotion === 'waving')
                      ? 'scaleY(0.65)'
                      : !blink && resolvedEmotion === 'serious'
                      ? 'scaleY(0.28)'
                      : 'scaleY(0)',
                }}
              />
            </div>

            {/* --- 3D CHEEK GLOW / BLUSH --- */}
            {(resolvedEmotion === 'happy' ||
              resolvedEmotion === 'waving' ||
              resolvedEmotion === 'inspiring' ||
              resolvedEmotion === 'empathetic') && (
              <>
                <div
                  className="absolute rounded-full blur-[4px] transition-opacity duration-300"
                  style={{
                    left: '36.5%',
                    top: '35.8%',
                    width: '6%',
                    height: '3.8%',
                    background:
                      resolvedEmotion === 'empathetic'
                        ? 'rgba(244, 63, 94, 0.28)'
                        : 'rgba(251, 113, 133, 0.42)',
                  }}
                />
                <div
                  className="absolute rounded-full blur-[4px] transition-opacity duration-300"
                  style={{
                    left: '55.5%',
                    top: '35.2%',
                    width: '6%',
                    height: '3.8%',
                    background:
                      resolvedEmotion === 'empathetic'
                        ? 'rgba(244, 63, 94, 0.28)'
                        : 'rgba(251, 113, 133, 0.42)',
                  }}
                />
              </>
            )}

            {/* --- 3D MOUTH LIP-SYNC & EMOTION EXPRESSION OVERLAY (x: 48.6%, y: 42.7%) --- */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-150"
              style={{
                left: '48.6%',
                top: '42.7%',
                width: '12.8%',
                height: '5.0%',
              }}
            >
              {activeSpeaking ? (
                // Realistic 3D Lip-Sync syllables over the character's mouth
                <div
                  className="transition-all duration-100 flex flex-col items-center justify-between overflow-hidden shadow-inner"
                  style={{
                    width:
                      talkingCycle === 0
                        ? '78%'
                        : talkingCycle === 1
                        ? '56%'
                        : talkingCycle === 2
                        ? '88%'
                        : '68%',
                    height:
                      talkingCycle === 0
                        ? '55%'
                        : talkingCycle === 1
                        ? '85%'
                        : talkingCycle === 2
                        ? '95%'
                        : '38%',
                    borderRadius:
                      talkingCycle === 1 ? '50%' : '30% 30% 60% 60%',
                    background:
                      'linear-gradient(180deg, #581c1c 0%, #7f1d1d 60%, #991b1b 100%)',
                    border: '1.5px solid #b46958',
                    boxShadow: '0 1px 4px rgba(180, 105, 88, 0.6)',
                  }}
                >
                  <div className="w-4/5 h-[28%] bg-white/95 rounded-b-sm" />
                  <div className="w-3/5 h-[35%] bg-rose-400/80 rounded-t-full" />
                </div>
              ) : resolvedEmotion === 'serious' ? (
                // Firm, composed straight/slightly downturned mouth for SERIOUS state
                <div
                  className="w-full h-full flex items-center justify-center rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, #d89874 62%, rgba(216,152,116,0) 100%)',
                  }}
                >
                  <div
                    className="w-[76%] h-[22%] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #6e3528, #4f2218, #6e3528)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                    }}
                  />
                </div>
              ) : resolvedEmotion === 'neutral' ? (
                // Calm, composed mild smile (softer than the wide joyful grin)
                <div
                  className="w-full h-full flex items-center justify-center rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(217,155,120,0.45) 40%, rgba(217,155,120,0) 100%)',
                  }}
                />
              ) : resolvedEmotion === 'thinking' ? (
                // Pensive "Hmm" closed/small mouth mask
                <div
                  className="w-full h-full flex items-center justify-center rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, #d99b78 58%, rgba(217,155,120,0) 100%)',
                  }}
                >
                  <div
                    className="w-3/5 h-[26%] rounded-full"
                    style={{
                      background: '#8c4a3b',
                      transform: 'rotate(-5deg) translateX(6%)',
                    }}
                  />
                </div>
              ) : resolvedEmotion === 'empathetic' ? (
                // Soft compassionate closed smile
                <div
                  className="w-full h-full flex items-center justify-center rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, #d99b78 56%, rgba(217,155,120,0) 100%)',
                  }}
                >
                  <div className="w-3/4 h-[28%] rounded-b-full border-b-2 border-[#8c4a3b]" />
                </div>
              ) : null}
            </div>
          </div>

          {/* =====================================================================
              LAYER 3: DETACHED 3D WAVING HAND LAYER (Viewer's Bottom-Left)
              Uses the exact 3D raised hand from the original artwork and pivots at wrist
          ===================================================================== */}
          <div
            className={`absolute inset-0 pointer-events-none ${getHandAnimationClass()}`}
            style={{
              transformOrigin: '16.5% 93%',
              WebkitMaskImage:
                'radial-gradient(ellipse 15% 22% at 13.5% 80%, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 100%)',
              maskImage:
                'radial-gradient(ellipse 15% 22% at 13.5% 80%, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 100%)',
            }}
          >
            <img
              src={ORIGINAL_3D_MURSYID_SRC}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* =====================================================================
              LAYER 4: 3D HOLOGRAPHIC SENTIMENT & EMOTION BADGES
          ===================================================================== */}
          {!isCompact && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {resolvedEmotion === 'waving' && (
                <div className="absolute left-2 bottom-7 px-2 py-0.5 rounded-full bg-amber-400/90 text-slate-950 font-extrabold text-[10px] shadow-md animate-bounce">
                  👋 Salam!
                </div>
              )}

              {resolvedEmotion === 'serious' && (
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-xl bg-slate-950/90 border border-amber-500/80 text-amber-300 font-bold text-[10px] shadow-md flex items-center gap-1">
                  <span>⚖️</span>
                  <span>Fokus & Tegas</span>
                </div>
              )}

              {resolvedEmotion === 'neutral' && (
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-xl bg-teal-950/85 border border-teal-400/50 text-teal-200 font-bold text-[10px] shadow-md flex items-center gap-1">
                  <span>😌</span>
                  <span>Tenang</span>
                </div>
              )}

              {resolvedEmotion === 'thinking' && (
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-xl bg-indigo-950/90 border border-indigo-400/60 text-indigo-200 font-bold text-[10px] shadow-md animate-pulse flex items-center gap-1">
                  <span>🤔</span>
                  <span>Meneliti...</span>
                </div>
              )}

              {resolvedEmotion === 'empathetic' && (
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-xl bg-rose-950/90 border border-rose-400/60 text-rose-200 font-bold text-[10px] shadow-md animate-pulse flex items-center gap-1">
                  <span>🤲</span>
                  <span>Prihatin</span>
                </div>
              )}

              {resolvedEmotion === 'inspiring' && (
                <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-xl bg-amber-500/90 text-slate-950 font-extrabold text-[10px] shadow-md animate-bounce flex items-center gap-1">
                  <span>✨</span>
                  <span>Rabbani!</span>
                </div>
              )}

              {resolvedEmotion === 'happy' && (
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-xl bg-emerald-500/90 text-slate-950 font-extrabold text-[10px] shadow-md animate-bounce flex items-center gap-1">
                  <span>😊</span>
                  <span>Gembira</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom-right live status pill on medium/large stage */}
        {!isCompact && (
          <span
            className={`absolute bottom-1.5 right-1.5 z-20 px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-md flex items-center gap-1 backdrop-blur-xs ${activeEmotionInfo.badgeBg}`}
          >
            {activeEmotionInfo.icon}
            <span>{activeEmotionInfo.label}</span>
          </span>
        )}
      </div>

      {/* Interactive Emotion & Sentiment Selector Bar (Also speaks the phrase out loud!) */}
      {(showEmotionBar || interactive) && !isCompact && (
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-teal-700/50 text-[10px] shadow-md max-w-[330px]">
          <button
            type="button"
            onClick={() => handleSelectEmotion('neutral', true)}
            className={`px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'neutral'
                ? 'bg-teal-400 text-slate-950 shadow-xs'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Sentimen Neutral: Mursyid 3D tenang & bercakap"
          >
            <span>😌</span>
            <span>Neutral</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectEmotion('happy', true)}
            className={`px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'happy'
                ? 'bg-emerald-400 text-slate-950 shadow-xs'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Sentimen Gembira: Mursyid 3D tersenyum ceria & bercakap"
          >
            <span>😊</span>
            <span>Gembira</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectEmotion('serious', true)}
            className={`px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'serious'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Sentimen Serius: Mursyid 3D tegas & bercakap"
          >
            <span>⚖️</span>
            <span>Serius</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectEmotion('empathetic', true)}
            className={`px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'empathetic'
                ? 'bg-rose-400 text-slate-950 shadow-xs'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Sentimen Sedih/Prihatin: Mursyid 3D menyantuni emosi pendidik"
          >
            <span>🤲</span>
            <span>Prihatin</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectEmotion('thinking', true)}
            className={`px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'thinking'
                ? 'bg-indigo-400 text-slate-950 shadow-xs'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Sentimen Analitikal: Mursyid 3D memikirkan jawapan"
          >
            <span>🤔</span>
            <span>Fikir</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectEmotion('waving', true)}
            className={`px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'waving'
                ? 'bg-amber-300 text-slate-950 shadow-xs'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Mursyid 3D melambai tangan menyapa salam"
          >
            <span>👋</span>
            <span>Salam</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectEmotion('inspiring', true)}
            className={`px-1.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'inspiring'
                ? 'bg-yellow-300 text-slate-950 shadow-xs'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Mursyid 3D bersemangat Kepimpinan Rabbani"
          >
            <span>✨</span>
            <span>Rabbani</span>
          </button>
        </div>
      )}

      {/* Embedded Male Voice Persona Selector Bar */}
      {(showEmotionBar || interactive) && !isCompact && (
        <MursyidMaleVoiceSelector className="mt-1.5 w-full max-w-[330px]" />
      )}

      {/* Keyframe animations for the State-Based 2.5D/3D Character Rig */}
      <style>{`
        /* Body Posture States */
        @keyframes mursyidBreathe {
          0%, 100% {
            transform: scale(1) translateY(0%);
          }
          50% {
            transform: scale(1.016) translateY(-0.7%);
          }
        }
        .mursyid-body-breathe {
          animation: mursyidBreathe 3.8s ease-in-out infinite;
        }

        @keyframes mursyidBodySerious {
          0%, 100% {
            transform: scale(1.025) translateY(-0.6%);
          }
          50% {
            transform: scale(1.03) translateY(-1%);
          }
        }
        .mursyid-body-serious {
          animation: mursyidBodySerious 4.5s ease-in-out infinite;
        }

        @keyframes mursyidBodyEnergetic {
          0%, 100% {
            transform: scale(1.01) translateY(0%);
          }
          50% {
            transform: scale(1.028) translateY(-1.2%);
          }
        }
        .mursyid-body-energetic {
          animation: mursyidBodyEnergetic 2.2s ease-in-out infinite;
        }

        @keyframes mursyidBodyEmpathetic {
          0%, 100% {
            transform: scale(0.995) translateY(0.5%);
          }
          50% {
            transform: scale(1.005) translateY(1.2%);
          }
        }
        .mursyid-body-empathetic {
          animation: mursyidBodyEmpathetic 4.2s ease-in-out infinite;
        }

        /* 3D Head Movements per Emotion */
        @keyframes headIdle {
          0%, 100% {
            transform: rotateZ(0deg) translateY(0%);
          }
          50% {
            transform: rotateZ(1deg) translateY(-0.6%);
          }
        }
        .mursyid-head-idle {
          animation: headIdle 4s ease-in-out infinite;
        }

        @keyframes headSerious {
          0%, 100% {
            transform: rotateZ(0deg) translateY(0.4%) scale(1.01);
          }
          50% {
            transform: rotateZ(-0.8deg) translateY(1.2%) scale(1.015);
          }
        }
        .mursyid-head-serious {
          animation: headSerious 2.8s ease-in-out infinite;
        }

        @keyframes headWaving {
          0%, 100% {
            transform: rotateZ(-2.5deg) translateY(-1%);
          }
          50% {
            transform: rotateZ(2.8deg) translateY(0.5%);
          }
        }
        .mursyid-head-waving {
          animation: headWaving 1.4s ease-in-out infinite;
        }

        @keyframes headHappy {
          0%, 100% {
            transform: translateY(0%) scale(1);
          }
          50% {
            transform: translateY(-2.2%) scale(1.02) rotateZ(1.8deg);
          }
        }
        .mursyid-head-happy {
          animation: headHappy 1.1s ease-in-out infinite;
        }

        @keyframes headThinking {
          0%, 100% {
            transform: rotateZ(-4.5deg) translateY(-1%) translateX(-1%);
          }
          50% {
            transform: rotateZ(-2.5deg) translateY(-2%) translateX(-0.5%);
          }
        }
        .mursyid-head-thinking {
          animation: headThinking 2.4s ease-in-out infinite;
        }

        @keyframes headEmpathetic {
          0%, 100% {
            transform: rotateZ(3.2deg) translateY(1.2%);
          }
          50% {
            transform: rotateZ(4.5deg) translateY(2%);
          }
        }
        .mursyid-head-empathetic {
          animation: headEmpathetic 2.8s ease-in-out infinite;
        }

        @keyframes headInspiring {
          0%, 100% {
            transform: translateY(-1.5%) scale(1.02);
          }
          50% {
            transform: translateY(0.5%) scale(1);
          }
        }
        .mursyid-head-inspiring {
          animation: headInspiring 1.5s ease-in-out infinite;
        }

        @keyframes headSpeaking {
          0%, 100% {
            transform: rotateZ(-1.2deg) translateY(0%);
          }
          33% {
            transform: rotateZ(1.5deg) translateY(-1.2%);
          }
          66% {
            transform: rotateZ(-0.8deg) translateY(0.6%);
          }
        }
        .mursyid-head-speaking {
          animation: headSpeaking 0.9s ease-in-out infinite;
        }

        /* 3D Raised Hand Animations (pivoting at wrist 16.5% 93%) */
        @keyframes handWaveActive {
          0%, 100% {
            transform: rotate(-11deg) translateY(-1.5%);
          }
          50% {
            transform: rotate(9deg) translateY(0.5%);
          }
        }
        .mursyid-hand-wave-active {
          animation: handWaveActive 0.65s ease-in-out infinite;
        }

        @keyframes handWaveJoy {
          0%, 100% {
            transform: rotate(-7deg) translateY(-1%);
          }
          50% {
            transform: rotate(6deg) translateY(0%);
          }
        }
        .mursyid-hand-wave-joy {
          animation: handWaveJoy 0.95s ease-in-out infinite;
        }

        @keyframes handSerious {
          0%, 100% {
            transform: rotate(2deg) translateY(1%);
          }
          50% {
            transform: rotate(0deg) translateY(0%);
          }
        }
        .mursyid-hand-serious {
          animation: handSerious 3.5s ease-in-out infinite;
        }

        @keyframes handEmpathetic {
          0%, 100% {
            transform: rotate(4deg) translateY(2%);
          }
          50% {
            transform: rotate(1.5deg) translateY(1%);
          }
        }
        .mursyid-hand-empathetic {
          animation: handEmpathetic 3.8s ease-in-out infinite;
        }

        @keyframes handGestureTalk {
          0%, 100% {
            transform: rotate(-4deg) translateY(-1%);
          }
          50% {
            transform: rotate(5deg) translateY(0.8%);
          }
        }
        .mursyid-hand-gesture-talk {
          animation: handGestureTalk 0.8s ease-in-out infinite;
        }

        @keyframes handIdle {
          0%, 100% {
            transform: rotate(-1.5deg);
          }
          50% {
            transform: rotate(2deg) translateY(-0.6%);
          }
        }
        .mursyid-hand-idle {
          animation: handIdle 3.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export interface MursyidMaleVoiceSelectorProps {
  className?: string;
  onVoiceSelected?: (voice: MaleVoiceOption) => void;
  onSpeedSelected?: (speed: number) => void;
}

export const MursyidMaleVoiceSelector: React.FC<MursyidMaleVoiceSelectorProps> = ({
  className = '',
  onVoiceSelected,
  onSpeedSelected,
}) => {
  const [activeVoice, setActiveVoice] = useState<MaleVoiceOption>(() =>
    getSavedMaleVoicePersona()
  );
  const [speechSpeed, setSpeechSpeed] = useState<number>(() => getSavedSpeechSpeed());
  const [testingVoiceId, setTestingVoiceId] = useState<MaleVoiceOption | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const currentInfo =
    MALE_VOICE_OPTIONS.find((v) => v.id === activeVoice) || MALE_VOICE_OPTIONS[0];

  const handleSelectVoice = (voiceId: MaleVoiceOption, previewImmediately = false) => {
    setActiveVoice(voiceId);
    saveMaleVoicePersona(voiceId);
    onVoiceSelected?.(voiceId);

    if (previewImmediately) {
      handleTestVoice(voiceId);
    }
  };

  const handleSelectSpeed = (newSpeed: number, previewImmediately = false) => {
    const clamped = Math.min(2.0, Math.max(0.5, newSpeed));
    setSpeechSpeed(clamped);
    saveSpeechSpeed(clamped);
    onSpeedSelected?.(clamped);

    if (previewImmediately) {
      handleTestVoice(activeVoice, clamped);
    }
  };

  const handleTestVoice = (voiceId: MaleVoiceOption, speedOverride?: number) => {
    stopMursyidVoice();
    const info = MALE_VOICE_OPTIONS.find((v) => v.id === voiceId) || currentInfo;
    setTestingVoiceId(voiceId);

    speakMursyidVoice(
      info.previewPhrase,
      voiceId === 'puck' ? 'happy' : voiceId === 'charon' ? 'empathetic' : 'neutral',
      {
        onStart: () => setTestingVoiceId(voiceId),
        onEnd: () => setTestingVoiceId(null),
      },
      voiceId,
      speedOverride || speechSpeed
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Compact Selector Bar */}
      <div className="bg-slate-900/95 border border-amber-500/50 p-1.5 rounded-xl shadow-md text-[11px] text-slate-200 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <Volume2 className="w-3 h-3" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-bold text-amber-300 leading-tight truncate flex items-center gap-1">
              <span>Suara:</span>
              <span className="text-white">{currentInfo.name}</span>
              <span className="ml-1 px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded text-[9px] font-extrabold border border-amber-400/30">
                ⚡ {speechSpeed.toFixed(2).replace(/\.00$/, '.0')}x
              </span>
            </p>
            <p className="text-[9px] text-slate-400 truncate leading-none">
              {currentInfo.subTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleTestVoice(activeVoice)}
            className={`px-2 py-0.5 rounded-lg font-extrabold text-[10px] flex items-center gap-1 transition cursor-pointer ${
              testingVoiceId === activeVoice
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-2xs'
            }`}
            title="Uji dengar contoh suara lelaki pilihan semasa"
          >
            {testingVoiceId === activeVoice ? (
              <>
                <VolumeX className="w-3 h-3" />
                <span>Bercakap...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" />
                <span>Uji Suara</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowModal((prev) => !prev)}
            className="px-2 py-0.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-amber-200 font-bold text-[10px] transition cursor-pointer border border-teal-600/50"
            title="Tukar suara & kelajuan pertuturan Mursyid AI"
          >
            Tetapan ⚙️
          </button>
        </div>
      </div>

      {/* Popover / Dropdown Modal for Selecting Male Voice Personas & Speed */}
      {showModal && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-950 border border-teal-500/60 rounded-2xl p-2.5 shadow-2xl animate-in fade-in duration-150 text-left">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
            <h4 className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1">
              <span>⚙️</span>
              <span>Tetapan Suara & Kelajuan Mursyid AI</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                stopMursyidVoice();
                setTestingVoiceId(null);
                setShowModal(false);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Speed Control Section (0.5x to 2.0x) */}
          <div className="mb-2.5 p-2 rounded-xl bg-slate-900/90 border border-teal-500/40 text-slate-200">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10px] font-extrabold text-amber-300 flex items-center gap-1">
                <span>⚡</span>
                <span>Kelajuan Pertuturan (Speed Control)</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                {speechSpeed.toFixed(2).replace(/\.00$/, '.0')}x
              </span>
            </div>

            {/* Quick Speed Preset Chips (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {SPEED_PRESETS.map((s) => {
                const isCurrent = Math.abs(speechSpeed - s) < 0.01;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelectSpeed(s, true)}
                    className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold transition cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                    title={`Tetapkan kelajuan pertuturan Mursyid AI ke ${s}x`}
                  >
                    {s === 1.0 ? '1.0x (Normal)' : `${s}x`}
                  </button>
                );
              })}
            </div>

            {/* Smooth Range Slider */}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-bold">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={speechSpeed}
                onChange={(e) => handleSelectSpeed(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
                title="Slaid untuk melaraskan kelajuan pertuturan Mursyid AI"
              />
              <span className="text-[9px] text-slate-400 font-bold">2.0x</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-300 mb-1.5 leading-relaxed">
            Pilihan Persona **Suara Lelaki Melayu** (macho, santai, ceria, atau baritone tempatan):
          </p>

          <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5">
            {MALE_VOICE_OPTIONS.map((v) => {
              const isSelected = v.id === activeVoice;
              const isTesting = testingVoiceId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVoice(v.id, false)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-teal-950/90 border-amber-400 shadow-xs'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-amber-400 font-bold text-[11px]">
                        {isSelected ? '✓' : '•'}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-white truncate block">
                          {v.name}
                        </span>
                        <span className="text-[9px] text-amber-300 font-medium truncate block">
                          {v.subTitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {v.tag}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVoice(v.id, false);
                          handleTestVoice(v.id);
                        }}
                        className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] flex items-center gap-1 transition cursor-pointer ${
                          isTesting
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        }`}
                        title="Uji dengar contoh suara lelaki ini"
                      >
                        {isTesting ? 'Bercakap...' : 'Uji 🔊'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-300 leading-tight">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[10px] transition cursor-pointer"
            >
              Simpan & Guna Tetapan Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

