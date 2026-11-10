import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useRef } from 'react';
import { AppState, Image, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { aztecMatchArt } from '@/features/aztec-match/art';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const VINE_WH = 163 / 640;

const VINES = [
  { id: 'vl', x: -0.02, y: -0.02, w: 0.22, phase: 0.2, amp: 7 },
  { id: 'vr', x: 0.82, y: -0.04, w: 0.2, phase: 1.6, amp: 8, flip: true },
  { id: 'vml', x: 0.0, y: 0.34, w: 0.16, phase: 2.4, amp: 6 },
  { id: 'vmr', x: 0.86, y: 0.42, w: 0.15, phase: 0.8, amp: 6.5, flip: true },
] as const;

const FLIERS = [
  { id: 'macaw', source: aztecMatchArt.macaw, y: 0.07, size: 0.13, lane0: -0.06, lane1: 0.1, duration: 14000, phase: 0.1, facesRight: true },
  { id: 'mac2', source: aztecMatchArt.macaw, y: 0.7, size: 0.12, lane0: 0.9, lane1: 1.06, duration: 16000, phase: 0.55, facesRight: true },
  { id: 'bf', source: aztecMatchArt.butterfly, y: 0.3, size: 0.08, lane0: -0.02, lane1: 0.1, duration: 9000, phase: 0.3, facesRight: true },
  { id: 'bf2', source: aztecMatchArt.butterfly, y: 0.84, size: 0.07, lane0: 0.9, lane1: 1.02, duration: 11000, phase: 0.7, facesRight: true },
] as const;

function useLifeClock() {
  const time = useSharedValue(0);
  const last = useSharedValue(-1);
  const gate = useRef({ focus: true, app: AppState.currentState === 'active' });
  const frame = useFrameCallback((info) => {
    'worklet';
    if (last.value < 0) {
      last.value = info.timeSinceFirstFrame;
      return;
    }
    time.value += Math.min(34, info.timeSinceFirstFrame - last.value);
    last.value = info.timeSinceFirstFrame;
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

function Vine({
  spec,
  width,
  height,
  time,
}: {
  spec: (typeof VINES)[number];
  width: number;
  height: number;
  time: SharedValue<number>;
}) {
  const w = width * spec.w;
  const h = w / VINE_WH;
  const style = useAnimatedStyle(() => {
    const deg = Math.sin(time.value / 900 + spec.phase) * spec.amp;
    return {
      transform: [
        { translateY: h / 2 },
        { rotate: `${deg}deg` },
        { translateY: -h / 2 },
        { scaleX: 'flip' in spec && spec.flip ? -1 : 1 },
      ],
    };
  });
  return (
    <AnimatedImage
      source={aztecMatchArt.vine}
      resizeMode="contain"
      style={[styles.sprite, { left: width * spec.x, top: height * spec.y, width: w, height: h }, style]}
    />
  );
}

function Flier({
  spec,
  width,
  height,
  time,
}: {
  spec: (typeof FLIERS)[number];
  width: number;
  height: number;
  time: SharedValue<number>;
}) {
  const size = width * spec.size;
  const style = useAnimatedStyle(() => {
    const angle = (time.value / spec.duration + spec.phase) * Math.PI * 2;
    const p = (1 - Math.cos(angle)) / 2;
    const dir = Math.sin(angle) >= 0 ? 1 : -1;
    const flap = 0.72 + Math.abs(Math.sin(time.value / 140 + spec.phase)) * 0.28;
    return {
      transform: [
        { translateX: (spec.lane0 + (spec.lane1 - spec.lane0) * p) * width },
        { translateY: spec.y * height + Math.sin(angle * 2) * 10 },
        { scaleY: flap },
        { rotate: `${Math.sin(time.value / 200) * 6}deg` },
        { scaleX: spec.facesRight ? dir : -dir },
      ],
    };
  });
  return (
    <AnimatedImage source={spec.source} resizeMode="contain" style={[styles.sprite, { width: size, height: size }, style]} />
  );
}

function AztecLifeComponent({ width, height }: { width: number; height: number }) {
  const time = useLifeClock();
  if (width < 2 || height < 2) return null;
  return (
    <>
      {VINES.map((spec) => (
        <Vine key={spec.id} spec={spec} width={width} height={height} time={time} />
      ))}
      {FLIERS.map((spec) => (
        <Flier key={spec.id} spec={spec} width={width} height={height} time={time} />
      ))}
    </>
  );
}

export const AztecLife = memo(AztecLifeComponent);

const styles = StyleSheet.create({
  sprite: { position: 'absolute' },
});
