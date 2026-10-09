/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Central Firebase Client Initialization & Configuration.
 * Safely resolves environment variables with fallbacks to firebase-applet-config.json
 * and project defaults. Conditionally initializes Analytics with environment & browser checks.
 */

import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import appletConfig from '../../firebase-applet-config.json';

// Helper to sanitize non-empty string values
const sanitizeConfigValue = (val: unknown): string | undefined => {
  if (typeof val === 'string' && val.trim().length > 0) {
    return val.trim();
  }
  return undefined;
};

// Safe environment variables retrieval
const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env as Record<string, string | undefined>)
    : ({} as Record<string, string | undefined>);

const jsonConfig = (appletConfig || {}) as Record<string, string | undefined>;

// Safe project fallback configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDMp1NiH6Rk9vqJvdftohqvk6wLy0Cwl7I',
  authDomain: 'key-of-david.firebaseapp.com',
  projectId: 'key-of-david',
  storageBucket: 'key-of-david.firebasestorage.app',
  messagingSenderId: '335892493086',
  appId: '1:335892493086:web:1232521eefe782db16cf0f',
  measurementId: 'G-RKVDVE9W92',
};

// Composite configuration following prioritized resolution:
// 1. Environment variables (VITE_FIREBASE_*)
// 2. firebase-applet-config.json
// 3. Fallback defaults
export const firebaseConfig: FirebaseOptions = {
  apiKey:
    sanitizeConfigValue(env.VITE_FIREBASE_API_KEY) ||
    sanitizeConfigValue(jsonConfig.apiKey) ||
    DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain:
    sanitizeConfigValue(env.VITE_FIREBASE_AUTH_DOMAIN) ||
    sanitizeConfigValue(jsonConfig.authDomain) ||
    DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId:
    sanitizeConfigValue(env.VITE_FIREBASE_PROJECT_ID) ||
    sanitizeConfigValue(jsonConfig.projectId) ||
    DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket:
    sanitizeConfigValue(env.VITE_FIREBASE_STORAGE_BUCKET) ||
    sanitizeConfigValue(jsonConfig.storageBucket) ||
    DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    sanitizeConfigValue(env.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    sanitizeConfigValue(jsonConfig.messagingSenderId) ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId:
    sanitizeConfigValue(env.VITE_FIREBASE_APP_ID) ||
    sanitizeConfigValue(jsonConfig.appId) ||
    DEFAULT_FIREBASE_CONFIG.appId,
  measurementId:
    sanitizeConfigValue(env.VITE_FIREBASE_MEASUREMENT_ID) ||
    sanitizeConfigValue(jsonConfig.measurementId) ||
    DEFAULT_FIREBASE_CONFIG.measurementId,
};

// Base44 sandbox preview only: the committed Firebase project denies anonymous
// Firestore reads, so run on the app's built-in localStorage store instead.
// When BASE44_PREVIEW_MODE is unset or any other value, behavior is unchanged.
const sandboxPreviewMode = env.BASE44_PREVIEW_MODE === '1';

// Determine whether valid credentials exist
export const isFirebaseConfigured: boolean =
  !sandboxPreviewMode &&
  Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.length > 5
  );

// Optional custom firestore database identifier (e.g. provisioned database ID)
const activeFirestoreDatabaseId: string | undefined =
  sanitizeConfigValue(env.VITE_FIREBASE_FIRESTORE_DATABASE_ID) ||
  (firebaseConfig.projectId === jsonConfig.projectId
    ? sanitizeConfigValue(jsonConfig.firestoreDatabaseId)
    : undefined);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let analyticsPromise: Promise<Analytics | null> = Promise.resolve(null);

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = activeFirestoreDatabaseId
      ? getFirestore(app, activeFirestoreDatabaseId)
      : getFirestore(app);
    storage = getStorage(app);

    // Conditionally initialize Analytics only in browser environment and when supported
    if (typeof window !== 'undefined' && app) {
      analyticsPromise = isSupported()
        .then((supported) => {
          if (supported && app) {
            try {
              analytics = getAnalytics(app);
              return analytics;
            } catch (err) {
              console.warn('[Firebase Analytics] Initialization warning:', err);
              return null;
            }
          }
          return null;
        })
        .catch((err) => {
          console.warn('[Firebase Analytics] Environment unsupported:', err);
          return null;
        });
    }

    // Ping Firestore connection for diagnostic verification
    if (typeof window !== 'undefined' && db) {
      getDocFromServer(doc(db, 'test', 'connection')).catch((error) => {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('[Firebase] Client is offline.');
        }
      });
    }
  } catch (error) {
    console.warn('[Firebase] Initialization error:', error);
  }
}

// Google Auth Provider configured for clean popup selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Asynchronous accessor for Firebase Analytics (guaranteed safe resolution)
export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (analytics) return analytics;
  return analyticsPromise;
};

// Safe analytics logging utility
export const logAnalyticsEvent = async (
  eventName: string,
  eventParams?: Record<string, unknown>
): Promise<void> => {
  try {
    const inst = await getFirebaseAnalytics();
    if (inst) {
      firebaseLogEvent(inst, eventName, eventParams);
    }
  } catch (err) {
    console.debug('[Firebase Analytics] Event skipped:', err);
  }
};

export { app, auth, db, storage, analytics };

export default {
  app,
  auth,
  db,
  storage,
  analytics,
  getFirebaseAnalytics,
  logAnalyticsEvent,
  googleProvider,
  isFirebaseConfigured,
  firebaseConfig,
};
