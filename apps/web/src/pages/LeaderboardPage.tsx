import { useEffect } from 'react';
import { formatPercent } from '@tictactoe/utils';
import { useAuthStore } from '../store/authStore';
import { useScoreStore } from '../store/scoreStore';

export const LeaderboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const entries = useScoreStore((state) => state.entries);
  const startScores = useScoreStore((state) => state.start);
  const syncLocalName = useScoreStore((state) => state.syncLocalName);

  useEffect(() => {
    if (!user) return;
    startScores();
    syncLocalName();
  }, [startScores, syncLocalName, user]);

  return (
    <section className="glass rounded-[2rem] p-6">
      <h1 className="text-4xl font-black">Local Scoreboard</h1>
      <p className="mt-2 text-white/60">Scores are cached on this device only. No database is used.</p>
      <div className="mt-6 space-y-3">
        {entries.length === 0 && <p className="rounded-2xl bg-white/7 p-4 text-white/60">Play a match to create your first score.</p>}
        {entries.map((leader, index) => {
          const winRate = leader.games > 0 ? leader.wins / leader.games : 0;
          return (
            <div key={leader.userId} className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 rounded-2xl bg-white/7 p-4">
              <span className="text-2xl font-black text-aqua">#{index + 1}</span>
              <div>
                <span className="font-black">{leader.name}</span>
                <p className="mt-1 text-sm text-white/45">
                  {leader.wins}W / {leader.losses}L / {leader.draws}D
                </p>
              </div>
              <span className="text-right text-white/65">
                {leader.score} pts · {formatPercent(winRate)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
