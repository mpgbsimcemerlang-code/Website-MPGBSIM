/**
 * Client-Side Rate-Limiting Mechanism for MPGBSIM Member Portal & Forms
 * 
 * Protects Cloud Firestore against:
 * 1. Accidental double-clicks and repeated submissions.
 * 2. Rapid automated or malicious form spamming.
 * 3. Daily Firestore write quota exhaustion.
 * 
 * Features:
 * - LocalStorage + In-memory fallback persistence (persists across page reloads/tab changes).
 * - Minimum cooldown intervals (e.g. 15s between member registrations).
 * - Sliding window max attempts (e.g. max 3 registrations per 10 minutes).
 * - Real-time countdown timer hook (`useRateLimiter`) with reactive re-enabling.
 * - Bilingual/Malay security notices and user-friendly error messages.
 */

import { useState, useEffect, useCallback } from 'react';

export type RateLimitAction =
  | 'member_registration'
  | 'alumni_registration'
  | 'practice_submission'
  | 'general_submission'
  | 'school_news_submission'
  | 'program_registration'
  | 'profile_update';

export interface RateLimitPolicy {
  action: RateLimitAction | string;
  name: string;
  minIntervalMs: number; // Minimum wait time between two consecutive submissions (ms)
  maxAttempts: number;   // Maximum allowed submissions within windowMs
  windowMs: number;      // Sliding window duration (ms)
  customMessage?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: 'COOLDOWN' | 'MAX_ATTEMPTS';
  retryAfterSeconds: number;
  remainingAttempts: number;
  message: string;
}

// Default policy specifications for Member Portal actions
export const DEFAULT_RATE_LIMIT_POLICIES: Record<RateLimitAction, RateLimitPolicy> = {
  member_registration: {
    action: 'member_registration',
    name: 'Pendaftaran Keahlian Sekolah',
    minIntervalMs: 15000, // 15 seconds cooldown
    maxAttempts: 3,       // Max 3 registrations within 10 minutes
    windowMs: 10 * 60 * 1000,
    customMessage: 'Pendaftaran keahlian hanya boleh dihantar 3 kali dalam tempoh 10 minit bagi mengelakkan permohonan bertindih.',
  },
  alumni_registration: {
    action: 'alumni_registration',
    name: 'Pendaftaran Alumni PGB',
    minIntervalMs: 15000, // 15 seconds cooldown
    maxAttempts: 3,       // Max 3 registrations within 10 minutes
    windowMs: 10 * 60 * 1000,
    customMessage: 'Pendaftaran rekod alumni hanya dibenarkan 3 kali dalam tempoh 10 minit bagi mengelakkan permohonan bertindih.',
  },
  practice_submission: {
    action: 'practice_submission',
    name: 'Perkongsian Amalan Terbaik',
    minIntervalMs: 10000, // 10 seconds cooldown
    maxAttempts: 5,       // Max 5 submissions within 10 minutes
    windowMs: 10 * 60 * 1000,
    customMessage: 'Penghantaran amalan terbaik dihadkan untuk mengelakkan penulisan berulang ke pangkalan data.',
  },
  general_submission: {
    action: 'general_submission',
    name: 'Penghantaran Maklum Balas / Aduan / Bahan',
    minIntervalMs: 10000, // 10 seconds cooldown
    maxAttempts: 5,       // Max 5 submissions within 10 minutes
    windowMs: 10 * 60 * 1000,
    customMessage: 'Penghantaran bahan dihadkan untuk mengelakkan limpahan permintaan pangkalan data.',
  },
  school_news_submission: {
    action: 'school_news_submission',
    name: 'Penghantaran Berita Sekolah',
    minIntervalMs: 10000, // 10 seconds cooldown
    maxAttempts: 5,       // Max 5 news posts within 10 minutes
    windowMs: 10 * 60 * 1000,
    customMessage: 'Penghantaran berita sekolah dihadkan kepada 5 berita setiap 10 minit.',
  },
  program_registration: {
    action: 'program_registration',
    name: 'Pendaftaran Program / Aktiviti',
    minIntervalMs: 8000,  // 8 seconds cooldown
    maxAttempts: 6,       // Max 6 program sign-ups within 10 minutes
    windowMs: 10 * 60 * 1000,
    customMessage: 'Pendaftaran program dihadkan bagi memastikan sistem pangkalan data kekal responsif.',
  },
  profile_update: {
    action: 'profile_update',
    name: 'Kemaskini Profil & Maklumat Sekolah',
    minIntervalMs: 5000,  // 5 seconds cooldown
    maxAttempts: 10,      // Max 10 updates within 10 minutes
    windowMs: 10 * 60 * 1000,
    customMessage: 'Kemaskini maklumat profil dihadkan selang 5 saat.',
  },
};

