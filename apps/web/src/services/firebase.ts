import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { fetchAndActivate, getRemoteConfig, getValue, type RemoteConfig } from 'firebase/remote-config';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let app: FirebaseApp | null = null;
let remoteConfig: RemoteConfig | null = null;

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured) return null;
  app = app ?? (getApps()[0] ?? initializeApp(firebaseConfig));
  return app;
};

export const getFirebaseRemoteConfig = () => {
  const currentApp = getFirebaseApp();
  if (!currentApp) return null;
  remoteConfig = remoteConfig ?? getRemoteConfig(currentApp);
  remoteConfig.settings.minimumFetchIntervalMillis = import.meta.env.DEV ? 60_000 : 3_600_000;
  remoteConfig.defaultConfig = {
    interstitial_frequency: 4,
    rewarded_hints_enabled: true,
    ads_enabled: true,
  };
  return remoteConfig;
};

export const activateRemoteConfig = async () => {
  const config = getFirebaseRemoteConfig();
  if (!config) return;
  await fetchAndActivate(config);
};

export const getRemoteNumber = (key: string, fallback: number) => {
  const config = getFirebaseRemoteConfig();
  if (!config) return fallback;
  const value = getValue(config, key).asNumber();
  return Number.isFinite(value) && value > 0 ? value : fallback;
};
