import { DEFAULT_CONFIG } from './constants';
import { createBoard, evaluateBoard, otherPlayer, placeMove } from './board';
import type { GameConfig, GameState, PlayerMark } from './types';

export const createGame = (config: Partial<GameConfig> = {}): GameState => {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const board = createBoard(merged.size);

  return {
    board,
    currentPlayer: 'X',
    config: merged,
    history: [],
    result: evaluateBoard(board, merged.size, merged.winLength),
  };
};

export const makeMove = (state: GameState, index: number, player = state.currentPlayer): GameState => {
  if (state.result.status !== 'playing') return state;
  if (player !== state.currentPlayer) return state;

  const board = placeMove(state.board, index, player);
  const result = evaluateBoard(board, state.config.size, state.config.winLength);

  return {
    ...state,
    board,
    currentPlayer: result.status === 'playing' ? otherPlayer(player) : player,
    history: [...state.history, { index, player, timestamp: Date.now() }],
    result,
  };
};

export const resetGame = (state: GameState, startingPlayer: PlayerMark = 'X'): GameState => ({
  ...createGame(state.config),
  currentPlayer: startingPlayer,
});
