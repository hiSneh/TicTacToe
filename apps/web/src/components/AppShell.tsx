import { Gamepad2, Gift, Medal, Settings, Swords, Trophy, User, Zap } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { cx } from '@tictactoe/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Zap },
  { to: '/game', label: 'Play', icon: Gamepad2 },
  { to: '/lobby', label: 'Lobby', icon: Swords },
  { to: '/tournament', label: 'Cup', icon: Trophy },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/leaderboard', label: 'Ranks', icon: Medal },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const AppShell = () => (
  <div className="min-h-screen px-4 py-4 text-white md:px-8">
    <header className="mx-auto flex max-w-7xl items-center justify-between py-3">
      <NavLink to="/" className="flex items-center gap-3 font-black tracking-wide">
        <span className="grid size-10 place-items-center rounded-2xl bg-aqua text-ink shadow-neon">XO</span>
        <span>Neon Arena</span>
      </NavLink>
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 md:flex">
        <span className="size-2 rounded-full bg-aqua" />
        Multiplayer-ready
      </div>
    </header>

    <main className="mx-auto max-w-7xl pb-28 pt-4 md:pb-8">
      <Outlet />
    </main>

    <nav className="fixed inset-x-3 bottom-3 z-30 mx-auto grid max-w-4xl grid-cols-8 gap-1 rounded-[1.5rem] border border-white/10 bg-ink/88 p-2 shadow-2xl backdrop-blur-xl">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cx(
              'flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] text-white/58 transition hover:bg-white/8 hover:text-white',
              isActive && 'bg-white/12 text-aqua shadow-neon',
            )
          }
          aria-label={label}
        >
          <Icon size={19} />
          <span className="hidden sm:inline">{label}</span>
        </NavLink>
      ))}
    </nav>
  </div>
);
