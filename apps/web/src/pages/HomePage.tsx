import { ArrowRight, Bot, Clock, Flame, Grid2X2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdPlaceholder } from '../components/AdPlaceholder';
import { StatPill } from '../components/StatPill';
import { useGameStore } from '../store/gameStore';

export const HomePage = () => {
  const { gamesPlayed, wins, losses } = useGameStore();
  const modes = [
    { label: 'Classic 3x3', icon: Grid2X2 },
    { label: '4x4 Grid', icon: Bot },
    { label: 'Timed Duel', icon: Clock },
    { label: 'Win Streak', icon: Flame },
    { label: 'Tournament', icon: Trophy },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="glass rounded-[2rem] p-6 md:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-aqua">Daily Arena</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-none md:text-7xl">TicTacToe with teeth.</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/65">
          Train against human-like AI, chase streaks, and warm up for multiplayer rooms from a single shared engine.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/game" className="inline-flex items-center gap-2 rounded-full bg-aqua px-6 py-3 font-black text-ink shadow-neon">
            Play now <ArrowRight size={18} />
          </Link>
          <Link to="/tournament" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-6 py-3 font-bold text-white">
            Tournament
          </Link>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Games" value={gamesPlayed} />
          <StatPill label="Wins" value={wins} />
          <StatPill label="Losses" value={losses} />
        </div>
        <div className="glass rounded-[2rem] p-5">
          <h2 className="text-xl font-black">Modes</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {modes.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/7 p-4 text-white/80">
                <Icon className="text-aqua" size={20} />
                <span className="font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <AdPlaceholder label="Responsive AdSense slot placeholder" />
      </section>
    </div>
  );
};
