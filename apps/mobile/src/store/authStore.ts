import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { trackEvent } from '../services/analytics';

export interface LocalUser {
  id: string;
  name: string;
  createdAt: number;
}

interface AuthStore {
  user: LocalUser | null;
  ready: boolean;
  mode: 'local';
  start: () => () => void;
  setName: (name: string) => void;
  resetLocalUser: () => void;
  signInGuest: () => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const userKey = 'tictactoe.localUser.v1';
const names = ['Nova', 'Cipher', 'Pixel', 'Rook', 'Vega', 'Blitz', 'Orbit', 'Echo'];

const createLocalUser = (): LocalUser => {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const name = `${names[Math.floor(Math.random() * names.length)]} ${suffix}`;
  return {
    id: `local-${Date.now()}-${suffix}`,
    name,
    createdAt: Date.now(),
  };
};

const persistUser = async (user: LocalUser) => {
  await AsyncStorage.setItem(userKey, JSON.stringify(user));
};

const readCachedUser = async () => {
  try {
    const cached = await AsyncStorage.getItem(userKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as Partial<LocalUser>;
    if (!parsed.id || !parsed.name || typeof parsed.createdAt !== 'number') return null;
    return parsed as LocalUser;
  } catch {
    await AsyncStorage.removeItem(userKey);
    return null;
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  ready: false,
  mode: 'local',
  start: () => {
    void (async () => {
      const user = (await readCachedUser()) ?? createLocalUser();
      await persistUser(user);
      set({ user, ready: true });
      trackEvent('local_user_ready', { userId: user.id, platform: 'mobile' });
    })();
    return () => undefined;
  },
  setName: (name) => {
    const trimmed = name.trim().slice(0, 24);
    if (!trimmed) return;
    const user = get().user ?? createLocalUser();
    const nextUser = { ...user, name: trimmed };
    void persistUser(nextUser);
    set({ user: nextUser, ready: true });
    trackEvent('local_user_renamed', { platform: 'mobile' });
  },
  resetLocalUser: () => {
    const user = createLocalUser();
    void persistUser(user);
    set({ user, ready: true });
    trackEvent('local_user_reset', { platform: 'mobile' });
  },
  signInGuest: async () => {
    get().start();
  },
  signInGoogle: async () => {
    trackEvent('login_provider_disabled', { method: 'google', platform: 'mobile' });
  },
  signInApple: async () => {
    trackEvent('login_provider_disabled', { method: 'apple', platform: 'mobile' });
  },
  signOut: async () => {
    get().resetLocalUser();
  },
}));
