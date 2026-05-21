import { describe, expect, it } from 'vitest';
import { createGame, evaluateBoard, getBestMove, makeMove } from '../src';

describe('game engine', () => {
  it('detects row winners', () => {
    expect(evaluateBoard(['X', 'X', 'X', null, null, null, null, null, null], 3, 3)).toMatchObject({
      status: 'won',
      winner: 'X',
      winningLine: [0, 1, 2],
    });
  });

  it('blocks invalid turn order', () => {
    const game = createGame();
    const first = makeMove(game, 0, 'X');
    const blocked = makeMove(first, 1, 'X');

    expect(blocked.board[1]).toBeNull();
  });

  it('chooses a winning impossible move', () => {
    const move = getBestMove({
      board: ['O', 'O', null, 'X', 'X', null, null, null, null],
      size: 3,
      winLength: 3,
      aiMark: 'O',
      humanMark: 'X',
      difficulty: 'impossible',
    });

    expect(move).toBe(2);
  });
});
