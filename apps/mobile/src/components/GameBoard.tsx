import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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

export const GameBoard = ({ board, size, winningLine, expiredIndex, expiringIndices = [], infinite, onMove }: GameBoardProps) => {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 68, size === 3 ? 360 : 380);
  const gap = 10;
  const boardPadding = infinite ? 4 : 0;
  const innerBoardSize = boardSize - boardPadding * 2;
  const cellSize = Math.floor((innerBoardSize - gap * (size - 1)) / size);
  const markSize = size === 3 ? 50 : 40;

  return (
    <View style={[styles.board, infinite && styles.infiniteBoard, { width: boardSize, padding: boardPadding, gap }]}>
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
              width: cellSize,
              height: cellSize,
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
          <View style={styles.markCenter}>
            <Text style={[styles.mark, { fontSize: markSize, lineHeight: markSize }, cell === 'X' ? styles.x : styles.o]}>{cell}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(249, 213, 110, 0.11)',
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  markCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    fontWeight: '900',
    color: theme.colors.text,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  x: {
    color: theme.colors.aqua,
  },
  o: {
    color: theme.colors.rose,
  },
});
