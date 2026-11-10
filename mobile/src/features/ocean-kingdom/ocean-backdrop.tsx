import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { OceanEnvironment } from '@/features/ocean-kingdom/environment/ocean-environment';

function OceanBackdropComponent() {
  return (
    <View pointerEvents="none" style={styles.fill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={['#3aa8e4', '#7fd0c8', '#e6c98a']} locations={[0, 0.62, 1]} style={StyleSheet.absoluteFill} />
      <OceanEnvironment />
    </View>
  );
}

export const OceanBackdrop = memo(OceanBackdropComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
});
