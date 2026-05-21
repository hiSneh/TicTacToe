import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { themes } from '@tictactoe/ui';
import type { ThemeId } from '@tictactoe/ui';
import { Panel, Screen } from '../components/Screen';
import { theme as appTheme } from '../theme';

export const SettingsScreen = () => {
  const [theme, setTheme] = useState<ThemeId>('neon');
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <Panel>
        <Text style={styles.section}>Themes</Text>
        <View style={styles.themeGrid}>
          {Object.values(themes).map((item) => (
            <Pressable key={item.id} onPress={() => setTheme(item.id)} style={[styles.themeButton, theme === item.id && styles.activeTheme]}>
              <View style={[styles.swatch, { backgroundColor: item.accent }]} />
              <Text style={styles.themeLabel}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.toggle} onPress={() => setSound((value) => !value)}>
          <Text style={styles.toggleText}>Sound</Text>
          <Text style={styles.toggleState}>{sound ? 'On' : 'Off'}</Text>
        </Pressable>
        <Pressable style={styles.toggle} onPress={() => setHaptics((value) => !value)}>
          <Text style={styles.toggleText}>Haptics</Text>
          <Text style={styles.toggleState}>{haptics ? 'On' : 'Off'}</Text>
        </Pressable>
      </Panel>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { color: appTheme.colors.text, fontSize: 38, fontWeight: '900' },
  section: { color: appTheme.colors.muted, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  themeGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeButton: { width: '47%', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  activeTheme: { borderColor: appTheme.colors.aqua },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  themeLabel: { marginTop: 10, color: appTheme.colors.text, fontWeight: '900' },
  toggle: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', padding: 16 },
  toggleText: { color: appTheme.colors.text, fontWeight: '900' },
  toggleState: { color: appTheme.colors.aqua, fontWeight: '900' },
});
