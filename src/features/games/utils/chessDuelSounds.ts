export type ChessDuelSoundId =
  | 'select'
  | 'move'
  | 'capture'
  | 'check'
  | 'stalemate'
  | 'legWin'
  | 'legLose'
  | 'legDraw'
  | 'matchWin'
  | 'matchLose'
  | 'matchDraw'
  | 'start'

let audioCtx: AudioContext | null = null
let unlocked = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

export function unlockChessDuelAudio() {
  const ctx = getCtx()
  if (!ctx || unlocked) return
  unlocked = true
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  slideTo?: number,
  delay = 0,
) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => tone(freq, duration, type, gain, slideTo, delay))
    return
  }
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(24, slideTo), t0 + duration)
  amp.gain.setValueAtTime(gain, t0)
  amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

const lastPlayed: Partial<Record<ChessDuelSoundId, number>> = {}
const MIN_GAP_MS: Record<ChessDuelSoundId, number> = {
  select: 60,
  move: 55,
  capture: 90,
  check: 320,
  stalemate: 700,
  legWin: 700,
  legLose: 700,
  legDraw: 700,
  matchWin: 900,
  matchLose: 900,
  matchDraw: 900,
  start: 500,
}

export function playChessDuelSound(id: ChessDuelSoundId) {
  const now = performance.now()
  const gap = MIN_GAP_MS[id]
  if (lastPlayed[id] && now - lastPlayed[id]! < gap) return
  lastPlayed[id] = now

  switch (id) {
    case 'select':
      tone(380, 0.05, 'triangle', 0.042, 520)
      break
    case 'move':
      tone(220, 0.07, 'sine', 0.048, 160)
      tone(140, 0.05, 'triangle', 0.028, undefined, 0.02)
      break
    case 'capture':
      tone(180, 0.09, 'square', 0.05, 90)
      tone(320, 0.06, 'sawtooth', 0.035, 140, 0.04)
      tone(95, 0.1, 'sine', 0.032, 55, 0.06)
      break
    case 'check':
      tone(440, 0.08, 'triangle', 0.05)
      tone(554, 0.1, 'triangle', 0.045, undefined, 0.09)
      break
    case 'stalemate':
      tone(392, 0.12, 'sine', 0.05)
      tone(330, 0.14, 'sine', 0.04, undefined, 0.12)
      break
    case 'legWin':
      tone(523, 0.1, 'sine', 0.055)
      tone(659, 0.1, 'sine', 0.05, undefined, 0.1)
      tone(784, 0.14, 'triangle', 0.042, undefined, 0.2)
      break
    case 'legLose':
      tone(330, 0.14, 'sawtooth', 0.045, 220)
      tone(247, 0.18, 'sine', 0.035, 180, 0.12)
      break
    case 'legDraw':
      tone(392, 0.11, 'sine', 0.048)
      tone(392, 0.11, 'sine', 0.042, undefined, 0.13)
      break
    case 'matchWin':
      tone(523, 0.1, 'sine', 0.06)
      tone(659, 0.1, 'sine', 0.055, undefined, 0.1)
      tone(784, 0.12, 'sine', 0.05, undefined, 0.2)
      tone(988, 0.16, 'triangle', 0.045, undefined, 0.32)
      break
    case 'matchLose':
      tone(440, 0.14, 'sawtooth', 0.048, 220)
      tone(330, 0.2, 'sine', 0.038, 165, 0.12)
      tone(220, 0.22, 'sawtooth', 0.03, 110, 0.24)
      break
    case 'matchDraw':
      tone(440, 0.12, 'sine', 0.05)
      tone(440, 0.12, 'sine', 0.045, undefined, 0.14)
      break
    case 'start':
      tone(294, 0.08, 'sine', 0.04, 440)
      tone(440, 0.1, 'triangle', 0.038, undefined, 0.08)
      break
    default:
      break
  }
}
