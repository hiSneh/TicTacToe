import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Board } from '@tictactoe/game-engine';
import { theme } from '../theme';

interface GameBoardProps {
  board: Board;
  size: 3 | 4;
  winningLine: number[];
  expiredIndex?: number | null;
  expiringIndices?: number[];
  infinite?: boolean;
  onMove: (index: number) => void;
}

export const GameBoard = ({ board, size, winningLine, expiredIndex, expiringIndices = [], infinite, onMove }: GameBoardProps) => (
  <View style={[styles.board, infinite && styles.infiniteBoard, { maxWidth: size === 3 ? 360 : 380 }]}>
    {board.map((cell, index) => (
      <Pressable
        key={index}
        disabled={Boolean(cell)}
        onPress={() => {
          Haptics.selectionAsync();
          onMove(index);
        }}
        style={({ pressed }) => [
          styles.cell,
          {
            width: `${100 / size - 2}%`,
            aspectRatio: 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
          winningLine.includes(index) && styles.winningCell,
          expiringIndices.includes(index) && styles.expiringCell,
          expiredIndex === index && styles.expiredCell,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          cell
            ? expiringIndices.includes(index)
              ? `${cell} in cell ${index + 1}, next to fade`
              : `${cell} in cell ${index + 1}`
            : `Empty cell ${index + 1}`
        }
      >
        <Text style={[styles.mark, cell === 'X' ? styles.x : styles.o]}>{cell}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  winningCell: {
    borderColor: theme.colors.gold,
    backgroundColor: 'rgba(249, 213, 110, 0.12)',
  },
  infiniteBoard: {
    borderRadius: 24,
    padding: 4,
    backgroundColor: 'rgba(65, 244, 211, 0.04)',
  },
  expiredCell: {
    borderColor: theme.colors.rose,
    backgroundColor: 'rgba(255, 79, 216, 0.14)',
  },
  expiringCell: {
    borderColor: theme.colors.gold,
    backgroundColor: 'rgba(249, 213, 110, 0.16)',
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  mark: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.text,
  },
  x: {
    color: theme.colors.aqua,
  },
  o: {
    color: theme.colors.rose,
  },
});
