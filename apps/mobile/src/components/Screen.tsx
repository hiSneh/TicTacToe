import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const Screen = ({ children }: PropsWithChildren) => (
  <LinearGradient colors={['#080a12', '#15182a', '#090b18']} style={styles.root}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  </LinearGradient>
);

export const Panel = ({ children }: PropsWithChildren) => <View style={styles.panel}>{children}</View>;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 58,
    paddingBottom: 120,
    gap: 18,
  },
  panel: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(17,24,39,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
});
