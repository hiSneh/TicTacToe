import { useEffect, useMemo, useState } from 'react';
import { Home, RotateCcw, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_LABELS } from '@tictactoe/game-engine';
import type { Difficulty, GameMode } from '@tictactoe/game-engine';
import { useInterstitialAd } from '../ads/hooks';
import { AdPlaceholder } from '../components/AdPlaceholder';
import { GameBoard } from '../components/GameBoard';
import { useGameStore } from '../store/gameStore';

const modes: Array<{ value: GameMode; label: string }> = [
  { value: 'classic', label: '3x3' },
  { value: 'fourByFour', label: '4x4' },
  { value: 'timed', label: 'Timed' },
  { value: 'streak', label: 'Streak' },
  { value: 'tournament', label: 'Cup' },
  { value: 'infinite', label: 'Infinite' },
];

const difficulties = Object.keys(DIFFICULTY_LABELS) as Difficulty[];

export const GamePage = () => {
  const [tick, setTick] = useState(Date.now());
  const navigate = useNavigate();
  const showInterstitial = useInterstitialAd('game_complete');
  const {
    game,
    opponent,
    playMove,
    reset,
    setDifficulty,
    setMode,
    setOpponent,
    checkTimer,
    currentStreak,
    bestStreak,
    tournamentRound,
    tournamentScores,
  } = useGameStore();
  const timeRemaining = useMemo(() => {
    if (game.config.mode !== 'timed' || !game.modeState.timed.turnDeadline || game.result.status !== 'playing') return null;
    return Math.max(0, Math.ceil((game.modeState.timed.turnDeadline - tick) / 1000));
  }, [game.config.mode, game.modeState.timed.turnDeadline, game.result.status, tick]);
  const status =
    game.result.status === 'won'
      ? game.result.reason === 'timeout'
        ? `${game.result.winner} wins on time`
        : `${game.result.winner} wins`
      : game.result.status === 'draw'
        ? 'Draw game'
      : `${game.currentPlayer}'s turn`;
  const resultTitle =
    game.result.status === 'draw'
      ? 'Draw match'
      : opponent === 'ai'
        ? game.result.winner === game.config.playerMark
          ? 'You won the match'
          : 'You lost the match'
        : `${game.result.winner} won the match`;
  const resultMessage =
    game.result.status === 'draw'
      ? 'Nobody lost this one. Reset the board and run it back.'
      : opponent === 'ai'
        ? game.result.winner === game.config.playerMark
          ? `${game.config.aiMark} lost. Nice finish.`
          : `${game.config.playerMark} lost. The comeback button is right there.`
        : `${game.result.winner} wins. ${game.result.winner === 'X' ? 'O' : 'X'} lost the match.`;
  const activeMoves = game.modeState.infinite.activeMoves;
  const expiringIndices =
    game.config.mode === 'infinite'
      ? (['X', 'O'] as const)
          .map((player) =>
            activeMoves[player].length >= game.modeState.infinite.maxActiveMarks ? activeMoves[player][0]?.index : undefined,
          )
          .filter((index): index is number => typeof index === 'number')
      : [];

  useEffect(() => {
    if (game.config.mode !== 'timed' || game.result.status !== 'playing') return undefined;

    const timer = window.setInterval(() => {
      setTick(Date.now());
      checkTimer();
    }, 250);

    return () => window.clearInterval(timer);
  }, [checkTimer, game.config.mode, game.result.status, game.modeState.timed.turnDeadline]);

  useEffect(() => {
    if (game.result.status !== 'playing') showInterstitial();
  }, [game.result.status, showInterstitial]);

  const returnHome = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr_20rem]">
      <AnimatePresence>
        {game.result.status !== 'playing' && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-ink/78 px-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-result-title"
          >
            <motion.div
              className="w-full max-w-md rounded-[2rem] border border-white/12 bg-[#111827] p-6 text-center shadow-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
            >
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gold text-ink shadow-neon">
                <Sparkles size={28} />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-aqua">Match Complete</p>
              <h2 id="match-result-title" className="mt-2 text-4xl font-black">
                {resultTitle}
              </h2>
              <p className="mt-3 text-white/62">{resultMessage}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-aqua px-5 py-3 font-black text-ink">
                  <RotateCcw size={18} />
                  Reset
                </button>
                <button
                  onClick={returnHome}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black text-white"
                >
                  <Home size={18} />
                  Return
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        <GameBoard
          board={game.board}
          size={game.config.size}
          winningLine={game.result.winningLine}
          expiredIndex={game.modeState.infinite.expiredMove?.index}
          expiringIndices={expiringIndices}
          infinite={game.config.mode === 'infinite'}
          onMove={playMove}
        />

        <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
          {game.config.mode === 'timed' && (
            <div className="rounded-2xl bg-white/7 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Timer</p>
              <p className="mt-1 text-3xl font-black text-gold">{timeRemaining ?? game.modeState.timed.turnSeconds}s</p>
            </div>
          )}
          {game.config.mode === 'streak' && (
            <>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Streak</p>
                <p className="mt-1 text-3xl font-black text-aqua">{currentStreak}</p>
              </div>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Best</p>
                <p className="mt-1 text-3xl font-black text-gold">{bestStreak}</p>
              </div>
            </>
          )}
          {game.config.mode === 'tournament' && (
            <>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Round</p>
                <p className="mt-1 text-3xl font-black text-aqua">{tournamentRound}</p>
              </div>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Best of 3</p>
                <p className="mt-1 text-3xl font-black text-gold">
                  X {tournamentScores.X} - {tournamentScores.O} O
                </p>
              </div>
            </>
          )}
          {game.config.mode === 'infinite' && (
            <>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Infinite</p>
                <p className="mt-1 text-sm font-black text-aqua">Latest 3 marks stay active</p>
              </div>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">X Active</p>
                <p className="mt-1 text-3xl font-black text-aqua">{activeMoves.X.length}/3</p>
              </div>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">O Active</p>
                <p className="mt-1 text-3xl font-black text-rose">{activeMoves.O.length}/3</p>
              </div>
            </>
          )}
        </div>

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
          <AdPlaceholder label="In-feed AdSense slot" placement="game_feed" format="fluid" />
          {game.history.length === 0 && <p className="text-white/55">Make the opening move.</p>}
          {game.modeState.infinite.expiredMove && (
            <div className="rounded-2xl border border-rose/40 bg-rose/10 px-4 py-3 text-rose">
              {game.modeState.infinite.expiredMove.player}'s oldest mark faded from {game.modeState.infinite.expiredMove.index + 1}
            </div>
          )}
          {game.config.mode === 'infinite' &&
            expiringIndices.map((index) => (
              <div key={`expiring-${index}`} className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-gold">
                Cell {index + 1} is next to fade when that player moves again.
              </div>
            ))}
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
