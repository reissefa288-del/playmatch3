import { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { envArt } from '@/features/ocean-kingdom/art';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const FISH = [
  { id: 'clown', source: envArt.clown, y: 0.3, size: 0.2, lane0: -0.02, lane1: 0.22, duration: 14000, phase: 0.15, facesRight: true, opacity: 1 },
  { id: 'stripe', source: envArt.stripe, y: 0.46, size: 0.19, lane0: 0.78, lane1: 1.02, duration: 16000, phase: 0.45, facesRight: false, opacity: 1 },
  { id: 'reef', source: envArt.reef, y: 0.6, size: 0.13, lane0: 0.0, lane1: 0.2, duration: 11000, phase: 0.72, facesRight: true, opacity: 1 },
  { id: 'reef-r', source: envArt.reef, y: 0.24, size: 0.11, lane0: 0.8, lane1: 0.98, duration: 12500, phase: 0.28, facesRight: true, opacity: 1 },
  { id: 'far-a', source: envArt.stripe, y: 0.09, size: 0.07, lane0: 0.28, lane1: 0.7, duration: 24000, phase: 0.05, facesRight: false, opacity: 0.4 },
  { id: 'far-b', source: envArt.clown, y: 0.13, size: 0.055, lane0: 0.34, lane1: 0.62, duration: 28000, phase: 0.55, facesRight: true, opacity: 0.32 },
  { id: 'far-c', source: envArt.reef, y: 0.07, size: 0.05, lane0: 0.5, lane1: 0.86, duration: 22000, phase: 0.8, facesRight: true, opacity: 0.3 },
] as const;

function FishSprite({
  spec,
  width,
  height,
  time,
}: {
  spec: (typeof FISH)[number];
  width: number;
  height: number;
  time: SharedValue<number>;
}) {
  const size = width * spec.size;
  const style = useAnimatedStyle(() => {
    const angle = (time.value / spec.duration + spec.phase) * Math.PI * 2;
    const p = (1 - Math.cos(angle)) / 2;
    const dir = Math.sin(angle) >= 0 ? 1 : -1;
    const wag = Math.sin(time.value / 90 + spec.phase * 8) * 7;
    return {
      opacity: spec.opacity,
      transform: [
        { translateX: (spec.lane0 + (spec.lane1 - spec.lane0) * p) * width - size / 2 },
        { translateY: spec.y * height + Math.sin(angle * 2) * 7 - size / 2 },
        { rotate: `${wag}deg` },
        { scaleX: spec.facesRight ? dir : -dir },
      ],
    };
  });
  return <AnimatedImage source={spec.source} resizeMode="contain" style={[styles.fish, { width: size, height: size }, style]} />;
}

function FishLayerComponent({ width, height, time }: { width: number; height: number; time: SharedValue<number> }) {
  return (
    <>
      {FISH.map((spec) => (
        <FishSprite key={spec.id} spec={spec} width={width} height={height} time={time} />
      ))}
    </>
  );
}

export const FishLayer = memo(FishLayerComponent);

const styles = StyleSheet.create({
  fish: { position: 'absolute', left: 0, top: 0 },
});
