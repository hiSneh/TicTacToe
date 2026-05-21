import { StyleSheet, Text, View } from 'react-native';
import { Panel, Screen } from '../components/Screen';
import { theme } from '../theme';

export const TournamentScreen = () => (
  <Screen>
    <Text style={styles.title}>Tournament</Text>
    {['Quarterfinal', 'Semifinal', 'Final'].map((round, index) => (
      <Panel key={round}>
        <View>
          <Text style={styles.kicker}>Round {index + 1}</Text>
          <Text style={styles.round}>{round}</Text>
          <Text style={styles.body}>Best-of-three bracket slot ready for matchmaking.</Text>
        </View>
      </Panel>
    ))}
  </Screen>
);

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 38, fontWeight: '900' },
  kicker: { color: theme.colors.aqua, fontWeight: '900' },
  round: { marginTop: 6, color: theme.colors.text, fontSize: 24, fontWeight: '900' },
  body: { marginTop: 8, color: theme.colors.muted },
});
