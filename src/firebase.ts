import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  updatePassword,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Active Firebase configuration resolving environment variables with fallback to firebase-applet-config.json
const activeFirebaseConfig = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || firebaseConfig.apiKey,
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || firebaseConfig.authDomain,
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || firebaseConfig.projectId,
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || firebaseConfig.storageBucket,
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || firebaseConfig.messagingSenderId,
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || firebaseConfig.appId,
  firestoreDatabaseId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID) || firebaseConfig.firestoreDatabaseId,
};

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(activeFirebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Sign-In Provider configured for account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore using the provisioned production database ID
export const db = activeFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, activeFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Authorized Administrator Email check
export const AUTHORIZED_ADMIN_EMAIL = 'mpgbsim.cemerlang@gmail.com';
export const AUTHORIZED_ADMIN_EMAILS = [
  'mpgbsim.cemerlang@gmail.com',
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
    AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean)
  );
}

// Connection test check with safe offline handling
export async function testConnection() {
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'))) {
      console.warn('Firebase client is currently offline or connecting...');
    }
  }
}

// Execute connection test on initialization with safe error handling
testConnection().catch((err) => {
  console.warn('Firebase connection check notice:', err);
});

// Standard Firebase error handling format per skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function ensureFirebaseAuth(): Promise<User | null> {
  return auth.currentUser || null;
}

const QUOTA_BREAKER_KEY = 'mpgbsim_firestore_quota_exceeded_at';
const QUOTA_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown so daily quota reset restores immediately
let quotaExceededMemoryTimestamp = 0;
let hasLoggedQuotaNotice = false;

export function isQuotaExceededError(err: any): boolean {
  if (!err) return false;
  const msg = String(err?.message || err || '').toLowerCase();
  const code = String(err?.code || '').toLowerCase();
  return (
    code.includes('resource-exhausted') ||
    msg.includes('quota limit exceeded') ||
    msg.includes('quota exceeded') ||
    msg.includes('resource-exhausted')
  );
}

export function clearFirestoreQuotaBreaker(): void {
  quotaExceededMemoryTimestamp = 0;
  hasLoggedQuotaNotice = false;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(QUOTA_BREAKER_KEY);
    } catch {}
  }
}

export function isFirestoreQuotaExceeded(): boolean {
  const now = Date.now();
  if (quotaExceededMemoryTimestamp > 0 && now - quotaExceededMemoryTimestamp < QUOTA_COOLDOWN_MS) {
    return true;
  }
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const raw = window.sessionStorage.getItem(QUOTA_BREAKER_KEY);
      if (raw) {
        const ts = Number(raw);
        if (!isNaN(ts) && now - ts < QUOTA_COOLDOWN_MS) {
          quotaExceededMemoryTimestamp = ts;
          return true;
        } else {
          window.sessionStorage.removeItem(QUOTA_BREAKER_KEY);
          quotaExceededMemoryTimestamp = 0;
        }
      }
    } catch {}
  }
  return false;
}

export function markFirestoreQuotaExceeded(source?: string): void {
  const now = Date.now();
  quotaExceededMemoryTimestamp = now;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(QUOTA_BREAKER_KEY, String(now));
    } catch {}
  }
  if (!hasLoggedQuotaNotice) {
    hasLoggedQuotaNotice = true;
    console.info(
      `[MPGBSIM Offline Fallback] Had bacaan harian percuma Firestore (50,000 read/hari) telah penuh${source ? ` (${source})` : ''}. Sistem kini beroperasi menggunakan pangkalan data cache tempatan (LocalStorage/IndexedDB) sehingga kuota direset.`
    );
  }
}

export {
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  updatePassword,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  type User,
};

