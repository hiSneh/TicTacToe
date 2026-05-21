import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedButtonsProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedButtons<T extends string>({ options, value, onChange }: SegmentedButtonsProps<T>) {
  return (
    <View style={styles.group}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.button, value === option.value && styles.active]}
        >
          <Text style={[styles.label, value === option.value && styles.activeLabel]}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  active: {
    backgroundColor: theme.colors.aqua,
  },
  label: {
    color: theme.colors.muted,
    fontWeight: '900',
  },
  activeLabel: {
    color: theme.colors.ink,
  },
});
