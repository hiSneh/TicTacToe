import { create } from 'zustand';
import { createGame, getBestMove, makeMove, resetGame } from '@tictactoe/game-engine';
import type { Difficulty, GameMode, GameState } from '@tictactoe/game-engine';

interface GameStore {
  game: GameState;
  opponent: 'ai' | 'local';
  gamesPlayed: number;
  wins: number;
  setDifficulty: (difficulty: Difficulty) => void;
  setMode: (mode: GameMode) => void;
  setOpponent: (opponent: 'ai' | 'local') => void;
  playMove: (index: number) => void;
  reset: () => void;
}

const buildGame = (mode: GameMode = 'classic', difficulty: Difficulty = 'medium') =>
  createGame({
    mode,
    difficulty,
    size: mode === 'fourByFour' ? 4 : 3,
    winLength: mode === 'fourByFour' ? 4 : 3,
  });

export const useGameStore = create<GameStore>((set, get) => ({
  game: buildGame(),
  opponent: 'ai',
  gamesPlayed: 0,
  wins: 0,
  setDifficulty: (difficulty) => set(({ game }) => ({ game: createGame({ ...game.config, difficulty }) })),
  setMode: (mode) => set(({ game }) => ({ game: buildGame(mode, game.config.difficulty) })),
  setOpponent: (opponent) => set({ opponent }),
  playMove: (index) => {
    const { game, opponent } = get();
    const afterPlayer = makeMove(game, index);
    let nextGame = afterPlayer;

    if (afterPlayer.result.status === 'playing' && opponent === 'ai' && afterPlayer.currentPlayer === afterPlayer.config.aiMark) {
      const aiMove = getBestMove({
        board: afterPlayer.board,
        aiMark: afterPlayer.config.aiMark,
        humanMark: afterPlayer.config.playerMark,
        size: afterPlayer.config.size,
        winLength: afterPlayer.config.winLength,
        difficulty: afterPlayer.config.difficulty,
      });
      nextGame = makeMove(afterPlayer, aiMove, afterPlayer.config.aiMark);
    }

    const completed = game.result.status === 'playing' && nextGame.result.status !== 'playing';
    set((state) => ({
      game: nextGame,
      gamesPlayed: state.gamesPlayed + (completed ? 1 : 0),
      wins: state.wins + (nextGame.result.winner === nextGame.config.playerMark ? 1 : 0),
    }));
  },
  reset: () => set(({ game }) => ({ game: resetGame(game) })),
}));
