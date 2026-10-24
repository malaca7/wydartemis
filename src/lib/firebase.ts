import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDEMaCgK71tCV8Q-JCov9qKVLisLIZYClg",
  authDomain: "artemis-e4d33.firebaseapp.com",
  projectId: "artemis-e4d33",
  storageBucket: "artemis-e4d33.firebasestorage.app",
  messagingSenderId: "96268694719",
  appId: "1:96268694719:web:afb366b9db0d5f42d8020a",
  measurementId: "G-PLW27H6C9K"
};

// Initialize Firebase App as singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firebase Analytics conditionally (only supported in browser environments)
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics unavailable or blocked by ad-blocker
  });
}

export const getAnalyticsInstance = (): Analytics | null => analyticsInstance;
