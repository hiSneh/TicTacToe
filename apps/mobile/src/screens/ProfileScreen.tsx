import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Panel, Screen } from '../components/Screen';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useScoreStore } from '../store/scoreStore';
import { theme } from '../theme';

export const ProfileScreen = () => {
  const { gamesPlayed, wins } = useGameStore();
  const { resetLocalUser, setName, user } = useAuthStore();
  const { entries, resetScores, syncLocalName } = useScoreStore();
  const [draftName, setDraftName] = useState(user?.name ?? '');
  const displayName = user?.name ?? 'Local Player';
  const localScore = entries.find((entry) => entry.userId === user?.id);
  const winRate = localScore && localScore.games > 0 ? Math.round((localScore.wins / localScore.games) * 100) : gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  useEffect(() => {
    setDraftName(user?.name ?? '');
  }, [user?.name]);

  const saveName = () => {
    setName(draftName);
    syncLocalName();
  };

  return (
    <Screen>
      <Panel>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{displayName}</Text>
        <Text style={styles.body}>Your player and scoreboard are stored only in this device cache.</Text>
        <TextInput value={draftName} onChangeText={setDraftName} placeholder={displayName} placeholderTextColor={theme.colors.muted} style={styles.nameInput} />
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={saveName}>
            <Text style={styles.primaryText}>Save name</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={resetLocalUser}>
            <Text style={styles.secondaryText}>New user</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={resetScores}>
            <Text style={styles.secondaryText}>Reset score</Text>
          </Pressable>
        </View>
      </Panel>
      <View style={styles.stats}>
        <Panel>
          <Text style={styles.value}>{localScore?.games ?? gamesPlayed}</Text>
          <Text style={styles.label}>Games</Text>
        </Panel>
        <Panel>
          <Text style={styles.value}>{localScore?.score ?? 0}</Text>
          <Text style={styles.label}>Score</Text>
        </Panel>
        <Panel>
          <Text style={styles.value}>{winRate}%</Text>
          <Text style={styles.label}>Win Rate</Text>
        </Panel>
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
  nameInput: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: '900',
  },
  actions: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  primaryButton: { borderRadius: 18, backgroundColor: theme.colors.aqua, paddingHorizontal: 16, paddingVertical: 12 },
  primaryText: { color: theme.colors.ink, fontWeight: '900' },
  secondaryButton: { borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 12 },
  secondaryText: { color: theme.colors.text, fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  value: { color: theme.colors.text, fontSize: 32, fontWeight: '900' },
  label: { color: theme.colors.muted },
});
