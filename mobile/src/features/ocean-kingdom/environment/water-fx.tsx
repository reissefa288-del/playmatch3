import { memo, useMemo } from 'react';
import { StyleSheet, TurboModuleRegistry, View } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

type SkiaModule = typeof import('@shopify/react-native-skia');

const OCEAN_FX = `
uniform float uTime;
uniform float2 uResolution;

float bubble(float2 uv, float sx, float sy, float rad, float speed, float phase) {
  float y = fract(sy - uTime * speed);
  float x = sx + sin(uTime * 0.7 + phase) * 0.015;
  float2 d = (uv - float2(x, y)) * float2(uResolution.x / uResolution.y, 1.0);
  float dist = length(d);
  float rim = smoothstep(rad, rad * 0.76, dist) * smoothstep(rad * 0.42, rad * 0.7, dist);
  float hi = smoothstep(rad * 0.38, 0.0, length(d - float2(-rad * 0.3, -rad * 0.28)));
  float fade = smoothstep(0.0, 0.08, y) * smoothstep(1.0, 0.84, y);
  return (rim * 0.7 + hi * 0.95) * fade;
}

half4 main(float2 frag) {
  float2 uv = frag / uResolution;
  float t = uTime;
  float sway = sin(t * 0.32) * 0.02;
  float x = uv.x - 0.5 + sway * uv.y;
  float spread = 0.03 + uv.y * 0.1;
  float rays = smoothstep(spread * 0.85, 0.0, abs(x));
  rays += smoothstep(spread * 0.5, 0.0, abs(x - 0.09 - uv.y * 0.04)) * 0.62;
  rays += smoothstep(spread * 0.46, 0.0, abs(x + 0.08 + uv.y * 0.035)) * 0.55;
  rays += smoothstep(spread * 0.32, 0.0, abs(x - 0.18 - uv.y * 0.07)) * 0.35;
  rays += smoothstep(spread * 0.3, 0.0, abs(x + 0.16 + uv.y * 0.06)) * 0.32;
  float falloff = smoothstep(0.92, 0.05, uv.y);
  float pulse = 0.78 + 0.22 * sin(t * 0.75 + uv.y * 5.0);
  rays = rays * falloff * pulse * 0.2;

  float sand = smoothstep(0.62, 0.84, uv.y);
  float2 p = uv * float2(7.5, 4.2);
  float c = sin(p.x * 2.1 + t * 0.45) * sin(p.y * 1.7 - t * 0.32);
  c += sin((p.x + p.y) * 1.8 + t * 0.22);
  float caustic = smoothstep(0.15, 0.9, c * 0.35 + 0.5) * sand * 0.16;

  float bubbles = 0.0;
  bubbles += bubble(uv, 0.08, 0.2, 0.012, 0.045, 0.4);
  bubbles += bubble(uv, 0.14, 0.55, 0.018, 0.038, 1.2);
  bubbles += bubble(uv, 0.18, 0.82, 0.01, 0.05, 2.1);
  bubbles += bubble(uv, 0.11, 0.4, 0.008, 0.055, 3.0);
  bubbles += bubble(uv, 0.22, 0.15, 0.014, 0.034, 4.2);
  bubbles += bubble(uv, 0.8, 0.3, 0.016, 0.042, 0.8);
  bubbles += bubble(uv, 0.88, 0.62, 0.011, 0.05, 1.7);
  bubbles += bubble(uv, 0.93, 0.18, 0.009, 0.06, 2.6);
  bubbles += bubble(uv, 0.76, 0.78, 0.013, 0.036, 5.1);
  bubbles += bubble(uv, 0.84, 0.48, 0.007, 0.07, 3.4);

  float motes = 0.0;
  motes += smoothstep(0.004, 0.0, length(uv - float2(0.16, fract(0.7 - t * 0.02))));
  motes += smoothstep(0.0035, 0.0, length(uv - float2(0.86, fract(0.4 - t * 0.025))));
  motes += smoothstep(0.003, 0.0, length(uv - float2(0.24 + sin(t * 0.4) * 0.01, fract(0.9 - t * 0.018))));

  float top = smoothstep(0.18, 0.0, uv.y) * 0.07;
  half3 col = half3(0.78, 0.93, 1.0) * half(rays + top);
  col += half3(1.0, 0.97, 0.86) * half(caustic);
  col += half3(0.94, 0.98, 1.0) * half(bubbles + motes);
  float alpha = clamp(rays + top + caustic + bubbles * 1.15 + motes * 0.7, 0.0, 0.62);
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
    console.warn('Ocean light unavailable', error);
    skiaModule = null;
  }
  return skiaModule;
}

function oceanEffect(skia: SkiaModule) {
  if (compiled !== undefined) return compiled;
  compiled = skia.Skia.RuntimeEffect.Make(OCEAN_FX);
  if (!compiled) console.warn('Ocean light shader failed to compile');
  return compiled;
}

function WaterFxCanvas({ width, height, time }: { width: number; height: number; time: SharedValue<number> }) {
  const skia = useMemo(() => loadSkia(), []);
  const effect = useMemo(() => (skia ? oceanEffect(skia) : null), [skia]);
  const uniforms = useDerivedValue(() => ({
    uTime: time.value / 1000,
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

function WaterFxComponent({ width, height, time }: { width: number; height: number; time: SharedValue<number> }) {
  return (
    <View pointerEvents="none" style={styles.fill} collapsable={false}>
      <WaterFxCanvas width={width} height={height} time={time} />
    </View>
  );
}

export const WaterFx = memo(WaterFxComponent);

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 0, elevation: 0 },
});
