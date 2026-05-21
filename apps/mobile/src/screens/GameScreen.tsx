import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DIFFICULTY_LABELS } from '@tictactoe/game-engine';
import type { Difficulty, GameMode } from '@tictactoe/game-engine';
import { GameBoard } from '../components/GameBoard';
import { Panel, Screen } from '../components/Screen';
import { SegmentedButtons } from '../components/SegmentedButtons';
import { useGameStore } from '../store/gameStore';
import { theme } from '../theme';

const modes: Array<{ label: string; value: GameMode }> = [
  { label: '3x3', value: 'classic' },
  { label: '4x4', value: 'fourByFour' },
  { label: 'Timed', value: 'timed' },
  { label: 'Streak', value: 'streak' },
];

const difficulties = Object.keys(DIFFICULTY_LABELS).map((key) => ({
  value: key as Difficulty,
  label: DIFFICULTY_LABELS[key as Difficulty],
}));

export const GameScreen = () => {
  const { game, opponent, playMove, reset, setDifficulty, setMode, setOpponent } = useGameStore();
  const status =
    game.result.status === 'won'
      ? `${game.result.winner} wins`
      : game.result.status === 'draw'
        ? 'Draw game'
        : `${game.currentPlayer}'s turn`;

  return (
    <Screen>
      <Panel>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Live Match</Text>
            <Text style={styles.title}>{status}</Text>
          </View>
          <Pressable style={styles.reset} onPress={reset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>
        <GameBoard board={game.board} size={game.config.size} winningLine={game.result.winningLine} onMove={playMove} />
      </Panel>

      <Panel>
        <Text style={styles.section}>Mode</Text>
        <SegmentedButtons options={modes} value={game.config.mode} onChange={setMode} />
        <Text style={styles.section}>Opponent</Text>
        <SegmentedButtons
          options={[
            { label: 'AI', value: 'ai' },
            { label: 'Local', value: 'local' },
          ]}
          value={opponent}
          onChange={setOpponent}
        />
        <Text style={styles.section}>Difficulty</Text>
        <SegmentedButtons options={difficulties} value={game.config.difficulty} onChange={setDifficulty} />
      </Panel>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 },
  kicker: { color: theme.colors.aqua, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  title: { marginTop: 4, color: theme.colors.text, fontSize: 30, fontWeight: '900' },
  reset: { borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 12 },
  resetText: { color: theme.colors.text, fontWeight: '900' },
  section: { marginTop: 16, marginBottom: 8, color: theme.colors.muted, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
});
