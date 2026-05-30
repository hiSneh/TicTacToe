import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DIFFICULTY_LABELS } from '@tictactoe/game-engine';
import type { Difficulty, GameMode } from '@tictactoe/game-engine';
import { GameBoard } from '../components/GameBoard';
import { Panel, Screen } from '../components/Screen';
import { SegmentedButtons } from '../components/SegmentedButtons';
import { BannerAdSlot } from '../ads/BannerAdSlot';
import { useInterstitialAd } from '../ads/hooks';
import { useGameStore } from '../store/gameStore';
import { theme } from '../theme';

const modes: Array<{ label: string; value: GameMode }> = [
  { label: '3x3', value: 'classic' },
  { label: '4x4', value: 'fourByFour' },
  { label: 'Timed', value: 'timed' },
  { label: 'Streak', value: 'streak' },
  { label: 'Cup', value: 'tournament' },
  { label: 'Infinite', value: 'infinite' },
];

const difficulties = Object.keys(DIFFICULTY_LABELS).map((key) => ({
  value: key as Difficulty,
  label: DIFFICULTY_LABELS[key as Difficulty],
}));

export const GameScreen = () => {
  const [tick, setTick] = useState(Date.now());
  const navigation = useNavigation<{ navigate: (screen: 'Home') => void }>();
  const showInterstitial = useInterstitialAd('game_complete');
  const {
    game,
    opponent,
    playMove,
    reset,
    setDifficulty,
    setMode,
    setOpponent,
    checkTimer,
    currentStreak,
    bestStreak,
    tournamentRound,
    tournamentScores,
  } = useGameStore();
  const timeRemaining = useMemo(() => {
    if (game.config.mode !== 'timed' || !game.modeState.timed.turnDeadline || game.result.status !== 'playing') return null;
    return Math.max(0, Math.ceil((game.modeState.timed.turnDeadline - tick) / 1000));
  }, [game.config.mode, game.modeState.timed.turnDeadline, game.result.status, tick]);
  const status =
    game.result.status === 'won'
      ? game.result.reason === 'timeout'
        ? `${game.result.winner} wins on time`
        : `${game.result.winner} wins`
      : game.result.status === 'draw'
        ? 'Draw game'
      : `${game.currentPlayer}'s turn`;
  const resultTitle =
    game.result.status === 'draw'
      ? 'Draw match'
      : opponent === 'ai'
        ? game.result.winner === game.config.playerMark
          ? 'You won the match'
          : 'You lost the match'
        : `${game.result.winner} won the match`;
  const resultMessage =
    game.result.status === 'draw'
      ? 'Nobody lost this one. Reset the board and run it back.'
      : opponent === 'ai'
        ? game.result.winner === game.config.playerMark
          ? `${game.config.aiMark} lost. Nice finish.`
          : `${game.config.playerMark} lost. The comeback button is right there.`
        : `${game.result.winner} wins. ${game.result.winner === 'X' ? 'O' : 'X'} lost the match.`;
  const activeMoves = game.modeState.infinite.activeMoves;
  const expiringIndices =
    game.config.mode === 'infinite'
      ? (['X', 'O'] as const)
          .map((player) =>
            activeMoves[player].length >= game.modeState.infinite.maxActiveMarks ? activeMoves[player][0]?.index : undefined,
          )
          .filter((index): index is number => typeof index === 'number')
      : [];

  useEffect(() => {
    if (game.config.mode !== 'timed' || game.result.status !== 'playing') return undefined;

    const timer = setInterval(() => {
      setTick(Date.now());
      checkTimer();
    }, 250);

    return () => clearInterval(timer);
  }, [checkTimer, game.config.mode, game.result.status, game.modeState.timed.turnDeadline]);

  useEffect(() => {
    if (game.result.status !== 'playing') showInterstitial();
  }, [game.result.status, showInterstitial]);

  const returnHome = () => {
    reset();
    navigation.navigate('Home');
  };

  return (
    <Screen>
      <Modal animationType="fade" transparent visible={game.result.status !== 'playing'} onRequestClose={reset}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>XO</Text>
            </View>
            <Text style={styles.modalKicker}>Match Complete</Text>
            <Text style={styles.modalTitle}>{resultTitle}</Text>
            <Text style={styles.modalBody}>{resultMessage}</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.primaryAction} onPress={reset}>
                <Text style={styles.primaryActionText}>Reset</Text>
              </Pressable>
              <Pressable style={styles.secondaryAction} onPress={returnHome}>
                <Text style={styles.secondaryActionText}>Return</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
        <GameBoard
          board={game.board}
          size={game.config.size}
          winningLine={game.result.winningLine}
          expiredIndex={game.modeState.infinite.expiredMove?.index}
          expiringIndices={expiringIndices}
          infinite={game.config.mode === 'infinite'}
          onMove={playMove}
        />
        {game.config.mode === 'timed' && <Text style={styles.modeLine}>Timer: {timeRemaining ?? game.modeState.timed.turnSeconds}s</Text>}
        {game.config.mode === 'streak' && (
          <Text style={styles.modeLine}>
            Streak {currentStreak} | Best {bestStreak}
          </Text>
        )}
        {game.config.mode === 'tournament' && (
          <Text style={styles.modeLine}>
            Round {tournamentRound} | X {tournamentScores.X} - {tournamentScores.O} O
          </Text>
        )}
        {game.config.mode === 'infinite' && (
          <View style={styles.infiniteStrip}>
            <Text style={styles.infiniteBadge}>Infinite</Text>
            <Text style={styles.modeLine}>
              X {activeMoves.X.length}/3 | O {activeMoves.O.length}/3
            </Text>
          </View>
        )}
      </Panel>

      <Panel>
        <BannerAdSlot />
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
  modeLine: { marginTop: 14, color: theme.colors.muted, fontWeight: '900' },
  infiniteStrip: {
    marginTop: 14,
    borderRadius: 18,
    padding: 12,
    backgroundColor: 'rgba(65, 244, 211, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(65, 244, 211, 0.22)',
  },
  infiniteBadge: { color: theme.colors.aqua, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  section: { marginTop: 16, marginBottom: 8, color: theme.colors.muted, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(8, 10, 18, 0.82)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gold,
  },
  modalIconText: { color: theme.colors.ink, fontWeight: '900', fontSize: 20 },
  modalKicker: { marginTop: 18, color: theme.colors.aqua, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  modalTitle: { marginTop: 8, color: theme.colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center' },
  modalBody: { marginTop: 10, color: theme.colors.muted, lineHeight: 22, textAlign: 'center' },
  modalActions: { marginTop: 22, flexDirection: 'row', gap: 12 },
  primaryAction: { flex: 1, alignItems: 'center', borderRadius: 18, backgroundColor: theme.colors.aqua, paddingVertical: 14 },
  primaryActionText: { color: theme.colors.ink, fontWeight: '900' },
  secondaryAction: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
  },
  secondaryActionText: { color: theme.colors.text, fontWeight: '900' },
});
