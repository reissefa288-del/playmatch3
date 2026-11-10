import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

const sheet = require('./assets/bats.png') as number;
const COLS = 6;
const ROWS = 2;
const FRAMES = 12;
const CELL_W = 168;
const CELL_H = 102;
const FLAP_MS = 760;

const BATS = [
  { x: 0.16, y: 0.048, w: 0.11, ax: 0.012, ay: 0.004, speed: 0.26, phase: 0.4, flap: 0, minX: 0.12, maxX: 0.22 },
  { x: 0.72, y: 0.05, w: 0.11, ax: 0.014, ay: 0.004, speed: 0.28, phase: 1.5, flap: 0.33, minX: 0.66, maxX: 0.78 },
  { x: 0.9, y: 0.058, w: 0.095, ax: 0.008, ay: 0.003, speed: 0.4, phase: 2.6, flap: 0.66, minX: 0.86, maxX: 0.92 },
];

function Bat({
  spec,
  time,
  screenW,
  screenH,
}: {
  spec: (typeof BATS)[number];
  time: SharedValue<number>;
  screenW: number;
  screenH: number;
}) {
  const { x, y, ax, ay, speed, phase, flap, minX, maxX } = spec;
  const boxW = screenW * spec.w;
  const boxH = boxW * (CELL_H / CELL_W);
  const flight = useAnimatedStyle(() => {
    const seconds = time.value / 1000;
    const travel = seconds * speed + phase;
    const glide = Math.sin(travel) * 0.62 + Math.sin(travel * 0.46 + 0.7) * 0.38;
    const lift = Math.cos(travel * 0.7) * 0.58 + Math.sin(travel * 0.29) * 0.42;
    const px = Math.min(maxX, Math.max(minX, x + glide * ax));
    const py = y + lift * ay;
    return {
      transform: [
        { translateX: px * screenW - boxW / 2 },
        { translateY: py * screenH - boxH / 2 },
        { rotate: `${Math.cos(travel) * 8}deg` },
      ],
    };
  });
  const wings = useAnimatedStyle(() => {
    const frame = Math.floor((time.value / FLAP_MS + flap) * FRAMES) % FRAMES;
    const col = frame % COLS;
    const row = Math.floor(frame / COLS);
    return {
      transform: [{ translateX: -col * boxW }, { translateY: -row * boxH }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.bat, { width: boxW, height: boxH }, flight]}>
      <View style={styles.clip} collapsable={false}>
        <Animated.Image
          source={sheet}
          resizeMode="stretch"
          fadeDuration={0}
          style={[{ width: boxW * COLS, height: boxH * ROWS }, wings]}
        />
      </View>
    </Animated.View>
  );
}

export function FlyingBats() {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);
  const active = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      active.value = 1;
      return () => {
        active.value = 0;
      };
    }, [active]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      active.value = state === 'active' ? 1 : 0;
    });
    return () => sub.remove();
  }, [active]);

  useFrameCallback((frame) => {
    if (!active.value) return;
    const step = frame.timeSincePreviousFrame;
    if (step == null || step <= 0) return;
    time.value += step > 32 ? 32 : step;
  });

  if (width < 2 || height < 2) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.layer]}>
      {BATS.map((spec) => (
        <Bat key={`${spec.x}-${spec.y}`} spec={spec} time={time} screenW={width} screenH={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { zIndex: 4 },
  bat: { position: 'absolute', left: 0, top: 0 },
  clip: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
});
