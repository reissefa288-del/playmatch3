import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, StyleSheet, TurboModuleRegistry, View } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

type SkiaModule = typeof import('@shopify/react-native-skia');

const SKSL = `
uniform float uTime;
uniform float4 uPlate;

float flame(float2 uv, float2 p, float t, float seed) {
  float2 q = uv - p;
  float flick = 0.7 + 0.3 * sin(t * 8.5 + seed);
  q.x += sin(t * 14.0 + seed + q.y * 50.0) * 0.003;
  float rise = -q.y;
  float h = 0.03 * flick;
  float halfW = max(0.010 * flick * (1.0 - smoothstep(0.0, h, rise)), 0.001);
  float mask = 1.0 - smoothstep(halfW * 0.15, halfW, abs(q.x));
  mask *= smoothstep(-0.002, 0.006, rise);
  mask *= (1.0 - smoothstep(h * 0.4, h, rise));
  return mask * flick;
}

half4 main(float2 frag) {
  float2 uv = (frag - uPlate.xy) / uPlate.zw;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return half4(0.0, 0.0, 0.0, 0.0);
  }
  float t = uTime;

  float2 fromSun = uv - float2(0.50, 0.12);
  float beam = smoothstep(0.42, 0.0, abs(fromSun.x) / max(fromSun.y, 0.03));
  float reach = smoothstep(0.0, 0.04, fromSun.y) * smoothstep(0.40, 0.12, uv.y);
  float pulse = 0.78 + 0.22 * sin(t * 0.55);
  float rays = beam * reach * pulse * 0.18;

  float side = smoothstep(0.18, 0.06, uv.x) + smoothstep(0.82, 0.94, uv.x);
  float falls = side * smoothstep(0.28, 0.40, uv.y) * smoothstep(0.84, 0.68, uv.y);
  float pool = smoothstep(0.90, 0.98, uv.y) * smoothstep(0.08, 0.2, uv.x) * smoothstep(0.92, 0.8, uv.x);
  float rip = sin(uv.y * 46.0 + t * 1.6) * sin(uv.x * 18.0 - t * 0.7);
  float shimmer = smoothstep(0.25, 0.95, rip * 0.5 + 0.5);
  float water = (falls * 0.16 + pool * 0.22) * (0.45 + 0.55 * shimmer);

  float fire = 0.0;
  fire += flame(uv, float2(0.09, 0.50), t, 1.1);
  fire += flame(uv, float2(0.09, 0.67), t, 2.4);
  fire += flame(uv, float2(0.90, 0.51), t, 3.2);
  fire += flame(uv, float2(0.91, 0.68), t, 4.6);

  half3 col = half3(1.0, 0.93, 0.72) * half(rays);
  col += half3(0.55, 0.95, 0.92) * half(water);
  col += half3(1.0, 0.62, 0.18) * half(fire);
  float alpha = clamp(rays + water + fire * 0.85, 0.0, 0.72);
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
    console.warn('Aztec Match light unavailable', error);
    skiaModule = null;
  }
  return skiaModule;
}

function LightCanvas({
  width,
  height,
  plate,
}: {
  width: number;
  height: number;
  plate: { x: number; y: number; w: number; h: number };
}) {
  const skia = useMemo(() => loadSkia(), []);
  const effect = useMemo(() => {
    if (!skia) return null;
    if (compiledSource !== SKSL) {
      compiled = skia.Skia.RuntimeEffect.Make(SKSL);
      compiledSource = SKSL;
      if (!compiled) console.warn('Aztec Match light shader failed to compile');
    }
    return compiled ?? null;
  }, [skia]);
  const elapsed = useSharedValue(0);
  const last = useSharedValue(-1);
  const gate = useRef({ focus: true, app: AppState.currentState === 'active' });
  const frame = useFrameCallback((info) => {
    'worklet';
    if (last.value < 0) {
      last.value = info.timeSinceFirstFrame;
      return;
    }
    elapsed.value += Math.min(34, info.timeSinceFirstFrame - last.value);
    last.value = info.timeSinceFirstFrame;
  }, true);

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
    uPlate: [plate.x, plate.y, Math.max(plate.w, 1), Math.max(plate.h, 1)],
  }));

  if (!skia || !effect || width < 2 || height < 2) return null;
  const { Canvas, Fill, Shader } = skia;
  return (
    <Canvas style={{ width, height, elevation: 0 }} opaque={false}>
      <Fill>
        <Shader source={effect} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

function AztecMatchLightComponent({
  width,
  height,
  plate,
}: {
  width: number;
  height: number;
  plate: { x: number; y: number; w: number; h: number };
}) {
  return (
    <View pointerEvents="none" style={styles.fill}>
      <LightCanvas width={width} height={height} plate={plate} />
    </View>
  );
}

export const AztecMatchLight = memo(AztecMatchLightComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
