import { useGameStore } from '../store/gameStore';

export const StatsPage = () => {
  const { gamesPlayed, losses, wins } = useGameStore();

  return (
    <section className="glass rounded-[2rem] p-6">
      <h1 className="text-4xl font-black">Statistics</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ['Games played', gamesPlayed],
          ['Wins', wins],
          ['Losses', losses],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/7 p-6">
            <p className="text-white/50">{label}</p>
            <p className="mt-3 text-5xl font-black">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
