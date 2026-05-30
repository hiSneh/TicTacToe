import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Panel, Screen } from '../components/Screen';
import { useRewardedAd } from '../ads/hooks';
import { theme } from '../theme';

export const RewardsScreen = () => {
  const showRewarded = useRewardedAd('daily_bonus');

  return (
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
        <Text style={styles.body}>Watch a rewarded ad to boost the daily bonus, unlock hints, or save a streak.</Text>
        <Pressable style={styles.button} onPress={showRewarded}>
          <Text style={styles.buttonText}>Watch bonus ad</Text>
        </Pressable>
      </Panel>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 38, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reward: { width: '30%', minWidth: 96, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', padding: 14 },
  day: { color: theme.colors.text, fontWeight: '900' },
  xp: { marginTop: 6, color: theme.colors.gold },
  body: { color: theme.colors.muted, lineHeight: 22 },
  button: { marginTop: 16, alignItems: 'center', borderRadius: 18, backgroundColor: theme.colors.aqua, paddingVertical: 14 },
  buttonText: { color: theme.colors.ink, fontWeight: '900' },
});
