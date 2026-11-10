import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';

const sheet = require('./assets/cat-idle-flame.png') as number;
const COLS = 6;
const ROWS = 6;
const CELL_W = 213;
const CELL_H = 297;
const FLAME_FRAMES = 30;
const FRAME_MS = 70;

export function IdleCat() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const time = useSharedValue(0);
  const active = useSharedValue(1);
  const boxH = Math.round(height * 0.1144);
  const boxW = Math.round(boxH * (CELL_W / CELL_H));

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
    const t = time.value % 4200;
    let frame = Math.floor(time.value / FRAME_MS) % FLAME_FRAMES;
    if (t >= 1800 && t < 2220) {
      frame = 30 + Math.min(5, Math.floor((t - 1800) / 70));
    }
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
        styles.cat,
        {
          width: boxW,
          height: boxH,
          right: width * 0.012,
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
  cat: { position: 'absolute' },
  clip: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
});
