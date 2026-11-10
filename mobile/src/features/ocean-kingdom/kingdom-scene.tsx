import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { kingdomArt } from '@/features/ocean-kingdom/art';
import { PoseidonIdle } from '@/features/ocean-kingdom/poseidon-idle';

const AnimatedImage = Animated.createAnimatedComponent(Image);

/** Poseidon plate is exactly 9:16 (1080×1920). */
const PLATE_ASPECT = 9 / 16;

type Kind = 'tang' | 'clown' | 'reef' | 'school' | 'turtle';

type SwimmerSpec = {
  id: string;
  kind: Kind;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  duration: number;
  phase: number;
  size: number;
  opacity: number;
  z: number;
};

/**
 * Swim lanes stay off Poseidon's face/trident (upper-center) and leave the mid
 * board region readable. Prefer side corridors and the lower path edges.
 * Catfish / upper-right manta removed per art direction.
 */
const CAST: SwimmerSpec[] = [
  { id: 'school-a', kind: 'school', cx: 0.14, cy: 0.34, rx: 0.1, ry: 0.02, duration: 19000, phase: 0.05, size: 0.1, opacity: 0.72, z: 3 },
  { id: 'school-b', kind: 'school', cx: 0.86, cy: 0.38, rx: 0.09, ry: 0.016, duration: 22000, phase: 0.4, size: 0.09, opacity: 0.68, z: 3 },
  { id: 'tang', kind: 'tang', cx: 0.18, cy: 0.58, rx: 0.14, ry: 0.022, duration: 28000, phase: 0.18, size: 0.16, opacity: 0.92, z: 5 },
  { id: 'clown', kind: 'clown', cx: 0.82, cy: 0.55, rx: 0.13, ry: 0.02, duration: 26000, phase: 0.62, size: 0.15, opacity: 0.9, z: 5 },
  { id: 'reef', kind: 'reef', cx: 0.22, cy: 0.72, rx: 0.12, ry: 0.014, duration: 24000, phase: 0.33, size: 0.12, opacity: 0.86, z: 6 },
  { id: 'turtle', kind: 'turtle', cx: 0.28, cy: 0.84, rx: 0.1, ry: 0.01, duration: 40000, phase: 0.5, size: 0.16, opacity: 0.88, z: 6 },
];

const FRAMES: Record<Kind, number> = {
  tang: kingdomArt.tang,
  clown: kingdomArt.clown,
  reef: kingdomArt.reef,
  school: kingdomArt.schoolA,
  turtle: kingdomArt.turtleA,
};

type BubbleSpec = {
  id: string;
  x: number;
  size: number;
  duration: number;
  phase: number;
  drift: number;
  alpha: number;
  small: boolean;
};

/** Side-weighted so Poseidon and the central path stay clear. */
const BUBBLES: BubbleSpec[] = [
  { id: 'b1', x: 0.08, size: 22, duration: 13000, phase: 0.05, drift: 12, alpha: 0.55, small: false },
  { id: 'b2', x: 0.16, size: 11, duration: 9500, phase: 0.42, drift: 8, alpha: 0.42, small: true },
  { id: 'b3', x: 0.22, size: 16, duration: 15000, phase: 0.18, drift: 14, alpha: 0.4, small: false },
  { id: 'b4', x: 0.78, size: 13, duration: 11000, phase: 0.77, drift: 10, alpha: 0.44, small: true },
  { id: 'b5', x: 0.88, size: 26, duration: 16000, phase: 0.31, drift: 12, alpha: 0.5, small: false },
  { id: 'b6', x: 0.94, size: 14, duration: 12000, phase: 0.58, drift: 9, alpha: 0.38, small: true },
  { id: 'b7', x: 0.05, size: 10, duration: 8500, phase: 0.9, drift: 7, alpha: 0.34, small: true },
  { id: 'b8', x: 0.7, size: 18, duration: 14000, phase: 0.12, drift: 11, alpha: 0.36, small: false },
];

type Plate = { x: number; y: number; w: number; h: number };

function useSceneClock() {
  const time = useSharedValue(0);
  const last = useSharedValue(-1);
  const gate = useRef({ focus: true, app: AppState.currentState === 'active' });
  const frame = useFrameCallback((info) => {
    'worklet';
    if (last.value < 0) {
      last.value = info.timeSinceFirstFrame;
      return;
    }
    const dt = Math.min(34, info.timeSinceFirstFrame - last.value);
    last.value = info.timeSinceFirstFrame;
    time.value += dt;
  }, true);

  const applyGate = useCallback(() => {
    frame.setActive(gate.current.focus && gate.current.app);
  }, [frame]);

  useFocusEffect(
    useCallback(() => {
      gate.current.focus = true;
      applyGate();
      return () => {
        gate.current.focus = false;
        frame.setActive(false);
      };
    }, [applyGate, frame]),
  );

  useEffect(() => {
    applyGate();
    const sub = AppState.addEventListener('change', (state) => {
      gate.current.app = state === 'active';
      applyGate();
    });
    return () => sub.remove();
  }, [applyGate]);

  return time;
}

