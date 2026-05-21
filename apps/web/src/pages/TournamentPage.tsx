export const TournamentPage = () => (
  <section className="glass rounded-[2rem] p-6">
    <h1 className="text-4xl font-black">Tournament</h1>
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {['Quarterfinal', 'Semifinal', 'Final'].map((round, index) => (
        <div key={round} className="rounded-2xl bg-white/7 p-5">
          <p className="text-aqua">Round {index + 1}</p>
          <h2 className="mt-2 text-2xl font-black">{round}</h2>
          <p className="mt-3 text-white/55">Best-of-three bracket slot ready for matchmaking.</p>
        </div>
      ))}
    </div>
  </section>
);
