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
uniform float uHome;

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
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float lobe(vec2 uv, vec2 center, vec2 scale) {
  vec2 q = (uv - center) * scale;
  return exp(-dot(q, q));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 ink = mix(vec3(0.03, 0.028, 0.07), vec3(0.02, 0.024, 0.055), uHome);
  vec3 blue = mix(vec3(0.0, 0.46, 0.95), vec3(0.04, 0.34, 0.72), uHome);
  vec3 rose = mix(vec3(0.95, 0.08, 0.38), vec3(0.78, 0.16, 0.4), uHome);

  float n1 = fbm(uv * 1.15 + vec2(uTime * 0.02, -uTime * 0.014));
  float n2 = fbm(uv * 1.45 + vec2(3.1, uTime * 0.016));
  float glide = sin(uTime * 0.07);
  vec2 w = uv + vec2((n1 - 0.5) * 0.06 + glide * 0.025, (n2 - 0.5) * 0.045);

  vec2 blueC = vec2(-0.04 + glide * 0.05, 0.8 + cos(uTime * 0.05) * 0.04);
  vec2 roseC = vec2(1.06 - glide * 0.05, 0.72 + sin(uTime * 0.046) * 0.04);
  float b = lobe(w, blueC, vec2(1.05, 1.15));
  float r = lobe(w, roseC, vec2(1.1, 1.18));
  float side = smoothstep(0.18, 0.82, w.x + glide * 0.05);

  vec3 col = ink;
  col += blue * b * (0.5 + 0.04 * sin(uTime * 0.08)) * (1.0 - side);
  col += rose * r * (0.48 + 0.04 * cos(uTime * 0.075)) * side;

  float well = smoothstep(0.55, 0.12, length((uv - vec2(0.5, 0.48)) * vec2(0.85, 1.05)));
  col = mix(col, ink, well * 0.62);

  vec2 cell = floor(gl_FragCoord.xy / 40.0);
  vec2 local = fract(gl_FragCoord.xy / 40.0) - 0.5;
  float h = hash21(cell);
  float spark = step(0.994, h) * exp(-dot(local, local) * 42.0);
  spark *= 0.55 + 0.45 * sin(uTime * 0.25 + h * 12.0);
  col += mix(blue, rose, step(0.5, h)) * spark * 0.12;

  col += (noise(uv * 14.0) - 0.5) * 0.01;
  vec3 graded = pow(max(col, 0.0), vec3(0.94));
  float luma = dot(graded, vec3(0.299, 0.587, 0.114));
  graded = mix(vec3(luma), graded, 0.92);
  col = mix(col, graded, uHome);
  gl_FragColor = vec4(col, 1.0);
}
`

export function ChatAtmosphereShader({
  className = 'pm-chat-atmosphere',
  tone = 'plain',
}: {
  className?: string
  tone?: 'plain' | 'home'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const showFallback = () => {
      canvas.style.display = 'none'
      parent.classList.add('is-fallback')
    }

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: 'low-power',
    })
    if (!gl) {
      showFallback()
      return
    }

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
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs)
      if (fs) gl.deleteShader(fs)
      showFallback()
      return
    }

    const program = gl.createProgram()
    if (!program) {
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      showFallback()
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      showFallback()
      return
    }

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    gl.useProgram(program)
    gl.clearColor(0.035, 0.03, 0.075, 1)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uHome = gl.getUniformLocation(program, 'uHome')
    const home = tone === 'home' ? 1 : 0
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const panel = parent.closest('.pm-tab-panel')
    const cores = navigator.hardwareConcurrency || 8
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    const dprCap = cores <= 4 || (memory != null && memory <= 4) ? 1 : 1.25

    let frame = 0
    let running = false
    const started = performance.now()

    const resize = () => {
      const width = parent.clientWidth
      const height = parent.clientHeight
      if (width < 2 || height < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
      const w = Math.round(width * dpr)
      const h = Math.round(height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const paint = (now: number) => {
      resize()
      if (canvas.width < 2 || canvas.height < 2) return
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, motion.matches ? 2.2 : (now - started) / 1000)
      gl.uniform1f(uHome, home)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const draw = (now: number) => {
      if (!running) return
      paint(now)
      frame = motion.matches ? 0 : window.requestAnimationFrame(draw)
    }

    const shouldRun = () =>
      !document.hidden && (!panel || panel.classList.contains('is-active'))

    const sync = () => {
      const on = shouldRun()
      if (on && !running) {
        running = true
        frame = window.requestAnimationFrame(draw)
      } else if (!on && running) {
        running = false
        if (frame) window.cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const onContextLost = (event: Event) => {
      event.preventDefault()
      running = false
      if (frame) window.cancelAnimationFrame(frame)
      showFallback()
    }

    const observer = new ResizeObserver(() => {
      if (motion.matches) paint(performance.now())
    })
    const classObserver = new MutationObserver(sync)
    observer.observe(parent)
    if (panel) classObserver.observe(panel, { attributes: true, attributeFilter: ['class'] })
    document.addEventListener('visibilitychange', sync)
    canvas.addEventListener('webglcontextlost', onContextLost)
    parent.classList.remove('is-fallback')
    canvas.style.display = ''
    sync()

    return () => {
      running = false
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
      classObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [tone])

  return (
    <span className={className} aria-hidden>
      <canvas ref={canvasRef} />
    </span>
  )
}
