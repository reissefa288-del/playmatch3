import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { envArt } from '@/features/ocean-kingdom/art';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const DEPTH_ASPECT = 1080 / 1920;
const COLUMN_WH = 136 / 720;
const CORAL_WH = 485 / 501;
const WEED_WH = 255 / 560;

function coverBox(width: number, height: number) {
  const coverW = height * DEPTH_ASPECT;
  if (coverW >= width) return { x: (width - coverW) / 2, y: 0, w: coverW, h: height };
  const coverH = width / DEPTH_ASPECT;
  return { x: 0, y: (height - coverH) / 2, w: width, h: coverH };
}

export function OceanDepth({ width, height }: { width: number; height: number }) {
  const box = coverBox(width, height);
  return (
    <Image
      source={envArt.depth}
      resizeMode="cover"
      onError={() => console.warn('Ocean depth image failed')}
      style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h }}
    />
  );
}

function Columns({ width, height }: { width: number; height: number }) {
  const upperW = width * 0.15;
  const upperH = upperW / COLUMN_WH;
  const lowerW = width * 0.175;
  const lowerH = lowerW / COLUMN_WH;
  const sides = [
    { key: 'ul', left: -upperW * 0.28, top: -height * 0.02, w: upperW, h: upperH },
    { key: 'ur', left: width - upperW * 0.72, top: -height * 0.02, w: upperW, h: upperH },
    { key: 'll', left: -lowerW * 0.22, top: upperH * 0.78, w: lowerW, h: lowerH },
    { key: 'lr', left: width - lowerW * 0.78, top: upperH * 0.78, w: lowerW, h: lowerH },
  ];
  return (
    <>
      {sides.map((side) => (
        <Image
          key={side.key}
          source={envArt.column}
          resizeMode="stretch"
          style={{ position: 'absolute', left: side.left, top: side.top, width: side.w, height: side.h }}
        />
      ))}
    </>
  );
}

function SwaySprite({
  time,
  source,
  left,
  bottom,
  width,
  aspect,
  phase,
  amp,
  flip,
}: {
  time: SharedValue<number>;
  source: (typeof envArt)['coral'];
  left: number;
  bottom: number;
  width: number;
  aspect: number;
  phase: number;
  amp: number;
  flip?: boolean;
}) {
  const height = width / aspect;
  const style = useAnimatedStyle(() => {
    const deg = Math.sin(time.value / 1400 + phase) * amp;
    const drift = Math.sin(time.value / 1700 + phase * 1.3) * 4;
    return {
      transform: [
        { translateY: height / 2 + drift },
        { rotate: `${deg}deg` },
        { translateY: -height / 2 },
        { scaleX: flip ? -1 : 1 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.sway, { left, bottom, width, height }, style]}>
      <AnimatedImage source={source} resizeMode="contain" style={styles.sprite} />
    </Animated.View>
  );
}

function SceneryComponent({ width, height, time }: { width: number; height: number; time: SharedValue<number> }) {
  const coralW = width * 0.46;
  const weedW = width * 0.2;
  return (
    <View pointerEvents="none" style={styles.fill}>
      <Columns width={width} height={height} />
      <SwaySprite time={time} source={envArt.coral} left={-width * 0.06} bottom={-height * 0.01} width={coralW} aspect={CORAL_WH} phase={0.2} amp={4.5} />
      <SwaySprite time={time} source={envArt.coral} left={width - coralW * 0.78} bottom={-height * 0.02} width={coralW * 0.92} aspect={CORAL_WH} phase={1.4} amp={5} flip />
      <SwaySprite time={time} source={envArt.coral} left={-width * 0.02} bottom={height * 0.16} width={coralW * 0.42} aspect={CORAL_WH} phase={2.2} amp={3.5} />
      <SwaySprite time={time} source={envArt.coral} left={width - coralW * 0.38} bottom={height * 0.18} width={coralW * 0.4} aspect={CORAL_WH} phase={0.6} amp={3.8} flip />
      <SwaySprite time={time} source={envArt.seaweed} left={width * 0.02} bottom={height * 0.04} width={weedW} aspect={WEED_WH} phase={0.4} amp={8} />
      <SwaySprite time={time} source={envArt.seaweed} left={width * 0.78} bottom={height * 0.03} width={weedW * 0.9} aspect={WEED_WH} phase={2.1} amp={9} flip />
      <SwaySprite time={time} source={envArt.seaweed} left={width * 0.12} bottom={height * 0.2} width={weedW * 0.62} aspect={WEED_WH} phase={1.1} amp={7} />
      <SwaySprite time={time} source={envArt.seaweed} left={width * 0.84} bottom={height * 0.22} width={weedW * 0.55} aspect={WEED_WH} phase={2.8} amp={7.5} />
    </View>
  );
}

export const Scenery = memo(SceneryComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  sway: { position: 'absolute' },
  sprite: { width: '100%', height: '100%' },
});
