import { Gift } from 'lucide-react';

export const DailyRewardsPage = () => (
  <section className="glass rounded-[2rem] p-6">
    <h1 className="text-4xl font-black">Daily Rewards</h1>
    <div className="mt-6 grid gap-4 md:grid-cols-7">
      {Array.from({ length: 7 }).map((_, index) => (
        <button key={index} className="rounded-2xl bg-white/7 p-5 text-center transition hover:bg-white/12">
          <Gift className="mx-auto text-gold" />
          <span className="mt-3 block font-black">Day {index + 1}</span>
          <span className="text-sm text-white/50">{100 + index * 25} XP</span>
        </button>
      ))}
    </div>
  </section>
);
