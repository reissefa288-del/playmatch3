type XoxSoundId = 'moveX' | 'moveO' | 'win' | 'lose' | 'draw' | 'start'

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

export function unlockXoxAudio() {
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
  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
  }
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

const lastPlayed: Partial<Record<XoxSoundId, number>> = {}
const MIN_GAP_MS: Record<XoxSoundId, number> = {
  moveX: 70,
  moveO: 70,
  win: 900,
  lose: 900,
  draw: 900,
  start: 600,
}

export function playXoxSound(id: XoxSoundId) {
  const now = performance.now()
  const gap = MIN_GAP_MS[id]
  if (lastPlayed[id] && now - lastPlayed[id]! < gap) return
  lastPlayed[id] = now

  switch (id) {
    case 'moveX':
      tone(620, 0.07, 'triangle', 0.055, 880)
      tone(930, 0.05, 'sine', 0.025, undefined, 0.03)
      break
    case 'moveO':
      tone(420, 0.08, 'sine', 0.055, 560)
      tone(280, 0.06, 'triangle', 0.03, undefined, 0.04)
      break
    case 'win':
      tone(523, 0.1, 'sine', 0.06)
      tone(659, 0.1, 'sine', 0.055, undefined, 0.1)
      tone(784, 0.14, 'sine', 0.05, undefined, 0.2)
      tone(988, 0.18, 'triangle', 0.04, undefined, 0.32)
      break
    case 'lose':
      tone(440, 0.14, 'sawtooth', 0.045, 220)
      tone(330, 0.2, 'sine', 0.035, 180, 0.12)
      break
    case 'draw':
      tone(392, 0.12, 'sine', 0.05)
      tone(392, 0.12, 'sine', 0.045, undefined, 0.14)
      break
    case 'start':
      tone(330, 0.08, 'sine', 0.04, 660)
      tone(660, 0.1, 'triangle', 0.035, undefined, 0.08)
      break
    default:
      break
  }
}
