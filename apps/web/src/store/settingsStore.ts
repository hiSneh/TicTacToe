import { create } from 'zustand';
import type { ThemeId } from '@tictactoe/ui';

interface SettingsStore {
  theme: ThemeId;
  sound: boolean;
  haptics: boolean;
  highContrast: boolean;
  setTheme: (theme: ThemeId) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleHighContrast: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'neon',
  sound: true,
  haptics: true,
  highContrast: false,
  setTheme: (theme) => set({ theme }),
  toggleSound: () => set((state) => ({ sound: !state.sound })),
  toggleHaptics: () => set((state) => ({ haptics: !state.haptics })),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
}));
