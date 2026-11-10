import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, TurboModuleRegistry, View } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

type SkiaModule = typeof import('@shopify/react-native-skia');

const SKSL = `
uniform float uTime;
uniform float2 uSize;
uniform float uTone;

half4 main(float2 frag) {
  float2 uv = frag / max(uSize, float2(1.0));
  float2 p = uv - float2(0.50, 0.48);
  float t = uTime * 0.16;

  float a = sin(p.x * 3.1 + t) * sin(p.y * 2.4 - t * 0.7);
  float b = sin(p.x * 4.8 - t * 0.45 + p.y * 1.6);
  float cloud = 0.55 + 0.30 * a + 0.18 * b;

  float body = exp(-dot(p * float2(1.05, 1.2), p * float2(1.05, 1.2)) * 2.4);
  float2 drift = float2(0.14 * sin(t * 0.65), 0.07 * cos(t * 0.5));
  float wisp = exp(-dot(p - drift, p - drift) * 8.0);
  float glow = clamp(body * cloud * 0.26 + wisp * 0.06, 0.0, 0.2);

  half3 magenta = half3(1.0, 0.42, 0.82);
  half3 cyan = half3(0.42, 0.74, 1.0);
  half3 col = mix(magenta, cyan, uTone) * half(glow);
  return half4(col, half(glow));
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
    console.warn('Deneme 4 board wash unavailable', error);
    skiaModule = null;
  }
  return skiaModule;
}

function WashCanvas({ width, height, tone }: { width: number; height: number; tone: number }) {
  const skia = useMemo(() => loadSkia(), []);
  const effect = useMemo(() => {
    if (!skia) return null;
    if (compiledSource !== SKSL) {
      compiled = skia.Skia.RuntimeEffect.Make(SKSL);
      compiledSource = SKSL;
      if (!compiled) console.warn('Deneme 4 board wash failed to compile');
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
    uTone: tone,
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

function BoardWashComponent({ tone }: { tone: 'magenta' | 'cyan' }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  return (
    <View
      pointerEvents="none"
      style={styles.fill}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }}
    >
      <WashCanvas width={box.w} height={box.h} tone={tone === 'cyan' ? 1 : 0} />
    </View>
  );
}

export const BoardWash = memo(BoardWashComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
});
