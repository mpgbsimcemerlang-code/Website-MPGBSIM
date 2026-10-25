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

// Global singleton reference for active HTMLAudioElement so we can stop playback cleanly
let activeMursyidAudio: HTMLAudioElement | null = null;

export function stopMursyidVoice(): void {
  try {
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
 * Speaks text out loud as Mursyid AI in Bahasa Melayu.
 * Uses Gemini 3.8 TTS (/api/mpgb-tts) when available and seamlessly falls back
 * to Web Speech API (ms-MY / id-ID) tuned to a warm male mentor voice.
 */
export async function speakMursyidVoice(
  rawText: string,
  emotion: MursyidEmotion = 'neutral',
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  stopMursyidVoice();

  // Clean markdown, emojis, and URLs for natural Malay pronunciation
  const cleanText = (rawText || '')
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
    .slice(0, 700);

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

      // Select best Bahasa Melayu or Indonesian male voice if available
      const voices = window.speechSynthesis.getVoices();
      const malayOrIndoVoice =
        voices.find(
          (v) =>
            (v.lang.toLowerCase().includes('ms') || v.lang.toLowerCase().includes('id')) &&
            /male|rizwan|ardi|osman|gad/i.test(v.name)
        ) ||
        voices.find((v) => v.lang.toLowerCase().includes('ms')) ||
        voices.find((v) => v.lang.toLowerCase().includes('id'));

      if (malayOrIndoVoice) {
        utterance.voice = malayOrIndoVoice;
      }

      // Modulate pitch & rate based on Mursyid AI's emotional state
      if (emotion === 'happy' || emotion === 'waving') {
        utterance.pitch = 1.05;
        utterance.rate = 1.04;
      } else if (emotion === 'serious') {
        utterance.pitch = 0.88;
        utterance.rate = 0.96;
      } else if (emotion === 'empathetic') {
        utterance.pitch = 0.94;
        utterance.rate = 0.92;
      } else if (emotion === 'inspiring') {
        utterance.pitch = 1.02;
        utterance.rate = 1.02;
      } else {
        utterance.pitch = 0.96;
        utterance.rate = 1.0;
      }

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
      body: JSON.stringify({ text: cleanText, emotion }),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data?.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        activeMursyidAudio = audio;
        audio.onplay = () => callbacks?.onStart?.();
        audio.onended = () => {
          activeMursyidAudio = null;
          callbacks?.onEnd?.();
        };
        audio.onerror = () => {
          activeMursyidAudio = null;
          playWithWebSpeechFallback();
        };
        await audio.play();
        return;
      }
    }
  } catch {
    // Fallback to Web Speech API
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
    xs: { width: 44, height: 44, rounded: 'rounded-xl' },
    sm: { width: 58, height: 58, rounded: 'rounded-2xl' },
    md: { width: 156, height: 156, rounded: 'rounded-3xl' },
    lg: { width: 200, height: 200, rounded: 'rounded-3xl' },
    stage: { width: 220, height: 220, rounded: 'rounded-3xl' },
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
      {/* Dynamic Speech Bubble & Voice Trigger above the 3D Stage */}
      {!isCompact && (speechText || activeEmotionInfo.voicePhrase) && (
        <div className="relative mb-2 px-3.5 py-2 max-w-[330px] text-center rounded-2xl bg-slate-900/95 border border-teal-400/40 shadow-lg text-[11px] font-medium text-teal-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <p className="leading-snug flex items-center justify-center gap-1.5">
            {activeSpeaking && (
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" />
            )}
            <span>{speechText || activeEmotionInfo.voicePhrase}</span>
          </p>

          <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between gap-2 text-[10px]">
            <span className="text-teal-200/90 truncate text-left">
              <strong className="text-amber-300">Bahasa Badan:</strong>{' '}
              {sentimentInfo?.bodyLanguageLabel || activeEmotionInfo.bodyLanguage}
            </span>

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
              className={`px-2 py-0.5 rounded-lg font-extrabold flex items-center gap-1 shrink-0 transition cursor-pointer ${
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
                  <span>Cuba Suara</span>
                </>
              )}
            </button>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-b border-r border-teal-400/40 rotate-45" />
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
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-teal-700/50 text-[10px] sm:text-[11px] shadow-md max-w-[360px]">
          <button
            type="button"
            onClick={() => handleSelectEmotion('neutral', true)}
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'neutral'
                ? 'bg-teal-400 text-slate-950 shadow-xs scale-105'
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
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'happy'
                ? 'bg-emerald-400 text-slate-950 shadow-xs scale-105'
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
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'serious'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
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
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'empathetic'
                ? 'bg-rose-400 text-slate-950 shadow-xs scale-105'
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
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'thinking'
                ? 'bg-indigo-400 text-slate-950 shadow-xs scale-105'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Sentimen Analitikal: Mursyid 3D memikirkan jawapan"
          >
            <span>🤔</span>
            <span>Berfikir</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectEmotion('waving', true)}
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'waving'
                ? 'bg-amber-300 text-slate-950 shadow-xs scale-105'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Mursyid 3D melambai tangan menyapa salam"
          >
            <span>👋</span>
            <span>Melambai</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectEmotion('inspiring', true)}
            className={`px-2 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              resolvedEmotion === 'inspiring'
                ? 'bg-yellow-300 text-slate-950 shadow-xs scale-105'
                : 'text-teal-100 hover:bg-white/10'
            }`}
            title="Mursyid 3D bersemangat Kepimpinan Rabbani"
          >
            <span>✨</span>
            <span>Rabbani</span>
          </button>
        </div>
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
