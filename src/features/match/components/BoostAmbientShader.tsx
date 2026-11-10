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
uniform vec2 uPointer;

// Deep navy #07182B, muted amber #D58B55, champagne #F3BFA0, pale gold #F5D9B8
const vec3 C_AMBER     = vec3(0.8353, 0.5451, 0.3333);
const vec3 C_CHAMPAGNE = vec3(0.9529, 0.7490, 0.6275);
const vec3 C_PALE      = vec3(0.9608, 0.8510, 0.7216);
const vec3 C_COPPER    = vec3(0.62, 0.40, 0.28);

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.1, 9.7);
    a *= 0.5;
  }
  return v;
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float ellipseRing(vec2 p, vec2 c, vec2 radii, float thickness) {
  vec2 d = (p - c) / max(radii, vec2(1e-4));
  float e = abs(length(d) - 1.0);
  return exp(-pow(e / max(thickness, 1e-4), 2.0));
}

void main() {
  vec2 uv = vUv;
  float aspect = max(uRes.x / max(uRes.y, 1.0), 1e-4);

  float t = uTime;
  float breath = 0.94 + 0.06 * sin(t * 0.48);
  float intensity = clamp(uIntensity, 0.0, 1.5) * breath;

  vec2 cardHalf = vec2(0.492, 0.455);
  float corner = 0.455;
  float cardSd = sdRoundBox(uv - 0.5, cardHalf, corner);
  float cardMask = 1.0 - smoothstep(-0.012, 0.01, cardSd);
  float edgeBand = 1.0 - smoothstep(-0.055, 0.008, cardSd);
  float rim = exp(-pow(cardSd / 0.018, 2.0));

  // Calm readable center (title / note zone)
  float textCalm = smoothstep(0.16, 0.42, uv.x) * smoothstep(0.72, 0.48, uv.x);
  textCalm *= smoothstep(0.14, 0.40, uv.y) * smoothstep(0.88, 0.58, uv.y);
  float effectGate = 1.0 - textCalm * 0.9;

  vec2 ptr = mix(vec2(0.5), clamp(uPointer, 0.0, 1.0), 0.6);
  vec2 parallax = (ptr - 0.5) * 0.035;

  // Additive light only — dark wash disappears on the opaque card art
  float wash = fbm(uv * 2.2 + t * 0.025 + parallax);
  float nebA = fbm(uv * 1.6 + vec2(t * 0.014, -t * 0.01) + parallax);
  float nebB = fbm(uv * 2.4 - vec2(t * 0.008, t * 0.016) - parallax * 0.5);
  vec3 col = C_AMBER * nebA * 0.22 * effectGate + C_CHAMPAGNE * nebB * 0.14 * effectGate;
  col += C_COPPER * wash * 0.08 * effectGate;

  // Sparse warm dust particles
  vec2 starCell = floor(uv * vec2(24.0, 10.0));
  vec2 starUv = fract(uv * vec2(24.0, 10.0)) - 0.5;
  float starId = hash21(starCell);
  float star = smoothstep(0.16, 0.0, length(starUv)) * step(0.94, starId);
  float twinkle = 0.6 + 0.4 * sin(t * (1.0 + starId * 1.6) + starId * 18.0);
  col += C_PALE * star * twinkle * 0.55 * effectGate;

  // Light sweep across card (gentle, no flash)
  float sweep = uv.x * 1.15 + uv.y * 0.35 - t * 0.07;
  float sweepBand = pow(max(0.0, sin(sweep * 6.2831)), 14.0);
  sweepBand *= 0.55 + 0.2 * sin(t * 0.35);
  col += mix(C_CHAMPAGNE, C_PALE, 0.45) * sweepBand * effectGate;

  // ——— Lightning / energy motif (left icon zone) ———
  vec2 boltC = vec2(0.105, 0.50) + parallax * 0.3;
  float boltGate = (1.0 - smoothstep(0.06, 0.28, uv.x)) * effectGate;

  float a1 = ellipseRing(uv, boltC, vec2(0.07, 0.22), 0.05);
  float a2 = ellipseRing(uv, boltC, vec2(0.11, 0.34), 0.042);
  float arcs = (a1 * 0.45 + a2 * 0.32) * boltGate;

  // Flowing energy ribbon from bolt toward CTA
  float flowX = uv.x + sin(uv.y * 8.0 + t * 0.7) * 0.012;
  float flow = smoothstep(0.08, 0.22, flowX) * smoothstep(0.92, 0.62, flowX);
  float ribbon = abs(sin((flowX * 2.4 - uv.y * 0.9 - t * 0.22) * 6.2831));
  ribbon = pow(1.0 - ribbon, 10.0) * flow * 0.55 * effectGate;

  // Tiny warm particles near bolt
  float parts = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float ang = fi * 1.47 + t * (0.15 + fi * 0.025);
    vec2 off = vec2(cos(ang), sin(ang) * 1.25) * (0.055 + fi * 0.014);
    float d = length((uv - (boltC + off)) * vec2(aspect, 1.0));
    parts += exp(-d * d * 1600.0) * (0.28 - fi * 0.04);
  }
  parts *= boltGate;

  float boltCore = exp(-pow(length((uv - boltC) * vec2(2.6, 2.1)) * 3.2, 2.0));
  boltCore *= boltGate;

  col += mix(C_AMBER, C_CHAMPAGNE, 0.45) * (arcs * 1.35 + ribbon * 1.15 + parts * 1.4 + boltCore * 1.6);

  // ——— CTA highlight (right, brighter amber, not solid neon) ———
  vec2 ctaC = vec2(0.82, 0.50);
  float ctaGate = smoothstep(0.58, 0.78, uv.x);
  float ctaPill = exp(-pow(length((uv - ctaC) * vec2(1.15, 2.8)) * 2.1, 2.0));
  float ctaRim = ellipseRing(uv, ctaC, vec2(0.16, 0.14), 0.07);
  float ctaGlow = (ctaPill * 0.7 + ctaRim * 0.85) * ctaGate;
  col += mix(C_AMBER, C_PALE, 0.4) * ctaGlow * 1.35;

  // Energy flow tip near CTA
  float tip = ribbon * smoothstep(0.55, 0.85, uv.x) * 0.5;
  col += C_CHAMPAGNE * tip;

  // Fresnel rim + champagne / copper edge (quieter than profile card)
  float fresnel = pow(clamp(edgeBand, 0.0, 1.0), 1.7);
  vec3 rimCol = mix(C_AMBER, C_CHAMPAGNE, smoothstep(0.2, 0.85, uv.x));
  rimCol = mix(rimCol, C_PALE, rim * 0.28);
  col += rimCol * (fresnel * 0.55 + rim * 1.15);

  // Thin top specular
  float topSpec = smoothstep(0.74, 0.96, uv.y) * fresnel;
  topSpec *= 0.55 + 0.45 * sin(uv.x * 16.0 + t * 0.55);
  col += C_PALE * topSpec * 0.45;

  float alpha =
    fresnel * 0.35 +
    rim * 0.72 +
    arcs * 0.42 +
    ribbon * 0.38 +
    parts * 0.4 +
    boltCore * 0.5 +
    ctaGlow * 0.62 +
    nebA * 0.08 * effectGate +
    star * 0.28 * effectGate +
    sweepBand * 0.42;
  alpha *= cardMask * intensity;
  alpha = clamp(alpha, 0.0, 0.78);
  alpha *= mix(1.0, 0.28, textCalm);

  vec3 premult = col * alpha * intensity;
  gl_FragColor = vec4(premult, alpha);
}
`

type BoostAmbientShaderProps = {
  intensity?: number
}

export function BoostAmbientShader({ intensity = 1 }: BoostAmbientShaderProps) {
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
    const uPointer = gl.getUniformLocation(program, 'uPointer')

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const started = performance.now()
    let frame = 0
    let running = true
    let shown = false
    let pointerX = 0.5
    let pointerY = 0.5
    let targetX = 0.5
    let targetY = 0.5

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

    const onPointer = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      targetX = (event.clientX - rect.left) / rect.width
      targetY = 1.0 - (event.clientY - rect.top) / rect.height
    }

    const onPointerLeave = () => {
      targetX = 0.5
      targetY = 0.5
    }

    const draw = (now: number) => {
      if (!running) return
      if (!resize()) {
        frame = window.requestAnimationFrame(draw)
        return
      }

      pointerX += (targetX - pointerX) * 0.08
      pointerY += (targetY - pointerY) * 0.08

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, reduce ? 0.9 : (now - started) / 1000)
      gl.uniform1f(uIntensity, intensity)
      gl.uniform2f(uPointer, pointerX, pointerY)
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
    parent.addEventListener('pointermove', onPointer, { passive: true })
    parent.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onHide)
    frame = window.requestAnimationFrame(draw)

    return () => {
      running = false
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
      parent.removeEventListener('pointermove', onPointer)
      parent.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onHide)
      root.classList.remove('is-ready')
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [intensity])

  return (
    <span className="pm-match-boost__shader" ref={rootRef} aria-hidden>
      <canvas ref={canvasRef} />
    </span>
  )
}
