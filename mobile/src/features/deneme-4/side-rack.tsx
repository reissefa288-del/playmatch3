import { memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { loadSkia, type GlassTone } from '@/features/deneme-4/skia-host';

const PALETTE = {
  magenta: {
    glow: 'rgba(255, 70, 170, 0.28)',
    glass: ['rgba(86, 28, 78, 0.55)', 'rgba(28, 10, 36, 0.82)'],
    edge: '#ff6ec4',
    rim: 'rgba(255, 196, 232, 0.55)',
  },
  cyan: {
    glow: 'rgba(60, 170, 255, 0.26)',
    glass: ['rgba(28, 64, 128, 0.5)', 'rgba(8, 16, 42, 0.84)'],
    edge: '#49d4ff',
    rim: 'rgba(198, 236, 255, 0.5)',
  },
} as const;

function RackCanvas({ width, height, tone }: { width: number; height: number; tone: GlassTone }) {
  const skia = useMemo(() => loadSkia(), []);
  if (!skia || width < 2 || height < 2) return null;
  const { Canvas, RoundedRect, LinearGradient, vec } = skia;
  const ink = PALETTE[tone];
  const padX = width * 0.1;
  const padY = height * 0.028;
  const x = padX;
  const y = padY;
  const w = width - padX * 2;
  const h = height - padY * 2;
  const radius = Math.min(w * 0.34, 28);
  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      <RoundedRect x={padX * 0.35} y={padY * 0.4} width={width - padX * 0.7} height={height - padY * 0.8} r={radius + 6} color={ink.glow} />
      <RoundedRect x={x} y={y} width={w} height={h} r={radius}>
        <LinearGradient start={vec(x, y)} end={vec(x, y + h)} colors={[ink.glass[0], ink.glass[1]]} />
      </RoundedRect>
      <RoundedRect x={x} y={y} width={w} height={h} r={radius} style="stroke" strokeWidth={1.6} color={ink.edge} />
      <RoundedRect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 5} r={Math.max(radius - 3, 4)} style="stroke" strokeWidth={1} color={ink.rim} />
    </Canvas>
  );
}

function SideTileRackComponent({ tone }: { tone: GlassTone }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }}
    >
      <RackCanvas width={box.w} height={box.h} tone={tone} />
    </View>
  );
}

export const SideTileRack = memo(SideTileRackComponent);
