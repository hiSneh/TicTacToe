export interface PlayerProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  xp: number;
  streak: number;
  unlockedThemes: string[];
}

export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  score: number;
  winRate: number;
  updatedAt: string;
}

export interface DailyReward {
  id: string;
  label: string;
  xp: number;
  claimed: boolean;
}
