import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { GameMode } from '@tictactoe/game-engine';
import { useAuthStore } from './authStore';

export interface LocalScoreEntry {
  userId: string;
  name: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  score: number;
  bestStreak: number;
  lastPlayedAt: number | null;
}

interface ScoreStore {
  entries: LocalScoreEntry[];
  ready: boolean;
  start: () => void;
  recordGame: (result: { playerWon: boolean; draw: boolean; mode: GameMode; bestStreak: number }) => void;
  syncLocalName: () => void;
  resetScores: () => void;
}

const scoreKey = 'tictactoe.localScoreboard.v1';

const sortEntries = (entries: LocalScoreEntry[]) => [...entries].sort((a, b) => b.score - a.score || b.wins - a.wins);

const getLocalEntry = (entries: LocalScoreEntry[]) => {
  const user = useAuthStore.getState().user;
  if (!user) return entries;
  if (entries.some((entry) => entry.userId === user.id)) {
    return entries.map((entry) => (entry.userId === user.id ? { ...entry, name: user.name } : entry));
  }

  return [
    ...entries,
    {
      userId: user.id,
      name: user.name,
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      score: 0,
      bestStreak: 0,
      lastPlayedAt: null,
    },
  ];
};

const readCachedScores = async () => {
  try {
    const cached = await AsyncStorage.getItem(scoreKey);
    if (!cached) return [];
    const parsed = JSON.parse(cached) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is LocalScoreEntry => {
      if (!entry || typeof entry !== 'object') return false;
      const candidate = entry as Partial<LocalScoreEntry>;
      return typeof candidate.userId === 'string' && typeof candidate.name === 'string' && typeof candidate.score === 'number';
    });
  } catch {
    await AsyncStorage.removeItem(scoreKey);
    return [];
  }
};

const writeCachedScores = async (entries: LocalScoreEntry[]) => {
  await AsyncStorage.setItem(scoreKey, JSON.stringify(entries));
};

export const useScoreStore = create<ScoreStore>((set, get) => ({
  entries: [],
  ready: false,
  start: () => {
    void (async () => {
      const entries = sortEntries(getLocalEntry(await readCachedScores()));
      await writeCachedScores(entries);
      set({ entries, ready: true });
    })();
  },
  recordGame: ({ playerWon, draw, bestStreak }) => {
    void (async () => {
      const user = useAuthStore.getState().user;
      if (!user) return;
      const entries = get().ready ? get().entries : await readCachedScores();
      const nextEntries = sortEntries(
        getLocalEntry(entries).map((entry) => {
          if (entry.userId !== user.id) return entry;
          const wins = entry.wins + (playerWon ? 1 : 0);
          const losses = entry.losses + (!playerWon && !draw ? 1 : 0);
          const draws = entry.draws + (draw ? 1 : 0);
          const games = entry.games + 1;
          const nextBestStreak = Math.max(entry.bestStreak, bestStreak);
          return {
            ...entry,
            name: user.name,
            games,
            wins,
            losses,
            draws,
            bestStreak: nextBestStreak,
            score: wins * 100 + draws * 25 + games * 5 + nextBestStreak * 15,
            lastPlayedAt: Date.now(),
          };
        }),
      );
      await writeCachedScores(nextEntries);
      set({ entries: nextEntries, ready: true });
    })();
  },
  syncLocalName: () => {
    void (async () => {
      const entries = sortEntries(getLocalEntry(get().ready ? get().entries : await readCachedScores()));
      await writeCachedScores(entries);
      set({ entries, ready: true });
    })();
  },
  resetScores: () => {
    void (async () => {
      const entries = sortEntries(getLocalEntry([]));
      await writeCachedScores(entries);
      set({ entries, ready: true });
    })();
  },
}));
