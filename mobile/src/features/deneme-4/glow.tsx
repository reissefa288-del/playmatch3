import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, StyleSheet, TurboModuleRegistry, View, useWindowDimensions } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

type SkiaModule = typeof import('@shopify/react-native-skia');

const SKSL = `
uniform float uTime;
uniform float2 uSize;

half4 main(float2 frag) {
  float2 uv = frag / max(uSize, float2(1.0));
  float t = uTime;
  float2 far = uv + float2(0.02 * sin(t * 0.11), 0.008 * cos(t * 0.09));
  float2 near = uv + float2(0.045 * sin(t * 0.17 + 1.2), 0.012 * cos(t * 0.13));

  float haze = sin(far.x * 8.0 + t * 0.15) * sin(far.y * 6.0 - t * 0.1);
  haze += 0.45 * sin(far.x * 15.0 - far.y * 7.0 + t * 0.07);
  float fog = (0.045 + 0.03 * haze) * smoothstep(0.05, 0.9, far.y);

  float mistN = sin(near.x * 10.0 + t * 0.2) * sin(near.y * 8.0 - t * 0.12);
  float mist = exp(-pow(near.y - 0.9, 2.0) * 16.0) * (0.1 + 0.045 * mistN);
  mist += exp(-pow(near.y - 0.48, 2.0) * 22.0) * (0.035 + 0.02 * mistN);

  float2 up = uv - float2(0.5, 0.3);
  float magenta = exp(-dot(up * float2(0.95, 1.35), up * float2(0.95, 1.35)) * 1.7);
  float2 down = uv - float2(0.5, 0.7);
  float cyan = exp(-dot(down * float2(0.95, 1.35), down * float2(0.95, 1.35)) * 1.7);
  float middle = exp(-pow(uv.y - 0.5, 2.0) * 8.0);

  float2 moon = uv - float2(0.84, 0.06);
  float moonLight = exp(-dot(moon, moon) * 8.0) * (0.12 + 0.03 * sin(t * 0.5));
  float2 tree = uv - float2(0.1, 0.07);
  float treeLight = exp(-dot(tree, tree) * 12.0) * (0.08 + 0.02 * sin(t * 0.4 + 1.1));

  float sparks = 0.0;
  float2 s0 = float2(0.16 + 0.02 * sin(t * 0.33), 0.2 + 0.015 * cos(t * 0.29));
  float2 s1 = float2(0.78 + 0.02 * cos(t * 0.27), 0.16 + 0.012 * sin(t * 0.31));
  float2 s2 = float2(0.42 + 0.03 * sin(t * 0.22), 0.46 + 0.01 * cos(t * 0.25));
  float2 s3 = float2(0.24 + 0.02 * cos(t * 0.3), 0.74 + 0.014 * sin(t * 0.21));
  float2 s4 = float2(0.7 + 0.025 * sin(t * 0.26), 0.68 + 0.012 * cos(t * 0.24));
  float2 s5 = float2(0.55 + 0.02 * cos(t * 0.19), 0.86 + 0.01 * sin(t * 0.28));
  sparks += exp(-dot(uv - s0, uv - s0) * 1400.0);
  sparks += exp(-dot(uv - s1, uv - s1) * 1500.0);
  sparks += exp(-dot(uv - s2, uv - s2) * 1300.0);
  sparks += exp(-dot(uv - s3, uv - s3) * 1600.0);
  sparks += exp(-dot(uv - s4, uv - s4) * 1450.0);
  sparks += exp(-dot(uv - s5, uv - s5) * 1550.0);

  half3 col = half3(1.0, 0.38, 0.78) * half(magenta * 0.16);
  col += half3(0.38, 0.74, 1.0) * half(cyan * 0.15);
  col += half3(0.62, 0.4, 0.9) * half(middle * 0.07);
  col += half3(0.78, 0.7, 1.0) * half(fog + mist);
  col += half3(0.86, 0.8, 1.0) * half(moonLight);
  col += half3(1.0, 0.55, 0.86) * half(treeLight);
  col += half3(1.0, 0.92, 0.78) * half(sparks * 0.55);
  float alpha = clamp(magenta * 0.16 + cyan * 0.15 + middle * 0.06 + fog + mist + moonLight + treeLight + sparks * 0.45, 0.0, 0.4);
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
    console.warn('Deneme 4 light unavailable', error);
    skiaModule = null;
  }
  return skiaModule;
}

function LightCanvas({ width, height }: { width: number; height: number }) {
  const skia = useMemo(() => loadSkia(), []);
  const effect = useMemo(() => {
    if (!skia) return null;
    if (compiledSource !== SKSL) {
      compiled = skia.Skia.RuntimeEffect.Make(SKSL);
      compiledSource = SKSL;
      if (!compiled) console.warn('Deneme 4 light shader failed to compile');
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
    uSize: [width, height],
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

function NightGlowComponent() {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LightCanvas width={width} height={height} />
    </View>
  );
}

export const NightGlow = memo(NightGlowComponent);
