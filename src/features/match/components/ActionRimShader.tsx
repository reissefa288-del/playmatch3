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
uniform float uTone;
uniform float uLarge;

vec3 toneA(float t) {
  if (t < 0.5) return vec3(0.56, 0.83, 1.0);      // undo blue hi
  if (t < 1.5) return vec3(1.0, 0.54, 0.59);       // pass red hi
  if (t < 2.5) return vec3(0.23, 0.95, 0.72);       // like green hi
  if (t < 3.5) return vec3(0.72, 0.77, 1.0);        // invite violet hi
  return vec3(0.56, 0.83, 1.0);                     // super blue hi
}

vec3 toneB(float t) {
  if (t < 0.5) return vec3(0.24, 0.55, 1.0);
  if (t < 1.5) return vec3(1.0, 0.30, 0.39);
  if (t < 2.5) return vec3(0.0, 0.94, 0.64);
  if (t < 3.5) return vec3(0.49, 0.53, 0.95);
  return vec3(0.24, 0.55, 1.0);
}

vec3 toneC(float t) {
  if (t < 0.5) return vec3(0.19, 0.34, 0.92);
  if (t < 1.5) return vec3(0.88, 0.14, 0.25);
  if (t < 2.5) return vec3(0.12, 0.72, 0.55);
  if (t < 3.5) return vec3(0.35, 0.34, 0.88);
  return vec3(0.22, 0.48, 0.95);
}

void main() {
  vec2 res = max(uRes, vec2(1.0));
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);
  float r = length(p);
  float ang = atan(p.y, p.x);

  // Thin neon hairline near the button edge.
  float ringR = mix(0.445, 0.438, step(0.5, uLarge));
  float thick = mix(0.010, 0.012, step(0.5, uLarge));
  float d = abs(r - ringR);

  // Soft AA band for the core neon stroke.
  float core = 1.0 - smoothstep(thick * 0.25, thick, d);
  float bloom = exp(-pow(d / (thick * 1.9), 2.0));
  float outer = exp(-pow(max(r - ringR, 0.0) / (thick * 2.6), 2.0));

  // Keep center fully clear.
  float hole = smoothstep(ringR - thick * 1.5, ringR - thick * 0.45, r);
  float mask = max(core, bloom * 0.55) * hole;

  float flow = ang / 6.2831853 + 0.5;
  float sweep = fract(flow - uTime * 0.18);
  float sheen = exp(-pow((sweep - 0.18) * 9.0, 2.0));
  float dual = exp(-pow((fract(flow + 0.5 - uTime * 0.11) - 0.2) * 8.0, 2.0));
  float breath = 0.82 + 0.18 * sin(uTime * 1.35 + ang * 2.0);

  vec3 c0 = toneA(uTone);
  vec3 c1 = toneB(uTone);
  vec3 c2 = toneC(uTone);
  float gradT = fract(flow * 1.35 + uTime * 0.08);
  vec3 rim = mix(c0, c1, smoothstep(0.0, 0.55, gradT));
  rim = mix(rim, c2, smoothstep(0.4, 1.0, gradT));
  rim += vec3(1.0) * (sheen * 0.55 + dual * 0.28);
  rim *= breath;

  float alpha = clamp(mask * (0.55 + core * 0.55) + outer * 0.22, 0.0, 0.95);
  // Premultiplied
  gl_FragColor = vec4(rim * alpha, alpha);
}
`

export type ActionRimTone = 'muted' | 'pass' | 'match' | 'invite' | 'super'

const TONE_VALUE: Record<ActionRimTone, number> = {
  muted: 0,
  pass: 1,
  match: 2,
  invite: 3,
  super: 4,
}

export function ActionRimShader({
  tone,
  large = false,
}: {
  tone: ActionRimTone
  large?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLSpanElement>(null)
  const toneRef = useRef(tone)
  const largeRef = useRef(large)
  toneRef.current = tone
  largeRef.current = large

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    })
    if (!gl) return
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

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
    const pos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    gl.useProgram(program)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uTone = gl.getUniformLocation(program, 'uTone')
    const uLarge = gl.getUniformLocation(program, 'uLarge')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let running = true
    let shown = false
    const started = performance.now()

    const resize = () => {
      const width = parent.clientWidth
      const height = parent.clientHeight
      if (width < 2 || height < 2) return false
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
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
      gl.uniform1f(uTime, reduce ? 0.35 : (now - started) / 1000)
      gl.uniform1f(uTone, TONE_VALUE[toneRef.current] ?? 0)
      gl.uniform1f(uLarge, largeRef.current ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (!shown) {
        shown = true
        rootRef.current?.classList.add('is-ready')
      }
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
      rootRef.current?.classList.remove('is-ready')
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <span className="pm-match-action__rim-shader" ref={rootRef} aria-hidden>
      <canvas ref={canvasRef} />
    </span>
  )
}