// In-memory fallback if localStorage is disabled or throws
const inMemoryTimestamps: Record<string, number[]> = {};

const STORAGE_PREFIX = 'mpgbsim_rl_';

/**
 * Retrieve recorded timestamps for a specific action key
 */
function getTimestamps(actionKey: string, windowMs: number): number[] {
  const now = Date.now();
  const minValidTimestamp = now - windowMs;

  let timestamps: number[] = [];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${actionKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          timestamps = parsed.filter((t) => typeof t === 'number' && t >= minValidTimestamp);
        }
      }
    } catch {
      // Fallback to in-memory if localStorage read fails
      timestamps = (inMemoryTimestamps[actionKey] || []).filter((t) => t >= minValidTimestamp);
    }
  } else {
    timestamps = (inMemoryTimestamps[actionKey] || []).filter((t) => t >= minValidTimestamp);
  }

  return timestamps;
}

/**
 * Persist timestamps for a specific action key
 */
function saveTimestamps(actionKey: string, timestamps: number[]) {
  inMemoryTimestamps[actionKey] = timestamps;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${actionKey}`, JSON.stringify(timestamps));
    } catch {
      // Ignore quota errors on localStorage
    }
  }
}

/**
 * Check if an action is currently rate limited
 */
export function checkRateLimit(
  action: RateLimitAction | string,
  customPolicy?: Partial<RateLimitPolicy>
): RateLimitResult {
  const defaultPolicy =
    DEFAULT_RATE_LIMIT_POLICIES[action as RateLimitAction] || {
      action,
      name: action,
      minIntervalMs: 10000,
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000,
    };

  const policy: RateLimitPolicy = { ...defaultPolicy, ...customPolicy };
  const now = Date.now();
  const timestamps = getTimestamps(policy.action, policy.windowMs);

  // 1. Check minimum interval cooldown between consecutive submissions
  if (timestamps.length > 0) {
    const lastTimestamp = timestamps[timestamps.length - 1];
    const elapsedSinceLast = now - lastTimestamp;
    if (elapsedSinceLast < policy.minIntervalMs) {
      const retryAfterSeconds = Math.ceil((policy.minIntervalMs - elapsedSinceLast) / 1000);
      return {
        allowed: false,
        reason: 'COOLDOWN',
        retryAfterSeconds,
        remainingAttempts: Math.max(0, policy.maxAttempts - timestamps.length),
        message: `Sila tunggu ${retryAfterSeconds} saat sebelum menghantar semula borang untuk memastikan rekod tidak bertindih.`,
      };
    }
  }

  // 2. Check maximum attempts within the time window
  if (timestamps.length >= policy.maxAttempts) {
    const oldestTimestampInWindow = timestamps[0];
    const timeUntilOldestExpires = oldestTimestampInWindow + policy.windowMs - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(timeUntilOldestExpires / 1000));
    const retryMinutes = Math.ceil(retryAfterSeconds / 60);

    return {
      allowed: false,
      reason: 'MAX_ATTEMPTS',
      retryAfterSeconds,
      remainingAttempts: 0,
      message:
        policy.customMessage ||
        `Had penghantaran maksimum dicapai (${policy.maxAttempts} kali). Sila tunggu ${retryMinutes} minit sebelum mencuba lagi.`,
    };
  }

  const remainingAttempts = policy.maxAttempts - timestamps.length;

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remainingAttempts,
    message: `Dibenarkan (${remainingAttempts} cubaan berbaki).`,
  };
}

/**
 * Record a valid submission attempt
 */
export function recordRateLimitAttempt(
  action: RateLimitAction | string,
  customPolicy?: Partial<RateLimitPolicy>
): void {
  const defaultPolicy =
    DEFAULT_RATE_LIMIT_POLICIES[action as RateLimitAction] || {
      action,
      name: action,
      minIntervalMs: 10000,
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000,
    };

  const policy = { ...defaultPolicy, ...customPolicy };
  const now = Date.now();
  const timestamps = getTimestamps(policy.action, policy.windowMs);
  timestamps.push(now);

  saveTimestamps(policy.action, timestamps);
}

/**
 * Combined check-and-record: if allowed, automatically logs the attempt.
 * If not allowed, returns the limit result without recording a failed attempt.
 */
export function checkAndRecordRateLimit(
  action: RateLimitAction | string,
  customPolicy?: Partial<RateLimitPolicy>
): RateLimitResult {
  const check = checkRateLimit(action, customPolicy);
  if (check.allowed) {
    recordRateLimitAttempt(action, customPolicy);
  }
  return check;
}

/**
 * Reset/Clear rate-limit history for an action (e.g., if client-side validation failed before submission)
 */
export function resetRateLimit(action: RateLimitAction | string): void {
  delete inMemoryTimestamps[action];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${action}`);
    } catch {}
  }
}

