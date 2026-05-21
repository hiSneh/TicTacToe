import { RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { DIFFICULTY_LABELS } from '@tictactoe/game-engine';
import type { Difficulty, GameMode } from '@tictactoe/game-engine';
import { GameBoard } from '../components/GameBoard';
import { useGameStore } from '../store/gameStore';

const modes: Array<{ value: GameMode; label: string }> = [
  { value: 'classic', label: '3x3' },
  { value: 'fourByFour', label: '4x4' },
  { value: 'timed', label: 'Timed' },
  { value: 'streak', label: 'Streak' },
  { value: 'tournament', label: 'Cup' },
];

const difficulties = Object.keys(DIFFICULTY_LABELS) as Difficulty[];

export const GamePage = () => {
  const { game, opponent, playMove, reset, setDifficulty, setMode, setOpponent } = useGameStore();
  const status =
    game.result.status === 'won'
      ? `${game.result.winner} wins`
      : game.result.status === 'draw'
        ? 'Draw game'
        : `${game.currentPlayer}'s turn`;

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr_20rem]">
      <aside className="glass rounded-[2rem] p-5">
        <h2 className="text-xl font-black">Arena Setup</h2>
        <div className="mt-5 space-y-5">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/45">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setMode(mode.value)}
                  className={`rounded-2xl px-3 py-3 font-bold transition ${
                    game.config.mode === mode.value ? 'bg-aqua text-ink' : 'bg-white/8 text-white/70'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/45">Opponent</p>
            <div className="grid grid-cols-2 gap-2">
              {(['ai', 'local'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setOpponent(value)}
                  className={`rounded-2xl px-3 py-3 font-bold capitalize transition ${
                    opponent === value ? 'bg-rose text-white' : 'bg-white/8 text-white/70'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/45">AI Difficulty</p>
            <div className="grid gap-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setDifficulty(difficulty)}
                  className={`rounded-2xl px-3 py-3 text-left font-bold transition ${
                    game.config.difficulty === difficulty ? 'bg-gold text-ink' : 'bg-white/8 text-white/70'
                  }`}
                >
                  {DIFFICULTY_LABELS[difficulty]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="glass flex flex-col items-center rounded-[2rem] p-5 md:p-8">
        <div className="mb-6 flex w-full items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-aqua">Live Match</p>
            <h1 className="mt-1 text-3xl font-black">{status}</h1>
          </div>
          <button onClick={reset} className="grid size-12 place-items-center rounded-2xl bg-white/10 text-white" aria-label="Reset game">
            <RotateCcw size={20} />
          </button>
        </div>

        <GameBoard board={game.board} size={game.config.size} winningLine={game.result.winningLine} onMove={playMove} />

        {game.result.status === 'won' && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-black text-gold"
          >
            <Sparkles size={18} />
            Confetti-ready victory state
          </motion.div>
        )}
      </section>

      <aside className="glass rounded-[2rem] p-5">
        <h2 className="text-xl font-black">Match Feed</h2>
        <div className="mt-4 space-y-3">
          {game.history.length === 0 && <p className="text-white/55">Make the opening move.</p>}
          {game.history.map((move, index) => (
            <div key={`${move.timestamp}-${move.index}`} className="flex items-center justify-between rounded-2xl bg-white/7 px-4 py-3">
              <span className="font-bold">Turn {index + 1}</span>
              <span className={move.player === 'X' ? 'text-aqua' : 'text-rose'}>
                {move.player} to {move.index + 1}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
