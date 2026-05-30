import { DEFAULT_CONFIG } from './constants';
import { createBoard, evaluateBoard, isValidMove, otherPlayer, placeMove } from './board';
import type { Board, GameConfig, GameModeState, GameState, Move, PlayerMark } from './types';

const createModeState = (config: GameConfig, now = Date.now()): GameModeState => ({
  infinite: {
    activeMoves: { X: [], O: [] },
    expiredMove: null,
    maxActiveMarks: 3,
  },
  timed: {
    turnStartedAt: now,
    turnDeadline: config.mode === 'timed' ? now + (config.turnSeconds ?? DEFAULT_CONFIG.turnSeconds ?? 20) * 1000 : null,
    turnSeconds: config.turnSeconds ?? DEFAULT_CONFIG.turnSeconds ?? 20,
  },
});

const refreshTimedState = (state: GameState, now: number): GameModeState => ({
  ...state.modeState,
  timed: {
    ...state.modeState.timed,
    turnStartedAt: now,
    turnDeadline: state.config.mode === 'timed' ? now + state.modeState.timed.turnSeconds * 1000 : null,
  },
});

const applyInfiniteMove = (state: GameState, board: Board, move: Move) => {
  const currentQueue = [...state.modeState.infinite.activeMoves[move.player], move];
  const expiredMove = currentQueue.length > state.modeState.infinite.maxActiveMarks ? currentQueue.shift() ?? null : null;
  const nextBoard = [...board];

  if (expiredMove) {
    nextBoard[expiredMove.index] = null;
  }

  return {
    board: nextBoard,
    infinite: {
      ...state.modeState.infinite,
      activeMoves: {
        ...state.modeState.infinite.activeMoves,
        [move.player]: currentQueue,
      },
      expiredMove,
    },
  };
};

export const createGame = (config: Partial<GameConfig> = {}): GameState => {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const board = createBoard(merged.size);

  return {
    board,
    currentPlayer: 'X',
    config: merged,
    history: [],
    result: evaluateBoard(board, merged.size, merged.winLength),
    modeState: createModeState(merged),
  };
};

export const expireTurn = (state: GameState, now = Date.now()): GameState => {
  if (state.result.status !== 'playing') return state;
  if (state.config.mode !== 'timed') return state;
  if (!state.modeState.timed.turnDeadline || now < state.modeState.timed.turnDeadline) return state;

  return {
    ...state,
    currentPlayer: otherPlayer(state.currentPlayer),
    result: {
      status: 'won',
      winner: otherPlayer(state.currentPlayer),
      winningLine: [],
      reason: 'timeout',
    },
  };
};

export const makeMove = (state: GameState, index: number, player = state.currentPlayer, now = Date.now()): GameState => {
  const activeState = expireTurn(state, now);
  if (activeState !== state) return activeState;
  if (state.result.status !== 'playing') return state;
  if (player !== state.currentPlayer) return state;
  if (!isValidMove(state.board, index)) return state;

  const move = { index, player, timestamp: now };
  const placedBoard = placeMove(state.board, index, player);
  const { board, infinite } =
    state.config.mode === 'infinite'
      ? applyInfiniteMove(state, placedBoard, move)
      : { board: placedBoard, infinite: { ...state.modeState.infinite, expiredMove: null } };
  const result = evaluateBoard(board, state.config.size, state.config.winLength);

  return {
    ...state,
    board,
    currentPlayer: result.status === 'playing' ? otherPlayer(player) : player,
    history: [...state.history, move],
    result,
    modeState: {
      ...refreshTimedState(state, now),
      infinite,
    },
  };
};

export const resetGame = (state: GameState, startingPlayer: PlayerMark = 'X'): GameState => ({
  ...createGame(state.config),
  currentPlayer: startingPlayer,
});
