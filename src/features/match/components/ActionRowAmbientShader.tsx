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

// Filter-aligned: location blue, gender violet, online cyan/mint
const vec3 C_LOC     = vec3(0.24, 0.55, 1.0);   // #3d8cff
const vec3 C_VIOLET  = vec3(0.49, 0.53, 0.95);  // #7d86f2
const vec3 C_MAGENTA = vec3(0.72, 0.45, 1.0);   // gender + heart accent
const vec3 C_ONLINE  = vec3(0.23, 0.85, 0.82);  // #3ad8d0
const vec3 C_MINT    = vec3(0.00, 0.93, 0.62);  // #00ee9d
const vec3 C_ICE     = vec3(0.88, 0.96, 1.0);

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float softDisc(vec2 uv, vec2 c, vec2 scale) {
  vec2 p = (uv - c) / max(scale, vec2(1e-4));
  return exp(-dot(p, p) * 2.8);
}

float ringGlow(vec2 uv, vec2 c, float radius, float thickness, float aspect) {
  vec2 d = (uv - c) * vec2(aspect, 1.0);
  float r = length(d);
  return exp(-pow((r - radius) / max(thickness, 1e-4), 2.0));
}

void main() {
  vec2 uv = vUv;
  float aspect = max(uRes.x / max(uRes.y, 1.0), 1e-4);
  float t = uTime;
  float breath = 0.90 + 0.10 * sin(t * 0.7);
  float intensity = clamp(uIntensity, 0.0, 1.5) * breath;

  // Five button centers across the row (center heart slightly larger aura)
  vec2 c0 = vec2(0.10, 0.50);
  vec2 c1 = vec2(0.30, 0.50);
  vec2 c2 = vec2(0.50, 0.50);
  vec2 c3 = vec2(0.70, 0.50);
  vec2 c4 = vec2(0.90, 0.50);

  float a0 = softDisc(uv, c0, vec2(0.085, 0.38));
  float a1 = softDisc(uv, c1, vec2(0.085, 0.38));
  float a2 = softDisc(uv, c2, vec2(0.125, 0.52));
  float a3 = softDisc(uv, c3, vec2(0.085, 0.38));
  float a4 = softDisc(uv, c4, vec2(0.085, 0.38));

  // Breathing orbital rings (additive, restrained)
  float r0 = ringGlow(uv, c0, 0.055, 0.012, aspect) * (0.55 + 0.45 * sin(t * 0.9));
  float r1 = ringGlow(uv, c1, 0.055, 0.012, aspect) * (0.55 + 0.45 * sin(t * 0.95 + 1.2));
  float r2a = ringGlow(uv, c2, 0.078, 0.014, aspect) * (0.65 + 0.35 * sin(t * 0.85 + 0.4));
  float r2b = ringGlow(uv, c2, 0.105, 0.016, aspect) * (0.45 + 0.35 * sin(t * 0.7 + 2.1));
  float r3 = ringGlow(uv, c3, 0.055, 0.012, aspect) * (0.55 + 0.45 * sin(t * 0.88 + 2.4));
  float r4 = ringGlow(uv, c4, 0.055, 0.012, aspect) * (0.55 + 0.45 * sin(t * 0.92 + 3.1));

  // Soft connecting energy ribbon under the row
  float ribbonY = abs(uv.y - 0.50);
  float ribbon = exp(-ribbonY * ribbonY * 55.0) * 0.12;
  ribbon *= smoothstep(0.06, 0.18, uv.x) * smoothstep(0.94, 0.82, uv.x);
  float flow = 0.5 + 0.5 * sin(uv.x * 10.0 - t * 0.8);
  ribbon *= 0.55 + 0.45 * flow;

  // Sparse sparkle dust near buttons
  vec2 cell = floor(uv * vec2(36.0, 10.0));
  vec2 fuv = fract(uv * vec2(36.0, 10.0)) - 0.5;
  float id = hash21(cell);
  float spark = smoothstep(0.16, 0.0, length(fuv)) * step(0.93, id);
  spark *= 0.5 + 0.5 * sin(t * (1.4 + id * 2.0) + id * 18.0);

  vec3 col =
    C_LOC * (a0 * 0.22 + r0 * 0.55) +
    C_VIOLET * (a1 * 0.24 + r1 * 0.6) +
    C_MAGENTA * (a2 * 0.32 + r2a * 0.7 + r2b * 0.45) +
    mix(C_ONLINE, C_VIOLET, 0.45) * (a3 * 0.24 + r3 * 0.55) +
    C_MINT * (a4 * 0.22 + r4 * 0.55) +
    mix(C_LOC, C_MINT, uv.x) * ribbon +
    C_ICE * spark * 0.35;

  float alpha =
    a0 * 0.12 + a1 * 0.13 + a2 * 0.18 + a3 * 0.13 + a4 * 0.12 +
    r0 * 0.28 + r1 * 0.3 + r2a * 0.35 + r2b * 0.22 + r3 * 0.28 + r4 * 0.28 +
    ribbon * 0.55 +
    spark * 0.25;

  // Keep glow near the button band; fade top/bottom
  float band = smoothstep(0.08, 0.28, uv.y) * smoothstep(0.92, 0.72, uv.y);
  alpha *= band * intensity;
  alpha = clamp(alpha, 0.0, 0.55);

  gl_FragColor = vec4(col * alpha, alpha);
}
`

type ActionRowAmbientShaderProps = {
  intensity?: number
}

export function ActionRowAmbientShader({ intensity = 1 }: ActionRowAmbientShaderProps) {
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
      gl.uniform1f(uTime, reduce ? 0.7 : (now - started) / 1000)
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
    <span className="pm-match-actions__shader" ref={rootRef} aria-hidden>
      <canvas ref={canvasRef} />
    </span>
  )
}
