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

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / max(uRes.y, 1.0);

  vec3 deep = vec3(0.024, 0.031, 0.094);
  vec3 blue = vec3(0.1, 0.28, 0.72);
  vec3 pink = vec3(0.55, 0.12, 0.4);
  vec3 foam = vec3(0.82, 0.78, 0.96);

  float side = smoothstep(0.12, 0.88, uv.x);
  float depth = smoothstep(0.0, 0.92, uv.y);
  vec3 tint = mix(blue, pink, side);
  vec3 col = mix(deep, tint, 0.42 + depth * 0.28);

  vec2 flow = vec2(p.x * 1.5 + uTime * 0.07, p.y * 0.7 - uTime * 0.05);
  float swell = fbm(flow);
  float swell2 = fbm(vec2(p.x * 2.4 - uTime * 0.05, p.y * 1.05 + swell));
  col = mix(col, tint, swell * 0.38 * (0.4 + depth));
  col += foam * swell2 * 0.08 * (0.35 + depth);

  vec2 cauUv = p * 2.8 + vec2(uTime * 0.09, -uTime * 0.06) + swell;
  float caustic = smoothstep(0.42, 0.74, fbm(cauUv));
  col += mix(blue, pink, side) * caustic * (0.3 + depth) * 0.16;

  col += vec3(0.2, 0.5, 1.0) * glow(uv, vec2(0.08, 0.88), 0.55) * 0.34;
  col += vec3(1.0, 0.24, 0.72) * glow(uv, vec2(0.96, 0.72), 0.5) * 0.3;
  col += vec3(0.45, 0.22, 0.85) * glow(uv, vec2(0.5, 0.08), 0.48) * 0.12;

  vec2 fineCell = floor(gl_FragCoord.xy / 7.0);
  vec2 fineLocal = fract(gl_FragCoord.xy / 7.0) - 0.5;
  float fineH = hash21(fineCell);
  float fineTw = 0.35 + 0.65 * sin(uTime * 0.8 + fineH * 48.0);
  float fine = step(0.978, fineH) * exp(-pow(length(fineLocal) / 0.12, 2.0)) * fineTw;
  col += foam * fine * 0.16;

  float grit = hash21(gl_FragCoord.xy + floor(uTime * 8.0));
  col *= 0.98 + grit * 0.02;
  float vignette = smoothstep(1.25, 0.32, length((uv - 0.5) * vec2(1.05, 1.18)));
  col *= mix(0.72, 1.0, vignette);
  col = pow(max(col, vec3(0.0)), vec3(0.94));

  gl_FragColor = vec4(col, 1.0);
}
`

export function HomeWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
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
      const ready = canvas.width >= 2 && canvas.height >= 2
      if (ready) {
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.uniform1f(uTime, reduce ? 12 : (now - started) / 1000)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }
      frame = reduce && ready ? 0 : window.requestAnimationFrame(draw)
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
