import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useAuthStore } from '../store/authStore';
import { useScoreStore } from '../store/scoreStore';
import { theme } from '../theme';

export const LeaderboardScreen = () => {
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
    <Screen>
      <Text style={styles.title}>Local Scoreboard</Text>
      <Text style={styles.body}>Scores are cached on this device only. No database is used.</Text>
      {entries.length === 0 && <Text style={styles.empty}>Play a match to create your first score.</Text>}
      {entries.map((leader, index) => {
        const winRate = leader.games > 0 ? Math.round((leader.wins / leader.games) * 100) : 0;
        return (
          <View key={leader.userId} style={styles.row}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{leader.name}</Text>
              <Text style={styles.record}>
                {leader.wins}W / {leader.losses}L / {leader.draws}D
              </Text>
            </View>
            <Text style={styles.score}>
              {leader.score} pts{'\n'}
              {winRate}%
            </Text>
          </View>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 38, fontWeight: '900' },
  body: { color: theme.colors.muted, lineHeight: 22 },
  empty: { borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, color: theme.colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', padding: 16 },
  rank: { color: theme.colors.aqua, fontSize: 20, fontWeight: '900', width: 42 },
  nameBlock: { flex: 1 },
  name: { color: theme.colors.text, fontSize: 18, fontWeight: '900' },
  record: { marginTop: 4, color: theme.colors.muted, fontWeight: '700' },
  score: { color: theme.colors.muted, fontWeight: '900', textAlign: 'right' },
});
