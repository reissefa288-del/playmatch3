import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';

const sheet = require('./assets/ui/mist.png') as number;

function Band({
  width,
  height,
  top,
  band,
  opacity,
  speed,
  phase,
  drift,
}: {
  width: number;
  height: number;
  top: number;
  band: number;
  opacity: number;
  speed: number;
  phase: number;
  drift: number;
}) {
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
    time.value += Math.min(32, step);
  });

  const pose = useAnimatedStyle(() => ({
    transform: [{ translateX: Math.sin(time.value * speed + phase) * width * drift }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.band, { top, height: band, opacity }, pose]}>
      <Animated.Image source={sheet} resizeMode="stretch" fadeDuration={0} style={{ width: width * 1.28, height: band }} />
    </Animated.View>
  );
}

/** Two mist sheets move at different speeds so the sky reads as separate layers. */
export function MistLayer() {
  const { width, height } = useWindowDimensions();
  if (width < 2 || height < 2) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Band width={width} height={height} top={height * 0.04} band={height * 0.2} opacity={0.42} speed={0.00012} phase={0.4} drift={0.035} />
      <Band width={width} height={height} top={height * 0.4} band={height * 0.16} opacity={0.22} speed={0.00016} phase={1.7} drift={0.028} />
      <Band width={width} height={height} top={height * 0.72} band={height * 0.22} opacity={0.34} speed={0.0002} phase={2.4} drift={0.05} />
    </View>
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute', left: '-14%', width: '128%' },
});
