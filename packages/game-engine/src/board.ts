import type { Board, CellValue, GameResult, PlayerMark } from './types';

export const createBoard = (size: number): Board => Array.from<CellValue>({ length: size * size }).fill(null);

export const otherPlayer = (player: PlayerMark): PlayerMark => (player === 'X' ? 'O' : 'X');

export const isValidMove = (board: Board, index: number): boolean =>
  Number.isInteger(index) && index >= 0 && index < board.length && board[index] === null;

export const availableMoves = (board: Board): number[] =>
  board.reduce<number[]>((moves, cell, index) => {
    if (cell === null) moves.push(index);
    return moves;
  }, []);

export const placeMove = (board: Board, index: number, player: PlayerMark): Board => {
  if (!isValidMove(board, index)) {
    throw new Error(`Invalid move at index ${index}`);
  }

  const next = [...board];
  next[index] = player;
  return next;
};

const uniqueLines = (size: number, winLength: number): number[][] => {
  const lines: number[][] = [];
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      for (const [rowStep, colStep] of directions) {
        const line: number[] = [];

        for (let step = 0; step < winLength; step += 1) {
          const nextRow = row + rowStep * step;
          const nextCol = col + colStep * step;
          if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) break;
          line.push(nextRow * size + nextCol);
        }

        if (line.length === winLength) lines.push(line);
      }
    }
  }

  return lines;
};

export const getWinningLines = (size: number, winLength: number): number[][] => uniqueLines(size, winLength);

export const evaluateBoard = (board: Board, size: number, winLength: number): GameResult => {
  for (const line of getWinningLines(size, winLength)) {
    const [first] = line;
    const owner = board[first];

    if (owner && line.every((index) => board[index] === owner)) {
      return { status: 'won', winner: owner, winningLine: line };
    }
  }

  if (board.every(Boolean)) {
    return { status: 'draw', winner: null, winningLine: [] };
  }

  return { status: 'playing', winner: null, winningLine: [] };
};
