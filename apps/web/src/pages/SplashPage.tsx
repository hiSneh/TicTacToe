import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const SplashPage = () => (
  <main className="grid min-h-screen place-items-center px-6 text-center text-white">
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
      <div className="mx-auto grid size-28 place-items-center rounded-[2rem] bg-aqua text-5xl font-black text-ink shadow-neon">
        XO
      </div>
      <div>
        <h1 className="text-5xl font-black md:text-7xl">Neon Arena</h1>
        <p className="mt-4 max-w-xl text-white/65">Fast, tactical TicTacToe built for streaks, rivals, and daily mastery.</p>
      </div>
      <Link to="/game" className="inline-flex rounded-full bg-aqua px-8 py-4 font-black text-ink shadow-neon">
        Enter Arena
      </Link>
    </motion.div>
  </main>
);
