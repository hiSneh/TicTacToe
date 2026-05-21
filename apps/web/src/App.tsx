import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DailyRewardsPage } from './pages/DailyRewardsPage';
import { GamePage } from './pages/GamePage';
import { HomePage } from './pages/HomePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LobbyPage } from './pages/LobbyPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SplashPage } from './pages/SplashPage';
import { StatsPage } from './pages/StatsPage';
import { TournamentPage } from './pages/TournamentPage';

export const App = () => (
  <Routes>
    <Route path="/splash" element={<SplashPage />} />
    <Route element={<AppShell />}>
      <Route index element={<HomePage />} />
      <Route path="game" element={<GamePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="leaderboard" element={<LeaderboardPage />} />
      <Route path="rewards" element={<DailyRewardsPage />} />
      <Route path="statistics" element={<StatsPage />} />
      <Route path="lobby" element={<LobbyPage />} />
      <Route path="tournament" element={<TournamentPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
