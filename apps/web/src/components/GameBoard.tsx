import { motion } from 'framer-motion';
import type { Board } from '@tictactoe/game-engine';
import { cx } from '@tictactoe/utils';

interface GameBoardProps {
  board: Board;
  size: 3 | 4;
  winningLine: number[];
  expiredIndex?: number | null;
  expiringIndices?: number[];
  infinite?: boolean;
  onMove: (index: number) => void;
}

export const GameBoard = ({ board, size, winningLine, expiredIndex, expiringIndices = [], infinite, onMove }: GameBoardProps) => (
  <div
    className={`grid w-full max-w-[26rem] gap-3 ${infinite ? 'infinite-board' : ''}`}
    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    role="grid"
    aria-label={`${size} by ${size} TicTacToe board`}
  >
    {board.map((cell, index) => (
      <motion.button
        key={index}
        whileTap={{ scale: 0.93 }}
        whileHover={{ y: -2 }}
        onClick={() => onMove(index)}
        disabled={Boolean(cell)}
        className={cx(
          'aspect-square rounded-[1.25rem] border border-white/10 bg-white/8 text-5xl font-black text-white shadow-xl transition focus:outline-none focus:ring-2 focus:ring-aqua disabled:cursor-default md:text-6xl',
          cell === 'X' && 'text-aqua',
          cell === 'O' && 'text-rose',
          winningLine.includes(index) && 'cell-highlight',
          expiringIndices.includes(index) && 'cell-expiring',
          expiredIndex === index && 'cell-expired',
        )}
        role="gridcell"
        aria-label={
          cell
            ? expiringIndices.includes(index)
              ? `${cell} at ${index + 1}, next to fade`
              : `${cell} at ${index + 1}`
            : `Empty cell ${index + 1}`
        }
      >
        {cell && (
          <motion.span initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}>
            {cell}
          </motion.span>
        )}
      </motion.button>
    ))}
  </div>
);
