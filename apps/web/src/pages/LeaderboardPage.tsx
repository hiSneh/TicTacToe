const leaders = ['Nova', 'Cipher', 'Pixel', 'Rook', 'Vega'].map((name, index) => ({
  name,
  score: 2400 - index * 185,
  winRate: 91 - index * 4,
}));

export const LeaderboardPage = () => (
  <section className="glass rounded-[2rem] p-6">
    <h1 className="text-4xl font-black">Leaderboard</h1>
    <div className="mt-6 space-y-3">
      {leaders.map((leader, index) => (
        <div key={leader.name} className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 rounded-2xl bg-white/7 p-4">
          <span className="text-2xl font-black text-aqua">#{index + 1}</span>
          <span className="font-black">{leader.name}</span>
          <span className="text-right text-white/65">{leader.score} pts · {leader.winRate}%</span>
        </div>
      ))}
    </div>
  </section>
);
