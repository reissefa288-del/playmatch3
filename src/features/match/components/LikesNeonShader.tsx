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
uniform float uDpr;

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float inset = 18.0 * uDpr;
  float rad = 22.0 * uDpr;
  vec2 q = gl_FragCoord.xy - uRes * 0.5;
  vec2 box = max(uRes * 0.5 - vec2(inset), vec2(rad + 2.0));
  float d = sdRoundBox(q, box, rad);

  float coreW = 0.55 * uDpr;
  float core = smoothstep(coreW + 0.55, 0.0, abs(d));
  float tube = exp(-abs(d) / (7.5 * uDpr));
  float halo = exp(-max(d, 0.0) / (18.0 * uDpr));

  float t = clamp((gl_FragCoord.x - inset) / max(uRes.x - inset * 2.0, 1.0), 0.0, 1.0);
  vec3 cyan = vec3(0.28, 0.62, 1.0);
  vec3 rose = vec3(1.0, 0.32, 0.62);
  vec3 col = mix(cyan, rose, smoothstep(0.12, 0.88, t));

  float ang = atan(q.y, q.x);
  float phase = fract(ang / 6.28318 + 0.5 - uTime * 0.04);
  float sheen = smoothstep(0.14, 0.0, abs(phase - 0.5));
  vec3 rgb = col + col * sheen * 0.12;
  float a = clamp(core * 0.42 + tube * 0.1 + halo * 0.05, 0.0, 0.72);
  gl_FragColor = vec4(rgb * a, a);
}
`

export function LikesNeonShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
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
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uDpr = gl.getUniformLocation(program, 'uDpr')
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
      gl.uniform1f(uDpr, dpr)
    }

    const draw = (now: number) => {
      if (!running) return
      resize()
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, reduce ? 1.2 : (now - started) / 1000)
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
    <span className="pm-likes-neon" aria-hidden>
      <canvas ref={canvasRef} />
    </span>
  )
}
