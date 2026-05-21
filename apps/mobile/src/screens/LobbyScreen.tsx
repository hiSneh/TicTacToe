import { Pressable, StyleSheet, Text } from 'react-native';
import { Panel, Screen } from '../components/Screen';
import { theme } from '../theme';

export const LobbyScreen = () => (
  <Screen>
    <Panel>
      <Text style={styles.title}>Multiplayer Lobby</Text>
      <Text style={styles.body}>Room creation and move sync are ready to connect to Firebase in phase 6.</Text>
      <Pressable style={styles.button}><Text style={styles.buttonText}>Create Room</Text></Pressable>
      <Pressable style={styles.secondary}><Text style={styles.secondaryText}>Join Code</Text></Pressable>
    </Panel>
  </Screen>
);

const styles = StyleSheet.create({
  title: { color: theme.colors.text, fontSize: 34, fontWeight: '900' },
  body: { marginTop: 12, color: theme.colors.muted, lineHeight: 22 },
  button: { marginTop: 22, borderRadius: 18, backgroundColor: theme.colors.aqua, padding: 16, alignItems: 'center' },
  buttonText: { color: theme.colors.ink, fontWeight: '900' },
  secondary: { marginTop: 10, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, alignItems: 'center' },
  secondaryText: { color: theme.colors.text, fontWeight: '900' },
});
