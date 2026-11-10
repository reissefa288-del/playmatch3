import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';

import {
  createPuzzleState,
  gridBounds,
  isLevelClear,
  lettersInOrder,
  shuffleOrder,
  slotsForWord,
  normalizeWord,
  spell,
  submitWord,
  type PuzzleLevel,
  type PuzzleState,
} from './engine';
import { buildRound } from './generate';
import { LetterWheel } from './letter-wheel';
import { loadProgress, saveProgress } from './progress';
import { PuzzleGrid } from './puzzle-grid';

const MATCH_SECONDS = 90;
const START_LIVES = 3;
const BOT_PORTRAIT = require('../home/assets/portrait.webp');

type Lane = {
  level: PuzzleLevel;
  puzzle: PuzzleState;
  selection: number[];
  lives: number;
  notice: string;
  claimed: string[];
};

type Phase = 'play' | 'end';

function makeLane(score = 0, lives = START_LIVES): Lane {
  const level = buildRound();
  const puzzle = createPuzzleState(level, score);
  return {
    level,
    puzzle: { ...puzzle, letterOrder: shuffleOrder(puzzle.letterOrder) },
    selection: [],
    lives,
    notice: '',
    claimed: [],
  };
}

function padScore(score: number): string {
  return String(Math.max(0, score)).padStart(4, '0');
}

