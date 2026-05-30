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

const readCachedScores = () => {
  try {
    const cached = window.localStorage.getItem(scoreKey);
    return cached ? (JSON.parse(cached) as LocalScoreEntry[]) : [];
  } catch {
    return [];
  }
};

const writeCachedScores = (entries: LocalScoreEntry[]) => {
  window.localStorage.setItem(scoreKey, JSON.stringify(entries));
};

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

const sortEntries = (entries: LocalScoreEntry[]) => [...entries].sort((a, b) => b.score - a.score || b.wins - a.wins);

export const useScoreStore = create<ScoreStore>((set, get) => ({
  entries: [],
  ready: false,
  start: () => {
    const entries = sortEntries(getLocalEntry(readCachedScores()));
    writeCachedScores(entries);
    set({ entries, ready: true });
  },
  recordGame: ({ playerWon, draw, bestStreak }) => {
    const entries = get().ready ? get().entries : readCachedScores();
    const user = useAuthStore.getState().user;
    if (!user) return;

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
    writeCachedScores(nextEntries);
    set({ entries: nextEntries, ready: true });
  },
  syncLocalName: () => {
    const entries = sortEntries(getLocalEntry(get().ready ? get().entries : readCachedScores()));
    writeCachedScores(entries);
    set({ entries, ready: true });
  },
  resetScores: () => {
    const entries = sortEntries(getLocalEntry([]));
    writeCachedScores(entries);
    set({ entries, ready: true });
  },
}));
