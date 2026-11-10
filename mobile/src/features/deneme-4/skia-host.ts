import { TurboModuleRegistry } from 'react-native';

type SkiaModule = typeof import('@shopify/react-native-skia');

let skiaModule: SkiaModule | null | undefined;

export function loadSkia(): SkiaModule | null {
  if (skiaModule !== undefined) return skiaModule;
  try {
    if (TurboModuleRegistry.get('RNSkiaModule') == null) {
      skiaModule = null;
      return null;
    }
    skiaModule = require('@shopify/react-native-skia') as SkiaModule;
  } catch (error) {
    console.warn('Deneme 4 Skia unavailable', error);
    skiaModule = null;
  }
  return skiaModule;
}

export type GlassTone = 'magenta' | 'cyan';
