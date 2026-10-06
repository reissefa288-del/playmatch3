import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uArrow;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float glow(vec2 uv, vec2 center, float radius) {
  float d = length((uv - center) * vec2(1.05, 1.2));
  return exp(-pow(d / radius, 2.0));
}

float navArrow(vec2 uv) {
  vec2 q = (uv - vec2(0.5, 0.73)) * vec2(3.6, 4.6);
  float halfW = (0.46 - q.y) * 0.78;
  float tri = smoothstep(0.02, 0.0, abs(q.x) - halfW);
  tri *= smoothstep(-0.08, -0.02, q.y) * smoothstep(0.5, 0.42, q.y);
  float notchW = (0.16 - q.y) * 0.95;
  float notch = smoothstep(0.015, 0.0, abs(q.x) - notchW) * smoothstep(0.2, 0.08, q.y);
  return clamp(tri - notch, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / max(uRes.y, 1.0);

  vec3 deep = vec3(0.024, 0.03, 0.09);
  vec3 mid = vec3(0.1, 0.12, 0.34);
  vec3 shallow = vec3(0.22, 0.2, 0.55);
  vec3 foam = vec3(0.78, 0.74, 0.98);

  float depth = smoothstep(0.0, 0.92, uv.y);
  vec3 col = mix(deep, mid, depth);
  col = mix(col, shallow, smoothstep(0.45, 1.0, uv.y) * 0.65);

  vec2 flow = vec2(p.x * 1.5 + uTime * 0.07, p.y * 0.7 - uTime * 0.05);
  float swell = fbm(flow);
  float swell2 = fbm(vec2(p.x * 2.4 - uTime * 0.05, p.y * 1.05 + swell));
  col = mix(col, shallow, swell * 0.46 * (0.35 + depth));
  col += foam * swell2 * 0.14 * (0.4 + depth);

  vec2 cauUv = p * 2.8 + vec2(uTime * 0.09, -uTime * 0.06) + swell;
  float caustic = smoothstep(0.38, 0.72, fbm(cauUv));
  col += foam * caustic * (0.35 + depth) * 0.22;

  col += vec3(0.2, 0.45, 1.0) * glow(uv, vec2(0.16, 0.84), 0.46) * 0.14;
  col += vec3(0.85, 0.28, 0.72) * glow(uv, vec2(0.86, 0.78), 0.4) * 0.1;

  if (uArrow > 0.5) {
    float arrow = navArrow(uv);
    col += foam * arrow * 0.95;
    col += shallow * glow(uv, vec2(0.5, 0.82), 0.16) * 0.12;
  }

  vec2 fineCell = floor(gl_FragCoord.xy / 7.0);
  vec2 fineLocal = fract(gl_FragCoord.xy / 7.0) - 0.5;
  float fineH = hash21(fineCell);
  float fineTw = 0.35 + 0.65 * sin(uTime * 0.8 + fineH * 48.0);
  float fine = step(0.975, fineH) * exp(-pow(length(fineLocal) / 0.12, 2.0)) * fineTw;

  vec2 starCell = floor(gl_FragCoord.xy / 18.0);
  vec2 starLocal = fract(gl_FragCoord.xy / 18.0) - 0.5;
  float starH = hash21(starCell + 9.0);
  float starTw = 0.25 + 0.75 * sin(uTime * 0.45 + starH * 30.0);
  float star = step(0.988, starH) * exp(-pow(length(starLocal) / 0.16, 2.0)) * starTw;
  star *= smoothstep(0.2, 0.75, uv.y);

  col += foam * (fine * 0.22 + star * 0.28);

  float grit = hash21(gl_FragCoord.xy + floor(uTime * 8.0));
  col *= 0.975 + grit * 0.025;
  float vignette = smoothstep(1.25, 0.32, length((uv - 0.5) * vec2(1.05, 1.18)));
  col *= mix(0.7, 1.0, vignette);
  col = pow(max(col, vec3(0.0)), vec3(0.92));

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
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

/** Check-in yüzeyi: okyanus, navigasyon oku ve hafif yıldız parıltısı. */
export function CheckInShader({ showArrow = false }: { showArrow?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const arrowRef = useRef(showArrow)
  arrowRef.current = showArrow

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
    })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    gl.useProgram(program)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uArrow = gl.getUniformLocation(program, 'uArrow')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let running = true
    const started = performance.now()

    const resize = () => {
      const width = parent.clientWidth
      const height = parent.clientHeight
      if (width < 2 || height < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(width * dpr)
      const h = Math.round(height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const draw = (now: number) => {
      if (!running) return
      resize()
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, reduce ? 12 : (now - started) / 1000)
      gl.uniform1f(uArrow, arrowRef.current ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      frame = reduce ? 0 : window.requestAnimationFrame(draw)
    }

    const onHide = () => {
      if (document.hidden) {
        running = false
        if (frame) window.cancelAnimationFrame(frame)
      } else if (!running) {
        running = true
        frame = window.requestAnimationFrame(draw)
      }
    }

    const observer = new ResizeObserver(resize)
    observer.observe(parent)
    document.addEventListener('visibilitychange', onHide)
    frame = window.requestAnimationFrame(draw)

    return () => {
      running = false
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onHide)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <div className="pm-checkin-shader" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  )
}
