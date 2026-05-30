import { useEffect, useState } from 'react';
import { formatPercent } from '@tictactoe/utils';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useScoreStore } from '../store/scoreStore';

export const ProfilePage = () => {
  const { gamesPlayed, wins } = useGameStore();
  const { resetLocalUser, setName, user } = useAuthStore();
  const { entries, resetScores, syncLocalName } = useScoreStore();
  const [draftName, setDraftName] = useState(user?.name ?? '');
  const winRate = gamesPlayed > 0 ? wins / gamesPlayed : 0;
  const displayName = user?.name ?? 'Local Player';
  const localScore = entries.find((entry) => entry.userId === user?.id);
  const saveName = () => {
    setName(draftName);
    syncLocalName();
  };

  useEffect(() => {
    setDraftName(user?.name ?? '');
  }, [user?.name]);

  return (
    <section className="glass rounded-[2rem] p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="grid size-28 place-items-center overflow-hidden rounded-[2rem] bg-rose text-4xl font-black">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="mt-2 text-4xl font-black">{displayName}</h1>
          <p className="mt-2 text-white/60">Your player and scoreboard are stored only in this browser cache.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder={displayName}
              className="rounded-full border border-white/12 bg-white/8 px-5 py-2 font-bold text-white outline-none focus:border-aqua"
            />
            <button onClick={saveName} className="rounded-full bg-aqua px-5 py-2 font-black text-ink">
              Save name
            </button>
            <button onClick={resetLocalUser} className="rounded-full bg-white/8 px-5 py-2 font-bold text-white/75">
              New local user
            </button>
            <button onClick={resetScores} className="rounded-full border border-white/12 px-5 py-2 font-bold text-white">
              Reset score
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ['XP', 420],
          ['Score', localScore?.score ?? 0],
          ['Games', localScore?.games ?? gamesPlayed],
          ['Win Rate', formatPercent(localScore && localScore.games > 0 ? localScore.wins / localScore.games : winRate)],
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
