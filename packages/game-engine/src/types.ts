export type PlayerMark = 'X' | 'O';
export type CellValue = PlayerMark | null;
export type Board = CellValue[];
export type GameStatus = 'playing' | 'won' | 'draw';
export type GameMode = 'classic' | 'fourByFour' | 'timed' | 'streak' | 'tournament' | 'infinite';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

export interface Move {
  index: number;
  player: PlayerMark;
  timestamp: number;
}

export interface GameConfig {
  size: 3 | 4;
  winLength: 3 | 4;
  mode: GameMode;
  playerMark: PlayerMark;
  aiMark: PlayerMark;
  difficulty: Difficulty;
  turnSeconds?: number;
}

export interface GameResult {
  status: GameStatus;
  winner: PlayerMark | null;
  winningLine: number[];
  reason?: 'line' | 'draw' | 'timeout';
}

export interface InfiniteState {
  activeMoves: Record<PlayerMark, Move[]>;
  expiredMove: Move | null;
  maxActiveMarks: number;
}

export interface TimedState {
  turnStartedAt: number;
  turnDeadline: number | null;
  turnSeconds: number;
}

export interface GameModeState {
  infinite: InfiniteState;
  timed: TimedState;
}

export interface GameState {
  board: Board;
  currentPlayer: PlayerMark;
  config: GameConfig;
  history: Move[];
  result: GameResult;
  modeState: GameModeState;
}

export interface MultiplayerAdapter {
  createRoom(playerId: string): Promise<string>;
  joinRoom(roomId: string, playerId: string): Promise<void>;
  sendMove(roomId: string, move: Move): Promise<void>;
  subscribe(roomId: string, onMove: (move: Move) => void): () => void;
}