/**
 * React Hook for interactive client-side rate limiting with reactive countdown timer
 */
export function useRateLimiter(
  action: RateLimitAction | string,
  customPolicy?: Partial<RateLimitPolicy>
) {
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number>(0);
  const [isLimited, setIsLimited] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial state on mount
  useEffect(() => {
    const status = checkRateLimit(action, customPolicy);
    if (!status.allowed) {
      setIsLimited(true);
      setRetryAfterSeconds(status.retryAfterSeconds);
      setErrorMessage(status.message);
    }
  }, [action]);

  // Tick countdown timer every 1000ms when limited
  useEffect(() => {
    if (retryAfterSeconds <= 0) {
      if (isLimited) {
        setIsLimited(false);
        setErrorMessage(null);
      }
      return;
    }

    const timer = setInterval(() => {
      setRetryAfterSeconds((prev) => {
        if (prev <= 1) {
          setIsLimited(false);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfterSeconds, isLimited]);

  /**
   * Validate submission capability. If blocked, sets error state and countdown.
   * Returns true if allowed, false if blocked.
   */
  const verifyCanSubmit = useCallback((): boolean => {
    const status = checkRateLimit(action, customPolicy);
    if (!status.allowed) {
      setIsLimited(true);
      setRetryAfterSeconds(status.retryAfterSeconds);
      setErrorMessage(status.message);
      return false;
    }
    return true;
  }, [action, customPolicy]);

  /**
   * Record attempt upon submission. Returns false if blocked, true if recorded.
   */
  const triggerSubmission = useCallback((): boolean => {
    const status = checkAndRecordRateLimit(action, customPolicy);
    if (!status.allowed) {
      setIsLimited(true);
      setRetryAfterSeconds(status.retryAfterSeconds);
      setErrorMessage(status.message);
      return false;
    }

    // Set cooldown timer for subsequent attempts
    const nextCheck = checkRateLimit(action, customPolicy);
    if (!nextCheck.allowed) {
      setIsLimited(true);
      setRetryAfterSeconds(nextCheck.retryAfterSeconds);
      setErrorMessage(nextCheck.message);
    }
    return true;
  }, [action, customPolicy]);

  const clearRateLimit = useCallback(() => {
    resetRateLimit(action);
    setIsLimited(false);
    setRetryAfterSeconds(0);
    setErrorMessage(null);
  }, [action]);

  return {
    isLimited,
    retryAfterSeconds,
    errorMessage,
    verifyCanSubmit,
    triggerSubmission,
    clearRateLimit,
  };
}
