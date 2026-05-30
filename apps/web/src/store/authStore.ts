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
  signOut: () => Promise<void>;
}

const userKey = 'tictactoe.localUser.v1';
const names = ['Nova', 'Cipher', 'Pixel', 'Rook', 'Vega', 'Blitz', 'Orbit', 'Echo'];

const createLocalUser = (): LocalUser => {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const name = `${names[Math.floor(Math.random() * names.length)]} ${suffix}`;
  return {
    id: `local-${crypto.randomUUID?.() ?? `${Date.now()}-${suffix}`}`,
    name,
    createdAt: Date.now(),
  };
};

const readCachedUser = () => {
  try {
    const cached = window.localStorage.getItem(userKey);
    return cached ? (JSON.parse(cached) as LocalUser) : null;
  } catch {
    return null;
  }
};

const writeCachedUser = (user: LocalUser) => {
  window.localStorage.setItem(userKey, JSON.stringify(user));
};

const getOrCreateUser = () => {
  const cached = readCachedUser();
  if (cached?.id && cached.name) return cached;
  const user = createLocalUser();
  writeCachedUser(user);
  return user;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  ready: false,
  mode: 'local',
  start: () => {
    const user = getOrCreateUser();
    set({ user, ready: true });
    trackEvent('local_user_ready', { userId: user.id, platform: 'web' });
    return () => undefined;
  },
  setName: (name) => {
    const trimmed = name.trim().slice(0, 24);
    if (!trimmed) return;
    const user = get().user ?? getOrCreateUser();
    const nextUser = { ...user, name: trimmed };
    writeCachedUser(nextUser);
    set({ user: nextUser, ready: true });
    trackEvent('local_user_renamed', { platform: 'web' });
  },
  resetLocalUser: () => {
    const user = createLocalUser();
    writeCachedUser(user);
    set({ user, ready: true });
    trackEvent('local_user_reset', { platform: 'web' });
  },
  signInGuest: async () => {
    get().start();
  },
  signInGoogle: async () => {
    trackEvent('login_provider_disabled', { method: 'google', platform: 'web' });
  },
  signOut: async () => {
    get().resetLocalUser();
  },
}));
