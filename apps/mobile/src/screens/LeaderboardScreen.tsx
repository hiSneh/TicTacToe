import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { theme } from '../theme';

const leaders = ['Nova', 'Cipher', 'Pixel', 'Rook', 'Vega'];

export const LeaderboardScreen = () => (
  <Screen>
    <Text style={styles.title}>Leaderboard</Text>
    {leaders.map((name, index) => (
      <View key={name} style={styles.row}>
        <Text style={styles.rank}>#{index + 1}</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.score}>{2400 - index * 185}</Text>
      </View>
    ))}
  </Screen>
);

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 38, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', padding: 16 },
  rank: { color: theme.colors.aqua, fontSize: 20, fontWeight: '900', width: 42 },
  name: { flex: 1, color: theme.colors.text, fontSize: 18, fontWeight: '900' },
  score: { color: theme.colors.muted, fontWeight: '900' },
});
