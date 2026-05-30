import { create } from 'zustand';
import { createGame, expireTurn, getBestMove, makeMove, resetGame } from '@tictactoe/game-engine';
import type { Difficulty, GameMode, GameState, PlayerMark } from '@tictactoe/game-engine';
import { trackEvent } from '../services/analytics';
import { useAdsStore } from './adsStore';
import { useScoreStore } from './scoreStore';

interface GameStore {
  game: GameState;
  opponent: 'ai' | 'local';
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  tournamentRound: number;
  tournamentScores: Record<PlayerMark, number>;
  setDifficulty: (difficulty: Difficulty) => void;
  setMode: (mode: GameMode) => void;
  setOpponent: (opponent: 'ai' | 'local') => void;
  playMove: (index: number) => void;
  checkTimer: () => void;
  reset: () => void;
}

const buildGame = (mode: GameMode = 'classic', difficulty: Difficulty = 'medium') =>
  createGame({
    mode,
    difficulty,
    size: mode === 'fourByFour' ? 4 : 3,
    winLength: mode === 'fourByFour' ? 4 : 3,
  });

const scoreCompletedGame = (state: GameStore, nextGame: GameState, completed: boolean): Partial<GameStore> => {
  if (!completed) return {};

  const playerWon = nextGame.result.winner === nextGame.config.playerMark;
  const aiWon = nextGame.result.winner === nextGame.config.aiMark;
  const updates: Partial<GameStore> = {
    gamesPlayed: state.gamesPlayed + 1,
    wins: state.wins + (playerWon ? 1 : 0),
    losses: state.losses + (aiWon ? 1 : 0),
  };

  if (nextGame.config.mode === 'streak') {
    const currentStreak = playerWon ? state.currentStreak + 1 : 0;
    updates.currentStreak = currentStreak;
    updates.bestStreak = Math.max(state.bestStreak, currentStreak);
  }

  if (nextGame.config.mode === 'tournament' && nextGame.result.winner) {
    const scores = {
      ...state.tournamentScores,
      [nextGame.result.winner]: state.tournamentScores[nextGame.result.winner] + 1,
    };
    const roundWon = scores[nextGame.result.winner] >= 2;
    updates.tournamentScores = roundWon ? { X: 0, O: 0 } : scores;
    updates.tournamentRound = roundWon ? state.tournamentRound + 1 : state.tournamentRound;
  }

  useAdsStore.getState().recordGameCompleted();
  useScoreStore.getState().recordGame({
    playerWon,
    draw: nextGame.result.status === 'draw',
    mode: nextGame.config.mode,
    bestStreak: updates.bestStreak ?? state.bestStreak,
  });
  trackEvent('game_completed', {
    mode: nextGame.config.mode,
    difficulty: nextGame.config.difficulty,
    winner: nextGame.result.winner ?? 'draw',
    turns: nextGame.history.length,
    playerWon,
    platform: 'web',
  });

  return updates;
};

export const useGameStore = create<GameStore>((set, get) => ({
  game: buildGame(),
  opponent: 'ai',
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  tournamentRound: 1,
  tournamentScores: { X: 0, O: 0 },
  setDifficulty: (difficulty) => {
    trackEvent('difficulty_changed', { difficulty, platform: 'web' });
    set(({ game }) => ({ game: createGame({ ...game.config, difficulty }) }));
  },
  setMode: (mode) =>
    {
      trackEvent('game_mode_selected', { mode, platform: 'web' });
      set(({ game }) => ({
        game: buildGame(mode, game.config.difficulty),
        currentStreak: mode === 'streak' ? 0 : get().currentStreak,
        tournamentScores: mode === 'tournament' ? { X: 0, O: 0 } : get().tournamentScores,
        tournamentRound: mode === 'tournament' ? 1 : get().tournamentRound,
      }));
    },
  setOpponent: (opponent) => set({ opponent }),
  playMove: (index) => {
    const { game, opponent } = get();
    const afterPlayer = makeMove(game, index);
    let nextGame = afterPlayer;
    if (afterPlayer !== game) {
      trackEvent('move_played', { mode: game.config.mode, player: game.currentPlayer, index, platform: 'web' });
    }

    if (afterPlayer.result.status === 'playing' && opponent === 'ai' && afterPlayer.currentPlayer === afterPlayer.config.aiMark) {
      const aiIndex = getBestMove({
        board: afterPlayer.board,
        aiMark: afterPlayer.config.aiMark,
        humanMark: afterPlayer.config.playerMark,
        size: afterPlayer.config.size,
        winLength: afterPlayer.config.winLength,
        difficulty: afterPlayer.config.difficulty,
        mode: afterPlayer.config.mode,
        activeMoves: afterPlayer.modeState.infinite.activeMoves,
      });
      nextGame = makeMove(afterPlayer, aiIndex, afterPlayer.config.aiMark);
    }

    const completed = game.result.status === 'playing' && nextGame.result.status !== 'playing';
    set((state) => ({
      game: nextGame,
      ...scoreCompletedGame(state, nextGame, completed),
    }));
  },
  checkTimer: () =>
    set((state) => {
      const nextGame = expireTurn(state.game);
      const completed = state.game.result.status === 'playing' && nextGame.result.status !== 'playing';
      return {
        game: nextGame,
        ...scoreCompletedGame(state, nextGame, completed),
      };
    }),
  reset: () => set(({ game }) => ({ game: resetGame(game) })),
}));
