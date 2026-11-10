import { memo } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { oceanAssets } from '@/features/ocean-kingdom/art';

const PLATE_ASPECT = 9 / 16;

type Box = { x: number; y: number; w: number; h: number };

function plateBox(width: number, height: number): Box {
  const coverW = height * PLATE_ASPECT;
  if (coverW >= width) return { x: (width - coverW) / 2, y: 0, w: coverW, h: height };
  const coverH = width / PLATE_ASPECT;
  return { x: 0, y: (height - coverH) / 2, w: width, h: coverH };
}

function OceanLivingComponent() {
  const { width, height } = useWindowDimensions();
  if (width < 2 || height < 2) return null;
  const box = plateBox(width, height);

  return (
    <View pointerEvents="none" style={styles.fill}>
      <Image
        source={oceanAssets.plate}
        resizeMode="cover"
        style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h }}
      />
    </View>
  );
}

export const OceanLiving = memo(OceanLivingComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
