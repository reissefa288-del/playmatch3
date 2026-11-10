import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uIntensity;

const vec3 C_CYAN    = vec3(0.42, 0.96, 1.00);
const vec3 C_MINT    = vec3(0.22, 0.98, 0.82);
const vec3 C_DEEP    = vec3(0.04, 0.28, 0.48);
const vec3 C_PALE    = vec3(0.88, 1.00, 0.98);

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Perspective water ring: thin neon core + soft bloom + traveling sheen.
vec4 waterRing(
  vec2 uv,
  vec2 center,
  float phase,
  vec2 startR,
  vec2 endR,
  float thickScale,
  float weight
) {
  float p = fract(phase);
  // Ease-out expansion feels like a real ripple
  float ease = 1.0 - pow(1.0 - p, 1.65);
  vec2 radii = mix(startR, endR, ease);

  // Subtle surface wobble so rings aren't rigid ellipses
  vec2 d = (uv - center) / max(radii, vec2(1e-4));
  float ang = atan(d.y, d.x);
  float wobble = 1.0 + 0.018 * sin(ang * 3.0 + phase * 6.2831853 * 0.4)
                     + 0.010 * sin(ang * 7.0 - phase * 4.0);
  float e = length(d) / wobble;
  float dist = abs(e - 1.0);

  float thick = 0.038 * thickScale;
  float core = 1.0 - smoothstep(thick * 0.12, thick, dist);
  float bloom = exp(-pow(dist / (thick * 2.8), 2.0));
  float outer = exp(-pow(max(e - 1.0, 0.0) / (thick * 3.6), 2.0));

  // Traveling dual sheen around the ring (AAA rim language)
  float flow = ang / 6.2831853 + 0.5;
  float sheenA = exp(-pow((fract(flow - phase * 0.62) - 0.16) * 11.0, 2.0));
  float sheenB = exp(-pow((fract(flow + 0.48 - phase * 0.36) - 0.20) * 9.0, 2.0));
  float sheen = sheenA * 1.05 + sheenB * 0.55;

  // Caustic breakup — ring intensity varies like broken water light
  float caust = 0.48 + 0.52 * pow(abs(sin(ang * 5.0 + phase * 3.2)), 2.4);
  caust *= 0.65 + 0.35 * pow(abs(sin(ang * 11.0 - phase * 2.1)), 1.8);

  // Birth / death envelope
  float fade = smoothstep(0.0, 0.09, p) * smoothstep(1.0, 0.48, p);
  // Near rings brighter; far rings thinner & cooler
  float life = mix(1.25, 0.5, ease);

  float mask = (core * 1.45 + bloom * 0.72 + outer * 0.28) * fade * life * caust * weight;
  mask *= 0.68 + sheen * 0.72;

  vec3 tint = mix(C_CYAN, C_MINT, ease * 0.5 + sheenA * 0.3);
  tint = mix(tint, C_PALE, sheen * 0.7 + core * 0.28);

  return vec4(tint * mask, mask);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  float t = uTime;
  float intensity = clamp(uIntensity, 0.0, 1.5);
  float aspect = max(uRes.x, 1.0) / max(uRes.y, 1.0);

  vec2 cardP = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 cardB = vec2(aspect * 0.5, 0.5);
  float cardSd = sdRoundBox(cardP, cardB, 0.46);
  float cardMask = 1.0 - smoothstep(-0.01, 0.02, cardSd);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  // Quiet water surface — stronger near the pin, soft elsewhere
  float w1 = sin(uv.x * 16.0 + t * 0.48 + uv.y * 3.0);
  float w2 = sin(uv.x * 7.2 - t * 0.32 + uv.y * 10.0);
  float w3 = sin(uv.x * 28.0 + uv.y * 14.0 - t * 0.9);
  float caust = pow(abs(w1 * w2), 1.55) * (0.65 + 0.35 * abs(w3));
  float water = caust * smoothstep(0.10, 0.52, uv.y) * (0.5 + 0.5 * sin(uv.y * 9.0 - t * 0.4));
  float waterSide = 0.35 + 1.15 * smoothstep(0.58, 0.84, uv.x);
  vec3 waterCol = mix(C_DEEP, C_CYAN, caust);
  col += waterCol * water * 0.38 * waterSide;
  alpha += water * 0.12 * waterSide;

  // —— AAA water rings under the pin tip ——
  vec2 c = vec2(0.764, 0.63);
  // Wide × short = foreshortened ground plane
  vec2 startR = vec2(0.026, 0.011);
  vec2 endR = vec2(0.155, 0.060);

  float breath = 0.92 + 0.08 * sin(t * 1.15);
  float speed = 0.145;

  vec4 r0 = waterRing(uv, c, t * speed,         startR, endR, 0.95, 1.05);
  vec4 r1 = waterRing(uv, c, t * speed + 0.333, startR, endR, 0.88, 0.88);
  vec4 r2 = waterRing(uv, c, t * speed + 0.666, startR, endR, 0.82, 0.70);
  vec4 rings = (r0 + r1 + r2) * breath;

  // Soft lit pool under the tip (contact glow)
  vec2 poolUv = (uv - c) / vec2(0.052, 0.022);
  float pool = exp(-dot(poolUv, poolUv)) * 0.55;
  float poolEdge = exp(-pow(abs(length(poolUv) - 0.85) / 0.22, 2.0)) * 0.35;
  // Specular glint at pin contact
  float glint = exp(-pow(length((uv - c) * vec2(aspect * 1.8, 3.6)) / 0.018, 2.0));
  glint *= 0.55 + 0.45 * sin(t * 2.4);

  vec3 poolCol = mix(C_MINT, C_CYAN, 0.4);
  col += rings.rgb * 1.55;
  col += poolCol * (pool * 0.9 + poolEdge * 0.8);
  col += C_PALE * glint * 1.05;
  alpha += rings.a * 1.05 + pool * 0.34 + poolEdge * 0.3 + glint * 0.6;

  // Micro sparkles on the water plane (sparse, AAA dust)
  vec2 cell = floor((uv - c) * vec2(42.0, 18.0));
  vec2 fuv = fract((uv - c) * vec2(42.0, 18.0)) - 0.5;
  float id = hash21(cell);
  float spark = smoothstep(0.14, 0.0, length(fuv)) * step(0.93, id);
  spark *= 0.5 + 0.5 * sin(t * (1.4 + id * 2.0) + id * 20.0);
  float sparkGate = smoothstep(0.55, 0.70, uv.x) * (1.0 - smoothstep(0.92, 0.98, uv.x));
  sparkGate *= smoothstep(0.48, 0.58, uv.y) * (1.0 - smoothstep(0.82, 0.92, uv.y));
  col += C_PALE * spark * 0.65 * sparkGate;
  alpha += spark * 0.35 * sparkGate;

  // Three dots in the original spots: upper-left, lower-left, right. Soft vertical bob only.
  vec2 d0 = vec2(0.637, 0.425 + sin(t * 1.05) * 0.008);
  vec2 d1 = vec2(0.618, 0.662 + sin(t * 1.05 + 1.7) * 0.008);
  vec2 d2 = vec2(0.848, 0.468 + sin(t * 1.05 + 3.4) * 0.008);
  float b0 = exp(-pow(length((uv - d0) * vec2(aspect, 1.0)) / 0.034, 2.0));
  float b1 = exp(-pow(length((uv - d1) * vec2(aspect, 1.0)) / 0.034, 2.0));
  float b2 = exp(-pow(length((uv - d2) * vec2(aspect, 1.0)) / 0.032, 2.0));
  col += vec3(0.75, 1.0, 1.0) * b0 + vec3(0.55, 1.0, 0.95) * b1 + vec3(0.45, 0.98, 0.9) * b2;
  alpha += b0 + b1 + b2;

  alpha *= cardMask * intensity;
  alpha = clamp(alpha, 0.0, 0.90);
  gl_FragColor = vec4(col * alpha, alpha);
}
`

type CheckInWaveShaderProps = {
  intensity?: number
}

export function CheckInWaveShader({ intensity = 1 }: CheckInWaveShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    const parent = root?.parentElement
    if (!canvas || !root || !parent) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    })
    if (!gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    gl.useProgram(program)
    const pos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uIntensity = gl.getUniformLocation(program, 'uIntensity')

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const started = performance.now()
    let frame = 0
    let running = true
    let shown = false

    const resize = () => {
      const width = parent.clientWidth
      const height = parent.clientHeight
      if (width < 2 || height < 2) return false
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = Math.max(2, Math.round(width * dpr))
      const h = Math.max(2, Math.round(height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
      return true
    }

    const draw = (now: number) => {
      if (!running) return
      if (!resize()) {
        frame = window.requestAnimationFrame(draw)
        return
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, reduce ? 0.8 : (now - started) / 1000)
      gl.uniform1f(uIntensity, intensity)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      if (!shown) {
        shown = true
        root.classList.add('is-ready')
      }
      frame = reduce ? 0 : window.requestAnimationFrame(draw)
    }

    const onHide = () => {
      if (document.hidden) {
        running = false
        if (frame) window.cancelAnimationFrame(frame)
        frame = 0
      } else if (!running) {
        running = true
        frame = window.requestAnimationFrame(draw)
      }
    }

    const observer = new ResizeObserver(() => {
      resize()
    })
    observer.observe(parent)
    document.addEventListener('visibilitychange', onHide)
    frame = window.requestAnimationFrame(draw)

    return () => {
      running = false
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onHide)
      root.classList.remove('is-ready')
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [intensity])

  return (
    <span className="pm-checkin-wave" ref={rootRef} aria-hidden>
      <canvas ref={canvasRef} />
    </span>
  )
}
