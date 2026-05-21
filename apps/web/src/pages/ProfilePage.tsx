import { formatPercent } from '@tictactoe/utils';
import { useGameStore } from '../store/gameStore';

export const ProfilePage = () => {
  const { gamesPlayed, wins } = useGameStore();
  const winRate = gamesPlayed > 0 ? wins / gamesPlayed : 0;

  return (
    <section className="glass rounded-[2rem] p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="grid size-28 place-items-center rounded-[2rem] bg-rose text-4xl font-black">GX</div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-aqua">Guest Mode</p>
          <h1 className="mt-2 text-4xl font-black">Guest Challenger</h1>
          <p className="mt-2 text-white/60">Anonymous and social sign-in hooks are reserved for Firebase phase.</p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ['XP', 420],
          ['Streak', 3],
          ['Games', gamesPlayed],
          ['Win Rate', formatPercent(winRate)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/7 p-5">
            <p className="text-white/45">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
