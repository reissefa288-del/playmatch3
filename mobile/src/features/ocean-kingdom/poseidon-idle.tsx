import { Image } from 'expo-image';
import { memo } from 'react';
import { View } from 'react-native';

/**
 * Static Poseidon plate — no idle FX (glow/sway overlays removed).
 */
function PoseidonIdleComponent({ width, height, image }: { width: number; height: number; image: number }) {
  return (
    <View pointerEvents="none" style={{ width, height, overflow: 'hidden' }}>
      <Image source={image} style={{ width, height }} contentFit="cover" transition={0} />
    </View>
  );
}

export const PoseidonIdle = memo(PoseidonIdleComponent);
