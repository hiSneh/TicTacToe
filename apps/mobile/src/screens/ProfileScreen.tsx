import { StyleSheet, Text, View } from 'react-native';
import { Panel, Screen } from '../components/Screen';
import { useGameStore } from '../store/gameStore';
import { theme } from '../theme';

export const ProfileScreen = () => {
  const { gamesPlayed, wins } = useGameStore();

  return (
    <Screen>
      <Panel>
        <View style={styles.avatar}><Text style={styles.avatarText}>GX</Text></View>
        <Text style={styles.kicker}>Guest Mode</Text>
        <Text style={styles.title}>Guest Challenger</Text>
        <Text style={styles.body}>Anonymous, Google, and Apple auth slots are prepared for Firebase integration.</Text>
      </Panel>
      <View style={styles.stats}>
        <Panel><Text style={styles.value}>{gamesPlayed}</Text><Text style={styles.label}>Games</Text></Panel>
        <Panel><Text style={styles.value}>{wins}</Text><Text style={styles.label}>Wins</Text></Panel>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  avatar: { width: 92, height: 92, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.rose },
  avatarText: { color: theme.colors.text, fontSize: 32, fontWeight: '900' },
  kicker: { marginTop: 18, color: theme.colors.aqua, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  title: { marginTop: 6, color: theme.colors.text, fontSize: 34, fontWeight: '900' },
  body: { marginTop: 10, color: theme.colors.muted, lineHeight: 22 },
  stats: { flexDirection: 'row', gap: 12 },
  value: { color: theme.colors.text, fontSize: 32, fontWeight: '900' },
  label: { color: theme.colors.muted },
});
