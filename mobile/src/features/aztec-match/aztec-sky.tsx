import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useRef } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

type Plate = { x: number; y: number; w: number; h: number };

const BIRDS = [
  { id: 'a', y: 0.04, duration: 17000, phase: 0.05, scale: 0.72 },
  { id: 'b', y: 0.07, duration: 23000, phase: 0.4, scale: 1 },
  { id: 'c', y: 0.1, duration: 19000, phase: 0.68, scale: 0.58 },
] as const;

function useSkyClock() {
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

function Bird({
  spec,
  plate,
  time,
}: {
  spec: (typeof BIRDS)[number];
  plate: Plate;
  time: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const travel = (time.value / spec.duration + spec.phase) % 1;
    const flap = 0.28 + 0.72 * Math.abs(Math.sin(time.value / 150 + spec.phase * 5));
    return {
      transform: [
        { translateX: plate.x + travel * (plate.w + 36) - 24 },
        { translateY: plate.y + spec.y * plate.h + Math.sin(time.value / 420 + spec.phase) * 4 },
        { scale: spec.scale },
        { scaleY: flap },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.bird, style]}>
      <View style={[styles.wing, styles.wingLeft]} />
      <View style={[styles.wing, styles.wingRight]} />
    </Animated.View>
  );
}

function AztecSkyComponent({ plate }: { plate: Plate }) {
  const time = useSkyClock();
  return (
    <View pointerEvents="none" style={styles.fill}>
      {BIRDS.map((spec) => (
        <Bird key={spec.id} spec={spec} plate={plate} time={time} />
      ))}
    </View>
  );
}

export const AztecSky = memo(AztecSkyComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  bird: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 18,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wing: {
    position: 'absolute',
    width: 9,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#3a2416',
  },
  wingLeft: { transform: [{ translateX: -3 }, { rotate: '-28deg' }] },
  wingRight: { transform: [{ translateX: 3 }, { rotate: '28deg' }] },
});
