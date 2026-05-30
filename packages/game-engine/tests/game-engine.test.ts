import { describe, expect, it } from 'vitest';
import { createGame, evaluateBoard, expireTurn, getBestMove, makeMove } from '../src';

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

  it('expires the oldest mark in infinite mode after a fourth mark', () => {
    let game = createGame({ mode: 'infinite' });
    game = makeMove(game, 0, 'X', 1);
    game = makeMove(game, 2, 'O', 2);
    game = makeMove(game, 1, 'X', 3);
    game = makeMove(game, 4, 'O', 4);
    game = makeMove(game, 8, 'X', 5);
    game = makeMove(game, 5, 'O', 6);
    game = makeMove(game, 6, 'X', 7);

    expect(game.board[0]).toBeNull();
    expect(game.board[6]).toBe('X');
    expect(game.modeState.infinite.expiredMove).toMatchObject({ index: 0, player: 'X' });
    expect(game.modeState.infinite.activeMoves.X.map((move) => move.index)).toEqual([1, 8, 6]);
  });

  it('calculates infinite winners after expired marks are removed', () => {
    let game = createGame({ mode: 'infinite' });
    game = makeMove(game, 0, 'X', 1);
    game = makeMove(game, 1, 'O', 2);
    game = makeMove(game, 6, 'X', 3);
    game = makeMove(game, 2, 'O', 4);
    game = makeMove(game, 7, 'X', 5);
    game = makeMove(game, 3, 'O', 6);
    game = makeMove(game, 8, 'X', 7);

    expect(game.board[0]).toBeNull();
    expect(game.result).toMatchObject({ status: 'won', winner: 'X', winningLine: [6, 7, 8] });
  });

  it('awards timed mode wins when a turn expires', () => {
    const game = createGame({ mode: 'timed', turnSeconds: 5 });
    const expired = expireTurn(game, game.modeState.timed.turnStartedAt + 5001);

    expect(expired.result).toMatchObject({ status: 'won', winner: 'O', reason: 'timeout' });
  });
});
