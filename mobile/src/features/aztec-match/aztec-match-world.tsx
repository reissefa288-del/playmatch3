import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { AZTEC_MATCH_ASPECT, aztecMatchArt } from '@/features/aztec-match/art';

type Plate = { x: number; y: number; w: number; h: number };

const PROPS = [
  { id: 'pumpkin-l', kind: 'pumpkin' as const, x: -0.02, y: 0.74, size: 0.28, depth: 1.7, phase: 0.4 },
  { id: 'pumpkin-r', kind: 'pumpkin' as const, x: 0.74, y: 0.76, size: 0.3, depth: 1.85, phase: 1.8 },
  { id: 'candles-l', kind: 'candles' as const, x: 0.02, y: 0.58, size: 0.16, depth: 1.35, phase: 0.2 },
  { id: 'candles-r', kind: 'candles' as const, x: 0.82, y: 0.6, size: 0.15, depth: 1.45, phase: 2.4 },
  { id: 'candles-m', kind: 'candles' as const, x: 0.42, y: 0.86, size: 0.12, depth: 2.1, phase: 1.1 },
] as const;

const EMBERS = [
  { id: 'e1', x: 0.18, phase: 0.1, duration: 9000 },
  { id: 'e2', x: 0.72, phase: 0.45, duration: 11000 },
  { id: 'e3', x: 0.4, phase: 0.7, duration: 8000 },
  { id: 'e4', x: 0.88, phase: 0.25, duration: 13000 },
] as const;

function coverPlate(width: number, height: number): Plate {
  if (width / Math.max(height, 1) > AZTEC_MATCH_ASPECT) {
    const h = width / AZTEC_MATCH_ASPECT;
    return { x: 0, y: (height - h) / 2, w: width, h };
  }
  const w = height * AZTEC_MATCH_ASPECT;
  return { x: (width - w) / 2, y: 0, w, h: height };
}

function useAmbientClock() {
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

function ScenePlate({ plate, time }: { plate: Plate; time: SharedValue<number> }) {
  const bleed = 0.09;
  const style = useAnimatedStyle(() => {
    const swayX = Math.sin(time.value / 5200) * plate.w * 0.018;
    const swayY = Math.cos(time.value / 6400) * plate.h * 0.012;
    return { transform: [{ translateX: swayX }, { translateY: swayY }] };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: plate.x - plate.w * bleed,
          top: plate.y - plate.h * bleed,
          width: plate.w * (1 + bleed * 2),
          height: plate.h * (1 + bleed * 2),
        },
        style,
      ]}
    >
      <Image source={aztecMatchArt.temple} style={StyleSheet.absoluteFill} contentFit="cover" />
    </Animated.View>
  );
}

function FogBand({
  plate,
  time,
  top,
  duration,
  phase,
}: {
  plate: Plate;
  time: SharedValue<number>;
  top: number;
  duration: number;
  phase: number;
}) {
  const style = useAnimatedStyle(() => {
    const travel = ((time.value / duration + phase) % 1) * 2 - 1;
    return {
      opacity: 0.22 + 0.1 * Math.sin(time.value / 1800 + phase * 4),
      transform: [{ translateX: travel * plate.w * 0.18 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.fog,
        style,
        { left: plate.x - plate.w * 0.1, top: plate.y + plate.h * top, width: plate.w * 1.2, height: plate.h * 0.16 },
      ]}
    />
  );
}

function MoonGlow({ plate, time }: { plate: Plate; time: SharedValue<number> }) {
  const size = plate.w * 0.42;
  const style = useAnimatedStyle(() => ({
    opacity: 0.28 + 0.12 * Math.sin(time.value / 2400),
    transform: [{ scale: 1 + 0.04 * Math.sin(time.value / 2400) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.moon,
        style,
        { left: plate.x + plate.w * 0.48, top: plate.y + plate.h * 0.01, width: size, height: size },
      ]}
    />
  );
}

function StageProp({
  spec,
  plate,
  time,
}: {
  spec: (typeof PROPS)[number];
  plate: Plate;
  time: SharedValue<number>;
}) {
  const width = plate.w * spec.size;
  const height = spec.kind === 'candles' ? width * 1.45 : width;
  const style = useAnimatedStyle(() => {
    const swayX = Math.sin(time.value / 5200) * plate.w * 0.018 * spec.depth;
    const swayY = Math.cos(time.value / 6400) * plate.h * 0.012 * spec.depth;
    const bob = Math.sin(time.value / 1100 + spec.phase) * 5;
    const flicker = spec.kind === 'candles' ? 0.86 + 0.14 * Math.abs(Math.sin(time.value / 80 + spec.phase * 6)) : 1;
    return {
      opacity: flicker,
      transform: [{ translateX: swayX }, { translateY: swayY + bob }, { scale: spec.kind === 'pumpkin' ? 1 + 0.015 * Math.sin(time.value / 700 + spec.phase) : 1 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          position: 'absolute',
          left: plate.x + plate.w * spec.x,
          top: plate.y + plate.h * spec.y,
          width,
          height,
        },
      ]}
    >
      {spec.kind === 'pumpkin' ? <View style={styles.pumpkinGlow} /> : <View style={styles.candleGlow} />}
      <Image source={spec.kind === 'pumpkin' ? aztecMatchArt.pumpkin : aztecMatchArt.candles} style={StyleSheet.absoluteFill} contentFit="contain" />
    </Animated.View>
  );
}

function Ember({
  spec,
  plate,
  time,
}: {
  spec: (typeof EMBERS)[number];
  plate: Plate;
  time: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const travel = (time.value / spec.duration + spec.phase) % 1;
    return {
      opacity: Math.sin(travel * Math.PI) * 0.85,
      transform: [
        { translateX: plate.x + spec.x * plate.w + Math.sin(time.value / 600 + spec.phase) * 10 },
        { translateY: plate.y + plate.h * (0.42 - travel * 0.4) },
      ],
    };
  });

  return <Animated.View pointerEvents="none" style={[styles.ember, style]} />;
}

function AztecMatchWorldComponent() {
  const time = useAmbientClock();
  const [view, setView] = useState({ width: 0, height: 0 });
  const plate = view.width > 2 ? coverPlate(view.width, view.height) : null;

  return (
    <View
      pointerEvents="none"
      style={styles.fill}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setView((current) => (current.width === width && current.height === height ? current : { width, height }));
      }}
    >
      {plate ? (
        <>
          <ScenePlate plate={plate} time={time} />
          <MoonGlow plate={plate} time={time} />
          <FogBand plate={plate} time={time} top={0.34} duration={16000} phase={0.1} />
          <FogBand plate={plate} time={time} top={0.58} duration={21000} phase={0.55} />
          {PROPS.map((spec) => (
            <StageProp key={spec.id} spec={spec} plate={plate} time={time} />
          ))}
          {EMBERS.map((spec) => (
            <Ember key={spec.id} spec={spec} plate={plate} time={time} />
          ))}
        </>
      ) : null}
    </View>
  );
}

export const AztecMatchWorld = memo(AztecMatchWorldComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: '#14081f', zIndex: 0, overflow: 'hidden' },
  fog: {
    position: 'absolute',
    borderRadius: 80,
    backgroundColor: 'rgba(146, 78, 196, 0.28)',
  },
  moon: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 146, 48, 0.35)',
  },
  pumpkinGlow: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    bottom: '8%',
    height: '34%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 120, 20, 0.45)',
  },
  candleGlow: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: 0,
    height: '28%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 170, 60, 0.55)',
  },
  ember: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ffb15a',
  },
});
