import { memo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { FishLayer } from '@/features/ocean-kingdom/environment/fish-layer';
import { OceanDepth, Scenery } from '@/features/ocean-kingdom/environment/scenery';
import { useOceanClock } from '@/features/ocean-kingdom/environment/use-ocean-clock';
import { WaterFx } from '@/features/ocean-kingdom/environment/water-fx';

function OceanEnvironmentComponent() {
  const { width, height } = useWindowDimensions();
  const time = useOceanClock();
  if (width < 2 || height < 2) return null;

  return (
    <View pointerEvents="none" style={styles.fill}>
      <OceanDepth width={width} height={height} />
      <WaterFx width={width} height={height} time={time} />
      <Scenery width={width} height={height} time={time} />
      <FishLayer width={width} height={height} time={time} />
    </View>
  );
}

export const OceanEnvironment = memo(OceanEnvironmentComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
