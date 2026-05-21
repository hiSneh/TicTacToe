import { StyleSheet, Text, View } from 'react-native';
import { Panel, Screen } from '../components/Screen';
import { theme } from '../theme';

export const RewardsScreen = () => (
  <Screen>
    <Text style={styles.title}>Daily Rewards</Text>
    <View style={styles.grid}>
      {Array.from({ length: 7 }).map((_, index) => (
        <View key={index} style={styles.reward}>
          <Text style={styles.day}>Day {index + 1}</Text>
          <Text style={styles.xp}>{100 + index * 25} XP</Text>
        </View>
      ))}
    </View>
    <Panel>
      <Text style={styles.body}>Rewarded ad hooks will unlock hints, streak saves, and seasonal themes in phase 5.</Text>
    </Panel>
  </Screen>
);

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 38, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reward: { width: '30%', minWidth: 96, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', padding: 14 },
  day: { color: theme.colors.text, fontWeight: '900' },
  xp: { marginTop: 6, color: theme.colors.gold },
  body: { color: theme.colors.muted, lineHeight: 22 },
});