function formatTime(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function WordGameScreen() {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');
  const [phase, setPhase] = useState<Phase>('play');
  const [seconds, setSeconds] = useState(MATCH_SECONDS);
  const [wave, setWave] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [matchId, setMatchId] = useState(0);
  const [best, setBest] = useState(0);
  const [laneWidth, setLaneWidth] = useState(170);
  const [player, setPlayer] = useState<Lane>(() => makeLane());
  const [bot, setBot] = useState<Lane>(() => makeLane());
  const playerRef = useRef(player);
  const botRef = useRef(bot);
  const phaseRef = useRef(phase);
  const advancing = useRef(false);
  playerRef.current = player;
  botRef.current = bot;
  phaseRef.current = phase;

  useEffect(() => {
    void loadProgress(1).then((saved) => setBest(saved.score));
  }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const timer = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setPhase('end');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, matchId]);

  useEffect(() => {
    if (phase !== 'end') return;
    const score = playerRef.current.puzzle.score;
    if (score <= best) return;
    setBest(score);
    void saveProgress({ levelIndex: 0, score, foundByLevel: {}, revealedByLevel: {} });
  }, [phase, best]);

  useEffect(() => {
    if (phase !== 'play' || advancing.current) return;
    const playerClear = isLevelClear(player.level, player.puzzle);
    const botClear = isLevelClear(bot.level, bot.puzzle);
    if (!playerClear && !botClear) return;
    advancing.current = true;
    if (playerClear) setPlayer(makeLane(player.puzzle.score, player.lives));
    if (botClear) setBot(makeLane(bot.puzzle.score, bot.lives));
    setWave((current) => current + 1);
    setSpeed((current) => Math.min(20, current + 1));
    advancing.current = false;
  }, [bot.level, bot.lives, bot.puzzle, phase, player.level, player.lives, player.puzzle]);

  useEffect(() => {
    if (phase !== 'play') return;
    const delay = Math.max(2200, 4600 - speed * 70);
    const timer = setInterval(() => {
      setBot((current) => {
        if (phaseRef.current !== 'play' || current.lives <= 0) return current;
        const open = current.level.words.find((word) => !current.puzzle.foundIds.includes(word.id));
        if (!open) return current;
        const letters = lettersInOrder(current.level, current.puzzle);
        const path = slotsForWord(letters, open.text);
        if (!path) return current;
        const outcome = submitWord(current.level, current.puzzle, path);
        return { ...current, puzzle: outcome.state, selection: path, notice: 'Doğru' };
      });
    }, delay);
    return () => clearInterval(timer);
  }, [phase, speed, bot.level.id]);

  const finishMatch = (nextPlayer: Lane, nextBot: Lane) => {
    if (nextPlayer.lives <= 0 && nextBot.lives <= 0) setPhase('end');
  };

  const submit = (path: number[]) => {
    if (phase !== 'play' || player.lives <= 0) return;
    const text = normalizeWord(spell(player.level, player.puzzle, path));
    const outcome = submitWord(player.level, player.puzzle, path);
    let result = outcome.result;
    let nextPuzzle = outcome.state;
    const claimed = player.claimed;
    if (result === 'bonus') {
      if (claimed.includes(text)) {
        result = 'duplicate';
        nextPuzzle = player.puzzle;
      }
    }
    const nextLives =
      result === 'invalid' && text.length >= 3 ? Math.max(0, player.lives - 1) : player.lives;
    const notice =
      result === 'found' ? 'Doğru' : result === 'bonus' ? 'Ek kelime' : result === 'duplicate' ? 'Zaten var' : result === 'invalid' ? 'Yok' : '';
    if (result === 'found' || result === 'bonus') Vibration.vibrate(12);
    else if (result === 'invalid' && text.length >= 3) Vibration.vibrate(30);
    const next = {
      ...player,
      puzzle: nextPuzzle,
      selection: [],
      lives: nextLives,
      notice,
      claimed: result === 'bonus' ? [...claimed, text] : claimed,
    };
    setPlayer(next);
    finishMatch(next, bot);
  };

  const shuffle = () => {
    if (phase !== 'play' || player.lives <= 0) return;
    setPlayer((current) => ({
      ...current,
      selection: [],
      puzzle: { ...current.puzzle, letterOrder: shuffleOrder(current.puzzle.letterOrder) },
    }));
  };

  const restart = () => {
    advancing.current = false;
    setPlayer(makeLane());
    setBot(makeLane());
    setSeconds(MATCH_SECONDS);
    setWave(1);
    setSpeed(1);
    setMatchId((current) => current + 1);
    setPhase('play');
  };

  const playerScore = player.puzzle.score;
  const botScore = bot.puzzle.score;
  const verdict = playerScore === botScore ? 'BERABERE' : playerScore > botScore ? 'KAZANDIN' : 'BOT KAZANDI';
  const tile = Math.max(16, Math.min(26, Math.floor((laneWidth - 16) / Math.max(gridBounds(player.level).cols, gridBounds(bot.level).cols)) - 2));
  const wheelSize = Math.max(118, Math.min(168, laneWidth - 12));

  return (
    <GestureHandlerRootView style={styles.fill}>
      <View style={styles.split}>
        <LinearGradient
          colors={['#2f6bff', '#1236c8']}
          style={styles.lane}
          onLayout={(event) => setLaneWidth(event.nativeEvent.layout.width)}
        >
          <LaneBoard
            lane={player}
            accent={colors.cyan}
            tint="#1aa8ff"
            tile={tile}
            wheelSize={wheelSize}
            interactive
            onChange={(selection) => setPlayer((current) => ({ ...current, selection }))}
            onSubmit={submit}
            onShuffle={shuffle}
          />
        </LinearGradient>
        <LinearGradient colors={['#ff2d8f', '#7a1468']} style={styles.lane}>
          <LaneBoard
            lane={bot}
            accent={colors.pink}
            tint="#ff2d8f"
            tile={tile}
            wheelSize={wheelSize}
            interactive={false}
            onChange={() => undefined}
            onSubmit={() => undefined}
          />
        </LinearGradient>
      </View>

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View pointerEvents="box-none" style={styles.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => router.back()} style={styles.back}>
            <Text style={[styles.backText, bold ? { fontFamily: bold } : null]}>{'‹'}</Text>
          </Pressable>
          <View style={styles.hud}>
            <Text style={[styles.hudLabel, semibold ? { fontFamily: semibold } : null]}>SÜRE</Text>
            <Text style={[styles.hudValue, bold ? { fontFamily: bold } : null]}>{formatTime(seconds)}</Text>
            <Text style={[styles.hudLabel, semibold ? { fontFamily: semibold } : null]}>DALGA</Text>
            <Text style={[styles.hudValue, bold ? { fontFamily: bold } : null]}>{wave}</Text>
            <Text style={[styles.hudLabel, semibold ? { fontFamily: semibold } : null]}>HIZ</Text>
            <Text style={[styles.hudSpeed, bold ? { fontFamily: bold } : null]}>+{speed}%</Text>
          </View>
          <View style={styles.back} />
        </View>

        <View pointerEvents="none" style={styles.names}>
          <PlayerBadge
            label="OYUNCU"
            score={padScore(playerScore)}
            lives={player.lives}
            accent={colors.cyan}
            bold={bold}
            letter="OY"
          />
          <PlayerBadge
            label="DENEME BOTU"
            score={padScore(botScore)}
            lives={bot.lives}
            accent={colors.pink}
            bold={bold}
            portrait={BOT_PORTRAIT}
          />
        </View>

      </SafeAreaView>

      {phase === 'end' ? (
        <View style={styles.result}>
          <Text style={[styles.verdict, bold ? { fontFamily: bold } : null]}>{verdict}</Text>
          <Text style={[styles.resultScore, semibold ? { fontFamily: semibold } : null]}>
            {padScore(playerScore)} · {padScore(botScore)}
          </Text>
          <Text style={[styles.best, semibold ? { fontFamily: semibold } : null]}>En iyi {padScore(Math.max(best, playerScore))}</Text>
          <Pressable accessibilityRole="button" onPress={restart} style={styles.again}>
            <Text style={[styles.againText, bold ? { fontFamily: bold } : null]}>Tekrar</Text>
          </Pressable>
        </View>
      ) : null}
    </GestureHandlerRootView>
  );
}

