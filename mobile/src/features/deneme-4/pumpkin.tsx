import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';

const sheet = require('./assets/pumpkin-idle.png') as number;
const COLS = 6;
const ROWS = 5;
const FRAMES = 30;
const CELL_W = 440;
const CELL_H = 318;
const FRAME_MS = 70;

export function IdlePumpkin() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const time = useSharedValue(0);
  const active = useSharedValue(1);
  const boxW = Math.round(width * 0.286);
  const boxH = Math.round(boxW * (CELL_H / CELL_W));

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

  const pose = useAnimatedStyle(() => {
    const frame = Math.floor(time.value / FRAME_MS) % FRAMES;
    const col = frame % COLS;
    const row = Math.floor(frame / COLS);
    return {
      transform: [{ translateX: -col * boxW }, { translateY: -row * boxH }],
    };
  });

  if (width < 2 || height < 2) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.pumpkin,
        {
          width: boxW,
          height: boxH,
          left: width * 0.012,
          bottom: Math.max(insets.bottom, height * 0.02),
        },
      ]}
    >
      <View style={styles.clip} collapsable={false}>
        <Animated.Image
          source={sheet}
          resizeMode="stretch"
          fadeDuration={0}
          style={[{ width: boxW * COLS, height: boxH * ROWS }, pose]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pumpkin: { position: 'absolute' },
  clip: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
});
