import { memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { loadSkia, type GlassTone } from '@/features/deneme-4/skia-host';

const PALETTE = {
  magenta: {
    glow: 'rgba(255, 80, 170, 0.22)',
    bar: ['rgba(92, 32, 84, 0.72)', 'rgba(36, 12, 48, 0.9)'],
    well: ['rgba(18, 6, 28, 0.94)', 'rgba(42, 16, 48, 0.88)'],
    edge: '#ff6ec4',
  },
  cyan: {
    glow: 'rgba(70, 180, 255, 0.2)',
    bar: ['rgba(24, 58, 120, 0.7)', 'rgba(8, 18, 48, 0.9)'],
    well: ['rgba(6, 12, 32, 0.94)', 'rgba(16, 36, 72, 0.88)'],
    edge: '#49d4ff',
  },
} as const;

function TrayCanvas({
  width,
  height,
  tone,
  slots,
}: {
  width: number;
  height: number;
  tone: GlassTone;
  slots: readonly (readonly [number, number, number, number])[];
}) {
  const skia = useMemo(() => loadSkia(), []);
  if (!skia || width < 2 || height < 2) return null;
  const { Canvas, RoundedRect, LinearGradient, vec } = skia;
  const ink = PALETTE[tone];
  const barRadius = Math.min(height * 0.34, 28);
  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      <RoundedRect x={2} y={4} width={width - 4} height={height - 8} r={barRadius + 4} color={ink.glow} />
      <RoundedRect x={6} y={8} width={width - 12} height={height - 16} r={barRadius}>
        <LinearGradient start={vec(6, 8)} end={vec(width - 6, height - 8)} colors={[ink.bar[0], ink.bar[1]]} />
      </RoundedRect>
      <RoundedRect x={6} y={8} width={width - 12} height={height - 16} r={barRadius} style="stroke" strokeWidth={1.5} color={ink.edge} />
      {slots.map((slot, index) => {
        const x = slot[0] * width;
        const y = slot[1] * height;
        const w = (slot[2] - slot[0]) * width;
        const h = (slot[3] - slot[1]) * height;
        const radius = Math.min(w, h) * 0.22;
        return (
          <RoundedRect key={index} x={x} y={y} width={w} height={h} r={radius}>
            <LinearGradient start={vec(x, y)} end={vec(x, y + h)} colors={[ink.well[0], ink.well[1]]} />
          </RoundedRect>
        );
      })}
      {slots.map((slot, index) => {
        const x = slot[0] * width;
        const y = slot[1] * height;
        const w = (slot[2] - slot[0]) * width;
        const h = (slot[3] - slot[1]) * height;
        const radius = Math.min(w, h) * 0.22;
        return <RoundedRect key={`rim-${index}`} x={x} y={y} width={w} height={h} r={radius} style="stroke" strokeWidth={1.15} color={ink.edge} />;
      })}
    </Canvas>
  );
}

function SevenSlotTrayComponent({
  tone,
  slots,
}: {
  tone: GlassTone;
  slots: readonly (readonly [number, number, number, number])[];
}) {
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
      <TrayCanvas width={box.w} height={box.h} tone={tone} slots={slots} />
    </View>
  );
}

export const SevenSlotTray = memo(SevenSlotTrayComponent);
