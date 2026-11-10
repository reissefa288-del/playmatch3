import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, StyleSheet, TurboModuleRegistry, View } from 'react-native';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

type SkiaModule = typeof import('@shopify/react-native-skia');

/**
 * Golden sun shimmer (upper sky only), downward waterfall streaks, and lagoon ripples.
 * Center of the board (mid screen) stays dark so tiles stay readable.
 */
const AZTEC_SKSL = `
uniform float uTime;
uniform float2 uResolution;

half4 main(float2 frag) {
  float2 uv = frag / uResolution;
  float t = uTime;

  float2 sun = float2(0.78, 0.0);
  float2 d = uv - sun;
  float ang = atan(d.y, d.x);
  float rays = pow(max(0.0, sin(ang * 11.0 + t * 0.28)), 6.0);
  float reach = smoothstep(0.72, 0.02, length(d));
  float sky = smoothstep(0.38, 0.02, uv.y);
  float sunAmt = rays * reach * sky * (0.11 + 0.035 * sin(t * 0.55));

  float column = smoothstep(0.40, 0.46, uv.x) * smoothstep(0.60, 0.54, uv.x);
  float band = smoothstep(0.14, 0.20, uv.y) * smoothstep(0.56, 0.46, uv.y);
  float flow = fract(uv.y * 5.5 - t * 0.62);
  float streak = smoothstep(0.22, 0.0, abs(flow - 0.45));
  float side = 0.0;
  side += smoothstep(0.18, 0.22, uv.x) * smoothstep(0.30, 0.26, uv.x);
  side += smoothstep(0.70, 0.74, uv.x) * smoothstep(0.86, 0.80, uv.x);
  float sideBand = smoothstep(0.28, 0.34, uv.y) * smoothstep(0.62, 0.52, uv.y);
  float fallAmt = streak * (column * band * 0.20 + side * sideBand * 0.10);

  float lagoon = smoothstep(0.60, 0.66, uv.y) * smoothstep(0.80, 0.72, uv.y);
  lagoon *= smoothstep(0.16, 0.26, uv.x) * smoothstep(0.84, 0.74, uv.x);
  float rip = sin(uv.x * 36.0 + t * 1.3) * sin(uv.y * 16.0 - t * 0.7);
  float ripAmt = smoothstep(0.45, 0.95, rip * 0.5 + 0.5) * lagoon * 0.14;

  float mote = 0.0;
  mote += smoothstep(0.012, 0.0, length(uv - float2(fract(0.2 + t * 0.02), 0.16 + sin(t) * 0.02)));
  mote += smoothstep(0.008, 0.0, length(uv - float2(fract(0.7 + t * 0.015), 0.22)));

  half3 col = half3(1.0, 0.82, 0.42) * half(sunAmt + mote * 0.25);
  col += half3(0.75, 0.95, 1.0) * half(fallAmt);
  col += half3(0.55, 0.95, 0.9) * half(ripAmt);
  float alpha = clamp(sunAmt + fallAmt + ripAmt + mote * 0.2, 0.0, 0.42);
  return half4(col, half(alpha));
}
`;

let skiaModule: SkiaModule | null | undefined;
let compiled: ReturnType<SkiaModule['Skia']['RuntimeEffect']['Make']> | undefined;

function loadSkia(): SkiaModule | null {
  if (skiaModule !== undefined) return skiaModule;
  try {
    if (TurboModuleRegistry.get('RNSkiaModule') == null) {
      skiaModule = null;
      return null;
    }
    skiaModule = require('@shopify/react-native-skia') as SkiaModule;
  } catch (error) {
    console.warn('Aztec light unavailable', error);
    skiaModule = null;
  }
  return skiaModule;
}

function AztecLightCanvas({ width, height }: { width: number; height: number }) {
  const skia = useMemo(() => loadSkia(), []);
  const effect = useMemo(() => {
    if (!skia) return null;
    if (!compiled) compiled = skia.Skia.RuntimeEffect.Make(AZTEC_SKSL);
    if (!compiled) console.warn('Aztec light shader failed to compile');
    return compiled;
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
    const dt = Math.min(34, info.timeSinceFirstFrame - last.value);
    last.value = info.timeSinceFirstFrame;
    elapsed.value += dt;
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
    uResolution: [Math.max(width, 1), Math.max(height, 1)],
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

function AztecLightComponent({ width, height }: { width: number; height: number }) {
  return (
    <View pointerEvents="none" style={styles.fill}>
      <AztecLightCanvas width={width} height={height} />
    </View>
  );
}

export const AztecLight = memo(AztecLightComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