function PlayerBadge({
  label,
  score,
  lives,
  accent,
  bold,
  letter,
  portrait,
}: {
  label: string;
  score: string;
  lives: number;
  accent: string;
  bold?: string | null;
  letter?: string;
  portrait?: number;
}) {
  return (
    <View style={styles.badge}>
      <View style={[styles.avatar, { borderColor: accent }]}>
        {portrait ? (
          <Image source={portrait} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <Text style={[styles.avatarLetter, bold ? { fontFamily: bold } : null]}>{letter}</Text>
        )}
      </View>
      <View style={styles.namePlate}>
        <Text style={[styles.name, bold ? { fontFamily: bold } : null]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.score, bold ? { fontFamily: bold } : null]}>{score}</Text>
        <View style={styles.lives}>
          {Array.from({ length: START_LIVES }, (_, index) => (
            <View key={index} style={[styles.gem, { backgroundColor: index < lives ? accent : 'rgba(255,255,255,0.25)' }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

function LaneBoard({
  lane,
  accent,
  tint,
  tile,
  wheelSize,
  interactive,
  onChange,
  onSubmit,
  onShuffle,
}: {
  lane: Lane;
  accent: string;
  tint: string;
  tile: number;
  wheelSize: number;
  interactive: boolean;
  onChange: (selection: number[]) => void;
  onSubmit: (selection: number[]) => void;
  onShuffle?: () => void;
}) {
  const semibold = useAppFont('semibold');
  const preview = spell(lane.level, lane.puzzle, lane.selection);
  return (
    <View style={styles.board} pointerEvents={interactive ? 'auto' : 'none'}>
      <View style={styles.gridWrap}>
        <PuzzleGrid level={lane.level} state={lane.puzzle} accent={accent} tile={tile} />
      </View>
      <Text style={[styles.notice, semibold ? { fontFamily: semibold } : null]}>{lane.notice || preview}</Text>
      {onShuffle ? (
        <Pressable accessibilityRole="button" onPress={onShuffle} style={styles.shuffle}>
          <Text style={[styles.shuffleText, semibold ? { fontFamily: semibold } : null]}>Karıştır</Text>
        </Pressable>
      ) : null}
      <LetterWheel
        letters={lettersInOrder(lane.level, lane.puzzle)}
        selection={lane.selection}
        onChange={onChange}
        onSubmit={onSubmit}
        size={wheelSize}
        disabled={!interactive || lane.lives <= 0}
        tint={tint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#050814' },
  split: { flex: 1, flexDirection: 'row' },
  lane: { flex: 1 },
  board: { flex: 1, justifyContent: 'flex-end', paddingBottom: 28, gap: 8 },
  gridWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 214 },
  notice: { minHeight: 18, textAlign: 'center', color: '#fff', fontSize: 13, fontWeight: '700' },
  overlay: { ...StyleSheet.absoluteFillObject },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 8 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 34, lineHeight: 36 },
  hud: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 10, 28, 0.72)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 92,
  },
  hudLabel: { color: '#d7e7ff', fontSize: 10, letterSpacing: 1 },
  hudValue: { color: '#fff', fontSize: 18, fontWeight: '800' },
  hudSpeed: { color: '#7dffb2', fontSize: 14, fontWeight: '800' },
  names: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 4 },
  badge: { width: '46%', alignItems: 'center', gap: 6 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,16,40,0.55)',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarLetter: { color: '#fff', fontSize: 18, fontWeight: '800' },
  namePlate: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 10, 28, 0.78)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  name: { color: '#fff', fontSize: 12, fontWeight: '800' },
  score: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  lives: { flexDirection: 'row', gap: 4, marginTop: 2 },
  gem: { width: 8, height: 8, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  shuffle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(8, 10, 28, 0.72)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shuffleText: { color: '#fff', fontSize: 12 },
  result: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 8, 20, 0.72)',
    gap: 8,
  },
  verdict: { color: '#fff', fontSize: 32, fontWeight: '800' },
  resultScore: { color: '#d7e7ff', fontSize: 18 },
  best: { color: '#7dffb2', fontSize: 14 },
  again: { marginTop: 8, backgroundColor: colors.pinkDeep, borderRadius: 16, paddingHorizontal: 22, paddingVertical: 10 },
  againText: { color: '#fff', fontSize: 16 },
});
