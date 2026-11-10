import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Image as RnImage, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { AZTEC_PLATE_ASPECT, aztecArt } from '@/features/aztec-tiles/art';
import { AztecLight } from '@/features/aztec-tiles/aztec-light';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const FLAME_FRAMES = 6;

type Plate = { x: number; y: number; w: number; h: number };

const BRAZIERS = [
  { id: 'bl', x: 0.1, y: 0.7, s: 0.055 },
  { id: 'br', x: 0.9, y: 0.7, s: 0.055 },
  { id: 'ml', x: 0.2, y: 0.46, s: 0.042 },
  { id: 'mr', x: 0.8, y: 0.4, s: 0.042 },
] as const;

function coverPlate(width: number, height: number): Plate {
  const screenAspect = width / Math.max(height, 1);
  if (screenAspect > AZTEC_PLATE_ASPECT) {
    const h = width / AZTEC_PLATE_ASPECT;
    return { x: 0, y: (height - h) / 2, w: width, h };
  }
  const w = height * AZTEC_PLATE_ASPECT;
  return { x: (width - w) / 2, y: 0, w, h: height };
}

function useLiveClock() {
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

function Flame({
  x,
  y,
  size,
  time,
  phase,
}: {
  x: number;
  y: number;
  size: number;
  time: SharedValue<number>;
  phase: number;
}) {
  const style = useAnimatedStyle(() => {
    const frame = Math.floor((time.value / 90 + phase) % FLAME_FRAMES);
    const flick = 0.94 + Math.sin(time.value / 140 + phase) * 0.06;
    return { transform: [{ translateX: -frame * size }, { scaleY: flick }] };
  });
  return (
    <View pointerEvents="none" style={[styles.clip, { left: x - size / 2, top: y - size * 0.85, width: size, height: size }]}>
      <AnimatedImage source={aztecArt.flame} style={[{ width: size * FLAME_FRAMES, height: size }, style]} contentFit="fill" transition={0} />
    </View>
  );
}

function Falls({ plate, time }: { plate: Plate; time: SharedValue<number> }) {
  const h = plate.h * 0.4;
  const w = plate.w * 0.2;
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -((time.value / 16) % h) }] }));
  return (
    <View pointerEvents="none" style={[styles.clip, { left: plate.x + plate.w * 0.4, top: plate.y + plate.h * 0.16, width: w, height: h, opacity: 0.34 }]}>
      <Animated.View style={style}>
        <Image source={aztecArt.falls} style={{ width: w, height: h }} contentFit="cover" transition={0} />
        <Image source={aztecArt.falls} style={{ width: w, height: h }} contentFit="cover" transition={0} />
      </Animated.View>
    </View>
  );
}

function Wildlife({ plate, time }: { plate: Plate; time: SharedValue<number> }) {
  const macaw = useAnimatedStyle(() => ({
    transform: [{ rotate: `${Math.sin(time.value / 900) * 4}deg` }, { translateY: Math.sin(time.value / 700) * 3 }],
  }));
  const butterfly = useAnimatedStyle(() => {
    const p = (time.value % 14000) / 14000;
    return {
      transform: [
        { translateX: Math.sin(p * Math.PI * 2) * plate.w * 0.05 },
        { translateY: Math.cos(p * Math.PI * 2) * plate.h * 0.025 },
        { scaleY: 0.62 + Math.abs(Math.sin(time.value / 180)) * 0.38 },
      ],
    };
  });
  const toucan = useAnimatedStyle(() => {
    const p = (time.value % 22000) / 22000;
    const fade = p < 0.08 ? p / 0.08 : p > 0.92 ? (1 - p) / 0.08 : 1;
    return {
      transform: [{ translateX: p * plate.w * 0.16 }, { translateY: Math.sin(p * Math.PI) * -16 }],
      opacity: fade,
    };
  });
  const size = plate.w * 0.1;
  return (
    <>
      <AnimatedImage
        source={aztecArt.macaw}
        style={[{ position: 'absolute', width: size, height: size, left: plate.x + plate.w * 0.84, top: plate.y + plate.h * 0.27 }, macaw]}
        contentFit="contain"
        transition={0}
      />
      <Animated.View style={[{ position: 'absolute', left: plate.x + plate.w * 0.06, top: plate.y + plate.h * 0.36, width: size * 0.4, height: size * 0.4 }, butterfly]}>
        <Image source={aztecArt.butterfly} style={StyleSheet.absoluteFill} contentFit="contain" transition={0} />
      </Animated.View>
      <AnimatedImage
        source={aztecArt.toucan}
        style={[{ position: 'absolute', width: size * 0.5, height: size * 0.5, left: plate.x + plate.w * 0.02, top: plate.y + plate.h * 0.2 }, toucan]}
        contentFit="contain"
        transition={0}
      />
    </>
  );
}

function Foliage({ plate, time }: { plate: Plate; time: SharedValue<number> }) {
  const left = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-6 + Math.sin(time.value / 1500) * 3.2}deg` }],
  }));
  const right = useAnimatedStyle(() => ({
    transform: [{ rotate: `${6 + Math.sin(time.value / 1500 + 1.2) * 3.2}deg` }],
  }));
  const leaf = useAnimatedStyle(() => {
    const p = (time.value % 16000) / 16000;
    const fade = p < 0.1 ? p / 0.1 : p > 0.85 ? (1 - p) / 0.15 : 0.7;
    return {
      transform: [{ translateY: p * plate.h * 0.32 }, { translateX: Math.sin(p * 8) * 14 }, { rotate: `${p * 70}deg` }],
      opacity: fade,
    };
  });
  const w = plate.w * 0.26;
  return (
    <>
      <AnimatedImage source={aztecArt.palm} style={[{ position: 'absolute', width: w, height: w * 0.5, left: plate.x - w * 0.2, top: plate.y }, left]} contentFit="contain" transition={0} />
      <AnimatedImage
        source={aztecArt.palm}
        style={[{ position: 'absolute', width: w, height: w * 0.5, left: plate.x + plate.w - w * 0.8, top: plate.y }, right]}
        contentFit="contain"
        transition={0}
      />
      <AnimatedImage source={aztecArt.leaf} style={[{ position: 'absolute', width: 26, height: 26, left: plate.x + plate.w * 0.74, top: plate.y + plate.h * 0.1 }, leaf]} contentFit="contain" transition={0} />
    </>
  );
}

function AztecEnvironmentComponent() {
  const time = useLiveClock();
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
          <RnImage source={aztecArt.plate} style={{ position: 'absolute', left: plate.x, top: plate.y, width: plate.w, height: plate.h }} resizeMode="cover" />
          <Falls plate={plate} time={time} />
          {BRAZIERS.map((brazier, index) => (
            <Flame key={brazier.id} x={plate.x + plate.w * brazier.x} y={plate.y + plate.h * brazier.y} size={plate.w * brazier.s} time={time} phase={index * 1.7} />
          ))}
          <Wildlife plate={plate} time={time} />
          <Foliage plate={plate} time={time} />
        </>
      ) : null}
      <AztecLight width={view.width} height={view.height} />
    </View>
  );
}

export const AztecEnvironment = memo(AztecEnvironmentComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1c3d2a' },
  clip: { position: 'absolute', overflow: 'hidden' },
});
