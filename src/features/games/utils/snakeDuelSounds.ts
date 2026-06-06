type SoundId = 'turn' | 'eat' | 'diamond' | 'combo' | 'die' | 'spawn' | 'round' | 'win'

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

export function unlockSnakeDuelAudio() {
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
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration)
  }
  amp.gain.setValueAtTime(gain, t0)
  amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

const lastPlayed: Partial<Record<SoundId, number>> = {}
const MIN_GAP_MS: Record<SoundId, number> = {
  turn: 45,
  eat: 70,
  diamond: 120,
  combo: 140,
  die: 500,
  spawn: 200,
  round: 600,
  win: 900,
}

export function playSnakeDuelSound(id: SoundId) {
  const now = performance.now()
  const gap = MIN_GAP_MS[id]
  if (lastPlayed[id] && now - lastPlayed[id]! < gap) return
  lastPlayed[id] = now

  switch (id) {
    case 'turn':
      tone(420, 0.04, 'sine', 0.04, 520)
      break
    case 'eat':
      tone(640, 0.07, 'triangle', 0.07, 880)
      break
    case 'diamond':
      tone(880, 0.1, 'sine', 0.06, 1320)
      tone(1100, 0.12, 'triangle', 0.04, 0.06)
      break
    case 'combo':
      tone(720, 0.08, 'square', 0.045, 1040)
      break
    case 'die':
      tone(220, 0.14, 'sawtooth', 0.07, 80)
      tone(140, 0.2, 'square', 0.05, 60, 0.08)
      break
    case 'spawn':
      tone(520, 0.06, 'sine', 0.04, 780)
      break
    case 'round':
      tone(440, 0.1, 'sine', 0.05)
      tone(554, 0.1, 'sine', 0.045, 0.1)
      break
    case 'win':
      tone(523, 0.1, 'sine', 0.06)
      tone(659, 0.1, 'sine', 0.05, 0.11)
      tone(784, 0.16, 'sine', 0.05, 0.22)
      break
    default:
      break
  }
}
