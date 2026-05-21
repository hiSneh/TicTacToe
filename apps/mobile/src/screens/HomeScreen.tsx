import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootTabParamList } from '../../App';
import { Panel, Screen } from '../components/Screen';
import { theme } from '../theme';
import { useGameStore } from '../store/gameStore';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { gamesPlayed, wins } = useGameStore();

  return (
    <Screen>
      <Panel>
        <Text style={styles.kicker}>Daily Arena</Text>
        <Text style={styles.title}>TicTacToe with teeth.</Text>
        <Text style={styles.body}>Train against AI, keep streaks alive, and jump into tournament-ready modes.</Text>
        <Pressable style={styles.cta} onPress={() => navigation.navigate('Game')}>
          <Text style={styles.ctaText}>Play Now</Text>
        </Pressable>
      </Panel>
      <View style={styles.stats}>
        <Panel>
          <Text style={styles.statValue}>{gamesPlayed}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </Panel>
        <Panel>
          <Text style={styles.statValue}>{wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </Panel>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  kicker: { color: theme.colors.aqua, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  title: { marginTop: 12, color: theme.colors.text, fontSize: 42, lineHeight: 44, fontWeight: '900' },
  body: { marginTop: 12, color: theme.colors.muted, fontSize: 16, lineHeight: 23 },
  cta: { marginTop: 22, alignSelf: 'flex-start', borderRadius: 999, backgroundColor: theme.colors.aqua, paddingHorizontal: 22, paddingVertical: 14 },
  ctaText: { color: theme.colors.ink, fontWeight: '900' },
  stats: { flexDirection: 'row', gap: 12 },
  statValue: { color: theme.colors.text, fontSize: 32, fontWeight: '900' },
  statLabel: { color: theme.colors.muted, marginTop: 4 },
});