function Swimmer({
  spec,
  time,
  layout,
  screenW,
}: {
  spec: SwimmerSpec;
  time: SharedValue<number>;
  layout: SharedValue<Plate>;
  screenW: number;
}) {
  const size = Math.max(28, screenW * spec.size);
  const box = useSharedValue(size);
  useEffect(() => {
    box.value = size;
  }, [box, size]);
  const frame = FRAMES[spec.kind];
  const tilt = spec.kind === 'turtle' ? 1.6 : 3.6;
  const wobble = spec.kind === 'school' || spec.kind === 'reef' ? 0.04 : 0.028;
  const beat = spec.kind === 'turtle' ? 0.0046 : 0.007;
  const pose = useAnimatedStyle(() => {
    const plate = layout.value;
    const span = box.value;
    const angle = (time.value / spec.duration + spec.phase) * Math.PI * 2;
    const stroke = Math.sin(time.value * beat + spec.phase * 5);
    const x = plate.x + (spec.cx + Math.cos(angle) * spec.rx) * plate.w - span / 2;
    const y = plate.y + (spec.cy + Math.sin(angle * 2) * spec.ry) * plate.h - span / 2;
    const face = -Math.sin(angle) >= 0 ? 1 : -1;
    return {
      opacity: spec.opacity,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${Math.sin(angle * 2) * tilt + stroke * (tilt * 0.3)}deg` },
        { scaleX: face * (1 + stroke * wobble) },
        { scaleY: 1 - Math.abs(stroke) * wobble * 0.32 },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.sprite, { width: size, height: size, zIndex: spec.z }, pose]}>
      <AnimatedImage source={frame} style={StyleSheet.absoluteFill} contentFit="contain" transition={0} />
    </Animated.View>
  );
}

function Bubble({ spec, time, width, height }: { spec: BubbleSpec; time: SharedValue<number>; width: number; height: number }) {
  const style = useAnimatedStyle(() => {
    const u = (time.value / spec.duration + spec.phase) % 1;
    const fade = u < 0.12 ? u / 0.12 : u > 0.82 ? (1 - u) / 0.18 : 1;
    return {
      opacity: fade * spec.alpha,
      transform: [
        { translateX: spec.x * width + Math.sin(u * Math.PI * 2) * spec.drift - spec.size / 2 },
        { translateY: height * (1.04 - u * 1.12) },
        { scale: 0.9 + u * 0.16 },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.sprite, { width: spec.size, height: spec.size, zIndex: 8 }, style]}>
      <Image source={spec.small ? kingdomArt.bubbleSm : kingdomArt.bubble} style={StyleSheet.absoluteFill} contentFit="contain" transition={0} />
    </Animated.View>
  );
}

export function KingdomScene({
  width,
  height,
  onPlate,
}: {
  width: number;
  height: number;
  onPlate: (plate: Plate) => void;
}) {
  const time = useSceneClock();
  const plate = useMemo<Plate>(() => {
    const screenAspect = width / Math.max(height, 1);
    // Cover: fill the viewport without letterboxing; crop edges if needed.
    if (screenAspect > PLATE_ASPECT) {
      const w = width;
      const h = width / PLATE_ASPECT;
      return { x: 0, y: (height - h) / 2, w, h };
    }
    const h = height;
    const w = height * PLATE_ASPECT;
    return { x: (width - w) / 2, y: 0, w, h };
  }, [width, height]);

  useEffect(() => {
    onPlate(plate);
  }, [onPlate, plate]);

  const layout = useSharedValue(plate);
  useEffect(() => {
    layout.value = plate;
  }, [layout, plate]);

  return (
    <View style={styles.fill} pointerEvents="none">
      <View style={[styles.plateClip, { left: plate.x, top: plate.y, width: plate.w, height: plate.h }]}>
        <PoseidonIdle width={plate.w} height={plate.h} image={kingdomArt.background} />
      </View>
      {CAST.map((spec) => (
        <Swimmer key={spec.id} spec={spec} time={time} layout={layout} screenW={width} />
      ))}
      {BUBBLES.map((spec) => (
        <Bubble key={spec.id} spec={spec} time={time} width={width} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  plateClip: { position: 'absolute', overflow: 'hidden' },
  sprite: { position: 'absolute', left: 0, top: 0 },
});
