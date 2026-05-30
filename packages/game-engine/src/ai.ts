import { availableMoves, evaluateBoard, placeMove } from './board';
import type { Board, Difficulty, GameMode, Move, PlayerMark } from './types';

interface AiOptions {
  board: Board;
  aiMark: PlayerMark;
  humanMark: PlayerMark;
  size: 3 | 4;
  winLength: 3 | 4;
  difficulty: Difficulty;
  mode?: GameMode;
  activeMoves?: Record<PlayerMark, Move[]>;
}

const randomMove = (board: Board): number => {
  const moves = availableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)] ?? -1;
};

const scoreTerminal = (
  board: Board,
  size: 3 | 4,
  winLength: 3 | 4,
  aiMark: PlayerMark,
  depth: number,
): number | null => {
  const result = evaluateBoard(board, size, winLength);
  if (result.status === 'playing') return null;
  if (result.status === 'draw') return 0;
  return result.winner === aiMark ? 10 - depth : depth - 10;
};

const minimax = (
  board: Board,
  size: 3 | 4,
  winLength: 3 | 4,
  aiMark: PlayerMark,
  humanMark: PlayerMark,
  isMaximizing: boolean,
  depth: number,
  alpha: number,
  beta: number,
): number => {
  const terminalScore = scoreTerminal(board, size, winLength, aiMark, depth);
  if (terminalScore !== null) return terminalScore;

  const moves = availableMoves(board);

  if (isMaximizing) {
    let best = Number.NEGATIVE_INFINITY;
    for (const move of moves) {
      const score = minimax(
        placeMove(board, move, aiMark),
        size,
        winLength,
        aiMark,
        humanMark,
        false,
        depth + 1,
        alpha,
        beta,
      );
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Number.POSITIVE_INFINITY;
  for (const move of moves) {
    const score = minimax(
      placeMove(board, move, humanMark),
      size,
      winLength,
      aiMark,
      humanMark,
      true,
      depth + 1,
      alpha,
      beta,
    );
    best = Math.min(best, score);
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
};

const findTacticalMove = (
  board: Board,
  size: 3 | 4,
  winLength: 3 | 4,
  mark: PlayerMark,
  activeMoves?: Record<PlayerMark, Move[]>,
  mode?: GameMode,
): number | null => {
  for (const move of availableMoves(board)) {
    const next = simulateMove(board, move, mark, activeMoves, mode);
    if (evaluateBoard(next, size, winLength).winner === mark) return move;
  }

  return null;
};

const simulateMove = (
  board: Board,
  index: number,
  player: PlayerMark,
  activeMoves?: Record<PlayerMark, Move[]>,
  mode?: GameMode,
): Board => {
  const next = placeMove(board, index, player);
  if (mode !== 'infinite' || !activeMoves) return next;

  const queue = [...activeMoves[player], { index, player, timestamp: 0 }];
  const expiredMove = queue.length > 3 ? queue.shift() : null;
  if (expiredMove) next[expiredMove.index] = null;
  return next;
};

const heuristicMove = (options: AiOptions): number => {
  const { board, size, winLength, aiMark, humanMark } = options;
  const winningMove = findTacticalMove(board, size, winLength, aiMark, options.activeMoves, options.mode);
  if (winningMove !== null) return winningMove;

  const blockMove = findTacticalMove(board, size, winLength, humanMark, options.activeMoves, options.mode);
  if (blockMove !== null) return blockMove;

  const center = Math.floor(board.length / 2);
  if (board[center] === null) return center;

  const corners = [0, size - 1, board.length - size, board.length - 1].filter((index) => board[index] === null);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  return randomMove(board);
};

export const getBestMove = (options: AiOptions): number => {
  const { board, size, winLength, aiMark, humanMark, difficulty } = options;
  const moves = availableMoves(board);
  if (moves.length === 0) return -1;

  if (difficulty === 'easy') {
    return Math.random() < 0.72 ? randomMove(board) : heuristicMove(options);
  }

  if (difficulty === 'medium') {
    return Math.random() < 0.45 ? randomMove(board) : heuristicMove(options);
  }

  if (difficulty === 'hard' || size === 4) {
    return Math.random() < 0.16 && difficulty === 'hard' ? randomMove(board) : heuristicMove(options);
  }

  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMove = moves[0];

  for (const move of moves) {
    const score = minimax(
      placeMove(board, move, aiMark),
      size,
      winLength,
      aiMark,
      humanMark,
      false,
      0,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};
