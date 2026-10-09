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
    p = p * 2.05 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv - 0.5;

  vec3 deep = vec3(0.42, 0.04, 0.22);
  vec3 mid = vec3(0.95, 0.18, 0.48);
  vec3 blush = vec3(1.0, 0.62, 0.82);
  vec3 foam = vec3(1.0, 0.9, 0.96);

  vec2 flow = vec2(p.x * 3.4 + uTime * 0.22, p.y * 3.1 - uTime * 0.16);
  float silk = fbm(flow);
  float silk2 = fbm(vec2(p.y * 4.0 + uTime * 0.12, p.x * 2.6 - silk));
  vec3 col = mix(deep, mid, silk);
  col = mix(col, blush, silk2 * 0.55);
  col += foam * smoothstep(0.62, 0.92, silk) * 0.22;

  float lobe = min(length(p - vec2(-0.1, 0.06)), length(p - vec2(0.1, 0.06)));
  float body = length((p - vec2(0.0, -0.04)) * vec2(1.0, 0.85));
  col += foam * exp(-lobe * 10.0) * 0.28;
  col += blush * exp(-body * 7.0) * 0.2;

  vec2 cell = floor(uv * 7.0);
  float spark = step(0.9, hash21(cell));
  float tw = 0.45 + 0.55 * sin(uTime * 2.6 + hash21(cell) * 18.0);
  col += foam * spark * tw * 0.45;

  gl_FragColor = vec4(col, 1.0);
}
`

export function GameLikeShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false })
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    gl.useProgram(program)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
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
      gl.uniform1f(uTime, reduce ? 4 : (now - started) / 1000)
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
    <span className="pm-game-like-shader" aria-hidden>
      <canvas ref={canvasRef} />
    </span>
  )
}
