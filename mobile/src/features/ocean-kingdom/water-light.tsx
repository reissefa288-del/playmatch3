import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, StyleSheet, TurboModuleRegistry, View } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

type SkiaModule = typeof import('@shopify/react-native-skia');

const WATER_SKSL = `
uniform float uTime;
uniform float2 uResolution;
uniform float uSand;

float mote(float2 uv, float2 seed, float t) {
  float y = fract(seed.y - t * (0.016 + seed.x * 0.018));
  float x = seed.x + sin(t * 0.32 + seed.y * 8.0) * 0.018;
  float d = length(uv - float2(x, y));
  return smoothstep(0.0075, 0.0, d);
}

half4 main(float2 frag) {
  float2 uv = frag / uResolution;
  float t = uTime;

  float sand = smoothstep(uSand - 0.06, uSand + 0.14, uv.y);
  float2 p = uv * float2(6.2, 4.0);
  float c = sin(p.x * 2.0 + t * 0.36) * sin(p.y * 1.65 - t * 0.28);
  c += sin((p.x + p.y * 0.8) * 2.3 + t * 0.2);
  // Soft sand caustics only — Poseidon art already has baked god rays.
  float caustic = smoothstep(0.22, 0.9, c * 0.3 + 0.5) * sand * 0.1;

  float motes = 0.0;
  motes += mote(uv, float2(0.12, 0.78), t);
  motes += mote(uv, float2(0.88, 0.7), t + 2.1);
  motes += mote(uv, float2(0.2, 0.55), t + 4.0);
  motes += mote(uv, float2(0.82, 0.48), t + 1.4);

  half3 col = half3(0.62, 0.9, 0.98) * half(caustic);
  col += half3(0.92, 0.97, 1.0) * half(motes * 0.55);
  float alpha = clamp(caustic + motes * 0.4, 0.0, 0.28);
  return half4(col, half(alpha));
}
`;

let skiaModule: SkiaModule | null | undefined;
let compiled: ReturnType<SkiaModule['Skia']['RuntimeEffect']['Make']> | undefined;
let compiledSource: string | undefined;

function loadSkia(): SkiaModule | null {
  if (skiaModule !== undefined) return skiaModule;
  try {
    if (TurboModuleRegistry.get('RNSkiaModule') == null) {
      skiaModule = null;
      return null;
    }
    skiaModule = require('@shopify/react-native-skia') as SkiaModule;
  } catch (error) {
    console.warn('Ocean Kingdom water light unavailable', error);
    skiaModule = null;
  }
  return skiaModule;
}

function waterEffect(skia: SkiaModule) {
  if (compiled !== undefined && compiledSource === WATER_SKSL) return compiled;
  compiled = skia.Skia.RuntimeEffect.Make(WATER_SKSL);
  compiledSource = WATER_SKSL;
  if (!compiled) console.warn('Ocean Kingdom water shader failed to compile');
  return compiled;
}

function WaterLightCanvas({ width, height, sandTop }: { width: number; height: number; sandTop: number }) {
  const skia = useMemo(() => loadSkia(), []);
  const effect = useMemo(() => (skia ? waterEffect(skia) : null), [skia]);
  const elapsed = useSharedValue(0);
  const last = useSharedValue(-1);
  const sand = useSharedValue(sandTop);
  const gate = useRef({ focus: true, app: AppState.currentState === 'active' });
  const frame = useFrameCallback((info) => {
    'worklet';
    if (last.value < 0) {
      last.value = info.timeSinceFirstFrame;
      return;
    }
    const dt = Math.min(34, info.timeSinceFirstFrame - last.value);
    last.value = info.timeSinceFirstFrame;
    elapsed.value += dt;
  }, true);

  useEffect(() => {
    sand.value = sandTop;
  }, [sand, sandTop]);

  const applyGate = useCallback(() => {
    frame.setActive(gate.current.focus && gate.current.app);
  }, [frame]);

  useFocusEffect(
    useCallback(() => {
      gate.current.focus = true;
      applyGate();
      return () => {
        gate.current.focus = false;
        frame.setActive(false);
      };
    }, [applyGate, frame]),
  );

  useEffect(() => {
    applyGate();
    const sub = AppState.addEventListener('change', (state) => {
      gate.current.app = state === 'active';
      applyGate();
    });
    return () => sub.remove();
  }, [applyGate]);

  const uniforms = useDerivedValue(() => ({
    uTime: elapsed.value / 1000,
    uResolution: [Math.max(width, 1), Math.max(height, 1)],
    uSand: sand.value,
  }));

  if (!skia || !effect || width < 2 || height < 2) return null;
  const { Canvas, Fill, Shader } = skia;
  return (
    <Canvas style={{ width, height }} opaque={false}>
      <Fill>
        <Shader source={effect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

function WaterLightComponent({ width, height, sandTop }: { width: number; height: number; sandTop: number }) {
  return (
    <View pointerEvents="none" style={styles.fill}>
      <WaterLightCanvas width={width} height={height} sandTop={sandTop} />
    </View>
  );
}

export const WaterLight = memo(WaterLightComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
});
