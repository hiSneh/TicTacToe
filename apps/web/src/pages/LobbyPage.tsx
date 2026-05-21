import { Copy, Plus } from 'lucide-react';

export const LobbyPage = () => (
  <section className="glass rounded-[2rem] p-6">
    <h1 className="text-4xl font-black">Multiplayer Lobby</h1>
    <p className="mt-3 max-w-2xl text-white/60">Room APIs are represented by the shared multiplayer adapter and ready for Firebase transport in phase 6.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <button className="flex items-center justify-center gap-3 rounded-2xl bg-aqua px-6 py-5 font-black text-ink">
        <Plus size={20} /> Create Room
      </button>
      <button className="flex items-center justify-center gap-3 rounded-2xl bg-white/8 px-6 py-5 font-black text-white">
        <Copy size={20} /> Join Code
      </button>
    </div>
  </section>
);
