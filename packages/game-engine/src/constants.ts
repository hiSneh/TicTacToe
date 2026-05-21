import type { GameConfig } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  size: 3,
  winLength: 3,
  mode: 'classic',
  playerMark: 'X',
  aiMark: 'O',
  difficulty: 'medium',
  turnSeconds: 20,
};

export const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  impossible: 'Impossible',
} as const;
